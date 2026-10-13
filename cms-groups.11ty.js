// /api/cms-groups.json: the submission groups the wiki-cms Worker accepts submissions for
// (shape in wiki-cms docs: { groups: { <groupId>: { title, url, options } } }). There is one group,
// `all` (the Team Creator page); its `options.targets` are collected from the `team_formations:` front
// matter of every page by wiki_plugins/lib/cms-groups.js, the same function the page includes use. It
// throws on bad front matter and when two pages declare the same target id.

export default class CmsGroups {
  data() {
    return {
      permalink: "/api/cms-groups.json",
      layout: "none",
      eleventyExcludeFromCollections: true,
    };
  }

  render(data) {
    const pages = data.collections.all.map((item) => ({ ...item.data, url: item.url }));
    return JSON.stringify(this.cmsGroupRegistry(pages), null, 1) + "\n";
  }
}
