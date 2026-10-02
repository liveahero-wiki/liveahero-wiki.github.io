// Liquid filters and tags that used to be the Ruby plugins in _plugins/ (chara, item, catalog,
// image, skill). The logic lives in ../lib; this file only connects it to LiquidJS: it supplies
// `site.data`, and for the skill filters the current Liquid context, because status descriptions
// are Liquid templates themselves and are rendered with `skillEffectJson` / `effects` in scope.

import { processCharaGroup, processVoiceActor } from "../lib/catalog.js";
import { charaLink, charaPageToIcon, charaPageToLink, stockIdToLinkImpl } from "../lib/chara.js";
import { imageDimension } from "../lib/image.js";
import { OrderedIntHash } from "../lib/int-key-map.js";
import { lahItem, lahItemIcon } from "../lib/item.js";
import { xmlEscape } from "../lib/ruby.js";
import * as skill from "../lib/skill.js";
import { skillTrigger, statusDescriptionUnknown } from "../lib/skill-trigger.js";

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {{ site: { data: any }, charaIndex: import("../lib/chara.js").CharaIndex }} deps
 */
export function registerRubyPlugins(eleventyConfig, { site, charaIndex }) {
  const filter = (name, fn) => eleventyConfig.addLiquidFilter(name, fn);

  // `site.data` is reloaded for every build, so always read it through the site object.
  const charaDeps = {
    index: charaIndex,
    get data() {
      return site.data;
    },
  };

  // ---- Jekyll's xml_escape leaves ' alone --------------------------------------------------
  filter("xml_escape", xmlEscape);

  // ---- chara.rb ----------------------------------------------------------------------------
  eleventyConfig.addLiquidTag("chara_link", () => ({
    parse(tagToken) {
      this.input = tagToken.args;
    },
    render() {
      return charaLink(this.input, charaDeps);
    },
  }));
  filter("stockIdToLink", (stockId, type) => stockIdToLinkImpl(Number(stockId), type, charaDeps)[1]);
  filter("stockIdToCharaTitle", (stockId, type) => stockIdToLinkImpl(Number(stockId), type, charaDeps)[0]);
  filter("characterIdToPage", (id) => charaIndex.characterIdToPage.get(Number(id)));
  filter("charaPageToIcon", (page) => charaPageToIcon(page, charaDeps));
  filter("charaPageToLink", (page) => charaPageToLink(page, charaDeps));

  // ---- item.rb, catalog.rb, image.rb -----------------------------------------------------------
  filter("lah_item", (id, rewardType, name) => lahItem(id, rewardType, name, site.data));
  filter("lah_item_icon", (id, rewardType, name) => lahItemIcon(id, rewardType, name, site.data));
  filter("processVoiceActor", processVoiceActor);
  filter("processCharaGroup", processCharaGroup);
  filter("image_dimension", imageDimension);

  // ---- skill.rb ------------------------------------------------------------------------------
  const statusData = () => ({
    statusMaster: site.data.StatusMaster,
    statusWiki: site.data.translation.Status,
    skillEffectWiki: site.data.translation.SkillEffect,
  });

  // Status descriptions are Liquid templates: parse once, render in the caller's context with extra variables.
  const parsed = new Map();
  function renderInContext(self, template, vars) {
    const text = template === null || template === undefined ? "" : String(template);
    let tpl = parsed.get(text);
    if (!tpl) {
      tpl = self.liquid.parse(text);
      parsed.set(text, tpl);
    }
    self.context.push(vars);
    try {
      return self.liquid.renderSync(tpl, self.context);
    } finally {
      self.context.pop();
    }
  }

  /** `status_description(id)` as called from inside a template: skillEffectJson comes from the context. */
  function describeStatus(self, id, skillEffectJson) {
    const json = skillEffectJson ?? self.context.get(["skillEffectJson"]);
    return skill.statusDescription(id, json, statusData(), (t, v) => renderInContext(self, t, v));
  }

  filter("render_liquid", function (content) {
    return renderInContext(this, content, {});
  });
  filter("status_description", function (id, skillEffectJson) {
    return describeStatus(this, id, skillEffectJson);
  });
  filter("status_description_v2", function (skillEffectId, skillEffectJson) {
    return skill.statusDescriptionV2(skillEffectId, skillEffectJson, statusData(), (t, v) =>
      renderInContext(this, t, v),
    );
  });
  filter("status_manual", skill.statusManual);

  function triggerHelpers(self) {
    const statusDescription = (id) => describeStatus(self, id);
    return {
      statusDescription,
      statusDescriptionUnknown: (id, type) => statusDescriptionUnknown(id, type, statusDescription),
    };
  }
  filter("skill_trigger", function (triggers, timing) {
    return skillTrigger(triggers, timing, triggerHelpers(this));
  });
  filter("skill_trigger_json", function (triggerJson, timing) {
    if (!triggerJson) return "";
    return skillTrigger(JSON.parse(triggerJson), timing, triggerHelpers(this));
  });

  filter("render_skill_description", skill.renderSkillDescription);
  filter(
    "collect_change_skills",
    (providers) =>
      new OrderedIntHash(
        skill.collectChangeSkills(providers, {
          skillMaster: site.data.SkillMaster,
          skillEffectMaster: site.data.SkillEffectMaster,
        }),
      ),
  );
  filter("should_skip_skill_effect", skill.shouldSkipSkillEffect);
  filter("skill_target", skill.skillTarget);
  filter("element_enum", skill.elementEnum);
  filter("sanitizeSkillDescription", skill.sanitizeSkillDescription);
  filter("hasAutoActionMarker", skill.hasAutoActionMarker);
  filter("sanitizePlayerName", skill.sanitizePlayerName);
  filter("sanitizeSalesCharaName", skill.sanitizeSalesCharaName);
  filter("convertLang", skill.convertLang);
}
