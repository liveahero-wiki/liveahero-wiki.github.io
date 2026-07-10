// Pure, in-memory filtering over the index entities, producing one row per
// *matching, visible* skill.
//
// Filter semantics vary by row, but all rows AND against each other:
//   - Type / Role / Status-type rows: OR within the row (any selected value
//     matches) — these are single-valued entity/skill attributes.
//   - Labels: AND across labels (every selected label must match). Sublabels
//     ('<parent>/<suffix>' composite keys) OR within their parent label and
//     *replace* the bare-parent requirement — any composite in matchLabels
//     implies the parent, since the generator always emits both.
//   - Across all rows, every row's condition must pass (AND).
//
// Matching is per-skill (not entity-level): a skill is shown only if it itself
// satisfies every filter, using its `matchLabels`/`matchStatusIds` — which the
// index generator has already augmented with the labels of the hero/sidekick's
// hidden passives whose effect text is carried in this skill's <wiki-passive>
// block. Hidden passives (hero passives, sidekick append-passives) are never
// emitted as rows; they remain reachable via the full-kit dialog.
//
// Skill-tree toggle: for heroes that have a skill tree, when `skillTree` is on
// we use the fully-maxed projections (skillsMaxed); otherwise the base ones.
// Sidekicks are unaffected.

import type { Entity, Query, Row, Skill } from '../types'
import type { Status } from '../types'

const parentOf = (labelKey: string): string => labelKey.split('/')[0]

/** Selected sublabel keys grouped by parent label; a bare-parent selection is
 * an entry with no sublabels. */
type LabelGroups = Map<string, string[]>

/** Effective skills for an entity given the skill-tree toggle. */
export function effectiveSkills(entity: Entity, skillTree: boolean): Skill[] {
  if (skillTree && entity.kind === 'hero' && entity.skillsMaxed) {
    return entity.skillsMaxed
  }
  return entity.skills
}

/**
 * Does a single skill satisfy the category/status/view-cost filters?
 * Type and mob filters are entity-level and handled by the caller.
 */
function skillMatches(
  skill: Skill,
  labelGroups: LabelGroups,
  query: Query,
  statuses: Record<string, Status>,
): boolean {
  const { statusTypes, statusIds, viewMin, viewMax } = query
  const matchLabels = new Set(skill.matchLabels)
  const matchStatusIds = new Set(skill.matchStatusIds)

  // Labels AND across parents; sublabels of one parent OR together and replace
  // the bare-parent requirement.
  for (const [parent, subs] of labelGroups) {
    if (subs.length) {
      if (!subs.some((key) => matchLabels.has(key))) return false
    } else if (!matchLabels.has(parent)) {
      return false
    }
  }

  // Status type (one row, OR within): some status of a selected type.
  if (statusTypes.size) {
    let hit = false
    for (const id of matchStatusIds) {
      const t = statuses[id]?.type
      if (t && statusTypes.has(t)) {
        hit = true
        break
      }
    }
    if (!hit) return false
  }

  // Has status (one row, OR within): some selected status present.
  if (statusIds.size) {
    let hit = false
    for (const id of statusIds) {
      if (matchStatusIds.has(id)) {
        hit = true
        break
      }
    }
    if (!hit) return false
  }

  // View cost: this skill's own cost within [min, max]. No slot exemption — a
  // 0-cost skill (e.g. active1) is dropped by viewMin>0 but kept when 0 is in range.
  const hasMin = viewMin != null && viewMin !== ''
  const hasMax = viewMax != null && viewMax !== ''
  if (hasMin || hasMax) {
    const min = hasMin ? Number(viewMin) : -Infinity
    const max = hasMax ? Number(viewMax) : Infinity
    if (skill.useView < min || skill.useView > max) return false
  }

  return true
}

/**
 * Filter entities + skills to rows. One row per visible skill that matches every
 * filter. Each row carries its `entity` so the UI can open the full-kit dialog.
 */
export function filterRows(
  entities: Entity[],
  query: Query,
  statuses: Record<string, Status>,
): Row[] {
  const { types, roles, skillTree, includeMob } = query

  // Group selected label keys by their parent label once.
  const labelGroups: LabelGroups = new Map()
  for (const key of query.labels) {
    const parent = parentOf(key)
    let subs = labelGroups.get(parent)
    if (!subs) {
      subs = []
      labelGroups.set(parent, subs)
    }
    if (key !== parent) subs.push(key)
  }

  const characterName = query.characterName.trim().toLowerCase()

  const rows: Row[] = []
  for (const entity of entities) {
    // Entity-level gates.
    if (types.size && !types.has(entity.kind)) continue
    if (roles.size && !roles.has(entity.role ?? '')) continue
    if (!includeMob && entity.isMob) continue
    if (characterName) {
      if (!entity.name.toLowerCase().includes(characterName)) continue
    }

    for (const s of effectiveSkills(entity, skillTree)) {
      if (s.hidden) continue // hero passives + sidekick append-passives
      if (!skillMatches(s, labelGroups, query, statuses)) continue
      rows.push({
        id: `${entity.kind}-${entity.stockId}-${s.slot}-${s.skillId}`,
        entity,
        kind: entity.kind,
        name: entity.name,
        slot: s.slot,
        skillId: s.skillId,
        skillName: s.name,
        description: s.description,
        useView: s.useView,
        labels: s.labels,
        statusIds: s.statusIds,
        changeSkills: s.changeSkills,
        statusDescs: s.statusDescs,
      })
    }
  }
  return rows
}
