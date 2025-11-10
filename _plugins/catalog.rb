# frozen_string_literal: true

module Jekyll

  module CatalogFilter

    STAFF_SPLIT = /,|\+|＋/

    def processVoiceActor(name)
      if name == '？？？'
        name = '後藤ヒロキ,岩永悠平,天野ユウ,戸板優衣,樹元オリエ'
      end
      name.split(STAFF_SPLIT)
    end

    def processCharaGroup(cards, key, maps)
      group = {}
      cards.each do |card|
        name = card[key]
        names = processVoiceActor(name)

        names.each do |n|
          array = group[n]
          if !array
            array = []
            group[n] = array
          end

          array.push(card)
        end
      end

      final = []
      group.each do |name, items|
        final.push({"name" => name, "en" => maps[name]&.fetch("en"), "items" => items})
      end

      final
    end
  end
end

Liquid::Template.register_filter(Jekyll::CatalogFilter)
