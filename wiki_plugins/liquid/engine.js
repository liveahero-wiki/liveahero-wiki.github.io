// LiquidJS engine for Eleventy that makes templates see the Jekyll-style `site` and `page`
// variables. Eleventy renders every template and layout through `engine.render(tpl, data)`
// (node_modules/@11ty/eleventy/src/Engines/Liquid.js), so overriding it is enough.

import fs from "node:fs";
import path from "node:path";
import { Context, Liquid } from "liquidjs";

import { toPage } from "../lib/documents.js";
import { SITE_OFFSET_MINUTES } from "../site.js";
import { keepBackslashesInStrings } from "./string-literals.js";

// Every include is looked up in each root and read again for every use, which dominated build time.
// Results are remembered until the next build starts (see clearIncludeCaches).
const existsCache = new Map();
const readCache = new Map();

export function clearIncludeCaches() {
  existsCache.clear();
  readCache.clear();
}

function cached(map, key, load) {
  if (!map.has(key)) map.set(key, load());
  return map.get(key);
}

function readIncludeSync(file) {
  return cached(readCache, file, () => keepBackslashesInStrings(fs.readFileSync(file, "utf8")));
}

/** LiquidJS's own node file system, except that included files go through keepBackslashesInStrings. */
const includeFs = {
  sep: path.sep,
  exists: async (file) => cached(existsCache, file, () => fs.existsSync(file)),
  existsSync: (file) => cached(existsCache, file, () => fs.existsSync(file)),
  readFile: async (file) => readIncludeSync(file),
  readFileSync: readIncludeSync,
  resolve: (dir, file, ext) => path.resolve(dir, path.extname(file) ? file : file + ext),
  dirname: (file) => path.dirname(file),
  contains: (root, file) => {
    const rel = path.relative(path.resolve(root), path.resolve(file));
    return !rel.startsWith("..") && !path.isAbsolute(rel);
  },
  fallback: () => undefined,
};

export class JekyllLiquid extends Liquid {
  /**
   * @param {import("liquidjs").LiquidOptions} options
   * @param {object} site the shared Jekyll-style `site` object
   */
  constructor(options, site) {
    super({
      // dates are shown in the site timezone (Asia/Tokyo, no DST), whatever the build machine uses
      timezoneOffset: -SITE_OFFSET_MINUTES,
      ...options,
      fs: includeFs,
      globals: {
        ...options.globals,
        site,
        jekyll: { environment: process.env.JEKYLL_ENV ?? process.env.ELEVENTY_ENV ?? "development" },
      },
    });
  }

  parse(html, filepath) {
    return super.parse(keepBackslashesInStrings(html), filepath);
  }

  render(tpl, scope, renderOptions) {
    // Nested renders from filters pass a Context that already carries `page`.
    if (scope && !(scope instanceof Context)) {
      scope = { ...scope, page: toPage(scope) };
    }
    // The sync path skips LiquidJS's promise-per-node driver, which was most of the build time.
    // Nothing here is asynchronous (includeFs above reads synchronously too).
    return this.renderSync(tpl, scope, renderOptions);
  }
}
