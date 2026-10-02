// Kramdown block IALs:
//
//   * unordered
//   {:toc}                                     marks the list above as the table of contents
//
//   ## Heading
//   {:.no_toc}                                 adds a class to the heading above
//
//   | a | b |
//   {: style="display: block"}                 sets attributes on the block above
//
// Only block IALs are supported; span IALs, named attribute lists (`{:name: …}` / `{: name}`)
// and `{::options}` are not used on the wiki.

const IAL_LINE = /^\{:(?![:/])(.*)\}[ \t]*$/;

const ATTR_TOKEN =
  /(?:^|\s)(?:(\w[\w-]*)=("|')((?:\\\}|\\\2|(?!\2).)*?)\2|((?:#\w[\w:-]*|\.\w[\w-]*)+)|(\w[\w-]*))(?=\s|$)/gy;

/**
 * Parse the inside of an IAL: `.class #id key="value" word`.
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

/** Bare words (`{:toc}`) are kept in `token.meta.refs` for the plugins that look for them. */
function applyList(token, list) {
  if (list.refs.length) (token.meta ??= {}).refs = [...(token.meta.refs ?? []), ...list.refs];
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

  const ial = IAL_LINE.exec(line);
  if (!ial) return false;
  if (silent) return true;

  const prev = startLine > 0 && !state.isEmpty(startLine - 1) ? previousBlock(state) : null;
  if (prev) applyList(prev, parseAttributeList(ial[1]));
  // An IAL after a blank line applies to the next block in kramdown; not used on the wiki.
  state.line = startLine + 1;
  return true;
}

export default function kramdownIal(md) {
  md.block.ruler.before("html_block", "kramdown_ial", ialRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
}
