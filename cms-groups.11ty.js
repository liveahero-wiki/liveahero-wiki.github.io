// /api/cms-groups.json: the submission groups the wiki-cms Worker accepts submissions for
// (shape in wiki-cms docs: { groups: { <groupId>: { title, url, options } } }). The groups of a page
// come from wiki_plugins/lib/cms-groups.js, the same function the page includes use; it throws on
// bad front matter and the registry throws when two pages declare the same group id.

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
