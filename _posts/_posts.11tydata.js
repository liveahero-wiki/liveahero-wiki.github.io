import { inOffset } from "../wiki_plugins/lib/ruby-time.js";
import { SITE_OFFSET_MINUTES } from "../wiki_plugins/site.js";

// `draft: true` posts are rendered by the dev server only, so a half-written post can be previewed
// without being deployed. Pair it with `eleventyExcludeFromCollections: true` so it stays off the blog index.
const SERVING = process.env.ELEVENTY_RUN_MODE === "serve";

// Jekyll's `permalink: /blog/:year/:title/`. `:year` is the year of the post date in the site timezone.
export default {
  layout: "post.html",
  permalink: (data) => {
    if (data.draft && !SERVING) return false;
    const year = inOffset(data.page.date, SITE_OFFSET_MINUTES).wallClock().getUTCFullYear();
    return `/blog/${year}/${data.page.fileSlug}/`;
  },
};
