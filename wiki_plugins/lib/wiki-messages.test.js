import assert from "node:assert/strict";
import test from "node:test";

import { createTestEngine } from "../test-support.js";
import { wikiMessageBlocks } from "./wiki-messages.js";

const run = (msg, options) => {
  const warnings = [];
  const blocks = wikiMessageBlocks({ id: "m", ...msg }, { warn: (w) => warnings.push(w), ...options });
  return { blocks, warnings };
};

test("a plain string is English only and needs no language switch", () => {
  const { blocks, warnings } = run({ text: "Hello" });
  assert.deepEqual(blocks, [{ src: "en", langs: "en zh-Hans zh-Hant ja", single: true, text: "Hello" }]);
  assert.deepEqual(warnings, []);
});

test("every language with its own text gets a block", () => {
  const text = { en: "Hi", ja: "やあ", "zh-Hans": "你好", "zh-Hant": "你好嗎" };
  const { blocks, warnings } = run({ text });
  assert.deepEqual(blocks.map((b) => [b.src, b.langs, b.single]), [["en", "en", false], ["zh-Hans", "zh-Hans", false], ["zh-Hant", "zh-Hant", false], ["ja", "ja", false]]);
  assert.deepEqual(warnings, []);
});

test("a missing Chinese variant borrows the other one, then English", () => {
  assert.deepEqual(run({ text: { en: "Hi", "zh-Hans": "你好" } }).blocks.map((b) => [b.src, b.langs]), [["en", "en ja"], ["zh-Hans", "zh-Hans zh-Hant"]]);
  assert.deepEqual(run({ text: { en: "Hi", "zh-Hant": "你好" } }).blocks.map((b) => [b.src, b.langs]), [["en", "en ja"], ["zh-Hant", "zh-Hans zh-Hant"]]);
  assert.deepEqual(run({ text: { en: "Hi", ja: "やあ" } }).blocks.map((b) => [b.src, b.langs]), [["en", "en zh-Hans zh-Hant"], ["ja", "ja"]]);
});

test("identical text in a language and its fallback collapses into one block", () => {
  const { blocks } = run({ text: { en: "Same", ja: "Same" } });
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].langs, "en zh-Hans zh-Hant");
});

test("mistakes in the data are warned about; strict fails the build", () => {
  assert.match(run({ text: { en: "Hi", "zh-CN": "你好" } }).warnings[0], /"zh-CN".*not one of/);
  assert.match(run({ text: { en: "  " } }).warnings[0], /empty or non-string text in "en"/);
  const noEnglish = run({ text: { ja: "やあ" } });
  assert.match(noEnglish.warnings[0], /no English/);
  assert.deepEqual(noEnglish.blocks.map((b) => [b.src, b.langs]), [["ja", "en zh-Hans zh-Hant ja"]]);
  assert.match(run({}).warnings[0], /has no text/);
  assert.throws(() => run({ text: { ja: "やあ" } }, { strict: true }), /no English/);
});

test("the announcements include writes one block per language inside the message", async () => {
  const WikiMessages = [{ id: "a", text: { en: "Hi", ja: "やあ" } }, { id: "b", text: "Only *English*" }];
  const { render } = createTestEngine({ data: { wiki: { WikiMessages } } });
  const html = await render("{% include wiki-msg.html %}", { site: { time: new Date("2026-01-01T00:00:00Z"), data: { wiki: { WikiMessages } } } });
  assert.match(html, /<article class="wiki-msg" data-msg-id="a"><div lang="en" class="sdv" data-l="en zh-Hans zh-Hant"><p>Hi<\/p>\s*<\/div><div lang="ja" class="sdv" data-l="ja"><p>やあ<\/p>\s*<\/div><\/article>/);
  assert.match(html, /data-msg-id="b"><div><p>Only <em>English<\/em><\/p>\s*<\/div><\/article>/);
});
