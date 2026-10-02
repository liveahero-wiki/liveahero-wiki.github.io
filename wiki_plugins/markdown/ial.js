// Kramdown block IALs and attribute list definitions:
//
//   {:refdef: style="text-align: center;"}     defines a named attribute list (no output)
//   <img src="…">
//   {: refdef}                                 applies it to the block right above
//
//   * unordered
//   {:toc}                                     marks the list above as the table of contents
//
//   ## Heading
//   {:.no_toc}                                 adds a class to the heading above
//
// Only block IALs are supported; span IALs and `{::options}` are not used on the wiki.

const ALD_LINE = /^\{:(\w[\w-]*):(.*)\}[ \t]*$/;
const IAL_LINE = /^\{:(?![:/])(.*)\}[ \t]*$/;

const ATTR_TOKEN =
  /(?:^|\s)(?:(\w[\w-]*)=("|')((?:\\\}|\\\2|(?!\2).)*?)\2|((?:#\w[\w:-]*|\.\w[\w-]*)+)|(\w[\w-]*))(?=\s|$)/gy;

/**
 * Parse the inside of an IAL: `.class #id key="value" ref`.
 * @returns {{ attrs: Array<[string, string]>, classes: string[], refs: string[] }}
 */
export function parseAttributeList(text) {
  const out = { attrs: [], classes: [], refs: [] };
  const s = text.trim();
  let pos = 0;
  while (pos < s.length) {
    ATTR_TOKEN.lastIndex = pos;
    const m = ATTR_TOKEN.exec(s);
    if (!m) {
      pos++;
      continue;
    }
    pos = ATTR_TOKEN.lastIndex;
    if (m[1] !== undefined) {
      out.attrs.push([m[1], m[3].replace(/\\(["'}])/g, "$1")]);
    } else if (m[4] !== undefined) {
      for (const part of m[4].match(/[#.]\w[\w:-]*/g)) {
        if (part[0] === "#") out.attrs.push(["id", part.slice(1)]);
        else out.classes.push(part.slice(1));
      }
    } else {
      out.refs.push(m[5]);
    }
  }
  return out;
}

function applyList(token, list, alds) {
  for (const ref of list.refs) {
    const ald = alds[ref];
    if (ald) applyList(token, ald, alds);
    else (token.meta ??= {}).refs = [...(token.meta.refs ?? []), ref];
  }
  for (const [name, value] of list.attrs) token.attrSet(name, value);
  for (const cls of list.classes) token.attrJoin("class", cls);
}

/** The opening (or leaf) token of the block directly above `state.tokens.length`, at the current level. */
function previousBlock(state) {
  const tokens = state.tokens;
  let i = tokens.length - 1;
  if (i < 0) return null;
  const level = state.level;
  // skip back over the closing token of the previous sibling to its opening token
  if (tokens[i].level === level && tokens[i].nesting === -1) {
    for (i--; i >= 0; i--) {
      if (tokens[i].level === level && tokens[i].nesting === 1) return tokens[i];
    }
    return null;
  }
  return tokens[i].level === level && tokens[i].nesting === 0 ? tokens[i] : null;
}

function ialRule(state, startLine, endLine, silent) {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  if (state.src.charCodeAt(pos) !== 0x7b || state.src.charCodeAt(pos + 1) !== 0x3a) return false;
  const line = state.src.slice(pos, state.eMarks[startLine]);

  const ald = ALD_LINE.exec(line);
  const ial = ald ? null : IAL_LINE.exec(line);
  if (!ald && !ial) return false;
  if (silent) return true;

  const alds = (state.env.kramdownAlds ??= {});
  if (ald) {
    alds[ald[1]] = parseAttributeList(ald[2]);
  } else {
    const prev = startLine > 0 && !state.isEmpty(startLine - 1) ? previousBlock(state) : null;
    if (prev) applyList(prev, parseAttributeList(ial[1]), alds);
    // An IAL after a blank line applies to the next block in kramdown; not used on the wiki.
  }
  state.line = startLine + 1;
  return true;
}

export default function kramdownIal(md) {
  md.block.ruler.before("html_block", "kramdown_ial", ialRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
}
