import assert from "node:assert/strict";
import test from "node:test";

import { createTestEngine } from "../test-support.js";
import { createSkillText, statusLabel, UI_LANGS } from "./skill-text.js";

const LABELS = {
  en: { b: "Buff", d: "Debuff", o: "Other", f: "Field", s: "System", stk: "Stackable", unstk: "Unstackable", chg: "Charge", dot: "Damage over time", fld: "Field", cnt: "Count" },
  ja: { b: "バフ", d: "デバフ", o: "その他", f: "フィールド", s: "システム", stk: "重複可", unstk: "重複不可", chg: "チャージ", dot: "継続ダメージ", fld: "フィールド", cnt: "カウント" },
};
LABELS["zh-Hans"] = LABELS.ja;
LABELS["zh-Hant"] = LABELS.ja;

const SkillText = {
  rev: 1,
  labels: LABELS,
  statuses: [
    { id: 7, icon: "status_burn", tp: "d", fl: 5, n: { en: "Burn", ja: "火傷", "zh-Hans": "烧伤" }, d: { en: 'Lose "10%" HP <br>& more', ja: "HPが減る", "zh-Hans": "HP减少" } },
    { id: 9, icon: "", tp: "b", fl: 0, n: { en: "Wait", ja: "ウェイト" }, d: { ja: "待つ" } },
  ],
  skills: {
    // every language, tags inline, one status never named in the text
    100: {
      n: { en: "Fire Ball", ja: "ファイアボール", "zh-Hans": "火球", "zh-Hant": "火球" },
      t: {
        en: "Deal 70%.\nApply <wiki-status i=0>Burn</wiki-status>.",
        ja: "70%ダメージ。<wiki-status i=0>火傷</wiki-status>を付与。",
        "zh-Hans": "70%伤害。附加<wiki-status i=0>烧伤</wiki-status>。",
        "zh-Hant": "70%傷害。附加<wiki-status i=0>燒傷</wiki-status>。",
      },
      s: { en: [0, 1], ja: [0], "zh-Hans": [0], "zh-Hant": [0] },
    },
    // Japanese only
    101: { n: { ja: "オート" }, t: { ja: "オート行動時、敵を狙う。" } },
    // the same text in every language
    102: { n: { en: "X", ja: "X" }, t: { en: "+10%", ja: "+10%", "zh-Hans": "+10%", "zh-Hant": "+10%" } },
    // English and Japanese; Chinese readers get Japanese
    103: { n: { en: "Change", ja: "変化" }, t: { en: "Becomes <b>Fire</b>.", ja: "変化する。" } },
    // a name but no text
    104: { n: { en: "Passive", ja: "パッシブ" } },
    // a skill that changes into 100 (and into itself, and into a same-named skill)
    105: { n: { en: "Switch", ja: "切替" }, t: { en: "Switches.", ja: "切り替える。" } },
    // zh-Hans = zh-Hant text
    106: { n: { en: "Z", ja: "Z" }, t: { en: "same", ja: "same", "zh-Hans": "一样", "zh-Hant": "一样" } },
  },
};

const SkillMaster = {
  100: { skillName: "ファイアボール" },
  105: { skillName: "切替" },
  106: { skillName: "same-named" },
  107: { skillName: "切替" },
};

const make = (skills = SkillText.skills) => createSkillText({ data: { processed: { SkillText: { ...SkillText, skills } }, SkillMaster } });

test("status label follows the flags and localizes", () => {
  assert.equal(statusLabel(LABELS.en, "b", 1), "Buff/Stackable");
  assert.equal(statusLabel(LABELS.en, "d", 0), "Debuff/Unstackable");
  assert.equal(statusLabel(LABELS.en, "f", 8), "Other/Unstackable/Field");
  assert.equal(statusLabel(LABELS.en, "b", 1 | 2 | 4 | 16), "Buff/Stackable/Charge/Damage over time/Count");
  assert.equal(statusLabel(LABELS.ja, "d", 5), "デバフ/重複可/継続ダメージ");
});

test("languages that read differently get one block each, listing the languages they serve", () => {
  const html = make().skillHtml(100);
  const blocks = [...html.matchAll(/<div class="sdv" lang="([^"]+)" data-l="([^"]+)">/g)];
  assert.deepEqual(
    blocks.map((m) => [m[1], m[2], Boolean(m[3])]),
    [
      ["en", "en", false],
      ["zh-Hans", "zh-Hans", true],
      ["zh-Hant", "zh-Hant", true],
      ["ja", "ja", true],
    ],
  );
});

test("a language without text of its own is served by the Japanese block, which keeps the Pagefind exemption off only if it serves English", () => {
  const html = make().skillHtml(103);
  assert.match(html, /<div class="sdv" lang="en" data-l="en">Becomes <b>Fire<\/b>\.<\/div>/);
  assert.match(html, /<div class="sdv" lang="ja" data-l="zh-Hans zh-Hant ja">変化する。<\/div>/);
});

test("Japanese-only text is shown to everyone: nothing to switch, but it says it is Japanese", () => {
  assert.equal(make().skillHtml(101), '<div lang="ja">オート行動時、敵を狙う。</div>');
  assert.equal(make().skillNameHtml(101), '<span lang="ja">オート</span>');
});

test("identical text in every language needs no wrapper", () => {
  assert.equal(make().skillHtml(102), "+10%");
  assert.equal(make().skillNameHtml(102), "X");
});

test("identical renderings merge into one block", () => {
  assert.equal(
    make().skillHtml(106),
    '<div class="sdv" lang="en" data-l="en ja">same</div>' +
      '<div class="sdv" lang="zh-Hans" data-l="zh-Hans zh-Hant">一样</div>',
  );
});

test("status tags become chips with a localized tooltip; the status list repeats them all", () => {
  const burnEn =
    '<span class="status tippy" data-id="7" data-content="&lt;b&gt;Burn [Debuff/Stackable/Damage over time]&lt;/b&gt;' +
    '&lt;br&gt;Lose &quot;10%&quot; HP &lt;br&gt;&amp; more"><img class="status-s" src="/cdn/Sprite/status_burn.png" loading="lazy"> Burn</span>';
  // a status the text never names still appears in the list (no icon here); its English description is missing, so Japanese shows
  const waitEn =
    '<span class="status tippy" data-id="9" data-content="&lt;b&gt;Wait [Buff/Unstackable]&lt;/b&gt;&lt;br&gt;待つ">Wait</span>';
  const html = make().skillHtml(100);
  assert.ok(html.startsWith(`<div class="sdv" lang="en" data-l="en">Deal 70%. Apply ${burnEn}.<hr>${burnEn}, ${waitEn}</div>`), html);

  const burnJa =
    '<span class="status tippy" data-id="7" data-content="&lt;b&gt;火傷 [デバフ/重複可/継続ダメージ]&lt;/b&gt;&lt;br&gt;HPが減る">' +
    '<img class="status-s" src="/cdn/Sprite/status_burn.png" loading="lazy"> 火傷</span>';
  assert.ok(html.endsWith(`<div class="sdv" lang="ja" data-l="ja">70%ダメージ。${burnJa}を付与。<hr>${burnJa}</div>`), html);
});

test("a line break in the text becomes a space", () => {
  assert.doesNotMatch(make().skillHtml(100), /\n/);
  assert.match(make().skillHtml(100), /Deal 70%\. Apply /);
});

test("names are escaped and follow the same variant scheme", () => {
  const html = make({ 200: { n: { en: "A & B", ja: "AとB" } } }).skillNameHtml(200);
  assert.equal(
    html,
    '<span class="sdv" lang="en" data-l="en">A &amp; B</span>' +
      '<span class="sdv" lang="ja" data-l="zh-Hans zh-Hant ja">AとB</span>',
  );
});

test("a skill with no record falls back to its Japanese master name and renders no description", () => {
  const st = make();
  assert.equal(st.skillNameHtml(107), '<span lang="ja">切替</span>');
  assert.equal(st.skillHtml(999), "");
  assert.equal(st.skillHtml(104), "");
  assert.equal(st.hasText(104), false);
  assert.equal(st.hasText(100), true);
});

test("change skills get a <details> in the same language; the skill itself and a same-named skill are skipped", () => {
  const html = make().skillHtml(105, [100, 105, 107]);
  assert.match(html, /<details data-id="100"><summary>Fire Ball<\/summary><p>Deal 70%\. Apply <span class="status tippy"/);
  assert.match(html, /<details data-id="100"><summary>ファイアボール<\/summary><p>70%ダメージ。<span/);
  assert.equal([...html.matchAll(/<details data-id="105"/g)].length, 0);
  assert.equal([...html.matchAll(/<details data-id="107"/g)].length, 0);
});

test("without SkillText data the filters degrade to empty text and say so once", () => {
  const warnings = [];
  const st = createSkillText({ data: { SkillMaster } }, { warn: (message) => warnings.push(message) });
  assert.equal(st.skillHtml(100), "");
  assert.equal(st.skillNameHtml(100), "ファイアボール");
  assert.equal(st.hasText(100), false);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /py tools\/gen_skill_text\.py/);
});

test("in a strict build a missing SkillText.json is an error, not an empty page", () => {
  const st = createSkillText({ data: { SkillMaster } }, { strict: true });
  assert.throws(() => st.skillHtml(100), /SkillText\.json is missing/);
  assert.throws(() => st.skillNameHtml(100), /SkillText\.json is missing/);
  assert.throws(() => st.hasText(100), /SkillText\.json is missing/);
  assert.throws(() => st.treeJson({ langs: {} }), /SkillText\.json is missing/);
});

test("the Liquid filters are registered", async () => {
  const { render, site } = createTestEngine({ data: { processed: { SkillText } , SkillMaster } });
  void site;
  assert.equal(await render("{{ 102 | skill_html }}|{{ 101 | skill_has_text }}|{{ 104 | skill_has_text }}"), "+10%|true|false");
  assert.match(await render("{{ id | skill_html: ids }}", { id: 105, ids: [100] }), /<details data-id="100">/);
});

// ---- bloom skill trees ------------------------------------------------------------------------

const burn = { id: 7, name: "Burn", desc: "Lose HP", tp: "d", fl: 4, icon: "status_burn" };
const burnJa = { id: 7, name: "火傷", desc: "HPが減る", tp: "d", fl: 4, icon: "status_burn" };
const treeSkill = {
  skillId: 1001105,
  baseUseView: 0,
  maxedView: 0,
  lines: [{ node: 0, serialNo: 1, group: 0, prio: 0, order: 1, type: "text" }],
  tree: { 11: { cond: [], next: [], icon: "skillTree_flame" } },
  rows: [[{ id: 11, icon: "skillTree_flame" }]],
  langs: {
    en: {
      name: "Flaming Pitch+",
      base: "Deal 70%.",
      lt: ["<br>Gives <wiki-status i=0>Burn</wiki-status>."],
      nodes: { 11: "Burn <rate> +5%" },
      maxed: "Deal 70%.<br>Gives <wiki-status i=0>Burn</wiki-status>.",
      st: [burn],
      foot: [0],
      changes: [{ name: "Big & Bold", description: "Boom <wiki-status i=0>Burn</wiki-status>", st: [burn] }],
    },
    ja: {
      name: "燃ゆる白球+",
      base: "70%ダメージ。",
      lt: ["<br><wiki-status i=0>火傷</wiki-status>を付与。"],
      nodes: { 11: "火傷発動率+5%" },
      maxed: "70%ダメージ。<br><wiki-status i=0>火傷</wiki-status>を付与。",
      st: [burnJa],
      foot: [0],
      changes: [],
    },
  },
};

test("a bloom skill prints its name and all-active text in every language", () => {
  const st = make();
  assert.equal(
    st.treeNameHtml(treeSkill),
    '<span class="sdv" lang="en" data-l="en">Flaming Pitch+</span>' +
      '<span class="sdv" lang="ja" data-l="zh-Hans zh-Hant ja">燃ゆる白球+</span>',
  );
  const chip = (header, desc, shown) =>
    `<span class="status tippy" data-id="7" data-content="&lt;b&gt;${header}&lt;/b&gt;&lt;br&gt;${desc}">` +
    `<img class="status-s" src="/cdn/Sprite/status_burn.png" loading="lazy"> ${shown}</span>`;
  const en = (shown) => chip("Burn [Debuff/Unstackable/Damage over time]", "Lose HP", shown);
  const ja = (shown) => chip("火傷 [デバフ/重複不可/継続ダメージ]", "HPが減る", shown);
  // the part the script rewrites, then the status list, then the change skills (escaped, with their own statuses)
  assert.equal(
    st.treeHtml(treeSkill),
    `<div class="sdv" lang="en" data-l="en"><span class="st-text" data-st-text>Deal 70%.<br>Gives ${en("Burn")}.</span>` +
      `<hr>${en("Burn")}<details><summary>Big &amp; Bold</summary><p>Boom ${en("Burn")}</p></details></div>` +
      `<div class="sdv" lang="ja" data-l="zh-Hans zh-Hant ja"><span class="st-text" data-st-text>70%ダメージ。<br>${ja("火傷")}を付与。</span>` +
      `<hr>${ja("火傷")}</div>`,
  );
});

test("the tree's node tooltip is the English one until the script switches language", () => {
  assert.equal(make().treeNodeTip(treeSkill, 11), "Burn <rate> +5%");
  assert.equal(make().treeNodeTip({ langs: { ja: treeSkill.langs.ja } }, 11), "火傷発動率+5%");
});

test("the tree's script data carries the lines, the tree and per language the parts with chips already in them", () => {
  const json = make().treeJson(treeSkill);
  assert.ok(!json.includes("<"), "a < inside a <script> block could end it");
  const model = JSON.parse(json);
  assert.deepEqual(Object.keys(model).sort(), ["baseUseView", "langs", "lines", "tree"]);
  assert.deepEqual(Object.keys(model.langs.en).sort(), ["base", "lt", "nodes"]);
  assert.equal(model.langs.en.base, "Deal 70%.");
  assert.match(model.langs.en.lt[0], /^<br>Gives <span class="status tippy" data-id="7"/);
  assert.match(model.langs.ja.lt[0], /火傷<\/span>を付与。$/);
  assert.equal(model.langs.en.nodes["11"], "Burn <rate> +5%");
});

test("UI languages match web/src/lib/lang.ts", async () => {
  const fs = await import("node:fs");
  const ts = fs.readFileSync("web/src/lib/lang.ts", "utf8");
  const codes = [...ts.matchAll(/code: '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(UI_LANGS, codes);
});
