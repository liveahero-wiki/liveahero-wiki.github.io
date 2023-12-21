
module LahWiki
  def xml_escape(input)
    input.to_s.encode(:xml => :attr).gsub(%r!\A"|"\Z!, "")
  end
end
