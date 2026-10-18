// Track A: suggest English translations for the translatable lines of one voice table. Only changed lines are sent.

import { useEffect, useMemo, useState } from 'preact/hooks'
import type { Ctx } from '../core/Shell.tsx'
import { MAX_LINES, NOTE_MAX, batchesOf, checkLine, checkNote, isChanged, type TextProblem } from '../core/rules.ts'
import { SubmitError, errorText, fieldName, fieldText, lineIndexOf, needsSignIn } from '../core/submit.ts'
import { useSubmitter } from '../core/submitter.tsx'
import { Notice } from '../core/ui.tsx'
import type { T } from '../i18n/t.ts'
import type { VoiceRow } from './collect.ts'
import type { VoiceLine } from '../core/rules.ts'

const PROBLEM_KEY = { empty: 'fe_text_required', angle: 'ruleAngle', template: 'ruleTemplate', control: 'ruleControl', tooLong: 'ruleTooLong', same: 'ruleSame' } as const

export function problemText(t: T, p: TextProblem, n = 0): string {
  return t(PROBLEM_KEY[p], { n, max: 2000 })
}

export function VoiceView({ ctx, rows }: { ctx: Ctx; rows: VoiceRow[] }) {
  const { t, api, lang } = ctx
  const submitter = useSubmitter(api, 'lah-voice-tl', lang)
  // `base` moves forward once a line has been sent, so the same line is not sent twice.
  const [bases, setBases] = useState<Record<string, string>>(() => Object.fromEntries(rows.map((r) => [r.key, r.base])))
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(rows.map((r) => [r.key, r.base])))
  // The Japanese transcription of the lines without Japanese text; a sent one is kept in `jpSent` and shown as text.
  const [jpValues, setJpValues] = useState<Record<string, string>>({})
  const [jpSent, setJpSent] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [reauth, setReauth] = useState(false)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [rowJpErrors, setRowJpErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<number | null>(null)

  const jpOpen = (r: VoiceRow): boolean => r.jpEditable && jpSent[r.key] === undefined
  const states = useMemo(
    () => rows.map((r) => ({ key: r.key, resource: r.resource, base: bases[r.key] ?? '', value: values[r.key] ?? '', ...(jpOpen(r) ? { jp: jpValues[r.key] ?? '' } : {}) })),
    [rows, bases, values, jpValues, jpSent],
  )
  const changed = states.filter(isChanged)
  const { groups, overflow } = batchesOf(states, MAX_LINES)
  const problems: Record<string, string> = {}
  const jpProblems: Record<string, string> = {}
  for (const l of changed) {
    const p = checkLine(l)
    if (p.text) problems[l.key] = problemText(t, p.text, l.value.trim().length)
    if (p.jp) jpProblems[l.key] = problemText(t, p.jp, (l.jp ?? '').trim().length)
  }
  const noteProblem = checkNote(note)
  const blocked = changed.length === 0 || Object.keys(problems).length > 0 || Object.keys(jpProblems).length > 0 || noteProblem !== null

  useEffect(() => ctx.setDirty(changed.length > 0), [changed.length])

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (busy || blocked) return
    setBusy(true)
    setBanner(null)
    setReauth(false)
    setRowErrors({})
    setRowJpErrors({})
    let sentCount = 0
    let batch: VoiceLine[] = []
    try {
      const noteText = note.trim()
      // one submission per resource (a multi-name table has several); each needs its own verification token
      for (const g of groups) {
        batch = g.lines
        await submitter.send({ resourceName: g.resource, lines: g.lines, ...(noteText ? { note: noteText } : {}) })
        sentCount += g.lines.length
        setBases((b) => ({ ...b, ...Object.fromEntries(g.lines.map((l) => [l.key, l.text])) }))
        setValues((v) => ({ ...v, ...Object.fromEntries(g.lines.map((l) => [l.key, l.text])) }))
        setJpSent((s) => ({ ...s, ...Object.fromEntries(g.lines.filter((l) => l.jp).map((l) => [l.key, l.jp as string])) }))
      }
      setSent(sentCount)
    } catch (err) {
      if (sentCount > 0) setSent(sentCount)
      if (needsSignIn(err)) setReauth(true)
      if (err instanceof SubmitError && err.code === 'validation_failed' && err.fields.length) {
        const next: Record<string, string> = {}
        const nextJp: Record<string, string> = {}
        const general: string[] = []
        for (const f of err.fields) {
          const i = lineIndexOf(f.path)
          const key = i === null ? undefined : batch[i]?.key
          if (key) (fieldName(f.path) === 'jp' ? nextJp : next)[key] = fieldText(t, f)
          else if (fieldName(f.path) === 'note' || f.path.startsWith('payload')) general.push(fieldText(t, f))
        }
        setRowErrors(next)
        setRowJpErrors(nextJp)
        setBanner([errorText(t, err), ...general].join(' '))
      } else if (!needsSignIn(err)) {
        setBanner(errorText(t, err))
      }
    } finally {
      setBusy(false)
    }
  }

  if (rows.length === 0) return <Notice>{t('voiceNothing')}</Notice>

  return (
    <form class="contrib-form" onSubmit={onSubmit} noValidate>
      {sent !== null ? (
        <Notice kind="success">
          {t('voiceSent', { n: sent })}{' '}
          <button type="button" class="contrib-link" onClick={ctx.openMine}>
            {t('mineButton')}
          </button>
        </Notice>
      ) : (
        <p class="contrib-help">{t('voiceIntro')}</p>
      )}
      {sent !== null && changed.length > 0 && <Notice>{t('voiceSentMore', { n: changed.length })}</Notice>}

      <ul class="contrib-voice-rows">
        {rows.map((r) => {
          const v = values[r.key] ?? ''
          const err = rowErrors[r.key] ?? problems[r.key]
          const jpErr = rowJpErrors[r.key] ?? jpProblems[r.key]
          const id = `contrib-line-${r.key}`
          const jpId = `${id}-jp`
          const jpShown = r.jp || jpSent[r.key] || ''
          return (
            <li key={r.key} class={isChanged({ key: r.key, base: bases[r.key] ?? '', value: v }) ? 'is-changed' : ''}>
              <div class="contrib-voice-rows__head">
                <span class="voice-key-badge">{r.label}</span>
              </div>
              {jpOpen(r) ? (
                <div class="contrib-voice-rows__jp-input">
                  <label class="contrib-sr-only" for={jpId}>
                    {t('voiceJpLabel', { key: r.label })}
                  </label>
                  <textarea id={jpId} lang="ja" rows={Math.min(4, Math.max(2, (jpValues[r.key] ?? '').split('\n').length))} value={jpValues[r.key] ?? ''} aria-invalid={jpErr ? 'true' : undefined} aria-describedby={`${jpId}-help${jpErr ? ` ${jpId}-err` : ''}`} placeholder={t('voiceJpInput')} onInput={(e) => setJpValues((s) => ({ ...s, [r.key]: (e.currentTarget as HTMLTextAreaElement).value }))} />
                  <p class="contrib-help" id={`${jpId}-help`}>
                    {t('voiceJpMissing')}
                  </p>
                  {jpErr && (
                    <p class="contrib-field-error" id={`${jpId}-err`} role="alert">
                      {jpErr}
                    </p>
                  )}
                </div>
              ) : (
                <div class="contrib-voice-rows__jp" lang="ja">
                  <span class="contrib-sr-only">{t('voiceJp')}: </span>
                  {jpShown || '-'}
                </div>
              )}
              <label class="contrib-sr-only" for={id}>
                {t('voiceLineLabel', { key: r.label })}
              </label>
              <textarea id={id} rows={Math.min(6, Math.max(2, v.split('\n').length))} value={v} aria-invalid={err ? 'true' : undefined} aria-describedby={err ? `${id}-err` : undefined} placeholder={jpOpen(r) ? t('voiceEnOptional') : t('voiceEn')} onInput={(e) => setValues((s) => ({ ...s, [r.key]: (e.currentTarget as HTMLTextAreaElement).value }))} />
              {err && (
                <p class="contrib-field-error" id={`${id}-err`} role="alert">
                  {err}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <div class="contrib-field">
        <label for="contrib-note">{t('noteLabel')}</label>
        <textarea id="contrib-note" rows={2} value={note} onInput={(e) => setNote((e.currentTarget as HTMLTextAreaElement).value)} />
        <p class="contrib-help">{noteProblem ? <span class="contrib-field-error">{problemText(t, noteProblem, note.trim().length)}</span> : t('noteHelp', { n: note.trim().length, max: NOTE_MAX })}</p>
      </div>

      {overflow > 0 && <Notice kind="warn">{t('voiceTooMany', { n: changed.length, max: MAX_LINES })}</Notice>}
      {banner && <Notice kind="error">{banner}</Notice>}
      {reauth && (
        <div class="contrib-reauth">
          <Notice kind="warn">{t('signInAgain')}</Notice>
          {ctx.session.signInError && <Notice kind="error">{ctx.session.signInError}</Notice>}
          <button type="button" class="contrib-btn" onClick={() => void ctx.session.signIn().then((ok) => ok && setReauth(false))}>
            {t('signInButton')}
          </button>
        </div>
      )}

      {submitter.widget}
      <div class="contrib-actions">
        <span class="contrib-count">{changed.length > 0 ? t('voiceChanged', { n: changed.length }) : t('voiceNoChange')}</span>
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
