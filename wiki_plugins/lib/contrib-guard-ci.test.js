// scripts/contrib-guard-ci.mjs against throwaway git repositories.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkPullRequest, formatReport } from "../../scripts/contrib-guard-ci.mjs";

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../scripts/contrib-guard-ci.mjs");

const PAGE = `---
title: Ryekie
characterId: 4
---

## Notes

Ryekie is a hero. {% chara_link Kalaski %} is his friend.

{% for i in (1..3) %}
- row {{ i }}
{% endfor %}

{% include voice-table.html resourceName="ryekie" %}

| A | B |
|---|---|
| {% include item.html id=1 %} | x |
`;

function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "contrib-guard-"));
  const git = (...args) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { cwd: dir, stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  };
  git("init", "-q", "-b", "master");
  write("_charas/ryekie.md", PAGE);
  write("_charas/kalaski.md", PAGE.replace("Ryekie", "Kalaski"));
  write("guide/hero.md", "---\ntitle: Hero\n---\nText\n");
  write("_includes/item.html", "{{ include.id }}");
  write("_includes/item-icon.html", "{{ include.id }}");
  write("_includes/voice-table.html", "voice");
  write("_includes/header.html", "header");
  write("_includes/js/theme.js", "x");
  write(".github/workflows/site.yml", "name: x\n");
  write("README.md", "hi\n");
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  return {
    dir,
    git,
    write,
    base: () => git("rev-parse", "HEAD"),
    /** a branch from base with one commit made by `change`; returns its sha */
    branch(name, change) {
      name = `${name}-${++branchCount}`;
      git("checkout", "-q", "-b", name, "master");
      change();
      git("add", "-A");
      git("commit", "-q", "--allow-empty", "-m", name);
      const sha = git("rev-parse", "HEAD");
      git("checkout", "-q", "master");
      return sha;
    },
    run: (head, base = git("rev-parse", "master")) => checkPullRequest({ repo: dir, base, head }),
  };
}

let shared;
const sharedRepo = () => (shared ??= makeRepo());
let branchCount = 0;
const problems = (result) => result.files.flatMap((f) => f.problems);

test("a text edit, a chara_link and a details block pass", () => {
  const r = sharedRepo();
  const head = r.branch("contrib/1", () =>
    r.write(
      "_charas/ryekie.md",
      PAGE.replace("Ryekie is a hero.", "Ryekie is a hero who loves {% chara_link Akashi|h2 %}.\n\n<details><summary>More</summary>\nHidden.<br>\n</details>").replace("| x |", "| {% include item-icon.html id=2 %} |"),
    ),
  );
  const result = r.run(head);
  assert.deepEqual(problems(result), []);
  assert.equal(result.ok, true);
  assert.deepEqual(result.includes, ["item-icon.html", "item.html"]);
  assert.match(formatReport(result), /all fine/);
  assert.match(formatReport(result), /ok {3}_charas\/ryekie\.md/);
});

test("no changes pass", () => {
  const r = sharedRepo();
  const head = r.branch("contrib/empty", () => {});
  const result = r.run(head);
  assert.equal(result.ok, true);
  assert.equal(result.files.length, 0);
  assert.match(formatReport(result), /no changed files/);
});

test("converting the whole file to CRLF changes the front matter", () => {
  const r = sharedRepo();
  const head = r.branch("contrib/crlf", () => r.write("_charas/ryekie.md", PAGE.replace("---\ntitle: Ryekie\ncharacterId: 4\n---\n", "---\ntitle: Ryekie\ncharacterId: 4\n---\n").replace(/\n/g, "\r\n")));
  const result = r.run(head);
  // the front matter now has CRLF line ends: that is a front matter change
  assert.equal(result.ok, false);
  assert.match(problems(result).join("\n"), /front matter/);
  assert.equal(problems(result).length, 1);
});

test("files that are not editable pages are rejected", () => {
  const r = sharedRepo();
  const cases = {
    ".github/workflows/site.yml": "name: evil\n",
    "_includes/item.html": "evil",
    "_includes/header.html": "evil",
    "_layouts/default.html": "evil",
    "README.md": "changed\n",
    "assets/x.js": "alert(1)",
    "_charas/sub/x.md": "x",
    "_statuses/1.md": "x",
  };
  const head = r.branch("contrib/not-editable", () => {
    for (const [file, text] of Object.entries(cases)) r.write(file, text);
  });
  const result = r.run(head);
  assert.equal(result.ok, false);
  assert.deepEqual(result.files.map((f) => f.path).sort(), Object.keys(cases).sort());
  for (const file of result.files) assert.match(file.problems.join("\n"), /not one that contributors may change/, file.path);
});

test("new, deleted and renamed pages are rejected, edits are not", () => {
  const r = sharedRepo();
  let head = r.branch("contrib/new", () => r.write("_charas/new.md", "---\ntitle: New\n---\nText\n"));
  let result = r.run(head);
  assert.equal(result.ok, false);
  assert.match(problems(result).join("\n"), /status A is not allowed/);

  head = r.branch("contrib/del", () => fs.rmSync(path.join(r.dir, "guide/hero.md")));
  result = r.run(head);
  assert.equal(result.ok, false);
  assert.match(problems(result).join("\n"), /status D is not allowed/);

  head = r.branch("contrib/rename", () => {
    fs.renameSync(path.join(r.dir, "guide/hero.md"), path.join(r.dir, "guide/hero2.md"));
  });
  result = r.run(head);
  assert.equal(result.ok, false);
  assert.deepEqual(result.files.map((f) => f.path).sort(), ["guide/hero.md", "guide/hero2.md"]);
});

test("front matter changes are rejected", () => {
  const r = sharedRepo();
  const head = r.branch("contrib/fm", () => r.write("_charas/ryekie.md", PAGE.replace("characterId: 4", "characterId: 5")));
  const result = r.run(head);
  assert.equal(result.ok, false);
  assert.match(problems(result)[0], /front matter/);
  const head2 = r.branch("contrib/fm2", () => r.write("_charas/ryekie.md", PAGE.replace("---\ntitle", "---\n# c\ntitle")));
  assert.equal(r.run(head2).ok, false);
  const head3 = r.branch("contrib/fm3", () => r.write("_charas/ryekie.md", PAGE.replace("---\n\n## Notes", "---\n## Notes")));
  assert.equal(r.run(head3).ok, true); // blank line after the front matter is body text
});

test("template and HTML violations are reported with a human message", () => {
  const r = sharedRepo();
  const head = r.branch("contrib/bad", () =>
    r.write(
      "_charas/ryekie.md",
      PAGE.replace("{% for i in (1..3) %}", "{% for i in (1..9) %}")
        .replace('{% include voice-table.html resourceName="ryekie" %}', "")
        .replace("Ryekie is a hero.", 'Ryekie is a hero. <script>alert(1)</script> {% include header.html %} {{ site.data.x }} {% include item.html id=page.id %}'),
    ),
  );
  const result = r.run(head);
  assert.equal(result.ok, false);
  const text = problems(result).join("\n");
  assert.match(text, /\{% for %} tag was changed/);
  assert.match(text, /voice-table\.html/);
  assert.match(text, /<script> cannot be added/);
  assert.match(text, /header\.html/);
  assert.match(text, /\{\{ }} expression was added/);
  assert.match(text, /plain number/);
  const report = formatReport(result);
  assert.match(report, /FAIL _charas\/ryekie\.md/);
  assert.ok(report.split("\n").every((line) => !line.startsWith("::")));
});

test("the include list comes from the base branch, not from the pull request", () => {
  const r = sharedRepo();
  // the PR adds a new include and uses it; the base does not have it
  const head = r.branch("contrib/inc", () => {
    r.write("_includes/evil.html", "x");
    r.write("_charas/ryekie.md", PAGE.replace("Ryekie is a hero.", "{% include evil.html id=1 %}"));
  });
  const result = r.run(head);
  assert.equal(result.ok, false);
  const text = problems(result).join("\n");
  assert.match(text, /_includes|not one that contributors may change/);
  assert.match(text, /evil\.html/);
  assert.ok(!result.includes.includes("evil.html"));

  // an include the base has on its denylist stays unavailable
  const head2 = r.branch("contrib/inc2", () => r.write("_charas/ryekie.md", PAGE.replace("Ryekie is a hero.", "{% include header.html %}")));
  assert.equal(r.run(head2).ok, false);
});

test("merge-base semantics: the PR is not blamed for what the base changed since", () => {
  const r = makeRepo();
  const head = r.branch("contrib/old", () => r.write("_charas/ryekie.md", PAGE.replace("Ryekie is a hero.", "Ryekie is a good hero.")));
  // master moves on: the template of another page and an unrelated file change
  r.write("_charas/kalaski.md", PAGE.replace("Ryekie", "Kalaski").replace("(1..3)", "(1..4)"));
  r.write("README.md", "newer\n");
  r.git("add", "-A");
  r.git("commit", "-q", "-m", "master moves");
  const result = r.run(head, r.git("rev-parse", "master"));
  assert.deepEqual(problems(result), []);
  assert.equal(result.ok, true);
  assert.deepEqual(result.files.map((f) => f.path), ["_charas/ryekie.md"]);
});

test("mode changes are rejected (via update-index)", () => {
  const r = sharedRepo();
  r.git("checkout", "-q", "-b", "contrib/mode2", "master");
  r.git("update-index", "--chmod=+x", "guide/hero.md");
  r.git("commit", "-q", "-m", "mode");
  const head = r.git("rev-parse", "HEAD");
  r.git("checkout", "-q", "master");
  const result = r.run(head);
  assert.equal(result.ok, false);
  assert.match(problems(result).join("\n"), /regular file/);
});

test("odd file names cannot inject workflow commands into the log", () => {
  const path = "::error::x\n::add-mask::y";
  const report = formatReport({ ok: false, mergeBase: "x", includes: [], files: [{ path, problems: ["\n::stop-commands::z"] }] });
  assert.ok(report.split("\n").every((line) => !line.startsWith("::")), report);
});

test("the CLI: exit codes and usage errors", () => {
  const r = sharedRepo();
  const ok = r.branch("contrib/ok", () => r.write("guide/hero.md", "---\ntitle: Hero\n---\nText, changed.\n"));
  const bad = r.branch("contrib/bad", () => r.write("README.md", "x\n"));
  const run = (...args) => {
    try {
      const stdout = execFileSync(process.execPath, [script, ...args], { cwd: r.dir, stdio: ["ignore", "pipe", "pipe"] }).toString();
      return { code: 0, stdout, stderr: "" };
    } catch (error) {
      return { code: error.status, stdout: String(error.stdout), stderr: String(error.stderr) };
    }
  };
  // the script reads the guard from its own checkout (here: this repository), the repo it checks is --repo
  const base = r.git("rev-parse", "master");
  let res = run("--repo", r.dir, "--base", base, "--head", ok);
  assert.equal(res.code, 0, res.stdout + res.stderr);
  assert.match(res.stdout, /all fine/);
  res = run("--repo", r.dir, "--base", base, "--head", bad);
  assert.equal(res.code, 1);
  assert.match(res.stdout, /FAIL README\.md/);
  assert.equal(run("--repo", r.dir, "--base", base).code, 2);
  assert.equal(run("--repo", r.dir, "--base", base, "--head", "does-not-exist").code, 2);
  assert.equal(run("--repo", r.dir, "--base", "--upload-pack=x", "--head", ok).code, 2);
  assert.equal(run("--bogus").code, 2);
});
