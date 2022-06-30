# frozen_string_literal: true
require 'json'

module LahWiki
  module JsonParseFilter
    def json_parse(str)
      JSON.parse(str)
    end
  end

  module Skills
    @@element_map = {
      1 => "Fire",
      2 => "Water",
      3 => "Wood",
      4 => "Light",
      5 => "Shadow",
    }

    def self.status_wiki(context)
      @@status_wiki ||= context.registers[:site].data["wiki"]["Status"]
    end

    def self.status_master(context)
      @@status_master ||= context.registers[:site].data["StatusMaster"]
    end

    def skill_trigger_json(trigger_s, timing)
      if !trigger_s
        return ""
      end

      triggers = JSON.parse(trigger_s)
      return skill_trigger(triggers, timing)
    end

    def skill_trigger(triggers, timing)
      if !triggers
        return ""
      end

      if triggers.length == 0
        return ""
      end
      f = []

      triggers.each do |c|
        case c["class"]
        when "ViewTrigger"
          count = c['value']
          f.push("View&gt;#{count}")
        when "ViewDontExecTrigger"
          count = c['value']
          f.push("View&lt;=#{count}")
        when "MinComboTrigger"
          f.push("Combo&gt;=#{c['value']}")
        when "MaxComboTrigger"
          f.push("Combo&lt;=#{c['value']}")
        when "NotPinchExecTrigger"
          f.push("HP&gt;=50<!--#{c['value']}-->%")
        when "PinchExecTrigger"
          f.push("HP&lt;50<!--#{c['value']}-->%")
        when "MinHPTrigger"
          f.push("HP&gt;=#{c['value']}%")
        when "KillExecTrigger"
          f.push("target enemy is killed")
        when "InvokerAliveTrigger"
          f.push("when invoker is alive")
        when "BeforeSkillTrigger"
          f.push("before skill activates (need verification)")
        when "AboveSpdValueTrigger"
          f.push("SPD&gt;#{c['value']}")
        when "OwnStatusTrigger"
          status_icon = self.status_description(c['value'])
          f.push("possessing #{status_icon}")
        when "OwnBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("possessing &gt;#{count}x #{status_icon}")
        when "OwnBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("possessing &lt;=#{count}x #{status_icon}")
        when "OwnDeBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          f.push("possessing &gt;#{count}x #{status_icon}")
        when "OwnDeBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          f.push("possessing &lt;=#{count}x #{status_icon}")
        when "OwnSystemStatusNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 2)
          count = c['value']
          f.push("possessing &gt;#{count}x #{status_icon}")
        when "OwnSystemStatusNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 2)
          count = c['value']
          f.push("possessing &lt;=#{count}x #{status_icon}")
        when "EnemyDeBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          f.push("target enemy possessing &gt;#{count}x #{status_icon}")
        when "EnemyDeBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          f.push("target enemy possessing &lt;=#{count}x #{status_icon}")
        when "EnemyBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("target possessing &gt;#{count}x #{status_icon}")
        when "EnemyBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("target possessing &lt;=#{count}x #{status_icon}")
        when "TargetElementExecTrigger"
          element = @@element_map[c['element']] || "Unknown"
          f.push("target is #{element}")
        when "TargetElementDontExecTrigger"
          element = @@element_map[c['element']] || "Unknown"
          f.push("target is not #{element}")
        when "BeforeSkillTriggerWithoutInvoker"
          f.push("target has not acted yet")
        else
          f.push("unknown condition (#{c['class']}")
        end
      end
      if timing == 1
        return +"(triggered when " + f.join(" and ") + ")"
      else
        return +"(extra_cond: " + f.join(" and ") + ")"
      end
    end

    def status_description_unknown(id, type)
      if id == 0
        case type
        when 0
          return "debuff(s)"
        when 1
          return "buffs(s)"
        when 2
          return "system status(es)"
        end
      end
      return self.status_description(id)
    end

    def status_description(id)
      id_s = id.to_s

      status = Skills::status_master(@context)[id_s]
      if !status
        return "unknown status #{id}"
      end

      wiki_icon = Skills::status_wiki(@context).dig(id_s, 'icon')
      if !wiki_icon || wiki_icon == ""
        wiki_icon = "b_skill_special" # "ui_icon_stance_blank"
      end

      name = Skills::status_wiki(@context).dig(id_s, 'name') || status['statusName']
      description = Skills::status_wiki(@context).dig(id_s, 'description') || status['description']

      status_type = status["statusType"]
      if status_type == 2 && name == ""
        name = "system status #{id}"
        wiki_icon = "ui_button_square_02"
      end

      "<span class=\"status\" data-id=\"#{id_s}\" title=\"#{description}\"><img src=\"/cdn/Sprite/#{wiki_icon}.png\" loading=\"lazy\"> #{name}</span>"      
    end

    def skill_target(target)
      case target
      when 0
        return "self"
      when 1
        return "target ally"
      when 2
        return "target enemy"
      when 3
        return "all allies"
      when 4
        return "all enemies"
      when 5
        return "event bonus unit"
      when 6
        return "random ally"
      when 7
        return "random enemy"
      when 9
        return "random ally"
      when 11
        return "ally with lowest HP"
      when 12
        return "each ally"
      when 13
        return "ally with highest ATK"
      end
      return "Unknown target #{target}"
    end
  end
end

Liquid::Template.register_filter(LahWiki::JsonParseFilter)
Liquid::Template.register_filter(LahWiki::Skills)
