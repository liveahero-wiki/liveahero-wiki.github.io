// Port of _plugins/chara.rb: character page lookup, {% chara_link %} and the stockId filters.
//
// A stock id is (1000 + characterId) * 10 + variant; the card id is stockId * 10 + 1.
// "Charas" here are the documents of the `charas` collection (front matter flat on the object).

import { dig, str } from "./ruby.js";

/** The CharaMap of chara.rb: page by title, and released page by characterId. */
export class CharaIndex {
  nameToPage = new Map();
  characterIdToPage = new Map();

  /** @param {Array<Record<string, any>>} charas documents of the charas collection */
  rebuild(charas) {
    this.nameToPage.clear();
    this.characterIdToPage.clear();
    for (const chara of charas) {
      this.nameToPage.set(chara.title, chara);
      if (!chara.unreleased) this.characterIdToPage.set(Number(chara.characterId), chara);
    }
  }
}

const unreleasedIcon = (page) => (page.icon ? `/assets/img/unreleased/${page.icon}.png` : "/cdn/Sprite/icon_unknown_card.png");

/** @returns {[string | undefined, string]} [title, <a> html] */
export function stockIdToLinkImpl(stockId, type, deps, page) {
  const cardId = stockId * 10 + 1;
  const variant = stockId % 10;
  const characterId = Math.floor(stockId / 10) % 1000;

  page ??= deps.index.characterIdToPage.get(characterId);

  let resourceName;
  let suffix;
  if (type === 1) {
    resourceName = dig(deps.data.CardMaster, String(cardId), "resourceName");
    suffix = "h";
  } else {
    resourceName = dig(deps.data.SidekickMaster, String(cardId), "resourceName");
    suffix = "s";
  }

  let title;
  let url;
  if (page) {
    title = variant > 1 ? (dig(page, suffix + variant, "title") || page.title) : page.title;
    url = page.url;
  } else {
    title = resourceName;
    url = "/charas/";
  }

  return [
    title,
    `<a href="${url}#${suffix}${stockId}"><span class="item"><img src="/cdn/Sprite/icon_${str(resourceName)}_${suffix}01.png" loading="lazy" width="32" height="32"></span> ${str(title)}</a>`,
  ];
}

/** `{% chara_link Name|h2 %}`: `h`/`s` picks hero/sidekick, the digit the variant. */
export function charaLink(input, deps) {
  const tokens = rubySplit(input.trim(), "|");
  const title = tokens[0];

  const page = deps.index.nameToPage.get(title);
  if (!page) return str(title);

  if (page.unreleased) {
    return `<a href="${page.url}"><span class="item"><img src="${unreleasedIcon(page)}" loading="lazy"></span> ${title}</a>`;
  }

  let type = 2;
  let variant = 1;
  if (tokens.length === 2) {
    const suffix = tokens[1];
    type = suffix[0] === "h" ? 1 : 2;
    variant = Number.parseInt(suffix[1] ?? "", 10) || 0;
  }

  const stockId = (1000 + page.characterId) * 10 + variant;
  return stockIdToLinkImpl(stockId, type, deps, page)[1];
}

/** `charaPageToIcon` */
export function charaPageToIcon(page, deps) {
  if (page.unreleased) return unreleasedIcon(page);
  const cardId = 100 * page.characterId + 100011;
  const resourceName = dig(deps.data.SidekickMaster, String(cardId), "resourceName");
  return resourceName ? `/cdn/Sprite/icon_${resourceName}_s01.png` : "/cdn/Sprite/icon_unknown_card.png";
}

/** `charaPageToLink` */
export function charaPageToLink(page, deps) {
  return `<a class="item" href="${page.url}"><img src="${charaPageToIcon(page, deps)}" loading="lazy"> ${page.title}</a>`;
}

/** Ruby's String#split with a literal separator: trailing empty fields are dropped. */
function rubySplit(text, sep) {
  const parts = text.split(sep);
  while (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}
