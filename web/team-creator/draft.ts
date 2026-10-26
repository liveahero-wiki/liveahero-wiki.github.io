// The team being built on the page, remembered in localStorage. Storage can be missing or throw (private windows,
// blocked site data), so every access is guarded; the draft is then kept in memory for the life of the page, so the
// builder and "Edit a copy" still work without it.

import type { TeamPayload } from '../cms-plugin/types.ts'
import { MAX_SLOTS } from '../cms-plugin/validate.ts'

const KEY = 'lah-tc-draft'

/** The latest draft, used instead of storage once storage has failed. */
let memory: TeamPayload | null = null
let storageFailed = false

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Shape only (the editor and the share encoder index into these); the validator judges the values. */
const isSlot = (s: unknown): boolean => isObj(s) && typeof s.stockId === 'number' && Array.isArray(s.passives)

const isTeam = (v: unknown): v is TeamPayload =>
  isObj(v) && v.v === 1 && Array.isArray(v.heroes) && v.heroes.length >= 1 && v.heroes.length <= MAX_SLOTS && v.heroes.every(isSlot)

export function loadDraft(): TeamPayload | null {
  if (storageFailed) return memory
  try {
    const raw = localStorage.getItem(KEY)
    const v: unknown = raw ? JSON.parse(raw) : null
    return isTeam(v) ? v : null
  } catch (e) {
    // Unreadable JSON is a bad draft; a storage that throws (or is missing) is the memory fallback.
    return e instanceof SyntaxError ? null : memory
  }
}

export function saveDraft(team: TeamPayload): void {
  memory = team
  try {
    localStorage.setItem(KEY, JSON.stringify(team))
    storageFailed = false
  } catch {
    storageFailed = true
  }
}

export function clearDraft(): void {
  memory = null
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* see saveDraft */
  }
}

/** Nothing worth keeping: at most one slot, still on its defaults. */
export function isBlankTeam(team: TeamPayload | null): boolean {
  if (!team) return true
  if (team.heroes.length > 1 || team.target || team.supportIndex != null) return false
  const s = team.heroes[0]
  if (!s) return true
  return !s.stockId && (s.lv ?? 60) === 60 && !s.plv && !s.fans && !s.engrave && !s.bloom && !s.skillTree && s.active == null && !s.passives?.length
}
