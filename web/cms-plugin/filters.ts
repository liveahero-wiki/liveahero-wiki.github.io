// Catalog filters of the Team Creator page (web/team-creator): state, hash params and the
// pure matcher. No JSX / CSS, so `node --test` runs it with type stripping.
//
// Rules (docs/CMS.md):
// - `targets`: any of; empty = all. A team without a target never matches a non-empty target filter.
// - `heroIn` / `skIn`: the team must use every listed hero / active sidekick (AND); `heroOut` / `skOut`:
//   it must use none of them. `sk*` look at active sidekicks only (the passives are not filtered).
// - Every slot counts, the borrowed support slot included (a viewer may own the unit that the submitter
//   borrowed, and borrow a different one). `tree: false` hides a team if any slot needs the skill tree,
//   `bloom: false` the same for blooming, and `maxLimited` caps the number of limited-time heroes.

import { toViewSlots, toViewTarget } from './view.ts'
import type { Roster } from './roster.ts'

export const MAX_SLOTS = 5
/** Most ids kept per list when reading a hash (the hash is user input). */
export const MAX_IDS = 12
const MAX_TARGETS = 12

export interface FilterState {
  /** Target ids, any of; [] = all. */
  targets: string[]
  heroIn: number[]
  heroOut: number[]
  skIn: number[]
  skOut: number[]
  /** false = hide teams that need a skill tree in any slot. */
  tree: boolean
  /** false = hide teams that use blooming in any slot. */
  bloom: boolean
  /** 0..5: at most this many limited-time heroes (5 = no limit). */
  maxLimited: number
}

export const defaultFilterState = (): FilterState => ({
  targets: [],
  heroIn: [],
  heroOut: [],
  skIn: [],
  skOut: [],
  tree: true,
  bloom: true,
  maxLimited: MAX_SLOTS,
})

/** The hash keys the plugin owns (the core reserves `q`, `sort`, `lang` and `t.*`). */
export const HASH_KEYS = ['target', 'hero', 'xhero', 'sk', 'xsk', 'tree', 'bloom', 'lim'] as const

export type IdListKey = 'heroIn' | 'heroOut' | 'skIn' | 'skOut'

// ---- hash <-> state ---------------------------------------------------------------------------------

const uniq = <T>(xs: T[]): T[] => [...new Set(xs)]

function readIds(params: URLSearchParams, key: string): number[] {
  const raw = params.get(key)
  if (!raw) return []
  const ids = raw.split(',').map((s) => (/^\d{1,9}$/.test(s.trim()) ? Number(s) : 0)).filter((n) => n > 0)
  return uniq(ids).slice(0, MAX_IDS)
}

function readTargets(params: URLSearchParams): string[] {
  const raw = params.get('target')
  if (!raw) return []
  return uniq(raw.split(',').map((s) => s.trim()).filter((s) => /^[a-z0-9][a-z0-9-]{0,63}$/.test(s))).slice(0, MAX_TARGETS)
}

/** Lenient: anything unparseable falls back to the default. A hero in both `hero` and `xhero` stays included. */
export function parseParams(params: URLSearchParams): FilterState {
  const s = defaultFilterState()
  s.targets = readTargets(params)
  s.heroIn = readIds(params, 'hero')
  s.heroOut = readIds(params, 'xhero').filter((id) => !s.heroIn.includes(id))
  s.skIn = readIds(params, 'sk')
  s.skOut = readIds(params, 'xsk').filter((id) => !s.skIn.includes(id))
  s.tree = params.get('tree') !== '0'
  s.bloom = params.get('bloom') !== '0'
  const lim = params.get('lim')
  if (lim !== null && /^\d$/.test(lim) && Number(lim) <= MAX_SLOTS) s.maxLimited = Number(lim)
  return s
}

/** Non-default values only. */
export function toParams(state: FilterState): Record<string, string> {
  const out: Record<string, string> = {}
  if (state.targets.length) out.target = state.targets.join(',')
  if (state.heroIn.length) out.hero = state.heroIn.join(',')
  if (state.heroOut.length) out.xhero = state.heroOut.join(',')
  if (state.skIn.length) out.sk = state.skIn.join(',')
  if (state.skOut.length) out.xsk = state.skOut.join(',')
  if (!state.tree) out.tree = '0'
  if (!state.bloom) out.bloom = '0'
  if (state.maxLimited < MAX_SLOTS) out.lim = String(state.maxLimited)
  return out
}

// ---- state transitions (used by the panel) ----------------------------------------------------------

export function toggleTarget(state: FilterState, id: string): FilterState {
  return { ...state, targets: state.targets.includes(id) ? state.targets.filter((t) => t !== id) : [...state.targets, id] }
}

const OPPOSITE: Record<IdListKey, IdListKey> = { heroIn: 'heroOut', heroOut: 'heroIn', skIn: 'skOut', skOut: 'skIn' }

/** Adds an id to a list; it leaves the opposite list (a unit cannot be both required and excluded). */
export function addId(state: FilterState, key: IdListKey, id: number): FilterState {
  if (state[key].includes(id) || state[key].length >= MAX_IDS) return state
  return { ...state, [key]: [...state[key], id], [OPPOSITE[key]]: state[OPPOSITE[key]].filter((x) => x !== id) }
}

export const removeId = (state: FilterState, key: IdListKey, id: number): FilterState => ({ ...state, [key]: state[key].filter((x) => x !== id) })

export const setMaxLimited = (state: FilterState, n: number): FilterState => ({
  ...state,
  maxLimited: Math.min(MAX_SLOTS, Math.max(0, Math.trunc(Number.isFinite(n) ? n : MAX_SLOTS))),
})

/** Filters of the "advanced" part that are not at their default (the basic part is always visible). */
export function activeCount(state: FilterState): number {
  return (state.tree ? 0 : 1) + (state.bloom ? 0 : 1) + (state.maxLimited < MAX_SLOTS ? 1 : 0)
}

// ---- matching ---------------------------------------------------------------------------------------

type Limited = Pick<Roster, 'hero'> | null | undefined

/** Heroes flagged `limited` in the roster over every slot, the support slot included. 0 without a roster. */
export function limitedCount(payload: unknown, roster: Limited): number {
  if (!roster) return 0
  let n = 0
  for (const slot of toViewSlots(payload).slots) if (roster.hero(slot.stockId)?.limited === true) n++
  return n
}

export function testPayload(payload: unknown, state: FilterState, roster: Limited): boolean {
  if (state.targets.length) {
    const target = toViewTarget(payload)
    if (target === null || !state.targets.includes(target)) return false
  }
  const { slots } = toViewSlots(payload)
  if (!state.tree && slots.some((s) => s.skillTree)) return false
  if (!state.bloom && slots.some((s) => s.bloom)) return false
  if (state.heroIn.length || state.heroOut.length) {
    const heroes = new Set(slots.map((s) => s.stockId))
    if (!state.heroIn.every((id) => heroes.has(id))) return false
    if (state.heroOut.some((id) => heroes.has(id))) return false
  }
  if (state.skIn.length || state.skOut.length) {
    const actives = new Set(slots.flatMap((s) => (s.active === null ? [] : [s.active])))
    if (!state.skIn.every((id) => actives.has(id))) return false
    if (state.skOut.some((id) => actives.has(id))) return false
  }
  if (state.maxLimited < MAX_SLOTS && limitedCount(payload, roster) > state.maxLimited) return false
  return true
}
