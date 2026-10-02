// Ruby hashes are type-strict: a YAML mapping with integer keys (`8210105: ""`) is found with the
// Integer 8210105 but not with the String "8210105". JavaScript objects coerce every key to a
// string, so such mappings are loaded as IntKeyMap, which only answers numeric lookups. Templates
// that look keys up with strings (`skillId=passiveSkillIdS`, a `| downcase` result) then behave
// exactly as they did under Jekyll, e.g. the empty override in SkillManualOverride.yml is skipped.

import { Drop } from "liquidjs";

export class IntKeyMap extends Drop {
  /** @param {Record<string, any>} object a mapping whose keys all look like integers */
  constructor(object) {
    super();
    this.entries = new Map(Object.entries(object));
  }

  /** Lookup as Ruby does it: only a number matches. */
  get(key) {
    return typeof key === "number" ? this.entries.get(String(key)) : undefined;
  }

  /** Called by LiquidJS with the key exactly as the template gave it (number or string). */
  liquidMethodMissing(key) {
    return this.get(key);
  }

  /** Iteration yields [key, value] pairs with numeric keys, like `each` over a Ruby hash. */
  [Symbol.iterator]() {
    return [...this.entries].map(([k, v]) => [Number(k), v])[Symbol.iterator]();
  }

  values() {
    return [...this.entries.values()];
  }
}

export const isIntKeyed = (object) => {
  const keys = Object.keys(object);
  return keys.length > 0 && keys.every((k) => /^-?\d+$/.test(k));
};

/**
 * A Ruby `Hash.new { |h, k| h[k] = [] }` with Integer keys, as built by collect_change_skills:
 * keeps insertion order when serialised (a JS object would sort integer-like keys), looks up by
 * number only, and creates an empty list for a missing key like the default proc does.
 */
export class OrderedIntHash extends Drop {
  /** @param {Map<number, any[]>} map */
  constructor(map) {
    super();
    this.map = map;
  }

  liquidMethodMissing(key) {
    if (typeof key !== "number") return undefined;
    if (!this.map.has(key)) this.map.set(key, []);
    return this.map.get(key);
  }

  /** Ruby's Hash#to_json: keys in insertion order, as strings. */
  toJsonString() {
    return `{${[...this.map].map(([k, v]) => `${JSON.stringify(String(k))}:${JSON.stringify(v)}`).join(",")}}`;
  }
}
