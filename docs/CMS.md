# Community Team Formation Submissions (wiki-cms)

Visitors read, filter and submit team formations on one page, the **Team Creator** (`/team-creator.html`, `team-creator.md`). The generic list/form UI and the moderation backend are the separate **wiki-cms** Cloudflare Worker (repo `wiki-cms`, plan in `wiki-cms/docs/TEAM_CREATOR_PLAN.md`); this repo only provides

| Piece | Where |
|---|---|
| Worker URL | `site.cms_url` (`wiki_plugins/site.js`) |
| The page (host `<div>`, intro) | `team-creator.md`, `_includes/cms-embed-script.html`; header link in `_includes/header.html` (Tools) |
| Links to the page | `_includes/team-creator-link.html`, used by `hero-infobox.html`, `sidekick-infobox.html`, `_layouts/event.html` and `guide/challenge_simulator.md` |
| Targets of a page | `wiki_plugins/lib/cms-groups.js` (Liquid filter `cms_targets`) |
| Registry of valid groups and targets | `cms-groups.11ty.js` -> `/api/cms-groups.json` |
| Roster for the plugin's pickers, icons and `limited` filter | `tools/generate_skill_search_index.py` -> `api/team-roster.json` |
| Game plugin (renders, edits and filters a team formation) | `web/cms-plugin/` -> `assets/cms/lah-team-formation.js` |
| Styles | `_sass/_cms.scss` (host variables, links), `web/cms-plugin/styles.css` (the plugin's own markup, classes `cms-lah-*`) |
| Language hook | `setupCmsLang()` in `assets/main.js` |

Chara, event and guide pages carry **no embed** (no request to the Worker at all): they only link to the Team Creator with a pre-filtered URL hash.

## The page

`team-creator.md` hosts the embed in the `catalog` layout:

```html
<div class="cms-submissions" data-cms-type="lah-team-formation" data-cms-group="all" data-cms-layout="catalog"
     data-cms-plugin="/assets/cms/lah-team-formation.js" data-cms-api="{{ site.cms_url }}"></div>
{% include cms-embed-script.html %}
```

`<script type="module" src="{{ site.cms_url }}/embed/v1.js">` loads the embed; it loads the list lazily (IntersectionObserver). Everything is one group, `all`: one cached API response holds every approved team, and all filtering happens in the browser.

## URL hash parameters

The filter state lives in the hash (`/team-creator.html#hero=12641&t.teamType=auto`), so a filtered list can be bookmarked and the links of the other pages can pre-filter it. The core owns `q`, `sort`, `lang` and `t.<tagKey>` (comma list); the plugin (`web/cms-plugin/filters.ts`) owns the rest. Only non-default values are written.

| Key | Meaning |
|---|---|
| `target=<id>[,<id>…]` | built for any of these targets (a team without a target never matches) |
| `hero=<stockId>[,…]` | the team uses **all** of these heroes (the borrowed support counts) |
| `xhero=<stockId>[,…]` | the team uses **none** of these heroes |
| `sk=<stockId>[,…]` / `xsk=…` | the same for **active** sidekicks (passives are not filtered) |
| `tree=0` | hide teams where any slot needs the skill tree |
| `bloom=0` | hide teams where any slot uses blooming |
| `lim=<0..4>` | at most this many limited-time heroes (default 5 = no limit); `sort=limited` sorts by fewest first |

The borrowed support slot counts in every one of these (a viewer may own the unit that the submitter borrowed, and borrow a different one).

Links the wiki generates (`_includes/team-creator-link.html`): a hero card links `#hero=<stockId>` ("Community teams using this hero"), a sidekick card `#sk=<stockId>` ("…using this sidekick as active"), and every page with `team_formations` gets one `#target=<id>` link per target. Old anchors such as `#team-hero-10251` no longer exist; the tab-fragment code just finds no element.

## Targets (`team_formations:` front matter)

A target is a fight that a team can be built for ("Purpose-built for" in the form, a chip on the card, a filter). Anything else goes in the team's name. A page lists its targets in `team_formations:` (event, guide and other non-chara pages):

```yaml
team_formations:
- quest: 616001                 # a questId; the id defaults to quest-616001, the ja label to the QuestMaster name
  label: Simulator - Lantern-type Kaibutsu (SSS)   # a string (en) or a map of en / ja / zh-Hans / zh-Hant
- id: rogue-2609                # no QuestMaster entry: id and label are both required
  label:
    en: "Unexplored: The Inventor and the Runaway Mechanism - final boss"
    ja: "…"
  retired: true                 # optional on any entry
```

- `id`: `^[a-z0-9][a-z0-9-]{0,63}$`, unique across the whole site, **permanent**: it is stored in submissions and used in links. By convention `quest-<questId>` for real quests and `rogue-<event>` for Unexplored bosses.
- `label`: at least one language. The plugin falls back from the UI language to `en`, then `ja`, then any language present. QuestMaster (Japanese) only supplies a default `ja` label.
- `retired: true`: hidden from the submit form, but still valid and filterable. **To remove a target, retire it, never delete it**: a deleted id makes the rows that use it fail validation when a moderator edits them (the plugin shows an unknown id as a plain chip with the raw id).
- The target's `url` is the page that declares it (the chip links to it).

Adding or retiring a target is a wiki-only change: edit the front matter and deploy the wiki. The Worker's hourly cron refetches the registry and republishes the group; `cms republish --type lah-team-formation` does it at once. Until then a submission that picks the new target is rejected (`target_unknown`).

The build **fails** (with a message naming the page) for: an entry with neither `quest` nor `id`; `quest` not an integer; a malformed `id`; an entry without any label (a `quest` in QuestMaster has its Japanese name); a label that is not a non-empty string or a map of the four languages; `retired` not a boolean; the removed `support` key (a borrowed support is optional for every team); `team_formations` that is not a list (also `true`) or that is on a chara page; the same id twice on a page or on two pages. A `quest` that is not in `QuestMaster` only **warns** (it is just a convenience), and then `label` is required.

## Registry `/api/cms-groups.json`

```json
{ "groups": { "all": { "title": "Team Creator", "url": "/team-creator.html",
    "options": { "support": "optional",
      "targets": [ { "id": "quest-616001", "label": { "en": "Simulator - Lantern-type Kaibutsu (SSS)", "ja": "シミュレート・灯篭型カイブツ" }, "url": "/guide/challenge_simulator/" } ] } } } }
```

Targets are in collection order (the order of the picker and the filter). `support: 'optional'` lets a team leave out the borrowed support. wiki-cms is pointed at this file with `--groups-url` and refetches it hourly (and when a group is unknown); the Worker's validator and the plugin both read `options.targets` from it.

`wiki_plugins/lib/cms-groups.js` also still emits the **legacy per-page groups** (`quest-<questId>`, `hero-<stockId>`, `sidekick-<stockId>`) while `EMIT_LEGACY_GROUPS = true`. They exist only so that submissions made before the move to `all` stay valid until the Worker has migrated them (wiki-cms `scripts/data/2026-10-team-creator.sql`). Once that is done, set the constant to `false` (or delete the block at the end of the file) and delete `legacy_team_formations:` from `guide/quest.md` and `_events/2607HighDifficultRevival.md`.

## Roster `limited`

`api/team-roster.json` (all four languages' names, written by every run of `tools/generate_skill_search_index.py`) has `limited: boolean` on every hero and sidekick: `limited: true` on the card's entry (`heroes[]` / `sidekicks[]`, matched by `stockId`) in the chara page's front matter; missing = `false`. The plugin counts the `limited` heroes of every slot for the "max limited-time heroes" filter and the `limited` sort. After changing `limited:` on a chara page, regenerate the roster.

## Language

The embed picks its UI language from `data-cms-lang` on the host element, then `<html lang>`, then `navigator.language`, and re-renders on a `cms:lang` event (`detail` = `en | zh-Hans | zh-Hant | ja`) fired on the host. The wiki's own language choice is `<html data-skill-lang>` (the skill-name language picker, kept in `localStorage.skillSearchLang`, shared with the Skill Search page; see `_includes/js/skill-lang.js`), which uses the same four codes. `setupCmsLang()` in `assets/main.js` copies it to `data-cms-lang` of every `.cms-submissions` (so the host needs that class) on load and, on the `skilllangchange` event, updates the attribute and dispatches `cms:lang`. The picker only shows on pages with skill text (chara pages); on the Team Creator the language is the stored/detected one.

## Theming

`_sass/_cms.scss` maps `--cms-fg/--cms-bg/--cms-border/--cms-accent/--cms-muted/--cms-chip-bg/--cms-support-bg` on `.cms-submissions` to the wiki's tokens (`--text`, `--bg`, `--colorGrey`, `--link`, `--color50`) for light and `html[data-theme="dark"]`; `--cms-support-bg` is `#d9f4f7` (light) / `#1d4a52` (dark). The embed's core stylesheet and the plugin's (`.cms-lah*`, injected once as `<style id="cms-plugin-lah-team-formation">`) read the same variables.

## Plugin

`web/cms-plugin/` is a Preact module implementing wiki-cms' `SubmissionPlugin` (`plugin-api.ts` is a verbatim copy of `wiki-cms/src/shared/plugin-api.ts`; its `Lang` import resolves to `i18n.ts`). Besides the summary / detail / editor it exports the optional `listFilter` that the `catalog` layout hosts: `filters.ts` (state, hash keys, matcher, pure), `FilterPanel.tsx` + `FilterControls.tsx` (the `basic` part: a target dropdown with checkboxes, and one search box for heroes and sidekicks whose suggestions each have a [+] (must use) / [-] (must not use) button; the `advanced` part: skill tree, blooming, max limited-time heroes) and the sort `limited`. `targets.ts` parses `options.targets` for the editor ("Purpose-built for" select), the chip and the filter; `validate.ts` mirrors the Worker's validator (support mode `required` / `optional` / `none`, `target_unknown`). UI strings are in `i18n/` (`en`, `zh-Hans`, `zh-Hant`, `ja`; a test keeps them in sync).

## Building and running locally

| What | How |
|---|---|
| Worker URL | `CMS_URL=http://localhost:8787` for local development, otherwise `https://wiki-cms.rongjie.workers.dev` (`wiki_plugins/site.js`) |
| Roster | `py tools/generate_skill_search_index.py --lang en` writes `api/team-roster.json` (all four languages, every run; CI already runs the generator) |
| Plugin | `pnpm build:cms-plugin` (also part of `pnpm build`) writes `assets/cms/`; `pnpm watch:cms-plugin` rebuilds on change; `pnpm dev:cms-plugin` serves the standalone harness at `/dev.html` (editor scenarios, list filter parts) |
| Tests | `pnpm test` (`wiki_plugins/lib/cms-groups.test.js`, the plugin's tests), `pnpm typecheck:cms-plugin` |

End to end on one machine:

1. In `wiki-cms`: `wrangler dev` (port 8787). Register the type once in the local database: `cms type add lah-team-formation --origins http://localhost:8080 --plugin-url http://localhost:8080/assets/cms/lah-team-formation.js --groups-url http://localhost:8080/api/cms-groups.json`.
2. Here: `pnpm watch:cms-plugin`, and `CMS_URL=http://localhost:8787 pnpm eleventy:dev` (port 8080).
3. Open `/team-creator.html` (or a chara page, then follow its "Community teams using this hero" link), try the filters, submit, approve in the admin portal; the list shows it after the cache TTL (or at once with the devtools cache disabled).
