// Port of the Liquid-independent parts of LahWiki::Skills (_plugins/skill.rb): the status chip used
// by the guide pages, the change-skill lookup, and small enum/sanitizer helpers. Skill names and
// descriptions are rendered by ./skill-text.js.
//
// Anything that must render Liquid text (status descriptions that contain `{{ … }}`) takes a
// `render(template, vars)` callback, so this file does not depend on LiquidJS.

import { dig, str, xmlEscape } from "./ruby.js";

const ELEMENT_NAMES = { 1: "Fire", 2: "Water", 3: "Earth", 4: "Light", 5: "Shadow" };
const LANGUAGES = { en: "EN", jp: "日文", hans: "简中", hant: "繁中" };

export const elementEnum = (n) => ELEMENT_NAMES[n] ?? "Unknown";
export const convertLang = (lang) => LANGUAGES[lang] ?? lang;

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
