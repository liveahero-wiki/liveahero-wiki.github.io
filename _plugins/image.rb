require 'fastimage'

module LahWiki
  module ImageFilter
    def image_dimension(path)
      if path[0] == '/'
        path = "." + path
      end
      return FastImage.size(path)
    end
  end
end

Liquid::Template.register_filter(LahWiki::ImageFilter)
