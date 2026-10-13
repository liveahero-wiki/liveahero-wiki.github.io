// The submission targets and the group registry of the community team-formation feature
// (wiki-cms, docs/CMS.md).
//
// One helper, three consumers: the page includes (`{% assign targets = page | cms_targets %}`), the
// registry /api/cms-groups.json (cms-groups.11ty.js) and the tests, so ids, labels and urls cannot drift.
//
// There is a single submission group, `all` (the Team Creator page). Pages declare the fights worth
// targeting in `team_formations:`; every entry becomes a *target* of that group:
//
//   team_formations:
//   - quest: 616001                 # a questId; the id defaults to quest-616001, the ja label to the QuestMaster name
//     label: Simulator - Lantern-type Kaibutsu (SSS)   # string (en) or a map of en / ja / zh-Hans / zh-Hant
//   - id: rogue-2609                # no QuestMaster entry: id and label are both required
//     label: "Unexplored: ... final boss"
//     retired: true                 # optional: hidden from the submit form, still valid and filterable
//
// Target ids are a public contract (they are stored in submissions and used in links): they never change.
// To remove a target, mark it `retired`. Anything wrong in the front matter throws, so that it fails the
// build instead of silently losing a target.

import { stockIdToLinkImpl } from "./chara.js";

/** The one group of the registry. */
export const TEAM_CREATOR = { groupId: "all", title: "Team Creator", url: "/team-creator.html" };

const LANGS = ["en", "ja", "zh-Hans", "zh-Hant"];
const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const where = (page) => `${page.url ?? page.path ?? "(unknown page)"}`;
const nonEmpty = (v) => typeof v === "string" && v.trim() !== "";

/**
 * @typedef {object} CmsTarget
 * @property {string} id permanent slug (`quest-<questId>` by convention)
 * @property {Partial<Record<"en" | "ja" | "zh-Hans" | "zh-Hant", string>>} label
 * @property {string} url the declaring page
 * @property {true} [retired]
 */

/**
 * The targets declared by one page (front matter flat on `page`, plus `url`; a document of
 * `site.<collection>`, Liquid's `page` and `{ ...item.data, url: item.url }` all qualify).
 *
 * @param {Record<string, any>} page
 * @param {{ data: { QuestMaster?: Record<string, any> }, warn?: (message: string) => void }} deps `site` (only `data` is read)
 * @returns {CmsTarget[]}
 */
export function cmsTargets(page, deps) {
  const declared = page.team_formations;
  if (declared === undefined || declared === null) return [];
  if (page.characterId !== undefined && page.characterId !== null) {
    throw new Error(`${where(page)}: team_formations declares fights worth targeting and is not allowed on a chara page`);
  }
  if (!Array.isArray(declared)) {
    throw new Error(`${where(page)}: team_formations must be a list of { quest?, id?, label?, retired? } entries, not ${JSON.stringify(declared)}`);
  }

  const warn = deps.warn ?? ((message) => console.warn(message));
  const questMaster = deps.data?.QuestMaster ?? {};
  const seen = new Set();
  return declared.map((entry, i) => {
    const at = `${where(page)}: team_formations[${i}]`;
    if (!isObject(entry)) throw new Error(`${at} must be a mapping with a "quest" and/or an "id" key, not ${JSON.stringify(entry)}`);
    const { quest, id: givenId, label, retired } = entry;
    if (Object.hasOwn(entry, "support")) {
      throw new Error(`${at}.support was removed: a borrowed support is optional for every team (delete the key)`);
    }
    if (quest === undefined && givenId === undefined) throw new Error(`${at} needs a "quest" (a questId) and/or an "id"`);
    if (quest !== undefined && !Number.isInteger(quest)) {
      throw new Error(`${at}.quest must be an integer questId, not ${JSON.stringify(quest)}`);
    }
    if (givenId !== undefined && (typeof givenId !== "string" || !ID_RE.test(givenId))) {
      throw new Error(`${at}.id must match ${ID_RE}, not ${JSON.stringify(givenId)}`);
    }
    if (retired !== undefined && typeof retired !== "boolean") {
      throw new Error(`${at}.retired must be true or false, not ${JSON.stringify(retired)}`);
    }

    const id = givenId ?? `quest-${quest}`;
    if (seen.has(id)) throw new Error(`${where(page)}: target ${id} is declared twice`);
    seen.add(id);

    let master;
    if (quest !== undefined) {
      master = questMaster[String(quest)];
      if (!master) {
        warn(`${at}.quest ${quest} is not in _data/QuestMaster.json; it is only used for the default id and the Japanese label, so "label" is required`);
      }
    }

    const target = { id, label: targetLabel(at, label, master), url: page.url };
    if (retired) target.retired = true;
    return target;
  });
}

/** `label` (a string = en, or a map) plus the QuestMaster's Japanese name as the default ja label. */
function targetLabel(at, label, master) {
  const out = {};
  if (label === undefined || label === null) {
    // no label: fall through to the QuestMaster name below
  } else if (typeof label === "string") {
    if (!nonEmpty(label)) throw new Error(`${at}.label must be a non-empty string or a map of languages, not ${JSON.stringify(label)}`);
    out.en = label.trim();
  } else if (isObject(label)) {
    for (const [lang, text] of Object.entries(label)) {
      if (!LANGS.includes(lang)) throw new Error(`${at}.label.${lang}: unknown language (use ${LANGS.join(", ")})`);
      if (!nonEmpty(text)) throw new Error(`${at}.label.${lang} must be a non-empty string, not ${JSON.stringify(text)}`);
      out[lang] = text.trim();
    }
  } else {
    throw new Error(`${at}.label must be a non-empty string or a map of languages, not ${JSON.stringify(label)}`);
  }

  // QuestMaster is Japanese: it only provides the ja label when none was given.
  const questName = String(master?.questName ?? "").trim();
  if (out.ja === undefined && questName) out.ja = questName;
  if (Object.keys(out).length === 0) {
    throw new Error(`${at} has no label: give "label" (a string, or a map of ${LANGS.join(" / ")})`);
  }
  // en, ja, zh-Hans, zh-Hant, in that order
  return Object.fromEntries(LANGS.filter((lang) => out[lang] !== undefined).map((lang) => [lang, out[lang]]));
}

/**
 * The registry /api/cms-groups.json: `{ groups: { all: { title, url, options: { support, targets } } } }`,
 * the targets of every page in the order of `pages` (the collection order). Throws when two pages declare
 * the same target id.
 *
 * @param {Array<Record<string, any>>} pages
 * @param {Parameters<typeof cmsTargets>[1]} deps
 */
export function cmsGroupRegistry(pages, deps) {
  const targets = [];
  const owner = {};
  for (const page of pages) {
    for (const target of cmsTargets(page, deps)) {
      if (Object.hasOwn(owner, target.id)) {
        throw new Error(`duplicate target ${target.id}: declared by ${owner[target.id]} and ${where(page)}`);
      }
      owner[target.id] = where(page);
      targets.push(target);
    }
  }

  const groups = {
    [TEAM_CREATOR.groupId]: {
      title: TEAM_CREATOR.title,
      url: TEAM_CREATOR.url,
      options: { support: "optional", targets },
    },
  };
  if (EMIT_LEGACY_GROUPS) Object.assign(groups, legacyGroupRegistry(pages, deps));
  return { groups };
}

// ---------------------------------------------------------------------------------------------------
// Legacy per-page groups (REMOVABLE). Until the Worker has migrated every submission to the `all` group
// (wiki-cms docs/TEAM_CREATOR_PLAN.md, rollout phase 2), the registry keeps the groups the old embeds used,
// so that existing submissions in `quest-<questId>` / `hero-<stockId>` / `sidekick-<stockId>` stay valid
// and moderatable. Phase 3: set EMIT_LEGACY_GROUPS to false, or delete everything from here to the end of
// this file (and the `legacyGroupRegistry` call above), then delete `legacy_team_formations:` from the pages
// that still have it (guide/quest.md, _events/2607HighDifficultRevival.md). Nothing else reads it.
// ---------------------------------------------------------------------------------------------------

/** Phase 3: set to false (or remove the legacy block below). */
export const EMIT_LEGACY_GROUPS = true;

/**
 * Legacy groups of one page: events get `quest-<questId>` for every entry with a `quest` in
 * `team_formations:` (the new target format) and `legacy_team_formations:` (the old format, which may still
 * carry `support: false`); released chara pages get one group per card.
 */
function legacyGroups(page, deps) {
  const isChara = page.characterId !== undefined && page.characterId !== null;
  return isChara ? legacyCharaGroups(page, deps) : legacyEventGroups(page, deps);
}

const asList = (v) => (Array.isArray(v) ? v : []);

function legacyEventGroups(page, { data }) {
  const title = page.title || page.jp_title || "";
  const questMaster = data?.QuestMaster ?? {};
  const groups = new Map();
  for (const entry of [...asList(page.team_formations), ...asList(page.legacy_team_formations)]) {
    if (!isObject(entry) || !Number.isInteger(entry.quest)) continue; // free-form targets have no legacy group
    const groupId = `quest-${entry.quest}`;
    if (groups.has(groupId)) continue;
    const label = isObject(entry.label) ? entry.label.en : entry.label;
    const heading = (nonEmpty(label) ? label.trim() : "") || String(questMaster[String(entry.quest)]?.questName ?? "").trim() || groupId;
    groups.set(groupId, {
      groupId,
      title: `${title} › ${heading}`,
      url: `${page.url}#team-${groupId}`,
      options: { support: entry.support === false ? false : true },
    });
  }
  return [...groups.values()];
}

function legacyCharaGroups(page, { data }) {
  if (page.unreleased) return [];
  const groups = [];
  for (const [list, kind, type] of [
    ["heroes", "hero", 1],
    ["sidekicks", "sidekick", 2],
  ]) {
    const cards = page[list];
    if (cards === undefined || cards === null) continue;
    if (!Array.isArray(cards)) throw new Error(`${where(page)}: ${list} must be a list`);
    cards.forEach((card, i) => {
      const at = `${where(page)}: ${list}[${i}]`;
      if (!isObject(card) || !Number.isInteger(card.stockId)) {
        throw new Error(`${at}.stockId must be an integer, not ${JSON.stringify(card?.stockId)}`);
      }
      const groupId = `${kind}-${card.stockId}`;
      groups.push({
        groupId,
        title: `${page.title} – ${legacyCardLabel(page, card.stockId, kind, type, data)}`,
        url: `${page.url}#team-${groupId}`,
        options: { support: true, focus: { kind, stockId: card.stockId } },
      });
    });
  }
  return groups;
}

/**
 * The card's name as its tab shows it (`stockIdToCharaTitle`); the base card's tab just repeats the
 * character's name, so there it is "Hero" / "Sidekick", and a sidekick variant says it is the sidekick.
 */
function legacyCardLabel(page, stockId, kind, type, data) {
  const tabTitle = stockIdToLinkImpl(stockId, type, { index: null, data: data ?? {} }, page)[0];
  const same = !tabTitle || tabTitle === page.title;
  if (kind === "hero") return same ? "Hero" : tabTitle;
  return same ? "Sidekick" : `${tabTitle} (Sidekick)`;
}

/** `{ <groupId>: { title, url, options } }` of every page; two pages declaring one group id fail the build. */
function legacyGroupRegistry(pages, deps) {
  const groups = {};
  const owner = {};
  for (const page of pages) {
    for (const group of legacyGroups(page, deps)) {
      if (Object.hasOwn(groups, group.groupId)) {
        throw new Error(`duplicate legacy submission group ${group.groupId}: declared by ${owner[group.groupId]} and ${where(page)}`);
      }
      owner[group.groupId] = where(page);
      groups[group.groupId] = { title: group.title, url: group.url, options: group.options };
    }
  }
  return groups;
}
