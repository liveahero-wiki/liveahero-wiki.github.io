import assert from "node:assert/strict";
import test from "node:test";

import { frontMatterYamlEngine, inOffset, parseTimestamp, RubyTime } from "./ruby-time.js";
import { strftime } from "./strftime.js";

test("front matter timestamps print like Ruby's Time#to_s, keeping the written offset", () => {
  const data = frontMatterYamlEngine.parse("a: 2026-01-22T20:00:00+09\nb: 2025-10-20 15:00:00 +08\nc: 2026-01-5T9:05:00+09");
  assert.equal(String(data.a), "2026-01-22 20:00:00 +0900");
  assert.equal(String(data.b), "2025-10-20 15:00:00 +0800");
  assert.equal(String(data.c), "2026-01-05 09:05:00 +0900");
  assert.ok(data.a instanceof Date);
});

test("duplicate keys: the last one wins, as in Ruby's YAML", () => {
  assert.deepEqual(frontMatterYamlEngine.parse("a: 1\na: 2"), { a: 2 });
});

test("a date is shown in the site timezone when converted", () => {
  const post = parseTimestamp("2021-09-23 00:00:00 +08");
  assert.equal(strftime(inOffset(post, 540), "%Y-%m-%d %H:%M"), "2021-09-23 01:00");
  assert.ok(inOffset(post, 540) instanceof RubyTime);
});

test("strftime covers the formats used in the templates", () => {
  const t = parseTimestamp("2026-01-05T20:05:09+09");
  assert.equal(strftime(t, "%-d %b %Y %R JST"), "5 Jan 2026 20:05 JST");
  assert.equal(strftime(t, "%b %-d, %Y"), "Jan 5, 2026");
  assert.equal(strftime(t, "%m/%d"), "01/05");
  assert.equal(strftime(t, "%Y%m%d"), "20260105");
  assert.equal(strftime(t, "%s"), "1767611109");
  assert.equal(strftime(t, "%Y %b %d"), "2026 Jan 05");
});
