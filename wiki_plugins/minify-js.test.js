import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { BUNDLE, bundleScripts, minifyScript } from "./minify-js.js";

test("minifyScript strips comments and whitespace, and the result still runs", async () => {
  const code = `// header comment
function greet(name) {
  const message = "hello " + name;
  return message;
}
globalThis.out = greet("wiki");
`;
  const minified = await minifyScript(code);
  assert.ok(minified.length < code.length);
  assert.ok(!minified.includes("header comment"));
  const context = vm.createContext({});
  vm.runInContext(minified, context);
  assert.equal(context.out, "hello wiki");
});

test("minifyScript keeps top-level names, which other scripts and pages use", async () => {
  const minified = await minifyScript("function intdiv(a, b) { return Math.floor(a / b); }\nconst atlasObserver = 1;");
  assert.match(minified, /function intdiv\(/);
  assert.match(minified, /atlasObserver/);
});

test("minifyScript returns code it cannot parse unchanged", async (t) => {
  const warn = t.mock.method(console, "warn", () => {});
  const broken = "function (";
  assert.equal(await minifyScript(broken, "broken.js"), broken);
  assert.equal(warn.mock.callCount(), 1);
});

test("bundleScripts concatenates in order and shares one global scope", async () => {
  const bundle = await bundleScripts({
    "a.js": "globalThis.order = []; function shared() { globalThis.order.push('a'); }",
    "b.js": "shared(); globalThis.order.push('b');",
  });
  const context = vm.createContext({});
  vm.runInContext(bundle, context);
  assert.deepEqual([...context.order], ["a", "b"]);
});

test("bundleScripts fails on a top-level name declared in two files", async () => {
  await assert.rejects(bundleScripts({ "a.js": "const CONFIG = 1;", "b.js": "const CONFIG = 2;" }));
});

test("the real footer scripts bundle without a name collision", async () => {
  const sources = Object.fromEntries(BUNDLE.map((name) => [name, fs.readFileSync(`assets/${name}`, "utf8")]));
  const bundle = await bundleScripts(sources);
  assert.ok(bundle.includes("setupMenu"));
  assert.ok(bundle.includes("pagefind"));
});
