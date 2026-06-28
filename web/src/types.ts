export interface Label {
  key: string
  label: string
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
}

export interface StatusDesc {
  name: string
  desc: string
  icon?: string
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

export interface Entity {
  kind: 'hero' | 'sidekick'
  stockId: number
  name: string
  resourceName: string
  page?: string
  isMob?: boolean
  skills: Skill[]
  skillsMaxed?: Skill[]
}

export interface SkillIndex {
  version: string
  categories: Category[]
  statuses: Record<string, Status>
  entities: Entity[]
}

export interface Query {
  types: Set<string>
  labels: Set<string>
  statusTypes: Set<string>
  statusIds: Set<number>
  viewMin: string
  viewMax: string
  skillTree: boolean
  includeMob: boolean
  _vcKey: number
}

export interface Row {
  id: string
  entity: Entity
  kind: 'hero' | 'sidekick'
  name: string
  slot: string
  skillName: string
  description: string
  useView: number
  labels: string[]
  statusIds: number[]
  changeSkills?: ChangeSkill[]
  statusDescs?: StatusDesc[]
}
