// Output details where markdown-it's markup differs from kramdown's.

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** @param {import("markdown-it").default} md */
export default function kramdownRenderer(md) {
  const rules = md.renderer.rules;

  // Footnotes in kramdown's markup (markdown-it-footnote emits different ids and classes).
  const name = (meta) => escapeHtml(String(meta.label ?? meta.id + 1));
  rules.footnote_ref = (tokens, idx) => {
    const meta = tokens[idx].meta;
    const repeat = meta.subId > 0 ? `:${meta.subId}` : "";
    return (
      `<sup id="fnref:${name(meta)}${repeat}">` +
      `<a href="#fn:${name(meta)}" class="footnote" rel="footnote" role="doc-noteref">${meta.id + 1}</a></sup>`
    );
  };
  rules.footnote_block_open = () => '<div class="footnotes" role="doc-endnotes">\n<ol>\n';
  rules.footnote_block_close = () => "</ol>\n</div>\n";
  rules.footnote_open = (tokens, idx) => `<li id="fn:${name(tokens[idx].meta)}">\n`;
  rules.footnote_close = () => "</li>\n";
  rules.footnote_anchor = (tokens, idx) => {
    const meta = tokens[idx].meta;
    const repeat = meta.subId > 0 ? `:${meta.subId}` : "";
    const link = `<a href="#fnref:${name(meta)}${repeat}" class="reversefootnote" role="doc-backlink">&#8617;</a>`;
    // Inside the last paragraph the link follows a space; after any other block (a table, …)
    // kramdown gives it a paragraph of its own.
    return tokens[idx + 1]?.type === "paragraph_close" ? ` ${link}` : `<p>${link}</p>\n`;
  };

  // Jekyll's rouge integration marks up code (without tokenizing plain text).
  rules.code_inline = (tokens, idx) =>
    `<code class="language-plaintext highlighter-rouge">${escapeHtml(tokens[idx].content)}</code>`;
  rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const lang = token.info.trim().split(/\s+/)[0] || "plaintext";
    return (
      `<div class="language-${escapeHtml(lang)} highlighter-rouge"><div class="highlight">` +
      `<pre class="highlight"><code>${escapeHtml(token.content)}</code></pre></div></div>\n`
    );
  };
}
