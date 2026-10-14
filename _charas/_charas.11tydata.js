// Replaces the `defaults:` scope for the charas collection in the old _config.yml.
export default {
  layout: "chara.html",
  unreleased: false,
  additional_scripts: ["/assets/atlas.js", "/assets/skill-tree.js"],
  permalink: "/charas/{{ page.fileSlug }}/",
};
