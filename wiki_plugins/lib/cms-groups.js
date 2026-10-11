// The submission groups of a page, for the community team-formation feature (wiki-cms, docs/CMS.md).
//
// One helper, two consumers: the page includes (`{% assign groups = page | cms_groups %}`) and the
// registry /api/cms-groups.json (cms-groups.11ty.js), so ids, titles and anchors cannot drift.
//
// - event pages declare their hard difficulty quests in `team_formations:` -> `quest-<questId>`
// - released chara pages get one group per card, automatically: `hero-<stockId>` / `sidekick-<stockId>`
//   (a card can opt out with `team_formations: false`)
//
// Group ids and anchors are a public contract (submissions are stored under the id): they come from
// quest/stock ids only, never from titles or positions. Anything wrong in the front matter throws so
// that it fails the build instead of silently losing or misplacing a group.

import { stockIdToLinkImpl } from "./chara.js";

/**
 * @typedef {object} CmsGroup
 * @property {string} groupId `quest-<questId>`, `hero-<stockId>` or `sidekick-<stockId>`
 * @property {string} title for the admin list: `<event> › <label>` or `<chara> – <card>`
 * @property {string} url `<page.url>#<anchor>`
 * @property {string} anchor id of the section that holds the embed (`team-<groupId>`)
 * @property {string} label heading text of the embed on an event page (the card title on a chara page)
 * @property {{ support: boolean, focus?: { kind: "hero" | "sidekick", stockId: number } }} options
 */

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const where = (page) => `${page.url ?? page.path ?? "(unknown page)"}`;

/**
 * The groups of one page (front matter flat on `page`, plus `url`; a document of `site.<collection>`,
 * Liquid's `page` and `{ ...item.data, url: item.url }` all qualify).
 *
 * @param {Record<string, any>} page
 * @param {{ data: { QuestMaster?: Record<string, any> } }} deps `site` (only `data` is read)
 * @returns {CmsGroup[]}
 */
export function cmsGroups(page, deps) {
  const groups = page.characterId === undefined || page.characterId === null ? eventGroups(page, deps) : charaGroups(page, deps);
  const seen = new Set();
  for (const group of groups) {
    if (seen.has(group.groupId)) throw new Error(`${where(page)}: group ${group.groupId} is declared twice`);
    seen.add(group.groupId);
  }
  return groups;
}

/** Event pages: one group per `team_formations[]` entry (a quest id, so no entry may repeat). */
function eventGroups(page, { data }) {
  const declared = page.team_formations;
  if (declared === undefined || declared === null) return [];
  if (!Array.isArray(declared)) {
    throw new Error(
      `${where(page)}: team_formations must be a list of { quest, label?, support? } entries on an event page, not ${JSON.stringify(declared)}`,
    );
  }

  const title = page.title || page.jp_title || "";
  const questMaster = data?.QuestMaster ?? {};
  return declared.map((entry, i) => {
    const at = `${where(page)}: team_formations[${i}]`;
    if (!isObject(entry)) throw new Error(`${at} must be a mapping with a "quest" key, not ${JSON.stringify(entry)}`);
    const { quest, label, support } = entry;
    if (!Number.isInteger(quest)) {
      throw new Error(`${at}.quest must be an integer questId, not ${JSON.stringify(quest)}`);
    }
    const master = questMaster[String(quest)];
    if (!master) throw new Error(`${at}.quest ${quest} is not in _data/QuestMaster.json`);
    if (support !== undefined && typeof support !== "boolean") {
      throw new Error(`${at}.support must be true or false, not ${JSON.stringify(support)}`);
    }
    if (label !== undefined && (typeof label !== "string" || label.trim() === "")) {
      throw new Error(`${at}.label must be a non-empty string, not ${JSON.stringify(label)}`);
    }

    const groupId = `quest-${quest}`;
    // No translated quest names exist in the wiki's data (QuestMaster is Japanese): give `label:` for English.
    const heading = label?.trim() || String(master.questName ?? "").trim() || groupId;
    const anchor = `team-${groupId}`;
    return {
      groupId,
      title: `${title} › ${heading}`,
      url: `${page.url}#${anchor}`,
      anchor,
      label: heading,
      options: { support: support ?? true },
    };
  });
}

/** Released chara pages: one group per `heroes[]` / `sidekicks[]` card unless it opts out. */
function charaGroups(page, { data }) {
  if (page.unreleased) return [];
  if (page.team_formations !== undefined && page.team_formations !== null) {
    throw new Error(`${where(page)}: team_formations is not allowed on a chara page; opt a card out with "team_formations: false" on its heroes/sidekicks entry`);
  }

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
      const optOut = card.team_formations;
      if (optOut !== undefined && typeof optOut !== "boolean") {
        throw new Error(`${at}.team_formations must be true or false, not ${JSON.stringify(optOut)}`);
      }
      if (optOut === false) return;

      const groupId = `${kind}-${card.stockId}`;
      const anchor = `team-${groupId}`;
      const label = cardLabel(page, card.stockId, kind, type, data);
      groups.push({
        groupId,
        title: `${page.title} – ${label}`,
        url: `${page.url}#${anchor}`,
        anchor,
        label,
        options: { support: true, focus: { kind, stockId: card.stockId } },
      });
    });
  }
  return groups;
}

/**
 * The card's name as its tab shows it (`stockIdToCharaTitle`); the base card's tab just repeats the
 * character's name, so there it is "Hero" / "Sidekick", and a sidekick variant says it is the sidekick
 * (a hero and a sidekick card share a title otherwise).
 */
function cardLabel(page, stockId, kind, type, data) {
  const tabTitle = stockIdToLinkImpl(stockId, type, { index: null, data: data ?? {} }, page)[0];
  const same = !tabTitle || tabTitle === page.title;
  if (kind === "hero") return same ? "Hero" : tabTitle;
  return same ? "Sidekick" : `${tabTitle} (Sidekick)`;
}

/**
 * The registry /api/cms-groups.json: `{ groups: { <groupId>: { title, url, options } } }`.
 * Throws when two pages declare the same group id.
 *
 * @param {Array<Record<string, any>>} pages
 * @param {Parameters<typeof cmsGroups>[1]} deps
 */
export function cmsGroupRegistry(pages, deps) {
  const groups = {};
  const owner = {};
  for (const page of pages) {
    for (const group of cmsGroups(page, deps)) {
      if (Object.hasOwn(groups, group.groupId)) {
        throw new Error(`duplicate submission group ${group.groupId}: declared by ${owner[group.groupId]} and ${where(page)}`);
      }
      owner[group.groupId] = where(page);
      groups[group.groupId] = { title: group.title, url: group.url, options: group.options };
    }
  }
  return { groups };
}
