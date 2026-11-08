// `{% mob Name %}`: the icon and name of an enemy series (villain mob or kaibutsu), without a link.
// The data is api/mob.json (tools/generate_mob_index.py), loaded as `site.data.mob`.

import { xmlEscape } from "./ruby.js";

const lookups = new WeakMap();

/** Series by lower-cased name and by id, cached per `series` array (a new build loads a new array). */
function lookupFor(series) {
  let map = lookups.get(series);
  if (!map) {
    map = new Map();
    for (const entry of series) {
      map.set(String(entry.name).toLowerCase(), entry);
      if (!map.has(entry.id)) map.set(entry.id, entry);
    }
    lookups.set(series, map);
  }
  return map;
}

/** @param {string} input a series name (case-insensitive) or id */
export function mobLink(input, data) {
  const key = String(input ?? "").trim();
  const series = data?.mob?.series;
  const entry = Array.isArray(series) ? lookupFor(series).get(key.toLowerCase()) : undefined;
  if (!entry) return xmlEscape(key);
  return `<span class="mob"><img src="${xmlEscape(entry.icon)}" loading="lazy" width="32" height="32"> ${xmlEscape(entry.name)}</span>`;
}
