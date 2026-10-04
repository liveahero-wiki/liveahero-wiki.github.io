// Liquid filters and tags that used to be the Ruby plugins in _plugins/ (chara, item, catalog,
// image, skill). The logic lives in ../lib; this file only connects it to LiquidJS: it supplies
// `site.data`, and for `status_description` the current Liquid context, because status descriptions
// are Liquid templates themselves and are rendered with `skillEffectJson` / `effects` in scope.

import { processCharaGroup, processVoiceActor } from "../lib/catalog.js";
import { charaLink, charaPageToIcon, charaPageToLink, stockIdToLinkImpl } from "../lib/chara.js";
import { imageDimension } from "../lib/image.js";
import { OrderedIntHash } from "../lib/int-key-map.js";
import { lahItem, lahItemIcon } from "../lib/item.js";
import { xmlEscape } from "../lib/ruby.js";
import * as skill from "../lib/skill.js";
import { createSkillText } from "../lib/skill-text.js";

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
  filter("lah_item", (id, rewardType, name) => lahItem(id, rewardType, name, site.data, charaDeps));
  filter("lah_item_icon", (id, rewardType, name) => lahItemIcon(id, rewardType, name, site.data));
  filter("processVoiceActor", processVoiceActor);
  filter("processCharaGroup", processCharaGroup);
  filter("image_dimension", imageDimension);

  // ---- skill.rb ------------------------------------------------------------------------------
  const statusData = () => ({
    statusMaster: site.data.StatusMaster,
    statusWiki: site.data.translation.Status,
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

  /** `status_description(id)` as called from a page or template: skillEffectJson may come from the context. */
  filter("status_description", function (id, skillEffectJson) {
    const json = skillEffectJson ?? this.context.get(["skillEffectJson"]);
    return skill.statusDescription(id, json, statusData(), (t, v) => renderInContext(this, t, v));
  });

  // Skill names/descriptions in every language (see lib/skill-text.js)
  const skillText = createSkillText(site, { strict: Boolean(process.env.ELEVENTY_STRICT) });
  filter("skill_html", (skillId, changeSkillIds) => skillText.skillHtml(skillId, changeSkillIds));
  filter("skill_name_html", (skillId) => skillText.skillNameHtml(skillId));
  filter("skill_has_text", (skillId) => skillText.hasText(skillId));
  filter("skill_tree_name", (model) => skillText.treeNameHtml(model));
  filter("skill_tree_html", (model) => skillText.treeHtml(model));
  filter("skill_tree_node_tip", (model, nodeId) => skillText.treeNodeTip(model, nodeId));
  filter("skill_tree_json", (model) => skillText.treeJson(model));
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
  filter("element_enum", skill.elementEnum);
  filter("hasAutoActionMarker", skill.hasAutoActionMarker);
  filter("sanitizePlayerName", skill.sanitizePlayerName);
  filter("sanitizeSalesCharaName", skill.sanitizeSalesCharaName);
  filter("convertLang", skill.convertLang);
}
