// The Jekyll-style `site` object that templates see (`site.url`, `site.data.CardMaster`,
// `site.charas`, …). One instance per Eleventy run; the Liquid engine exposes it as a global
// so it never travels through (and gets deep-merged by) Eleventy's data cascade.

import { nowInOffset } from "./lib/ruby-time.js";

/** Asia/Tokyo has no DST, so a fixed offset is exact. */
export const SITE_OFFSET_MINUTES = 540;

export function createSite() {
  return {
    title: "Live A Hero Wiki",
    url: "https://liveahero-wiki.github.io",
    github_repo: "https://github.com/liveahero-wiki/liveahero-wiki.github.io",
    timezone: "Asia/Tokyo",
    date_format: "%-d %b %Y %H:%M JST",
    excerpt_separator: "<!--more-->",
    time: nowInOffset(SITE_OFFSET_MINUTES),
    // filled in by the plugin
    data: {},
    charas: [],
    events: [],
    main_quests: [],
    statuses: [],
    posts: [],
  };
}
