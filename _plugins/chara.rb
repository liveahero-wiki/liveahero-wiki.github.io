require 'pp'


module Jekyll

  class CharaMap
  
    def self.name_to_pages
      @@name_to_pages
    end

    def self.generate(site)
      @@name_to_pages = {}
      puts "Initializing chara page map"

      site.collections["charas"].docs.each do |chara|
        name = chara.data["title"]
        @@name_to_pages[name] = chara
      end
    end

    def self.path_to_resourceName(path)
      # "/_charas/marfik.md" -> "marfik"
      path.split("/")[-1][0..-4]
    end
  end

  class CharaLinkTag < Liquid::Tag
  
    def initialize(tag_name, input, tokens)
      super
      @input = input
    end

    def render(context)
      page = CharaMap.name_to_pages[@input.strip]
      if page
        resourceName = CharaMap.path_to_resourceName(page.path)

        if page.data["unreleased"]
          "<a href=\"#{page.url}\"><span class=\"item\"><img src=\"/assets/img/icon/icon_unknown_card.png\" loading=\"lazy\"></span> #{page.data["title"]}</a>"
        else
          "<a href=\"#{page.url}\"><span class=\"item\"><img src=\"/assets/img/icon/icon_#{resourceName}_s01.png\" loading=\"lazy\"></span> #{page.data["title"]}</a>"
        end
      else
        @input
      end
    end
  end
end

Liquid::Template.register_tag('chara_link', Jekyll::CharaLinkTag)

Jekyll::Hooks.register :site, :pre_render do |site|
  Jekyll::CharaMap.generate(site)
end
