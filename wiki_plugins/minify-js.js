// Production-only handling of the site's own scripts in _site/assets/, after Eleventy has copied them:
//  - the scripts every page loads (BUNDLE) are concatenated into one assets/site.js, which
//    _includes/footer.html loads instead of the four separate files when `jekyll.environment` is production;
//  - every other assets/*.js is minified in place.
// Sources in assets/ are never touched. Enabled for production builds (ELEVENTY_ENV=production).

import fs from "node:fs";
import path from "node:path";
import { minify } from "terser";

/** The scripts of _includes/footer.html, in load order. */
export const BUNDLE = [
  "tippy.js",
  "main.js",
  "search.js",
  "meteor-shower.js",
];
export const BUNDLE_NAME = "site.js";

// Built by Vite (already minified, and ES modules). `*.min.js` are vendored/minified by convention.
const SKIP = new Set(["skill-search.js", BUNDLE_NAME]);

const OPTIONS = { compress: true, mangle: true, format: { comments: false } };

/**
 * Minifies one script. Returns the original code (and warns) when it cannot be parsed or is not made smaller.
 * @param {string} code
 * @param {string} [name] used in the warning
 */
export async function minifyScript(code, name = "script") {
  try {
    const result = await minify(code, OPTIONS);
    return result.code && result.code.length < code.length ? result.code : code;
  } catch (error) {
    console.warn(`[minify-js] ${name}: ${error.message}`);
    return code;
  }
}

/**
 * Concatenates scripts into one minified file. Unlike minifyScript this throws: the page points at the
 * bundle, so a failure (e.g. two files declaring the same top-level `const`) must fail the build.
 * @param {Record<string, string>} sources file name -> code, in load order
 */
export async function bundleScripts(sources) {
  const result = await minify(sources, OPTIONS);
  return result.code;
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function minifyJsPlugin(eleventyConfig, { enabled = process.env.ELEVENTY_ENV === "production" } = {}) {
  if (!enabled) return;
  eleventyConfig.on("eleventy.after", async ({ directories }) => {
    const assets = path.join(directories.output, "assets"); // honours --output
    if (!fs.existsSync(assets)) return;

    const sources = {};
    for (const name of BUNDLE) {
      sources[name] = fs.readFileSync(path.join(assets, name), "utf8");
    }
    fs.writeFileSync(path.join(assets, BUNDLE_NAME), await bundleScripts(sources));

    for (const entry of fs.readdirSync(assets, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".js") || entry.name.endsWith(".min.js") || SKIP.has(entry.name)) {
        continue;
      }
      const file = path.join(assets, entry.name);
      const code = fs.readFileSync(file, "utf8");
      const minified = await minifyScript(code, `assets/${entry.name}`);
      if (minified !== code) fs.writeFileSync(file, minified);
    }
  });
}
