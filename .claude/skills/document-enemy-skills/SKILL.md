---
name: document-enemy-skills
description: >-
  Turn in-game screenshots of an enemy's Skill Set / Status Effect / Equipable Skills tabs into
  `{% include skill-table-manual.html %}` blocks on a wiki guide page, by matching the skill text
  back to skill IDs in SkillMaster.json. Use this whenever someone hands over a folder of battle
  or enemy screenshots and wants the enemies documented, asks to add enemy skill tables to a guide
  page (Exploring the Unknown / unexplored, an event or raid boss, a mob page), asks "what skill ID
  is this", or wants an enemy's starting statuses shown. Reach for it even when the request is
  loose ("add these bosses to the wiki", "document the roguelite enemies", "find the IDs for these
  skills") — the whole point is that the master data has no enemy-to-skill mapping, so the IDs can
  only be recovered from the text on screen.
---

# Document an enemy's skills from screenshots

## Why this is manual

Nothing in `_data/` maps an enemy to its skills: `SkillMaster.json` has every skill, but no
enemy roster. The only link is the text the game prints on the enemy detail screen. So the
workflow is: read the screenshots, match name + description back to a skill ID, and write the
IDs into the guide page by hand.

Matching is mechanical but **not** safe to eyeball: skill names repeat a lot (nine skills are
called "Sky Strike", four are "Debuff Resistance"), and near-identical descriptions differ by
one clause that changes which enemy they belong to. Use the script, then settle what it flags.

## 1. Read the screenshots

Each enemy usually has three tabs, one screenshot each, sometimes two when the list scrolls:

| Tab | What to transcribe |
| --- | --- |
| **Skill Set** | Skill 1/2/3: name and full description (the VP number is useful as a cross-check but is not transcribed — the table reads `useView` from master data) |
| **Status Effect** | Statuses the enemy already has before anyone acts, with their stack/Count number. "Under the affect of no status effects." means none |
| **Equipable Skills** | Every passive: name and full description |

Read every image. Transcribe **verbatim**, typos included (`"if exposed, gain Cover-Up…"`,
`"Persuer"`) — the match is a string similarity, so a tidied-up transcription matches worse.
Scrolled screenshots repeat a row; take the one that is not cut off. A name still in Japanese
(e.g. `狭間の逆襲`) is untranslated in the game, not a transcription failure: keep the Japanese
and transcribe its Japanese description too.

The JP name in the title bar identifies the enemy; the small icon at its right is its element.
Two screenshots with the same JP name but different art are two different enemies (a boss and
its escorts), so give them distinct labels.

## 2. Write the transcription file

One JSON file in the scratchpad, a list of enemies, in the order the screenshots were taken:

```json
[
  {
    "jp": "電脳カイブツ",
    "en": "Computer Kaibutsu",
    "skills": [
      ["Swing Away", "Deal 90% damage to 1 enemy with an 80% chance of giving SPD Down for 1 action. …"],
      ["Update", "Deal 30% damage to all enemies and gain ATK UP and SPD Up for 1 action."]
    ],
    "equip": [
      ["Double Action", "This character acts twice each turn and uses Skill 2 on second action."]
    ],
    "statuses": [["Damage Counter", 10], ["Growth"]]
  }
]
```

`statuses` is the Status Effect tab: the status name as the game spells it in English, and its
Count/stack number when one is shown. Leave it `[]` when there are none.

## 3. Resolve the IDs

```bash
py -I .claude/skills/document-enemy-skills/scripts/resolve_skill_ids.py <transcription>.json
```

Run it from the repository root. For every skill it lists the candidates that share the name,
ranked by how well their description matches, and then prints ready-to-paste include blocks.
It looks names up in `zzz/English.json` and `zzz/Japanese.json` (`SKILL_NAME_<id>`,
`SKILL_DESCRIPTION_<id>`) and in `SkillMaster.json` (which also carries untranslated names), and
it works out the `startStatuses` skill for each status from `_data/processed/SkillText.json`.

**`ratio=1.00` with no rival at 1.00 is the only result you may take as settled.** The script
prints the rest as `CHECK` or `TIE` and says so again at the end. Settle each one:

*   **`CHECK` (ratio below 1.00)** — read the rival descriptions it prints. Usually the
    transcription slipped (`Gauge Break` was missing its last parenthetical, `Vesicular Activity`
    says "all enemies" in master data where the screenshot was read as "1 enemy"); then the top
    row is right. If instead some *other* candidate matches the screenshot word for word, take
    that one. A clause the top candidate lacks is decisive: the roguelite bird boss's
    `Negative Storm` is `4136107`, not its sibling `4135103`, purely because the screenshot says
    "gain +10% ATK and set VP to 10000" and `4135103` does not.
*   **`TIE` (several candidates identical)** — these are shared generic passives. Pick the ID the
    wiki already uses for it: `grep -rn "<id>" --include=*.md --include=*.html .` over the event
    and guide pages (e.g. `6001104` is the established "Immune to Poison, Burn and Silence").
*   **`NO CANDIDATE`** — the name is untranslated. Search `SkillMaster.json` for the exact
    Japanese `skillName` and description.

Two cross-checks worth running once the set is resolved:

*   Sibling IDs. An enemy's own skills are usually consecutive in one family (`4205101/102/103`
    plus `6205103/104/109`). An outlier is not automatically wrong — enemies reuse other enemies'
    skills and generics freely — but it is worth a second look.
*   For "Exploring the Unknown" enemies, `UI_ROGUE_DEFEAT_HINT_TITLE_<id>` /
    `UI_ROGUE_DEFEAT_HINT_DESCRIPTION_<id>` in `zzz/English.json` is the game's own list of that
    mode's encounters, and the ID's first four digits are the enemy's skill family: `10962` ->
    `Defeat Boss "Computer Kaibutsu"` -> skills `40962xx`. It gives you the official encounter
    names and the Boss/Midboss split for free, and confirms the families.

## 4. Write the page

Paste the blocks the script printed under a heading per encounter, matching the existing style of
the page (see `guide/unexplored.md`):

```liquid
#### Computer Kaibutsu (Boss)

<details>
<summary>Computer Kaibutsu</summary>

{% include skill-table-manual.html skillIds="4096201,4096202,4096203" equipmentSkills="6096201,6096202,6096203,6001104" startStatuses="6096202:Damage Counter:10" %}
</details>
```

`startStatuses` is `<skillId>:<English status name>[:<count>]`, comma-separated — see
`docs/LIQUID.md`. Keep enemy names in English the way the page already does; take an official
name when the dump has one (`CHAPTER_PEEPING_NAME_*`, the `UI_ROGUE_DEFEAT_HINT_*` titles),
otherwise translate `◯◯型カイブツ` as "◯◯ Type Kaibutsu" like the rest of the page. Say in the
page when an encounter is known to exist but is not documented yet.

Do not touch the page's `team_formations` front matter: those IDs are Team Creator lists and are
not part of this workflow.

## 5. Verify

```bash
npm run eleventy:strict
```

A strict build fails on missing skill text and warns on a `startStatuses` entry whose skill does
not apply that status. Then check the page in the browser preview (`eleventy` in
`.claude/launch.json`): expand one new `<details>`, confirm the skill names and descriptions are
not blank, hover a status chip for its tooltip, and confirm tables without `startStatuses` still
start at "Main skills". A blank skill name means the ID does not exist in this masterdata version.
