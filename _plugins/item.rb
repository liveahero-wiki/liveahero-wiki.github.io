# frozen_string_literal: true
require 'pp'

module Jekyll

  module LahItemFilter

    def lah_item(id, rewardType=nil, name=nil)
      if !id && name
        id = LahItemFilter::itemWikiNameToIdMap(@context).dig(name)
      end

      if !rewardType
        rewardType = 3
      end

      idInt = id
      id = id.to_s
      if rewardType == 3
        item = @context.registers[:site].data["ItemMaster"]
        itemWiki = @context.registers[:site].data["wiki"]["Item"].dig(idInt) || {}
        itemName = itemWiki.dig("name") 
        itemName = itemName.nil? || itemName.empty? ? item["itemName"] : itemName
        itemDesc = itemWiki.dig("description")
        itemDesc = itemDesc.nil? || itemDesc.empty? ? item["description"] : itemDesc
        return "<span class=\"item tippy\" data-content=\"#{ itemDesc }\"><img src=\"/cdn/Sprite/item_#{ item['resourceName'] }.png\" loading=\"lazy\"> #{ itemName }</span>"
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

    def lah_item_icon(id, rewardType=nil, name=nil)
      if !id && name
        id = LahItemFilter::itemWikiNameToIdMap(@context).dig(name)
      end

      if !rewardType
        rewardType = 3
      end

      idInt = id
      id = id.to_s
      if rewardType == 3
        item = @context.registers[:site].data["ItemMaster"]
        itemWiki = @context.registers[:site].data["wiki"]["Item"].dig(idInt) || {}
        itemDesc = itemWiki.dig("description")
        itemDesc = itemDesc.nil? || itemDesc.empty? ? item["description"] : itemDesc
        return "<span class=\"item tippy\" data-content=\"#{ itemDesc }\"><img src=\"/cdn/Sprite/item_#{ item['resourceName'] }.png\" loading=\"lazy\"></span>"
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
    def self.itemWikiNameToIdMap(context)
      @@itemWikiNameToIdMap ||= self.itemWikiNameToIdMap_imp(context)
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

end

Liquid::Template.register_filter(Jekyll::LahItemFilter)
