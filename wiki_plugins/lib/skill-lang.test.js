import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const SCRIPT = fs.readFileSync("_includes/js/skill-lang.js", "utf8");
const LANG_TS = pathToFileURL(path.resolve("web/src/lib/lang.ts")).href;

/** Run the inline head script in a bare page: returns the data-skill-lang it set, and the page. */
function runHeadScript({ language, stored, storageThrows = false }) {
  const attrs = {};
  const events = [];
  const store = new Map(stored === undefined ? [] : [["skillSearchLang", stored]]);
  const document = {
    documentElement: { setAttribute: (k, v) => (attrs[k] = v) },
    dispatchEvent: (e) => events.push(e),
  };
  const window = {};
  const localStorage = {
    getItem(k) {
      if (storageThrows) throw new Error("denied");
      return store.get(k) ?? null;
    },
    setItem(k, v) {
      if (storageThrows) throw new Error("denied");
      store.set(k, v);
    },
  };
  const context = vm.createContext({ document, window, localStorage, navigator: { language }, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } } });
  vm.runInContext(SCRIPT, context);
  return { attrs, events, store, window };
}

/** web/src/lib/lang.ts's own answer for the same browser state. */
async function webLang({ language, stored, storageThrows = false }) {
  const store = new Map(stored === undefined ? [] : [["skillSearchLang", stored]]);
  Object.defineProperty(globalThis, "navigator", { value: { language }, configurable: true, writable: true });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: {
      getItem(k) {
        if (storageThrows) throw new Error("denied");
        return store.get(k) ?? null;
      },
    },
  });
  const { getInitialLang } = await import(LANG_TS);
  return getInitialLang();
}

const LANGUAGES = ["ja", "ja-JP", "JA", "zh", "zh-CN", "zh-SG", "zh-TW", "zh-HK", "zh-MO", "zh-Hans", "zh-Hant", "zh-Hant-HK", "zh-Hans-CN", "en", "en-US", "fr", "de-DE", "", "ko"];
const STORED = [undefined, "en", "ja", "zh-Hans", "zh-Hant", "fr", "", "ZH-HANS"];

test("the head script picks the same language as web/src/lib/lang.ts in every browser state", async () => {
  for (const language of LANGUAGES) {
    for (const stored of STORED) {
      const got = runHeadScript({ language, stored }).attrs["data-skill-lang"];
      assert.equal(got, await webLang({ language, stored }), `navigator.language=${JSON.stringify(language)} stored=${JSON.stringify(stored)}`);
    }
  }
});

test("unreadable storage falls back to the browser language, as in lang.ts", async () => {
  for (const language of ["ja-JP", "zh-TW", "en-GB"]) {
    const got = runHeadScript({ language, storageThrows: true }).attrs["data-skill-lang"];
    assert.equal(got, await webLang({ language, storageThrows: true }), language);
  }
});

test("detection never writes to storage", () => {
  const { store } = runHeadScript({ language: "ja-JP" });
  assert.equal(store.size, 0);
});

test("setSkillLang stores a valid choice, updates the page and tells listeners", () => {
  const page = runHeadScript({ language: "en-US" });
  page.window.setSkillLang("zh-Hant");
  assert.equal(page.attrs["data-skill-lang"], "zh-Hant");
  assert.equal(page.store.get("skillSearchLang"), "zh-Hant");
  assert.deepEqual(page.events.map((e) => [e.type, e.detail.lang]), [["skilllangchange", "zh-Hant"]]);
});

test("setSkillLang ignores a language it does not know", () => {
  const page = runHeadScript({ language: "en-US" });
  page.window.setSkillLang("klingon");
  assert.equal(page.attrs["data-skill-lang"], "en");
  assert.equal(page.store.size, 0);
  assert.equal(page.events.length, 0);
});

test("a language picked with setSkillLang is what the Skill Search page starts in", async () => {
  const page = runHeadScript({ language: "en-US" });
  page.window.setSkillLang("ja");
  assert.equal(await webLang({ language: "en-US", stored: page.store.get("skillSearchLang") }), "ja");
});
