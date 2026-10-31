# Live A Hero Wiki — Layouts, Includes, & Plugins

The site utilizes the Liquid template language (via Eleventy, see [ELEVENTY.md](ELEVENTY.md)) extended by custom JavaScript plugins and highly structured Liquid templates to render complex game master data dynamically.

---

## 🎨 Layouts (`_layouts/`)

Layouts act as structural wrappers for pages in the wiki, parsing markdown front matter and mapping it to structured layout containers.

### 1. `chara.html`
*   **Purpose**: The layout for character profiles. Used by markdown files in `_charas/`.
*   **Mechanics**:
    *   If `page.unreleased` is `true`, it includes `hero-infobox-unreleased.html`.
    *   Otherwise, it mounts a custom tabbed navigation container (`<wiki-tabs>` and `<wiki-tabcontent>`) splitting **Hero** forms and **Sidekick** forms.
    *   Includes `hero-infobox.html` or `sidekick-infobox.html` for each form registered under front-matter lists `page.heroes` and `page.sidekicks`.
    *   Passes `cms=true` to the infoboxes so each card's panel ends with its community team-formation list (`cms-submissions.html`; see [CMS.md](CMS.md)), and loads the wiki-cms embed script once.
    *   Loads cards collection info via `card-collection-info.html`.
    *   Queries `site.data.CharacterStoryMaster` to build tables showing character story appearances (Main Quests, Event Quests, and Link Quests).
    *   Displays 5th Anniversary Hero Encyclopedia summaries.

### 2. `event.html`
*   **Purpose**: Renders event details page. Used by markdown files in `_events/`.
*   **Mechanics**:
    *   Parses front-matter properties like `eventId` to resolve event details, and displays farm periods, gacha toggles, and news links.
    *   Pulls and structures gacha banners, limited quests, and free quest rewards tables.
    *   Integrates `shop-table.html` using the store ID found in master data.
    *   Includes `quest-group.html` to render nested lists of main and free farming quest groups.
    *   When the page declares `team_formations`, renders a *Community Team Formations* section with one `team-creator-link.html` link per target to the Team Creator page (see [CMS.md](CMS.md)); the targets come from the `cms_targets` filter (`page | cms_targets`).

### 3. `status.html`
*   **Purpose**: Renders battle status pages grouping characters by the status effects their skills can apply. Used by markdown files in `_statuses/`.
*   **Mechanics**:
    *   Generates interactive tables listing Heroes and Sidekicks whose skill IDs match the status ID, rendering active and passive skills side-by-side using `skill-description.html`.

### 4. `default.html`
*   **Purpose**: The global baseline layout.
*   **Mechanics**:
    *   Includes the common header (`header.html`) and footer (`footer.html`), loads styling stylesheets, custom fonts (Inter/Outfit), and integrates tooltips library (`tippy.js`).

---

## 🧩 Liquid Include Components (`_includes/`)

Includes are reusable HTML/Liquid template fragments that compile master data attributes into responsive component layouts.

### 1. `hero-infobox.html` / `sidekick-infobox.html`
*   **Purpose**: Render the visual card profile sheets.
*   **Details**:
    *   Queries `site.data.CardMaster` or `site.data.SidekickMaster` by the character's `stockId`.
    *   Outputs attributes: Element, Role, Illustrator, Voice Actor, and CV lines.
    *   Generates a full stats table detailing progression of HP, ATK, SPD, and View power across rarities and levels.
    *   Mounts the character's active skills and passive skill upgrade tables using `skill-table-v2.html`.

### 2. `quest-infobox.html`
*   **Purpose**: Renders an interactive collapsible accordion (`<details>`) listing quest parameters.
*   **Details**:
    *   Displays level recommendation, stamina cost, or clear prerequisites.
    *   Iterates through enemies, loading element indicators and speed stats.
    *   Renders reward structures (loot icons and values) and drops probabilities percentages.

### 3. `skill-description.html`
*   **Purpose**: The central skill description component: `{% include skill-description.html skillId=… %}`.
*   **Details**:
    *   A one-line wrapper around the `skill_html` filter. The text is not generated in Liquid: `tools/gen_skill_text.py` writes it, in every language, to `_data/processed/SkillText.json` (community English, else the game's own text, else raw Japanese), with the status names already tagged. The filter turns that into HTML: the text with status chips (tippy tooltips), the list of the skill's statuses, and a `<details>` for each skill it can change into (`include.changeSkillIds[include.index]`, from `collect_change_skills`).
    *   Every language is written to the page as a `<div class="sdv" lang="…" data-l="…">` block; `data-l` lists the languages the block serves (a language without its own text is served by the Japanese block). `_sass/_skill-lang.scss` shows the ones for `<html data-skill-lang>`, which `_includes/js/skill-lang.js` sets in `<head>` from `localStorage.skillSearchLang` or the browser language (the only language detection on the wiki: the apps under `web/` read the attribute through `web/shared/lang.ts`). English is the default. The picker in the toolbar (`skill-lang-picker.html`) appears on pages that have such blocks.
    *   Skill names use the same scheme through the `skill_name_html` filter (`{{ skillId | skill_name_html }}`).
    *   A skill with no text in any language renders nothing; `skill_has_text` tells whether there is any.

### 4. `skill-table-manual.html`
*   **Purpose**: An enemy's whole kit, written out by hand: `{% include skill-table-manual.html skillIds="…" equipmentSkills="…" startStatuses="…" %}`. The master data has no enemy → skill mapping, so the IDs are read off in-game screenshots and matched back to `SkillMaster.json` through `zzz/English.json` (`SKILL_NAME_<id>` / `SKILL_DESCRIPTION_<id>`); the guide pages (`guide/unexplored.md`) are the callers.
*   **Details**:
    *   `skillIds` and the optional `equipmentSkills` are comma-separated IDs, rendered as "Main skills" and "Passive skills" through `skill-description.html`.
    *   The whole workflow, from screenshots to page, is `.claude/skills/document-enemy-skills/` (its `scripts/resolve_skill_ids.py` does the matching).
    *   The optional `startStatuses` is what the enemy already carries when the battle opens — the game shows it on a "Status Effect" tab, and no skill description states it in those words. Each item is `<skillId>:<English status name>[:<count>]`, comma-separated, and the `start_status_chips` filter renders it as a status chip in every language, the count after the name. The skill is the one that grants the status, and it is what tells apart the statuses that share a `statusId` (the game overrides them per skill, so `126` is both "Damage Counter" and "Growth"). A name the skill does not apply is written out as plain text with a build warning.

### 5. `shop-table.html`
*   **Purpose**: Formats event-store reward grids.
*   **Details**:
    *   Loads individual store datasets from `_data/stores/<id>.json`.
    *   Renders product icons, item limits, prices, and total farming targets.

---

## 🔌 Custom JavaScript Plugins (`wiki_plugins/`)

The plugins perform server-side calculations during the compilation phase, injecting helpers, tags, and filters directly into Liquid. The logic is in framework-free modules under `wiki_plugins/lib/` (ported from the former Ruby plugins), and `wiki_plugins/liquid/ruby-plugins.js` registers them as Liquid filters and tags. The Jekyll-compatible behaviours of the stock filters (`where`, `sort`, `date`, …) are in `wiki_plugins/liquid/jekyll-filters.js`.

### 1. `lib/chara.js`
*   **Character lookup**: `CharaIndex` is rebuilt whenever the `charas` collection is computed and maps Character IDs (`characterId`) and titles to their corresponding wiki page documents.
*   **Liquid Tag**: `chara_link`
    *   *Usage*: `{% chara_link "Marfik|h1" %}`
    *   *Result*: Renders a styled anchor link to Marfik's hero page, appending the correct icon thumbnail and anchor parameters.
*   **Liquid Filters**:
    *   `charaPageToIcon`: Converts a character's markdown reference page to their corresponding cdn card icon asset.
    *   `charaPageToLink`: Builds a full HTML link complete with thumbnail icon and title.
    *   `stockIdToLink`: Resolves a card's unique `stockId` directly to its respective character page and form anchor.
    *   `stockIdToCharaTitle`: Lookups a stock ID's localized display title.

### 2. `lib/item.js`
*   **Liquid Filters**:
    *   `lah_item`: Renders a customized item badge combining the CDN asset icon, item name, and a Tippy.js tooltip descriptor containing its description. Automatically handles fallbacks and merges definitions from `_data/wiki/Item.yml`.
        *   *Usage*: `{{ itemId | lah_item: rewardType, customName }}`
    *   `lah_item_icon`: Renders only the item icon badge without the descriptive name.

### 3. `lib/skill-text.js` and `lib/skill.js`
*   **Liquid Filters** (`lib/skill-text.js`, see `skill-description.html` above):
    *   `skill_html`, `skill_name_html`, `skill_has_text`: a skill's description / name in every language, from `SkillText.json`.
    *   `start_status_chips`: the statuses an enemy starts a battle with, as chips in every language (`skill-table-manual.html` above).
    *   `skill_tree_name`, `skill_tree_html`, `skill_tree_node_tip`, `skill_tree_json`: the same for a bloom skill of `_data/wiki/SkillUpgradeModel.json` (`hero-skill-evolution-v2.html`). `skill_tree_json` is what `assets/skill-tree.js` reads: the lines and the tree, and per language the raw text parts with their status chips already in them.
*   **Liquid Filters** (`lib/skill.js`):
    *   `element_enum`: Maps element integer IDs (1-5) to their localization strings (Fire, Water, Earth, Light, Shadow).
    *   `status_description`: A status badge with its tooltip (icon, name, description; the description may itself be a Liquid template). Used by the guide pages.
    *   `collect_change_skills`: Traces dynamic skill swap mechanics during combat (e.g., active skills that temporarily transform into other skill nodes).

### 4. `lib/catalog.js` and `lib/image.js`
*   **Liquid Filters**:
    *   `processVoiceActor` / `processCharaGroup`: Split staff credits (`A,B＋C`) and group cards by illustrator, voice actor or affiliation.
    *   `image_dimension`: `[width, height]` of an image file (SVG sizes read like FastImage did: the numbers of the `width`/`height` attributes, units ignored), or nothing if the file does not exist (the `cdn/` checkout is absent in CI).

### 5. `lib/contrib-guard.js` and `lib/editor-data.js` (contributor editing)
*   **Liquid Filter**: `contrib_editable` (`{% if page | contrib_editable %}`) is true for the pages contributors may edit in the browser (`_charas/*.md`, `_events/*.md`, `_main_quests/*.md`, `guide/*.md`, `chara_quests.md`, `mobs.md`); `_layouts/default.html` uses it to show the **Edit** toolbar dropdown (a popover with "Suggest an edit", `data-contrib="page-edit"`, and "Edit on GitHub"; other pages get just the GitHub icon).
*   **The guard**: `checkEdit(beforeBody, afterBody, { allowedIncludes })` decides whether an edited page body may be accepted. It tokenizes `{% %}`, `{{ }}`, `{% raw %}` blocks and kramdown `{: }`; only `chara_link` and includes from the contributor list with literal parameters are free, every other token must stay byte-identical, and new HTML is limited to `<details>`, `<summary>`, `<br>` and table tags. It has no dependencies, so the same file runs in the editor bundle, in CI (`scripts/contrib-guard-ci.mjs`, the `contrib-guard` workflow) and in the build. What contributors may and may not change is in `contributing/index.md`; the include denylist is `INCLUDE_DENYLIST` in the module.
*   **Build outputs**: `contrib-includes.11ty.js` writes `/api/contrib-includes.json` (`{ includes: [...] }`, every top-level `_includes/*.html` minus the denylist) and `editor-data.11ty.js` writes `/api/editor-data.json` (chara pages, item names and icons). `editorDataToRenderData()` turns the latter back into the arguments of `charaLink` and `lahItem`, so the editor preview renders `chara_link` and the item includes with the same functions as the build (tooltips are left out).
