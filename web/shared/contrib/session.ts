// The contributor session as a Preact hook: mirrors the wiki-cms embed's session (sign-in/out from this page, the
// submit form, the editor or another tab) and offers sign in/out. The session itself belongs to the embed.

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { ContribUser } from '../../cms-plugin/api-types.ts'
import { SESSION_EVENT, currentUser, getContrib, loadedContrib, sessionKey } from './embed.ts'
import { signInErrorText, type ContribKey } from './strings.ts'

export interface ContribSession {
  user: ContribUser | null
  /** Resolves true once signed in. */
  signIn(): Promise<boolean>
  signOut(): Promise<void>
  /** Shows the visitor as signed out without asking the embed (e.g. after the API answered 401). */
  forget(): void
  signingIn: boolean
  /** Localized message of the last failed sign-in, or null. */
  signInError: string | null
}

export function useContribSession(api: string, t: (key: ContribKey, params?: Record<string, string | number>) => string, lang: string): ContribSession {
  const [user, setUser] = useState<ContribUser | null>(() => currentUser(api))
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const alive = useRef(true)
  useEffect(() => () => void (alive.current = false), [])

  useEffect(() => {
    const refresh = () => alive.current && setUser(currentUser(api))
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ api?: string }>).detail
      if (d?.api === undefined || d.api === api) refresh()
    }
    const onStorage = (e: StorageEvent) => e.key === sessionKey(api) && refresh()
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
      // The popup must open synchronously inside the click: when the embed is already loaded (prefetchEmbed), call
      // `signIn` before any await. A cold click waits for the script and may be blocked (reported as popup_blocked).
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

  const forget = useCallback(() => setUser(null), [])

  return { user, signIn, signOut, forget, signingIn, signInError }
}
