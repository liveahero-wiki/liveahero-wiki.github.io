// sitemap.xml: every rendered page of the site (static files were never listed). Replaces the Liquid
// sitemap.xml that mimicked jekyll-sitemap (site.collections, site.html_pages, page.static_files).

const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default class Sitemap {
  data() {
    return {
      permalink: "/sitemap.xml",
      layout: "none",
      eleventyExcludeFromCollections: true,
    };
  }

  render(data) {
    const base = data.siteUrl;
    const pages = data.collections.all
      .filter((item) => item.data.sitemap !== false)
      .map((item) => item.url)
      .filter((url) => typeof url === "string" && (url.endsWith("/") || url.endsWith(".html")) && url !== "/404.html");
    const urls = [...new Set(pages)];
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${NS} ${NS}/sitemap.xsd" xmlns="${NS}">\n` +
      urls.map((url) => `  <url>\n    <loc>${escapeXml(base + url.replace(/\/index\.html$/, "/"))}</loc>\n  </url>\n`).join("") +
      `</urlset>\n`
    );
  }
}
