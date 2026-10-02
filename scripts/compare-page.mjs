#!/usr/bin/env node
// Compare the local Eleventy build (_site/) with a Jekyll build of the same site.
//
//   node scripts/compare-page.mjs faq/ guide/hero/        diff individual pages
//   node scripts/compare-page.mjs --all                   compare every page, ranked summary
//   node scripts/compare-page.mjs --all --only=charas/    … restricted to URL paths with this prefix
//
// The reference is the folder `jekyll-site/` (a Jekyll CI build, e.g. the `jekyll-site` artifact of
// .github/workflows/jekyll.yml). `--live` fetches single pages from the deployed site instead.
//
// Other options:
//   --context=N   lines of context around each difference (default 2)
//   --full        print every hunk instead of the first 12
//   --refresh     with --live: re-download even if cached
//   --golden=DIR  reference folder (default jekyll-site)
//
// Documents are parsed and printed one node per line (attributes sorted, text whitespace
// collapsed), so formatting differences such as Jekyll's compress.html vs. our minifier don't show.
// Set COMPARE_DIR to choose where normalized copies are written (default: the OS temp dir).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import * as parse5 from "parse5";

const LIVE = "https://liveahero-wiki.github.io";
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith("--")).map((a) => {
    const [k, v] = a.slice(2).split("=");
    return [k, v ?? true];
  }),
);
// `faq/` works too: Git Bash rewrites a leading `/` into a Windows path.
const urls = args.filter((a) => !a.startsWith("--")).map((a) => (a.startsWith("/") ? a : `/${a}`));
const goldenDir = flags.golden ?? "jekyll-site";
const workDir = process.env.COMPARE_DIR ?? path.join(os.tmpdir(), "lah-wiki-compare");
fs.mkdirSync(path.join(workDir, "live"), { recursive: true });

if (!urls.length && !flags.all) {
  console.error("usage: node scripts/compare-page.mjs <url-path>… | --all   (see the header of this file)");
  process.exit(2);
}

const cacheName = (url) => url.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "index";

function candidates(root, url) {
  return url.endsWith("/")
    ? [path.join(root, url, "index.html")]
    : [path.join(root, url), path.join(root, url, "index.html")];
}

function readFrom(root, url) {
  for (const file of candidates(root, url)) if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  return null;
}

async function readReference(url) {
  if (!flags.live) {
    const html = readFrom(goldenDir, url);
    if (html === null) throw new Error(`not in ${goldenDir}/: ${url}`);
    return html;
  }
  const cached = path.join(workDir, "live", `${cacheName(url)}.html`);
  if (!flags.refresh && fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");
  const res = await fetch(LIVE + url);
  if (!res.ok) throw new Error(`${res.status} fetching ${LIVE + url}`);
  const text = await res.text();
  fs.writeFileSync(cached, text);
  return text;
}

// Whitespace is significant in these. Executable scripts and styles are not: the Jekyll build
// collapsed newlines inside them, and our minifier leaves them alone. JSON data scripts are
// compared exactly, because a real newline inside a JSON string breaks JSON.parse.
const isRawText = (node) =>
  node.nodeName === "pre" ||
  node.nodeName === "textarea" ||
  (node.nodeName === "script" && (node.attrs ?? []).some((a) => a.name === "type" && /json/i.test(a.value)));

// Differences that are intended and would otherwise show on every page:
// the HTML minifier normalizes the viewport meta, and the footer now credits Eleventy.
const INTENDED = [
  [/minimum-scale=1\.0/g, "minimum-scale=1"],
  [/Powered by <a href="https?:\/\/jekyllrb\.com\/?">Jekyll<\/a>/g, 'Powered by <a href="https://www.11ty.dev/">Eleventy</a>'],
];

function normalize(html) {
  for (const [pattern, replacement] of INTENDED) html = html.replace(pattern, replacement);
  const doc = parse5.parse(html);
  const lines = [];
  const walk = (node, depth, raw) => {
    const indent = "  ".repeat(depth);
    switch (node.nodeName) {
      case "#text": {
        const text = raw ? node.value : node.value.replace(/\s+/g, " ").trim();
        if (text) lines.push(`${indent}"${text}"`);
        return;
      }
      case "#comment":
        lines.push(`${indent}<!--${node.data.replace(/\s+/g, " ").trim()}-->`);
        return;
      case "#documentType":
        lines.push("<!doctype>");
        return;
      default:
    }
    const attrs = (node.attrs ?? [])
      .map((a) => `${a.name}="${a.value.replace(/\s+/g, " ").trim()}"`)
      .sort()
      .join(" ");
    lines.push(`${indent}<${node.nodeName}${attrs ? " " + attrs : ""}>`);
    const childRaw = raw || isRawText(node);
    for (const child of node.childNodes ?? []) walk(child, depth + 1, childRaw);
    if (node.content) for (const child of node.content.childNodes) walk(child, depth + 1, childRaw);
  };
  for (const child of doc.childNodes) walk(child, 0, false);
  return lines.join("\n") + "\n";
}

/** Unified diff of two normalized documents, as an array of hunks. */
function diffHunks(reference, local, base) {
  const refFile = path.join(workDir, `${base}.reference.txt`);
  const localFile = path.join(workDir, `${base}.local.txt`);
  fs.writeFileSync(refFile, reference);
  fs.writeFileSync(localFile, local);
  const out = spawnSync(
    "git",
    ["diff", "--no-index", "--no-color", `-U${flags.context ?? 2}`, refFile, localFile],
    { encoding: "utf8", maxBuffer: 1 << 28 },
  ).stdout;
  return { hunks: out.split(/^(?=@@ )/m).slice(1), refFile };
}

async function comparePage(url) {
  const reference = normalize(await readReference(url));
  const localHtml = readFrom("_site", url);
  if (localHtml === null) throw new Error(`not built: ${url}`);
  const local = normalize(localHtml);
  if (reference === local) return { url, identical: true, nodes: reference.split("\n").length - 1 };
  return { url, ...diffHunks(reference, local, cacheName(url)) };
}

function printPage(r) {
  if (r.identical) {
    console.log(`\n=== ${r.url}\n  identical (${r.nodes} nodes)`);
    return;
  }
  console.log(`\n=== ${r.url}\n  ${r.hunks.length} differing hunk(s)   (- reference, + local)   ${r.refFile}`);
  const shown = flags.full ? r.hunks : r.hunks.slice(0, 12);
  for (const h of shown) {
    console.log(h.trimEnd().split("\n").map((l) => (l.length > 240 ? l.slice(0, 240) + "…" : l)).join("\n"));
  }
  if (shown.length < r.hunks.length) console.log(`  … ${r.hunks.length - shown.length} more hunk(s), use --full`);
}

function listReferencePages() {
  const pages = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(path.join(goldenDir, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (!["pagefind", "zzz", "assets", "cdn"].includes(ent.name)) walk(rel);
      } else if (ent.name.endsWith(".html")) {
        pages.push(ent.name === "index.html" ? `/${dir ? dir + "/" : ""}` : `/${rel}`);
      }
    }
  };
  walk("");
  return pages.sort();
}

/** Group differing lines so recurring problems stand out: digits and quoted strings are masked. */
function signature(line) {
  return line
    .replace(/^[-+]\s*/, (m) => m[0])
    .replace(/"[^"]{25,}"/g, '"…"')
    .replace(/\d+/g, "N")
    .trim()
    .slice(0, 150);
}

async function compareAll() {
  const pages = listReferencePages().filter((u) => !flags.only || u.startsWith(`/${flags.only.replace(/^\//, "")}`));
  const results = [];
  const missing = [];
  for (const url of pages) {
    try {
      results.push(await comparePage(url));
    } catch (err) {
      missing.push(`${url}  (${err.message})`);
    }
  }
  const different = results.filter((r) => !r.identical);
  const signatures = new Map();
  for (const r of different) {
    const seen = new Set();
    for (const h of r.hunks) {
      for (const line of h.split("\n").slice(1)) {
        if (!/^[-+][^-+]/.test(line) && !/^[-+]$/.test(line)) continue;
        const sig = signature(line);
        if (seen.has(sig)) continue;
        seen.add(sig);
        const entry = signatures.get(sig) ?? { pages: 0, example: r.url };
        entry.pages++;
        signatures.set(sig, entry);
      }
    }
  }

  console.log(`reference pages: ${pages.length}   identical: ${results.length - different.length}   different: ${different.length}   missing locally: ${missing.length}`);
  if (missing.length) {
    console.log("\nmissing / unreadable:");
    for (const m of missing.slice(0, 40)) console.log("  " + m);
    if (missing.length > 40) console.log(`  … ${missing.length - 40} more`);
  }
  console.log("\npages by number of differing hunks:");
  for (const r of different.sort((a, b) => b.hunks.length - a.hunks.length).slice(0, 40)) {
    console.log(`  ${String(r.hunks.length).padStart(5)}  ${r.url}`);
  }
  if (different.length > 40) console.log(`  … ${different.length - 40} more pages`);
  console.log("\nmost common differing lines (pages affected; - reference, + local):");
  const top = [...signatures].sort((a, b) => b[1].pages - a[1].pages).slice(0, 40);
  for (const [sig, { pages: n, example }] of top) {
    console.log(`  ${String(n).padStart(4)}  ${sig}    e.g. ${example}`);
  }
  fs.writeFileSync(
    path.join(workDir, "compare-all.json"),
    JSON.stringify({ different: different.map((r) => ({ url: r.url, hunks: r.hunks.length })), missing }, null, 1),
  );
}

if (flags.all) {
  await compareAll();
} else {
  let failed = 0;
  for (const url of urls) {
    try {
      const r = await comparePage(url);
      printPage(r);
      if (!r.identical) failed++;
    } catch (err) {
      console.log(`\n=== ${url}\n  ERROR ${err.message}`);
      failed++;
    }
  }
  process.exit(failed ? 1 : 0);
}
