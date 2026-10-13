// Tolerant read-side helpers: the summary/detail views receive server-approved payloads, but must
// not crash on a payload from an older/newer shape.

import type { Focus, TeamPayload, TeamSlot } from './types.ts'

const num = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) ? v : def)
const id = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : null)

export function emptySlot(): TeamSlot {
  return { stockId: 0, lv: 60, plv: 0, fans: 0, engrave: 0, bloom: false, skillTree: false, active: null, passives: [] }
}

export function toViewSlots(payload: unknown): { slots: TeamSlot[]; supportIndex: number | null } {
  const p = (payload ?? {}) as Partial<TeamPayload>
  const heroes = Array.isArray(p.heroes) ? p.heroes : []
  const slots = heroes.map((raw): TeamSlot => {
    const r = (raw ?? {}) as Partial<TeamSlot>
    return {
      stockId: num(r.stockId, 0),
      lv: num(r.lv, 60),
      plv: num(r.plv, 0),
      fans: num(r.fans, 0),
      engrave: num(r.engrave, 0),
      bloom: r.bloom === true,
      skillTree: r.skillTree === true,
      active: id(r.active),
      passives: Array.isArray(r.passives) ? r.passives.map(id).filter((x): x is number => x !== null) : [],
    }
  })
  const si = typeof p.supportIndex === 'number' && Number.isInteger(p.supportIndex) ? p.supportIndex : null
  return { slots, supportIndex: si !== null && si >= 0 && si < slots.length ? si : null }
}

/** Is this card the page's focus card? (used for the subtle highlight) */
export const isFocusCard = (focus: Focus | null, kind: 'hero' | 'sidekick', cardId: number): boolean =>
  !!focus && focus.kind === kind && focus.stockId === cardId

/** The payload's target id, or null (general purpose; also for anything that is not a non-empty string). */
export function toViewTarget(payload: unknown): string | null {
  const t = (payload as { target?: unknown } | null | undefined)?.target
  return typeof t === 'string' && t ? t : null
}
