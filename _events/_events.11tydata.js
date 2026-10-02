// Replaces the `defaults:` scope for the events collection in the old _config.yml.
export default {
  layout: "event.html",
  timed_bomb: false,
  additional_scripts: ["/assets/editable.js"],
  permalink: "/events/{{ page.fileSlug }}/",
};
