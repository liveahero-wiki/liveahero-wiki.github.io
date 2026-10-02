import assert from "node:assert/strict";
import test from "node:test";

import { createTestEngine } from "../test-support.js";
import { keepBackslashesInStrings } from "./string-literals.js";

const { render } = createTestEngine();
const BS = String.fromCharCode(92); // a single backslash, so the sources below are unambiguous

test("strings in ordinary tags are literal, like Ruby Liquid", async () => {
  const source = `{% assign o = '{"x":"a${BS}nb"}' %}{{ o }}`;
  assert.equal(await render(source), `{"x":"a${BS}nb"}`);
});

test("raw blocks and plain text are untouched", () => {
  const source = `plain ${BS}n {% raw %}{{ "${BS}n" }}{% endraw %}`;
  assert.equal(keepBackslashesInStrings(source), source);
});

test("include parameters follow Jekyll: only an escaped double quote is an escape", async () => {
  const title = `${BS}"Quoted${BS}" ${BS}n end`;
  const out = await render(
    `{% capture t %}{% include figure-image.html path="/assets/img/Playerid.png" title="${title}" %}{% endcapture %}{{ t | strip_newlines }}`,
  );
  assert.ok(out.includes(`<figcaption>"Quoted" ${BS}n end</figcaption>`), out);
});
