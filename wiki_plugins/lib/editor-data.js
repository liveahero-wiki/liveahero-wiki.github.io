// /api/editor-data.json: the trimmed data the contributor editor needs to render {% chara_link %} and the
// item includes in its preview with the SAME functions as the build (chara.js charaLink, item.js lahItem).
// This module has no node: imports, so the editor bundle can use editorDataToRenderData() directly.
//
//   {
//     version: "<masterdata version>",
//     charas: [{
//       title, url,
//       unreleased?: true, icon?,                       // unreleased pages (charaLink links them with `icon`)
//       characterId?, cards?: { h1: "<resourceName>", h2: ..., s1: ... },  // released pages: the cards of each variant
//       titles?: { h2: "<variant title>", s2: ... },    // variant titles that differ from `title`
//     }],
//     items: { "3": { "<itemId>": { name, icon, wiki?: 1 } } },
//   }
//
// `name` is the English wiki name when there is one, else the (Japanese) master name; `wiki: 1` marks the
// ones from Item.yml, which are the names `{% include item.html name="..." %}` can look up. Item tooltips
// (descriptions) are left out to keep the file small. Cards (rewardType 1 and 2) are derived from the chara
// pages' `cards`; a card that has no chara page is not in the data (lahItem then throws, and the editor
// shows a placeholder chip).

import { CharaIndex } from "./chara.js";
import { dig } from "./ruby.js";

const VARIANTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const blank = (v) => v === null || v === undefined || v === "";

/**
 * @param {{ data: { ItemMaster: object, CardMaster: object, SidekickMaster: object, wiki: { Item: Iterable<[any, any]> } },
 *           charas: Array<Record<string, any>>, version?: string }} input
 *   `charas` are the Jekyll-shaped documents of the charas collection (site.charas).
 */
export function buildEditorData({ data, charas, version = "" }) {
  const entries = [];
  for (const chara of [...charas].sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))) {
    const entry = { title: chara.title, url: chara.url };
    if (chara.unreleased) {
      entry.unreleased = true;
      if (chara.icon) entry.icon = chara.icon;
    } else {
      entry.characterId = Number(chara.characterId);
      const cards = {};
      const titles = {};
      for (const variant of VARIANTS) {
        const cardId = ((1000 + entry.characterId) * 10 + variant) * 10 + 1;
        for (const [suffix, master] of [["h", data.CardMaster], ["s", data.SidekickMaster]]) {
          const resourceName = dig(master, String(cardId), "resourceName");
          if (resourceName === undefined) continue;
          cards[suffix + variant] = resourceName;
          const title = dig(chara, suffix + variant, "title");
          if (variant > 1 && title) titles[suffix + variant] = title;
        }
      }
      if (Object.keys(cards).length) entry.cards = cards;
      if (Object.keys(titles).length) entry.titles = titles;
    }
    entries.push(entry);
  }

  const wikiNames = new Map();
  for (const [id, item] of data.wiki.Item) if (!blank(item?.name)) wikiNames.set(String(id), item.name);
  const items = {};
  for (const [id, item] of Object.entries(data.ItemMaster)) {
    const wiki = wikiNames.get(id);
    items[id] = { name: wiki ?? item.itemName, icon: item.resourceName };
    if (wiki !== undefined) items[id].wiki = 1;
  }

  return { version, charas: entries, items: { 3: items } };
}

/**
 * Rebuilds the inputs of chara.js `charaLink(input, charaDeps)` and item.js `lahItem(id, rewardType, name,
 * itemData, charaDeps)` / `lahItemIcon(id, rewardType, name, itemData)` from the JSON.
 */
export function editorDataToRenderData(editorData) {
  const index = new CharaIndex();
  const CardMaster = {};
  const SidekickMaster = {};
  const pages = editorData.charas.map((c) => {
    const page = { title: c.title, url: c.url, unreleased: Boolean(c.unreleased), characterId: c.characterId };
    if (c.icon) page.icon = c.icon;
    for (const [key, title] of Object.entries(c.titles ?? {})) page[key] = { title };
    for (const [key, resourceName] of Object.entries(c.cards ?? {})) {
      const stockId = (1000 + c.characterId) * 10 + Number(key.slice(1));
      (key[0] === "h" ? CardMaster : SidekickMaster)[stockId * 10 + 1] = { resourceName, stockId, cardName: c.title };
    }
    return page;
  });
  index.rebuild(pages);

  const ItemMaster = {};
  const wikiItem = new Map();
  for (const [id, item] of Object.entries(editorData.items?.[3] ?? {})) {
    ItemMaster[id] = { itemName: item.name, resourceName: item.icon, description: "" };
    if (item.wiki) wikiItem.set(Number(id), { name: item.name, description: null });
  }

  const charaDeps = { index, data: { CardMaster, SidekickMaster } };
  const itemData = { ItemMaster, CardMaster, SidekickMaster, wiki: { Item: wikiItem } };
  return { charaDeps, itemData };
}
