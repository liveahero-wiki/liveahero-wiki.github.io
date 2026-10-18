// Track A: suggest an English translation of one hero/sidekick bio (`lah-bio-tl`). The Japanese text and the current
// English text come from /api/bio-roster.json, which only lists translatable bios.

import { useEffect, useState } from 'preact/hooks'
import type { Ctx } from '../core/Shell.tsx'
import { NOTE_MAX, checkNote, checkText } from '../core/rules.ts'
import { bioEntry, fetchData, type BioEntry, type BioRoster } from '../core/data.ts'
import { SubmitError, errorText, fieldText, needsSignIn } from '../core/submit.ts'
import { useSubmitter } from '../core/submitter.tsx'
import { Notice } from '../core/ui.tsx'
import { problemText } from '../voice/VoiceView.tsx'

export function BioView({ ctx, bioKey }: { ctx: Ctx; bioKey: string }) {
  const { t, api, lang } = ctx
  const submitter = useSubmitter(api, 'lah-bio-tl', lang)
  const [entry, setEntry] = useState<BioEntry | null | undefined>(undefined) // undefined: loading, null: not offered
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [reauth, setReauth] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let dead = false
    fetchData<BioRoster>('bio-roster.json').then(
      (r) => {
        if (dead) return
        const e = bioEntry(r, bioKey)
        setEntry(e)
        if (e) setValue(e.en)
      },
      () => !dead && setEntry(null),
    )
    return () => {
      dead = true
    }
  }, [bioKey])

  const base = entry?.en ?? ''
  const problem = entry ? checkText(value, base) : null
  const noteProblem = checkNote(note)
  const blocked = !entry || problem !== null || noteProblem !== null
  const dirty = !done && !!entry && value.trim() !== base.trim()
  useEffect(() => ctx.setDirty(dirty), [dirty])

  if (entry === undefined) return <p>{t('bioLoading')}</p>
  if (entry === null) return <Notice>{t('bioNotOffered')}</Notice>

  const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (busy || blocked) return
    setBusy(true)
    setBanner(null)
    setFieldErrors([])
    setReauth(false)
    try {
      const n = note.trim()
      await submitter.send({ key: bioKey, base, text: value.trim(), ...(n ? { note: n } : {}) })
      setDone(true)
    } catch (err) {
      if (needsSignIn(err)) setReauth(true)
      if (err instanceof SubmitError && err.code === 'validation_failed') setFieldErrors(err.fields.map((f) => fieldText(t, f)))
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

  return (
    <form class="contrib-form" onSubmit={onSubmit} noValidate>
      <p class="contrib-help">{t('bioIntro')}</p>
      <div class="contrib-field">
        <span class="contrib-label">{t('bioJp')}</span>
        <div class="contrib-readonly" lang="ja">
          {entry.jp || '-'}
        </div>
      </div>
      <div class="contrib-field">
        <label for="contrib-bio-text">{t('bioEn')}</label>
        <textarea id="contrib-bio-text" rows={8} value={value} aria-invalid={problem && value.trim() ? 'true' : undefined} onInput={(e) => setValue((e.currentTarget as HTMLTextAreaElement).value)} />
        {problem && problem !== 'empty' && problem !== 'same' && <p class="contrib-field-error">{problemText(t, problem, value.trim().length)}</p>}
        {fieldErrors.map((m) => (
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
