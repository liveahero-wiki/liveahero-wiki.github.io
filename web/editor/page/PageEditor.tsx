// Track B: edit the whole body of one wiki page. The source comes from raw.githubusercontent.com, the front matter is
// never shown, the live guard (wiki_plugins/lib/contrib-guard.js, the same file CI runs) names every forbidden change,
// and the preview uses the site's own markdown setup. Submitting sends `{ path, baseSha, after, summary }` to lah-page-edit.

import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { checkEdit, isEditablePath } from '../../../wiki_plugins/lib/contrib-guard.js'
import type { Ctx } from '../core/Shell.tsx'
import { SUMMARY_MAX, SUMMARY_MIN, AFTER_MAX_CHARS, checkAfter, checkSummary } from '../core/rules.ts'
import { fetchData } from '../core/data.ts'
import { readDraft, writeDraft } from '../core/drafts.ts'
import { SubmitError, errorText, fieldText, needsSignIn } from '../core/submit.ts'
import { useSubmitter } from '../core/submitter.tsx'
import { Notice } from '../core/ui.tsx'
import { Toolbar } from './Toolbar.tsx'
import { loadEditorData, type EditorDataView } from './editor-data.ts'
import { appendSection, insertText, type SectionKind } from './insert.ts'
import { renderPreview } from './preview.ts'
import { sanitizePreview } from './sanitize.ts'
import { loadSource, toFileEol, type Source } from './source.ts'

interface Violation {
  code: string
  message: string
  token?: string
}

export function PageEditor({ ctx, path, repo }: { ctx: Ctx; path: string; repo: string }) {
  const { t, api, lang } = ctx
  const submitter = useSubmitter(api, 'lah-page-edit', lang)
  const [source, setSource] = useState<Source | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [allowed, setAllowed] = useState<string[] | null>(null)
  const [data, setData] = useState<EditorDataView | null>(null)
  const [dataFailed, setDataFailed] = useState(false)

  const [body, setBody] = useState('')
  const [summary, setSummary] = useState('')
  const [draftNote, setDraftNote] = useState(false)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [serverFields, setServerFields] = useState<string[]>([])
  const [reauth, setReauth] = useState(false)
  const [done, setDone] = useState(false)
  const area = useRef<HTMLTextAreaElement>(null)

  const editable = isEditablePath(path)

  useEffect(() => {
    if (!editable) return
    let dead = false
    loadSource(repo, path).then(
      (s) => {
        if (dead) return
        setSource(s)
        const d = readDraft(path, s.baseSha)
        if (d && d.body !== s.before) {
          setBody(d.body)
          setSummary(d.summary)
          setDraftNote(true)
        } else setBody(s.before)
      },
      () => !dead && setLoadFailed(true),
    )
    fetchData<{ includes?: string[] }>('contrib-includes.json').then(
      (r) => !dead && setAllowed(Array.isArray(r.includes) ? r.includes : []),
      () => undefined,
    )
    loadEditorData().then(
      (d) => !dead && setData(d),
      () => !dead && setDataFailed(true),
    )
    return () => {
      dead = true
    }
  }, [path, repo, editable])

  const changed = source !== null && body !== source.before
  useEffect(() => ctx.setDirty(changed && !done), [changed, done])

  // The unsent draft, saved shortly after typing stops.
  useEffect(() => {
    if (!source || done) return
    const h = setTimeout(() => writeDraft(path, source.baseSha, changed ? { body, summary } : null), 400)
    return () => clearTimeout(h)
  }, [body, summary, source, changed, done])

  // Debounced guard and preview, so typing stays smooth on long pages.
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebounced(body), 250)
    return () => clearTimeout(h)
  }, [body])
  const guard = useMemo<{ ok: boolean; violations: Violation[] } | null>(() => {
    if (!source || allowed === null) return null
    try {
      return checkEdit(source.before, debounced, { allowedIncludes: allowed })
    } catch (e) {
      console.error('[editor] guard failed', e)
      return { ok: false, violations: [{ code: 'guard-error', message: t('guardUnavailable') }] }
    }
  }, [source, allowed, debounced, t])
  const guardPending = debounced !== body
  const html = useMemo(() => {
    if (!source) return ''
    try {
      return sanitizePreview(renderPreview(debounced, data?.renderers ?? {}, { template: t('protectedChip'), include: (name) => t('includeChip', { name }) }))
    } catch (e) {
      console.error('[editor] preview failed', e)
      return ''
    }
  }, [source, debounced, data, t])

  const afterProblem = checkAfter(body)
  const summaryProblem = checkSummary(summary)
  const guardBlocked = guard === null || !guard.ok
  const blocked = !changed || guardBlocked || guardPending || afterProblem !== null || summaryProblem !== null

  const replaceSelection = useCallback((text: string) => {
    const ta = area.current
    if (!ta) return
    ta.focus()
    const s = ta.selectionStart
    const e = ta.selectionEnd
    // execCommand keeps the browser's undo stack; fall back to a plain value change.
    let ok = false
    try {
      ok = document.execCommand('insertText', false, text)
    } catch {
      ok = false
    }
    if (!ok) {
      const next = insertText(ta.value, s, e, text)
      setBody(next.value)
      requestAnimationFrame(() => ta.setSelectionRange(next.cursor, next.cursor))
    }
  }, [])

  const addSection = useCallback(
    (kind: SectionKind) => {
      const next = appendSection(area.current?.value ?? body, kind)
      setBody(next.value)
      requestAnimationFrame(() => {
        const ta = area.current
        if (!ta) return
        ta.focus()
        ta.setSelectionRange(next.cursor, next.cursor)
        ta.scrollTop = ta.scrollHeight
      })
    },
    [body],
  )

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (busy || blocked || !source) return
    setBusy(true)
    setBanner(null)
    setServerFields([])
    setReauth(false)
    try {
      const after = toFileEol(body, source.crlf)
      await submitter.send({ path, baseSha: source.baseSha, after, summary: summary.trim() })
      writeDraft(path, source.baseSha, null)
      setDone(true)
    } catch (err) {
      if (needsSignIn(err)) setReauth(true)
      if (err instanceof SubmitError && err.code === 'validation_failed') setServerFields(err.fields.map((f) => fieldText(t, f)))
      if (!needsSignIn(err)) setBanner(errorText(t, err))
    } finally {
      setBusy(false)
    }
  }

  if (!editable) return <Notice kind="error">{t('pageNotEditable')}</Notice>
  if (loadFailed) return <Notice kind="error">{t('pageLoadFailed')}</Notice>
  if (!source) return <p>{t('pageLoading')}</p>

  if (done) {
    return (
      <div class="contrib-form">
        <Notice kind="success">{t('pageSent')}</Notice>
        <div class="contrib-actions">
          <button type="button" class="contrib-btn" onClick={ctx.openMine}>
            {t('mineButton')}
          </button>
          <button type="button" class="contrib-btn contrib-btn--primary" onClick={ctx.close}>
            {t('done')}
          </button>
        </div>
      </div>
    )
  }

  const violations = guard && !guard.ok ? guard.violations : []

  return (
    <form class="contrib-form contrib-page" onSubmit={onSubmit} noValidate>
      <p class="contrib-help">{t('pageIntro')}</p>
      {draftNote && (
        <Notice>
          {t('pageDraftRestored')}{' '}
          <button
            type="button"
            class="contrib-link"
            onClick={() => {
              writeDraft(path, source.baseSha, null)
              setBody(source.before)
              setSummary('')
              setDraftNote(false)
            }}
          >
            {t('pageStartOver')}
          </button>
        </Notice>
      )}

      <div class="contrib-tabs" role="tablist">
        <button type="button" role="tab" id="contrib-tab-edit" aria-selected={tab === 'edit'} aria-controls="contrib-pane-edit" class="contrib-tab" onClick={() => setTab('edit')}>
          {t('tabEdit')}
        </button>
        <button type="button" role="tab" id="contrib-tab-preview" aria-selected={tab === 'preview'} aria-controls="contrib-pane-preview" class="contrib-tab" onClick={() => setTab('preview')}>
          {t('tabPreview')}
        </button>
      </div>

      <div class="contrib-panes" data-tab={tab}>
        <div class="contrib-pane contrib-pane--edit" id="contrib-pane-edit" role="tabpanel" aria-labelledby="contrib-tab-edit">
          <Toolbar t={t} data={data} dataFailed={dataFailed} onInsert={replaceSelection} onSection={addSection} />
          <label class="contrib-sr-only" for="contrib-body">
            {t('pageBodyLabel')}
          </label>
          <textarea id="contrib-body" ref={area} class="contrib-body" spellcheck={true} value={body} onInput={(e) => setBody((e.currentTarget as HTMLTextAreaElement).value)} />
        </div>
        <div class="contrib-pane contrib-pane--preview" id="contrib-pane-preview" role="tabpanel" aria-labelledby="contrib-tab-preview">
          <p class="contrib-help">{t('previewNote')}</p>
          <div class="contrib-preview" aria-label={t('previewLabel')} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <div class="contrib-guard" aria-live="polite">
        {violations.length > 0 ? (
          <Notice kind="error">
            <strong>{t('guardTitle')}</strong>
            <ul>
              {violations.map((v, i) => (
                <li key={`${v.code}-${i}`}>{v.message}</li>
              ))}
            </ul>
          </Notice>
        ) : guard === null ? (
          <p class="contrib-help">{t('loading')}</p>
        ) : null}
        {afterProblem === 'tooLong' && <Notice kind="error">{t('pageTooLong', { n: body.length, max: AFTER_MAX_CHARS })}</Notice>}
        {afterProblem === 'fence' && <Notice kind="error">{t('pageFence')}</Notice>}
        {afterProblem === 'nul' && <Notice kind="error">{t('ruleControl')}</Notice>}
      </div>

      <div class="contrib-field">
        <label for="contrib-summary">{t('summaryLabel')}</label>
        <input id="contrib-summary" type="text" maxLength={SUMMARY_MAX + 40} value={summary} aria-invalid={summary.trim() && summaryProblem ? 'true' : undefined} onInput={(e) => setSummary((e.currentTarget as HTMLInputElement).value)} />
        <p class={summary.trim() && summaryProblem ? 'contrib-field-error' : 'contrib-help'}>{summary.trim() && summaryProblem ? t('summaryInvalid', { min: SUMMARY_MIN, max: SUMMARY_MAX }) : t('summaryHelp', { min: SUMMARY_MIN, max: SUMMARY_MAX })}</p>
      </div>

      {banner && <Notice kind="error">{banner}</Notice>}
      {serverFields.length > 0 && (
        <ul class="contrib-field-error">
          {serverFields.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      {reauth && (
        <div class="contrib-reauth">
          <Notice kind="warn">{t('signInAgain')}</Notice>
          <button type="button" class="contrib-btn" onClick={() => void ctx.session.signIn().then((ok) => ok && setReauth(false))}>
            {t('signInButton')}
          </button>
        </div>
      )}

      {submitter.widget}
      <div class="contrib-actions">
        <span class="contrib-count">{!changed ? t('pageNoChange') : ''}</span>
        <button type="button" class="contrib-btn" onClick={ctx.close}>
          {t('close')}
        </button>
        <button type="submit" class="contrib-btn contrib-btn--primary" disabled={blocked || busy}>
          {busy ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  )
}
