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
        return title
      end

      if page.data["unreleased"]
        img = page.data["icon"]
        if img
          img = "/assets/img/unreleased/#{img}.png"
        else
          img = "/cdn/Sprite/icon_unknown_card.png"
        end
        return "<a href=\"#{page.url}\"><span class=\"item\"><img src=\"#{img}\" loading=\"lazy\"></span> #{title}</a>"
      end

      if tokens.length == 2
        suffix = tokens[1]
        if suffix[0] == "h"
          type = 1
        else
          type = 2
        end
        variant = suffix[1].to_i
      else
        type = 2
        variant = 1
      end

      characterId = page.data["characterId"]
      stockId = (1000 + characterId) * 10 + variant

      title, link = CharaFilter::stockIdToLink_impl(stockId, type, context, page)
      return link
    end
  end

  module CharaFilter

    def charaPageToIcon(page)
      if page.data["unreleased"]
        img = page.data["icon"]
        if img
          img = "/assets/img/unreleased/#{img}.png" # unreleased chara
        else
          img = "/cdn/Sprite/icon_unknown_card.png"
        end
        return img
      end
      characterId = page.data["characterId"]
      cardId = (100 * characterId) + 100011
      resourceName = CharaLinkTag.sidekick_master(@context).dig(cardId.to_s, "resourceName")
      if resourceName
        img = "/cdn/Sprite/icon_#{resourceName}_s01.png"
      else
        img = "/cdn/Sprite/icon_unknown_card.png"
      end
      return img
    end

    def characterIdToPage(id)
      CharaMap.characterId_to_pages[id]
    end

    def self.stockIdToLink_impl(stockId, type, ctx, page=nil)
      cardId = stockId * 10 + 1
      variant = stockId % 10
      characterId = (stockId / 10) % 1000

      if !page
        page = CharaMap.characterId_to_pages[characterId]
      end

      if type == 1
        resourceName = CharaLinkTag.card_master(ctx).dig(cardId.to_s, "resourceName")
        suffix = "h"
      else
        resourceName = CharaLinkTag.sidekick_master(ctx).dig(cardId.to_s, "resourceName")
        suffix = "s"
      end

      if page
        if variant > 1
          title = page.data.dig(suffix + variant.to_s, "title") || page.data["title"]
        else
          title = page.data["title"]
        end
        url = page.url
      else
        title = resourceName
        url = "/charas/"
      end

      return title, "<a href=\"#{url}##{suffix}#{stockId}\"><span class=\"item\"><img src=\"/cdn/Sprite/icon_#{resourceName}_#{suffix}01.png\" loading=\"lazy\" width=\"32\" height=\"32\"></span> #{title}</a>"
    end

    def stockIdToCharaTitle(stockId, type)
      title, link = CharaFilter::stockIdToLink_impl(stockId, type, @context)
      return title
    end

    def stockIdToLink(stockId, type, ctx=nil, page=nil)
      if !ctx
        ctx = @context
      end
      title, link = CharaFilter::stockIdToLink_impl(stockId, type, ctx, page)
      return link
    end

  end
end

Liquid::Template.register_filter(Jekyll::CharaFilter)
Liquid::Template.register_tag('chara_link', Jekyll::CharaLinkTag)

Jekyll::Hooks.register :site, :pre_render do |site|
  Jekyll::CharaMap.generate(site)
end
