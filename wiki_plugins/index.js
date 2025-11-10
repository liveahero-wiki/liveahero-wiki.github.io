/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function(eleventyConfig, markdownIt) {
  // Usage: {% uppercase myVar %} where myVar has a value of "alice"
  // Usage: {% uppercase "alice" %}
  eleventyConfig.addLiquidTag("chara_link", function(liquidEngine) {
    return {
      parse: function(tagToken, remainingTokens) {
        this.str = tagToken.args; // myVar or "alice"
      },
      render: async function(scope, hash) {
        // Resolve variables
        //var str = await this.liquid.evalValue(this.str, scope); // "alice"

        // Do the uppercasing
        return this.str;
      }
    };
  });

  eleventyConfig.collections

  eleventyConfig.addFilter("stockIdToLink", s => {
    return `<a>${s}</a>`
  });

  eleventyConfig.addFilter("stockIdToCharaTitle", s => {
    return `<a>Chara_name: ${s}</a>`
  });

  eleventyConfig.addFilter("status_description", s => {
    return `<a>Status: ${s}</a>`
  });

  eleventyConfig.addFilter("markdownify", a => {
    return markdownIt.render(a);
  });

  eleventyConfig.addFilter("skill_target", a => {
    return a;
  });

  eleventyConfig.addFilter("skill_trigger", a => {
    return "";
  });

  eleventyConfig.addFilter("skill_trigger_json", a => {
    return "";
  });

  eleventyConfig.addFilter("should_skip_skill_effect", a => {
    return false;
  });

  eleventyConfig.addFilter("characterIdToPage", a => {
    return a;
  });

  eleventyConfig.addFilter("processCharaGroup", a => {
    return a;
  });

  eleventyConfig.addFilter("processVoiceActor", a => {
    return a;
  });
};
