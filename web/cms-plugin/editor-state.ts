// Pure editor state and transitions (no Preact), so they can be unit-tested with node's type stripping.
// The editor always shows MAX_SLOTS rows, like the game's formation screen. A row with a hero is "filled"; the empty rows
// are skipped when the team is emitted, as the game does when the battle starts, so the payload is the recompacted team.
// Rows carry a stable `key`; the borrowed support is stored as that key, so it follows its row through reorders and the
// payload's `supportIndex` is derived on every emit. Whether the team borrows a support at all is a separate flag
// (`supportOn`), so switching it off and on again remembers the row.

import type { FieldError } from './plugin-api.ts'
import { DEFAULT_HERO_ID, DEFAULT_SUPPORT_ROW } from './default-team.ts'
import type { TeamPayload, TeamSlot } from './types.ts'
import { DEFAULT_PW_FORM, MAX_SLOTS, parseFocus, supportMode } from './validate.ts'
import { emptySlot, toViewSlots, toViewTarget } from './view.ts'

export interface Slot extends TeamSlot {
  /** Stable identity across reorders. */
  key: number
}

export interface State {
  slots: Slot[]
  /** The team borrows a support. Always false in mode `none`, always true in mode `required`. */
  supportOn: boolean
  /** Row carrying the borrowed support role (kept while `supportOn` is off). It only counts while that row has a hero. */
  supportKey: number | null
  /** Id of the chosen target; null = general purpose. */
  target: string | null
}

let keySeq = 0
export const newSlot = (): Slot => ({ ...emptySlot(), key: ++keySeq })

/** Passive sidekick slots available without blooming. */
export const BASE_PASSIVES = 2
/** With blooming (a third passive slot). */
export const MAX_PASSIVES = 3

/** Bloom is not a form field: it is implied by a 3rd passive or by a needed skill tree. */
export const impliesBloom = (s: Pick<TeamSlot, 'skillTree' | 'passives'>): boolean => s.skillTree || s.passives.length > BASE_PASSIVES

/** `pwForm` exists only with P.Lv > 0 (defaulting to Base Design), mirroring the validator's normalization. */
const stripSlot = ({ key: _key, pwForm, ...rest }: Slot): TeamSlot => ({
  ...rest,
  ...(rest.plv > 0 ? { pwForm: pwForm ?? DEFAULT_PW_FORM } : {}),
  bloom: impliesBloom(rest),
  passives: [...rest.passives],
})

export const isFilled = (s: Pick<Slot, 'stockId'>): boolean => s.stockId !== 0

/** Rows (0-based) that make it into the payload, in order. */
export const payloadRows = (s: State): number[] => s.slots.flatMap((x, i) => (isFilled(x) ? [i] : []))

/** Per row, the battle slot (1-based) it takes once the empty rows are skipped; null for a skipped row. */
export function battleSlots(s: State): (number | null)[] {
  let n = 0
  return s.slots.map((x) => (isFilled(x) ? ++n : null))
}

/**
 * The payload of the team: filled rows only (one empty row when there is none, so the validator still asks for a hero).
 * The support is the filled row that has the role; an empty support row means no support.
 */
export function toPayload(state: State, allowsSupport: boolean): TeamPayload {
  const rows = payloadRows(state)
  const heroes = rows.length ? rows.map((i) => stripSlot(state.slots[i])) : [stripSlot(newSlot())]
  const idx = allowsSupport && state.supportOn && state.supportKey !== null ? rows.findIndex((i) => state.slots[i].key === state.supportKey) : -1
  return { v: 1, supportIndex: idx >= 0 ? idx : null, heroes, ...(state.target ? { target: state.target } : {}) }
}

/**
 * Build the editor state from an incoming payload, applying the group's rules where possible. Heroes go to the first
 * rows (the rest are padded empty); the support's row keeps the role. A payload without any hero is a blank team and
 * becomes the default team: Akashi in row 1 and the support role on row 4. Mode `none` has no support role; in mode
 * `optional` a team without a support starts with the switch off and the role remembered on row 4.
 */
export function initState(value: unknown, options: Record<string, unknown>): State {
  const mode = supportMode(options)
  const view = toViewSlots(value)
  const given = view.slots.slice(0, MAX_SLOTS).map((x) => ({ ...x, key: ++keySeq }))
  const blank = !given.some(isFilled)
  const slots: Slot[] = blank ? [{ ...newSlot(), stockId: DEFAULT_HERO_ID }] : given
  while (slots.length < MAX_SLOTS) slots.push(newSlot())
  // A new/empty editor on a hero card page starts with that hero in row 1.
  const focus = parseFocus(options)
  if (blank && focus?.kind === 'hero') slots[0].stockId = focus.stockId
  let supportOn = false
  let supportKey: number | null = null
  if (mode !== 'none') {
    const defaultKey = slots[DEFAULT_SUPPORT_ROW].key
    if (blank) {
      supportOn = true
      supportKey = defaultKey
    } else if (view.supportIndex !== null && view.supportIndex < given.length) {
      supportOn = true
      supportKey = given[view.supportIndex].key
    } else if (mode === 'required') supportOn = true // no row chosen yet: the validator asks for one
    else supportKey = defaultKey
  }
  return { slots, supportOn, supportKey, target: toViewTarget(value) }
}

export const patchSlot = (s: State, key: number, patch: Partial<TeamSlot>): State =>
  s.slots.some((x) => x.key === key) ? { ...s, slots: s.slots.map((x) => (x.key === key ? { ...x, ...patch } : x)) } : s

/** Empties a row (hero, sidekicks, levels back to the defaults). It keeps its key, so a support role stays on the row. */
export const clearSlot = (s: State, key: number): State => (s.slots.some((x) => x.key === key) ? { ...s, slots: s.slots.map((x) => (x.key === key ? { ...emptySlot(), key } : x)) } : s)

export function moveSlot(s: State, from: number, to: number): State {
  if (from === to || from < 0 || to < 0 || from >= s.slots.length || to >= s.slots.length) return s
  const slots = [...s.slots]
  const [moved] = slots.splice(from, 1)
  slots.splice(to, 0, moved)
  return { ...s, slots }
}

/** Gives the support role to a row (and so switches the support on). */
export const setSupportRow = (s: State, key: number): State => (s.slots.some((x) => x.key === key) ? { ...s, supportOn: true, supportKey: key } : s)

/** Switches the borrowed support on or off. Switching on without a remembered row picks the default one (row 4). */
export function setSupportOn(s: State, on: boolean): State {
  if (s.supportOn === on) return s
  const key = s.supportKey ?? s.slots[Math.min(DEFAULT_SUPPORT_ROW, s.slots.length - 1)]?.key ?? null
  return { ...s, supportOn: on, supportKey: on ? key : s.supportKey }
}

export const selectTarget = (s: State, target: string | null): State => ({ ...s, target: target || null })

/** Key-order independent JSON, to tell whether normalizing changed the incoming payload. */
export const sortedJson = (v: unknown): string =>
  JSON.stringify(v, (_k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x))

// ---- error bookkeeping ------------------------------------------------------------------------------

/** Accept both `payload.heroes.1.lv` (server) and `heroes.1.lv`; '' means the payload itself. */
export function relPath(path: string): string {
  if (path === 'payload') return ''
  return path.startsWith('payload.') ? path.slice('payload.'.length) : path
}

export interface SortedErrors {
  team: FieldError[]
  support: FieldError[]
  target: FieldError[]
  /** slot index -> field ('' = the slot itself) -> errors */
  slots: Map<number, Map<string, FieldError[]>>
}

/** `rows` = `payloadRows(state)`: payload hero index -> editor row (a team without a hero has its one empty row at index 0). */
export function sortErrors(errors: FieldError[], rows: readonly number[]): SortedErrors {
  const out: SortedErrors = { team: [], support: [], target: [], slots: new Map() }
  for (const e of errors) {
    const parts = relPath(e.path).split('.')
    if (parts[0] === 'supportIndex') out.support.push(e)
    else if (parts[0] === 'target') out.target.push(e)
    else if (parts[0] === 'heroes' && /^\d+$/.test(parts[1] ?? '')) {
      const i = rows.length ? rows[Number(parts[1])] : 0
      if (i === undefined) continue
      const m = out.slots.get(i) ?? new Map<string, FieldError[]>()
      const field = parts[2] ?? ''
      m.set(field, [...(m.get(field) ?? []), e])
      out.slots.set(i, m)
    } else out.team.push(e)
  }
  return out
}
