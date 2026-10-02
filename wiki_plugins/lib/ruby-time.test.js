import assert from "node:assert/strict";
import test from "node:test";

import { frontMatterYamlEngine, inOffset, parseTimestamp, RubyTime } from "./ruby-time.js";

test("front matter timestamps print like Ruby's Time#to_s, keeping the written offset", () => {
  const data = frontMatterYamlEngine.parse("a: 2026-01-22T20:00:00+09\nb: 2025-10-20 15:00:00 +08\nc: 2026-01-5T9:05:00+09");
  assert.equal(String(data.a), "2026-01-22 20:00:00 +0900");
  assert.equal(String(data.b), "2025-10-20 15:00:00 +0800");
  assert.equal(String(data.c), "2026-01-05 09:05:00 +0900");
  assert.ok(data.a instanceof Date);
});

test("a date is shown in the site timezone when converted", () => {
  const post = parseTimestamp("2021-09-23 00:00:00 +08");
  const w = inOffset(post, 540).wallClock();
  assert.equal(w.toISOString().slice(0, 16), "2021-09-23T01:00");
  assert.ok(inOffset(post, 540) instanceof RubyTime);
});
