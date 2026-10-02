import { inOffset } from "../wiki_plugins/lib/ruby-time.js";
import { strftime } from "../wiki_plugins/lib/strftime.js";
import { SITE_OFFSET_MINUTES } from "../wiki_plugins/site.js";

// Jekyll's `permalink: /blog/:year/:title/`. `:year` is the year of the post date in the site timezone.
export default {
  layout: "post.html",
  permalink: (data) => `/blog/${strftime(inOffset(data.page.date, SITE_OFFSET_MINUTES), "%Y")}/${data.page.fileSlug}/`,
};
