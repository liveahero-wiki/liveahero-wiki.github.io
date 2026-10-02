// jekyll-redirect-from replacement: every page with `redirect_from: /old/url/` gets a stub at the
// old URL that redirects to the page. The `redirects` collection is built in wiki_plugins/index.js.

export default class Redirects {
  data() {
    return {
      pagination: { data: "collections.redirects", size: 1, alias: "redirect" },
      permalink: (data) => data.redirect.from,
      layout: "none",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ redirect }) {
    const to = redirect.to;
    return `<!DOCTYPE html>
<html lang="en-US">
  <meta charset="utf-8">
  <title>Redirecting&hellip;</title>
  <link rel="canonical" href="${to}">
  <script>location="${to}"</script>
  <meta http-equiv="refresh" content="0; url=${to}">
  <meta name="robots" content="noindex">
  <h1>Redirecting&hellip;</h1>
  <a href="${to}">Click here if you are not redirected.</a>
</html>
`;
  }
}
