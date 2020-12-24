# frozen_string_literal: true
require 'pp'

module Jekyll

  class CharaMap
  
    def self.name_to_pages
      @@name_to_pages
    end

    def self.characterId_to_pages
      @@characterId_to_pages
    end

    def self.generate(site)
      @@name_to_pages = {}
      @@characterId_to_pages = {}
      puts "Initializing chara page map"

      site.collections["charas"].docs.each do |chara|
        name = chara.data["title"]
        @@name_to_pages[name] = chara

        if !chara.data["unreleased"]
          characterId = chara.data["characterId"]
          @@characterId_to_pages[characterId] = chara
        end
      end
    end

    def self.path_to_resourceName(path)
      # "/_charas/marfik.md" -> "marfik"
      path.split("/")[-1][0..-4]
    end
  end

  class CharaLinkTag < Liquid::Tag

    def self.sidekick_master(context)
      @@sidekick_master ||= context.registers[:site].data["SidekickMaster"]
    end

    def self.card_master(context)
      @@card_master ||= context.registers[:site].data["CardMaster"]
    end
  
    def initialize(tag_name, input, tokens)
      super
      @input = input
    end

    def render(context)

      tokens = @input.strip.split("|")
      title = tokens[0]

      page = CharaMap.name_to_pages[title]
      if !page
        return @input
      end

      if page.data["unreleased"]
        return "<a href=\"#{page.url}\"><span class=\"item\"><img src=\"/cdn/Sprite/icon_unknown_card.png\" loading=\"lazy\"></span> #{title}</a>"
      end

      if tokens.length == 2
        suffix = tokens[1]
      else
        suffix = "s1"
      end

      variant = suffix[1].to_i
      characterId = page.data["characterId"]
      stockId = (1000 + characterId) * 10 + variant
      cardId = stockId * 10 + 1
      
      if suffix[0] == "h"
        resourceName = CharaLinkTag.card_master(context).dig(cardId.to_s, "resourceName")
      else
        resourceName = CharaLinkTag.sidekick_master(context).dig(cardId.to_s, "resourceName")
      end

      if variant > 1
        title = page.data.dig(suffix, "title") || title
      end

      "<a href=\"#{page.url}/##{suffix[0]}#{stockId}\"><span class=\"item\"><img src=\"/cdn/Sprite/icon_#{resourceName}_#{suffix[0]}01.png\" loading=\"lazy\"></span> #{title}</a>"
    end
  end

  module CharaFilter

    def characterIdToPage(id)
      CharaMap.characterId_to_pages[id]
    end
  end
end

Liquid::Template.register_filter(Jekyll::CharaFilter)
Liquid::Template.register_tag('chara_link', Jekyll::CharaLinkTag)

Jekyll::Hooks.register :site, :pre_render do |site|
  Jekyll::CharaMap.generate(site)
end
