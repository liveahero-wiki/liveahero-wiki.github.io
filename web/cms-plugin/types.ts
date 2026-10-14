import type { Lang } from './i18n.ts'

export type { Lang }

/**
 * One team slot: a hero plus 0-1 active sidekick and 0-3 passives. A passive is a sidekick stockId (>= 10000)
 * or the itemId of a roster item (small ids, never colliding). Mirrors wiki-cms §2.6.
 */
export interface TeamSlot {
  stockId: number
  lv: number
  plv: number
  fans: number
  engrave: number
  bloom: boolean
  skillTree: boolean
  active: number | null
  passives: number[]
}

export interface TeamPayload {
  v: 1
  /** Index into `heroes` of the borrowed support slot; `null` when the group disallows support or (mode `optional`) none is used. */
  supportIndex: number | null
  heroes: TeamSlot[]
  /** Id of a target of the group's `options.targets` (e.g. `quest-616001`); absent/null = general purpose. */
  target?: string | null
}

/** One entry of the group's `options.targets` (owned by the wiki, see docs/CMS.md). */
export interface Target {
  /** Permanent slug, `^[a-z0-9][a-z0-9-]{0,63}$`. */
  id: string
  label: LocalizedName
  /** Link target of the chip (site path or https URL). */
  url?: string
  /** Hidden from the submit form, still valid and filterable. */
  retired?: boolean
}

export interface Focus {
  kind: 'hero' | 'sidekick'
  stockId: number
}

/** Names per language; any may be missing (fall back lang -> ja -> en). */
export type LocalizedName = Partial<Record<Lang, string>>

/** Shape of the wiki's api/team-roster.json (wiki-cms plan §3.2). */
export interface RosterHero {
  stockId: number
  characterId: number
  name: LocalizedName
  /** Wiki chara page path ("/charas/akashi/"); '' when the card has no released page. */
  page?: string
  resourceName: string
  rarity: number
  element: number
  role: string
  hasSkillTree: boolean
  /** Limited-time unit (`limited: true` in the chara page's front matter); missing = false. */
  limited?: boolean
}

export interface RosterSidekick {
  stockId: number
  characterId: number
  name: LocalizedName
  page?: string
  resourceName: string
  rarity: number
  limited?: boolean
}

/** A skill-book item that can take a sidekick passive slot (stored in `TeamSlot.passives` by itemId). */
export interface RosterItem {
  itemId: number
  name: LocalizedName
  /** Icon: `item_<resourceName>.png`. */
  resourceName: string
}

export interface RosterFile {
  version: string
  heroes: RosterHero[]
  sidekicks: RosterSidekick[]
  /** Absent in rosters generated before items were supported. */
  items?: RosterItem[]
}
