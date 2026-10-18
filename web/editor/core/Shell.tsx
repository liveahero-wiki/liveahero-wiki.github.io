// The dialog every editor opens in: it holds the sign-in gate until there is a contributor session, then the editor
// itself with an account bar (who is signed in, "My contributions", sign out) and the close-with-confirm logic.

import type { ComponentChildren } from 'preact'
import { useCallback, useMemo, useRef, useState } from 'preact/hooks'
import type { ContribUser } from '../../cms-plugin/api-types.ts'
import type { Lang } from '../../team-creator/lang.ts'
import { makeT, type T } from '../i18n/t.ts'
import { MyContributions } from './MyContributions.tsx'
import { SignInGate, useSession, type Session } from './session.tsx'
import { Modal } from './ui.tsx'

/** What the editors get from the shell. */
export interface Ctx {
  api: string
  t: T
  lang: Lang
  user: ContribUser
  session: Session
  /** Tell the shell whether closing would lose unsent work (it then asks first). */
  setDirty(dirty: boolean): void
  openMine(): void
  close(): void
}

export function Shell({ api, lang, title, wide, onClose, children }: { api: string; lang: Lang; title: (t: T) => string; wide?: boolean; onClose: () => void; children: (ctx: Ctx) => ComponentChildren }) {
  const t = useMemo(() => makeT(lang), [lang])
  const session = useSession(api, t, lang)
  const dirty = useRef(false)
  const [mine, setMine] = useState(false)

  const requestClose = useCallback(() => {
    if (dirty.current && !window.confirm(t('confirmDiscard'))) return
    onClose()
  }, [t, onClose])
  const setDirty = useCallback((d: boolean) => void (dirty.current = d), [])
  const openMine = useCallback(() => setMine(true), [])

  const ctx: Ctx | null = session.user ? { api, t, lang, user: session.user, session, setDirty, openMine, close: requestClose } : null

  return (
    <>
      <Modal title={ctx ? title(t) : t('signInTitle')} t={t} wide={!!ctx && wide} onRequestClose={requestClose}>
        {ctx ? (
          <>
            <div class="contrib-account">
              <span>{t('signedInAs', { name: ctx.user.displayName })}</span>
              <span class="contrib-account__actions">
                <button type="button" class="contrib-link" onClick={openMine}>
                  {t('mineButton')}
                </button>
                <button type="button" class="contrib-link" onClick={() => void session.signOut()}>
                  {t('signOut')}
                </button>
              </span>
            </div>
            {children(ctx)}
          </>
        ) : (
          <SignInGate session={session} t={t} />
        )}
      </Modal>
      {mine && <MyContributions api={api} t={t} lang={lang} onClose={() => setMine(false)} />}
    </>
  )
}
