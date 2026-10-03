// Compiles *.scss pages (assets/main.scss) with Dart Sass, replacing Jekyll's built-in Sass step:
// partials live in _sass/ (load path), output is compressed, `_`-prefixed files are not pages.

import path from "node:path";
import * as sass from "sass";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function sassPlugin(eleventyConfig, { loadPaths = ["_sass"], style = "compressed" } = {}) {
  eleventyConfig.addTemplateFormats("scss");
  // Eleventy only watches template formats, so plain-CSS partials (`@use "tabs.css"`) would not trigger a rebuild.
  for (const dir of loadPaths) {
    eleventyConfig.addWatchTarget(dir);
  }
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false, // the global default layout must not wrap CSS in the page shell
    compile(inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) return;

      const result = sass.compileString(inputContent, {
        loadPaths: [...loadPaths, parsed.dir || "."],
        style,
        quietDeps: true,
        // the site's own SCSS still uses a few deprecated constructs; do not flood the build log
        silenceDeprecations: ["import", "global-builtin", "color-functions", "slash-div"],
      });
      this.addDependencies(
        inputPath,
        result.loadedUrls.filter((url) => url.protocol === "file:"),
      );
      return async () => result.css;
    },
  });
}
