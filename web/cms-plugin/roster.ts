// Roster (api/team-roster.json): names + icons for the pickers and the read-only views.
// Free of JSX/CSS imports so it can be unit-tested with node's type stripping.

import type { Lang, LocalizedName, RosterFile, RosterHero, RosterItem, RosterSidekick } from './types.ts'

// Same origin as web/src/lib/urls.ts: icons live on the live wiki's CDN path. Absolute so the plugin
// also works on the admin origin.
export const SITE = 'https://liveahero-wiki.github.io'
const SPRITE = `${SITE}/cdn/Sprite`

export const heroIconUrl = (resourceName: string) => `${SPRITE}/icon_${resourceName}_h01.png`
export const sidekickIconUrl = (resourceName: string) => `${SPRITE}/icon_${resourceName}_s01.png`
export const itemIconUrl = (resourceName: string) => `${SPRITE}/item_${resourceName}.png`

/** Sidekick stockIds start at 10000; passive-slot items (skill books) have small itemIds. */
const FIRST_STOCK_ID = 10000

/** Absolute chara page URL for a roster entry (anchored to its hero/sidekick card), or '' without a page. */
export function charaUrl(kind: 'hero' | 'sidekick', e: RosterHero | RosterSidekick): string {
  return e.page ? `${SITE}${e.page}#${kind === 'hero' ? 'h' : 's'}${e.stockId}` : ''
}

export interface Roster {
  version: string
  heroes: RosterHero[]
  sidekicks: RosterSidekick[]
  items: RosterItem[]
  hero(stockId: number): RosterHero | undefined
  sidekick(stockId: number): RosterSidekick | undefined
  item(itemId: number): RosterItem | undefined
}

/** What a passive id refers to: a roster item when the roster knows it, else by id range. */
export function passiveKind(roster: Pick<Roster, 'item' | 'sidekick'> | null | undefined, id: number): 'sidekick' | 'item' {
  if (roster?.item(id)) return 'item'
  if (roster?.sidekick(id)) return 'sidekick'
  return id < FIRST_STOCK_ID ? 'item' : 'sidekick'
}

export function buildRoster(file: Partial<RosterFile>): Roster {
  const heroes = Array.isArray(file.heroes) ? file.heroes : []
  const sidekicks = Array.isArray(file.sidekicks) ? file.sidekicks : []
  const h = new Map(heroes.map((e) => [e.stockId, e]))
  const s = new Map(sidekicks.map((e) => [e.stockId, e]))
  const items = Array.isArray(file.items) ? file.items : []
  const i = new Map(items.map((e) => [e.itemId, e]))
  return {
    version: String(file.version ?? ''),
    heroes,
    sidekicks,
    items,
    hero: (id) => h.get(id),
    sidekick: (id) => s.get(id),
    item: (id) => i.get(id),
  }
}

/** Localized name with the fallback chain lang -> ja -> en -> any available -> ''. */
export function localizedName(name: LocalizedName | undefined, lang: Lang): string {
  if (!name) return ''
  return name[lang] || name.ja || name.en || Object.values(name).find(Boolean) || ''
}

/** The id a roster entry is stored under in a payload: stockId for cards, itemId for items. */
export const entryId = (e: RosterHero | RosterSidekick | RosterItem): number => ('itemId' in e ? e.itemId : e.stockId)

/** Lower-cased haystack of every language's name + resourceName + id, for the pickers' search. */
export function searchText(e: RosterHero | RosterSidekick | RosterItem): string {
  return [...Object.values(e.name), e.resourceName, String(entryId(e))].join('\n').toLowerCase()
}

// ---- loading

let source: string | URL | RosterFile | null = null
let memo: Promise<Roster> | null = null

// Plugin at /assets/cms/lah-team-formation.js -> ../../api/team-roster.json = /api/team-roster.json.
// Kept in a variable on purpose: a literal `new URL('...', import.meta.url)` is treated by Vite as an
// asset import and would inline the whole roster file into the bundle.
const ROSTER_REL_PATH = '../../api/team-roster.json'

function defaultUrl(): URL {
  return new URL(ROSTER_REL_PATH, import.meta.url)
}

/** Override where the roster comes from (a URL or inline data). Used by the dev harness and tests. */
export function setRosterSource(src: string | URL | RosterFile | null): void {
  source = src
  memo = null
}

/** Memoized; rejects on failure (and forgets the failure so a later call retries). */
export function loadRoster(): Promise<Roster> {
  if (!memo) {
    const p = (async () => {
      if (source && typeof source === 'object' && !(source instanceof URL)) return buildRoster(source)
      const res = await fetch(source ?? defaultUrl())
      if (!res.ok) throw new Error(`roster: HTTP ${res.status}`)
      return buildRoster((await res.json()) as RosterFile)
    })()
    memo = p
    p.catch(() => {
      if (memo === p) memo = null
    })
  }
  return memo
}
