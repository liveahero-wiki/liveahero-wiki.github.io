// Helpers for the unit tests: the wiki's Liquid engine and markdown-it without Eleventy.

import path from "node:path";

import { CharaIndex } from "./lib/chara.js";
import { JekyllLiquid } from "./liquid/engine.js";
import { registerJekyllFilters } from "./liquid/jekyll-filters.js";
import { registerRubyPlugins } from "./liquid/ruby-plugins.js";
import { createMarkdown } from "./markdown/index.js";
import { createSite } from "./site.js";

/**
 * @param {{ data?: object, charas?: object[] }} options `data` becomes `site.data`
 */
export function createTestEngine({ data = {}, charas = [] } = {}) {
  const site = createSite();
  site.data = data;
  const charaIndex = new CharaIndex();
  charaIndex.rebuild(charas);

  const liquid = new JekyllLiquid({ root: [path.resolve("_includes")], jekyllInclude: true }, site);
  const markdown = createMarkdown();
  // the two registration functions only need these three methods of the Eleventy config
  const config = {
    addLiquidFilter: (name, fn) => liquid.registerFilter(name, fn),
    addLiquidTag: (name, fn) => liquid.registerTag(name, fn(liquid)),
  };
  registerJekyllFilters(config, { site, markdown: () => markdown });
  registerRubyPlugins(config, { site, charaIndex });

  return {
    site,
    liquid,
    markdown,
    /** Render a Liquid template; `page` is a minimal stand-in. */
    render: (template, scope = {}) => liquid.parseAndRender(template, { page: {}, ...scope }),
  };
}
