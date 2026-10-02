// Heading ids, header links and `{:toc}` tables of contents, matching Jekyll's kramdown output:
//
//   <h2 id="quest-details"><a href="#quest-details"></a>Quest Details</h2>
//
//   <ul id="markdown-toc">
//     <li><a href="#quest-details" id="markdown-toc-quest-details">Quest Details</a></li>
//   </ul>
//
// `_sass/_main2.scss` styles the empty <a> inside h1[id]…h4[id] and `#markdown-toc`.

import { gfmHeaderId, rawText } from "./kramdown-id.js";

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** kramdown's generate_toc_tree: nest entries by heading level using a stack. */
function buildTree(entries) {
  const root = [];
  const stack = [];
  for (const entry of entries) {
    const node = { entry, children: [] };
    for (;;) {
      if (!stack.length) {
        root.push(node);
        stack.push(node);
        break;
      }
      const top = stack[stack.length - 1];
      if (top.entry.level < entry.level) {
        top.children.push(node);
        stack.push(node);
        break;
      }
      stack.pop();
    }
  }
  return root;
}

function renderToc(md, state, listToken) {
  const entries = (state.env.kramdownHeadings ?? []).filter((e) => !e.noToc);
  if (!entries.length) return "";

  const tag = listToken.tag;
  const listId = listToken.attrGet("id") ?? "markdown-toc";
  const extraAttrs = (listToken.attrs ?? [])
    .filter(([name]) => name !== "id")
    .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
    .join("");

  const inline = (children) => {
    // links are unwrapped and footnote markers dropped inside TOC entries
    const kept = children.filter((t) => t.type !== "link_open" && t.type !== "link_close" && t.type !== "footnote_ref");
    return md.renderer.renderInline(kept, md.options, state.env);
  };

  const list = (nodes, attrs, pad) =>
    `${pad}<${tag}${attrs}>\n${nodes.map((n) => item(n, pad + "  ")).join("")}${pad}</${tag}>\n`;

  const item = (node, pad) => {
    const { id, children } = node.entry;
    const a = `<a href="#${escapeAttr(id)}" id="${escapeAttr(listId)}-${escapeAttr(id)}">${inline(children)}</a>`;
    if (!node.children.length) return `${pad}<li>${a}</li>\n`;
    return `${pad}<li>${a}\n${list(node.children, "", pad + "  ")}${pad}</li>\n`;
  };

  return list(buildTree(entries), ` id="${escapeAttr(listId)}"${extraAttrs}`, "");
}

export default function kramdownHeadings(md, { headerLinks = true } = {}) {
  md.core.ruler.after("kramdown_typography", "kramdown_headings", (state) => {
    const counters = new Map();
    const entries = [];
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const open = tokens[i];
      if (open.type !== "heading_open") continue;
      const inline = tokens[i + 1];
      let id = open.attrGet("id");
      if (id === null) {
        id = gfmHeaderId(rawText(inline.children), counters);
        open.attrSet("id", id);
      }
      entries.push({
        level: Number(open.tag.slice(1)),
        id,
        children: inline.children.slice(),
        noToc: (open.attrGet("class") ?? "").split(/\s+/).includes("no_toc"),
      });
      if (headerLinks && id.length) {
        const a = new state.Token("link_open", "a", 1);
        a.attrs = [["href", `#${id}`]];
        inline.children.unshift(a, new state.Token("link_close", "a", -1));
      }
    }
    state.env.kramdownHeadings = entries;
  });

  md.core.ruler.after("kramdown_headings", "kramdown_toc", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type !== "bullet_list_open" && t.type !== "ordered_list_open") continue;
      if (!t.meta?.refs?.includes("toc")) continue;
      let depth = 0;
      let j = i;
      for (; j < tokens.length; j++) {
        depth += tokens[j].nesting;
        if (depth === 0) break;
      }
      const block = new state.Token("html_block", "", 0);
      block.block = true;
      block.content = renderToc(md, state, t);
      tokens.splice(i, j - i + 1, block);
    }
  });
}
