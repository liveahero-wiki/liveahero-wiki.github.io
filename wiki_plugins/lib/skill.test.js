import assert from "node:assert/strict";
import test from "node:test";

import { collectChangeSkills, elementEnum, statusDescription } from "./skill.js";

const data = {
  statusMaster: {
    1: { statusName: "ATKアップ", description: "ATK up by {{ x }}.", isGoodStatus: 1, statusType: 1 },
    // like 1015201: a system status with neither name nor description
    2: { statusName: "", description: "", isGoodStatus: 2, statusType: 2 },
  },
  statusWiki: { 1: { name: "ATK Up", icon: "status_atkup" } },
};

test("a status chip carries its icon, name and (rendered, escaped) description", () => {
  const html = statusDescription(1, { effects: [] }, data, (t) => t.replace("{{ x }}", "<1.5x>"));
  assert.equal(
    html,
    '<span class="status tippy" data-id="1" data-content="ATK up by &lt;1.5x&gt;."><img src="/cdn/Sprite/status_atkup.png" loading="lazy"> ATK Up</span>',
  );
});

test("an unknown status says so, and a nameless system status gets a placeholder name", () => {
  assert.equal(statusDescription(99, null, data, (t) => t), "unknown status 99");
  assert.match(statusDescription(2, null, data, (t) => t), /system status 2<\/span>$/);
});

test("change skills are bucketed by the 1-based slot they replace", () => {
  const skillMaster = { 10: { effects: [{ skillEffectId: 1 }, { skillEffectId: 2 }] }, 11: { effects: [{ skillEffectId: 2 }] } };
  const effect = (index, skillId) => ({ skillEffectJson: { effects: [{ class: "ChangeActiveSkill", parameter: { index, skillId } }] } });
  const skillEffectMaster = { 1: effect(0, 100), 2: effect(1, 200) };
  const providers = [
    { skillId: 10, skillUpgrade: 0 },
    { skillId: 11, skillUpgrade: 0 },
    { skillId: 12, skillUpgrade: 1 }, // a skill-tree skill: not collected
  ];
  assert.deepEqual([...collectChangeSkills(providers, { skillMaster, skillEffectMaster })], [
    [1, [100]],
    [2, [200, 200]],
  ]);
});

test("element names", () => {
  assert.equal(elementEnum(1), "Fire");
  assert.equal(elementEnum(9), "Unknown");
});
