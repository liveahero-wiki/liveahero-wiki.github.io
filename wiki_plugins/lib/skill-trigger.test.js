import assert from "node:assert/strict";
import test from "node:test";

import { skillTrigger, statusDescriptionUnknown } from "./skill-trigger.js";

const statusDescription = (id) => `<S${id}>`;
const status = { statusDescription, statusDescriptionUnknown: (id, type) => statusDescriptionUnknown(id, type, statusDescription) };
const trigger = (triggers, timing = 2) => skillTrigger(triggers, timing, status);

// expected strings come from the Jekyll build of the live site
test("simple conditions", () => {
  assert.equal(trigger([{ class: "NotPinchExecTrigger", value: 50 }], 1), "(triggered when HP&gt;=50<!--50-->%)");
  assert.equal(trigger([{ class: "PinchExecTrigger", value: 50 }], 1), "(triggered when HP&lt;50<!--50-->%)");
  assert.equal(trigger([{ class: "TargetElementExecTrigger", element: 2 }]), "(extra_cond: target is Water)");
  assert.equal(trigger([{ class: "TargetElementDontExecTrigger", element: 5 }]), "(extra_cond: target is not Shadow)");
  assert.equal(trigger([{ class: "KillExecTrigger" }]), "(extra_cond: target enemy is killed)");
  assert.equal(trigger([{ class: "BeforeSkillTriggerWithoutInvoker" }]), "(extra_cond: target has not acted yet in current turn)");
});

test("min/max conditions are merged into one range", () => {
  assert.equal(trigger([{ class: "MinComboTrigger", value: 3 }]), "(extra_cond: Combo &gt;= 3)");
  assert.equal(trigger([{ class: "MaxComboTrigger", value: 5 }]), "(extra_cond: Combo &lt;= 5)");
  assert.equal(trigger([{ class: "MinComboTrigger", value: 3 }, { class: "MaxComboTrigger", value: 3 }]), "(extra_cond: Combo = 3)");
  // "$lt;=" is a typo in the original output that is kept on purpose
  assert.equal(trigger([{ class: "MinComboTrigger", value: 2 }, { class: "MaxComboTrigger", value: 5 }]), "(extra_cond: 2 &lt;= Combo $lt;= 5)");
});

test("status counts use the status chip, or the generic wording for status id 0", () => {
  assert.equal(
    trigger([{ class: "OwnBuffNumberExecTrigger", statusId: 0, value: 2 }]),
    "(extra_cond: possessing x &gt; 2 buffs(s))",
  );
  assert.equal(
    trigger([{ class: "OwnBuffNumberDontExecTrigger", statusId: 0, value: 0 }]),
    "(extra_cond: possessing no buffs(s))",
  );
  assert.equal(trigger([{ class: "OwnStatusTrigger", value: 19 }]), "(extra_cond: possessing <S19>)");
  assert.equal(
    trigger([{ class: "EnemyBuffNumberExecTrigger", statusId: 7, value: 1 }]),
    "(extra_cond: target enemy possessing x &gt; 1 <S7>)",
  );
});

test("several conditions are joined with 'and'; unknown classes are reported", () => {
  assert.equal(
    trigger([{ class: "KillExecTrigger" }, { class: "Nope" }], 1),
    "(triggered when target enemy is killed and unknown condition (Nope)",
  );
});

test("no triggers, no text", () => {
  assert.equal(trigger([]), "");
  assert.equal(trigger(null), "");
});
