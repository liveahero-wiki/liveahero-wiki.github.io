import assert from "node:assert/strict";
import test from "node:test";

import { statusDescriptionV2 } from "./skill.js";

const render = (t) => t;
const data = {
  statusMaster: {
    1: { statusName: "ATKアップ", description: "ATK up.", isGoodStatus: 1 },
    // like 1015201: a system status with neither name nor description
    2: { statusName: "", description: "", isGoodStatus: 2 },
    // like 1015203: a named system status
    3: { statusName: "解放", description: "Liberation.", isGoodStatus: 2 },
  },
  statusWiki: {},
  skillEffectWiki: {},
};
const describe = (json, id = 1) => statusDescriptionV2(id, { filename: "", ...json }, data, render);

test("flagged override name and description are used", () => {
  const [name, , html] = describe({
    statusId: 1,
    overrideStatusName: "ATKアップ+",
    isOverrideStatusName: true,
    overrideStatusDescription: "x1.8",
    isOverrideStatusDescription: true,
  });
  assert.equal(name, "ATKアップ+");
  assert.match(html, /x1\.8/);
});

test("an unflagged placeholder override on a nameless status is hidden", () => {
  // Polaris Mask SE 3098
  assert.equal(
    describe({
      statusId: 2,
      overrideStatusName: "限定ポラリスパッシブスキル用",
      overrideStatusDescription: "限定ポラリスパッシブスキル用",
    }),
    null,
  );
});

test("an unflagged override on a named status falls back to the status master", () => {
  const [name, , html] = describe(
    { statusId: 3, overrideStatusName: "システム効果1015203番", overrideStatusDescription: "システム効果1015203番付与" },
    3,
  );
  assert.equal(name, "解放");
  assert.match(html, /Liberation\./);
  assert.doesNotMatch(html, /システム効果/);
});
