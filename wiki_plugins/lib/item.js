// Port of _plugins/item.rb: item chips such as
//   <span class="item tippy" data-content="…"><img src="/cdn/Sprite/item_x.png"> Name</span>
// rewardType: 3 = item (default), 1 = hero card, 2 = sidekick card, 10 = skill evolution.

import { dig, str, xmlEscape } from "./ruby.js";

const nameToIdMaps = new WeakMap();

/** Item.yml entries by their wiki name. */
function itemWikiNameToId(itemWiki) {
  let map = nameToIdMaps.get(itemWiki);
  if (!map) {
    map = new Map();
    for (const [id, item] of itemWiki) map.set(item.name, id); // IntKeyMap: numeric ids, like Ruby's Hash#each
    nameToIdMaps.set(itemWiki, map);
  }
  return map;
}

const blank = (v) => v === null || v === undefined || v === "";

function resolveItem(id, name, data) {
  if ((id === null || id === undefined || id === false) && name) {
    id = itemWikiNameToId(data.wiki.Item).get(name);
  }
  return id;
}

function cardIcon(id, rewardType, data) {
  const master = rewardType === 1 ? data.CardMaster : data.SidekickMaster;
  const card = dig(master, str(id)) ?? {};
  if (card.resourceName === undefined) {
    throw new TypeError(`lah_item: no resourceName for ${rewardType === 1 ? "card" : "sidekick"} ${str(id)}`);
  }
  return { card, resourceName: card.resourceName + (rewardType === 1 ? "_h01" : "_s01") };
}

function itemOf(id, data) {
  const item = dig(data.ItemMaster, str(id));
  if (!item) throw new TypeError(`lah_item: unknown item id ${str(id)}`);
  return item;
}

/** @param {{ ItemMaster: object, CardMaster: object, SidekickMaster: object, wiki: { Item: object } }} data */
export function lahItem(id, rewardType, name, data) {
  id = resolveItem(id, name, data);
  rewardType = rewardType || 3;

  if (rewardType === 3) {
    const item = itemOf(id, data);
    const itemWiki = data.wiki.Item.get(id) ?? {};
    const itemName = blank(itemWiki.name) ? item.itemName : itemWiki.name;
    const itemDesc = blank(itemWiki.description) ? item.description : itemWiki.description;
    // The Ruby original put the description into the attribute unescaped, so a quote in it cut the
    // attribute short (and kramdown then printed the tag as text). Escaping gives the same attribute
    // value in the DOM for every other item.
    return `<span class="item tippy" data-content="${xmlEscape(itemDesc)}"><img src="/cdn/Sprite/item_${item.resourceName}.png" loading="lazy"> ${str(itemName)}</span>`;
  }
  if (rewardType === 1 || rewardType === 2) {
    const { card, resourceName } = cardIcon(id, rewardType, data);
    return `<span class="item"><img src="/cdn/Sprite/icon_${resourceName}.png" loading="lazy"> ${str(card.name)}</span>`;
  }
  if (rewardType === 10) return "Skill evolution";
  return `Unknown rewardType ${str(rewardType)}`;
}

export function lahItemIcon(id, rewardType, name, data) {
  id = resolveItem(id, name, data);
  rewardType = rewardType || 3;

  if (rewardType === 3) {
    const item = itemOf(id, data);
    const itemWiki = data.wiki.Item.get(id) ?? {};
    const itemDesc = blank(itemWiki.description) ? item.description : itemWiki.description;
    return `<span class="item tippy" data-content="${xmlEscape(itemDesc)}"><img src="/cdn/Sprite/item_${item.resourceName}.png" loading="lazy"></span>`;
  }
  if (rewardType === 1 || rewardType === 2) {
    const { resourceName } = cardIcon(id, rewardType, data);
    return `<span class="item"><img src="/cdn/Sprite/icon_${resourceName}.png" loading="lazy"></span>`;
  }
  if (rewardType === 10) return "Skill evolution";
  return `Unknown rewardType ${str(rewardType)}`;
}
