# frozen_string_literal: true
require 'json'

module LahWiki
  module JsonParseFilter
    def json_parse(str)
      JSON.parse(str)
    end
  end

  module Skills
    def self.status_wiki(context)
      @@status_wiki ||= context.registers[:site].data["wiki"]["StatusIcons"]
    end

    def skill_trigger(trigger_s)
      if !trigger_s
        return ""
      end

      triggers = JSON.parse(trigger_s)
      if triggers.length == 0
        return ""
      end
      f = []

      triggers.each do |c|
        case c["class"]
        when "MinComboTrigger"
          f.push("#{c['value']}+ combos")
        when "MinHPTrigger"
          f.push("#{c['value']}+% HP")
        when "MaxHPTrigger"
          f.push("#{c['value']}-% HP")
        when "OwnStatusTrigger"
          status_icon = Skills::status_wiki(@context)[c['value'].to_s]
          f.push("possessing #{status_icon}")
        else
          f.push("unknown condition (#{c['class']}")
        end
      end
      return +"(triggered when " + f.join(" and ") + ")"
    end
  end
end

Liquid::Template.register_filter(LahWiki::JsonParseFilter)
Liquid::Template.register_filter(LahWiki::Skills)
