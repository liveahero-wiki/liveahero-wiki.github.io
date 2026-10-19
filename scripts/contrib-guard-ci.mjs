#!/usr/bin/env node
// CI gate for contributor page edits (docs/CONTRIBUTOR_EDITING.md, "The guard").
//
//   node scripts/contrib-guard-ci.mjs --base <sha> --head <sha> [--repo <dir>]
//
// Run from a checkout of the BASE branch (.github/workflows/contrib-guard.yml). The pull request head is
// only ever read as data with `git show`; nothing from it is imported or executed, so a pull request
// cannot weaken its own check. The only dependency is wiki_plugins/lib/contrib-guard.js of this checkout.
//
// What a pull request may do: change (M) editable pages (isEditablePath) and nothing else. For every
// changed page the front matter must be byte-identical and checkEdit() must pass, with the include
// list computed from the BASE branch's _includes/. The page body is compared with the merge base, so a
// pull request that is behind the base branch is not blamed for unrelated changes.
//
// Exit code: 0 pass, 1 violations, 2 usage or git errors (also a failure).

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkEdit, contributorIncludes, isEditablePath, splitFrontMatter } from "../wiki_plugins/lib/contrib-guard.js";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const REF = /^[A-Za-z0-9][A-Za-z0-9._/@^~-]*$/;
const REGULAR_FILE = "100644";

/** Printable single-line text: report lines must never start a GitHub workflow command ("::...") or contain control characters. */
const clean = (text) => String(text).replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");

class UsageError extends Error {}

function git(repo, args, { allowFail = false } = {}) {
  try {
    return execFileSync("git", ["-c", "core.quotepath=off", ...args], { cwd: repo, maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (allowFail) return null;
    throw new UsageError(`git ${args.join(" ")} failed: ${error.stderr ? error.stderr.toString().trim() : error.message}`);
  }
}

/** @returns {Array<{ status: string, path: string, oldMode: string, newMode: string }>} */
function changedFiles(repo, base, head) {
  const out = git(repo, ["diff", "--raw", "-z", "--no-renames", "--no-ext-diff", "--no-textconv", "--no-abbrev", `${base}...${head}`, "--"]).toString("utf8");
  const parts = out.split("\0");
  const files = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const meta = /^:(\d+) (\d+) [0-9a-f]+ [0-9a-f]+ ([A-Z])\d*$/.exec(parts[i]);
    if (!meta) throw new UsageError(`unexpected git diff output: ${clean(parts[i])}`);
    files.push({ oldMode: meta[1], newMode: meta[2], status: meta[3], path: parts[i + 1] });
  }
  return files;
}

function readBlob(repo, ref, file) {
  const buffer = git(repo, ["show", `${ref}:${file}`], { allowFail: true });
  if (buffer === null) return { error: "the file could not be read" };
  if (buffer.length > MAX_FILE_BYTES) return { error: `the file is larger than ${MAX_FILE_BYTES / 1024 / 1024} MiB` };
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(buffer) };
  } catch {
    return { error: "the file is not valid UTF-8" };
  }
}

/** The files of `_includes/` on the base branch (paths relative to `_includes/`). */
function baseIncludeFiles(repo, base) {
  const out = git(repo, ["ls-tree", "-r", "--name-only", "-z", base, "--", "_includes/"]).toString("utf8");
  return out
    .split("\0")
    .filter(Boolean)
    .map((p) => p.slice("_includes/".length));
}

/**
 * @param {{ repo?: string, base: string, head: string }} options
 * @returns {{ ok: boolean, files: Array<{ path: string, problems: string[] }>, includes: string[], mergeBase: string }}
 */
export function checkPullRequest({ repo = process.cwd(), base, head }) {
  for (const ref of [base, head]) {
    if (typeof ref !== "string" || !REF.test(ref)) throw new UsageError(`not a usable git ref: ${clean(ref)}`);
  }
  const mergeBase = git(repo, ["merge-base", base, head]).toString("utf8").trim();
  const includes = contributorIncludes(baseIncludeFiles(repo, base));
  const result = { ok: true, files: [], includes, mergeBase };

  for (const file of changedFiles(repo, base, head)) {
    const problems = [];
    if (file.status !== "M") {
      problems.push(`status ${file.status} is not allowed: contributor pull requests may only edit existing pages (no new, deleted or renamed files).`);
    }
    if (!isEditablePath(file.path)) {
      problems.push("this file is not one that contributors may change (allowed: _charas/*.md, _events/*.md, _main_quests/*.md, guide/*.md, chara_quests.md, mobs.md).");
    }
    if (file.newMode !== REGULAR_FILE || file.oldMode !== REGULAR_FILE) {
      problems.push(`the file mode must stay a regular file (${REGULAR_FILE}), it is ${file.oldMode} -> ${file.newMode}.`);
    }

    if (!problems.length) {
      const before = readBlob(repo, mergeBase, file.path);
      const after = readBlob(repo, head, file.path);
      if (before.error || after.error) {
        problems.push(before.error ? `before the change: ${before.error}.` : `after the change: ${after.error}.`);
      } else {
        const a = splitFrontMatter(before.text);
        const b = splitFrontMatter(after.text);
        if (a.frontMatter !== b.frontMatter) problems.push("the front matter (the block between the --- lines at the top) must not change.");
        const check = checkEdit(a.body, b.body, { allowedIncludes: includes });
        for (const v of check.violations) problems.push(`[${v.code}] ${v.message}`);
      }
    }
    if (problems.length) result.ok = false;
    result.files.push({ path: file.path, problems });
  }
  return result;
}

/** A readable report. Every line is single-line and indented or fixed text (see clean()). */
export function formatReport(result) {
  const lines = [];
  if (!result.files.length) {
    lines.push("contrib-guard: no changed files.");
    return lines.join("\n");
  }
  lines.push(`contrib-guard: ${result.files.length} changed file(s), ${result.ok ? "all fine" : "problems found"}`);
  for (const file of result.files) {
    lines.push(`  ${file.problems.length ? "FAIL" : "ok  "} ${clean(file.path)}`);
    for (const problem of file.problems) lines.push(`       - ${clean(problem)}`);
  }
  if (!result.ok) {
    lines.push("");
    lines.push("  Contributor pull requests may only edit the text of existing pages. Template code ({% %} and {{ }}),");
    lines.push("  front matter and most HTML cannot be changed this way; those edits need a normal review on GitHub.");
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--base" || key === "--head" || key === "--repo") {
      args[key.slice(2)] = argv[++i];
    } else {
      throw new UsageError(`unknown argument: ${clean(key)}`);
    }
  }
  if (!args.base || !args.head) throw new UsageError("usage: contrib-guard-ci.mjs --base <sha> --head <sha> [--repo <dir>]");
  return args;
}

export function main(argv) {
  try {
    const args = parseArgs(argv);
    const result = checkPullRequest({ repo: args.repo ?? process.cwd(), base: args.base, head: args.head });
    console.log(formatReport(result));
    return result.ok ? 0 : 1;
  } catch (error) {
    console.error(`contrib-guard: ${clean(error instanceof Error ? error.message : error)}`);
    return 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
