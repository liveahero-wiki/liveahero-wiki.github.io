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
*   **Purpose**: The central skill block component.
*   **Details**:
    *   Renders active skill cooldowns, VP requirements, targets, and trigger conditions.
    *   Invokes `skill-effect-description-v2.html` to compile status effects, damage percentages, and specific action modifiers.

### 4. `shop-table.html`
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

### 3. `lib/skill.js` and `lib/skill-trigger.js`
*   **Liquid Filters**:
    *   `render_liquid`: Renders a Liquid string stored in data (e.g. `_data/wiki/SkillManualOverride.yml`) in the current context.
    *   `element_enum`: Maps element integer IDs (1-5) to their localization strings (Fire, Water, Earth, Light, Shadow).
    *   `skill_target`: Standardizes skill target values into descriptive categories (e.g., "Ally with lowest HP", "All enemies except target").
    *   `skill_trigger`: Formulates clear trigger requirement descriptions from complex skill condition blocks (e.g. combo criteria, own/enemy HP percentages, active status possessions).
    *   `status_description` / `status_description_v2`: Resolves status effects to formatted badges containing icons, classifications (Buff/Debuff/System), stackability indicators, and detailed tooltips.
    *   `collect_change_skills`: Traces dynamic skill swap mechanics during combat (e.g., active skills that temporarily transform into other skill nodes).

### 4. `lib/catalog.js` and `lib/image.js`
*   **Liquid Filters**:
    *   `processVoiceActor` / `processCharaGroup`: Split staff credits (`A,B＋C`) and group cards by illustrator, voice actor or affiliation.
    *   `image_dimension`: `[width, height]` of an image file (SVG sizes read like FastImage did: the numbers of the `width`/`height` attributes, units ignored), or nothing if the file does not exist (the `cdn/` checkout is absent in CI).
