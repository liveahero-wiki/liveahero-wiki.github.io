// Announcement text of _data/wiki/WikiMessages.json in every language (rendered by _includes/wiki-msg.html).
//
// `text` is a markdown string (English only) or a map from UI language to markdown:
//
//   "text": { "en": "…", "ja": "…", "zh-Hans": "…", "zh-Hant": "…" }
//
// Each message becomes one block per distinct text, like the skill text (lib/skill-text.js):
//
//   <div class="sdv" lang="en" data-l="en">…</div>
//   <div class="sdv" lang="zh-Hans" data-l="zh-Hans zh-Hant">…</div>
//
// `data-l` lists the UI languages a block serves, and _sass/_skill-lang.scss shows the blocks that serve the
// language in <html data-skill-lang>. A language without text of its own shows the other Chinese variant,
// then English. Mistakes in the data (no English, an unknown language code, an empty text) are warned about,
// or fail the build with ELEVENTY_STRICT.

import { UI_LANGS } from "./skill-text.js";

// Where a language without text of its own looks next.
const FALLBACK = {
  en: [],
  ja: ["en"],
  "zh-Hans": ["zh-Hant", "en"],
  "zh-Hant": ["zh-Hans", "en"],
};

/**
 * @param {{ id?: string, text?: string | Record<string, string> }} msg one entry of WikiMessages.json
 * @param {{ strict?: boolean, warn?: (message: string) => void }} [options]
 * @returns {{ src: string, langs: string, single: boolean, text: string }[]} the blocks to write, in UI_LANGS order
 */
export function wikiMessageBlocks(msg, { strict = false, warn = console.warn } = {}) {
  const complain = (problem) => {
    const message = `WikiMessages.json: message "${msg?.id}" ${problem}`;
    if (strict) throw new Error(message);
    warn(message);
  };

  const raw = msg?.text;
  const byLang = {};
  if (typeof raw === "string") {
    byLang.en = raw;
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [lang, text] of Object.entries(raw)) {
      if (!UI_LANGS.includes(lang)) complain(`has text in "${lang}", which is not one of ${UI_LANGS.join(", ")}`);
      else if (typeof text !== "string" || text.trim() === "") complain(`has an empty or non-string text in "${lang}"`);
      else byLang[lang] = text;
    }
  } else {
    complain("has no text (expected a string or a map from language to text)");
  }
  if (!("en" in byLang) && Object.keys(byLang).length > 0) complain('has no English ("en") text');

  const sourceOf = (lang) => [lang, ...FALLBACK[lang]].find((l) => l in byLang) ?? UI_LANGS.find((l) => l in byLang);

  const groups = [];
  for (const lang of UI_LANGS) {
    const src = sourceOf(lang);
    if (!src) continue;
    const group = groups.find((g) => g.src === src);
    if (group) group.langs.push(lang);
    else groups.push({ src, langs: [lang] });
  }
  return groups.map((g) => ({ src: g.src, langs: g.langs.join(" "), single: groups.length === 1, text: byLang[g.src] }));
}
