// Shareable team links: a team (and its target) packed into the `?team=` query parameter of the Team Creator page.
//
// The binary layout is a public contract: links live in chats and forum posts for years, so a layout change must
// bump VERSION and keep decoding the old one. Free of JSX/DOM so `node --test` can run it with type stripping.
//
//   byte    version (1)
//   byte    bits 0-2 slot count (1-5), bits 3-5 support slot index + 1 (0 = none), bit 6 has target
//   [target: varint length, then that many ASCII bytes]
//   per slot:
//     varint  stockId
//     byte    bit 0 skillTree, bit 1 bloom, bits 2-3 pwForm index (PW_FORMS), bit 4 has active, bits 5-6 passive count (0-3)
//     varint  lv, plv, fans, engrave
//     [varint active]
//     varint  passive * count

import type { TeamPayload, TeamSlot } from '../cms-plugin/types.ts'
import { DEFAULT_PW_FORM, MAX_SLOTS, PW_FORMS } from '../cms-plugin/validate.ts'

const VERSION = 1
export const SHARE_PARAM = 'team'

const MAX_VARINT_BYTES = 5 // up to 2^35: far above any id or stat, and bounds a hostile input
const MAX_TARGET_BYTES = 64

export type DecodeResult = { ok: true; value: TeamPayload } | { ok: false; reason: 'malformed' | 'version' }

// ---- bytes <-> base64url ----

const toBase64Url = (bytes: number[]): string => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')

function fromBase64Url(s: string): number[] | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) return null
  try {
    return Array.from(atob(s.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0))
  } catch {
    return null
  }
}

// ---- varints (LEB128, unsigned) ----

function pushVarint(out: number[], n: number): void {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`cannot encode ${n}`)
  while (n >= 0x80) {
    out.push((n % 0x80) | 0x80)
    n = Math.floor(n / 0x80)
  }
  out.push(n)
}

class Reader {
  pos = 0
  private bytes: number[]
  constructor(bytes: number[]) {
    this.bytes = bytes
  }
  get done(): boolean {
    return this.pos >= this.bytes.length
  }
  byte(): number {
    if (this.done) throw new RangeError('truncated')
    return this.bytes[this.pos++]
  }
  varint(): number {
    let n = 0
    for (let i = 0; i < MAX_VARINT_BYTES; i++) {
      const b = this.byte()
      n += (b & 0x7f) * 2 ** (7 * i)
      if (!(b & 0x80)) return n
    }
    throw new RangeError('varint too long')
  }
}

// ---- team <-> string ----

/** The team must already satisfy the validator (1-5 slots, at most 3 passives, ...); throws RangeError otherwise. */
export function encodeTeam(team: TeamPayload): string {
  const n = team.heroes.length
  if (n < 1 || n > MAX_SLOTS) throw new RangeError('slot count')
  const support = team.supportIndex === null ? 0 : team.supportIndex + 1
  if (support > n) throw new RangeError('support index')
  const target = team.target ?? ''
  if (target.length > MAX_TARGET_BYTES || !/^[\x20-\x7e]*$/.test(target)) throw new RangeError('target')

  const out: number[] = [VERSION, n | (support << 3) | (target ? 1 << 6 : 0)]
  if (target) {
    pushVarint(out, target.length)
    for (let i = 0; i < target.length; i++) out.push(target.charCodeAt(i))
  }
  for (const s of team.heroes) {
    if (s.passives.length > 3) throw new RangeError('passives')
    const pw = Math.max(0, (PW_FORMS as readonly number[]).indexOf(s.pwForm ?? DEFAULT_PW_FORM))
    pushVarint(out, s.stockId)
    out.push((s.skillTree ? 1 : 0) | (s.bloom ? 2 : 0) | (pw << 2) | (s.active !== null ? 1 << 4 : 0) | (s.passives.length << 5))
    pushVarint(out, s.lv)
    pushVarint(out, s.plv)
    pushVarint(out, s.fans)
    pushVarint(out, s.engrave)
    if (s.active !== null) pushVarint(out, s.active)
    for (const p of s.passives) pushVarint(out, p)
  }
  return toBase64Url(out)
}

/** Structure only: the result still has to pass the team validator (ranges, rules, roster). */
export function decodeTeam(text: string): DecodeResult {
  const bytes = fromBase64Url(text)
  if (!bytes) return { ok: false, reason: 'malformed' }
  try {
    const r = new Reader(bytes)
    if (r.byte() !== VERSION) return { ok: false, reason: 'version' }
    const head = r.byte()
    const n = head & 7
    const support = (head >> 3) & 7
    if (n < 1 || n > MAX_SLOTS || support > n || head & 0x80) return { ok: false, reason: 'malformed' }

    let target: string | undefined
    if (head & (1 << 6)) {
      const len = r.varint()
      if (len < 1 || len > MAX_TARGET_BYTES) return { ok: false, reason: 'malformed' }
      target = ''
      for (let i = 0; i < len; i++) target += String.fromCharCode(r.byte())
    }

    const heroes: TeamSlot[] = []
    for (let i = 0; i < n; i++) {
      const stockId = r.varint()
      const f = r.byte()
      if (f & 0x80) return { ok: false, reason: 'malformed' }
      const stats = { lv: r.varint(), plv: r.varint(), fans: r.varint(), engrave: r.varint() }
      const slot: TeamSlot = {
        stockId,
        ...stats,
        ...(stats.plv > 0 ? { pwForm: PW_FORMS[(f >> 2) & 3] } : {}),
        bloom: !!(f & 2),
        skillTree: !!(f & 1),
        active: f & (1 << 4) ? r.varint() : null,
        passives: [],
      }
      for (let p = f >> 5; p > 0; p--) slot.passives.push(r.varint())
      heroes.push(slot)
    }
    if (!r.done) return { ok: false, reason: 'malformed' }
    return { ok: true, value: { v: 1, supportIndex: support ? support - 1 : null, heroes, ...(target ? { target } : {}) } }
  } catch {
    return { ok: false, reason: 'malformed' }
  }
}

// ---- URL ----

/** `?team=` of a query string, or null when absent. */
export function sharedParam(search: string): string | null {
  return new URLSearchParams(search).get(SHARE_PARAM)
}

/** The page URL carrying the team: same origin and path, no other query parameters and no hash. */
export function shareUrl(loc: Pick<Location, 'origin' | 'pathname'>, team: TeamPayload): string {
  return `${loc.origin}${loc.pathname}?${SHARE_PARAM}=${encodeTeam(team)}`
}
