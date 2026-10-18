// /api/contrib-includes.json: the includes contributors may use in page edits ({ includes: ["item.html", ...] }),
// every `_includes/*.html` minus the denylist in wiki_plugins/lib/contrib-guard.js. The editor loads it for
// its live check; CI (scripts/contrib-guard-ci.mjs) computes the same list from the base branch.

export default class ContribIncludes {
  data() {
    return {
      permalink: "/api/contrib-includes.json",
      layout: "none",
      eleventyExcludeFromCollections: true,
    };
  }

  render() {
    return JSON.stringify({ includes: this.contribIncludes() }, null, 1);
  }
}
