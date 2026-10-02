// Small kramdown behaviours that CommonMark parsers do differently.

/**
 * kramdown: a single backtick with whitespace on both sides is literal text, not a code span
 * ("add a ` open` in the …" renders the backticks). Wraps markdown-it's `backticks` rule.
 */
function loneBacktick(md) {
  const rule = md.inline.ruler.__rules__.find((r) => r.name === "backticks");
  const original = rule.fn;
  md.inline.ruler.at("backticks", (state, silent) => {
    const src = state.src;
    const pos = state.pos;
    if (
      src.charCodeAt(pos) === 0x60 &&
      src.charCodeAt(pos + 1) !== 0x60 &&
      pos > 0 &&
      /\s/.test(src[pos - 1]) &&
      /\s/.test(src[pos + 1] ?? "")
    ) {
      if (!silent) state.pending += "`";
      state.pos++;
      return true;
    }
    return original(state, silent);
  });
}

/**
 * Tables, the kramdown way:
 *  - `+` is accepted as a column junction in the separator row (`|---+---|`, `|-+-+-|`);
 *  - a table needs no header: a run of `| a | b |` rows without a separator row is a table body.
 * markdown-it needs a header and separator row, so header-less runs get a placeholder header,
 * which is dropped again after parsing. Fenced code is left alone.
 */
function tables(md) {
  const SEPARATOR = /^[ \t]*\|?[ \t:+-]*-[ \t:+|-]*$/;
  const ROW = /^ {0,3}\|/;
  const PLACEHOLDER = "@kramdown-no-header";

  const cellCount = (line) => {
    const body = line.trim().replace(/^\|/, "").replace(/(?<!\\)\|$/, "");
    return body.split(/(?<!\\)\|/).length;
  };

  md.core.ruler.before("block", "kramdown_tables", (state) => {
    const lines = state.src.split("\n");
    const out = [];
    let fence = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (marker) {
        if (!fence) fence = marker[1][0];
        else if (fence === marker[1][0]) fence = null;
        out.push(line);
        continue;
      }
      if (fence) {
        out.push(line);
        continue;
      }

      // separator row written with "+": turn the junctions into pipes
      if (i > 0 && line.includes("+") && SEPARATOR.test(line) && lines[i - 1].includes("|")) {
        out.push(line.replace(/\+/g, "|"));
        continue;
      }

      // first row of a run of table rows that has no separator row below it
      const startsRun = ROW.test(line) && (i === 0 || !ROW.test(lines[i - 1]));
      const afterBlank = i === 0 || lines[i - 1].trim() === "";
      if (startsRun && afterBlank) {
        const next = lines[i + 1];
        const hasSeparator = next !== undefined && next.includes("-") && SEPARATOR.test(next);
        if (!hasSeparator) {
          const n = cellCount(line);
          out.push(`|${Array(n).fill(` ${PLACEHOLDER} `).join("|")}|`, `|${Array(n).fill("---").join("|")}|`);
        }
      }
      out.push(line);
    }
    state.src = out.join("\n");
  });

  md.core.ruler.after("block", "kramdown_table_no_header", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "thead_open") continue;
      const cell = tokens[i + 3]; // thead_open, tr_open, th_open, inline
      if (cell?.type !== "inline" || cell.content.trim() !== PLACEHOLDER) continue;
      let j = i;
      while (tokens[j].type !== "thead_close") j++;
      tokens.splice(i, j - i + 1);
      i--;
    }
  });
}

/**
 * kramdown (GFM) takes any non-blank line after a list item as part of that item, and a list
 * marker then starts a nested list however little it is indented:
 *
 *   1. Parent
 *     * Child        <- 2 spaces: nested in kramdown, a new top-level list in CommonMark
 *
 * Move such markers to the parent's content column so CommonMark nests them too.
 */
function lazyNestedLists(md) {
  const MARKER = /^( *)([*+-]|\d{1,9}\.)( +|$)/;
  md.core.ruler.before("block", "kramdown_lazy_nested_lists", (state) => {
    const lines = state.src.split("\n");
    let fence = null;
    let afterBlank = true;
    /** @type {Array<{ markerIndent: number, contentOffset: number }>} */
    let stack = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const fenceMarker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (fenceMarker) {
        if (!fence) fence = fenceMarker[1][0];
        else if (fence === fenceMarker[1][0]) fence = null;
        afterBlank = false;
        continue;
      }
      if (fence) continue;
      if (line.trim() === "") {
        afterBlank = true;
        continue;
      }

      const indent = line.length - line.trimStart().length;
      const marker = MARKER.exec(line);
      if (marker) {
        while (stack.length && stack[stack.length - 1].markerIndent >= indent) stack.pop();
        const parent = stack[stack.length - 1];
        let at = indent;
        if (parent && !afterBlank && indent < parent.contentOffset) {
          lines[i] = " ".repeat(parent.contentOffset) + line.trimStart();
          at = parent.contentOffset;
        }
        const gap = marker[3].length;
        stack.push({ markerIndent: at, contentOffset: at + marker[2].length + (gap >= 1 && gap <= 4 ? gap : 1) });
      } else if (afterBlank) {
        // a paragraph after a blank line that is not indented into the item ends the list
        while (stack.length && indent < stack[stack.length - 1].contentOffset) stack.pop();
      }
      afterBlank = false;
    }
    state.src = lines.join("\n");
  });
}

/**
 * Which list items wrap their first paragraph in <p>. CommonMark makes the whole list loose if
 * any items are separated by a blank line; kramdown decides per item (parser/kramdown/list.rb,
 * the `transparent` logic): the first paragraph keeps its <p> only if a blank line follows it
 * inside the item (or, for a lone paragraph, before the next item). A "last item" clause keeps
 * a list consistent: if every earlier item is loose, the last one is too.
 */
function listTightness(md) {
  md.core.ruler.after("block", "kramdown_list_tightness", (state) => {
    const tokens = state.tokens;
    /** @type {Array<{ items: Array<{ open: number, close: number }> }>} */
    const lists = [];
    const stack = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === "bullet_list_open" || t.type === "ordered_list_open") {
        const list = { items: [] };
        stack.push(list);
        lists.push(list);
      } else if (t.type === "bullet_list_close" || t.type === "ordered_list_close") {
        stack.pop();
      } else if (t.type === "list_item_open") {
        stack[stack.length - 1].items.push({ open: i, close: -1 });
      } else if (t.type === "list_item_close") {
        const items = stack[stack.length - 1].items;
        items[items.length - 1].close = i;
      }
    }

    for (const list of lists) {
      const infos = list.items.map((item, n) => {
        const level = tokens[item.open].level + 1;
        let p = -1;
        for (let i = item.open + 1; i < item.close; i++) {
          if (tokens[i].level === level && tokens[i].nesting === 1) {
            if (tokens[i].type === "paragraph_open") p = i;
            break;
          }
        }
        if (p < 0) return null; // item does not start with a paragraph

        const paragraphEnd = tokens[p].map[1];
        let nextStart = null;
        for (let i = p + 1; i < item.close; i++) {
          if (tokens[i].level === level && tokens[i].nesting === 1) {
            nextStart = tokens[i].map?.[0] ?? null;
            break;
          }
        }
        const next = list.items[n + 1];
        if (nextStart === null && next) nextStart = tokens[next.open].map[0];
        return { p, loose: nextStart !== null && nextStart > paragraphEnd };
      });

      const last = infos.length - 1;
      if (last > 0 && infos[last] && infos.slice(0, last).every((info) => info?.loose)) infos[last].loose = true;

      for (const info of infos) {
        if (!info) continue;
        tokens[info.p].hidden = !info.loose;
        // the matching paragraph_close
        let depth = 0;
        for (let i = info.p; i < tokens.length; i++) {
          depth += tokens[i].nesting;
          if (depth === 0) {
            tokens[i].hidden = !info.loose;
            break;
          }
        }
      }
    }
  });
}

export default function kramdownQuirks(md) {
  loneBacktick(md);
  tables(md);
  lazyNestedLists(md);
  listTightness(md);
}
