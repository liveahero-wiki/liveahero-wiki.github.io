// Contributor account state of the Team Creator page. The session itself belongs to the wiki-cms embed; this hook only
// mirrors it (see api.ts). Nothing here loads the embed until a session exists or the visitor clicks "Sign in".

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { ContribSubmission, ContribUser } from '../cms-plugin/api-types.ts'
import type { T } from '../cms-plugin/i18n/t.ts'
import { SESSION_EVENT, TYPE, MIN_ACCOUNT_AGE_DAYS, currentUser, getContrib, loadedContrib } from './api.ts'
import type { Lang } from './lang.ts'

export interface Account {
  user: ContribUser | null
  /** The signed-in contributor's own submissions; null until loaded. */
  mine: ContribSubmission[] | null
  mineError: boolean
  /** Reloads `mine` (no-op when signed out). */
  refresh(): Promise<void>
  signIn(): Promise<void>
  signOut(): Promise<void>
  /** Localized message of the last failed sign-in, or null. */
  signInError: string | null
}

interface SignInLike {
  code?: string
  eligibleAt?: number | null
}

export function signInErrorText(t: T, lang: Lang, e: unknown): string {
  const code = (e as SignInLike | null)?.code
  if (code === 'popup_blocked') return t('tcPopupBlocked')
  if (code === 'closed') return t('tcSignInClosed')
  if (code === 'account_too_young') {
    const at = (e as SignInLike).eligibleAt
    if (!at) return t('tcTooYoungNoDate', { days: MIN_ACCOUNT_AGE_DAYS })
    return t('tcTooYoung', { days: MIN_ACCOUNT_AGE_DAYS, date: new Date(at).toLocaleDateString(lang) })
  }
  return t('tcSignInFailed')
}

export function useAccount(api: string, t: T, lang: Lang): Account {
  const [user, setUser] = useState<ContribUser | null>(() => currentUser(api))
  const [mine, setMine] = useState<ContribSubmission[] | null>(null)
  const [mineError, setMineError] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const alive = useRef(true)
  useEffect(() => () => void (alive.current = false), [])

  const refresh = useCallback(async () => {
    const u = currentUser(api)
    if (!u) {
      setUser(null)
      setMine(null)
      return
    }
    try {
      const items = await (await getContrib(api)).mine(TYPE, api)
      if (!alive.current) return
      setUser(currentUser(api) ?? u)
      setMine(items)
      setMineError(false)
    } catch (e) {
      if (!alive.current) return
      if ((e as { status?: number } | null)?.status === 401 || !currentUser(api)) {
        setUser(null)
        setMine(null)
      } else {
        setMineError(true)
      }
    }
  }, [api])

  // Initial load, and follow sign-in/out from this page, the form dialog or another tab.
  useEffect(() => {
    void refresh()
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<{ api?: string }>).detail
      if (d?.api === undefined || d.api === api) void refresh()
    }
    const onStorage = (e: StorageEvent) => e.key === `cms-contrib:${api}` && void refresh()
    window.addEventListener(SESSION_EVENT, onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SESSION_EVENT, onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [api, refresh])

  const signIn = useCallback(async () => {
    setSignInError(null)
    try {
      // The popup must open synchronously inside the click: when the embed is already loaded (the toolbar prefetches it
      // on hover/focus/touch), call it before any await. Only a cold click waits for the script, and may be blocked.
      const loaded = loadedContrib()
      await (loaded ? loaded.signIn(api) : getContrib(api).then((c) => c.signIn(api))) // the stored session then triggers `refresh` through the event
    } catch (e) {
      if (alive.current) setSignInError(signInErrorText(t, lang, e))
    }
  }, [api, t, lang])

  const signOut = useCallback(async () => {
    try {
      await (await getContrib(api)).signOut(api)
    } finally {
      if (alive.current) {
        setUser(null)
        setMine(null)
      }
    }
  }, [api])

  return { user, mine, mineError, refresh, signIn, signOut, signInError }
}
