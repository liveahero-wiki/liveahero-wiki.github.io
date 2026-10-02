// Port of LahWiki::Skills#skill_trigger (_plugins/skill.rb): turns the trigger conditions of a
// skill effect into the "(triggered when …)" / "(extra_cond: …)" text.
//
// The output is reproduced exactly, including the oddities of the Ruby original ("$lt;=" typos,
// the stray "}" after "self is not attacking now", the "MaxnHPTrigger" class name), so that any
// difference from the old site stays attributable to the port. Fix them in a separate change.

import { str, toI } from "./ruby.js";

export const INVALID = 999;

export const ELEMENT_NAMES = { 1: "Fire", 2: "Water", 3: "Earth", 4: "Light", 5: "Shadow" };
const ROLE_NAMES = { 1: "Attack", 2: "Defense", 3: "Assistance", 4: "Debuff", 5: "Speed", 6: "VP Gain", 7: "Heal", 99: "Special" };

const value = (c) => str(c.value);

/** Conditions that map to one fixed fragment. */
const SIMPLE = {
  ViewTrigger: (c) => `View&gt;${value(c)}`,
  ViewDontExecTrigger: (c) => `View&lt;=${value(c)}`,
  EnemyTeamCountTrigger: (c) => `Enemy count=${value(c)}`,
  OwnTeamCountTrigger: (c) => `Ally count=${value(c)}`,
  NotPinchExecTrigger: (c) => `HP&gt;=50<!--${value(c)}-->%`,
  PinchExecTrigger: (c) => `HP&lt;50<!--${value(c)}-->%`,
  ExistPinchTeamCharacterTrigger: (c) => `One ally's HP&lt;50<!--${value(c)}-->%`,
  KillExecTrigger: () => "target enemy is killed",
  ReceiverPinchExecTrigger: () => "skill receiver's HP&lt;50",
  ReceiverNotPinchExecTrigger: () => "skill receiver's HP&gt;50",
  InvokerAliveTrigger: () => "when invoker is alive",
  ReceiverTemporaryAliveTrigger: () => "skill receiver is still alive",
  AboveSpdValueTrigger: (c) => `SPD&gt;${value(c)}`,
  TargetElementExecTrigger: (c) => `target is ${ELEMENT_NAMES[c.element] ?? "Unknown"}`,
  TargetElementDontExecTrigger: (c) => `target is not ${ELEMENT_NAMES[c.element] ?? "Unknown"}`,
  BeforeSkillTrigger: () => "target has not acted before invoker in current turn",
  AfterSkillTrigger: () => "target has acted before invoker in current turn",
  BeforeSkillTriggerWithoutInvoker: () => "target has not acted yet in current turn",
  // Might be wrong (comment in the original)
  TurnTrigger: (c) => `turn&gt;=${value(c)}`,
  TurnDontExecTrigger: (c) => `turn&lt;=${value(c)}`,
  TargetIsOwnTrigger: () => "is targeting self",
  TargetNotOwnTrigger: () => "is not targeting self",
  NowAttackingTrigger: () => "current action is not activated by another skill",
  ReceiverSelectRoleTrigger: (c) => `target's role is ${str(ROLE_NAMES[c.role])}`,
  NotNowAttackingTrigger: () => "self is not attacking now}",
};

/** Conditions that need a status icon: [wording, buff type]. Not sure these 4 are correct (original). */
const WITH_STATUS = {
  OverTargetSpecialEffectTurnTrigger: "target has at least",
  RemainTargetSpecialEffectTurnTrigger: "target has at most",
  OverInvokerSpecialEffectTurnTrigger: "self has at least",
  RemainInvokerSpecialEffectTurnTrigger: "self has at most",
};

/** Min/max conditions that are merged into one range: class -> [key, "min" | "max"]. */
const RANGES = {
  MinComboTrigger: () => ["Combo", "min"],
  MaxComboTrigger: () => ["Combo", "max"],
  MinHPTrigger: () => ["HP", "min"],
  MaxnHPTrigger: () => ["HP", "max"],
};
const STATUS_KINDS = { DeBuff: 0, Buff: 1, SystemStatus: 2 };
for (const [kind, type] of Object.entries(STATUS_KINDS)) {
  const add = (prefix, what, keyPrefix) => {
    RANGES[`${prefix}${kind}${what}ExecTrigger`] = (c) => [`${keyPrefix}_${c.statusId}_${type}`, "min"];
    RANGES[`${prefix}${kind}${what}DontExecTrigger`] = (c) => [`${keyPrefix}_${c.statusId}_${type}`, "max"];
  };
  add("Own", "Turn", "statusTurn");
  add("Own", "Number", "status");
  add("Enemy", "Number", "statusEnemy");
  add("EnemyAll", "Number", "statusAllEnemy");
}

/**
 * @param {Array<Record<string, any>> | null | undefined} triggers
 * @param {number | string | undefined} timing 1 = "(triggered when …)", anything else "(extra_cond: …)"
 * @param {{ statusDescription: (id: any) => string, statusDescriptionUnknown: (id: any, type: number) => string }} status
 */
export function skillTrigger(triggers, timing, status) {
  if (!triggers || triggers.length === 0) return "";

  const fragments = [];
  const ranges = new Map(); // insertion ordered, like Ruby's Hash

  for (const c of triggers) {
    const simple = SIMPLE[c.class];
    if (simple) {
      fragments.push(simple(c));
    } else if (c.class === "OwnStatusTrigger") {
      fragments.push(`possessing ${status.statusDescription(c.value)}`);
    } else if (WITH_STATUS[c.class]) {
      fragments.push(`${WITH_STATUS[c.class]} ${str(c.value)}x ${status.statusDescriptionUnknown(c.statusId, 1)}`);
    } else if (RANGES[c.class]) {
      const [key, side] = RANGES[c.class](c);
      if (!ranges.has(key)) ranges.set(key, {});
      ranges.get(key)[side] = c.value;
    } else {
      fragments.push(`unknown condition (${str(c.class)}`);
    }
  }

  for (const [key, sides] of ranges) {
    const min = "min" in sides ? toI(sides.min) : INVALID;
    const max = "max" in sides ? toI(sides.max) : INVALID;

    if (key.startsWith("status")) {
      let range;
      if (min === INVALID) range = max === 0 ? "no" : `x &lt;= ${max}`;
      else if (max === INVALID) range = `x &gt; ${min}`;
      else if (min + 1 === max) range = `x = ${max}`;
      else range = `${min} &lt; x $lt;= ${max}`;

      const [, statusId, statusType] = key.split("_");
      const icon = status.statusDescriptionUnknown(toI(statusId), toI(statusType));
      if (key.startsWith("statusEnemy")) fragments.push(`target enemy possessing ${range} ${icon}`);
      else if (key.startsWith("statusAllEnemy")) fragments.push(`for target enemy(s) possessing ${range} ${icon}`);
      else if (key.startsWith("statusTurn")) fragments.push(`total status turn ${range} ${icon}`);
      else fragments.push(`possessing ${range} ${icon}`);
    } else if (min === INVALID) {
      fragments.push(`${key} &lt;= ${max}`);
    } else if (max === INVALID) {
      fragments.push(`${key} &gt;= ${min}`);
    } else if (min === max) {
      fragments.push(`${key} = ${max}`);
    } else {
      fragments.push(`${min} &lt;= ${key} $lt;= ${max}`);
    }
  }

  return timing === 1
    ? `(triggered when ${fragments.join(" and ")})`
    : `(extra_cond: ${fragments.join(" and ")})`;
}

/** `status_description_unknown`: id 0 means "any buff/debuff/system status". */
export function statusDescriptionUnknown(id, type, statusDescription) {
  if (id === 0) {
    if (type === 0) return "debuff(s)";
    if (type === 1) return "buffs(s)";
    if (type === 2) return "system status(es)";
  }
  return statusDescription(id);
}
