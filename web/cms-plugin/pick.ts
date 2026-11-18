// Picker entries and their filtering (rarity / element chips + name search). Free of JSX for unit tests.

import type { Lang } from './i18n.ts'
import type { IconKind } from './common.tsx'
import { localizedName, type Roster } from './roster.ts'
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

/** Stock ids from here up are event-only units (e.g. "Borealis (+Custom)" 90821): not playable in a formation, and /charas/ and the tier maker leave them out too. */
export const MAX_PICKABLE_STOCK_ID = 90000

/** Heroes the picker offers (without the event-only units); the rarity filter uses the card's base rarity (the lowest of its stock), not the maxed one. */
export const heroEntries = (roster: Roster): PickEntry[] =>
  roster.heroes
    .filter((e) => e.stockId < MAX_PICKABLE_STOCK_ID)
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
