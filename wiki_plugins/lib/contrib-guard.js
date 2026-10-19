// The contributor-edit guard (docs/CONTRIBUTOR_EDITING.md, "The guard").
//
// Contributors edit the *body* of a page. Page bodies contain Liquid templates and HTML, so instead of
// banning `{%` the guard compares the body before and after the edit:
//
//   * Tokens are every `{% ... %}`, `{{ ... }}`, `{% raw %}...{% endraw %}` block (one token) and every
//     kramdown `{: ... }` / `{:: ... }`.
//   * FREE tokens may be added, edited and removed: `{% chara_link Name %}` / `{% chara_link Name|h1 %}`
//     and `{% include <file>.html key=value ... %}` with an allowed file and literal parameters only.
//   * Every other token is PROTECTED: the ordered sequence of protected tokens must be identical.
//   * New HTML may only be <details>, <summary>, <br> and the table family, with almost no attributes.
//
// This module has no dependencies and uses only standard JS plus WebCrypto, so the very same file runs
// in Node (CI: scripts/contrib-guard-ci.mjs, the Eleventy build) and in the browser editor bundle.

// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------

/** Files contributors may edit (one directory level, `*` = a file name). */
export const EDITABLE_PATHS = [
  "_charas/*.md",
  "_events/*.md",
  "_main_quests/*.md",
  "guide/*.md",
  "chara_quests.md",
  "mobs.md",
];

const FILE_NAME = "[A-Za-z0-9_][A-Za-z0-9_.-]*";
const EDITABLE_PATH_RES = EDITABLE_PATHS.map((pattern) => new RegExp(`^${pattern.replace(/\./g, "\\.").replace("*", FILE_NAME)}$`));

/** True for a repository-relative, forward-slash path that contributors may edit. */
export function isEditablePath(path) {
  if (typeof path !== "string" || path.includes("..") || path.includes("\\") || path.startsWith("/")) return false;
  return EDITABLE_PATH_RES.some((re) => re.test(path));
}

// ---------------------------------------------------------------------------------------------
// Front matter and blob SHA
// ---------------------------------------------------------------------------------------------

const FRONT_MATTER = /^---[ \t]*\r?\n(?:[\s\S]*?\r?\n)?---[ \t]*(?:\r?\n|$)/;

/**
 * Splits a page into its front matter (with the `---` fences and the trailing newline; "" when there is
 * none) and its body. `frontMatter + body === text`. Handles CRLF and LF.
 * @returns {{ frontMatter: string, body: string }}
 */
export function splitFrontMatter(text) {
  const m = FRONT_MATTER.exec(text);
  if (!m) return { frontMatter: "", body: text };
  return { frontMatter: m[0], body: text.slice(m[0].length) };
}

/** The git blob id of a file's text: sha1("blob " + <utf-8 byte length> + "\0" + <utf-8 bytes>), as hex. */
export async function gitBlobSha(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const head = encoder.encode(`blob ${bytes.length}\0`);
  const all = new Uint8Array(head.length + bytes.length);
  all.set(head, 0);
  all.set(bytes, head.length);
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-1", all));
  let hex = "";
  for (const byte of digest) hex += byte.toString(16).padStart(2, "0");
  return hex;
}

// ---------------------------------------------------------------------------------------------
// Includes
// ---------------------------------------------------------------------------------------------

/**
 * Includes that stay protected: structural or page-chrome includes, and the ones that read page data.
 * Patterns are matched against the path inside `_includes/`; `*` matches within one path segment.
 * `quest-group`, `shop-table`, `skill-table-manual` and `apache-chart` are deliberately NOT listed.
 */
export const INCLUDE_DENYLIST = [
  // page chrome
  "header.html",
  "footer.html",
  "banner.html",
  "pagefind-search.html",
  "skill-lang-picker.html",
  "wiki-msg.html",
  "js/*",
  "style/*",
  // chara page structure
  "voice-table.html",
  "bio-infobox.html",
  "hero-infobox*",
  "sidekick-infobox.html",
  "hero-skill-evolution-v2.html",
  "card-*",
  "chara-affiliation.html",
  "chara-illustrator.html",
  "chara-voice-actor.html",
  "team-creator-link.html",
  // generated pieces that other templates fill in
  "quest-infobox.html",
  "skill-description.html",
  "skill-table-v2.html",
];

const globToRegExp = (glob) => new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
const INCLUDE_DENY_RES = INCLUDE_DENYLIST.map(globToRegExp);

/** True when the include path (relative to `_includes/`) is on the denylist. */
export function isIncludeDenied(file) {
  return INCLUDE_DENY_RES.some((re) => re.test(file));
}

/**
 * The contributor include list from the paths found under `_includes/` (e.g. `item.html`, `js/theme.js`):
 * top-level `*.html` files that are not denied, sorted.
 */
export function contributorIncludes(paths) {
  return paths.filter((p) => /^[^/\\]+\.html$/.test(p) && !isIncludeDenied(p)).sort();
}

// ---------------------------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------------------------

const RAW_OPEN = /\{%-?\s*raw\s*-?%\}/y;
const RAW_CLOSE = /\{%-?\s*endraw\s*-?%\}/g;
const QUOTE_CONTEXT = /[\s=([,:]/;

/**
 * Index just past the first `closer` at or after `from`, or -1. Quoted strings are skipped, so
 * `{{ "}}" }}` is one token. A quote only opens a string after whitespace, `=`, `(`, `[`, `,` or `:` and
 * when it closes on the same line, so an apostrophe in `{% chara_link O'Brien %}` is just a letter.
 */
function findClose(s, from, closer, singleLine = false) {
  const n = s.length;
  for (let k = from; k < n; k++) {
    const ch = s[k];
    if (singleLine && ch === "\n") return -1;
    if (ch === '"' || ch === "'") {
      const prev = k === from ? " " : s[k - 1];
      if (QUOTE_CONTEXT.test(prev)) {
        let e = k + 1;
        while (e < n && s[e] !== ch && s[e] !== "\n") e++;
        if (e < n && s[e] === ch) {
          k = e;
          continue;
        }
      }
    } else if (ch === closer[0] && s.startsWith(closer, k)) {
      return k + closer.length;
    }
  }
  return -1;
}

/**
 * Splits a page body into its template tokens.
 * @returns {Array<{ type: "tag" | "output" | "raw" | "kramdown", text: string, start: number, end: number, name?: string, unclosed?: boolean }>}
 *   `unclosed` marks a lone `{%` / `{{` without its end, or a `{% raw %}` without `{% endraw %}` (the token then runs to the end).
 */
export function tokenize(body) {
  const tokens = [];
  const n = body.length;
  let i = 0;
  for (;;) {
    const at = body.indexOf("{", i);
    if (at < 0 || at + 1 >= n) break;
    const c = body[at + 1];
    let type;
    let end;
    let unclosed = false;
    if (c === "%") {
      RAW_OPEN.lastIndex = at;
      const open = RAW_OPEN.exec(body);
      if (open) {
        type = "raw";
        RAW_CLOSE.lastIndex = at + open[0].length;
        const close = RAW_CLOSE.exec(body);
        if (close) end = close.index + close[0].length;
        else {
          end = n;
          unclosed = true;
        }
      } else {
        type = "tag";
        end = findClose(body, at + 2, "%}");
      }
    } else if (c === "{") {
      type = "output";
      end = findClose(body, at + 2, "}}");
    } else if (c === ":") {
      type = "kramdown";
      end = findClose(body, at + 2, "}", true);
      if (end < 0) {
        i = at + 2; // a stray "{:" is plain text
        continue;
      }
    } else {
      i = at + 1;
      continue;
    }
    if (end < 0) {
      // `{%` / `{{` that never ends: Liquid would fail to parse the page
      end = at + 2;
      unclosed = true;
    }
    const token = { type, text: body.slice(at, end), start: at, end };
    if (unclosed) token.unclosed = true;
    if (type === "tag") {
      const name = /^\{%-?\s*([A-Za-z_][\w]*)/.exec(token.text);
      if (name) token.name = name[1];
    } else if (type === "raw") {
      token.name = "raw";
    }
    tokens.push(token);
    i = end;
  }
  return tokens;
}

const CHARA_LINK = /^chara_link\s+([^|<>{}%"`\\\r\n]+?)(\|[hs]\d{0,2})?\s*$/;
const INCLUDE_FILE = /^include\s+(\S+)/;
const PARAM_KEY = /([A-Za-z_][A-Za-z0-9_-]*)=/y;
const PARAM_NUMBER = /-?\d+(?:\.\d+)?(?=\s|$)/y;
// Any other bare word is a Liquid variable lookup (`id=page`), so only the literals are allowed.
const PARAM_BARE = /(?:true|false|nil)(?=\s|$)/y;
// Quoted text may not contain quotes, `\`, `<`, `>`, `{`, `}`, `|`, `;`, backticks, `$` or line breaks,
// because includes print parameters into attributes, CSS and JSON.
const PARAM_QUOTED = /"[^"'\\<>{}|;`$\r\n]*"(?=\s|$)|'[^"'\\<>{}|;`$\r\n]*'(?=\s|$)/y;
const PARAM_WS = /\s*/y;
const FORBIDDEN_PARAM = /^(?:style|on.*|srcdoc)$/i;

/** The inside of a `{% ... %}` tag, without the whitespace-control dashes. */
function tagInner(text) {
  let inner = text.slice(2, -2);
  if (inner.startsWith("-")) inner = inner.slice(1);
  if (inner.endsWith("-")) inner = inner.slice(0, -1);
  return inner.trim();
}

/**
 * Whether a token may be freely added, edited and removed.
 * @param {{ type: string, text: string, name?: string, unclosed?: boolean }} token
 * @param {Iterable<string>} [allowedIncludes] file names such as `item.html`
 * @returns {{ free: true } | { free: false, reason?: string }} `reason` is a sentence for a human editor
 */
export function classifyToken(token, allowedIncludes = []) {
  if (token.unclosed) return { free: false, reason: "It is not closed properly." };
  if (token.type !== "tag") return { free: false };
  const inner = tagInner(token.text);
  if (token.name === "chara_link") {
    if (CHARA_LINK.test(inner)) return { free: true };
    return { free: false, reason: "Write it as {% chara_link Name %} or {% chara_link Name|h1 %} (h or s, then a number)." };
  }
  if (token.name !== "include") return { free: false };

  const fileMatch = INCLUDE_FILE.exec(inner);
  const file = fileMatch ? fileMatch[1] : "";
  const allowed = allowedIncludes instanceof Set ? allowedIncludes : new Set(allowedIncludes);
  if (!/^[A-Za-z0-9_-]+\.html$/.test(file) || !allowed.has(file)) {
    return { free: false, reason: `The include "${file}" is not one contributors may use.` };
  }
  const rest = inner.slice(fileMatch[0].length);
  let pos = 0;
  for (;;) {
    PARAM_WS.lastIndex = pos;
    pos += PARAM_WS.exec(rest)[0].length;
    if (pos >= rest.length) return { free: true };
    PARAM_KEY.lastIndex = pos;
    const key = PARAM_KEY.exec(rest);
    if (!key) return { free: false, reason: "Include parameters must look like name=value." };
    if (FORBIDDEN_PARAM.test(key[1])) return { free: false, reason: `The include parameter "${key[1]}" is not allowed.` };
    pos += key[0].length;
    let matched = false;
    for (const re of [PARAM_NUMBER, PARAM_QUOTED, PARAM_BARE]) {
      re.lastIndex = pos;
      const value = re.exec(rest);
      if (value) {
        pos += value[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      return {
        free: false,
        reason: `The value of "${key[1]}" must be a plain number, true, false, nil or quoted text (no filters or variables; no quotes, <, >, {, }, | or ; inside).`,
      };
    }
  }
}

// ---------------------------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------------------------

export const TABLE_TAGS = ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col"];
/** The only tags a contributor can introduce. `details` takes only `open`, table tags only `ALLOWED_TABLE_ATTRS`. */
export const ALLOWED_NEW_TAGS = ["details", "summary", "br", ...TABLE_TAGS];
export const ALLOWED_TABLE_ATTRS = ["colspan", "rowspan", "align"];

const TABLE_ATTR_VALUES = {
  colspan: /^\d{1,3}$/,
  rowspan: /^\d{1,3}$/,
  align: /^(?:left|right|center|justify)$/i,
};
const AUTOLINK = /<https?:\/\/[^\s<>]*>/y;
const ATTR = /\s*([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y;

/**
 * The opening tags, comments and declarations of a text. Closing tags are skipped (they cannot do
 * anything alone) and so are `<https://...>` autolinks.
 * @returns {Array<{ kind: "tag" | "comment" | "declaration", name: string, attrs: string, key: string, text: string }>}
 */
export function scanHtml(body) {
  const found = [];
  const n = body.length;
  let i = 0;
  for (;;) {
    i = body.indexOf("<", i);
    if (i < 0 || i + 1 >= n) break;
    if (body.startsWith("<!--", i)) {
      const close = body.indexOf("-->", i + 4);
      const end = close < 0 ? n : close + 3;
      const text = body.slice(i, end);
      found.push({ kind: "comment", name: "!--", attrs: "", key: text, text });
      i = end;
      continue;
    }
    const next = body[i + 1];
    if (next === "/") {
      i += 2;
    } else if (next === "!" || next === "?") {
      const close = body.indexOf(">", i);
      const end = close < 0 ? n : close + 1;
      const text = body.slice(i, end);
      found.push({ kind: "declaration", name: next, attrs: "", key: text, text });
      i = end;
    } else if (/[A-Za-z]/.test(next)) {
      AUTOLINK.lastIndex = i;
      const link = AUTOLINK.exec(body);
      if (link) {
        i += link[0].length;
        continue;
      }
      const name = /^[A-Za-z][A-Za-z0-9:_.-]*/.exec(body.slice(i + 1, i + 80))[0];
      let j = i + 1 + name.length;
      let quote = null;
      let end = -1;
      for (; j < n; j++) {
        const ch = body[j];
        if (quote) {
          if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'") {
          let p = j - 1;
          while (p > i && /\s/.test(body[p])) p--;
          if (body[p] === "=") quote = ch;
        } else if (ch === ">") {
          end = j;
          break;
        }
      }
      const closed = end >= 0;
      if (!closed) end = n; // unterminated: counts as a tag that runs to the end
      const attrs = body.slice(i + 1 + name.length, end).trim();
      const lower = name.toLowerCase();
      found.push({ kind: "tag", name: lower, attrs, key: `${lower} ${attrs}${closed ? "" : " <unterminated>"}`, text: body.slice(i, Math.min(end + 1, n)) });
      i = end + 1;
    } else {
      i += 1;
    }
  }
  return found;
}

/** Parses an attribute string. Returns null when something in it is not a plain attribute. */
function parseAttrs(attrs) {
  const list = [];
  let pos = 0;
  while (pos < attrs.length) {
    ATTR.lastIndex = pos;
    const m = ATTR.exec(attrs);
    if (!m) {
      if (/^\s*$/.test(attrs.slice(pos))) break;
      return null;
    }
    list.push({ name: m[1].toLowerCase(), value: m[2] ?? m[3] ?? m[4] ?? null });
    pos += m[0].length;
  }
  return list;
}

/** Why a NEW tag is not allowed, or null when it is. */
function newTagProblem(tag) {
  if (tag.kind === "comment") return "HTML comments cannot be added or edited. Remove the comment, or use GitHub.";
  if (tag.kind === "declaration") return "This kind of HTML declaration is not allowed.";
  const shown = `<${tag.name}>`;
  const attrs = tag.attrs.replace(/\/$/, "").trim();
  const unterminated = tag.key.endsWith("<unterminated>");
  if (unterminated) return `The new ${shown} tag is never closed with ">".`;
  if (!ALLOWED_NEW_TAGS.includes(tag.name)) {
    const risky = /(?:^|\s)on\w+\s*=|(?:^|\s)style\s*=|javascript:/i.test(tag.attrs);
    return `${shown} cannot be added (you may add <details>, <summary>, <br> and table tags)${risky ? "; event handlers, style and javascript: are never allowed" : ""}.`;
  }
  if (tag.name === "details") {
    return attrs === "" || /^open$/i.test(attrs) ? null : "<details> can only have the open attribute.";
  }
  if (tag.name === "summary" || tag.name === "br") {
    return attrs === "" ? null : `${shown} cannot have attributes.`;
  }
  const list = parseAttrs(attrs);
  if (!list) return `The attributes of the new ${shown} tag are not plain attributes.`;
  for (const { name, value } of list) {
    const re = TABLE_ATTR_VALUES[name];
    if (!re) return `${shown} cannot have the attribute "${name}" (only colspan, rowspan and align).`;
    if (value === null || !re.test(value)) return `The value of "${name}" on ${shown} must be simple (a number for colspan and rowspan, left/right/center for align).`;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------------------------

const normalizeEol = (s) => s.replace(/\r\n/g, "\n");

function excerpt(text, max = 60) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function describe(token) {
  switch (token.type) {
    case "tag":
      return token.name ? `{% ${token.name} %} tag` : "{% %} tag";
    case "output":
      return "{{ }} expression";
    case "raw":
      return "{% raw %} block";
    default:
      return "kramdown {: } attribute";
  }
}

const TEMPLATE_HINT = "Template code can only be changed by editing the file on GitHub.";

/** Ops of a minimal diff between two string arrays: [{ op: "keep" | "del" | "add" }] */
function diffOps(a, b) {
  let lo = 0;
  while (lo < a.length && lo < b.length && a[lo] === b[lo]) lo++;
  let hiA = a.length;
  let hiB = b.length;
  while (hiA > lo && hiB > lo && a[hiA - 1] === b[hiB - 1]) {
    hiA--;
    hiB--;
  }
  const ops = [];
  for (let k = 0; k < lo; k++) ops.push({ op: "keep" });
  const x = a.slice(lo, hiA);
  const y = b.slice(lo, hiB);
  if (x.length * y.length > 4_000_000) {
    x.forEach((_, k) => ops.push({ op: "del", index: lo + k }));
    y.forEach((_, k) => ops.push({ op: "add", index: lo + k }));
  } else {
    const w = y.length + 1;
    const table = new Uint32Array((x.length + 1) * w);
    for (let r = x.length - 1; r >= 0; r--) {
      for (let c = y.length - 1; c >= 0; c--) {
        table[r * w + c] = x[r] === y[c] ? table[(r + 1) * w + c + 1] + 1 : Math.max(table[(r + 1) * w + c], table[r * w + c + 1]);
      }
    }
    let r = 0;
    let c = 0;
    while (r < x.length || c < y.length) {
      if (r < x.length && c < y.length && x[r] === y[c]) {
        ops.push({ op: "keep" });
        r++;
        c++;
      } else if (c >= y.length || (r < x.length && table[(r + 1) * w + c] >= table[r * w + c + 1])) {
        ops.push({ op: "del", index: lo + r });
        r++;
      } else {
        ops.push({ op: "add", index: lo + c });
        c++;
      }
    }
  }
  for (let k = hiA; k < a.length; k++) ops.push({ op: "keep" });
  return ops;
}

function checkProtectedTokens(before, after, allowed, violations) {
  const a = before.map((t) => normalizeEol(t.text));
  const b = after.map((t) => normalizeEol(t.text));
  if (a.length === b.length && a.every((text, k) => text === b[k])) return;

  const ops = diffOps(a, b);
  // runs of deletions/additions between kept tokens
  const groups = [];
  let group = { del: [], add: [] };
  for (const o of ops) {
    if (o.op === "keep") {
      if (group.del.length || group.add.length) groups.push(group);
      group = { del: [], add: [] };
    } else group[o.op].push(o.index);
  }
  if (group.del.length || group.add.length) groups.push(group);

  // the same token deleted in one place and added in another was moved
  const added = new Map();
  for (const g of groups) for (const k of g.add) (added.get(b[k]) ?? added.set(b[k], []).get(b[k])).push({ g, k });
  for (const g of groups) {
    g.del = g.del.filter((k) => {
      const hit = added.get(a[k])?.shift();
      if (!hit) return true;
      hit.g.add = hit.g.add.filter((x) => x !== hit.k);
      const token = after[hit.k];
      violations.push({
        code: "protected-reordered",
        message: `This ${describe(token)} was moved or reordered: ${excerpt(token.text)}. ${TEMPLATE_HINT}`,
        token: excerpt(token.text, 120),
      });
      return false;
    });
  }

  for (const g of groups) {
    const pairs = Math.min(g.del.length, g.add.length);
    for (let k = 0; k < pairs; k++) {
      const was = before[g.del[k]];
      const now = after[g.add[k]];
      violations.push({
        code: "protected-changed",
        message: `This ${describe(was)} was changed: ${excerpt(was.text)} became ${excerpt(now.text)}. ${TEMPLATE_HINT}`,
        token: excerpt(was.text, 120),
      });
    }
    for (const k of g.del.slice(pairs)) {
      const token = before[k];
      violations.push({
        code: "protected-removed",
        message: `This ${describe(token)} was removed: ${excerpt(token.text)}. ${TEMPLATE_HINT}`,
        token: excerpt(token.text, 120),
      });
    }
    for (const k of g.add.slice(pairs)) {
      const token = after[k];
      const { reason } = classifyToken(token, allowed);
      violations.push({
        code: "protected-added",
        message: token.unclosed
          ? `A "${token.text}" was added that is never closed.`
          : `A new ${describe(token)} was added: ${excerpt(token.text)}. ${reason ?? TEMPLATE_HINT}`,
        token: excerpt(token.text, 120),
      });
    }
  }
}

function checkHtml(before, after, violations) {
  const counts = new Map();
  before = normalizeEol(before);
  after = normalizeEol(after);
  for (const tag of scanHtml(before)) counts.set(tag.key, (counts.get(tag.key) ?? 0) + 1);
  const reported = new Set();
  for (const tag of scanHtml(after)) {
    const left = counts.get(tag.key) ?? 0;
    if (left > 0) {
      counts.set(tag.key, left - 1);
      continue;
    }
    const problem = newTagProblem(tag);
    if (problem && !reported.has(tag.key)) {
      reported.add(tag.key);
      violations.push({ code: "html-not-allowed", message: `${problem} (${excerpt(tag.text)})`, token: excerpt(tag.text, 120) });
    }
  }
}

/**
 * Checks an edit of a page body.
 * @param {string} beforeBody the body of the page as it is now (front matter removed)
 * @param {string} afterBody the proposed body
 * @param {{ allowedIncludes?: Iterable<string> }} [options] include file names contributors may use (`/api/contrib-includes.json`)
 * @returns {{ ok: boolean, violations: Array<{ code: string, message: string, token?: string }> }}
 *   codes: protected-added, protected-removed, protected-changed, protected-reordered, html-not-allowed
 */
export function checkEdit(beforeBody, afterBody, { allowedIncludes = [] } = {}) {
  const allowed = new Set(allowedIncludes);
  const violations = [];
  const protectedOnly = (body) => tokenize(body).filter((t) => !classifyToken(t, allowed).free);

  checkProtectedTokens(protectedOnly(beforeBody), protectedOnly(afterBody), allowed, violations);
  checkHtml(beforeBody, afterBody, violations);
  return { ok: violations.length === 0, violations };
}
