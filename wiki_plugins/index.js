module.exports = function(eleventyConfig) {
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

  eleventyConfig.addFilter("date_to_xmlschema", s => {
    return new Date(s).toISOString();
  });

  eleventyConfig.addFilter("stockIdToLink", s => {
    return `<a>${s}</a>`
  });

  eleventyConfig.addFilter("stockIdToCharaTitle", s => {
    return `<a>Chara_name: ${s}</a>`
  });

  eleventyConfig.addFilter("status_description", s => {
    return `<a>Status: ${s}</a>`
  });

  eleventyConfig.addFilter("where_exp", a => {
    return a;
  });

  eleventyConfig.addFilter("markdownify", a => {
    return a;
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

  eleventyConfig.addFilter("push", (array, element) => {
    const nArray = Array.from(array);
    nArray.push(element);
    return nArray;
  });

  eleventyConfig.addFilter("characterIdToPage", a => {
    return a;
  });

  eleventyConfig.addFilter("jsonify", s => {
    return JSON.parse(s)
  });

  function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
          map.set(key, [item]);
      } else {
          collection.push(item);
      }
    });
    return map;
  }

  eleventyConfig.addFilter("group_by", (array, tag) => {
    if (!(array instanceof Array)) return array;

    const gp = groupBy(array, e => e["tag"]);
    const result = [];
    for (const [name, items] of gp.entries()) {
      result.push({name, items});
    }
    return result;
  });

  eleventyConfig.addFilter("group_by_exp", a => {
    return a;
  });

  eleventyConfig.addFilter("processCharaGroup", a => {
    return a;
  });

  eleventyConfig.addFilter("processVoiceActor", a => {
    return a;
  });
};
