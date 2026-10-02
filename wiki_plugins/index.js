// Eleventy plugin that ports the Jekyll site's behaviour: the `site`/`page` variables,
// collections (`site.charas` …), data loading, and the Liquid filters/tags that used to be Ruby.

import { loadSiteData } from "./lib/site-data.js";
import { CharaIndex } from "./lib/chara.js";
import { toDocument } from "./lib/documents.js";
import { registerJekyllFilters } from "./liquid/jekyll-filters.js";
import { registerRubyPlugins } from "./liquid/ruby-plugins.js";
import { SITE_OFFSET_MINUTES } from "./site.js";
import { nowInOffset } from "./lib/ruby-time.js";

const byPath = (a, b) => (a.inputPath < b.inputPath ? -1 : a.inputPath > b.inputPath ? 1 : 0);

/** Jekyll's `sort_by`: ascending, documents without the key last, ties by path. */
function bySortKey(key) {
  return (a, b) => {
    const x = a.data[key];
    const y = b.data[key];
    const xNil = x === undefined || x === null;
    const yNil = y === undefined || y === null;
    if (!xNil && !yNil) {
      const c = x < y ? -1 : x > y ? 1 : 0;
      return c || byPath(a, b);
    }
    if (!xNil) return -1;
    if (!yNil) return 1;
    return byPath(a, b);
  };
}

// Mirrors `collections:` in the old _config.yml. `posts` is newest first, as in Jekyll's site.posts.
const COLLECTIONS = {
  charas: { glob: "_charas/*.md", order: byPath },
  events: { glob: "_events/*.md", order: bySortKey("event_start_time") },
  main_quests: { glob: "_main_quests/*.md", order: bySortKey("chapterId") },
  statuses: { glob: "_statuses/*.md", order: bySortKey("status_id") },
  posts: { glob: "_posts/*.md", order: (a, b) => b.date - a.date || byPath(b, a) },
};

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {{ site: ReturnType<typeof import("./site.js").createSite>, markdown: () => any }} deps
 */
export default function wikiPlugins(eleventyConfig, { site, markdown }) {
  const charaIndex = new CharaIndex();

  // Reload _data and the build time at the start of every build (also on --serve rebuilds).
  eleventyConfig.on("eleventy.before", () => {
    site.data = loadSiteData("_data");
    site.time = nowInOffset(SITE_OFFSET_MINUTES);
  });
  eleventyConfig.addWatchTarget("_data/");

  // `site.<collection>` holds Jekyll-shaped documents; the Eleventy collection holds the items.
  for (const [name, { glob, order }] of Object.entries(COLLECTIONS)) {
    eleventyConfig.addCollection(name, (collectionApi) => {
      const items = collectionApi.getFilteredByGlob(glob).sort(order);
      site[name] = items.map((item) => toDocument(item, name));
      if (name === "charas") charaIndex.rebuild(site.charas);
      return items;
    });
  }

  // jekyll-redirect-from: `redirect_from: /old/url/` on a page -> a stub at the old URL (see redirects.11ty.js)
  eleventyConfig.addCollection("redirects", (collectionApi) => {
    const redirects = [];
    for (const item of collectionApi.getAll()) {
      for (let from of [].concat(item.data.redirect_from ?? [])) {
        if (!from.startsWith("/")) from = `/${from}`;
        if (!/\.\w+$/.test(from) && !from.endsWith("/")) from += "/";
        redirects.push({ from, to: site.url + item.url });
      }
    }
    return redirects;
  });

  registerJekyllFilters(eleventyConfig, { site, siteOffset: SITE_OFFSET_MINUTES, markdown });

  registerRubyPlugins(eleventyConfig, { site, charaIndex });
}
