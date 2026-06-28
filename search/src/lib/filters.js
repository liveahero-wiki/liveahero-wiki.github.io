// Pure, in-memory filtering over the index entities.
//
// Filter semantics: OR within a row, AND across rows.
//   - Within one category row, any selected label matches (OR).
//   - Across category rows (and the other filter rows), all must pass (AND).
//
// Skill-tree toggle: for heroes that have a skill tree, when `skillTree` is on
// we use the fully-maxed projections (skillsMaxed/labelsMaxed/statusIdsMaxed);
// otherwise the base ones. Sidekicks are unaffected.

const categoryOf = (labelKey) => labelKey.split('.')[0]

// Slots whose view cost is always 0 — excluded from view-cost matching so the
// range filter is meaningful (hero/sidekick passives + the basic hero skill 1).
const COST_EXEMPT_SLOTS = new Set(['passive', 'sidekick_passive', 'active1'])

/** Effective skills/labels/statuses for an entity given the skill-tree toggle. */
export function effectiveOf(entity, skillTree) {
  const maxed = skillTree && entity.kind === 'hero' && entity.skillsMaxed
  return {
    skills: maxed ? entity.skillsMaxed : entity.skills,
    labels: maxed ? entity.labelsMaxed : entity.labels,
    statusIds: maxed ? entity.statusIdsMaxed : entity.statusIds,
  }
}

/**
 * @param {Array} entities
 * @param {object} query - see app.jsx initial state
 * @param {object} statuses - id -> { name, icon, type }
 * @returns matched entities (unmodified objects)
 */
export function filterEntities(entities, query, statuses) {
  const {
    types,
    labels,
    statusTypes,
    statusIds,
    viewMin,
    viewMax,
    skillTree,
    includeMob,
  } = query

  // Group selected labels by their category prefix once.
  const labelsByCat = new Map()
  for (const key of labels) {
    const cat = categoryOf(key)
    if (!labelsByCat.has(cat)) labelsByCat.set(cat, new Set())
    labelsByCat.get(cat).add(key)
  }

  const hasMin = viewMin != null && viewMin !== ''
  const hasMax = viewMax != null && viewMax !== ''
  const min = hasMin ? Number(viewMin) : -Infinity
  const max = hasMax ? Number(viewMax) : Infinity

  return entities.filter((entity) => {
    // Type (one row, OR within).
    if (types.size && !types.has(entity.kind)) return false

    // Include mob.
    if (!includeMob && entity.isMob) return false

    const eff = effectiveOf(entity, skillTree)
    const effLabels = new Set(eff.labels)
    const effStatusIds = new Set(eff.statusIds)

    // Categories: each selected category-row must intersect (OR within / AND across).
    for (const [, group] of labelsByCat) {
      let hit = false
      for (const key of group) {
        if (effLabels.has(key)) {
          hit = true
          break
        }
      }
      if (!hit) return false
    }

    // Status type (one row, OR within): some status of a selected type.
    if (statusTypes.size) {
      let hit = false
      for (const id of effStatusIds) {
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
        if (effStatusIds.has(id)) {
          hit = true
          break
        }
      }
      if (!hit) return false
    }

    // View cost: some cost-bearing effective skill within [min, max].
    if (hasMin || hasMax) {
      const inRange = eff.skills.some(
        (s) => !COST_EXEMPT_SLOTS.has(s.slot) && s.useView >= min && s.useView <= max,
      )
      if (!inRange) return false
    }

    return true
  })
}

/**
 * Flatten matched entities to one row per effective skill.
 * Shows the full kit of each matched character (matching is entity-level via
 * aggregated labels, so individual skills may not each carry every filter).
 */
export function flattenToRows(matched, skillTree) {
  const rows = []
  for (const entity of matched) {
    const { skills } = effectiveOf(entity, skillTree)
    for (const s of skills) {
      rows.push({
        id: `${entity.kind}-${entity.stockId}-${s.slot}-${s.skillId}`,
        entity,
        kind: entity.kind,
        name: entity.name,
        slot: s.slot,
        skillName: s.name,
        description: s.description,
        useView: s.useView,
        labels: s.labels,
        statusIds: s.statusIds,
        changeSkills: s.changeSkills,
      })
    }
  }
  return rows
}
