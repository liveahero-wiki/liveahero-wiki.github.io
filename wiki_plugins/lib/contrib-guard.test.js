import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  ALLOWED_NEW_TAGS,
  checkEdit,
  classifyToken,
  contributorIncludes,
  EDITABLE_PATHS,
  gitBlobSha,
  INCLUDE_DENYLIST,
  isEditablePath,
  isIncludeDenied,
  scanHtml,
  splitFrontMatter,
  tokenize,
} from "./contrib-guard.js";

const allowedIncludes = ["item.html", "item-icon.html", "quest-group.html", "shop-table.html", "skill-table-manual.html", "apache-chart.html", "figure-image.html"];
const check = (before, after) => checkEdit(before, after, { allowedIncludes });
const codes = (result) => result.violations.map((v) => v.code);
const passes = (before, after) => {
  const r = check(before, after);
  assert.deepEqual(r.violations, [], `expected the edit to pass: ${JSON.stringify(r.violations)}`);
  assert.equal(r.ok, true);
};
const fails = (before, after, ...expected) => {
  const r = check(before, after);
  assert.equal(r.ok, false, "expected the edit to be rejected");
  assert.deepEqual(codes(r), expected);
  return r;
};
const read = (file) => splitFrontMatter(fs.readFileSync(file, "utf8")).body;

// ---------------------------------------------------------------------------------------------
test("isEditablePath", () => {
  for (const p of ["_charas/ryekie.md", "_events/2201newyear.md", "_main_quests/ch1.md", "guide/hero.md", "chara_quests.md", "mobs.md", "_charas/androidSoldier_fire.md"]) {
    assert.equal(isEditablePath(p), true, p);
  }
  for (const p of [
    "_charas/../_layouts/default.html",
    "_charas/..md",
    "../guide/hero.md",
    "/guide/hero.md",
    "guide\\hero.md",
    "_charas\\ryekie.md",
    "_charas/sub/ryekie.md",
    "guide/sub/x.md",
    "_charas/ryekie.html",
    "_charas/_charas.11tydata.js",
    "_charas/.md",
    "_charas/",
    "_statuses/1.md",
    "_posts/2020-01-01-x.md",
    "_includes/item.html",
    "_layouts/default.html",
    ".github/workflows/site.yml",
    "assets/main.js",
    "index.html",
    "contributing/index.md",
    "guide/hero.md ",
    "guide/hero.md\n",
    "xguide/hero.md",
    "mobs.md/x",
    "",
    null,
    undefined,
    42,
  ]) {
    assert.equal(isEditablePath(p), false, String(p));
  }
  assert.equal(EDITABLE_PATHS.length, 6);
});

test("splitFrontMatter", () => {
  assert.deepEqual(splitFrontMatter("---\ntitle: A\n---\nBody\n"), { frontMatter: "---\ntitle: A\n---\n", body: "Body\n" });
  assert.deepEqual(splitFrontMatter("---\r\ntitle: A\r\n---\r\nBody\r\nmore"), { frontMatter: "---\r\ntitle: A\r\n---\r\n", body: "Body\r\nmore" });
  assert.deepEqual(splitFrontMatter("---\n---\nBody"), { frontMatter: "---\n---\n", body: "Body" });
  assert.deepEqual(splitFrontMatter("---\ntitle: A\n---"), { frontMatter: "---\ntitle: A\n---", body: "" });
  assert.deepEqual(splitFrontMatter("No front matter\n---\nx\n---\n"), { frontMatter: "", body: "No front matter\n---\nx\n---\n" });
  assert.deepEqual(splitFrontMatter(""), { frontMatter: "", body: "" });
  // only the first block is front matter
  assert.equal(splitFrontMatter("---\na: 1\n---\nBody\n---\nrule\n").body, "Body\n---\nrule\n");
  for (const text of ["---\na: 1\n---\nb", "x", "---\r\n---\r\n"]) {
    const { frontMatter, body } = splitFrontMatter(text);
    assert.equal(frontMatter + body, text);
  }
});

test("gitBlobSha matches git hash-object", async () => {
  assert.equal(await gitBlobSha(""), "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
  assert.equal(await gitBlobSha("hello\n"), "ce013625030ba8dba906f756967f9e9ca394464a");
  // utf-8 byte length, not UTF-16 length: git hash-object of "héllo ✓\n"
  const sha = await gitBlobSha("héllo ✓\n");
  const { execFileSync } = await import("node:child_process");
  const expected = execFileSync("git", ["hash-object", "--stdin"], { input: Buffer.from("héllo ✓\n", "utf8") }).toString().trim();
  assert.equal(sha, expected);
  const repoFile = fs.readFileSync("mobs.md");
  const fileSha = execFileSync("git", ["hash-object", "--stdin"], { input: repoFile }).toString().trim();
  assert.equal(await gitBlobSha(repoFile.toString("utf8")), fileSha);
});

// ---------------------------------------------------------------------------------------------
test("tokenize: kinds, positions and names", () => {
  const body = "a {% for x in y %}b{{ x.z }}{% raw %}{% if %}{% endraw %} {:toc} {% include item.html id=1 %}";
  const tokens = tokenize(body);
  assert.deepEqual(
    tokens.map((t) => [t.type, t.text]),
    [
      ["tag", "{% for x in y %}"],
      ["output", "{{ x.z }}"],
      ["raw", "{% raw %}{% if %}{% endraw %}"],
      ["kramdown", "{:toc}"],
      ["tag", "{% include item.html id=1 %}"],
    ],
  );
  assert.equal(tokens[0].name, "for");
  assert.equal(tokens[4].name, "include");
  for (const t of tokens) assert.equal(body.slice(t.start, t.end), t.text);
});

test("tokenize: raw blocks hide the tokens inside, whitespace control and spacing variants", () => {
  assert.equal(tokenize("{% raw %}{{ a }}{% for %}{% endraw %}").length, 1);
  assert.equal(tokenize("{%- raw -%}{{ a }}{%- endraw -%}").length, 1);
  assert.equal(tokenize("{%raw%} x {%endraw%}")[0].type, "raw");
  assert.deepEqual(tokenize("{%include item.html id=1%}{%- include item.html id=2 -%}").map((t) => t.name), ["include", "include"]);
  // a raw block that never ends runs to the end of the text
  const open = tokenize("a {% raw %} b {{ c }}");
  assert.equal(open.length, 1);
  assert.equal(open[0].unclosed, true);
  // two raw blocks stay two tokens
  assert.equal(tokenize("{% raw %}a{% endraw %} x {% raw %}b{% endraw %}").length, 2);
});

test("tokenize: quotes and braces inside tokens", () => {
  const t = tokenize('{{ "}}" }} after {% if a == "%}" %}x{% endif %}');
  assert.deepEqual(t.map((x) => x.text), ['{{ "}}" }}', '{% if a == "%}" %}', "{% endif %}"]);
  assert.deepEqual(tokenize("{{ a | append: '}}' }}z").map((x) => x.text), ["{{ a | append: '}}' }}"]);
  // an apostrophe is not a string
  assert.deepEqual(tokenize("{% chara_link O'Brien %} isn't {{ x }}").map((x) => x.text), ["{% chara_link O'Brien %}", "{{ x }}"]);
  // a quote without its end on the same line is a plain character
  assert.deepEqual(tokenize('{% x a="b %}\n"{{ y }}').map((x) => x.text), ['{% x a="b %}', "{{ y }}"]);
  // braces that are not tokens
  assert.deepEqual(tokenize("{ not } {x} {{ ok }} {{{ }}").map((x) => x.text), ["{{ ok }}", "{{{ }}"]);
});

test("tokenize: multi-line tokens and kramdown", () => {
  const voice = '{% include voice-table.html resourceName="akashi"\n  foo="bar"\n%}';
  assert.deepEqual(tokenize(`x\n${voice}\ny`).map((t) => t.text), [voice]);
  assert.deepEqual(tokenize("## H\n{:toc}\n").map((t) => t.text), ["{:toc}"]);
  assert.deepEqual(tokenize('x\n{: style="display: block; overflow-x: scroll"}\n').map((t) => t.text), ['{: style="display: block; overflow-x: scroll"}']);
  assert.deepEqual(tokenize("{::comment}note{:/comment}").map((t) => t.text), ["{::comment}", "{:/comment}"]);
  // kramdown attributes end on their line: a stray "{:" is text
  assert.deepEqual(tokenize("a {: b\nc }").map((t) => t.text), []);
});

test("tokenize: unclosed tags", () => {
  const t = tokenize("text {% for x in y and more text");
  assert.equal(t.length, 1);
  assert.equal(t[0].unclosed, true);
  assert.equal(t[0].text, "{%");
  assert.equal(tokenize("a {{ b").length, 1);
  assert.deepEqual(tokenize("a {"), []);
  assert.deepEqual(tokenize("{"), []);
  assert.deepEqual(tokenize(""), []);
});

// ---------------------------------------------------------------------------------------------
test("classifyToken: chara_link", () => {
  const free = (text, name = "chara_link") => classifyToken({ type: "tag", text, name }, allowedIncludes).free;
  assert.equal(free("{% chara_link Ryekie %}"), true);
  assert.equal(free("{% chara_link Ryekie|h1 %}"), true);
  assert.equal(free("{% chara_link Ryekie|h2 %}"), true);
  assert.equal(free("{%chara_link Ryekie|s1%}"), true);
  assert.equal(free("{%- chara_link Ryekie|h10 -%}"), true);
  assert.equal(free("{% chara_link Grill & Chill %}"), true);
  assert.equal(free("{% chara_link Dr. Zero|h2 %}"), true);
  assert.equal(free("{% chara_link ライエキ %}"), true);
  assert.equal(free("{% chara_link  %}"), false);
  assert.equal(free("{% chara_link Ryekie|x1 %}"), false);
  assert.equal(free("{% chara_link Ryekie|h1|h2 %}"), false);
  assert.equal(free("{% chara_link Ryekie | h1 %}"), false);
  assert.equal(free("{% chara_link <b>x</b> %}"), false);
  assert.equal(free("{% chara_link {{ name }} %}"), false);
  assert.equal(free('{% chara_link "x" %}'), false);
  assert.equal(free("{% chara_link a\nb %}"), false);
  assert.equal(free("{% chara_link Ryekie | upcase %}"), false);
  assert.match(classifyToken({ type: "tag", text: "{% chara_link Ryekie | h1 %}", name: "chara_link" }).reason, /chara_link Name/);
});

test("classifyToken: includes with literal parameters", () => {
  const cls = (text) => classifyToken({ type: "tag", text, name: "include" }, allowedIncludes);
  for (const text of [
    "{% include item.html id=11 %}",
    "{%include item.html id=11%}",
    "{%- include item-icon.html id=11 -%}",
    "{% include item.html %}",
    '{% include item.html name="Ether Crystal" %}',
    "{% include item.html name='Ether Crystal' %}",
    "{% include item.html id=2 rewardType=1 %}",
    "{% include item.html id=-2 %}",
    "{% include item.html id=1.5 %}",
    "{% include item.html id=true %}",
    "{% include shop-table.html id=5 %}",
    "{% include quest-group.html chapterId=402 %}",
    '{% include skill-table-manual.html skillIds="1051101,1051102" equipmentSkills="6051102,6000001" %}',
    '{% include figure-image.html path="/assets/img/x.png" title="Something (nice) here" %}',
    '{% include item.html\n   id=3\n   name="A"\n%}',
  ]) {
    assert.equal(cls(text).free, true, text);
  }
  const bad = {
    "{% include voice-table.html resourceName=\"x\" %}": /not one contributors may use/,
    "{% include nope.html id=1 %}": /not one contributors may use/,
    "{% include item %}": /not one contributors may use/,
    "{% include js/theme.js %}": /not one contributors may use/,
    "{% include ../x.html %}": /not one contributors may use/,
    "{% include item.html id=page.id %}": /plain number/,
    "{% include item.html id=site.data.x[0] %}": /plain number/,
    "{% include item.html id={{ x }} %}": /plain number/,
    "{% include item.html id=x | plus: 1 %}": /plain number/,
    "{% include item.html id=true | plus: 1 %}": /name=value/,
    "{% include item.html id=site %}": /plain number/,
    '{% include item.html name="a" | upcase %}': /name=value/,
    '{% include item.html name="a|b" %}': /plain number/,
    '{% include item.html name="{{ x }}" %}': /plain number/,
    '{% include item.html name="<b>" %}': /plain number/,
    '{% include item.html name="a;b" %}': /plain number/,
    "{% include item.html name=\"it's\" %}": /plain number/,
    "{% include item.html name='say \"hi\"' %}": /plain number/,
    '{% include item.html name="a\\"b" %}': /plain number/,
    '{% include item.html name="a" b %}': /name=value/,
    '{% include item.html style="color: red" %}': /not allowed/,
    '{% include item.html onclick="x" %}': /not allowed/,
    '{% include item.html OnLoad=1 %}': /not allowed/,
    "{% include item.html with x %}": /name=value/,
    "{% include item.html id=1x %}": /plain number/,
  };
  for (const [text, reason] of Object.entries(bad)) {
    const r = cls(text);
    assert.equal(r.free, false, text);
    assert.match(r.reason, reason, text);
  }
  // not an include / chara_link
  assert.equal(classifyToken({ type: "tag", text: "{% for x in y %}", name: "for" }, allowedIncludes).free, false);
  assert.equal(classifyToken({ type: "output", text: "{{ x }}" }, allowedIncludes).free, false);
  assert.equal(classifyToken({ type: "raw", text: "{% raw %}{% endraw %}", name: "raw" }, allowedIncludes).free, false);
  assert.equal(classifyToken({ type: "kramdown", text: "{:toc}" }, allowedIncludes).free, false);
  // an include list may be a Set or an array; none means nothing is allowed
  assert.equal(classifyToken({ type: "tag", text: "{% include item.html id=1 %}", name: "include" }, new Set(["item.html"])).free, true);
  assert.equal(classifyToken({ type: "tag", text: "{% include item.html id=1 %}", name: "include" }).free, false);
});

test("includes: denylist and the contributor list", () => {
  for (const f of ["header.html", "footer.html", "banner.html", "pagefind-search.html", "skill-lang-picker.html", "js/theme.js", "style/tabs.min.css", "voice-table.html", "bio-infobox.html", "hero-infobox.html", "hero-infobox-unreleased.html", "hero-infobox-gallery.html", "sidekick-infobox.html", "hero-skill-evolution-v2.html", "card-hero.html", "card-collection-info.html", "team-creator-link.html"]) {
    assert.equal(isIncludeDenied(f), true, f);
  }
  for (const f of ["quest-group.html", "shop-table.html", "skill-table-manual.html", "apache-chart.html", "item.html", "item-icon.html", "figure-image.html", "library-info.html"]) {
    assert.equal(isIncludeDenied(f), false, f);
  }
  assert.deepEqual(contributorIncludes(["item.html", "header.html", "js/theme.js", "style/tabs.min.css", "quest-group.html", "x.js", "card-hero.html", "sub/item.html"]), ["item.html", "quest-group.html"]);
  assert.ok(INCLUDE_DENYLIST.length > 10);
});

test("the real _includes folder: nothing structural is open to contributors", () => {
  const files = fs.readdirSync("_includes", { recursive: true }).map((f) => f.replaceAll("\\", "/"));
  const list = contributorIncludes(files);
  for (const f of ["item.html", "item-icon.html", "quest-group.html", "shop-table.html", "skill-table-manual.html", "apache-chart.html"]) {
    assert.ok(list.includes(f), f);
  }
  for (const f of ["header.html", "footer.html", "voice-table.html", "bio-infobox.html", "hero-infobox.html", "hero-infobox-unreleased.html", "pagefind-search.html", "banner.html"]) {
    assert.ok(!list.includes(f), f);
  }
  assert.ok(list.every((f) => !f.includes("/")));
});

// ---------------------------------------------------------------------------------------------
test("free tokens may be added, edited and removed", () => {
  passes("Text.\n", "Text. {% chara_link Ryekie %} joins.\n");
  passes("A {% chara_link Ryekie %} B\n", "A B\n");
  passes("A {% chara_link Ryekie|h1 %} B\n", "A {% chara_link Kalaski|h2 %} B\n");
  passes("A {% include item.html id=1 %}\n", "A {% include item.html id=2 %} {% include item-icon.html id=3 %}\n");
  passes("{% include quest-group.html chapterId=1 %}\n", "{% include quest-group.html chapterId=2 %}\n{% include shop-table.html id=4 %}\n");
  passes('{% include skill-table-manual.html skillIds="1,2" %}', "");
  passes("", '{% include figure-image.html path="/assets/a.png" title="A" %}');
});

test("protected tokens: identical sequence passes, text around them is free", () => {
  const before = "Intro text.\n\n{% for i in (1..3) %}\nrow {{ i }}\n{% endfor %}\n\nOutro.\n{:toc}\n";
  passes(before, before);
  passes(before, before.replace("Intro text.", "A completely new intro, with {% chara_link Ryekie %}.").replace("row ", "item number "));
  passes(before, before.replace("Outro.", "Outro. Another sentence.\n\n## New section\n\nMore text."));
  passes(before, before.replaceAll("\n", "\r\n")); // line endings alone
  passes("{% raw %}\n{{ x }}\n{% endraw %}\n", "{% raw %}\r\n{{ x }}\r\n{% endraw %}\r\n");
  passes("", "Plain\n");
});

test("protected tokens: added, removed, changed, reordered", () => {
  const before = "A\n{% for i in x %}\n{{ i }}\n{% endfor %}\nB\n";

  let r = fails(before, before + "{{ site.data.secret }}\n", "protected-added");
  assert.match(r.violations[0].message, /new \{\{ }} expression was added/);
  assert.equal(r.violations[0].token, "{{ site.data.secret }}");

  r = fails(before, before.replace("{% endfor %}", ""), "protected-removed");
  assert.match(r.violations[0].message, /\{% endfor %} tag was removed/);

  r = fails(before, before.replace("{% for i in x %}", "{% for i in y %}"), "protected-changed");
  assert.match(r.violations[0].message, /This \{% for %} tag was changed/);
  assert.match(r.violations[0].message, /\{% for i in x %} became \{% for i in y %}/);

  r = fails(before, before.replace("{{ i }}", "{{ i | upcase }}"), "protected-changed");

  fails(before, "A\n{{ i }}\n{% for i in x %}\n{% endfor %}\nB\n", "protected-reordered");
  fails("{% assign a = 1 %}{% assign b = 2 %}", "{% assign b = 2 %}{% assign a = 1 %}", "protected-reordered");

  fails("A {{ x }}", "A", "protected-removed");
  fails("A", "A {% if x %}", "protected-added");
  fails("A", "A {% assign x = 1 %}", "protected-added");
  fails("{% comment %}x{% endcomment %}", "{% comment %}x", "protected-removed");
  fails("{:toc}", "", "protected-removed");
  fails("", "{:toc}", "protected-added");
  fails("", '{: style="display: none"}', "protected-added");
  fails("", "{::options auto_ids=\"false\" /}", "protected-added");
  fails("", "{% endraw %}", "protected-added");
});

test("protected tokens: a change and a removal are both reported", () => {
  const before = "{% assign a = 1 %}{% assign b = 2 %}{% assign c = 3 %}";
  const r = check(before, "{% assign a = 9 %}{% assign c = 3 %}");
  assert.deepEqual(codes(r), ["protected-changed", "protected-removed"]);
  const r2 = check(before, "{% assign c = 3 %}");
  assert.deepEqual(codes(r2), ["protected-removed", "protected-removed"]);
  const r3 = check(before, `${before}{% assign d = 4 %}{{ e }}`);
  assert.deepEqual(codes(r3), ["protected-added", "protected-added"]);
});

test("raw blocks are one token", () => {
  const before = "{% raw %}\n{% for x %}{{ y }}\n{% endraw %}\nText\n";
  passes(before, before.replace("Text", "Other text"));
  fails(before, before.replace("{{ y }}", "{{ z }}"), "protected-changed");
  fails(before, "Text\n", "protected-removed");
  // tokens inside a raw block are not separate tokens, so adding the same text outside is a new token
  fails(before, `${before}{{ y }}`, "protected-added");
  // breaking out of a raw block changes its text
  fails(before, before.replace("{% endraw %}", "{% endraw %}{% for x %}"), "protected-added");
  // free-looking tokens inside raw blocks are protected text
  fails("{% raw %}{% include item.html id=1 %}{% endraw %}", "{% raw %}{% include item.html id=2 %}{% endraw %}", "protected-changed");
});

test("a free-looking token that is not free stays protected", () => {
  // not allowed file
  let r = fails("", "{% include voice-table.html resourceName=\"x\" %}", "protected-added");
  assert.match(r.violations[0].message, /voice-table\.html/);
  assert.match(r.violations[0].message, /not one contributors may use/);
  fails("", "{% include header.html %}", "protected-added");
  // not literal
  r = fails("", "{% include item.html id=page.id %}", "protected-added");
  assert.match(r.violations[0].message, /plain number/);
  fails("", '{% include item.html name="a" | upcase %}', "protected-added");
  fails("", "{% include item.html id={{ x }} %}", "protected-added");
  fails("", "{% include item.html style=\"x\" %}", "protected-added");
  // chara_link in a form that is not allowed
  fails("", "{% chara_link {{ name }} %}", "protected-added");
  fails("", "{% chara_link Ryekie | upcase %}", "protected-added");
  // an existing protected call is byte-identical or nothing
  const call = '{% include voice-table.html resourceName="akashi"\n  KEY = "x"\n%}';
  passes(`A\n${call}\nB`, `A edited\n${call}\nB edited`);
  fails(`A\n${call}\nB`, `A\n${call.replace("akashi", "ryekie")}\nB`, "protected-changed");
  fails(`A\n${call}\nB`, "A\nB", "protected-removed");
  // an existing call with variables stays, but cannot be edited
  const loop = "{% include sales-report.html sales_report=sales_report %}";
  const withLoop = `{% for i in (1..15) %}\n{% assign sales_report = "S_" | append: i %}\n${loop}\n{% endfor %}`;
  passes(withLoop, `Text above\n${withLoop}\nText below`);
  fails(withLoop, withLoop.replace("sales_report=sales_report", "sales_report=other"), "protected-changed");
  fails("{% include item.html id=page.x %}\n", "{% include item.html id=page.y %}\n", "protected-changed");
  // a bare word other than true/false/nil is a variable lookup: not free
  fails("", "{% include item.html id=site %}\n", "protected-added");
  fails("{% include item.html id=var %}\n", "{% include item.html id=var2 %}\n", "protected-changed");
  passes("{% include item.html id=true %}\n", "{% include item.html id=false %}\n");
  // with the include list unknown nothing is free
  assert.equal(checkEdit("", "{% include item.html id=1 %}").ok, false);
  assert.equal(checkEdit("", "{% chara_link Ryekie %}").ok, true);
});

test("unclosed tokens are reported", () => {
  const r = fails("a", "a {% if x", "protected-added");
  assert.match(r.violations[0].message, /never closed/);
  fails("a", "a {{ x", "protected-added");
  fails("a", "a {% raw %} b", "protected-added");
  passes("a {{ x", "a edited {{ x");
});

// ---------------------------------------------------------------------------------------------
test("HTML: allowed new tags", () => {
  passes("A\n", "A\n<details>\n<summary>More</summary>\nText<br>and<br/>more<br />\n</details>\n");
  passes("A\n", "<details open>\n<summary>More</summary>\nx\n</details>\n");
  passes("", "<table>\n<thead><tr><th>A</th><th colspan=2>B</th></tr></thead>\n<tbody><tr><td align=\"center\">1</td><td rowspan=\"2\" align=right>2</td></tr></tbody>\n<caption>c</caption><colgroup><col></colgroup><tfoot><tr><td>x</td></tr></tfoot></table>");
  passes("", "<TABLE><TR><TD>x</TD></TR></TABLE>");
  assert.ok(["details", "summary", "br", "table", "td", "col", "colgroup"].every((t) => ALLOWED_NEW_TAGS.includes(t)));
  // autolinks and ordinary angle brackets are not tags
  passes("", "See <https://example.com/a?b=1&c=2> and <http://x.y> for 1 < 2, a <- b, <3, and 5 > 4.\n");
  // closing tags alone are not checked
  passes("<div>x</div>", "<div>x</div></details>");
});

test("HTML: new tags that are rejected", () => {
  const cases = {
    "<script>alert(1)</script>": /<script> cannot be added/,
    '<script src="x.js"></script>': /<script> cannot be added/,
    "<iframe src=x></iframe>": /<iframe>/,
    '<svg onload="x()"></svg>': /event handlers/,
    "<svg><path d=x/></svg>": /<svg>/,
    '<img src=x onerror="a()">': /event handlers/,
    '<div style="x:y">z</div>': /style/,
    '<a href="javascript:alert(1)">x</a>': /javascript:/,
    "<a href=http://x.y>x</a>": /<a> cannot be added/,
    "<div>x</div>": /<div>/,
    "<code>x</code>": /<code>/,
    "<p>x</p>": /<p>/,
    "<style>x{}</style>": /<style>/,
    "<object data=x>": /<object>/,
    "<form action=x>": /<form>/,
    "<!-- note -->": /comments cannot be added/,
    "<!--": /comments cannot be added/,
    "<!DOCTYPE html>": /declaration/,
    "<?php echo 1 ?>": /declaration/,
    '<details onclick="x()">': /only have the open/,
    '<details class="a">': /only have the open/,
    "<details open=open>": /only have the open/,
    '<summary class="x">': /cannot have attributes/,
    '<br class="x">': /cannot have attributes/,
    '<br style="x">': /cannot have attributes/,
    '<td onclick="x()">': /not allowed|cannot have the attribute/,
    '<td style="color:red">': /cannot have the attribute "style"/,
    '<td class="x">': /cannot have the attribute "class"/,
    "<td colspan=x>": /must be simple/,
    '<td colspan="2" onmouseover="x">': /cannot have the attribute "onmouseover"/,
    '<th align="javascript:x">': /must be simple/,
    "<td colspan>": /must be simple/,
    "<table border=1>": /cannot have the attribute "border"/,
    '<td colspan="1">x</td><td colspan="1234">': /must be simple/,
    "<SCRIPT>x</SCRIPT>": /<script>/,
    "<scr{% chara_link A %}ipt>": /<scr>|cannot be added/,
    "<script": /never closed/,
    '<table a="b>': /never closed/,
  };
  for (const [html, message] of Object.entries(cases)) {
    const r = check("A\n", `A\n${html}\n`);
    assert.equal(r.ok, false, html);
    assert.ok(r.violations.every((v) => v.code === "html-not-allowed"), html);
    assert.match(r.violations[0].message, message, html);
  }
});

test("HTML: existing tags may stay or go, nothing new may appear", () => {
  const before = '<div style="a:b" class="c">\n<table>\n<tr><td onclick="x">Old text</td></tr>\n</table>\n<code>x</code> <br> <br>\n</div>\n<!-- keep -->\n';
  passes(before, before);
  passes(before, before.replace("Old text", "A new sentence about it"));
  passes(before, before.replace("<code>x</code>", "")); // delete a tag
  passes(before, "Nothing left.\n");
  passes(before, before + "<br>\n<br>\n"); // <br> may be added any number of times
  // multiset: a second copy of an existing tag that is not allowed is new
  fails(before, `${before}<code>x</code>\n`, "html-not-allowed");
  // changing the attributes of an existing tag makes it a new tag
  fails(before, before.replace('class="c"', 'class="d"'), "html-not-allowed");
  fails(before, before.replace('<td onclick="x">', '<td onclick="y">'), "html-not-allowed");
  fails(before, before.replace("<!-- keep -->", "<!-- changed -->"), "html-not-allowed");
  fails(before, before.replace("<div ", '<div id="z" '), "html-not-allowed");
  // exact attribute string, but the tag name is case-insensitive
  passes("<DIV>x</DIV>", "<div>x</div>");
  // the same tag twice, one kept
  passes("<p>a</p><p>b</p>", "<p>a</p>");
  fails("<p>a</p>", "<p>a</p><p>b</p>", "html-not-allowed");
});

test("HTML: real world inline html scanning", () => {
  const tags = scanHtml('<p> <code>x</code><br>a <br/> <a href="/x?a=1>2" title=\'q>\'>l</a> <!-- c > --> <td colspan=2 >');
  assert.deepEqual(
    tags.map((t) => t.key),
    ["p ", "code ", "br ", "br /", 'a href="/x?a=1>2" title=\'q>\'', "!-- c > -->".replace("!-- c > -->", "<!-- c > -->"), "td colspan=2"],
  );
  assert.deepEqual(scanHtml("a < b > c").length, 0);
  assert.deepEqual(scanHtml("</div> <https://x.y/z> <3").length, 0);
});

test("HTML: a free include cannot smuggle markup", () => {
  fails("", '{% include item.html name="<script>" %}', "protected-added", "html-not-allowed");
});

// ---------------------------------------------------------------------------------------------
test("both guards report together", () => {
  const r = check("A {% for x in y %}{% endfor %}", "A <script>x</script> {% for x in z %}{% endfor %}");
  assert.deepEqual(codes(r).sort(), ["html-not-allowed", "protected-changed"]);
  for (const v of r.violations) assert.equal(typeof v.message, "string");
});

test("a lot of tokens stay fast", () => {
  const body = Array.from({ length: 4000 }, (_, i) => `row ${i} {% include item.html id=${i} %} {% assign v${i} = 1 %}`).join("\n");
  const started = Date.now();
  passes(body, body.replace("row 5 ", "row five "));
  const r = check(body, body.replace("{% assign v7 = 1 %}", ""));
  assert.deepEqual(codes(r), ["protected-removed"]);
  assert.ok(Date.now() - started < 4000, "took too long");
});

// ---------------------------------------------------------------------------------------------
test("real pages: identity edits and plausible edits pass", () => {
  const includes = contributorIncludes(fs.readdirSync("_includes", { recursive: true }).map((f) => f.replaceAll("\\", "/")));
  const run = (before, after) => checkEdit(before, after, { allowedIncludes: includes });

  const files = [];
  for (const dir of ["_charas", "_events", "_main_quests", "guide"]) {
    for (const f of fs.readdirSync(dir)) if (isEditablePath(`${dir}/${f}`)) files.push(`${dir}/${f}`);
  }
  for (const f of ["chara_quests.md", "mobs.md"]) files.push(f);
  assert.ok(files.length > 200);

  for (const file of files) {
    const body = read(file);
    const same = run(body, body);
    assert.deepEqual(same.violations, [], `${file}: identity edit`);
    // a new paragraph with a chara_link, an item and a details block at the end
    const extra = `${body}\n\nA note about {% chara_link Ryekie|h1 %} and {% include item.html id=2 %}.\n\n<details><summary>More</summary>\nHidden text<br>here\n</details>\n`;
    const grown = run(body, extra);
    assert.deepEqual(grown.violations, [], `${file}: appended text`);
    // EOL conversion
    const crlf = run(body, body.replace(/\r?\n/g, "\r\n"));
    assert.deepEqual(crlf.violations, [], `${file}: CRLF`);
  }
});

test("real pages: guide/hero.md (for loop inside a footnote table)", () => {
  const body = read("guide/hero.md");
  const edited = body.replace("See full EXP table [^bigtable].", "See the full EXP table below [^bigtable]. It runs to level 100.");
  assert.notEqual(edited, body);
  passes(body, edited);
  // the loop's own text can be edited, the template cannot
  fails(body, body.replace("{% for pair in site.data.HeroCardExpMaster %}", "{% for pair in site.data.Other %}"), "protected-changed");
  fails(body, body.replace("{{ pair[1].level }}", "{{ pair[1].nextExp }}"), "protected-changed");
  fails(body, body.replace("{% endfor %}", ""), "protected-removed");
  // <tr> and <td> already exist there, and <td> with a plain colspan may be added
  passes(body, body.replace("<th>Level</th>", "<th>Level</th><th colspan=2>x</th>"));
});

test("real pages: guide/sale.md (items in tables, a loop with an include, a big comment)", () => {
  const body = read("guide/sale.md");
  passes(body, body.replace("All sale types reward some EXP.", "All sale types reward some EXP, and more at higher ranks."));
  // table cells with item-icon includes can be edited and extended
  const rows = body.split("\n").filter((l) => l.includes("item-icon.html"));
  assert.ok(rows.length > 3);
  passes(body, body.replace(rows[0], rows[0].replace("400", "450") + " {% include item.html id=2 %}"));
  // the loop that renders the sales reports is template code
  fails(body, body.replace("(1..15)", "(1..20)"), "protected-changed");
  fails(body, body.replace('{% assign sales_report = "SALES_REPORT_" | append: i %}', ""), "protected-removed");
  // the long HTML comment may stay, but not be edited or duplicated
  const comment = /<!--[\s\S]*?-->/.exec(body)[0];
  passes(body, body.replace("For special sales report", "For the special sales reports"));
  fails(body, body.replace(comment, comment.replace("Sales Report 1", "Sales Report one")), "html-not-allowed");
  fails(body, `${body}\n${comment}\n`, "html-not-allowed");
  passes(body, body.replace(comment, ""));
});

test("real pages: _events/2201newyear.md", () => {
  const body = read("_events/2201newyear.md");
  passes(body, body.replace("New year 2022!", "Happy new year 2022!"));
  passes(body, body.replace("| 1  | 1 {% include item.html id=2 %}", "| 1  | 2 {% include item.html id=2 %}"));
  passes(body, `${body}\n- {% chara_link Ryekie|h2 %} ${"{% chara_link Sui|h1 %}"}\n`);
  passes(body, body.replace("{% chara_link Ryekie|h2 %}", "{% chara_link Kalaski|h2 %}"));
  const tokens = tokenize(body);
  assert.ok(tokens.some((t) => t.name === "chara_link"));
});

test("real pages: a _charas page (voice tables are protected, text around them is not)", () => {
  const body = read("_charas/akashi.md");
  const tokens = tokenize(body);
  assert.ok(tokens.some((t) => t.text.includes("voice-table.html")));
  const includes = contributorIncludes(fs.readdirSync("_includes").map((f) => f));
  const run = (a, b) => checkEdit(a, b, { allowedIncludes: includes });
  const voice = tokens.find((t) => t.text.includes("voice-table.html")).text;
  assert.deepEqual(run(body, body.replace("## Notes", "## Notes\n\nA new sentence.")).violations, []);
  assert.deepEqual(run(body, body.replace(voice, voice.replace("akashi", "x"))).violations.map((v) => v.code), ["protected-changed"]);
  assert.deepEqual(run(body, body.replace(voice, "")).violations.map((v) => v.code), ["protected-removed"]);
  const added = run(body, `${body}\n{% include voice-table.html resourceName="akashi" %}\n`);
  assert.deepEqual(added.violations.map((v) => v.code), ["protected-added"]);
  assert.match(added.violations[0].message, /voice-table\.html/);
  const ryekie = read("_charas/ryekie.md");
  assert.deepEqual(run(ryekie, `${ryekie}\n## Usage guide\n\nUse {% chara_link Ryekie|h2 %} first.\n\n<details>\n<summary>Why</summary>\nBecause.\n</details>\n`).violations, []);
});

test("module has no node: imports (it must run in the browser)", () => {
  const source = fs.readFileSync(path.join(import.meta.dirname, "contrib-guard.js"), "utf8");
  assert.doesNotMatch(source, /from\s+["']node:|require\(|import\(["']node:/);
  assert.doesNotMatch(source, /process\.|Buffer\b/);
});
