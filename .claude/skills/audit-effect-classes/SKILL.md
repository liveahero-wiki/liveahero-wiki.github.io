---
name: audit-effect-classes
description: >-
  Audit and categorize game skill-effect classes that the skill-search index
  generator (tools/generate_skill_search_index.py) does not yet handle, and
  propose taxonomy improvements. Use this whenever the generator prints
  "UNMAPPED CLASSES", whenever someone mentions unmapped / unhandled / uncategorized
  skill effect classes, asks where a SkillEffectMaster class should go, wants the
  search taxonomy (categories / labels in CATEGORIES) reviewed or extended, or sees
  new effect classes after a masterdata update. Reach for this skill even if the
  request is phrased loosely ("the skill search is missing some effects", "sort out
  these effect classes", "is our effect taxonomy any good") — categorizing effect
  classes correctly is exactly what it is for.
---

# Audit & categorize skill-effect classes

## What this does and why it matters

`tools/generate_skill_search_index.py` turns the game's `SkillEffectMaster.json` into
the searchable skill index that powers the search UI. Every effect on every skill has a
`class` (e.g. `MultipleAttack`, `Heal`, `MultipleHp`). The generator's `classify()`
function maps each class to one or more taxonomy **label keys** (like `attack.multi`,
`heal.heal`). Any class it doesn't recognize is counted and printed at the end of a run:

```
UNMAPPED CLASSES (3):
  TriggerDecideAutoSkill: 28
  MultipleHp: 2
  TurnDecideAutoSkill: 2
```

An unmapped class means real skills are missing from search filters, so the taxonomy
must be kept complete. New classes appear whenever masterdata is updated, so this audit
recurs. The goal: for each unhandled class, gather evidence of what it actually does,
decide the right home, apply the mapping, and confirm the warning clears — plus flag
any broader taxonomy weaknesses you notice along the way.

You investigate and **propose with evidence**, then apply the edits **only after the
user approves** (unless they tell you to go ahead). Never guess from a class name alone —
names are misleading (e.g. `MultipleDefence` is damage reduction, not an attack;
`ChangeHp` is HP damage/heal-over-time, not a max-HP buff).

## The workflow

### 1. Find the unhandled classes

Run the generator and read the `UNMAPPED CLASSES` block from its output:

```bash
python tools/generate_skill_search_index.py
```

It also writes `api/skill-index.json`; that's expected. If it ends with
`no unmapped effect classes`, there's nothing to map — skip to the taxonomy-review pass
(step 6) if the user asked for improvements, otherwise report that and stop.

### 2. Gather evidence for each unmapped class

Names lie; the descriptions and parameters in the masterdata don't. Use the audit
tool, which aggregates every occurrence of each class **scoped to the skills
reachable from CardMaster/SidekickMaster** (the same set the index is built from —
not the whole `SkillEffectMaster.json`, which is full of mob/unused effects). Run
it from the repo root:

```bash
python tools/audit_skill_effects.py class TriggerDecideAutoSkill MultipleHp TurnDecideAutoSkill
```

For each class it collapses occurrences into **distinct signatures** keyed by
(description, parameter shape, resulting labels) and reports: per-signature count,
the `value` range (the key threshold signal for value-sign classes), how many are
`persistence:true` (a standing buff/state vs. a one-shot), the distinct `statusId`s
applied, sample Japanese `description`s, and example characters. Pass `--json` for
machine-readable output. `python tools/audit_skill_effects.py classes` lists every
reachable class by descending frequency (its counts match the generator's UNMAPPED
list); `... report` writes a browsable HTML report to `api/skill-effects-audit.html`.

Read the descriptions — they are the ground truth. A quick glossary of recurring terms:

| JP term | Meaning | Categorization signal |
|---|---|---|
| 永続 / 基礎値 | permanent / base-value | a standing stat buff |
| バフ / デバフ | buff / debuff | buff or debuff effect |
| ダメージ / 軽減 | damage / reduction | attack or damage-down |
| 回復 | heal/recover | healing |
| 火傷・毒・継続 | burn/poison/over-time | damage-over-time |
| 〜表示用 / エフェクト用 | "for display" / visual-only | **ignore** — pure presentation |
| システム効果〜付与 | grants internal system effect | usually an internal mechanic → ignore |
| 拡散 | spread (to adjacent) | interference-ish |
| オートスキル / 発動 | auto-skill / trigger | auto-action control |

### 3. Decide where each class belongs

The taxonomy and the mapping logic live in the generator and are the **single source of
truth** — read them before deciding so you match existing conventions:

- `CATEGORIES` — the category → label tree that drives the search UI buttons.
- `VALUE_SIGN_RULES` — classes whose label flips on `parameter.value` (checked
  first): a percentage-multiplier class like `MultipleAttack`/`MultipleDefence`
  is ATK/DEF up vs. down around a threshold (100 == x1.0 == no-op → no label).
  Use this (not a static `CLASS_TO_LABELS` entry) when the `value` range from
  `audit_skill_effects.py class <Name>` spans both sides of the threshold.
- `CLASS_TO_LABELS` — exact class → label-key(s) map (value-independent). Note
  the `*MultipleAttack` family (`ViewPowerMultipleAttack`, `ComboMultipleAttack`,
  etc.) maps to `damage.scaling` — they're single-instance damage that scales
  off some stat, not repeated hits.
- `DAMAGE_CLASSES` — classes that deal damage (get a target-based attack label).
- The ordered substring rules inside `classify()` — family fallbacks so new
  class variants sharing a stem auto-map.
- `attack.multi` is **not** assigned in `classify()` at all — it's structural,
  computed in `label_skill()` by grouping a skill's damage-dealing
  `SkillMaster.effects[]` rows by `sequenceGroupId`: more than one distinct
  group means concurrent/repeated hits within one skill use (RNG-cascade or
  conditionally-gated extra hits), as opposed to mutually-exclusive
  skill-tree tier variants of a single hit (which don't set distinct
  `sequenceGroupId`s).
- `IGNORED_CLASSES` and the catch-all ignore branch at the end of `classify()` —
  classes knowingly not surfaced (pure mechanics / display / placeholders).

Pick the smallest change that fits, in this order of preference:

1. **Maps cleanly onto an existing label** → add to `CLASS_TO_LABELS`. If the class is
   one of a *family* sharing a stem (e.g. `TriggerDecideAutoSkill`, `TurnDecideAutoSkill`
   alongside `DecideAutoSkill`), prefer a **substring rule** in `classify()` so future
   variants auto-map — place it specific-before-generic, and verify it doesn't shadow an
   earlier rule. An explicit-entry-per-class is fine when there's no shared stem.
2. **Pure display / internal / system-only mechanic** (e.g. `…表示用`, `システム効果…付与`)
   → add to `IGNORED_CLASSES`. These have no player-facing, searchable effect.
3. **A real, searchable effect that fits no existing label** → add a **new label** under
   the closest existing category (e.g. a max-HP buff → a survivability label under
   `defense`). Adding one label is cheap and keeps the UI coherent.
4. **Only when it fits no existing category at all** → propose a **new top-level
   category**. This adds a UI button, so reserve it for a genuinely new effect family
   with enough members to justify it — say so explicitly and let the user weigh in.

Sanity-check against neighbours: how are the most similar already-mapped classes
handled? Match that precedent unless you can articulate why this class differs.

### 4. Present the audit for approval

Use this structure so the user can decide fast:

```
## Effect-class audit

| Class | Count | What it does (evidence) | Proposed home |
|---|---|---|---|
| <Class> | <n> | <one line from descriptions, cite a JP string> | <label key / IGNORE / new label> |

### Reasoning
- <Class>: <why this home; the neighbour/precedent it follows; any judgment call>

### Proposed edits to tools/generate_skill_search_index.py
- <exact addition: dict entry / substring rule / CATEGORIES label / IGNORED entry>
```

Flag genuine judgment calls (a new label vs. ignore vs. a new category) and ask the user,
rather than silently picking — these shape the UI.

### 5. Apply and verify

After approval, make the edits and re-run the generator. Confirm the report ends with
`no unmapped effect classes` **and** that no previously-mapped class regressed into the
unmapped list (a too-greedy substring rule can steal classes). Spot-check the emitted
`api/skill-index.json`: the taxonomy contains any new label, and a representative skill
now carries the expected label key.

### 6. Propose taxonomy improvements (when asked, or when something stands out)

Beyond clearing the warning, look for weaknesses worth raising:

- **Ignored-but-real**: scan `IGNORED_CLASSES` for anything that is actually a
  player-facing effect now searchable demand exists (run `audit_skill_effects.py
  class <Name>` on suspects). E.g. a max-HP buff hiding among display mechanics
  deserves a label.
- **Overloaded / catch-all labels**: a label absorbing semantically different classes
  (a vague "other") may warrant splitting.
- **Missing dimension**: a recurring effect family with no category at all (note that in
  this game ATK/DEF/SPD-style buffs often ride on `statusId` rather than dedicated
  classes — confirm before proposing a stat-buff category).
- **Stale precedent**: a class mapped to a label that no longer reflects its description.

Present these as suggestions with evidence and a recommendation; don't apply taxonomy
restructures without the user's buy-in, since they change the search UI.

## Guardrails

- **Never edit `SkillEffectMaster.json` or other master JSON** — they are CDN-fetched and
  overwritten by the pipeline (see CLAUDE.md). All changes go in the generator's mapping.
- The descriptions are Japanese; rely on them (and `tools/audit_skill_effects.py`),
  not on the English class name, for what a class does.
