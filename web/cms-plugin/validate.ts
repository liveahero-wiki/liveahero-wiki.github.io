// Pure mirror of the server's team-formation validator
// (wiki-cms/src/types/lah-team-formation/validate.ts, rules in plan §2.6). Keep both in sync.
//
// Error paths carry the `payload.` prefix (`payload.heroes.2.passives`, `payload.supportIndex`)
// exactly as the server emits them, so the embed can merge client and server errors uniformly.
// The plugin contract comment says "relative to 'payload'", but the server prefixes them; we
// match the server and `setErrors()` accepts both forms.
//
// Kept free of JSX / CSS / path aliases so `node --test` can run it with type stripping.

import type { FieldError } from './plugin-api.ts'
import { parseTargets } from './targets.ts'
import type { Focus, TeamPayload, TeamSlot } from './types.ts'

export const MAX_SLOTS = 5

/** Every error code this validator can emit; each must have a message in every i18n bundle. */
export const ERROR_CODES = [
  'payload_invalid',
  'version_invalid',
  'heroes_length',
  'int_range',
  'bool_invalid',
  'stock_id_invalid',
  'active_same_as_hero',
  'sidekick_same_character',
  'passives_too_many',
  'passives_duplicate',
  'support_not_allowed',
  'support_required',
  'support_out_of_range',
  'duplicate_hero',
  'duplicate_active',
  'focus_missing',
  'unknown_hero',
  'unknown_sidekick',
  'target_unknown',
] as const

export interface GroupLike {
  options: Record<string, unknown>
}

export interface ValidateContext {
  /** The roster JSON (`{ heroes: [{stockId}], sidekicks: [{stockId}] }`); enables the soft existence check. */
  roster?: unknown
}

export type ValidateResult = { ok: true; value: TeamPayload } | { ok: false; errors: FieldError[] }

const err = (path: string, code: string, message: string, params?: FieldError['params']): FieldError => ({
  path,
  code,
  message,
  ...(params ? { params } : {}),
})

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)

/** Malformed focus is ignored (treated as absent). */
export function parseFocus(options: Record<string, unknown>): Focus | null {
  const f = options.focus
  if (f === undefined || f === null) return null
  if (isObj(f) && (f.kind === 'hero' || f.kind === 'sidekick') && isInt(f.stockId) && f.stockId > 0) {
    return { kind: f.kind, stockId: f.stockId }
  }
  return null
}

export type SupportMode = 'required' | 'optional' | 'none'

/** `support`: absent or `true` -> required, `false` -> none, `'optional'` -> optional (null or a valid index). */
export function supportMode(options: Record<string, unknown>): SupportMode {
  const s = options.support
  return s === false ? 'none' : s === 'optional' ? 'optional' : 'required'
}

function readInt(errors: FieldError[], path: string, v: unknown, def: number, min: number, max: number): number {
  if (v === undefined || v === null) return def
  if (!isInt(v) || v < min || v > max) {
    errors.push(err(path, 'int_range', `Must be an integer from ${min} to ${max}.`, { min, max }))
    return def
  }
  return v
}

function readBool(errors: FieldError[], path: string, v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v !== 'boolean') {
    errors.push(err(path, 'bool_invalid', 'Must be true or false.'))
    return false
  }
  return v
}

function readStockId(errors: FieldError[], path: string, v: unknown): number | null {
  if (!isInt(v) || v <= 0) {
    errors.push(err(path, 'stock_id_invalid', 'Must be a positive integer.'))
    return null
  }
  return v
}

function dupGroups(entries: { slot: number; id: number }[]): { id: number; slots: number[] }[] {
  const byId = new Map<number, number[]>()
  for (const e of entries) byId.set(e.id, [...(byId.get(e.id) ?? []), e.slot])
  return [...byId].filter(([, s]) => s.length > 1).map(([id, slots]) => ({ id, slots }))
}

function rosterIds(roster: unknown, key: 'heroes' | 'sidekicks'): Set<number> | null {
  if (!isObj(roster) || !Array.isArray(roster[key])) return null
  const ids = new Set<number>()
  for (const e of roster[key] as unknown[]) if (isObj(e) && isInt(e.stockId)) ids.add(e.stockId)
  return ids.size ? ids : null
}

/** itemIds of the roster's passive-slot items (the roster entries key them by `itemId`, not `stockId`). */
function rosterItemIds(roster: unknown): Set<number> | null {
  if (!isObj(roster) || !Array.isArray(roster.items)) return null
  const ids = new Set<number>()
  for (const e of roster.items as unknown[]) if (isObj(e) && isInt(e.itemId)) ids.add(e.itemId)
  return ids.size ? ids : null
}

/** stockId -> characterId for one roster list; entries without an integer characterId are skipped. */
function rosterCharacters(roster: unknown, key: 'heroes' | 'sidekicks'): Map<number, number> | null {
  if (!isObj(roster) || !Array.isArray(roster[key])) return null
  const map = new Map<number, number>()
  for (const e of roster[key] as unknown[]) if (isObj(e) && isInt(e.stockId) && isInt(e.characterId)) map.set(e.stockId, e.characterId)
  return map.size ? map : null
}

export function validateTeamPayload(input: unknown, group: GroupLike, ctx: ValidateContext = {}): ValidateResult {
  const errors: FieldError[] = []
  if (!isObj(input)) return { ok: false, errors: [err('payload', 'payload_invalid', 'The team formation is malformed.')] }
  if (input.v !== 1) errors.push(err('payload.v', 'version_invalid', 'Unsupported payload version.'))
  if (!Array.isArray(input.heroes) || input.heroes.length < 1 || input.heroes.length > MAX_SLOTS) {
    errors.push(err('payload.heroes', 'heroes_length', `A team has 1 to ${MAX_SLOTS} heroes.`, { min: 1, max: MAX_SLOTS }))
    return { ok: false, errors }
  }

  const slots: TeamSlot[] = []
  input.heroes.forEach((raw: unknown, i: number) => {
    const p = `payload.heroes.${i}`
    if (!isObj(raw)) {
      errors.push(err(p, 'payload_invalid', 'The slot is malformed.'))
      return
    }
    const stockId = readStockId(errors, `${p}.stockId`, raw.stockId)
    const bloom = readBool(errors, `${p}.bloom`, raw.bloom)
    const slot: TeamSlot = {
      stockId: stockId ?? 0,
      lv: readInt(errors, `${p}.lv`, raw.lv, 60, 1, 60),
      plv: readInt(errors, `${p}.plv`, raw.plv, 0, 0, 100),
      fans: readInt(errors, `${p}.fans`, raw.fans, 0, 0, 1000),
      engrave: readInt(errors, `${p}.engrave`, raw.engrave, 0, 0, 1000),
      bloom,
      skillTree: readBool(errors, `${p}.skillTree`, raw.skillTree),
      active: null,
      passives: [],
    }
    if (raw.active !== undefined && raw.active !== null) slot.active = readStockId(errors, `${p}.active`, raw.active)
    if (slot.active !== null && slot.active === stockId) {
      errors.push(err(`${p}.active`, 'active_same_as_hero', 'A hero cannot use its own sidekick card as the active sidekick.'))
    }
    if (slot.skillTree && !bloom) {
      errors.push(err(`${p}.bloom`, 'bloom_required', 'Blooming is required when the skill tree is needed.'))
    }
    const rawPassives = raw.passives ?? []
    if (!Array.isArray(rawPassives)) {
      errors.push(err(`${p}.passives`, 'payload_invalid', 'Passive sidekicks and items must be a list.'))
    } else {
      const max = bloom ? 3 : 2
      if (rawPassives.length > max) {
        errors.push(err(`${p}.passives`, 'passives_too_many', `At most ${max} passive sidekicks or items.`, { max }))
      }
      rawPassives.forEach((v, j) => {
        const id = readStockId(errors, `${p}.passives.${j}`, v)
        if (id !== null) slot.passives.push(id)
      })
      if (new Set(slot.passives).size !== slot.passives.length) {
        errors.push(err(`${p}.passives`, 'passives_duplicate', 'A hero cannot use the same passive sidekick or item twice.'))
      }
    }
    slots.push(slot)
  })

  // Group-driven support rule.
  const mode = supportMode(group.options)
  const rawSupport = input.supportIndex
  let supportIndex: number | null = null
  if (mode === 'none') {
    if (rawSupport !== undefined && rawSupport !== null) {
      errors.push(err('payload.supportIndex', 'support_not_allowed', 'This team does not allow a borrowed support.'))
    }
  } else if (rawSupport === undefined || rawSupport === null) {
    if (mode === 'required') errors.push(err('payload.supportIndex', 'support_required', 'Choose which slot is the borrowed support.'))
  } else if (!isInt(rawSupport) || rawSupport < 0 || rawSupport >= slots.length) {
    errors.push(err('payload.supportIndex', 'support_out_of_range', 'The support slot does not exist.'))
  } else {
    supportIndex = rawSupport
  }

  // Target (optional): absent / null = general purpose, else the id of a listed target (retired ones stay valid).
  let target: string | null = null
  const rawTarget = input.target
  if (rawTarget !== undefined && rawTarget !== null) {
    if (typeof rawTarget === 'string' && parseTargets(group.options).some((t) => t.id === rawTarget)) target = rawTarget
    else errors.push(err('payload.target', 'target_unknown', 'Unknown target.'))
  }

  // Duplicates (the support slot is exempt). `active: null` never counts.
  const counted = slots.map((s, i) => ({ s, i })).filter(({ i }) => i !== supportIndex)
  for (const d of dupGroups(counted.map(({ s, i }) => ({ slot: i + 1, id: s.stockId })))) {
    errors.push(err('payload.heroes', 'duplicate_hero', `Slots ${d.slots.join(', ')} use the same hero.`, { slots: d.slots.join(',') }))
  }
  const actives = counted.flatMap(({ s, i }) => (s.active === null ? [] : [{ slot: i + 1, id: s.active }]))
  for (const d of dupGroups(actives)) {
    errors.push(err('payload.heroes', 'duplicate_active', `Slots ${d.slots.join(', ')} use the same active sidekick.`, { slots: d.slots.join(',') }))
  }

  // Focus card (card groups only).
  const focus = parseFocus(group.options)
  if (focus) {
    const ok = slots.some((s) =>
      focus.kind === 'hero' ? s.stockId === focus.stockId : s.active === focus.stockId || s.passives.includes(focus.stockId),
    )
    if (!ok) {
      errors.push(err('payload.heroes', 'focus_missing', `The team must include this page's ${focus.kind}.`, { kind: focus.kind, stockId: focus.stockId }))
    }
  }

  // Soft roster existence check: only when the roster was fetched.
  const heroIds = rosterIds(ctx.roster, 'heroes')
  const sidekickIds = rosterIds(ctx.roster, 'sidekicks')
  const itemIds = rosterItemIds(ctx.roster) // passives may also be skill-book items
  slots.forEach((s, i) => {
    if (heroIds && s.stockId && !heroIds.has(s.stockId)) {
      errors.push(err(`payload.heroes.${i}.stockId`, 'unknown_hero', 'Unknown hero.', { stockId: s.stockId }))
    }
    if (sidekickIds) {
      if (s.active !== null && !sidekickIds.has(s.active)) {
        errors.push(err(`payload.heroes.${i}.active`, 'unknown_sidekick', 'Unknown sidekick.', { stockId: s.active }))
      }
      s.passives.forEach((id, j) => {
        if (!sidekickIds.has(id) && !itemIds?.has(id)) errors.push(err(`payload.heroes.${i}.passives.${j}`, 'unknown_sidekick', 'Unknown sidekick or item.', { stockId: id }))
      })
    }
  })

  // A hero cannot equip a sidekick of its own character (active or passive). Needs the roster's
  // stockId -> characterId mapping; the active slot's plain same-card case is caught above without it.
  const heroChars = rosterCharacters(ctx.roster, 'heroes')
  const sidekickChars = rosterCharacters(ctx.roster, 'sidekicks')
  if (heroChars && sidekickChars) {
    slots.forEach((s, i) => {
      const heroChar = heroChars.get(s.stockId)
      if (heroChar === undefined) return
      const sameChar = (id: number) => sidekickChars.get(id) === heroChar
      if (s.active !== null && s.active !== s.stockId && sameChar(s.active)) {
        errors.push(err(`payload.heroes.${i}.active`, 'sidekick_same_character', 'A hero cannot equip a sidekick of its own character.', { stockId: s.active }))
      }
      s.passives.forEach((id, j) => {
        if (sameChar(id)) {
          errors.push(err(`payload.heroes.${i}.passives.${j}`, 'sidekick_same_character', 'A hero cannot equip a sidekick of its own character.', { stockId: id }))
        }
      })
    })
  }

  if (errors.length) return { ok: false, errors }
  return { ok: true, value: { v: 1, supportIndex, heroes: slots, ...(target !== null ? { target } : {}) } }
}

/** `validate()` flavour used by the editor handle: just the error list. */
export function validateTeam(input: unknown, options: Record<string, unknown>, roster?: unknown): FieldError[] {
  const r = validateTeamPayload(input, { options }, { roster })
  return r.ok ? [] : r.errors
}
