// Ruby Liquid and Jekyll read quoted strings differently from LiquidJS, which processes escape
// sequences (\n, \", \\) in string literals:
//
//  * In ordinary tags and outputs Ruby Liquid takes strings literally, so
//      {% assign o = '{"a":"x\ny"}' %}
//    keeps a backslash and an "n" (the site passes JSON around this way).
//  * Jekyll's `include` tag has its own parameter syntax (Jekyll::Tags::IncludeTag#parse_params):
//    inside "…" only \" is an escape, inside '…' only \'; everything else stays literal.
//      {% include figure-image.html title="\"Quoted\" title" options='{"a":"x\ny"}' %}
//
// Both are rewritten to the equivalent LiquidJS literals before parsing.

const STRING = String.raw`"[^"]*"|'[^']*'`;
const RAW_BLOCK = String.raw`\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\}`;
// Ruby Liquid and LiquidJS both end a tag at the first closing delimiter, even inside a string
const TAG = String.raw`\{%-?[\s\S]*?%\}`;
const OUTPUT = String.raw`\{\{-?[\s\S]*?\}\}`;
const BLOCKS = new RegExp(`${RAW_BLOCK}|${TAG}|${OUTPUT}`, "g");
const STRINGS = new RegExp(STRING, "g");

// Jekyll::Tags::IncludeTag::VALID_SYNTAX, with backslash escapes inside the quotes
const INCLUDE_PARAM = /([\w-]+)(\s*=\s*)(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/gs;

const doubleBackslashes = (s) => s.replaceAll("\\", "\\\\");

/** Quote `value` as a LiquidJS literal that evaluates to exactly `value`. */
function literal(value, quote) {
  return quote + doubleBackslashes(value).replaceAll(quote, `\\${quote}`) + quote;
}

function rewriteInclude(tag) {
  return tag.replace(INCLUDE_PARAM, (_, name, equals, double, single) =>
    double !== undefined
      ? name + equals + literal(double.replaceAll('\\"', '"'), '"')
      : name + equals + literal(single.replaceAll("\\'", "'"), "'"),
  );
}

/** @param {string} source Liquid template text */
export function keepBackslashesInStrings(source) {
  if (!source.includes("\\")) return source;
  return source.replace(BLOCKS, (block) => {
    if (/^\{%-?\s*raw\b/.test(block)) return block;
    if (/^\{%-?\s*include\s/.test(block)) return rewriteInclude(block);
    return block.replace(STRINGS, doubleBackslashes);
  });
}
