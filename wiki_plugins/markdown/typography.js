// Kramdown's typographic conversions, applied to markdown-it inline tokens:
//   - smart quotes: a port of kramdown/parser/kramdown/smart_quotes.rb (RubyPants rules)
//   - typographic symbols: --- -> —, -- -> –, ... -> …, << >> -> « »
// markdown-it's own `typographer` is switched off because its rules differ ((c) -> ©, …).

const LSQUO = "‘";
const RSQUO = "’";
const LDQUO = "“";
const RDQUO = "”";

// kramdown: SQ_PUNCT = '[!"#\$\%\'()*+,\-.\/:;<=>?\@\[\\\\\]\^_`{|}~]', SQ_CLOSE = %![^ \\\t\r\n\[{(-]!
const SQ_PUNCT = "[!\"#$%'()*+,\\-./:;<=>?@\\[\\\\\\]^_`{|}~]";
const SQ_CLOSE = "[^ \\\\\\t\\r\\n\\[{(-]";

const opening = (q) => (q === '"' ? LDQUO : LSQUO);
const closing = (q) => (q === '"' ? RDQUO : RSQUO);

// [regex, (match) => [[offsetInMatch, replacementChar], …]] in kramdown's order.
const SQ_RULES = [
  [/("|')(?=[_*]{1,2}\S)/uy, (m) => [[0, opening(m[1])]]],
  [new RegExp(`("|')(?=${SQ_PUNCT}(?!\\.\\.)\\B)`, "uy"), (m) => [[0, closing(m[1])]]],
  [/(\s?)"'(?=\w)/uy, (m) => [[m[1].length, LDQUO], [m[1].length + 1, LSQUO]]],
  [/(\s?)'"(?=\w)/uy, (m) => [[m[1].length, LSQUO], [m[1].length + 1, LDQUO]]],
  [/(\s?)'(?=\d\ds)/uy, (m) => [[m[1].length, RSQUO]]],
  [/(\s)('|")(?=\w)/uy, (m) => [[m[1].length, opening(m[2])]]],
  [new RegExp(`(${SQ_CLOSE})('|")`, "uy"), (m) => [[m[1].length, closing(m[2])]]],
  [/("|')(?=\s|s\b|$)/muy, (m) => [[0, closing(m[1])]]],
  [/(.?)'/suy, (m) => [[m[1].length, LSQUO]]],
  [/(.?)"/suy, (m) => [[m[1].length, LDQUO]]],
];

// kramdown TYPOGRAPHIC_SYMS (the backslash-escaped forms never reach us: markdown-it consumed the escape)
const SYM_RE = /---|--|\.\.\.|<< | >>|<<|>>/uy;
const SYM_START = /--|\.\.\.| ?(?:<<|>>)/gu;
const SYMS = {
  "---": "—",
  "--": "–",
  "...": "…",
  "<< ": "« ",
  " >>": " »",
  "<<": "«",
  ">>": "»",
};

/** One character standing in for a non-text token, so lookaheads see markup like kramdown's source. */
function placeholder(t) {
  switch (t.type) {
    case "em_open": case "em_close": case "strong_open": case "strong_close":
      return t.markup?.[0] ?? "*";
    case "s_open": case "s_close": return "~";
    case "code_inline": return "`";
    case "link_open": case "footnote_ref": return "[";
    case "link_close": return "]";
    case "image": return "!";
    case "html_inline": return "<";
    case "softbreak": case "hardbreak": return "\n";
    case "text_special": return "\\";
    default: return "\u0000";
  }
}

function convertChildren(children) {
  // pseudo source plus, per character, the text token it belongs to (-1 for placeholders)
  let src = "";
  const owner = [];
  const offset = [];
  children.forEach((t, i) => {
    if (t.type === "text") {
      for (let k = 0; k < t.content.length; k++) {
        owner.push(i);
        offset.push(k);
      }
      src += t.content;
    } else {
      const p = placeholder(t);
      src += p;
      for (let k = 0; k < p.length; k++) {
        owner.push(-1);
        offset.push(0);
      }
    }
  });
  if (!src.includes('"') && !src.includes("'") && !/--|\.\.\.|<<|>>/.test(src)) return;

  /** @type {Array<{ at: number, len: number, repl: string }>} */
  const ops = [];
  let pos = 0;
  while (pos < src.length) {
    // next quote and next typographic symbol at or after pos
    let q = pos;
    while (q < src.length && src[q] !== '"' && src[q] !== "'") q++;
    SYM_START.lastIndex = pos;
    const sym = SYM_START.exec(src);

    // kramdown's span scanner matches `[^\\]?["']`: the character before the quote is part of the
    // match only if it belongs to the same text run (same token, after the last match).
    let qStart = Infinity;
    if (q < src.length) {
      qStart = q > pos && owner[q - 1] !== -1 && owner[q - 1] === owner[q] ? q - 1 : q;
    }
    const sStart = sym ? sym.index : Infinity;
    if (qStart === Infinity && sStart === Infinity) break;

    if (qStart <= sStart) {
      let handled = false;
      for (const [re, apply] of SQ_RULES) {
        re.lastIndex = qStart;
        const m = re.exec(src);
        if (!m) continue;
        // a rule may only consume characters of the same text run
        const end = qStart + m[0].length;
        for (const [rel, ch] of apply(m)) {
          const at = qStart + rel;
          if (owner[at] >= 0) ops.push({ at, len: 1, repl: ch });
        }
        pos = Math.max(end, qStart + 1);
        handled = true;
        break;
      }
      if (!handled) pos = qStart + 1;
    } else {
      SYM_RE.lastIndex = sStart;
      const m = SYM_RE.exec(src);
      if (m) {
        const sameToken = owner[sStart] >= 0 && owner[sStart] === owner[sStart + m[0].length - 1];
        if (sameToken) ops.push({ at: sStart, len: m[0].length, repl: SYMS[m[0]] });
        pos = sStart + m[0].length;
      } else {
        pos = sStart + 1;
      }
    }
  }

  // apply right to left so earlier offsets stay valid
  for (const op of ops.sort((a, b) => b.at - a.at)) {
    const t = children[owner[op.at]];
    const off = offset[op.at];
    t.content = t.content.slice(0, off) + op.repl + t.content.slice(off + op.len);
  }
}

/** markdown-it plugin: adds the `kramdown_typography` core rule (run it after `inline`). */
export default function kramdownTypography(md) {
  md.core.ruler.after("inline", "kramdown_typography", (state) => {
    for (const token of state.tokens) {
      if (token.type === "inline" && token.children) convertChildren(token.children);
    }
  });
}
