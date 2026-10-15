// Pure editor state and transitions (no Preact), so they can be unit-tested with node's type stripping.
// Slots carry a stable `key`; the support selection is stored as that key, so it follows its slot
// through reorders and the payload's `supportIndex` is derived on every emit.

import type { FieldError } from './plugin-api.ts'
import type { TeamPayload, TeamSlot } from './types.ts'
import { DEFAULT_PW_FORM, MAX_SLOTS, parseFocus, supportMode } from './validate.ts'
import { emptySlot, toViewSlots, toViewTarget } from './view.ts'

export interface Slot extends TeamSlot {
  /** Stable identity across reorders. */
  key: number
}

export interface State {
  slots: Slot[]
  supportKey: number | null
  /** True while the support selection was made automatically (it then follows the newest slot; mode `required` only). */
  supportAuto: boolean
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

export function toPayload(state: State, allowsSupport: boolean): TeamPayload {
  const idx = allowsSupport && state.supportKey !== null ? state.slots.findIndex((s) => s.key === state.supportKey) : -1
  return { v: 1, supportIndex: idx >= 0 ? idx : null, heroes: state.slots.map(stripSlot), ...(state.target ? { target: state.target } : {}) }
}

/**
 * Build the editor state from an incoming payload, applying the group's rules where possible. Support
 * mode `required` auto-selects the last slot (until the user chooses); `optional` never selects one by
 * itself; `none` has no support slot.
 */
export function initState(value: unknown, options: Record<string, unknown>): State {
  const mode = supportMode(options)
  const view = toViewSlots(value)
  const slots: Slot[] = (view.slots.length ? view.slots : [emptySlot()]).slice(0, MAX_SLOTS).map((s) => ({ ...s, key: ++keySeq }))
  // A new/empty editor on a hero card page starts with that hero in slot 1.
  const focus = parseFocus(options)
  if (focus?.kind === 'hero' && slots.length === 1 && slots[0].stockId === 0) slots[0].stockId = focus.stockId
  let supportKey: number | null = null
  let supportAuto = false
  if (mode !== 'none') {
    if (view.supportIndex !== null && view.supportIndex < slots.length) supportKey = slots[view.supportIndex].key
    else if (mode === 'required') {
      supportKey = slots[slots.length - 1].key
      supportAuto = true
    }
  }
  return { slots, supportKey, supportAuto, target: toViewTarget(value) }
}

/** Appends an empty slot; with `autoSupport` (mode `required`) an unset or auto-chosen support moves to the new last slot. */
export function addSlot(s: State, autoSupport: boolean, slot: Slot = newSlot()): State {
  if (s.slots.length >= MAX_SLOTS) return s
  const follow = autoSupport && (s.supportKey === null || s.supportAuto)
  return { ...s, slots: [...s.slots, slot], supportKey: follow ? slot.key : s.supportKey, supportAuto: follow ? true : s.supportAuto }
}

/** Removing the support slot clears the selection (the next add picks the new last slot again). */
export function removeSlot(s: State, key: number): State {
  if (s.slots.length <= 1) return s
  const lost = s.supportKey === key
  return { ...s, slots: s.slots.filter((x) => x.key !== key), supportKey: lost ? null : s.supportKey, supportAuto: lost ? true : s.supportAuto }
}

export function moveSlot(s: State, from: number, to: number): State {
  if (from === to || from < 0 || to < 0 || from >= s.slots.length || to >= s.slots.length) return s
  const slots = [...s.slots]
  const [moved] = slots.splice(from, 1)
  slots.splice(to, 0, moved)
  return { ...s, slots }
}

export const selectSupport = (s: State, key: number): State => ({ ...s, supportKey: key, supportAuto: false })

/** "No borrowed support" (mode `optional`): stays cleared, adding a slot does not pick one again. */
export const clearSupport = (s: State): State => ({ ...s, supportKey: null, supportAuto: false })

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

export function sortErrors(errors: FieldError[]): SortedErrors {
  const out: SortedErrors = { team: [], support: [], target: [], slots: new Map() }
  for (const e of errors) {
    const parts = relPath(e.path).split('.')
    if (parts[0] === 'supportIndex') out.support.push(e)
    else if (parts[0] === 'target') out.target.push(e)
    else if (parts[0] === 'heroes' && /^\d+$/.test(parts[1] ?? '')) {
      const i = Number(parts[1])
      const m = out.slots.get(i) ?? new Map<string, FieldError[]>()
      const field = parts[2] ?? ''
      m.set(field, [...(m.get(field) ?? []), e])
      out.slots.set(i, m)
    } else out.team.push(e)
  }
  return out
}
