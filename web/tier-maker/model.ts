// The tier list data model and its pure edits. The same JSON is autosaved to localStorage and embedded in the exported PNG
// (see pngMeta.ts), so `sanitize` treats it as untrusted input. No DOM, so `node --test` can import it.

export type Kind = 'hero' | 'sidekick'

export interface Tier {
  id: string
  name: string
  color: string
  /** Character keys (`h<stockId>` / `s<stockId>`), left to right. */
  items: string[]
}

export interface TierList {
  v: 1
  title: string
  tiers: Tier[]
}

export const MAX_TIERS = 20
export const MAX_TITLE = 100
export const MAX_TIER_NAME = 40
export const FALLBACK_COLOR = '#c8c8c8'

/** Tier colors offered by the color picker (the first five are the default tiers). */
export const PALETTE = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#bfff7f', '#7fbfff', '#bf7fff', '#ff7fdf', '#7fffdf', FALLBACK_COLOR, '#8c8c8c']

export const itemKey = (kind: Kind, stockId: number): string => `${kind === 'hero' ? 'h' : 's'}${stockId}`

export function parseKey(key: string): { kind: Kind; stockId: number } | null {
  const m = /^([hs])(\d{1,9})$/.exec(key)
  return m ? { kind: m[1] === 'h' ? 'hero' : 'sidekick', stockId: Number(m[2]) } : null
}

export function defaultList(): TierList {
  const names = ['S', 'A', 'B', 'C', 'D']
  return { v: 1, title: '', tiers: names.map((name, i) => ({ id: `t${i + 1}`, name, color: PALETTE[i], items: [] })) }
}

export const placedKeys = (list: TierList): Set<string> => new Set(list.tiers.flatMap((t) => t.items))

/** True when nothing was ranked, titled, renamed, recolored or added: replacing the list loses no work. */
export const isPristine = (list: TierList): boolean => JSON.stringify(list) === JSON.stringify(defaultList())

export function nextTierId(list: TierList): string {
  const used = new Set(list.tiers.map((t) => t.id))
  for (let n = list.tiers.length + 1; ; n++) if (!used.has(`t${n}`)) return `t${n}`
}

/** Moves `key` into `tierId` before position `index` (default: the end), leaving it nowhere else. */
export function placeItem(list: TierList, key: string, tierId: string, index?: number): TierList {
  if (!list.tiers.some((t) => t.id === tierId)) return list
  let at = index
  const tiers = list.tiers.map((t) => {
    const from = t.items.indexOf(key)
    if (from < 0) return t
    if (t.id === tierId && at !== undefined && from < at) at -= 1
    return { ...t, items: t.items.filter((k) => k !== key) }
  })
  return {
    ...list,
    tiers: tiers.map((t) => {
      if (t.id !== tierId) return t
      const items = t.items.slice()
      items.splice(at === undefined ? items.length : Math.max(0, Math.min(at, items.length)), 0, key)
      return { ...t, items }
    }),
  }
}

/** Takes `key` out of every tier (it returns to the pool). */
export const removeItem = (list: TierList, key: string): TierList => ({
  ...list,
  tiers: list.tiers.map((t) => (t.items.includes(key) ? { ...t, items: t.items.filter((k) => k !== key) } : t)),
})

export const setTitle = (list: TierList, title: string): TierList => ({ ...list, title: title.slice(0, MAX_TITLE) })

export const updateTier = (list: TierList, id: string, patch: Partial<Pick<Tier, 'name' | 'color'>>): TierList => ({
  ...list,
  tiers: list.tiers.map((t) => (t.id === id ? { ...t, ...patch, name: (patch.name ?? t.name).slice(0, MAX_TIER_NAME) } : t)),
})

export function addTier(list: TierList): TierList {
  if (list.tiers.length >= MAX_TIERS) return list
  const color = PALETTE[list.tiers.length % PALETTE.length]
  return { ...list, tiers: [...list.tiers, { id: nextTierId(list), name: 'New tier', color, items: [] }] }
}

/** Deleting a tier sends its characters back to the pool. The last tier stays: a list needs a tier to place characters in. */
export const removeTier = (list: TierList, id: string): TierList =>
  list.tiers.length <= 1 ? list : { ...list, tiers: list.tiers.filter((t) => t.id !== id) }

export function moveTier(list: TierList, id: string, delta: -1 | 1): TierList {
  const from = list.tiers.findIndex((t) => t.id === id)
  const to = from + delta
  if (from < 0 || to < 0 || to >= list.tiers.length) return list
  const tiers = list.tiers.slice()
  ;[tiers[from], tiers[to]] = [tiers[to], tiers[from]]
  return { ...list, tiers }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Validates untrusted JSON (an imported PNG, a stored draft) against the characters this site knows. Unknown or duplicate
 * characters are dropped and counted in `skipped`; null when the value is not a tier list at all.
 */
export function sanitize(raw: unknown, validKeys: ReadonlySet<string>): { list: TierList; skipped: number } | null {
  if (!isRecord(raw) || raw.v !== 1 || !Array.isArray(raw.tiers)) return null
  const seen = new Set<string>()
  const ids = new Set<string>()
  let skipped = 0
  const tiers: Tier[] = []
  for (const rt of raw.tiers.slice(0, MAX_TIERS)) {
    if (!isRecord(rt)) continue
    let id = typeof rt.id === 'string' && /^[\w-]{1,24}$/.test(rt.id) && !ids.has(rt.id) ? rt.id : ''
    if (!id) for (let n = tiers.length + 1; !id; n++) if (!ids.has(`t${n}`)) id = `t${n}`
    ids.add(id)
    const items: string[] = []
    for (const k of Array.isArray(rt.items) ? rt.items : []) {
      if (typeof k === 'string' && validKeys.has(k) && !seen.has(k)) {
        seen.add(k)
        items.push(k)
      } else skipped++
    }
    tiers.push({
      id,
      name: typeof rt.name === 'string' ? rt.name.slice(0, MAX_TIER_NAME) : '',
      color: typeof rt.color === 'string' && /^#[0-9a-f]{6}$/i.test(rt.color) ? rt.color.toLowerCase() : FALLBACK_COLOR,
      items,
    })
  }
  if (!tiers.length) return null
  return { list: { v: 1, title: typeof raw.title === 'string' ? raw.title.slice(0, MAX_TITLE) : '', tiers }, skipped }
}
