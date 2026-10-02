// Loads _data/** the way Jekyll does into `site.data`:
//   _data/CardMaster.json        -> data.CardMaster
//   _data/wiki/Item.yml          -> data.wiki.Item
//   _data/stores/3.json          -> data.stores["3"]   (a plain object, never a sparse array)
// Eleventy's own data cascade is pointed at an empty directory, so this ~45 MB never gets
// deep-merged into every template's data.

import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

import { IntKeyMap, isIntKeyed } from "./int-key-map.js";

function readDir(dir, target) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".") || ent.name.startsWith("_")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      target[ent.name] = target[ent.name] ?? {};
      readDir(full, target[ent.name]);
      continue;
    }
    const ext = path.extname(ent.name).toLowerCase();
    const key = path.basename(ent.name, path.extname(ent.name));
    if (ext === ".json") {
      target[key] = JSON.parse(fs.readFileSync(full, "utf8"));
    } else if (ext === ".yml" || ext === ".yaml") {
      const value = yaml.load(fs.readFileSync(full, "utf8"), { json: true });
      // mappings with integer keys keep Ruby's strict Integer-vs-String lookups
      target[key] = value && typeof value === "object" && !Array.isArray(value) && isIntKeyed(value) ? new IntKeyMap(value) : value;
    }
  }
}

/** @param {string} dir path of the Jekyll-style data directory */
export function loadSiteData(dir = "_data") {
  const data = {};
  readDir(dir, data);
  return data;
}
