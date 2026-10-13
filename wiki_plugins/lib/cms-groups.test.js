// The targets declared by pages (cms-groups.js) and the single-group registry built from them.
import assert from "node:assert/strict";
import test from "node:test";

import { cmsGroupRegistry, cmsTargets } from "./cms-groups.js";

const warnings = [];
const deps = {
  warn: (message) => warnings.push(message),
  data: {
    QuestMaster: {
      616001: { questId: 616001, questName: "シミュレーター 提灯型" },
      1272001: { questId: 1272001, questName: "熱狂の事務所ライブ" },
      1272002: { questId: 1272002, questName: "実戦式！体力テスト！" },
      999001: { questId: 999001, questName: "" },
    },
    CardMaster: { 102511: { resourceName: "andrew" } },
    SidekickMaster: { 102511: { resourceName: "andrew" } },
  },
};

const guide = (team_formations, extra = {}) => ({ url: "/guide/challenge_simulator/", title: "Challenge Simulator", team_formations, ...extra });

const andrew = (extra = {}) => ({
  url: "/charas/andrew/",
  title: "Andrew",
  characterId: 25,
  unreleased: false,
  h2: { title: '"The Riptide" Andrew' },
  s2: { title: '"The Riptide" Andrew' },
  heroes: [{ stockId: 10251 }, { stockId: 10252 }],
  sidekicks: [{ stockId: 10251 }, { stockId: 10252 }],
  ...extra,
});

test.beforeEach(() => {
  warnings.length = 0;
});

test("quest entry: id defaults to quest-<questId>, a string label is en, ja defaults to the QuestMaster name", () => {
  assert.deepEqual(cmsTargets(guide([{ quest: 616001, label: "Simulator - Lantern-type Kaibutsu (SSS)" }]), deps), [
    {
      id: "quest-616001",
      label: { en: "Simulator - Lantern-type Kaibutsu (SSS)", ja: "シミュレーター 提灯型" },
      url: "/guide/challenge_simulator/",
    },
  ]);
  assert.deepEqual(warnings, []);
});

test("quest entry without a label uses the QuestMaster name (ja)", () => {
  const [target] = cmsTargets(guide([{ quest: 1272001 }]), deps);
  assert.deepEqual(target.label, { ja: "熱狂の事務所ライブ" });
});

test("a label map keeps its languages (in en, ja, zh-Hans, zh-Hant order) and its own ja", () => {
  const [target] = cmsTargets(guide([{ quest: 616001, label: { "zh-Hant": "繁", ja: "日本語", en: "English" } }]), deps);
  assert.deepEqual(Object.entries(target.label), [["en", "English"], ["ja", "日本語"], ["zh-Hant", "繁"]]);
});

test("free-form target: id and label required, retired is kept, url is the declaring page", () => {
  const [target] = cmsTargets(guide([{ id: "rogue-2609", label: { en: "Unexplored: final boss" }, retired: true }], { url: "/events/2609Rogue/" }), deps);
  assert.deepEqual(target, { id: "rogue-2609", label: { en: "Unexplored: final boss" }, url: "/events/2609Rogue/", retired: true });
});

test("an explicit id wins over the quest default; retired: false is not emitted", () => {
  const [target] = cmsTargets(guide([{ id: "sim-lantern", quest: 616001, label: "L", retired: false }]), deps);
  assert.equal(target.id, "sim-lantern");
  assert.equal("retired" in target, false);
});

test("a quest that is not in QuestMaster only warns, and then the label is required", () => {
  const [target] = cmsTargets(guide([{ quest: 5, label: "Gone quest" }]), deps);
  assert.deepEqual(target.label, { en: "Gone quest" });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /quest 5 is not in _data\/QuestMaster\.json/);
  assert.throws(() => cmsTargets(guide([{ quest: 5 }]), deps), /has no label/);
});

test("targets keep the declaration order; pages without team_formations have none", () => {
  const targets = cmsTargets(guide([{ quest: 1272002, label: "B" }, { quest: 1272001, label: "A" }]), deps);
  assert.deepEqual(targets.map((t) => t.id), ["quest-1272002", "quest-1272001"]);
  for (const value of [undefined, null, []]) assert.deepEqual(cmsTargets(guide(value), deps), []);
});

test("build failure: neither quest nor id", () => {
  assert.throws(() => cmsTargets(guide([{ label: "x" }]), deps), /needs a "quest"/);
});

test("build failure: quest is not an integer", () => {
  for (const quest of ["616001", 616001.5, null, true]) {
    assert.throws(() => cmsTargets(guide([{ quest, label: "x" }]), deps), /quest must be an integer/, String(quest));
  }
});

test("build failure: malformed id", () => {
  for (const id of ["Quest-1", "-x", "a b", "a_b", "", 5, "x".repeat(65)]) {
    assert.throws(() => cmsTargets(guide([{ id, label: "x" }]), deps), /\.id must match/, String(id));
  }
  assert.doesNotThrow(() => cmsTargets(guide([{ id: "x".repeat(64), label: "x" }]), deps));
});

test("build failure: no label at all", () => {
  assert.throws(() => cmsTargets(guide([{ id: "rogue-2609" }]), deps), /has no label/);
  assert.throws(() => cmsTargets(guide([{ quest: 999001 }]), deps), /has no label/); // QuestMaster name is empty
  assert.throws(() => cmsTargets(guide([{ id: "x1", label: {} }]), deps), /has no label/);
});

test("build failure: bad label values", () => {
  for (const label of ["", "  ", 5, ["x"], true]) {
    assert.throws(() => cmsTargets(guide([{ id: "x1", label }]), deps), /label must be a non-empty string or a map/, JSON.stringify(label));
  }
  assert.throws(() => cmsTargets(guide([{ id: "x1", label: { fr: "non" } }]), deps), /label\.fr: unknown language/);
  assert.throws(() => cmsTargets(guide([{ id: "x1", label: { en: "" } }]), deps), /label\.en must be a non-empty string/);
});

test("build failure: the removed support key", () => {
  for (const support of [true, false, "optional", undefined]) {
    assert.throws(() => cmsTargets(guide([{ quest: 616001, label: "x", support }]), deps), /support was removed/, String(support));
  }
});

test("build failure: retired is not a boolean", () => {
  assert.throws(() => cmsTargets(guide([{ id: "x1", label: "x", retired: "yes" }]), deps), /retired must be true or false/);
});

test("build failure: team_formations is not a list (including true), entries are not mappings", () => {
  for (const value of [true, false, "yes", 616001, { quest: 616001 }]) {
    assert.throws(() => cmsTargets(guide(value), deps), /team_formations must be a list/, String(value));
  }
  assert.throws(() => cmsTargets(guide([616001]), deps), /must be a mapping/);
});

test("build failure: duplicate id within one page", () => {
  assert.throws(() => cmsTargets(guide([{ quest: 616001, label: "a" }, { id: "quest-616001", label: "b" }]), deps), /target quest-616001 is declared twice/);
});

test("build failure: team_formations on a chara page", () => {
  assert.throws(() => cmsTargets(andrew({ team_formations: [{ id: "x1", label: "x" }] }), deps), /not allowed on a chara page/);
  assert.deepEqual(cmsTargets(andrew(), deps), []);
});

test("registry: the single `all` group with support optional and the targets of every page in order", () => {
  const registry = cmsGroupRegistry(
    [
      guide([{ quest: 616001, label: "Lantern" }, { quest: 617001, label: { en: "Slime", "zh-Hans": "史莱姆" } }]),
      { url: "/faq/" },
      { url: "/events/2609Rogue/", team_formations: [{ id: "rogue-2609", label: "Boss", retired: true }] },
    ],
    deps,
  );
  const { all } = registry.groups;
  assert.equal(all.title, "Team Creator");
  assert.equal(all.url, "/team-creator.html");
  assert.equal(all.options.support, "optional");
  assert.deepEqual(all.options.targets, [
    { id: "quest-616001", label: { en: "Lantern", ja: "シミュレーター 提灯型" }, url: "/guide/challenge_simulator/" },
    { id: "quest-617001", label: { en: "Slime", "zh-Hans": "史莱姆" }, url: "/guide/challenge_simulator/" },
    { id: "rogue-2609", label: { en: "Boss" }, url: "/events/2609Rogue/", retired: true },
  ]);
});

test("registry: the same target id on two pages fails the build, naming both", () => {
  const other = guide([{ quest: 616001, label: "again" }], { url: "/events/other/" });
  assert.throws(
    () => cmsGroupRegistry([guide([{ quest: 616001, label: "x" }]), other], deps),
    /duplicate target quest-616001: declared by \/guide\/challenge_simulator\/ and \/events\/other\//,
  );
});

test("registry: a page error propagates", () => {
  assert.throws(() => cmsGroupRegistry([guide([{ quest: 616001, label: "x", support: false }])], deps), /support was removed/);
});
