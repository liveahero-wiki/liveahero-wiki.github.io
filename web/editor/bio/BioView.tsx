// Track A: suggest a translation (English, Simplified or Traditional Chinese) of one hero/sidekick bio (`lah-bio-tl`). The
// Japanese text and the current text per language come from /api/bio-roster.json, which only lists translatable bios.
// Every language is its own submission, because a submission has one language.

import { useEffect, useState } from 'preact/hooks'
import type { Ctx } from '../core/Shell.tsx'
import { LANG_NAME, LANG_TAB, TL_LANGS, perLang, type TlLang } from '../core/langs.ts'
import { NOTE_MAX, checkNote, checkText } from '../core/rules.ts'
import { bioEntry, fetchData, type BioEntry, type BioRoster } from '../core/data.ts'
import { SubmitError, errorText, fieldText, needsSignIn } from '../core/submit.ts'
import { useSubmitter } from '../core/submitter.tsx'
import { Notice } from '../core/ui.tsx'
import { problemText } from '../voice/VoiceView.tsx'

export function BioView({ ctx, bioKey, initialLang = 'en' }: { ctx: Ctx; bioKey: string; initialLang?: TlLang }) {
  const { t, api, lang } = ctx
  const submitter = useSubmitter(api, 'lah-bio-tl', lang)
  const [entry, setEntry] = useState<BioEntry | null | undefined>(undefined) // undefined: loading, null: not offered
  const [active, setActive] = useState<TlLang>(initialLang)
  // `bases` moves forward once a language has been sent, so it is not sent twice.
  const [bases, setBases] = useState<Record<TlLang, string>>(() => perLang(() => ''))
  const [values, setValues] = useState<Record<TlLang, string>>(() => perLang(() => ''))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ lang: TlLang; messages: string[] } | null>(null)
  const [reauth, setReauth] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let dead = false
    fetchData<BioRoster>('bio-roster.json').then(
      (r) => {
        if (dead) return
        const e = bioEntry(r, bioKey)
        setEntry(e)
        if (e) {
          setBases(e.bases)
          setValues(e.bases)
          setActive(e.langs.includes(initialLang) ? initialLang : e.langs[0]!)
        }
      },
      () => !dead && setEntry(null),
    )
    return () => {
      dead = true
    }
  }, [bioKey])

  const offered = entry ? TL_LANGS.filter((l) => entry.langs.includes(l)) : []
  const changed = offered.filter((l) => values[l].trim() !== bases[l].trim())
  const problemOf = (l: TlLang) => checkText(values[l], bases[l])
  const problem = entry ? problemOf(active) : null
  const noteProblem = checkNote(note)
  const blocked = !entry || changed.length === 0 || changed.some((l) => problemOf(l) !== null) || noteProblem !== null
  const dirty = !done && changed.length > 0
  useEffect(() => ctx.setDirty(dirty), [dirty])

  if (entry === undefined) return <p>{t('bioLoading')}</p>
  if (entry === null) return <Notice>{t('bioNotOffered')}</Notice>

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (busy || blocked) return
    setBusy(true)
    setBanner(null)
    setFieldErrors(null)
    setReauth(false)
    let failed: TlLang = active
    try {
      const n = note.trim()
      // one submission per changed language; a language that went through stays sent when a later one fails
      for (const l of changed) {
        failed = l
        const text = values[l].trim()
        await submitter.send({ key: bioKey, base: bases[l], text, ...(n ? { note: n } : {}) }, l)
        setBases((b) => ({ ...b, [l]: text }))
      }
      setDone(true)
    } catch (err) {
      setActive(failed)
      if (needsSignIn(err)) setReauth(true)
      if (err instanceof SubmitError && err.code === 'validation_failed') setFieldErrors({ lang: failed, messages: err.fields.map((f) => fieldText(t, f)) })
      if (!needsSignIn(err)) setBanner(errorText(t, err))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div class="contrib-form">
        <Notice kind="success">{t('bioSent')}</Notice>
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

  const langName = t(LANG_NAME[active])
  const id = `contrib-bio-text-${active}`

  return (
    <form class="contrib-form" onSubmit={onSubmit} noValidate>
      <p class="contrib-help">{t('bioIntro')}</p>
      <div class="contrib-field">
        <span class="contrib-label">{t('bioJp')}</span>
        <div class="contrib-readonly" lang="ja">
          {entry.jp || '-'}
        </div>
      </div>
      <div class="contrib-langs" role="group" aria-label={t('voiceLangs')}>
        {offered.map((l) => (
          <button key={l} type="button" class="contrib-langs__btn" aria-pressed={l === active ? 'true' : 'false'} title={t(LANG_NAME[l])} onClick={() => setActive(l)}>
            {LANG_TAB[l]}
            {changed.includes(l) && <span class="contrib-langs__count"> ✎</span>}
          </button>
        ))}
      </div>
      <div class="contrib-field">
        <label for={id}>{langName}</label>
        <textarea id={id} lang={active} rows={8} value={values[active]} aria-invalid={problem && values[active].trim() ? 'true' : undefined} onInput={(e) => setValues((s) => ({ ...s, [active]: (e.currentTarget as HTMLTextAreaElement).value }))} />
        {problem && problem !== 'empty' && problem !== 'same' && <p class="contrib-field-error">{problemText(t, problem, values[active].trim().length)}</p>}
        {fieldErrors?.lang === active &&
          fieldErrors.messages.map((m) => (
            <p class="contrib-field-error" key={m} role="alert">
              {m}
            </p>
          ))}
      </div>
      <div class="contrib-field">
        <label for="contrib-note">{t('noteLabel')}</label>
        <textarea id="contrib-note" rows={2} value={note} onInput={(e) => setNote((e.currentTarget as HTMLTextAreaElement).value)} />
        <p class="contrib-help">{noteProblem ? <span class="contrib-field-error">{problemText(t, noteProblem, note.trim().length)}</span> : t('noteHelp', { n: note.trim().length, max: NOTE_MAX })}</p>
      </div>
      {banner && <Notice kind="error">{banner}</Notice>}
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
