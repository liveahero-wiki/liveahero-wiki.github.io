import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const SCRIPT = fs.readFileSync("_includes/js/skill-lang.js", "utf8");

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

// The head script is the only place that detects the language: the apps under web/ read <html data-skill-lang>
// (web/shared/lang.ts). Expected answer per navigator.language when nothing valid is stored.
const DETECTED = {
  ja: "ja", "ja-JP": "ja", JA: "ja",
  zh: "zh-Hans", "zh-CN": "zh-Hans", "zh-SG": "zh-Hans", "zh-Hans": "zh-Hans", "zh-Hans-CN": "zh-Hans",
  "zh-TW": "zh-Hant", "zh-HK": "zh-Hant", "zh-MO": "zh-Hant", "zh-Hant": "zh-Hant", "zh-Hant-HK": "zh-Hant",
  en: "en", "en-US": "en", fr: "en", "de-DE": "en", "": "en", ko: "en",
};
const STORED = [undefined, "en", "ja", "zh-Hans", "zh-Hant", "fr", "", "ZH-HANS"];
const VALID = ["en", "ja", "zh-Hans", "zh-Hant"];

test("the head script uses a valid stored choice, else detects from navigator.language", () => {
  for (const [language, detected] of Object.entries(DETECTED)) {
    for (const stored of STORED) {
      const got = runHeadScript({ language, stored }).attrs["data-skill-lang"];
      const want = VALID.includes(stored) ? stored : detected;
      assert.equal(got, want, `navigator.language=${JSON.stringify(language)} stored=${JSON.stringify(stored)}`);
    }
  }
});

test("unreadable storage falls back to the browser language", () => {
  for (const language of ["ja-JP", "zh-TW", "en-GB"]) {
    const got = runHeadScript({ language, storageThrows: true }).attrs["data-skill-lang"];
    assert.equal(got, DETECTED[language] ?? "en", language);
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
