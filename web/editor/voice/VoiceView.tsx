// Track A: suggest translations (English, Simplified or Traditional Chinese) for the translatable lines of one voice table.
// Only changed lines are sent; every language is its own submission, because a submission has one language.

import { useEffect, useMemo, useState } from 'preact/hooks'
import type { Ctx } from '../core/Shell.tsx'
import { LANG_NAME, LANG_TAB, TL_LANGS, perLang, type TlLang } from '../core/langs.ts'
import { MAX_LINES, NOTE_MAX, batchesOf, checkLine, checkNote, isChanged, type LineState, type ResourceBatch, type TextProblem } from '../core/rules.ts'
import { SubmitError, errorText, fieldName, fieldText, lineIndexOf, needsSignIn } from '../core/submit.ts'
import { useSubmitter } from '../core/submitter.tsx'
import { Notice } from '../core/ui.tsx'
import type { T } from '../i18n/t.ts'
import type { VoiceRow } from './collect.ts'

const PROBLEM_KEY = { empty: 'fe_text_required', angle: 'ruleAngle', template: 'ruleTemplate', control: 'ruleControl', tooLong: 'ruleTooLong', same: 'ruleSame' } as const

export function problemText(t: T, p: TextProblem, n = 0): string {
  return t(PROBLEM_KEY[p], { n, max: 2000 })
}

type PerLang<V> = Record<TlLang, V>
type LangState = LineState & { resource: string }
type LangBatch = ResourceBatch & { lang: TlLang }

/** Error/problem maps are keyed by language and line, because the same line has one textarea per language. */
const errKey = (lang: TlLang, key: string): string => `${lang}|${key}`

export function VoiceView({ ctx, rows, initialLang = 'en' }: { ctx: Ctx; rows: VoiceRow[]; initialLang?: TlLang }) {
  const { t, api, lang } = ctx
  const submitter = useSubmitter(api, 'lah-voice-tl', lang)
  const available = TL_LANGS.filter((l) => rows.some((r) => r.langs.includes(l)))
  const [active, setActive] = useState<TlLang>(available.includes(initialLang) ? initialLang : (available[0] ?? 'en'))
  // `bases` moves forward once a line has been sent, so the same line is not sent twice.
  const [bases, setBases] = useState<PerLang<Record<string, string>>>(() => perLang((l) => Object.fromEntries(rows.map((r) => [r.key, r.bases[l]]))))
  const [values, setValues] = useState<PerLang<Record<string, string>>>(() => perLang((l) => Object.fromEntries(rows.map((r) => [r.key, r.bases[l]]))))
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
  // Rebuilt only when an input changes, not on every render (the table can have hundreds of lines in three languages).
  const { changedBy, changedTotal, groups, overflow } = useMemo(() => {
    const statesOf = (l: TlLang): LangState[] =>
      rows
        .filter((r) => r.langs.includes(l))
        .map((r) => ({ key: r.key, resource: r.resource, base: bases[l][r.key] ?? '', value: values[l][r.key] ?? '', ...(l === 'en' && jpOpen(r) ? { jp: jpValues[r.key] ?? '' } : {}) }))
    const changedBy = perLang((l) => statesOf(l).filter(isChanged))
    const groups: LangBatch[] = []
    let overflow = 0
    for (const l of TL_LANGS) {
      const b = batchesOf(statesOf(l), MAX_LINES)
      overflow += b.overflow
      groups.push(...b.groups.map((g) => ({ ...g, lang: l })))
    }
    return { changedBy, changedTotal: TL_LANGS.reduce((n, l) => n + changedBy[l].length, 0), groups, overflow }
  }, [rows, bases, values, jpValues, jpSent])
  const problems: Record<string, string> = {}
  const jpProblems: Record<string, string> = {}
  for (const l of TL_LANGS) {
    for (const s of changedBy[l]) {
      const p = checkLine(s)
      if (p.text) problems[errKey(l, s.key)] = problemText(t, p.text, s.value.trim().length)
      if (p.jp) jpProblems[s.key] = problemText(t, p.jp, (s.jp ?? '').trim().length)
    }
  }
  const noteProblem = checkNote(note)
  const blocked = changedTotal === 0 || Object.keys(problems).length > 0 || Object.keys(jpProblems).length > 0 || noteProblem !== null

  useEffect(() => ctx.setDirty(changedTotal > 0), [changedTotal])

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (busy || blocked) return
    setBusy(true)
    setBanner(null)
    setReauth(false)
    setRowErrors({})
    setRowJpErrors({})
    let sentCount = 0
    let current: LangBatch | null = null
    try {
      const noteText = note.trim()
      // one submission per resource and language (a multi-name table has several resources); each needs its own verification token
      for (const g of groups) {
        current = g
        await submitter.send({ resourceName: g.resource, lines: g.lines, ...(noteText ? { note: noteText } : {}) }, g.lang)
        sentCount += g.lines.length
        const texts = Object.fromEntries(g.lines.map((l) => [l.key, l.text]))
        setBases((b) => ({ ...b, [g.lang]: { ...b[g.lang], ...texts } }))
        setValues((v) => ({ ...v, [g.lang]: { ...v[g.lang], ...texts } }))
        setJpSent((s) => ({ ...s, ...Object.fromEntries(g.lines.filter((l) => l.jp).map((l) => [l.key, l.jp as string])) }))
      }
      setSent(sentCount)
    } catch (err) {
      if (sentCount > 0) setSent(sentCount)
      if (needsSignIn(err)) setReauth(true)
      if (err instanceof SubmitError && err.code === 'validation_failed' && err.fields.length && current) {
        const failed: LangBatch = current
        const next: Record<string, string> = {}
        const nextJp: Record<string, string> = {}
        const general: string[] = []
        for (const f of err.fields) {
          const i = lineIndexOf(f.path)
          const key = i === null ? undefined : failed.lines[i]?.key
          if (key) {
            if (fieldName(f.path) === 'jp') nextJp[key] = fieldText(t, f)
            else next[errKey(failed.lang, key)] = fieldText(t, f)
          } else if (fieldName(f.path) === 'note' || f.path.startsWith('payload')) general.push(fieldText(t, f))
        }
        setRowErrors(next)
        setRowJpErrors(nextJp)
        // an error in another language than the one on screen: show that language
        if (Object.keys(next).length > 0 || Object.keys(nextJp).length > 0) setActive(Object.keys(nextJp).length > 0 ? 'en' : failed.lang)
        setBanner([errorText(t, err), ...general].join(' '))
      } else if (!needsSignIn(err)) {
        setBanner(errorText(t, err))
      }
    } finally {
      setBusy(false)
    }
  }

  if (rows.length === 0) return <Notice>{t('voiceNothing')}</Notice>

  const langName = t(LANG_NAME[active])

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
      {sent !== null && changedTotal > 0 && <Notice>{t('voiceSentMore', { n: changedTotal })}</Notice>}

      <div class="contrib-langs" role="group" aria-label={t('voiceLangs')}>
        {available.map((l) => (
          <button key={l} type="button" class="contrib-langs__btn" aria-pressed={l === active ? 'true' : 'false'} title={t(LANG_NAME[l])} onClick={() => setActive(l)}>
            {LANG_TAB[l]}
            {changedBy[l].length > 0 && <span class="contrib-langs__count"> ({changedBy[l].length})</span>}
          </button>
        ))}
      </div>

      <ul class="contrib-voice-rows">
        {rows.map((r) => {
          const open = r.langs.includes(active)
          const v = values[active][r.key] ?? ''
          const err = rowErrors[errKey(active, r.key)] ?? problems[errKey(active, r.key)]
          const jpErr = rowJpErrors[r.key] ?? jpProblems[r.key]
          const id = `contrib-line-${r.key}-${active}`
          const jpId = `contrib-line-${r.key}-jp`
          const jpShown = r.jp || jpSent[r.key] || ''
          const jpInput = active === 'en' && jpOpen(r)
          return (
            <li key={r.key} class={isChanged({ key: r.key, base: bases[active][r.key] ?? '', value: v }) ? 'is-changed' : ''}>
              <div class="contrib-voice-rows__head">
                <span class="voice-key-badge">{r.label}</span>
              </div>
              {jpInput ? (
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
              {open ? (
                <>
                  <label class="contrib-sr-only" for={id}>
                    {t('voiceLineLabel', { key: r.label, lang: langName })}
                  </label>
                  <textarea id={id} lang={active} rows={Math.min(6, Math.max(2, v.split('\n').length))} value={v} aria-invalid={err ? 'true' : undefined} aria-describedby={err ? `${id}-err` : undefined} placeholder={jpInput ? t('voiceOptional', { lang: langName }) : langName} onInput={(e) => setValues((s) => ({ ...s, [active]: { ...s[active], [r.key]: (e.currentTarget as HTMLTextAreaElement).value } }))} />
                  {err && (
                    <p class="contrib-field-error" id={`${id}-err`} role="alert">
                      {err}
                    </p>
                  )}
                </>
              ) : (
                <div class="contrib-voice-rows__closed">
                  <div lang={active}>{bases[active][r.key] || '-'}</div>
                  <p class="contrib-help">{active !== 'en' && !r.jp ? t('voiceNeedsJp') : t('voiceClosed')}</p>
                </div>
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

      {overflow > 0 && <Notice kind="warn">{t('voiceTooMany', { n: changedTotal, max: MAX_LINES })}</Notice>}
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
        <span class="contrib-count">{changedTotal > 0 ? t('voiceChanged', { n: changedTotal }) : t('voiceNoChange')}</span>
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
