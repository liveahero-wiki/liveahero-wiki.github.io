import { inOffset } from "../wiki_plugins/lib/ruby-time.js";
import { SITE_OFFSET_MINUTES } from "../wiki_plugins/site.js";

// Jekyll's `permalink: /blog/:year/:title/`. `:year` is the year of the post date in the site timezone.
export default {
  layout: "post.html",
  permalink: (data) => {
    const year = inOffset(data.page.date, SITE_OFFSET_MINUTES).wallClock().getUTCFullYear();
    return `/blog/${year}/${data.page.fileSlug}/`;
  },
};
