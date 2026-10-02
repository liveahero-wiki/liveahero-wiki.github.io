// Jekyll exposes front matter flat on documents and on `page`
// (`chara.title`, `page.characterId`, `page.url`); Eleventy nests it under `.data` and keeps
// its own bookkeeping under `page`. These helpers build the Jekyll-shaped objects.

import path from "node:path";

import { inOffset } from "./ruby-time.js";
import { SITE_OFFSET_MINUTES } from "../site.js";

/** Keys of the Eleventy data cascade that are not front matter. */
const NOT_FRONT_MATTER = new Set(["page", "collections", "eleventy", "pkg", "site"]);

function relativePath(inputPath) {
  return inputPath.replace(/^\.\//, "");
}

/** A document in `site.<collection>`, built from an Eleventy collection item. */
export function toDocument(item, collection) {
  const doc = {};
  for (const key of Object.keys(item.data)) {
    if (!NOT_FRONT_MATTER.has(key) && key !== "content") doc[key] = item.data[key];
  }
  const rel = relativePath(item.inputPath);
  doc.url = item.url;
  doc.path = rel;
  doc.relative_path = rel;
  doc.name = path.basename(rel);
  doc.collection = collection;
  doc.id = item.url.replace(/\/$/, "");
  doc.date = inOffset(item.date, SITE_OFFSET_MINUTES);
  return doc;
}

/**
 * The `page` variable for a template, built from the data cascade Eleventy hands to the
 * Liquid engine. `content` is the page body when a layout is being rendered.
 */
export function toPage(data) {
  const p = data.page ?? {};
  // Eleventy's own page fields (fileSlug, inputPath, url, …) stay available: permalinks and a few
  // shared helpers rely on them.
  const page = { ...p };
  for (const key of Object.keys(data)) {
    if (!NOT_FRONT_MATTER.has(key)) page[key] = data[key];
  }
  const rel = relativePath(p.inputPath ?? "");
  page.url = p.url;
  page.path = rel;
  page.name = path.basename(rel);
  page.date = inOffset(p.date, SITE_OFFSET_MINUTES);
  return page;
}
