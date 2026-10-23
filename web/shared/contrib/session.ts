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
    // Callable while a sign-in waits: a provider popup that lost its link to this page (Google's) cannot be seen closing, so
    // signing in again is how the visitor abandons it. The embed then rejects the old call with `superseded`.
    setSignInError(null)
    setSigningIn(true)
    try {
      // The embed shows its provider picker (last used provider first) and opens the popup from the click on a provider
      // there, so a cold click that has to load the embed first is fine too. `lang` localizes the picker and its name dialog.
      const loaded = loadedContrib()
      const session = await (loaded ? loaded.signIn(api, { lang }) : getContrib(api).then((c) => c.signIn(api, { lang })))
      if (alive.current) {
        setUser(session.user)
        setSigningIn(false)
      }
      return true
    } catch (e) {
      const code = (e as { code?: unknown } | null)?.code
      if (code === 'superseded') return false // the newer sign-in owns the busy state and the error
      if (alive.current) {
        setSigningIn(false)
        if (code !== 'cancelled') setSignInError(signInErrorText(t, lang, e)) // a dismissed picker is not an error
      }
      return false
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
