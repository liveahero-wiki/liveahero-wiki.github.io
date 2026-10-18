// lah-page-edit: moderator views for a proposed edit of a wiki page body (diff against the base + advisory guard).
// Built (with dom.ts / styles.css and the shared guard) into the self-contained assets/cms/lah-page-edit.js
// by vite.cms-tl-plugins.config.ts.

import type { EditorHandle, FieldError, PluginContext, SubmissionPlugin } from '../cms-plugin/plugin-api.ts'
import type { Row } from './diff.ts'
import { append, button, clear, errorBox, errorsAt, field, h, mountRoot, relPath, showErrors } from './dom.ts'
import { contribGuard } from './guard.ts'
import { analyzePage, statsLabel, type PageAnalysis } from './page-model.ts'
import { fetchBlobText, fetchCurrentSha, githubFileUrl, loadAllowedIncludes, wikiOrigin } from './net.ts'
import { livePagePath, readPageEdit, type PageEditPayload } from './payload.ts'
import { AFTER_MAX_CHARS, SUMMARY_MAX, SUMMARY_MIN, isBlobSha, validatePageEdit } from './validate.ts'

const TYPE = 'lah-page-edit'
const SITE = 'https://liveahero-wiki.github.io'
/** Rendering cap: a rewrite of a big page would otherwise create thousands of DOM rows. */
const ROW_CAP = 2000

const sha7 = (sha: string): string => sha.slice(0, 7)
const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** Base file text + includes list -> analysis. The blob is cached per sha, so repeated edits only re-diff. */
async function analyze(baseSha: string, after: string): Promise<PageAnalysis> {
  const [text, includes] = await Promise.all([fetchBlobText(baseSha), loadAllowedIncludes()])
  return analyzePage(text, after, includes, contribGuard)
}

// ---- rendering pieces

function statsEl(a: PageAnalysis): HTMLElement {
  return h('span', { class: 'cms-lah-tl-badge', title: `${a.diff.added} added, ${a.diff.removed} removed` }, h('span', { class: 'cms-lah-tl-add' }, `+${a.diff.added}`), ' ', h('span', { class: 'cms-lah-tl-del' }, `−${a.diff.removed}`), ' lines')
}

/** The guard result: violations prominently, or an ok / skipped notice. */
function guardEl(a: PageAnalysis): HTMLElement {
  if (a.violations === null) return h('div', { class: 'cms-lah-tl-notice cms-lah-tl-notice-soft' }, h('strong', null, 'Guard check skipped. '), a.guardNote)
  if (a.violations.length === 0) {
    return h('div', { class: 'cms-lah-tl-notice cms-lah-tl-notice-ok' }, h('strong', null, 'Guard: no problems found. '), h('span', { class: 'cms-lah-tl-muted' }, '(Advisory: CI on the pull request is the authoritative gate.)'))
  }
  return h(
    'div',
    { class: 'cms-lah-tl-notice cms-lah-tl-notice-warn', role: 'alert' },
    h('strong', null, `Guard: ${a.violations.length} problem${a.violations.length === 1 ? '' : 's'} found. `),
    h('span', { class: 'cms-lah-tl-muted' }, '(Advisory: CI on the pull request is the authoritative gate.)'),
    h(
      'ul',
      null,
      ...a.violations.map((v) => h('li', null, v.message, v.token && !v.message.includes(v.token) ? [' ', h('code', null, v.token.length > 200 ? `${v.token.slice(0, 200)}…` : v.token)] : null)),
    ),
  )
}

function diffRow(r: Exclude<Row, { kind: 'gap' }>): HTMLElement {
  const sign = r.kind === 'ins' ? '+' : r.kind === 'del' ? '−' : ' '
  let text: (Node | string)[] = [r.text]
  if (r.mark) {
    const { pre, post } = r.mark
    const end = r.text.length - post
    text = [r.text.slice(0, pre), h('mark', null, r.text.slice(pre, end)), r.text.slice(end)]
  }
  return h(
    'div',
    { class: `cms-lah-tl-drow cms-lah-tl-drow-${r.kind}` },
    h('span', { class: 'cms-lah-tl-dno' }, r.a || ''),
    h('span', { class: 'cms-lah-tl-dno' }, r.b || ''),
    h('span', { class: 'cms-lah-tl-dsign', 'aria-hidden': 'true' }, sign),
    h('span', { class: 'cms-lah-tl-dtext' }, ...text),
  )
}

/** Unified-style diff: changed lines with 3 lines of context; longer unchanged runs collapse to a gap row. */
function diffEl(a: PageAnalysis): HTMLElement {
  const box = h('div', { class: 'cms-lah-tl-stack' })
  if (a.rows.length === 0) {
    box.append(h('p', { class: 'cms-lah-tl-muted' }, 'No changes: the proposed body is identical to the base version.'))
    return box
  }
  if (a.diff.approximate) {
    box.append(h('p', { class: 'cms-lah-tl-notice cms-lah-tl-notice-soft' }, 'This is a very large change, so the changed region is shown as a full replacement instead of a line-by-line diff.'))
  }
  const diff = h('div', { class: 'cms-lah-tl-diff', role: 'group', 'aria-label': 'Diff of the proposed body against the base version' })
  const paint = (from: number, to: number) => {
    for (const r of a.rows.slice(from, to)) {
      if (r.kind === 'gap') diff.append(h('div', { class: 'cms-lah-tl-dgap' }, `⋯ ${r.hidden} unchanged lines (old ${r.a}–${r.a + r.hidden - 1})`))
      else diff.append(diffRow(r))
    }
  }
  paint(0, ROW_CAP)
  box.append(diff)
  if (a.rows.length > ROW_CAP) {
    const more = button(`Show the remaining ${a.rows.length - ROW_CAP} rows`, () => {
      paint(ROW_CAP, a.rows.length)
      more.remove()
    })
    box.append(more)
  }
  return box
}

/** Writes "loading" / the error (with Retry) / the result into `host`; returns a cancel function. */
function loadInto(host: HTMLElement, run: () => Promise<PageAnalysis>, render: (a: PageAnalysis) => void, label = 'Loading the base version from GitHub...'): () => void {
  let live = true
  const go = () => {
    clear(host)
    host.append(h('p', { class: 'cms-lah-tl-muted', role: 'status' }, label))
    run().then(
      (a) => {
        if (!live) return
        clear(host)
        render(a)
      },
      (e) => {
        if (!live) return
        clear(host)
        host.append(
          h('div', { class: 'cms-lah-tl-notice cms-lah-tl-notice-warn', role: 'alert' }, h('strong', null, 'Cannot show the diff. '), errMsg(e), ' ', button('Retry', go)),
        )
      },
    )
  }
  go()
  return () => {
    live = false
  }
}

function pageLinks(path: string): HTMLElement {
  const live = livePagePath(path)
  return h(
    'span',
    { class: 'cms-lah-tl-row cms-lah-tl-small' },
    live ? h('a', { href: `${wikiOrigin() || SITE}${live}`, target: '_blank', rel: 'noopener' }, 'Live page') : null,
    h('a', { href: githubFileUrl(path), target: '_blank', rel: 'noopener' }, 'File on GitHub'),
  )
}

// ---- views

function summary(el: HTMLElement, raw: unknown): () => void {
  const p = readPageEdit(raw)
  const { root, unmount } = mountRoot(el)
  const stats = h('span', { class: 'cms-lah-tl-muted cms-lah-tl-small' })
  append(root, h('div', { class: 'cms-lah-tl-row' }, h('span', { class: 'cms-lah-tl-path' }, p.path || '(no path)'), stats), p.summary ? h('div', { class: 'cms-lah-tl-quote' }, p.summary) : null)
  // Lazy: path and summary are shown at once, the line counts follow when the base has loaded.
  let live = true
  if (isBlobSha(p.baseSha)) {
    fetchBlobText(p.baseSha.toLowerCase()).then(
      (text) => {
        if (!live) return
        const a = analyzePage(text, p.after, null, contribGuard)
        stats.replaceChildren(statsEl(a))
      },
      () => live && (stats.textContent = '(line counts unavailable)'),
    )
  }
  return () => {
    live = false
    unmount()
  }
}

function detail(el: HTMLElement, raw: unknown): () => void {
  const p = readPageEdit(raw)
  const { root, unmount } = mountRoot(el, 'cms-lah-tl-stack')
  const result = h('div', { class: 'cms-lah-tl-stack' })
  append(
    root,
    h('div', { class: 'cms-lah-tl-row' }, h('span', { class: 'cms-lah-tl-path' }, p.path || '(no path)'), h('span', { class: 'cms-lah-tl-badge', title: p.baseSha }, `base ${sha7(p.baseSha) || '?'}`), pageLinks(p.path)),
    p.summary ? h('div', null, h('strong', null, 'Summary: '), p.summary) : null,
    result,
  )
  const cancel = isBlobSha(p.baseSha)
    ? loadInto(
        result,
        () => analyze(p.baseSha.toLowerCase(), p.after),
        (a) => result.append(h('div', { class: 'cms-lah-tl-row' }, h('strong', null, 'Changes'), statsEl(a)), guardEl(a), diffEl(a)),
      )
    : (result.append(h('div', { class: 'cms-lah-tl-notice cms-lah-tl-notice-warn' }, 'This submission has no valid base version (baseSha), so no diff can be shown.')), () => {})
  return () => {
    cancel()
    unmount()
  }
}

function editor(el: HTMLElement, init: { value: unknown; onChange(p: unknown): void; errors: FieldError[] }): EditorHandle {
  const cur: PageEditPayload = readPageEdit(init.value)
  let shown: FieldError[] = init.errors
  const emit = (): void => init.onChange({ ...cur })

  const { root, unmount } = mountRoot(el, 'cms-lah-tl-stack')

  const pathInput = h('input', { class: 'cms-lah-tl-input cms-lah-tl-mono-input', type: 'text', value: cur.path, readOnly: true })
  const pathField = field('Page', pathInput, undefined)
  pathField.wrap.append(pageLinks(cur.path))

  const shaInput = h('input', { class: 'cms-lah-tl-input cms-lah-tl-mono-input', type: 'text', value: cur.baseSha, maxlength: 64, spellcheck: false, autocomplete: 'off' })
  const rebaseStatus = h('p', { class: 'cms-lah-tl-small', role: 'status', 'aria-live': 'polite' })
  const rebaseBtn = button('Rebase on current master', () => void rebase())
  const shaField = field(
    'Base version (git blob sha)',
    shaInput,
    `If the submission shows a "conflict", the page changed on master after the contributor started. "Rebase on current master" sets this to master's current version of the file; first edit the text below so it contains the newer changes (check the diff), otherwise approving would overwrite them.`,
  )
  shaField.wrap.append(h('div', { class: 'cms-lah-tl-row' }, rebaseBtn), rebaseStatus)

  const summaryInput = h('input', { class: 'cms-lah-tl-input', type: 'text', value: cur.summary, maxlength: SUMMARY_MAX * 2 })
  const sumCount = h('div', { class: 'cms-lah-tl-count' })
  const sumField = field('Summary', summaryInput, `${SUMMARY_MIN}-${SUMMARY_MAX} characters, one line. Becomes the commit message and PR title.`)
  sumField.wrap.insertBefore(sumCount, sumField.errs)

  const area = h('textarea', { class: 'cms-lah-tl-textarea cms-lah-tl-mono-input cms-lah-tl-after', rows: 24, value: cur.after, spellcheck: false })
  const afterCount = h('div', { class: 'cms-lah-tl-count' })
  const afterField = field('Page body (front matter is not shown and cannot be edited)', area, 'Markdown with Liquid, exactly as in the repository file.')
  afterField.wrap.insertBefore(afterCount, afterField.errs)

  const diffHost = h('div', { class: 'cms-lah-tl-stack' })
  const diffDetails = h('details', null, h('summary', null, 'Diff against the base version'), h('div', { class: 'cms-lah-tl-stack cms-lah-tl-gap-top' }, diffHost))

  const generalErrs = errorBox()

  const counts = () => {
    const s = summaryInput.value.trim().length
    sumCount.textContent = `${s} / ${SUMMARY_MAX}`
    sumCount.className = s > SUMMARY_MAX || s < SUMMARY_MIN ? 'cms-lah-tl-count cms-lah-tl-count-over' : 'cms-lah-tl-count'
    const n = area.value.length
    afterCount.textContent = `${n.toLocaleString('en-US')} / ${AFTER_MAX_CHARS.toLocaleString('en-US')} characters`
    afterCount.className = n > AFTER_MAX_CHARS ? 'cms-lah-tl-count cms-lah-tl-count-over' : 'cms-lah-tl-count'
  }

  function applyErrors(): void {
    showErrors(generalErrs, shown.filter((e) => relPath(e.path) === ''))
    showErrors(pathField.errs, errorsAt(shown, 'path'), [pathInput])
    showErrors(shaField.errs, errorsAt(shown, 'baseSha'), [shaInput])
    showErrors(sumField.errs, errorsAt(shown, 'summary'), [summaryInput])
    showErrors(afterField.errs, errorsAt(shown, 'after'), [area])
  }
  const dropError = (rel: string, box: HTMLElement, control: HTMLElement) => {
    shown = shown.filter((e) => relPath(e.path) !== rel)
    showErrors(box, [], [control])
  }

  // Diff preview: only while the <details> is open; debounced, newest request wins.
  let timer: ReturnType<typeof setTimeout> | undefined
  let cancelDiff: () => void = () => {}
  function refreshDiff(): void {
    cancelDiff()
    if (!diffDetails.open) return
    if (!isBlobSha(cur.baseSha)) {
      clear(diffHost)
      diffHost.append(h('p', { class: 'cms-lah-tl-muted' }, 'Enter a valid base version (40 hex characters) to see the diff.'))
      cancelDiff = () => {}
      return
    }
    cancelDiff = loadInto(diffHost, () => analyze(cur.baseSha.toLowerCase(), cur.after), (a) => diffHost.append(h('div', { class: 'cms-lah-tl-row' }, statsEl(a)), guardEl(a), diffEl(a)))
  }
  const scheduleDiff = () => {
    clearTimeout(timer)
    if (diffDetails.open) timer = setTimeout(refreshDiff, 500)
  }
  diffDetails.addEventListener('toggle', refreshDiff)

  area.addEventListener('input', () => {
    cur.after = area.value
    counts()
    dropError('after', afterField.errs, area)
    emit()
    scheduleDiff()
  })
  summaryInput.addEventListener('input', () => {
    cur.summary = summaryInput.value
    counts()
    dropError('summary', sumField.errs, summaryInput)
    emit()
  })
  shaInput.addEventListener('input', () => {
    cur.baseSha = shaInput.value.trim()
    rebaseStatus.textContent = ''
    dropError('baseSha', shaField.errs, shaInput)
    emit()
    scheduleDiff()
  })

  let alive = true
  async function rebase(): Promise<void> {
    rebaseBtn.disabled = true
    rebaseStatus.className = 'cms-lah-tl-small cms-lah-tl-muted'
    rebaseStatus.textContent = 'Asking GitHub for the current version...'
    try {
      const sha = await fetchCurrentSha(cur.path)
      if (!alive) return
      if (sha === cur.baseSha.toLowerCase()) {
        rebaseStatus.textContent = `Already on the current master version (${sha7(sha)}).`
      } else {
        cur.baseSha = sha
        shaInput.value = sha
        dropError('baseSha', shaField.errs, shaInput)
        emit()
        refreshDiff()
        rebaseStatus.textContent = `Base set to the current master version (${sha7(sha)}). Check the diff and make sure the text contains the newer changes before approving.`
      }
    } catch (e) {
      if (!alive) return
      rebaseStatus.className = 'cms-lah-tl-small cms-lah-tl-errors'
      rebaseStatus.textContent = errMsg(e)
    } finally {
      rebaseBtn.disabled = false
    }
  }

  append(root, generalErrs, pathField.wrap, shaField.wrap, sumField.wrap, afterField.wrap, diffDetails)
  counts()
  applyErrors()

  return {
    destroy() {
      alive = false
      clearTimeout(timer)
      cancelDiff()
      unmount()
    },
    validate() {
      const errors = validatePageEdit({ ...cur })
      shown = errors
      applyErrors()
      return errors
    },
    setErrors(errors) {
      shown = errors
      applyErrors()
    },
  }
}

const plugin: SubmissionPlugin<PageEditPayload> = {
  apiVersion: 1,
  type: TYPE,
  defaultPayload: () => ({ path: '', baseSha: '', after: '', summary: '' }),
  mountSummary: (el: HTMLElement, payload: PageEditPayload, _ctx: PluginContext) => summary(el, payload),
  mountDetail: (el: HTMLElement, payload: PageEditPayload, _ctx: PluginContext) => detail(el, payload),
  mountEditor: (el, init, _ctx) => editor(el, init),
}

export default plugin
