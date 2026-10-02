// The ports of chara.rb, item.rb, catalog.rb and image.rb.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestEngine } from "../test-support.js";
import { IntKeyMap } from "./int-key-map.js";
import { processCharaGroup, processVoiceActor } from "./catalog.js";
import { imageDimension } from "./image.js";

const data = {
  CardMaster: { 100011: { resourceName: "akashi", name: "Akashi" } },
  SidekickMaster: { 100021: { resourceName: "akashi", name: "Akashi" }, 1: { resourceName: "x" } },
  ItemMaster: { 3: { itemName: "Ether", description: 'A "crystal"', resourceName: "stone01" } },
  wiki: { Item: new IntKeyMap({ 3: { name: "Ether Crystal" } }) },
};
const charas = [
  { title: "Akashi", characterId: 0, url: "/charas/akashi/", unreleased: false, h2: { title: "Akashi (alt)" } },
  { title: "Ghost", url: "/charas/ghost/", unreleased: true, icon: "ghost" },
];
const { render } = createTestEngine({ data, charas });

test("chara_link: plain name, variant suffix, unreleased and unknown", async () => {
  assert.equal(
    await render("{% chara_link Akashi|h1 %}"),
    '<a href="/charas/akashi/#h10001"><span class="item"><img src="/cdn/Sprite/icon_akashi_h01.png" loading="lazy" width="32" height="32"></span> Akashi</a>'.replace("h10001", "h10001"),
  );
  assert.equal(
    await render("{% chara_link Ghost %}"),
    '<a href="/charas/ghost/"><span class="item"><img src="/assets/img/unreleased/ghost.png" loading="lazy"></span> Ghost</a>',
  );
  assert.equal(await render("{% chara_link Nobody|h1 %}"), "Nobody");
});

test("stockIdToLink uses the variant title for variants above 1", async () => {
  const out = await render("{{ 10002 | stockIdToCharaTitle: 1 }}");
  assert.equal(out, "Akashi (alt)");
});

test("lah_item escapes the tooltip and prefers the wiki name", async () => {
  assert.equal(
    await render("{% include item.html id=3 %}"),
    '<span class="item tippy" data-content="A &quot;crystal&quot;"><img src="/cdn/Sprite/item_stone01.png" loading="lazy"> Ether Crystal</span>',
  );
});

test("integer-keyed YAML maps only answer numeric lookups (Ruby's Hash#[])", async () => {
  const { render: r } = createTestEngine({ data: { wiki: { O: new IntKeyMap({ 7: "x" }) } } });
  assert.equal(await r("{{ site.data.wiki.O[7] }}|{{ site.data.wiki.O['7'] }}"), "x|");
});

test("processVoiceActor / processCharaGroup", () => {
  assert.deepEqual(processVoiceActor("A,B＋C+D,"), ["A", "B", "C", "D"]);
  assert.equal(processVoiceActor("？？？").length, 5);
  const groups = processCharaGroup([{ cv: "A,B" }, { cv: "B" }], "cv", { A: { en: "Aa" } });
  assert.deepEqual(groups.map((g) => [g.name, g.en, g.items.length]), [["A", "Aa", 1], ["B", undefined, 2]]);
});

test("image dimensions: PNG via image-size, SVG like FastImage (units ignored), missing is null", () => {
  assert.deepEqual(imageDimension("/assets/img/Playerid.png"), [1920, 3200]);
  assert.deepEqual(imageDimension("/assets/img/survey-2025/ranked_voting_global.svg"), [1147, 827]);
  assert.equal(imageDimension("/assets/img/does-not-exist.png"), null);
});
