// The characters a tier list can rank: the same set `/charas/` lists, from api/team-roster.json. Pure, so `node --test`
// can import it.

import { localizedName, searchText } from '../cms-plugin/roster.ts'
import type { LocalizedName, RosterHero, RosterSidekick } from '../cms-plugin/types.ts'
import type { Lang } from '../shared/lang.ts'
import { itemKey, type Kind } from './model.ts'

/** `/charas/` leaves out stock ids from 90000 up (event-only meteor units and the like). */
export const MAX_STOCK_ID = 90000

export interface Candidate {
  key: string
  kind: Kind
  stockId: number
  name: LocalizedName
  resourceName: string
  rarity: number
  /** Chara page path, '' without a released page. */
  page: string
  /** A later variant of a base card: stock ids end in 2 or above (`stockId = (1000 + characterId) * 10 + variant`). */
  isVariant: boolean
  /** A part-time (rarity-1) unit. */
  isMob: boolean
  search: string
}

export interface Filter {
  type: 'all' | Kind
  hideVariants: boolean
  hideMobs: boolean
  query: string
}

export const DEFAULT_FILTER: Filter = { type: 'all', hideVariants: false, hideMobs: false, query: '' }

function candidate(kind: Kind, e: RosterHero | RosterSidekick): Candidate {
  return {
    key: itemKey(kind, e.stockId),
    kind,
    stockId: e.stockId,
    name: e.name,
    resourceName: e.resourceName,
    rarity: e.rarity,
    page: e.page ?? '',
    isVariant: e.stockId % 10 >= 2,
    isMob: e.isMob === true,
    search: searchText(e),
  }
}

/** Heroes then sidekicks, each in roster (stockId) order. */
export function buildCandidates(roster: { heroes: RosterHero[]; sidekicks: RosterSidekick[] }): Candidate[] {
  return [
    ...roster.heroes.filter((e) => e.stockId < MAX_STOCK_ID).map((e) => candidate('hero', e)),
    ...roster.sidekicks.filter((e) => e.stockId < MAX_STOCK_ID).map((e) => candidate('sidekick', e)),
  ]
}

export function filterCandidates(list: readonly Candidate[], f: Filter): Candidate[] {
  const q = f.query.trim().toLowerCase()
  return list.filter(
    (c) =>
      (f.type === 'all' || c.kind === f.type) &&
      !(f.hideVariants && c.isVariant) &&
      !(f.hideMobs && c.isMob) &&
      (!q || c.search.includes(q)),
  )
}

export const candidateName = (c: Candidate, lang: Lang): string => localizedName(c.name, lang)
