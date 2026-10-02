// Block-level HTML the way kramdown reads it, replacing markdown-it's CommonMark `html_block` rule.
//
// CommonMark ends most HTML blocks at the first blank line. Kramdown instead takes a block-level
// element verbatim up to its matching close tag, however many blank lines or indented lines are
// inside. Liquid output (tables with {% assign %} lines, indented skill text, …) relies on that.
//
// `markdown="1" | "block" | "span" | "0"` switches an element's content to markdown (or back to raw).
// Reference: kramdown/parser/kramdown/html.rb and kramdown/parser/html.rb.

const NAME = String.raw`[\w:][\w.:-]*`;
const ATTR = String.raw`\s+${NAME}(?:\s*=\s*(?:[\p{L}\p{N}_]+|("|').*?\3))?`;
const TAG_RE = new RegExp(String.raw`<(${NAME})\s*((?:${ATTR})*)\s*(\/)?>`, "suy");
const CLOSE_RE = new RegExp(String.raw`<\/(${NAME})\s*>`, "suy");
const CANDIDATE_RE = /<(?:!--|\?|!\[CDATA\[|\/?[\w:])/g;
const MARKDOWN_ATTR_RE = /\s+markdown\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))/i;

const words = (s) => new Set(s.split(/\s+/));

const CONTENT_BLOCK = words(
  "address applet article aside blockquote body dd details div dl fieldset figure figcaption " +
    "footer form header hgroup iframe li main map menu nav noscript object section summary td",
);
const CONTENT_SPAN = words(
  "a abbr acronym b bdo big button cite caption del dfn dt em h1 h2 h3 h4 h5 h6 i ins label legend " +
    "optgroup p q rb rbc rp rt rtc ruby select small span strong sub sup th tt",
);
const SPAN_ELEMENTS = words(
  "a abbr acronym b big bdo br button cite code del dfn em i img input ins kbd label mark option q " +
    "rb rbc rp rt rtc ruby samp select small span strong sub sup time tt u var",
);
const KNOWN_ELEMENTS = new Set([
  ...SPAN_ELEMENTS,
  ...CONTENT_BLOCK,
  ...CONTENT_SPAN,
  ...words(
    "script style math option textarea pre code kbd samp var caption col colgroup hr html head " +
      "ol ul p table tbody thead tfoot tr th dt dl",
  ),
]);
const WITHOUT_BODY = words(
  "area base br col command embed hr img input keygen link meta param source track wbr",
);

const canonical = (name) => (KNOWN_ELEMENTS.has(name.toLowerCase()) ? name.toLowerCase() : name);

/**
 * Offset just past the close tag matching an element whose open tag ended at `from`, plus the
 * offset where that close tag starts. Returns null if the element is never closed.
 */
function findElementEnd(src, from, name) {
  let i = from;
  for (;;) {
    CANDIDATE_RE.lastIndex = i;
    const cand = CANDIDATE_RE.exec(src);
    if (!cand) return null;
    const at = cand.index;
    if (src.startsWith("<!--", at)) {
      const end = src.indexOf("-->", at + 4);
      if (end < 0) return null;
      i = end + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", at)) {
      const end = src.indexOf("]]>", at + 9);
      if (end < 0) return null;
      i = end + 3;
      continue;
    }
    if (src.startsWith("<?", at)) {
      const end = src.indexOf("?>", at + 2);
      if (end < 0) return null;
      i = end + 2;
      continue;
    }
    CLOSE_RE.lastIndex = at;
    const close = CLOSE_RE.exec(src);
    if (close) {
      if (canonical(close[1]) === name) return { closeStart: at, end: at + close[0].length };
      i = at + close[0].length; // mismatched close tag: kramdown warns and treats it as text
      continue;
    }
    TAG_RE.lastIndex = at;
    const open = TAG_RE.exec(src);
    if (!open) {
      i = at + 1; // a lone "<"
      continue;
    }
    const inner = canonical(open[1]);
    i = at + open[0].length;
    if (open[4] || WITHOUT_BODY.has(inner.toLowerCase())) continue;
    const innerEnd = findElementEnd(src, i, inner);
    if (!innerEnd) return null; // unclosed nested element swallows the rest, as in kramdown
    i = innerEnd.end;
  }
}

/** Index of the line containing source offset `offset`, clamped to [startLine, endLine - 1]. */
function lineOf(state, offset, startLine, endLine) {
  let line = startLine;
  while (line < endLine - 1 && state.eMarks[line] < offset) line++;
  return line;
}

/**
 * @param nested true when called for an element inside a raw HTML block: kramdown finds those at
 *   any indentation, while a top-level block may be indented by at most three spaces.
 */
function htmlBlockRule(state, startLine, endLine, silent, nested = false) {
  if (!nested && state.sCount[startLine] - state.blkIndent >= 4) return false;
  const src = state.src;
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  if (src.charCodeAt(pos) !== 0x3c) return false;

  if (src.startsWith("<!--", pos)) {
    const close = src.indexOf("-->", pos + 4);
    if (close < 0) return false;
    if (silent) return true;
    return emitRaw(state, startLine, endLine, close + 3);
  }

  TAG_RE.lastIndex = pos;
  const tag = TAG_RE.exec(src);
  if (!tag) return false;
  const name = canonical(tag[1]);
  if (SPAN_ELEMENTS.has(name.toLowerCase())) return false; // starts a paragraph instead
  if (silent) return true;

  const tagEnd = pos + tag[0].length;
  const selfClosed = Boolean(tag[4]) || WITHOUT_BODY.has(name.toLowerCase());

  const marker = MARKDOWN_ATTR_RE.exec(tag[0]);
  const markerValue = marker ? (marker[1] ?? marker[2] ?? marker[3]) : undefined;
  let mode = { 0: "raw", 1: "default", span: "span", block: "block" }[markerValue] ?? "raw";
  if (mode === "default") mode = CONTENT_BLOCK.has(name) ? "block" : CONTENT_SPAN.has(name) ? "span" : "raw";
  const openTag = marker ? tag[0].replace(MARKDOWN_ATTR_RE, "") : tag[0];

  if (selfClosed || mode === "raw") {
    const end = selfClosed ? { end: tagEnd } : findElementEnd(src, tagEnd, name);
    const endOffset = end ? end.end : src.length;
    return emitRaw(state, startLine, endLine, endOffset, marker ? { from: tag[0], to: openTag } : null);
  }

  const found = findElementEnd(src, tagEnd, name);
  const openLine = lineOf(state, tagEnd, startLine, endLine);
  const openAloneOnLine = src.slice(tagEnd, state.eMarks[openLine]).trim() === "";
  const closeLine = found ? lineOf(state, found.closeStart, openLine, endLine) : -1;
  const closeAtLineStart =
    found && src.slice(state.bMarks[closeLine] + state.tShift[closeLine], found.closeStart) === "";

  if (mode === "span") {
    if (!found) return emitRaw(state, startLine, endLine, src.length, { from: tag[0], to: openTag });
    let token = state.push("html_block", "", 0);
    token.map = [startLine, openLine + 1];
    token.content = `${openTag}\n`;
    token = state.push("inline", "", 0);
    token.content = src.slice(tagEnd, found.closeStart).trim();
    token.map = [startLine, closeLine + 1];
    token.children = [];
    token = state.push("html_block", "", 0);
    token.content = `</${name}>\n`;
    state.line = closeLine + 1;
    return true;
  }

  // block content: markdown between the tags, which must sit on their own lines
  if (!found || !openAloneOnLine || !closeAtLineStart || closeLine <= openLine) {
    return emitRaw(state, startLine, endLine, found ? found.end : src.length, { from: tag[0], to: openTag });
  }
  let token = state.push("html_block", "", 0);
  token.map = [startLine, openLine + 1];
  token.content = `${openTag}\n`;

  const oldLineMax = state.lineMax;
  state.lineMax = closeLine;
  state.md.block.tokenize(state, openLine + 1, closeLine);
  state.lineMax = oldLineMax;

  token = state.push("html_block", "", 0);
  token.map = [closeLine, closeLine + 1];
  token.content = `</${name}>\n`;
  state.line = closeLine + 1;
  return true;
}

/** Whether the line starts an element whose content kramdown parses as markdown (markdown="1" etc.). */
function startsMarkdownElement(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  if (state.src.charCodeAt(pos) !== 0x3c) return false;
  TAG_RE.lastIndex = pos;
  const tag = TAG_RE.exec(state.src);
  if (!tag || WITHOUT_BODY.has(tag[1].toLowerCase()) || tag[4]) return false;
  const marker = MARKDOWN_ATTR_RE.exec(tag[0]);
  if (!marker) return false;
  const value = marker[1] ?? marker[2] ?? marker[3];
  return value === "1" || value === "span" || value === "block";
}

/**
 * Emit lines startLine..endOffset as raw HTML. kramdown still parses elements inside a raw block
 * whose own `markdown` attribute asks for it (e.g. <div markdown="1"> inside <div style="display: none">),
 * so the raw text is split around those.
 */
function emitRaw(state, startLine, endLine, endOffset, rewrite) {
  const lastLine = lineOf(state, endOffset - 1, startLine, endLine);
  const flush = (from, to) => {
    if (to <= from) return;
    const token = state.push("html_block", "", 0);
    token.map = [from, to];
    token.content = state
      .getLines(from, to, state.blkIndent, true)
      .replace(/(<[\w:][\w.:-]*[^<>]*?)\s+markdown\s*=\s*(?:"[^"]*"|'[^']*'|\w+)/g, "$1");
    if (rewrite && from === startLine) token.content = token.content.replace(rewrite.from, rewrite.to);
    token.content = escapeStrayTags(token.content);
  };

  let rawFrom = startLine;
  for (let line = startLine + 1; line <= lastLine; line++) {
    if (!startsMarkdownElement(state, line)) continue;
    flush(rawFrom, line);
    if (htmlBlockRule(state, line, lastLine + 1, false, true)) {
      rawFrom = state.line;
      line = state.line - 1;
    } else {
      rawFrom = line;
    }
  }
  flush(rawFrom, lastLine + 1);
  state.line = lastLine + 1;
  return true;
}

export default function kramdownHtmlBlock(md) {
  md.block.ruler.at("html_block", (state, startLine, endLine, silent) => htmlBlockRule(state, startLine, endLine, silent), {
    alt: ["paragraph", "reference", "blockquote"],
  });
}

/** Strip `markdown="…"` from inline HTML tags, as kramdown does for span-level elements. */
export function stripInlineMarkdownAttribute(md) {
  md.core.ruler.after("inline", "kramdown_inline_markdown_attr", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "inline" || !token.children) continue;
      for (const child of token.children) {
        if (child.type === "html_inline" && MARKDOWN_ATTR_RE.test(child.content)) {
          child.content = child.content.replace(MARKDOWN_ATTR_RE, "");
        }
      }
    }
  });
}

/**
 * kramdown continues right after the close tag of a block element, even in the middle of a line:
 * `</table>## Heading` is a table followed by a heading. markdown-it parses whole lines, so insert
 * the missing line break after such an element before parsing.
 */
export function splitAfterHtmlBlocks(md) {
  md.core.ruler.before("block", "kramdown_html_trailing_text", (state) => {
    const src = state.src;
    if (!src.includes("<")) return;

    let out = "";
    let copied = 0;
    let fence = null;
    let lineStart = 0;
    while (lineStart < src.length) {
      let lineEnd = src.indexOf("\n", lineStart);
      if (lineEnd < 0) lineEnd = src.length;

      const marker = /^ {0,3}(`{3,}|~{3,})/.exec(src.slice(lineStart, lineStart + 8));
      if (marker) {
        if (!fence) fence = marker[1][0];
        else if (fence === marker[1][0]) fence = null;
      }

      let next = lineEnd + 1;
      if (!fence && !marker) {
        let pos = lineStart;
        while (pos < lineEnd && pos - lineStart < 3 && src[pos] === " ") pos++;
        if (src[pos] === "<") {
          let end = -1;
          if (src.startsWith("<!--", pos)) {
            const close = src.indexOf("-->", pos + 4);
            if (close >= 0) end = close + 3;
          } else {
            TAG_RE.lastIndex = pos;
            const tag = TAG_RE.exec(src);
            if (tag && !SPAN_ELEMENTS.has(tag[1].toLowerCase())) {
              const name = canonical(tag[1]);
              if (tag[4] || WITHOUT_BODY.has(name.toLowerCase())) end = pos + tag[0].length;
              else end = findElementEnd(src, pos + tag[0].length, name)?.end ?? -1;
            }
          }
          if (end > 0) {
            let eol = src.indexOf("\n", end);
            if (eol < 0) eol = src.length;
            if (src.slice(end, eol).trim() !== "") {
              out += src.slice(copied, end) + "\n";
              copied = end;
            }
            next = eol + 1; // continue after the line the element ends on
          }
        }
      }
      lineStart = next;
    }
    state.src = out + src.slice(copied);
  });
}

const RAW_TEXT_ELEMENTS = new Set(["script", "style"]);

/**
 * In raw HTML, kramdown keeps tags and comments as they are and treats everything else as text,
 * which it escapes: a "<" that does not start a well-formed tag, and a close tag that does not
 * match an open element, come out as "&lt;…". Game text such as "<size=18>…</size>" or
 * "…<br但…" ends up in HTML blocks; passed through unchanged a browser would read it as a (broken)
 * tag and swallow the text that follows.
 */
export function escapeStrayTags(html) {
  if (!html.includes("<")) return html;
  let out = "";
  let i = 0;
  /** @type {string[]} */
  const open = [];
  for (;;) {
    const at = html.indexOf("<", i);
    if (at < 0) return out + html.slice(i);
    out += html.slice(i, at);

    const passThrough = (end) => {
      out += html.slice(at, end);
      i = end;
    };

    if (html.startsWith("<!--", at)) {
      const end = html.indexOf("-->", at + 4);
      if (end >= 0) {
        passThrough(end + 3);
        continue;
      }
    } else if (html.startsWith("<?", at)) {
      const end = html.indexOf("?>", at + 2);
      if (end >= 0) {
        passThrough(end + 2);
        continue;
      }
    } else if (html.startsWith("<![CDATA[", at)) {
      const end = html.indexOf("]]>", at + 9);
      if (end >= 0) {
        passThrough(end + 3);
        continue;
      }
    } else {
      TAG_RE.lastIndex = at;
      const tag = TAG_RE.exec(html);
      if (tag) {
        const name = canonical(tag[1]);
        passThrough(at + tag[0].length);
        if (tag[4] || WITHOUT_BODY.has(name.toLowerCase())) continue;
        if (RAW_TEXT_ELEMENTS.has(name)) {
          // script/style content is not text: copy it up to the close tag untouched
          const close = html.toLowerCase().indexOf(`</${name}`, i);
          if (close >= 0) {
            CLOSE_RE.lastIndex = close;
            const closing = CLOSE_RE.exec(html);
            const end = closing ? close + closing[0].length : close;
            out += html.slice(i, end);
            i = end;
          }
        } else {
          open.push(name);
        }
        continue;
      }
      CLOSE_RE.lastIndex = at;
      const close = CLOSE_RE.exec(html);
      if (close) {
        const name = canonical(close[1]);
        const matching = open.lastIndexOf(name);
        if (matching >= 0 || open.length === 0) {
          // a close tag of an element opened earlier, possibly in a previous piece of the same block
          if (matching >= 0) open.length = matching;
          passThrough(at + close[0].length);
        } else {
          out += close[0].replace("<", "&lt;").replace(/>$/, "&gt;");
          i = at + close[0].length;
        }
        continue;
      }
    }
    out += "&lt;";
    i = at + 1;
  }
}
