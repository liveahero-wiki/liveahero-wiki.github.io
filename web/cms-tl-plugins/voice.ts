// lah-voice-tl: moderator views for a batch of voice-line translation suggestions.
// Built (with dom.ts / styles.css) into the self-contained assets/cms/lah-voice-tl.js by vite.cms-tl-plugins.config.ts.

import type { EditorHandle, FieldError, PluginContext, SubmissionPlugin } from '../cms-plugin/plugin-api.ts'
import { append, button, clear, errorBox, errorsAt, field, h, mountRoot, relPath, showErrors, textBlock } from './dom.ts'
import { clip, plural, readVoice, voicePart, type VoiceLine, type VoicePayload } from './payload.ts'
import { loadVoiceRoster, voiceJp, type VoiceRoster } from './net.ts'
import { NOTE_MAX, TEXT_MAX } from './text-rules.ts'
import { MAX_LINES, validateVoice } from './validate.ts'

const TYPE = 'lah-voice-tl'

/** The same roster promise for every mount (fetched once from the wiki origin); a failed fetch resolves to null. */
function withRoster(use: (r: VoiceRoster | null) => void): () => void {
  let alive = true
  void loadVoiceRoster().then((r) => alive && use(r))
  return () => {
    alive = false
  }
}

function summary(el: HTMLElement, raw: unknown): () => void {
  const p = readVoice(raw)
  const { root, unmount } = mountRoot(el)
  const first = p.lines[0]?.text ?? ''
  append(
    root,
    h('div', { class: 'cms-lah-tl-row' }, h('strong', null, p.resourceName || '(no resource)'), h('span', { class: 'cms-lah-tl-badge' }, plural(p.lines.length, 'line'))),
    first ? h('div', { class: 'cms-lah-tl-quote cms-lah-tl-text' }, clip(first, 200)) : null,
  )
  return unmount
}

/** One table row's cells that are the same in the read-only and the editor view (part, JP, current EN). */
function jpCell(extra?: HTMLElement | null): { td: HTMLElement; fill(jp: string): void } {
  const td = h('td', { 'data-label': 'JP', lang: 'ja' }, h('span', { class: 'cms-lah-tl-muted' }, '...'))
  return {
    td,
    fill(jp) {
      clear(td)
      td.append(textBlock(jp, { lang: 'ja', empty: extra ? 'No Japanese text yet' : 'Japanese text not available' }))
      if (extra) td.append(extra)
    },
  }
}

/** The transcription a contributor suggests for a line without Japanese text (read-only view). */
function suggestedJp(jp: string): HTMLElement {
  return h('div', { class: 'cms-lah-tl-suggested-jp' }, h('strong', null, 'Suggested JP: '), h('span', { class: 'cms-lah-tl-text', lang: 'ja' }, jp))
}

function table(headExtra: string): { table: HTMLTableElement; tbody: HTMLTableSectionElement } {
  const tbody = h('tbody')
  const t = h(
    'table',
    { class: 'cms-lah-tl-table' },
    h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Part'), h('th', { scope: 'col' }, 'JP'), h('th', { scope: 'col' }, 'Current EN'), h('th', { scope: 'col' }, headExtra))),
    tbody,
  )
  return { table: t, tbody }
}

function header(p: VoicePayload): HTMLElement {
  return h('div', { class: 'cms-lah-tl-row' }, h('strong', null, p.resourceName || '(no resource)'), h('span', { class: 'cms-lah-tl-badge' }, plural(p.lines.length, 'line')))
}

function detail(el: HTMLElement, raw: unknown): () => void {
  const p = readVoice(raw)
  const { root, unmount } = mountRoot(el, 'cms-lah-tl-stack')
  const { table: t, tbody } = table('Suggested EN')
  const fills: { jp: ReturnType<typeof jpCell>; key: string }[] = []
  for (const line of p.lines) {
    const jp = jpCell(line.jp ? suggestedJp(line.jp) : null)
    fills.push({ jp, key: line.key })
    append(
      tbody,
      h(
        'tr',
        null,
        h('td', { class: 'cms-lah-tl-part', 'data-label': 'Part' }, h('span', { class: 'cms-lah-tl-part-name' }, voicePart(p.resourceName, line.key))),
        jp.td,
        h('td', { 'data-label': 'Current EN' }, textBlock(line.base, { empty: 'no current text' })),
        h('td', { 'data-label': 'Suggested EN' }, line.text ? h('div', { class: 'cms-lah-tl-text' }, line.text) : h('span', { class: 'cms-lah-tl-muted' }, 'no English text')),
      ),
    )
  }
  append(
    root,
    header(p),
    p.note ? h('div', { class: 'cms-lah-tl-notice' }, h('strong', null, 'Note: '), h('span', { class: 'cms-lah-tl-text' }, p.note)) : null,
    p.lines.length ? t : h('p', { class: 'cms-lah-tl-muted' }, 'No lines.'),
  )
  const stop = withRoster((r) => fills.forEach((f) => f.jp.fill(voiceJp(r, p.resourceName, f.key))))
  return () => {
    stop()
    unmount()
  }
}

interface Row {
  line: VoiceLine
  tr: HTMLTableRowElement
  area: HTMLTextAreaElement
  keyErrs: HTMLElement
  textErrs: HTMLElement
  jpErrs: HTMLElement
  count: HTMLElement
  jp: ReturnType<typeof jpCell>
  jpArea: HTMLTextAreaElement | null
}

function editor(el: HTMLElement, init: { value: unknown; onChange(p: unknown): void; errors: FieldError[] }): EditorHandle {
  const initial = readVoice(init.value)
  // The working copy; the line objects are the identity of the rows.
  let resourceName = initial.resourceName
  let lines: VoiceLine[] = initial.lines.map((l) => ({ ...l }))
  let note = initial.note ?? ''
  let shown: FieldError[] = init.errors
  const onChange = (): void => {
    const out: VoicePayload = { resourceName, lines: lines.map((l) => ({ ...l })) }
    if (note.trim()) out.note = note
    init.onChange(out)
  }

  const { root, unmount } = mountRoot(el, 'cms-lah-tl-stack')
  const summaryEl = h('div', { class: 'cms-lah-tl-row' })
  const generalErrs = errorBox()
  const { table: t, tbody } = table('Suggested EN')
  const emptyRow = h('tr', { class: 'cms-lah-tl-empty' }, h('td', { colspan: '4' }, 'No lines left. At least one line is required: reject the submission instead of removing everything.'))
  const noteArea = h('textarea', { class: 'cms-lah-tl-textarea', rows: 2, maxlength: NOTE_MAX * 2, value: note })
  const noteField = field('Note from the contributor (optional)', noteArea, `Plain text, at most ${NOTE_MAX} characters.`)
  const rows: Row[] = []
  let roster: VoiceRoster | null = null
  let rosterLoaded = false

  const idxOf = (line: VoiceLine) => lines.indexOf(line)

  function applyErrors(): void {
    const general = shown.filter((e) => {
      const r = relPath(e.path)
      return r === '' || r === 'resourceName' || r === 'lines'
    })
    showErrors(generalErrs, general)
    for (const row of rows) {
      const i = idxOf(row.line)
      showErrors(row.keyErrs, [...errorsAt(shown, `lines.${i}.key`), ...errorsAt(shown, `lines.${i}.base`), ...errorsAt(shown, `lines.${i}`)])
      showErrors(row.textErrs, errorsAt(shown, `lines.${i}.text`), [row.area])
      showErrors(row.jpErrs, errorsAt(shown, `lines.${i}.jp`), row.jpArea ? [row.jpArea] : [])
    }
    showErrors(noteField.errs, errorsAt(shown, 'note'), [noteArea])
  }

  function refreshChrome(): void {
    clear(summaryEl)
    append(summaryEl, h('strong', null, resourceName || '(no resource)'), h('span', { class: 'cms-lah-tl-badge' }, `${plural(lines.length, 'line')} (max ${MAX_LINES})`))
    if (!lines.length) {
      if (!emptyRow.isConnected) tbody.append(emptyRow)
    } else emptyRow.remove()
  }

  function addRow(line: VoiceLine): void {
    // a line the contributor transcribed carries `jp`: the moderator can correct it
    const jpErrs = errorBox()
    const jpArea = line.jp !== undefined ? h('textarea', { class: 'cms-lah-tl-textarea', rows: 2, lang: 'ja', value: line.jp, 'aria-label': `Suggested JP for ${voicePart(resourceName, line.key)}` }) : null
    const jp = jpCell(jpArea ? h('div', { class: 'cms-lah-tl-suggested-jp' }, h('strong', null, 'Suggested JP:'), jpArea, jpErrs) : null)
    const keyErrs = errorBox()
    const textErrs = errorBox()
    const count = h('div', { class: 'cms-lah-tl-count' })
    const area = h('textarea', { class: 'cms-lah-tl-textarea', rows: 3, value: line.text, 'aria-label': `Suggested EN for ${voicePart(resourceName, line.key)}` })
    const row: Row = { line, area, keyErrs, textErrs, jpErrs, count, jp, jpArea, tr: h('tr') }
    const updateCount = () => {
      const n = area.value.replace(/\r\n?/g, '\n').trim().length
      count.textContent = `${n} / ${TEXT_MAX}`
      count.className = n > TEXT_MAX ? 'cms-lah-tl-count cms-lah-tl-count-over' : 'cms-lah-tl-count'
    }
    updateCount()
    area.addEventListener('input', () => {
      line.text = area.value
      updateCount()
      // The edited text may have fixed (or caused) its own problem: drop the stale message for it.
      shown = shown.filter((e) => relPath(e.path) !== `lines.${idxOf(line)}.text`)
      showErrors(textErrs, [], [area])
      onChange()
    })
    jpArea?.addEventListener('input', () => {
      line.jp = jpArea.value
      shown = shown.filter((e) => relPath(e.path) !== `lines.${idxOf(line)}.jp`)
      showErrors(jpErrs, [], [jpArea])
      onChange()
    })
    const remove = button('Remove line', () => {
      lines = lines.filter((l) => l !== line)
      rows.splice(rows.indexOf(row), 1)
      row.tr.remove()
      shown = [] // indices shifted: the old messages no longer point at the right rows
      refreshChrome()
      applyErrors()
      onChange()
    }, 'cms-lah-tl-btn-danger')
    remove.setAttribute('aria-label', `Remove line ${voicePart(resourceName, line.key)}`)
    append(
      row.tr,
      h('td', { class: 'cms-lah-tl-part', 'data-label': 'Part' }, h('span', { class: 'cms-lah-tl-part-name' }, voicePart(resourceName, line.key)), keyErrs, remove),
      jp.td,
      h('td', { 'data-label': 'Current EN' }, textBlock(line.base, { empty: 'no current text' })),
      h('td', { 'data-label': 'Suggested EN' }, area, count, textErrs),
    )
    if (rosterLoaded) jp.fill(voiceJp(roster, resourceName, line.key))
    rows.push(row)
    tbody.append(row.tr)
  }

  noteArea.addEventListener('input', () => {
    note = noteArea.value
    shown = shown.filter((e) => relPath(e.path) !== 'note')
    showErrors(noteField.errs, [], [noteArea])
    onChange()
  })

  for (const l of lines) addRow(l)
  refreshChrome()
  append(root, summaryEl, generalErrs, t, noteField.wrap)
  applyErrors()

  const stop = withRoster((r) => {
    roster = r
    rosterLoaded = true
    for (const row of rows) row.jp.fill(voiceJp(r, resourceName, row.line.key))
  })

  return {
    destroy() {
      stop()
      unmount()
    },
    validate() {
      const errors = validateVoice({ resourceName, lines, ...(note.trim() ? { note } : {}) })
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

const plugin: SubmissionPlugin<VoicePayload> = {
  apiVersion: 1,
  type: TYPE,
  defaultPayload: () => ({ resourceName: '', lines: [] }),
  mountSummary: (el: HTMLElement, payload: VoicePayload, _ctx: PluginContext) => summary(el, payload),
  mountDetail: (el: HTMLElement, payload: VoicePayload, _ctx: PluginContext) => detail(el, payload),
  mountEditor: (el, init, _ctx) => editor(el, init),
}

export default plugin
