// Contributor account state of the Team Creator page: the shared contributor session (web/shared/contrib/session.ts)
// plus the contributor's own submissions. Nothing here loads the embed until a session exists or the visitor clicks
// "Sign in".

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { ContribSubmission } from '../cms-plugin/api-types.ts'
import type { T } from '../cms-plugin/i18n/t.ts'
import { currentUser, getContrib } from '../shared/contrib/embed.ts'
import { useContribSession, type ContribSession } from '../shared/contrib/session.ts'
import type { Lang } from '../shared/lang.ts'
import { TYPE } from './api.ts'

export interface Account extends ContribSession {
  /** The signed-in contributor's own submissions; null until loaded. */
  mine: ContribSubmission[] | null
  mineError: boolean
  /** Reloads `mine` (no-op when signed out). */
  refresh(): Promise<void>
}

export function useAccount(api: string, t: T, lang: Lang): Account {
  const session = useContribSession(api, t, lang)
  const { user, forget } = session
  const [mine, setMine] = useState<ContribSubmission[] | null>(null)
  const [mineError, setMineError] = useState(false)
  const alive = useRef(true)
  useEffect(() => () => void (alive.current = false), [])

  const refresh = useCallback(async () => {
    if (!currentUser(api)) {
      setMine(null)
      return
    }
    try {
      const items = await (await getContrib(api)).mine(TYPE, api)
      if (!alive.current) return
      setMine(items)
      setMineError(false)
    } catch (e) {
      if (!alive.current) return
      if ((e as { status?: number } | null)?.status === 401 || !currentUser(api)) {
        forget()
        setMine(null)
      } else {
        setMineError(true)
      }
    }
  }, [api, forget])

  // Initial load, and reload on every sign-in/out from this page, the form dialog or another tab.
  useEffect(() => void refresh(), [refresh, user])

  return { ...session, mine, mineError, refresh }
}
