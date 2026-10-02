import assert from "node:assert/strict";
import test from "node:test";

import { createMarkdown } from "./index.js";
import { escapeStrayTags } from "./html-block.js";
import { gfmHeaderId } from "./kramdown-id.js";

const md = createMarkdown();
const render = (src) => md.render(src);

test("headings get kramdown ids and an empty link before the text", () => {
  assert.equal(
    render("## Quest Details"),
    '<h2 id="quest-details"><a href="#quest-details"></a>Quest Details</h2>\n',
  );
});

test("heading ids follow kramdown-parser-gfm", () => {
  const ids = (text) => gfmHeaderId(text, new Map());
  assert.equal(ids("Where is Wolfman (and other)’s info?"), "where-is-wolfman-and-others-info");
  assert.equal(ids("Hero / Sidekick  Roles"), "hero--sidekick--roles");
  assert.equal(ids("日本語 Heading_1"), "日本語-heading_1");
  const seen = new Map();
  assert.deepEqual([gfmHeaderId("Same", seen), gfmHeaderId("Same", seen), gfmHeaderId("Same", seen)], ["same", "same-1", "same-2"]);
});

test("{:toc} turns the list above it into the table of contents", () => {
  const html = render("* toc\n{:toc}\n\n## One\n\n### Two\n\n## Three\n");
  assert.match(html, /^<ul id="markdown-toc">/);
  assert.match(html, /<li><a href="#one" id="markdown-toc-one">One<\/a>\s*<ul>\s*<li><a href="#two" id="markdown-toc-two">Two<\/a><\/li>\s*<\/ul>\s*<\/li>/);
  assert.match(html, /<li><a href="#three" id="markdown-toc-three">Three<\/a><\/li>/);
});

test("{:.no_toc} keeps a heading out of the table of contents", () => {
  const html = render("* toc\n{:toc}\n\n## In\n\n## Out\n{:.no_toc}\n");
  assert.ok(html.includes("markdown-toc-in"));
  assert.ok(!html.includes("markdown-toc-out"));
  assert.ok(html.includes('<h2 class="no_toc" id="out">'));
});

test("block HTML runs to its close tag across blank lines and indentation", () => {
  const src = "<div class=\"a\">\n\nline one\n\n    indented *text*\n</div>\n\nafter\n";
  assert.equal(render(src), '<div class="a">\n\nline one\n\n    indented *text*\n</div>\n<p>after</p>\n');
});

test("markdown=\"1\" parses the content, also inside a raw block", () => {
  assert.equal(render('<div markdown="1">\n**bold**\n</div>\n'), "<div>\n<p><strong>bold</strong></p>\n</div>\n");
  const nested = render('<div style="display: none">\n<div id="x" markdown="1">\n*em*\n</div>\n</div>\n');
  assert.ok(nested.includes('<div id="x">\n<p><em>em</em></p>\n</div>'));
});

test("text after a closing block tag on the same line starts a new block", () => {
  assert.equal(render("<table><tr><td>x</td></tr></table>## Head\n"), '<table><tr><td>x</td></tr></table>\n<h2 id="head"><a href="#head"></a>Head</h2>\n');
});

test("an IAL sets attributes on the block above", () => {
  const html = render('| a |\n|---|\n| b |\n{: style="display: block"}\n');
  assert.ok(html.startsWith('<table style="display: block">'));
});

test("curly quotes only; dashes and ellipses are left alone", () => {
  assert.equal(render("it's \"quoted\" -- yes --- really... (c)"), "<p>it’s “quoted” -- yes --- really... (c)</p>\n");
  assert.equal(render("'single' and (\"x\")"), "<p>‘single’ and (“x”)</p>\n");
});

test("~~strike~~ is <s>; code spans carry the rouge class", () => {
  assert.equal(render("~~x~~ `y`"), '<p><s>x</s> <code class="language-plaintext highlighter-rouge">y</code></p>\n');
});

test("kramdown nests lazily indented lists and decides tightness per item", () => {
  assert.equal(
    render("1. A\n  * x\n  * y\n"),
    "<ol>\n<li>A\n<ul>\n<li>x</li>\n<li>y</li>\n</ul>\n</li>\n</ol>\n",
  );
  // a blank line between items does not make an item with a nested list loose
  assert.ok(!render("- A\n  - a\n\n- B\n  - b\n").includes("<p>"));
  assert.ok(render("- A\n\n- B\n").includes("<p>A</p>"));
});

test("footnotes use kramdown's markup", () => {
  const html = render("text[^n]\n\n[^n]: note\n");
  assert.ok(html.includes('<sup id="fnref:n"><a href="#fn:n" class="footnote" rel="footnote" role="doc-noteref">1</a></sup>'));
  assert.ok(html.includes('<div class="footnotes" role="doc-endnotes">'));
  assert.ok(html.includes('<a href="#fnref:n" class="reversefootnote" role="doc-backlink">&#8617;</a>'));
});

test("stray < in raw HTML is escaped like kramdown does", () => {
  assert.equal(escapeStrayTags("<h2><size=18>T<br>U</size></h2>"), "<h2>&lt;size=18>T<br>U&lt;/size&gt;</h2>");
  assert.equal(escapeStrayTags("<p>a<br但b</p>"), "<p>a&lt;br但b</p>");
  assert.equal(escapeStrayTags("<script>if (a<b) {}</script>"), "<script>if (a<b) {}</script>");
});
