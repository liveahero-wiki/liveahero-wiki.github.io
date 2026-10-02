// LiquidJS engine for Eleventy that makes templates see the Jekyll-style `site` and `page`
// variables. Eleventy renders every template and layout through `engine.render(tpl, data)`
// (node_modules/@11ty/eleventy/src/Engines/Liquid.js), so overriding it is enough.

import fs from "node:fs";
import path from "node:path";
import { Context, Liquid } from "liquidjs";

import { toPage } from "../lib/documents.js";
import { keepBackslashesInStrings } from "./string-literals.js";

/** LiquidJS's own node file system, except that included files go through keepBackslashesInStrings. */
const includeFs = {
  sep: path.sep,
  exists: async (file) => fs.existsSync(file),
  existsSync: (file) => fs.existsSync(file),
  readFile: async (file) => keepBackslashesInStrings(await fs.promises.readFile(file, "utf8")),
  readFileSync: (file) => keepBackslashesInStrings(fs.readFileSync(file, "utf8")),
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
    return super.render(tpl, scope, renderOptions);
  }
}
