// /api/editor-data.json: the trimmed data (chara pages, item names and icons) the contributor editor's
// preview needs to render {% chara_link %} and the item includes with the build's own functions. The shape is
// documented in wiki_plugins/lib/editor-data.js.

export default class EditorData {
  data() {
    return {
      permalink: "/api/editor-data.json",
      layout: "none",
      eleventyExcludeFromCollections: true,
    };
  }

  render(data) {
    // reading the collection makes sure site.charas is filled before the data is built
    void data.collections.charas;
    return JSON.stringify(this.editorData());
  }
}
