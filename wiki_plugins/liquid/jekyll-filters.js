// Filters whose LiquidJS behaviour differs from Jekyll's (Ruby Liquid) in ways that change output.
// Everything not listed here (xml_escape, uri_escape, jsonify, array_to_sentence_string, …) is
// taken from LiquidJS as is; wiki_plugins/liquid/jekyll-filters.test.js pins the behaviour.

import { Value } from "liquidjs";
import { arithmeticFilters } from "../lib/ruby-numeric.js";

/** Jekyll iterates a Hash's values; LiquidJS would wrap the Hash in a one element array. */
function toItems(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object" && !(input instanceof Date)) return Object.values(input);
  return null;
}

/** Jekyll's item_property: dotted paths, and Hash#[] / Drop#[] alike. */
function itemProperty(item, property) {
  if (item === null || item === undefined) return undefined;
  property = String(property);
  if (!property.includes(".")) return item[property];
  let cur = item;
  for (const key of property.split(".")) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = cur[key];
  }
  return cur;
}

/** Jekyll's compare_property_vs_target: everything is compared as a string, arrays match any element. */
function matches(property, target) {
  if (target === null || target === undefined) return property === null || property === undefined;
  const t = String(target);
  if (typeof property === "string") return property === t;
  if (property === null || property === undefined) return false;
  const list = Array.isArray(property) ? property : [property];
  return list.some((p) => String(p) === t);
}

function where(input, property, value) {
  const items = toItems(input);
  if (!items) return input;
  return items.filter((item) => matches(itemProperty(item, property), value));
}

function* whereExp(input, variable, expression) {
  const items = toItems(input);
  if (!items) return input;
  const condition = new Value(String(expression), this.liquid);
  const out = [];
  for (const item of items) {
    this.context.push({ [variable]: item });
    try {
      if (yield condition.value(this.context)) out.push(item);
    } finally {
      this.context.pop();
    }
  }
  return out;
}

function groupsToList(map) {
  return [...map].map(([name, items]) => ({ name, items, size: items.length }));
}

function groupBy(input, property) {
  const items = toItems(input);
  if (!items) return input;
  const groups = new Map();
  for (const item of items) {
    const key = String(itemProperty(item, property) ?? "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groupsToList(groups);
}

function* groupByExp(input, variable, expression) {
  const items = toItems(input);
  if (!items) return input;
  const expr = new Value(String(expression), this.liquid);
  const groups = new Map();
  for (const item of items) {
    this.context.push({ [variable]: item });
    let key;
    try {
      key = yield expr.value(this.context);
    } finally {
      this.context.pop();
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groupsToList(groups);
}

/** Jekyll's parse_sort_input: number-like strings sort as numbers. */
function sortValue(v) {
  return typeof v === "string" && /^\s*-?(?:\d+\.?\d*|\.\d+)\s*$/.test(v) ? Number.parseFloat(v) : v;
}

const rubyCompare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Jekyll's sort filter (it replaces Liquid's): items without the property come first by default
 * (`nils: "last"` flips that), and number-like strings compare as numbers.
 */
function sort(input, property, nils = "first") {
  if (!Array.isArray(input)) return input;
  if (property === undefined || property === null) return [...input].sort(rubyCompare);
  const order = nils === "last" ? 1 : -1;
  return input
    .map((item) => [sortValue(itemProperty(item, property)), item])
    .sort(([a], [b]) => {
      const aNil = a === undefined || a === null;
      const bNil = b === undefined || b === null;
      if (!aNil && bNil) return -order;
      if (aNil && !bNil) return order;
      return rubyCompare(a, b);
    })
    .map(([, item]) => item);
}

/** Ruby's String#split: " " is awk-style, and trailing empty fields are dropped. */
function split(input, pattern) {
  const str = input === null || input === undefined ? "" : String(input);
  const sep = pattern === null || pattern === undefined ? " " : String(pattern);
  if (sep === " ") {
    const trimmed = str.trim();
    return trimmed === "" ? [] : trimmed.split(/\s+/);
  }
  const parts = str.split(sep);
  while (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/** Jekyll's Utils.slugify, default mode: runs of non letter/mark/digit become "-", lowercased. */
export function slugify(input) {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/[^\p{M}\p{L}\p{Nd}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {{ site: { time?: Date, url: string }, markdown: () => any }} deps
 */
export function registerJekyllFilters(eleventyConfig, { site, markdown }) {
  const add = (name, fn) => eleventyConfig.addLiquidFilter(name, fn);

  add("where", where);
  add("where_exp", whereExp);
  add("group_by", groupBy);
  add("group_by_exp", groupByExp);
  add("split", split);
  add("sort", sort);
  add("slugify", slugify);

  for (const [name, fn] of Object.entries(arithmeticFilters)) add(name, fn);

  add("absolute_url", (input) => {
    const s = input === null || input === undefined ? "" : String(input);
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
    return site.url + (s.startsWith("/") ? s : `/${s}`);
  });

  // Ruby's nil.to_json is "null"; LiquidJS gives "" for an undefined variable.
  add("jsonify", (input) =>
    typeof input?.toJsonString === "function" ? input.toJsonString() : JSON.stringify(input === undefined ? null : input),
  );

  add("markdownify", (input) => markdown().render(input === null || input === undefined ? "" : String(input)));
}
