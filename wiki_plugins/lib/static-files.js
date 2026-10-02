// Jekyll only renders files that start with a front matter block (`---`); every other file is
// copied as is. Eleventy would template every .html/.md/.liquid file, so find the ones Jekyll
// treated as static (survey/2026.html, misc/survey-2025/*.html, the Google verification file, …).

import fs from "node:fs";
import path from "node:path";

const TEMPLATE_EXTENSIONS = new Set([".html", ".md", ".liquid"]);

// Never scanned: not part of the site.
const SKIP_DIRS = new Set([
  "node_modules",
  "cdn",
  "zzz",
  "web",
  "tools",
  "docs",
  "deploy",
  "scripts",
  "wiki_plugins",
  "jekyll-site",
  "assets",
]);
// Underscore folders that hold pages.
const PAGE_DIRS = new Set(["_charas", "_events", "_main_quests", "_statuses", "_posts"]);

/** @returns {string[]} project-relative, forward-slash paths */
export function findStaticTemplateFiles(root = ".", excludeFiles = new Set()) {
  const found = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = dir ? `${dir}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        const hidden = ent.name.startsWith(".") || (ent.name.startsWith("_") && !PAGE_DIRS.has(ent.name));
        if (!hidden && !SKIP_DIRS.has(ent.name) && !ent.name.startsWith("_site")) walk(rel);
      } else if (TEMPLATE_EXTENSIONS.has(path.extname(ent.name).toLowerCase()) && !excludeFiles.has(rel)) {
        if (!hasFrontMatter(path.join(root, rel))) found.push(rel);
      }
    }
  };
  walk("");
  return found;
}

function hasFrontMatter(file) {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(5);
    const n = fs.readSync(fd, buf, 0, 5, 0);
    return buf.toString("utf8", 0, n).replace(/^﻿/, "").startsWith("---");
  } finally {
    fs.closeSync(fd);
  }
}
