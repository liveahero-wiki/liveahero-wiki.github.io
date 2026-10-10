export interface Label {
  key: string
  label: string
  // Optional more-specific filters (e.g. target range or scaling source). Keys
  // are fully-formed composites '<parent>/<suffix>' that appear only in a
  // skill's matchLabels, never in its display labels.
  sublabels?: Label[]
}

export interface Category {
  key: string
  label: string
  labels: Label[]
}

export interface Status {
  name: string
  icon: string
  type: 'buff' | 'debuff' | 'field' | 'system'
}

export interface ChangeSkill {
  name: string
  description: string
  // The <wiki-status i=N> tags in `description` index THIS list, not the parent skill's.
  statusDescs?: StatusDesc[]
}

// Words of the status tooltip header ("[Buff/Stackable]"), in the index's language.
// Keys: b d o f s (types) and stk unstk chg dot fld cnt (modifiers); see
// tools/skill_text.py STATUS_LABELS.
export type StatusLabels = Record<string, string>

// One status a skill applies or names. The skill's description carries
// <wiki-status i=N>text</wiki-status> where N is the position in `statusDescs`;
// the list always starts with the statuses the game shows for the skill.
export interface StatusDesc {
  name: string
  desc: string
  icon?: string
  tp?: string   // 'b'|'d'|'o'|'f'|'s' — display type (Buff/Debuff/Other/Field/System)
  fl?: number   // flag bitmask: 1=stackable, 2=charge, 4=dot, 8=field, 16=count
}

export interface Skill {
  skillId: number
  slot: string
  name: string
  description: string
  useView: number
  labels: string[]
  statusIds: number[]
  matchLabels: string[]
  matchStatusIds: number[]
  changeSkills?: ChangeSkill[]
  statusDescs?: StatusDesc[]
  hidden?: boolean
}

// Max-level stats of the entity's representative card.
export interface EntityStats {
  hp: number
  atk: number
  spd: number
  view: number
}

export interface Entity {
  kind: 'hero' | 'sidekick'
  stockId: number
  name: string
  resourceName: string
  page?: string
  isMob?: boolean
  role?: string
  element?: number
  stats?: EntityStats
  skills: Skill[]
  skillsMaxed?: Skill[]
}

export interface SkillIndex {
  version: string
  statusLabels?: StatusLabels
  categories: Category[]
  statuses: Record<string, Status>
  entities: Entity[]
}

export interface Query {
  types: Set<string>
  roles: Set<string>
  elements: Set<string>
  labels: Set<string>
  statusTypes: Set<string>
  statusIds: Set<number>
  viewMin: string
  viewMax: string
  characterName: string
  skillTree: boolean
  includeMob: boolean
}

export interface Row {
  id: string
  entity: Entity
  kind: 'hero' | 'sidekick'
  name: string
  slot: string
  skillId: number
  skillName: string
  description: string
  useView: number
  spd?: number
  labels: string[]
  matchLabels: string[]
  statusIds: number[]
  changeSkills?: ChangeSkill[]
  statusDescs?: StatusDesc[]
}
