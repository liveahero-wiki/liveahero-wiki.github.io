// The team being built on the page, remembered in localStorage. Storage can be missing or throw (private windows,
// blocked site data), so every access is guarded; the draft is then kept in memory for the life of the page, so the
// builder and "Edit a copy" still work without it.

import { defaultTeamPayload } from '../cms-plugin/default-team.ts'
import { sortedJson } from '../cms-plugin/editor-state.ts'
import type { Roster } from '../cms-plugin/roster.ts'
import type { TeamPayload } from '../cms-plugin/types.ts'
import { MAX_SLOTS, validateTeamPayload } from '../cms-plugin/validate.ts'

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

/** Nothing worth keeping: the untouched default team, or at most one slot still on its defaults. */
export function isBlankTeam(team: TeamPayload | null): boolean {
  if (!team) return true
  if (sortedJson(team) === sortedJson(defaultTeamPayload())) return true
  if (team.heroes.length > 1 || team.target || team.supportIndex != null) return false
  const s = team.heroes[0]
  if (!s) return true
  return !s.stockId && (s.lv ?? 60) === 60 && !s.plv && !s.fans && !s.engrave && !s.bloom && !s.skillTree && s.active == null && !s.passives?.length
}

/**
 * The team of a published submission, to start a new one from ("Remix"): a validated copy that shares nothing with the
 * list, or null when it no longer passes the validator (the draft must not be replaced by a bad team). Only the team is
 * taken: the title, tags, video link and explanation belong to the submission, not to the payload.
 */
export function remixTeam(payload: unknown, options: Record<string, unknown>, roster?: Roster): TeamPayload | null {
  const checked = validateTeamPayload(payload, { options }, roster ? { roster } : {})
  return checked.ok ? structuredClone(checked.value) : null
}
