import type { Lang } from './plugin-api.ts'

export type { Lang }

/** One team slot: a hero plus 0-1 active sidekick and 0-3 passive sidekicks. Mirrors wiki-cms §2.6. */
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
  /** Index into `heroes` of the borrowed support slot; `null` when the group disallows support. */
  supportIndex: number | null
  heroes: TeamSlot[]
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
  resourceName: string
  rarity: number
  element: number
  role: string
  hasSkillTree: boolean
}

export interface RosterSidekick {
  stockId: number
  characterId: number
  name: LocalizedName
  resourceName: string
  rarity: number
}

export interface RosterFile {
  version: string
  heroes: RosterHero[]
  sidekicks: RosterSidekick[]
}
