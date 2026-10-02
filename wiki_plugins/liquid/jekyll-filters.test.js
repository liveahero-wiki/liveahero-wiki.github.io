import assert from "node:assert/strict";
import test from "node:test";

import { createTestEngine } from "../test-support.js";

const data = {
  CardMaster: { 1: { stockId: 1, rarity: 3 }, 2: { stockId: 2, rarity: 4 }, 3: { stockId: 3, rarity: 3 } },
};
const { render } = createTestEngine({ data });

test("where/where_exp/group_by accept Hashes (Jekyll iterates their values)", async () => {
  assert.equal(await render('{% assign r = site.data.CardMaster | where: "rarity", 3 %}{{ r.size }}'), "2");
  assert.equal(await render('{% assign r = site.data.CardMaster | where_exp: "c", "c.rarity > 3" %}{{ r[0].stockId }}'), "2");
  assert.equal(
    await render('{% assign g = site.data.CardMaster | group_by: "rarity" %}{% for x in g %}{{ x.name }}={{ x.size }};{% endfor %}'),
    "3=2;4=1;",
  );
});

test("where compares as strings", async () => {
  assert.equal(await render('{% assign r = items | where: "n", "1" %}{{ r.size }}', { items: [{ n: 1 }, { n: "1" }, { n: 2 }] }), "2");
});

test("sort puts items without the key first and compares number-like strings as numbers", async () => {
  const items = [{ en: "b" }, { id: 1 }, { en: "a" }];
  assert.equal(await render('{% assign s = items | sort: "en" %}{% for i in s %}{{ i.en | default: "-" }}{% endfor %}', { items }), "-ab");
  assert.equal(await render('{% assign s = items | sort: "n" %}{{ s | map: "n" | join: "," }}', { items: [{ n: "10" }, { n: "9" }] }), "9,10");
});

test("split behaves like Ruby's String#split", async () => {
  assert.equal(await render('{{ "a  b c " | split: " " | join: "|" }}'), "a|b|c");
  assert.equal(await render('{{ "a,b,," | split: "," | size }}'), "2");
});

test("slugify keeps non-ASCII letters, like Jekyll", async () => {
  assert.equal(await render('{{ "Hello, World! 日本語" | slugify }}'), "hello-world-日本語");
});

test("arithmetic filters print Ruby floats", async () => {
  assert.equal(await render("{{ 200 | divided_by: 100.0 }}x"), "2.0x");
  assert.equal(await render("{{ 104.3 | minus: 100 }}"), "4.3");
  assert.equal(await render("{{ 7 | divided_by: 2 | floor }}"), "3");
});

test("date uses the site format, Ruby time offsets and %R", async () => {
  const { site, render: r } = createTestEngine();
  assert.equal(
    await r('{{ t | date: site.date_format }}', { t: new (await import("../lib/ruby-time.js")).RubyTime(Date.UTC(2026, 0, 22, 11, 0), 540) }),
    "22 Jan 2026 20:00 JST",
  );
  assert.ok(site.time instanceof Date);
});

test("jsonify of nothing is null, like Ruby's nil.to_json", async () => {
  assert.equal(await render("{{ nothing | jsonify }}"), "null");
  assert.equal(await render("{{ x | jsonify }}", { x: { a: [1, "b"] } }), '{"a":[1,"b"]}');
});

test("xml_escape leaves single quotes alone", async () => {
  assert.equal(await render("{{ x | xml_escape }}", { x: `<a href="x">'&'</a>` }), "&lt;a href=&quot;x&quot;&gt;'&amp;'&lt;/a&gt;");
});
