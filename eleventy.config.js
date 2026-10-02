import fs from "node:fs";
import path from "node:path";

import { createSite } from "./wiki_plugins/site.js";
import { createMarkdown } from "./wiki_plugins/markdown/index.js";
import { JekyllLiquid } from "./wiki_plugins/liquid/engine.js";
import { frontMatterYamlEngine } from "./wiki_plugins/lib/ruby-time.js";
import { findStaticTemplateFiles } from "./wiki_plugins/lib/static-files.js";
import wikiPlugins from "./wiki_plugins/index.js";
import minifyPlugin from "./wiki_plugins/minify.js";
import sassPlugin from "./wiki_plugins/sass.js";

const STRICT = Boolean(process.env.ELEVENTY_STRICT);

// Repository documents that are neither pages nor static site files.
const NOT_SITE_FILES = new Set(["readme.md", "CONTRIBUTING.md", "AGENTS.md", "CLAUDE.md"]);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  const site = createSite();
  const markdown = createMarkdown();

  // Front matter timestamps are Ruby Times in Jekyll (they print as "2026-01-22 20:00:00 +0900").
  eleventyConfig.setFrontMatterParsingOptions({ engines: { yaml: frontMatterYamlEngine } });

  eleventyConfig.setLibrary("md", markdown);
  eleventyConfig.setLibrary(
    "liquid",
    new JekyllLiquid(
      {
        root: [path.resolve("_includes"), path.resolve(".")],
        // `{% include foo.html a=b %}` + `include.a`, like Jekyll
        jekyllInclude: true,
        // Jekyll silently ignores unknown filters; ELEVENTY_STRICT=1 makes them fail the build.
        strictFilters: STRICT,
      },
      site,
    ),
  );

  wikiPlugins(eleventyConfig, { site, markdown: () => markdown });
  eleventyConfig.addPlugin(sassPlugin);
  eleventyConfig.addPlugin(minifyPlugin);
  eleventyConfig.addGlobalData("siteUrl", site.url);

  // ---- which files are pages -------------------------------------------------------------
  // Jekyll's `exclude:` plus the non-site folders of this repo.
  for (const pattern of [
    "_data/**",
    "_plugins/**",
    "_sass/**",
    "_site*/**",
    "wiki_plugins/**",
    "web/**",
    "tools/**",
    "docs/**",
    "deploy/**",
    "zzz/**",
    "cdn/**",
    ".github/**",
    ".claude/**",
    "jekyll-site/**", // a downloaded Jekyll CI build, used as the reference for scripts/compare-page.mjs
    ...NOT_SITE_FILES,
  ]) {
    eleventyConfig.ignores.add(pattern);
  }
  // .gitignore lists generated inputs we do want to build (_statuses/, _data/translation/, api/skill-index*).
  eleventyConfig.setUseGitIgnore(false);

  // ---- static files ---------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy("assets", {
    filter: ["**/*", "!**/*.scss", "!atlas.js"],
  });
  // Files without front matter, which Jekyll copied verbatim (json is not a template format here).
  eleventyConfig.addPassthroughCopy("api/mob.json");
  eleventyConfig.addPassthroughCopy("api/skill-*.json");
  const staticFiles = findStaticTemplateFiles(".", NOT_SITE_FILES);
  for (const file of staticFiles) {
    eleventyConfig.ignores.add(file);
    eleventyConfig.addPassthroughCopy(file);
  }

  // cdn/ is a 2 GB checkout of the sprite repo; only the dev server (which serves it in place) needs it.
  const serving = process.argv.includes("--serve");
  if (fs.existsSync("cdn") && (serving || process.env.ELEVENTY_COPY_CDN === "1")) {
    eleventyConfig.addPassthroughCopy("cdn");
  }
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  // ---- layouts ---------------------------------------------------------------------------
  // Jekyll's `layout: default` -> _layouts/default.html. Every other template gets `default`
  // unless its directory data says otherwise (_charas/_charas.11tydata.js, …).
  for (const name of ["default", "chara", "event", "main_quest", "post", "status", "markdownify", "none"]) {
    eleventyConfig.addLayoutAlias(name, `${name}.html`);
  }
  eleventyConfig.addGlobalData("layout", "default");

  return {
    templateFormats: ["md", "html", "liquid", "11ty.js"],
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      // Deliberately not _data: that folder is loaded once by wiki_plugins/lib/site-data.js
      // into `site.data` instead of being deep-merged into every template's data.
      data: "_11ty_data",
    },
    pathPrefix: "/",
  };
}
