// HTML minification as an Eleventy transform. This replaces Jekyll's compress.html layout, which
// only collapsed whitespace outside <pre>; html-minifier-terser's conservative collapse does the same.
// Enabled for production builds (ELEVENTY_ENV=production), not for `--serve`.

import { minify } from "html-minifier-terser";

const OPTIONS = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  conservativeCollapse: true, // keep a single space where whitespace separated inline content
  caseSensitive: true, // custom elements such as <wiki-status>
  removeComments: false,
  minifyJS: false,
  minifyCSS: false,
  keepClosingSlash: false,
  continueOnParseError: true, // game text sometimes contains stray "<"
};

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function minifyPlugin(eleventyConfig, { enabled = process.env.ELEVENTY_ENV === "production" } = {}) {
  if (!enabled) return;
  eleventyConfig.addTransform("html-minify", async function (content) {
    if (!this.page.outputPath?.endsWith(".html")) return content;
    try {
      return await minify(content, OPTIONS);
    } catch (error) {
      console.warn(`[html-minify] ${this.page.inputPath}: ${error.message}`);
      return content;
    }
  });
}
