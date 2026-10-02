// Header ids as kramdown-parser-gfm generates them (Jekyll's default `input: GFM`):
//   downcase, drop everything except word characters, "-", space and tab, then space/tab -> "-";
//   repeated ids get "-1", "-2", … appended.
// Reference: kramdown-parser-gfm/lib/kramdown/parser/gfm.rb#generate_gfm_header_id

const NON_WORD = /[^\p{L}\p{M}\p{Nd}\p{Pc}\- \t]/gu;

/**
 * @param {string} rawText the header's plain text (after smart quotes)
 * @param {Map<string, number>} counters per-document duplicate counters
 */
export function gfmHeaderId(rawText, counters) {
  let id = rawText.toLowerCase().replace(NON_WORD, "").replace(/[ \t]/g, "-");
  const n = (counters.get(id) ?? -1) + 1;
  counters.set(id, n);
  if (n > 0) id += `-${n}`;
  return id;
}

/**
 * The text kramdown uses for id generation: text, code and entities, recursing through
 * emphasis/links; images contribute nothing.
 * @param {import("markdown-it").Token[]} children inline children
 */
export function rawText(children) {
  let out = "";
  for (const t of children) {
    if (t.type === "text" || t.type === "text_special" || t.type === "code_inline") out += t.content;
    else if (t.type === "softbreak" || t.type === "hardbreak") out += "\n";
  }
  return out;
}
