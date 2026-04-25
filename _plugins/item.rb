# frozen_string_literal: true
require 'pp'

module Jekyll

  module LahItemFilter

    def lah_item(id, rewardType=3, name=nil)
      if !id && name
        id = LahItemFilter.itemWikiNameToIdMap(@context).dig(name)
      end

      id = id.to_s
      if rewardType == 3
        item = @context.registers[:site].data["ItemMaster"]
        itemWiki = @context.registers[:site].data["wiki"]["Item"].dig(id) || {}
        itemName = itemWiki.dig("name") || item["itemName"]
        itemDesc = itemWiki.dig("description") || item["description"]
        return "<span class=\"item\" class=\"tippy\" data-content=\"#{ itemDesc }\"><img src=\"/cdn/Sprite/item_#{ item['resourceName'] }.png\" loading=\"lazy\"> #{ itemName }</span>"
      end

      if rewardType == 1
        card = @context.registers[:site].data["CardMaster"].dig(id) || {}
        resourceName = card.dig("resourceName") + "_h01"
      elsif rewardType == 2
        card = @context.registers[:site].data["SidekickMaster"].dig(id) || {}
        resourceName = card.dig("resourceName") + "_s01"
      elsif rewardType == 10
        return "Skill evolution"
      else
        return "Unknown rewardType #{rewardType}"
      end

      return "<span class=\"item\"><img src=\"/cdn/Sprite/icon_#{ resourceName }.png\" loading=\"lazy\"> #{ card['name'] }</span>"
    end

    def lah_item_icon(id, rewardType=3, name=nil)
      if !id && name
        id = LahItemFilter.itemWikiNameToIdMap(@context).dig(name)
      end

      id = id.to_s
      if rewardType == 3
        item = @context.registers[:site].data["ItemMaster"]
        itemWiki = @context.registers[:site].data["wiki"]["Item"].dig(id) || {}
        itemDesc = itemWiki.dig("description") || item["description"]
        return "<span class=\"item\" class=\"tippy\" data-content=\"#{ itemDesc }\"><img src=\"/cdn/Sprite/item_#{ item['resourceName'] }.png\" loading=\"lazy\">/span>"
      end

      if rewardType == 1
        card = @context.registers[:site].data["CardMaster"].dig(id) || {}
        resourceName = card.dig("resourceName") + "_h01"
      elsif rewardType == 2
        card = @context.registers[:site].data["SidekickMaster"].dig(id) || {}
        resourceName = card.dig("resourceName") + "_s01"
      elsif rewardType == 10
        return "Skill evolution"
      else
        return "Unknown rewardType #{rewardType}"
      end

      return "<span class=\"item\"><img src=\"/cdn/Sprite/icon_#{ resourceName }.png\" loading=\"lazy\"></span>"
    end
  end

  def self.itemWikiNameToIdMap(context)
    @@itemWikiNameToIdMap ||= itemWikiNameToIdMap_imp(context)
  end

  def self.itemWikiNameToIdMap_imp(context)
    itemWikiNameToIdMap = {}
    itemWiki = context.registers[:site].data["wiki"]["Item"]
    itemWiki.each do |id, item|
      itemWikiNameToIdMap[item["name"]] = id
    end
    return itemWikiNameToIdMap
  end 
end

Liquid::Template.register_filter(Jekyll::LahItemFilter)
