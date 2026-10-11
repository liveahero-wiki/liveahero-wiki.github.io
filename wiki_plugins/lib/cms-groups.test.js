// The submission groups of event and chara pages (cms-groups.js) and the registry built from them.
import assert from "node:assert/strict";
import test from "node:test";

import { cmsGroupRegistry, cmsGroups } from "./cms-groups.js";

const deps = {
  data: {
    QuestMaster: {
      1272001: { questId: 1272001, questName: "熱狂の事務所ライブ" },
      1272002: { questId: 1272002, questName: "実戦式！体力テスト！" },
    },
    CardMaster: { 102511: { resourceName: "andrew" } },
    SidekickMaster: { 102511: { resourceName: "andrew" } },
  },
};

const event = (team_formations, extra = {}) => ({
  url: "/events/2607HighDifficultRevival/",
  title: "Worthy Foe",
  eventId: 174,
  team_formations,
  ...extra,
});

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

test("event: one group per declared quest, in declaration order", () => {
  const groups = cmsGroups(event([{ quest: 1272001 }, { quest: 1272002, label: "Stamina Test", support: false }]), deps);
  assert.deepEqual(groups, [
    {
      groupId: "quest-1272001",
      title: "Worthy Foe › 熱狂の事務所ライブ",
      url: "/events/2607HighDifficultRevival/#team-quest-1272001",
      anchor: "team-quest-1272001",
      label: "熱狂の事務所ライブ",
      options: { support: true },
    },
    {
      groupId: "quest-1272002",
      title: "Worthy Foe › Stamina Test",
      url: "/events/2607HighDifficultRevival/#team-quest-1272002",
      anchor: "team-quest-1272002",
      label: "Stamina Test",
      options: { support: false },
    },
  ]);
});

test("event: jp_title is the title of an event without an English one", () => {
  const [group] = cmsGroups(event([{ quest: 1272001, label: "SS" }], { title: undefined, jp_title: "強敵" }), deps);
  assert.equal(group.title, "強敵 › SS");
});

test("event without team_formations has no groups", () => {
  assert.deepEqual(cmsGroups(event(undefined), deps), []);
  assert.deepEqual(cmsGroups(event(null), deps), []);
  assert.deepEqual(cmsGroups(event([]), deps), []);
});

test("chara: one hero and one sidekick group per card, titled like the tabs", () => {
  const groups = cmsGroups(andrew(), deps);
  assert.deepEqual(
    groups.map((g) => [g.groupId, g.anchor, g.url, g.title, g.label]),
    [
      ["hero-10251", "team-hero-10251", "/charas/andrew/#team-hero-10251", "Andrew – Hero", "Hero"],
      ["hero-10252", "team-hero-10252", "/charas/andrew/#team-hero-10252", 'Andrew – "The Riptide" Andrew', '"The Riptide" Andrew'],
      ["sidekick-10251", "team-sidekick-10251", "/charas/andrew/#team-sidekick-10251", "Andrew – Sidekick", "Sidekick"],
      [
        "sidekick-10252",
        "team-sidekick-10252",
        "/charas/andrew/#team-sidekick-10252",
        'Andrew – "The Riptide" Andrew (Sidekick)',
        '"The Riptide" Andrew (Sidekick)',
      ],
    ],
  );
  assert.deepEqual(groups[0].options, { support: true, focus: { kind: "hero", stockId: 10251 } });
  assert.deepEqual(groups[2].options, { support: true, focus: { kind: "sidekick", stockId: 10251 } });
});

test("chara: unreleased pages have no groups", () => {
  assert.deepEqual(cmsGroups(andrew({ unreleased: true }), deps), []);
  assert.deepEqual(cmsGroups(andrew({ unreleased: true, heroes: undefined, sidekicks: undefined }), deps), []);
});

test("chara: a card can opt out, true is the default spelled out", () => {
  const groups = cmsGroups(
    andrew({ heroes: [{ stockId: 10251, team_formations: true }, { stockId: 10252, team_formations: false }], sidekicks: [{ stockId: 10251, team_formations: false }] }),
    deps,
  );
  assert.deepEqual(groups.map((g) => g.groupId), ["hero-10251"]);
});

test("chara without sidekicks only has hero groups", () => {
  const groups = cmsGroups(andrew({ sidekicks: undefined }), deps);
  assert.deepEqual(groups.map((g) => g.groupId), ["hero-10251", "hero-10252"]);
});

test("build failure: a quest that is not in QuestMaster", () => {
  assert.throws(() => cmsGroups(event([{ quest: 999 }]), deps), /quest 999 is not in _data\/QuestMaster\.json/);
});

test("build failure: quest is not an integer", () => {
  for (const quest of ["1272001", 1272001.5, undefined, null, true]) {
    assert.throws(() => cmsGroups(event([{ quest }]), deps), /quest must be an integer/, String(quest));
  }
  assert.throws(() => cmsGroups(event([1272001]), deps), /must be a mapping/);
});

test("build failure: support present but not a boolean", () => {
  for (const support of ["false", 0, 1, null, []]) {
    assert.throws(() => cmsGroups(event([{ quest: 1272001, support }]), deps), /support must be true or false/, String(support));
  }
});

test("build failure: team_formations on an event is not a list (including true)", () => {
  for (const value of [true, false, "yes", 1272001, { quest: 1272001 }]) {
    assert.throws(() => cmsGroups(event(value), deps), /team_formations must be a list/, String(value));
  }
});

test("build failure: non-boolean team_formations on a card", () => {
  for (const value of ["no", 0, null, []]) {
    assert.throws(
      () => cmsGroups(andrew({ heroes: [{ stockId: 10251, team_formations: value }] }), deps),
      /heroes\[0\]\.team_formations must be true or false/,
      String(value),
    );
  }
  assert.throws(
    () => cmsGroups(andrew({ sidekicks: [{ stockId: 10251, team_formations: "off" }] }), deps),
    /sidekicks\[0\]\.team_formations must be true or false/,
  );
});

test("build failure: duplicate quest within one page", () => {
  assert.throws(() => cmsGroups(event([{ quest: 1272001 }, { quest: 1272001, label: "again" }]), deps), /group quest-1272001 is declared twice/);
});

test("build failure: a label that is not text, a page-level flag on a chara page, a card without stockId", () => {
  assert.throws(() => cmsGroups(event([{ quest: 1272001, label: 5 }]), deps), /label must be a non-empty string/);
  assert.throws(() => cmsGroups(andrew({ team_formations: false }), deps), /not allowed on a chara page/);
  assert.throws(() => cmsGroups(andrew({ heroes: [{ BIO_H01: "x" }] }), deps), /stockId must be an integer/);
});

test("registry: shape of /api/cms-groups.json", () => {
  const registry = cmsGroupRegistry([event([{ quest: 1272001, support: false }]), andrew({ sidekicks: undefined, heroes: [{ stockId: 10251 }] }), { url: "/faq/" }], deps);
  assert.deepEqual(registry, {
    groups: {
      "quest-1272001": {
        title: "Worthy Foe › 熱狂の事務所ライブ",
        url: "/events/2607HighDifficultRevival/#team-quest-1272001",
        options: { support: false },
      },
      "hero-10251": {
        title: "Andrew – Hero",
        url: "/charas/andrew/#team-hero-10251",
        options: { support: true, focus: { kind: "hero", stockId: 10251 } },
      },
    },
  });
});

test("registry: a group id declared by two pages fails the build, naming both", () => {
  const other = event([{ quest: 1272001 }], { url: "/events/other/" });
  assert.throws(
    () => cmsGroupRegistry([event([{ quest: 1272001 }]), other], deps),
    /duplicate submission group quest-1272001: declared by \/events\/2607HighDifficultRevival\/ and \/events\/other\//,
  );
  assert.throws(() => cmsGroupRegistry([andrew(), andrew({ url: "/charas/andrew-copy/" })], deps), /duplicate submission group hero-10251/);
});
