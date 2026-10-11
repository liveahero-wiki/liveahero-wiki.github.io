# Community Team Formation Submissions (wiki-cms)

Visitors can submit and read team formations on event pages (one list per hard difficulty quest) and on every released character page (one list per hero card and per sidekick card). The generic list/form UI and the moderation backend are the separate **wiki-cms** Cloudflare Worker (repo `wiki-cms`, plan in `wiki-cms/docs/IMPLEMENTATION_PLAN.md`); this repo only provides

| Piece | Where |
|---|---|
| Worker URL | `site.cms_url` (`wiki_plugins/site.js`) |
| Page markup that the embed picks up | `_includes/cms-submissions.html`, `_includes/cms-embed-script.html`, used by `_layouts/event.html` and `_layouts/chara.html` (through `hero-infobox.html` / `sidekick-infobox.html`) |
| The groups of a page | `wiki_plugins/lib/cms-groups.js` (Liquid filter `cms_groups`) |
| Registry of valid groups | `cms-groups.11ty.js` -> `/api/cms-groups.json` |
| Roster for the plugin's pickers and icons | `tools/generate_skill_search_index.py` -> `api/team-roster.json` |
| Game plugin (renders/edits a team formation) | `web/cms-plugin/` -> `assets/cms/lah-team-formation.js` |
| Styles | `_sass/_cms.scss` |
| Language hook | `setupCmsLang()` in `assets/main.js` |

## Front matter

**Event pages** declare their hard difficulty quests by hand:

```yaml
team_formations:
- quest: 1272001           # required: a questId from _data/QuestMaster.json
  label: SS-Rank           # optional heading; default: the quest's name (QuestMaster, which is Japanese)
  support: false           # optional, default true: may a submission borrow a support hero?
- quest: 1272002
```

Group id `quest-<questId>`; the section id (anchor) is `team-quest-<questId>`; options `{ support }`.

**Chara pages** need nothing. Every page without `unreleased: true` gets a group `hero-<stockId>` for each `heroes[]` entry and `sidekick-<stockId>` for each `sidekicks[]` entry (anchors `team-hero-<stockId>` / `team-sidekick-<stockId>`, options `{ support: true, focus: { kind, stockId } }`). A card can opt out:

```yaml
heroes:
- stockId: 10253
  team_formations: false
```

Group ids and anchors are a public contract: submissions are stored under the id. They are derived from quest and stock ids only, never from titles or positions.

The build **fails** (with a message naming the page) for: a quest not in `QuestMaster`; `quest` not an integer; `support` not a boolean; `label` not a non-empty string; `team_formations` on an event that is not a list (also `true`); the same `quest` twice on a page; a non-boolean `team_formations` on a card; `team_formations` on the chara page itself (only cards opt out); a group id used by two pages (the registry checks across the site).

## Registry `/api/cms-groups.json`

```json
{ "groups": { "quest-1272001": { "title": "Worthy Foe › SS-Rank …", "url": "/events/2607HighDifficultRevival/#team-quest-1272001", "options": { "support": true } },
              "hero-10251": { "title": "Andrew – Hero", "url": "/charas/andrew/#team-hero-10251", "options": { "support": true, "focus": { "kind": "hero", "stockId": 10251 } } } } }
```

`title` is for the moderators' list: `<event title> › <label>` and `<chara title> – <card>`. The card part is the title the chara tab shows; the base card's tab only repeats the character's name, so there it reads `Hero` / `Sidekick`, and a sidekick variant ends in `(Sidekick)`. `url` carries the fragment the admin links to. wiki-cms is pointed at this file with `--groups-url` and refetches it hourly (and when a group is unknown).

## Page markup

Each group is `<section class="cms-section" id="team-…" data-pagefind-ignore>` with `<div class="cms-submissions" data-cms-api data-cms-type="lah-team-formation" data-cms-group data-cms-plugin="/assets/cms/lah-team-formation.js">`. `<script type="module" src="{{ site.cms_url }}/embed/v1.js">` is emitted once at the end of the layout, only on pages that have groups. The embed loads lazily (IntersectionObserver), so a card tab that is not scrolled to loads nothing.

- Events: one `<h2 id="team-formations">` after the page content, then one section per quest (h3 = label).
- Charas: one section at the end of each card's tab panel. `hero-infobox.html` / `sidekick-infobox.html` only add it when included with `cms=true` (only `chara.html` does), and not for a card that opted out.

### Tab fragments

The tabs of a chara page are panels `#h<stockId>` / `#s<stockId>` in a horizontal scroll container, so `<wiki-tabs>` (`setupWikiTab` in `assets/main.js`) now reveals the panel that *contains* the element a URL fragment names (on load and on `hashchange`), then scrolls the element into view. `/charas/andrew/#team-hero-10252` therefore opens the right tab and lands on the section; the registry uses the `team-…` anchors and the older `#h…` links keep working.

## Language

The embed picks its UI language from `data-cms-lang` on the host element, then `<html lang>`, then `navigator.language`, and re-renders on a `cms:lang` event (`detail` = `en | zh-Hans | zh-Hant | ja`) fired on the host. The wiki's own language choice is `<html data-skill-lang>` (the skill-name language picker in the toolbar, kept in `localStorage.skillSearchLang`, shared with the Skill Search page; see `_includes/js/skill-lang.js`), which already uses those four codes. `setupCmsLang()` in `assets/main.js` copies it to `data-cms-lang` of every `.cms-submissions` on load and, on the `skilllangchange` event the picker fires, updates the attribute and dispatches `cms:lang` on each host. The picker only shows on pages with skill text (chara pages); elsewhere the language is the stored/detected one.

## Theming

`_sass/_cms.scss` maps `--cms-fg/--cms-bg/--cms-border/--cms-accent/--cms-muted/--cms-chip-bg/--cms-support-bg` on `.cms-submissions` to the wiki's tokens (`--text`, `--bg`, `--colorGrey`, `--link`, `--color50`) for light and `html[data-theme="dark"]`; `--cms-support-bg` is `#d9f4f7` (light) / `#1d4a52` (dark).

## Building and running locally

| What | How |
|---|---|
| Worker URL | `CMS_URL=http://localhost:8787` for local development, otherwise `https://wiki-cms.rongjie.workers.dev` (`wiki_plugins/site.js`) |
| Roster | `py tools/generate_skill_search_index.py --lang en` writes `api/team-roster.json` (all four languages, every run; CI already runs the generator) |
| Plugin | `pnpm build:cms-plugin` (also part of `pnpm build`) writes `assets/cms/`; `pnpm watch:cms-plugin` rebuilds on change |
| Tests | `pnpm test` (`wiki_plugins/lib/cms-groups.test.js`, the plugin's tests) |

End to end on one machine:

1. In `wiki-cms`: `wrangler dev` (port 8787). Register the type once in the local database: `cms type add lah-team-formation --origins http://localhost:8080 --plugin-url http://localhost:8080/assets/cms/lah-team-formation.js --groups-url http://localhost:8080/api/cms-groups.json`.
2. Here: `pnpm watch:cms-plugin`, and `CMS_URL=http://localhost:8787 pnpm eleventy:dev` (port 8080).
3. Open `/events/2607HighDifficultRevival/` (three quests, the second with `support: false`) or `/charas/andrew/`, scroll to a section, submit, approve in the admin portal; the list shows it after the cache TTL (or at once with the devtools cache disabled).
