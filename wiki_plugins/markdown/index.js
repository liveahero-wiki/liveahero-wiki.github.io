// markdown-it configured to behave like Jekyll's kramdown (GFM input, header_links: true).
// The kramdown specifics live in sibling modules; see each file for the rules it emulates.

import MarkdownIt from "markdown-it";
import deflist from "markdown-it-deflist";
import footnote from "markdown-it-footnote";

import kramdownHeadings from "./headings.js";
import kramdownHtmlBlock, { splitAfterHtmlBlocks, stripInlineMarkdownAttribute } from "./html-block.js";
import kramdownIal from "./ial.js";
import kramdownQuirks from "./quirks.js";
import kramdownRenderer from "./renderer.js";

export function createMarkdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: false,
    // curly quotes only (see the `replacements` rule disabled below)
    typographer: true,
    breaks: false,
  });
  // typographer: true also enables `replacements` ((c) -> ©, -- -> –, ... -> …); keep just the quotes
  md.core.ruler.disable("replacements");
  md.use(footnote);
  md.use(deflist);
  md.use(kramdownQuirks);
  md.use(kramdownIal);
  md.use(kramdownHtmlBlock);
  md.use(splitAfterHtmlBlocks);
  md.use(stripInlineMarkdownAttribute);
  md.use(kramdownHeadings, { headerLinks: true });
  md.use(kramdownRenderer);
  return md;
}
