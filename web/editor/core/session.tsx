// The contributor sign-in of the editor: the session belongs to the wiki-cms embed (`window.cmsEmbed.contrib`, the same
// one the Team Creator uses, stored in localStorage as `cms-contrib:<api>`); this hook mirrors it and offers sign in/out.

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { ContribUser } from '../../cms-plugin/api-types.ts'
import { SESSION_EVENT, currentUser, getContrib, loadedContrib, prefetchEmbed } from '../../team-creator/api.ts'
import type { Lang } from '../../team-creator/lang.ts'
import type { T } from '../i18n/t.ts'
import { signInErrorText } from './submit.ts'
import { Notice } from './ui.tsx'

export interface Session {
  user: ContribUser | null
  signIn(): Promise<boolean>
  signOut(): Promise<void>
  signingIn: boolean
  /** Localized message of the last failed sign-in, or null. */
  signInError: string | null
}

export function useSession(api: string, t: T, lang: Lang): Session {
  const [user, setUser] = useState<ContribUser | null>(() => currentUser(api))
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const alive = useRef(true)
  useEffect(() => () => void (alive.current = false), [])

  // Start fetching the embed now: the sign-in popup must open synchronously inside the next click, which needs it loaded.
  useEffect(() => prefetchEmbed(api), [api])

  // Follow sign-in/out from this dialog, the Team Creator or another tab.
  useEffect(() => {
    const refresh = () => alive.current && setUser(currentUser(api))
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ api?: string }>).detail
      if (d?.api === undefined || d.api === api) refresh()
    }
    const onStorage = (e: StorageEvent) => e.key === `cms-contrib:${api}` && refresh()
    window.addEventListener(SESSION_EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SESSION_EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [api])

  const signIn = useCallback(async (): Promise<boolean> => {
    setSignInError(null)
    setSigningIn(true)
    try {
      // Call `signIn` before any await when the embed is loaded: the popup opens inside the click. A cold click waits for
      // the script and may be blocked, which is reported as popup_blocked.
      const loaded = loadedContrib()
      const session = await (loaded ? loaded.signIn(api) : getContrib(api).then((c) => c.signIn(api)))
      if (alive.current) setUser(session.user)
      return true
    } catch (e) {
      if (alive.current) setSignInError(signInErrorText(t, lang, e))
      return false
    } finally {
      if (alive.current) setSigningIn(false)
    }
  }, [api, t, lang])

  const signOut = useCallback(async () => {
    try {
      await (await getContrib(api)).signOut(api)
    } finally {
      if (alive.current) setUser(null)
    }
  }, [api])

  return { user, signIn, signOut, signingIn, signInError }
}

export function SignInGate({ session, t }: { session: Session; t: T }) {
  return (
    <div class="contrib-gate">
      <p>{t('signInIntro')}</p>
      {session.signInError && <Notice kind="error">{session.signInError}</Notice>}
      <button type="button" class="contrib-btn contrib-btn--primary" disabled={session.signingIn} onClick={() => void session.signIn()}>
        {session.signingIn ? t('signingIn') : t('signInButton')}
      </button>
    </div>
  )
}
