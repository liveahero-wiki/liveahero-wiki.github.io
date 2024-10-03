# frozen_string_literal: true
require 'json'
require_relative 'common'

module LahWiki
  module JsonParseFilter
    def render_liquid(content)
      partial = Liquid::Template.parse(content, :line_numbers => true)
      partial.render!(@context)
    end

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

    @@role_map = {
      1 => "Attack",
      2 => "Defense",
      3 => "Assistance",
      4 => "Debuff",
      5 => "Speed",
      6 => "VP Gain",
      7 => "Heal",
      99 => "Special",
    }

    INVALID = 999

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

    def should_skip_skill_effect(skillEffectJson)
      return (skillEffectJson["effects"][0]["class"] == "NoneEffect" and [74, 136, 137].include?(skillEffectJson["statusId"]))
    end

    def skill_trigger(triggers, timing)
      if !triggers
        return ""
      end

      if triggers.length == 0
        return ""
      end
      f = []

      h = Hash.new { |h, k| h[k] = {} }

      triggers.each do |c|
        case c["class"]
        when "ViewTrigger"
          count = c['value']
          f.push("View&gt;#{count}")
        when "ViewDontExecTrigger"
          count = c['value']
          f.push("View&lt;=#{count}")
        when "EnemyTeamCountTrigger"
          count = c['value']
          f.push("Enemy count=#{count}")
        when "OwnTeamCountTrigger"
          count = c['value']
          f.push("Ally count=#{count}")
        when "MinComboTrigger"
          h['Combo']['min'] = c['value']
        when "MaxComboTrigger"
          h['Combo']['max'] = c['value']
        when "NotPinchExecTrigger"
          f.push("HP&gt;=50<!--#{c['value']}-->%")
        when "PinchExecTrigger"
          f.push("HP&lt;50<!--#{c['value']}-->%")
        when "ExistPinchTeamCharacterTrigger"
          f.push("One ally's HP&lt;50<!--#{c['value']}-->%")
        when "MinHPTrigger"
          h['HP']['min'] = c['value']
        when "MaxnHPTrigger"
          h['HP']['max'] = c['value']
        when "KillExecTrigger"
          f.push("target enemy is killed")
        when "ReceiverPinchExecTrigger"
          f.push("skill receiver's HP&lt;50")
        when "ReceiverNotPinchExecTrigger"
          f.push("skill receiver's HP&gt;50")
        when "InvokerAliveTrigger"
          f.push("when invoker is alive")
        when "ReceiverTemporaryAliveTrigger"
          f.push("skill receiver is still alive")
        when "AboveSpdValueTrigger"
          f.push("SPD&gt;#{c['value']}")
        when "OwnStatusTrigger"
          status_icon = self.status_description(c['value'])
          f.push("possessing #{status_icon}")

        when "OwnBuffTurnExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["statusTurn_#{c['statusId']}_1"]['min'] = count
        when "OwnBuffTurnDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["statusTurn_#{c['statusId']}_1"]['max'] = count

        when "OwnBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["status_#{c['statusId']}_1"]['min'] = count
        when "OwnBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["status_#{c['statusId']}_1"]['max'] = count

        when "OwnDeBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["status_#{c['statusId']}_0"]['min'] = count
        when "OwnDeBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["status_#{c['statusId']}_0"]['max'] = count

        when "OwnSystemStatusNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 2)
          count = c['value']
          h["status_#{c['statusId']}_2"]['min'] = count
        when "OwnSystemStatusNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 2)
          count = c['value']
          h["status_#{c['statusId']}_2"]['max'] = count

        when "EnemyDeBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_0"]['min'] = count
        when "EnemyDeBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_0"]['max'] = count

        when "EnemyAllDeBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusAllEnemy_#{c['statusId']}_0"]['min'] = count
        when "EnemyAllDeBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusAllEnemy_#{c['statusId']}_0"]['max'] = count

        when "EnemySystemStatusNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_0"]['min'] = count
        when "EnemySystemStatusNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 0)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_0"]['max'] = count

        when "EnemyBuffNumberExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_1"]['min'] = count
        when "EnemyBuffNumberDontExecTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          h["statusEnemy_#{c['statusId']}_1"]['max'] = count


        # Not sure if these 4 are correct
        when "OverTargetSpecialEffectTurnTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("target has at least #{count}x #{status_icon}")
        when "RemainTargetSpecialEffectTurnTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("target has at most #{count}x #{status_icon}")

        when "OverInvokerSpecialEffectTurnTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("self has at least #{count}x #{status_icon}")
        when "RemainInvokerSpecialEffectTurnTrigger"
          status_icon = self.status_description_unknown(c['statusId'], 1)
          count = c['value']
          f.push("self has at most #{count}x #{status_icon}")

        when "TargetElementExecTrigger"
          element = @@element_map[c['element']] || "Unknown"
          f.push("target is #{element}")
        when "TargetElementDontExecTrigger"
          element = @@element_map[c['element']] || "Unknown"
          f.push("target is not #{element}")
        when "BeforeSkillTrigger"
          f.push("target has not acted before invoker in current turn")
        when "AfterSkillTrigger"
          f.push("target has acted before invoker in current turn")
        when "BeforeSkillTriggerWithoutInvoker"
          f.push("target has not acted yet in current turn")
        # Might be wrong
        when "TurnTrigger"
          f.push("turn&gt;=#{c['value']}")
        when "TurnDontExecTrigger"
          f.push("turn&lt;=#{c['value']}")
        when "TargetIsOwnTrigger"
          f.push("is targeting self")
        when "TargetNotOwnTrigger"
          f.push("is not targeting self")
        when "NowAttackingTrigger"
          f.push("current action is not activated by another skill")
        when "ReceiverSelectRoleTrigger"
          role = @@role_map[c['role']]
          f.push("target's role is #{role}")
        when "NotNowAttackingTrigger"
          f.push("self is not attacking now}")
        else
          f.push("unknown condition (#{c['class']}")
        end
      end

      h.each do |key, value|
        value.default = INVALID
        min = value["min"].to_i
        max = value["max"].to_i

        if key.start_with?("status")
          range = ""

          if min == INVALID
            if max == 0
              range = "x = 0"
            else
              range = "x &lt;= #{max}"
            end
          elsif max == INVALID
            range = "x &gt; #{min}"
          elsif min + 1 == max
            range = "x = #{max}"
          else
            range = "#{min} &lt; x $lt;= #{max}"
          end

          comp = key.split("_")
          statusId = comp[1].to_i
          statusType = comp[2].to_i
          status_icon = self.status_description_unknown(statusId, statusType)

          if key.start_with?("statusEnemy")
            f.push("target enemy possessing #{range} #{status_icon}")
          elsif key.start_with?("statusAllEnemy")
            f.push("all target enemies possessing #{range} #{status_icon}")
          elsif key.start_with?("statusTurn")
            f.push("total status turn #{range} #{status_icon}")
          else
            f.push("possessing #{range} #{status_icon}")
          end
        else
          range = ""
          if min == INVALID
            range = "#{key} &lt;= #{max}"
          elsif max == INVALID
            range = "#{key} &gt;= #{min}"
          elsif min == max
            range = "#{key} = #{max}"
          else
            range = "#{min} &lt;= #{key} $lt;= #{max}"
          end

          f.push(range)
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

    def status_description(id, skillEffectJson=nil)
      id_s = id.to_s

      # try getting from context
      if skillEffectJson == nil
        skillEffectJson = @context['skillEffectJson']
      end

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

      if skillEffectJson != nil
        effects = {}
        skillEffectJson["effects"].each do |effect|
          effects[effect["class"]] = effect
        end
        @context.stack do
          @context["skillEffectJson"] = skillEffectJson
          @context["effects"] = effects

          partial = Liquid::Template.parse(description, :line_numbers => true)
          description = partial.render!(@context)
        end
      end
      description = xml_escape(description)

      status_type = status["statusType"]
      if status_type == 2 && name == ""
        name = "system status #{id}"
        wiki_icon = "ui_button_square_02"
      end

      "<span class=\"status tippy\" data-id=\"#{id_s}\" data-content=\"#{description}\"><img src=\"/cdn/Sprite/#{wiki_icon}.png\" loading=\"lazy\"> #{name}</span>"      
    end

    def status_manual(wiki_icon, name, description=nil)
      if description && description.length > 0
        description = xml_escape(description)
        "<span class=\"status tippy\" data-content=\"#{description}\"><img src=\"/cdn/Sprite/#{wiki_icon}.png\" loading=\"lazy\"> #{name}</span>"
      else
        "<span class=\"status\"><img src=\"/cdn/Sprite/#{wiki_icon}.png\" loading=\"lazy\"> #{name}</span>"
      end
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
      when 14
        return "all allies except self"
      when 16
        return "all enemies except target"
      end
      return "Unknown target #{target}"
    end

    def sanitizeSkillDescription(s)
      if s.nil?
        return s
      end

      s = s.gsub(/<style="(.*?)">/, "")
      s = s.gsub("</style>", "")
      return s
    end
  end
end

Liquid::Template.register_filter(LahWiki::JsonParseFilter)
Liquid::Template.register_filter(LahWiki::Skills)
