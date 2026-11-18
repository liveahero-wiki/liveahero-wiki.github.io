// Picker entries and their filtering (rarity / element chips + name search). Free of JSX for unit tests.

import type { Lang } from './i18n.ts'
import type { IconKind } from './common.tsx'
import { localizedName, MAX_STOCK_ID, type Roster } from './roster.ts'
import type { LocalizedName } from './types.ts'

export interface PickEntry {
  id: number
  kind: IconKind
  /** Skill-book items have none: a rarity filter leaves them out. */
  rarity?: number
  /** Heroes only. */
  element?: number
  resourceName: string
  name: LocalizedName
}

export interface PickFilter {
  /** Empty = any. */
  rarities: ReadonlySet<number>
  /** Empty = any (heroes only). */
  elements: ReadonlySet<number>
  query: string
}

/** Heroes the picker offers (without the event-only units from `MAX_STOCK_ID` up, e.g. "Borealis (+Custom)" 90821); the rarity filter uses the card's base rarity (the lowest of its stock), not the maxed one. */
export const heroEntries = (roster: Roster): PickEntry[] =>
  roster.heroes
    .filter((e) => e.stockId < MAX_STOCK_ID)
    .map((e) => ({ id: e.stockId, kind: 'hero', rarity: e.baseRarity ?? e.rarity, element: e.element, resourceName: e.resourceName, name: e.name }))

/** Sidekicks a hero can take: not the hero's own character, not the excluded ones. */
export const sidekickEntries = (roster: Roster, opts: { excludeCharacter?: number | null; exclude?: readonly number[] } = {}): PickEntry[] =>
  roster.sidekicks
    .filter((e) => e.characterId !== opts.excludeCharacter && !opts.exclude?.includes(e.stockId))
    .map((e) => ({ id: e.stockId, kind: 'sidekick', rarity: e.rarity, resourceName: e.resourceName, name: e.name }))

/** Passive slot choices: the skill-book items (few, so they come first when there is no search) then the sidekicks. */
export const passiveEntries = (roster: Roster, opts: { excludeCharacter?: number | null; exclude?: readonly number[] } = {}): PickEntry[] => [
  ...roster.items.filter((e) => !opts.exclude?.includes(e.itemId)).map((e): PickEntry => ({ id: e.itemId, kind: 'item', resourceName: e.resourceName, name: e.name })),
  ...sidekickEntries(roster, opts),
]

/** Lower-cased haystack of every language's name + resourceName + id. */
export const pickSearchText = (e: PickEntry): string => [...Object.values(e.name), e.resourceName, String(e.id)].join('\n').normalize('NFKC').toLowerCase()

/** Search text per entry, built once per entries list, not per keystroke. */
export const searchIndex = (entries: readonly PickEntry[]): Map<string, string> => new Map(entries.map((e) => [`${e.kind}:${e.id}`, pickSearchText(e)]))

const rosterIndexes = new WeakMap<Roster, Map<string, string>>()

/** Search text of every entry a picker can offer (heroes, sidekicks, items), built once per roster and shared by all popovers. */
export function rosterSearchIndex(roster: Roster): Map<string, string> {
  let index = rosterIndexes.get(roster)
  if (!index) {
    index = searchIndex([...heroEntries(roster), ...passiveEntries(roster)])
    rosterIndexes.set(roster, index)
  }
  return index
}

/**
 * The entries that pass the rarity / element filter. With a query: names starting with it first, then the other hits in
 * list order. Without: newest (highest id) first, items (no rarity, small ids) kept ahead of the cards.
 */
export function filterEntries(entries: readonly PickEntry[], f: PickFilter, lang: Lang, index?: ReadonlyMap<string, string>): PickEntry[] {
  const pool = entries.filter((e) => (!f.rarities.size || (e.rarity !== undefined && f.rarities.has(e.rarity))) && (!f.elements.size || (e.element !== undefined && f.elements.has(e.element))))
  const q = f.query.normalize('NFKC').trim().toLowerCase()
  if (!q) {
    const rank = (e: PickEntry) => (e.kind === 'item' ? 1 : 0)
    return [...pool].sort((a, b) => rank(b) - rank(a) || b.id - a.id)
  }
  const starts: PickEntry[] = []
  const rest: PickEntry[] = []
  for (const e of pool) {
    if (!(index?.get(`${e.kind}:${e.id}`) ?? pickSearchText(e)).includes(q)) continue
    ;(localizedName(e.name, lang).normalize('NFKC').toLowerCase().startsWith(q) ? starts : rest).push(e)
  }
  return [...starts, ...rest]
}
