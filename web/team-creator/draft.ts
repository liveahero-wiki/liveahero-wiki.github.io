// The team being built on the page, remembered in localStorage. Storage can be missing or throw (private windows,
// blocked site data), so every access is guarded and the builder works without it.

import type { TeamPayload } from '../cms-plugin/types.ts'

const KEY = 'lah-tc-draft'

const isTeam = (v: unknown): v is TeamPayload =>
  typeof v === 'object' && v !== null && (v as TeamPayload).v === 1 && Array.isArray((v as TeamPayload).heroes)

export function loadDraft(): TeamPayload | null {
  try {
    const raw = localStorage.getItem(KEY)
    const v: unknown = raw ? JSON.parse(raw) : null
    return isTeam(v) ? v : null
  } catch {
    return null
  }
}

export function saveDraft(team: TeamPayload): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(team))
  } catch {
    /* no storage: the team just is not remembered */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* see saveDraft */
  }
}

/** Nothing worth keeping: at most one slot, still on its defaults. */
export function isBlankTeam(team: TeamPayload | null): boolean {
  if (!team) return true
  if (team.heroes.length > 1 || team.target) return false
  const s = team.heroes[0]
  if (!s) return true
  return !s.stockId && (s.lv ?? 60) === 60 && !s.plv && !s.fans && !s.engrave && !s.bloom && !s.skillTree && s.active == null && !s.passives?.length
}
