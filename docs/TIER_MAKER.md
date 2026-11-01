# Tier Maker

The `/tier_maker/` page lets readers rank every hero and sidekick into editable tiers, export the result as a PNG, and re-import that PNG to keep editing.

| Piece | Where |
|---|---|
| Page (thin mount, like `team_creator.md`) | `tier_maker.md` |
| App source | `web/tier-maker/` (`App.tsx`, pure modules `model.ts` / `candidates.ts` / `pngMeta.ts`, canvas `export.ts`, pointer drag `dnd.ts`) |
| Bundle | `assets/cms/tier-maker.js` (gitignored, built by `pnpm build` or `pnpm build:tier-maker`; one `LIBS` entry in `vite.config.ts`) |
| Dev harness | `pnpm dev`, then `/tier-maker/dev/dev.html` (needs a local `api/team-roster.json`) |
| Tests | `web/tier-maker/*.test.ts` (run by `pnpm test`) |

## Characters

The roster is `api/team-roster.json` (written by `tools/generate_skill_search_index.py`, `build_roster`), loaded with `web/cms-plugin/roster.ts`. The tier maker lists the same set as `/charas/`: heroes and sidekicks with `stockId < 90000`.

- **Variant**: `stockId % 10 >= 2` (`stockId = (1000 + characterId) * 10 + variant`).
- **Mob**: a part-time unit, the stock's lowest rarity is 1. The roster's `isMob` field (the same flag the skill index uses).
- The **Hide variants** / **Hide mobs** toggles only filter the pool of unranked characters; characters already in a tier stay there.

## Saved data and PNG metadata

The tier list is `{ v: 1, title, tiers: [{ id, name, color, items: ["h10011", "s10011", ...] }] }`; keys are `h<stockId>` for heroes and `s<stockId>` for sidekicks. It is autosaved to `localStorage["lahTierMaker:v1"]`.

An exported PNG embeds that JSON, UTF-8 and uncompressed, in an `iTXt` chunk with the keyword `lah-tier-list`, placed right after IHDR. Import reads the chunk and passes the JSON through `sanitize()` (unknown or duplicate characters are dropped and counted). Image hosts that re-encode uploads strip the chunk, so share the original file.

The image itself is drawn on a canvas (not a DOM screenshot) from the icons at `https://liveahero-wiki.github.io/cdn/Sprite/`; that host must keep sending CORS headers, or the canvas is tainted and export fails.

## Input

Mouse users drag characters; touch and pen users (and keyboards) click or tap a character, then a tier row (or its "Place here" button). Touch and pen drag are deliberately not supported: a finger or stylus must still scroll the page and the pool, and the browser's pan cancels the pointer stream mid-drag. During a drag the ghost icon is moved directly (`ghostRef` in `dnd.ts`) and the pool's tiles are memoized, so the app only re-renders when the drop position changes.
