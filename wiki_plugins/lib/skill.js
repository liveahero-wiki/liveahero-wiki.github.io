// Port of the Liquid-independent parts of LahWiki::Skills (_plugins/skill.rb): status labels,
// skill descriptions with embedded statuses, small enum/sanitizer helpers.
//
// Anything that must render Liquid text (status descriptions that contain `{{ … }}`) takes a
// `render(template, vars)` callback, so this file does not depend on LiquidJS.

import { dig, str, xmlEscape } from "./ruby.js";
import { ELEMENT_NAMES } from "./skill-trigger.js";

const STATUS_TYPE = { 0: "Debuff", 1: "Buff", 2: "Other", 3: "Field" };
const STACKABLE = { false: "Unstackable", true: "Stackable" };
const DOT_DAMAGE = { false: "", true: "/Damage over time" };
const CHARGEABLE = { false: "", true: "/Charge" };
const FIELD = { false: "", true: "/Field" };
const COUNT = { false: "", true: "/Count" };

/** `@@map[flag]` in Ruby: true/false hit the table, nil/absent gives "". */
const byFlag = (map, flag) => (flag === true || flag === false ? map[flag] : "");

const TARGETS = {
  0: "self",
  1: "target ally",
  2: "target enemy",
  3: "all allies",
  4: "all enemies",
  5: "event bonus unit",
  6: "random ally",
  7: "random enemy",
  9: "random ally",
  11: "ally with lowest HP",
  12: "each ally",
  13: "ally with highest ATK",
  14: "all allies except self",
  16: "all enemies except target",
};

const LANGUAGES = { en: "EN", jp: "日文", hans: "简中", hant: "繁中" };

export const elementEnum = (n) => ELEMENT_NAMES[n] ?? "Unknown";
export const skillTarget = (t) => TARGETS[t] ?? `Unknown target ${str(t)}`;
export const convertLang = (lang) => LANGUAGES[lang] ?? lang;

export function shouldSkipSkillEffect(skillEffectJson) {
  return (
    skillEffectJson.effects[0].class === "NoneEffect" && [74, 136, 137].includes(skillEffectJson.statusId)
  );
}

export function sanitizeSkillDescription(s) {
  if (s === null || s === undefined) return s;
  return String(s).replace(/<style="(.*?)">/g, "").replaceAll("</style>", "");
}

export const hasAutoActionMarker = (s) => str(s).includes('<style="オート行動"></style>');

export function sanitizePlayerName(s) {
  if (s === null || s === undefined) return s;
  return String(s).replace(
    /<@playerName>/g,
    '<wiki-editable-name storage-key="wiki_player_name">Player</wiki-editable-name>',
  );
}

export function sanitizeSalesCharaName(s) {
  if (s === null || s === undefined) return s;
  return String(s).replace(
    /\{(\d+)\}/g,
    '<wiki-editable-name storage-key="wiki_chara$1_name">Chara $1</wiki-editable-name>',
  );
}

/** `status_manual`: a status chip written by hand in SkillManualOverride.yml. */
export function statusManual(wikiIcon, name, description) {
  if (description !== null && description !== undefined && String(description).length > 0) {
    return (
      `<span class="status tippy" data-content="${xmlEscape(description)}">` +
      `<img src="/cdn/Sprite/${wikiIcon}.png" loading="lazy"> ${name}</span>`
    );
  }
  return `<span class="status"><img src="/cdn/Sprite/${wikiIcon}.png" loading="lazy"> ${name}</span>`;
}

/** `{ "ClassName" => effect }`, the `effects` variable available to status descriptions. */
export function effectsByClass(skillEffectJson) {
  const effects = {};
  for (const effect of skillEffectJson.effects) effects[effect.class] = effect;
  return effects;
}

/**
 * `status_description`: the status chip with a tooltip. If `skillEffectJson` is given, the
 * description is rendered as Liquid with `skillEffectJson` and `effects` in scope.
 * @param {{ statusMaster: object, statusWiki: object }} data
 * @param {(template: string, vars: object) => string} render
 */
export function statusDescription(id, skillEffectJson, data, render) {
  const idS = str(id);
  const status = data.statusMaster[idS];
  if (!status) return `unknown status ${str(id)}`;

  let wikiIcon = dig(data.statusWiki, idS, "icon");
  if (!wikiIcon || wikiIcon === "") wikiIcon = "b_skill_special";

  let name = dig(data.statusWiki, idS, "name") ?? status.statusName;
  let description = dig(data.statusWiki, idS, "description") ?? status.description;

  if (skillEffectJson !== null && skillEffectJson !== undefined) {
    description = render(description, { skillEffectJson, effects: effectsByClass(skillEffectJson) });
  }
  description = xmlEscape(description);

  if (status.statusType === 2 && name === "") {
    name = `system status ${str(id)}`;
    wikiIcon = "ui_button_square_02";
  }

  return (
    `<span class="status tippy" data-id="${idS}" data-content="${description}">` +
    `<img src="/cdn/Sprite/${wikiIcon}.png" loading="lazy"> ${name}</span>`
  );
}

/**
 * `status_description_v2`: [name, isGoodStatus, html] for a skill effect's status, a plain string
 * for an unknown status, or null if the effect has nothing to show.
 * @param {{ statusMaster: object, statusWiki: object, skillEffectWiki: object }} data
 */
export function statusDescriptionV2(skillEffectId, skillEffectJson, data, render) {
  const idS = str(skillEffectJson.statusId);
  const status = data.statusMaster[idS];
  if (!status) return `unknown status ${idS}`;

  // The game only honours the override strings when their flag is set; an unflagged string is a
  // developer placeholder (e.g. "…マーカー"), so the status falls back to StatusMaster (and is
  // hidden if that has no name).
  const overrideName = skillEffectJson.isOverrideStatusName ? skillEffectJson.overrideStatusName : "";
  const overrideDescription = skillEffectJson.isOverrideStatusDescription
    ? skillEffectJson.overrideStatusDescription
    : "";

  if (str(status.description).length === 0 && str(overrideDescription).length === 0) {
    return null;
  }

  const wikiIcon = skillEffectJson.filename;
  let iconS = "";
  if (wikiIcon && wikiIcon.length > 0) {
    iconS = `<img class="status-s" src="/cdn/Sprite/${wikiIcon}.png" loading="lazy"> `;
  }

  let name = dig(data.statusWiki, idS, "name") ?? status.statusName;
  let description = dig(data.statusWiki, idS, "description") ?? status.description;

  if (str(overrideName).length > 0) {
    name = dig(data.skillEffectWiki, skillEffectId, "overrideStatusName") ?? overrideName;
  }
  if (!name || name.length === 0) return null;

  if (str(overrideDescription).length > 0) {
    description = dig(data.skillEffectWiki, skillEffectId, "overrideStatusDescription") ?? overrideDescription;
  }

  if (str(description).includes("{{")) {
    description = render(description, { skillEffectJson, effects: effectsByClass(skillEffectJson) });
  }

  let statusType = STATUS_TYPE[status.isGoodStatus];
  const isFieldEffect = skillEffectJson.isFieldEffect;
  if (isFieldEffect) statusType = "Other";

  const label =
    `<b>${name} [${str(statusType)}/${byFlag(STACKABLE, skillEffectJson.canDuplicate)}` +
    `${byFlag(CHARGEABLE, skillEffectJson.isCharageEffect)}${byFlag(DOT_DAMAGE, skillEffectJson.isDotDamage)}` +
    `${byFlag(FIELD, isFieldEffect)}${byFlag(COUNT, skillEffectJson.isCountEffect)}]</b><br>`;

  description = xmlEscape(label + description);
  return [
    name,
    status.isGoodStatus,
    `<span class="status tippy" data-id="${idS}" data-se-id="${str(skillEffectId)}" data-content="${description}">${iconS}${name}</span>`,
  ];
}

const WIKI_STATUS = /<wiki-status>(.*?)<\/wiki-status>/g;

/** `render_skill_description`: replace <wiki-status>Name</wiki-status> by the status chip, then list them. */
export function renderSkillDescription(skillDescription, statusArray) {
  if (!statusArray || statusArray.length === 0) return skillDescription;

  const statusMap = new Map();
  for (const entry of statusArray) {
    // Ruby destructures `|name, type, html|`; a plain String entry ("unknown status …") is just a name.
    const [statusName, statusType, statusHtml] = Array.isArray(entry) ? entry : [entry];
    statusMap.set(statusName, [statusType, statusHtml]);
  }

  let output = str(skillDescription).replace(WIKI_STATUS, (match, name) => {
    const value = statusMap.get(name);
    return value ? str(value[1]) : match;
  });

  if (statusMap.size > 0) {
    output += "<hr>";
    output += [...statusMap.values()].map((v) => str(v[1])).join(", ");
  }
  return output;
}

/**
 * `collect_change_skills`: Map of 1-based skill slot => [skillId, …] for the skills a hero's active
 * skills can be changed into (ChangeActiveSkill effects), in the order they were found.
 */
export function collectChangeSkills(skillsFromSkillProvider, { skillMaster, skillEffectMaster }) {
  const changeSkillIds = new Map();
  const skillIds = (skillsFromSkillProvider ?? []).filter((s) => s.skillUpgrade === 0).map((s) => s.skillId);

  for (const skillId of skillIds) {
    const skill = skillMaster[str(skillId)];
    if (!skill) continue;
    for (const effect of skill.effects) {
      const skillEffect = skillEffectMaster[str(effect.skillEffectId)];
      for (const inner of skillEffect.skillEffectJson.effects) {
        if (inner.class === "ChangeActiveSkill") {
          const slot = inner.parameter.index + 1;
          if (!changeSkillIds.has(slot)) changeSkillIds.set(slot, []);
          changeSkillIds.get(slot).push(inner.parameter.skillId);
        }
      }
    }
  }
  return changeSkillIds;
}
