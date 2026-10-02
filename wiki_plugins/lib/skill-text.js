// Skill names and descriptions in every language, rendered from _data/processed/SkillText.json
// (written by tools/gen_skill_text.py; the file documents its own schema) and, for the bloom
// skill trees, from _data/wiki/SkillUpgradeModel.json (tools/gen_skill_upgrade_model.py).
//
// Each skill is rendered once per UI language, and identical renderings are merged into one block:
//
//   <div class="sdv" lang="en" data-l="en">…</div>
//   <div class="sdv" lang="ja" data-l="zh-Hans zh-Hant ja">…</div>
//
// `data-l` lists the UI languages a block serves, so a language without its own text is simply
// listed on the Japanese block. _sass/_skill-lang.scss shows the blocks that serve the language in
// <html data-skill-lang> (set before first paint by _includes/js/skill-lang.js); English is the
// default when the attribute is missing. When every language reads the same there is nothing to
// switch, so no switchable blocks are written (Japanese-only text just carries lang="ja").

import { str, xmlEscape } from "./ruby.js";

/** Same codes, in the same order of preference, as web/src/lib/lang.ts. */
export const UI_LANGS = ["en", "zh-Hans", "zh-Hant", "ja"];

// Where a language without text of its own looks next: Japanese is always there.
const FALLBACK = ["ja", "en", "zh-Hans", "zh-Hant"];

const FL_STACKABLE = 1;
const FL_CHARGE = 2;
const FL_DOT = 4;
const FL_FIELD = 8;
const FL_COUNT = 16;

/** `Type/Stackable/Charge/…` of a status tooltip; mirrors skill_text.status_label (Python). */
export function statusLabel(labels, tp, fl) {
  const mods = [fl & FL_STACKABLE ? labels.stk : labels.unstk];
  if (fl & FL_CHARGE) mods.push(labels.chg);
  if (fl & FL_DOT) mods.push(labels.dot);
  if (fl & FL_FIELD) mods.push(labels.fld);
  if (fl & FL_COUNT) mods.push(labels.cnt);
  return [fl & FL_FIELD ? labels.o : (labels[tp] ?? tp), ...mods].join("/");
}

/**
 * A status chip with its tooltip. `entry` is { id, icon, tp, fl, name, desc } in the language of
 * `labels`; `shown` is the text the chip carries (the words the description used for it).
 */
export function statusChip(labels, entry, shown) {
  const header = `<b>${entry.name} [${statusLabel(labels, entry.tp, entry.fl ?? 0)}]</b><br>`;
  const icon = entry.icon ? `<img class="status-s" src="/cdn/Sprite/${entry.icon}.png" loading="lazy"> ` : "";
  return (
    `<span class="status tippy" data-id="${entry.id}" ` +
    `data-content="${xmlEscape(header + (entry.desc ?? ""))}">${icon}${shown}</span>`
  );
}

const STATUS_TAG = /<wiki-status i=(\d+)>(.*?)<\/wiki-status>/gs;

/** Replace the <wiki-status i=N> tags of `text` by chips for `list[N]` (flat entries). */
function renderTags(text, list, labels) {
  return str(text).replace(STATUS_TAG, (_, i, shown) => (list[i] ? statusChip(labels, list[i], shown) : shown));
}

/** A line break in the sheet is just whitespace in HTML; a blank one would end a markdown HTML block. */
const flatten = (html) => html.replace(/\s*[\r\n]+\s*/g, " ");

/** The language whose text `lang` shows: its own, else Japanese, else whatever exists. */
function sourceLang(byLang, lang) {
  if (!byLang) return null;
  if (Object.hasOwn(byLang, lang)) return lang;
  return FALLBACK.find((l) => Object.hasOwn(byLang, l)) ?? null;
}

const pick = (byLang, lang) => byLang?.[sourceLang(byLang, lang)] ?? "";

/**
 * Merge per-language renderings: [{ lang, html, src }] -> blocks of languages whose html is identical.
 * `tag` is the element to write (div for descriptions, span for names).
 */
function renderVariants(variants, tag) {
  const groups = [];
  for (const v of variants) {
    const group = groups.find((g) => g.html === v.html);
    if (group) group.langs.push(v.lang);
    else groups.push({ html: v.html, src: v.src, langs: [v.lang] });
  }
  if (groups.length === 1) {
    // nothing to switch; text that is not English still says so, for its fonts and its <wiki-passive> labels
    const [only] = groups;
    return only.src === "en" ? only.html : `<${tag} lang="${only.src}">${only.html}</${tag}>`;
  }
  return groups
    .map((g) => {
      return `<${tag} class="sdv" lang="${g.src}" data-l="${g.langs.join(" ")}">${g.html}</${tag}>`;
    })
    .join("");
}

const MISSING =
  "_data/processed/SkillText.json is missing, so skill names and descriptions cannot be rendered " +
  "(generate it with `py tools/gen_skill_text.py`)";

/**
 * @param {{ data: any }} site `site.data` is re-read on every call (it is replaced on each build)
 * @param {{ strict?: boolean, warn?: (message: string) => void }} [options] with `strict` (ELEVENTY_STRICT) a
 *   missing SkillText.json fails the build; otherwise the filters degrade to empty text with one warning
 */
export function createSkillText(site, { strict = false, warn = console.warn } = {}) {
  let boundTo = null;
  let cache = new Map();
  let warned = false;
  const data = () => {
    const d = site.data?.processed?.SkillText ?? null;
    if (d === null) {
      if (strict) throw new Error(MISSING);
      if (!warned) warn(MISSING);
      warned = true;
    }
    if (d !== boundTo) {
      boundTo = d;
      cache = new Map();
    }
    return d;
  };
  const memo = (key, make) => {
    if (!cache.has(key)) cache.set(key, make());
    return cache.get(key);
  };

  /** A SkillText.json status entry as a flat entry in `lang`. */
  const flat = (entry, lang) => ({
    id: entry.id,
    icon: entry.icon,
    tp: entry.tp,
    fl: entry.fl ?? 0,
    name: pick(entry.n, lang),
    desc: pick(entry.d, lang),
  });

  /** One skill's description in `lang`'s source language: text with status chips, then the status list. */
  function body(d, skillId, lang) {
    const rec = d.skills[skillId];
    const src = sourceLang(rec?.t, lang);
    if (!src) return null;
    const list = (rec.s?.[src] ?? []).map((i) => flat(d.statuses[i], src));
    let html = renderTags(rec.t[src], list, d.labels[src]);
    if (list.length > 0) {
      html += "<hr>" + list.map((e) => statusChip(d.labels[src], e, e.name)).join(", ");
    }
    return { html: flatten(html), src };
  }

  function nameIn(d, skillId, lang, skillMaster) {
    const rec = d.skills[skillId];
    const src = sourceLang(rec?.n, lang);
    return src ? rec.n[src] : str(skillMaster?.[skillId]?.skillName);
  }

  /** The bloom skill's name/maxed text/status list/change skills in `src`, as the page prints them first. */
  function treeBlock(d, skill, src) {
    const L = skill.langs[src];
    const labels = d.labels[src];
    let html = `<span class="st-text" data-st-text>${renderTags(L.maxed, L.st, labels)}</span>`;
    if (L.foot.length > 0) {
      html += "<hr>" + L.foot.map((i) => statusChip(labels, L.st[i], L.st[i].name)).join(", ");
    }
    for (const change of L.changes) {
      html += `<details><summary>${xmlEscape(change.name)}</summary><p>${renderTags(change.description, change.st, labels)}</p></details>`;
    }
    return flatten(html);
  }

  return {
    /** Whether there is any description text for the skill. */
    hasText(skillId) {
      const d = data();
      return Boolean(d?.skills[String(skillId)]?.t);
    },

    /**
     * `skill_html`: the skill's description in every language, plus a <details> for each skill it can
     * change into (`changeSkillIds`, from collect_change_skills; a change skill with the same name
     * as the skill itself is skipped, as before).
     */
    skillHtml(skillId, changeSkillIds = []) {
      const d = data();
      if (!d) return "";
      const sid = String(skillId);
      const changes = (changeSkillIds ?? []).map(String);
      return memo(`d:${sid}:${changes.join(",")}`, () => {
        if (!d.skills[sid]?.t) return "";
        const master = site.data.SkillMaster ?? {};
        const variants = UI_LANGS.map((lang) => {
          const main = body(d, sid, lang);
          let html = main.html;
          for (const cid of changes) {
            if (cid === sid || master[cid]?.skillName === master[sid]?.skillName) continue;
            const target = body(d, cid, main.src);
            if (!target) continue;
            const title = xmlEscape(nameIn(d, cid, main.src, master));
            html += `<details data-id="${cid}"><summary>${title}</summary><p>${target.html}</p></details>`;
          }
          return { lang, html, src: main.src };
        });
        return renderVariants(variants, "div");
      });
    },

    /** `skill_name_html`: the skill's name in every language (plain text when they all agree). */
    skillNameHtml(skillId) {
      const d = data();
      const sid = String(skillId);
      const master = site.data.SkillMaster ?? {};
      if (!d) return xmlEscape(str(master[sid]?.skillName));
      return memo(`n:${sid}`, () => {
        const variants = UI_LANGS.map((lang) => {
          const src = sourceLang(d.skills[sid]?.n, lang);
          return { lang, src: src ?? "ja", html: xmlEscape(nameIn(d, sid, lang, master)) };
        });
        return renderVariants(variants, "span");
      });
    },

    // ---- bloom skill trees (a skill model of SkillUpgradeModel.json) --------------------------------

    /** `skill_tree_name`: the bloom skill's name in every language. */
    treeNameHtml(skill) {
      const variants = UI_LANGS.map((lang) => {
        const src = sourceLang(skill.langs, lang) ?? "ja";
        return { lang, src, html: xmlEscape(str(skill.langs[src]?.name)) };
      });
      return renderVariants(variants, "span");
    },

    /**
     * `skill_tree_html`: the all-active description in every language. The part the skill tree's
     * script rewrites when a node is toggled is `<span class="st-text" data-st-text>`; the status list
     * and the change skills stay as they are.
     */
    treeHtml(skill) {
      const d = data();
      if (!d || !sourceLang(skill.langs, "en")) return "";
      const variants = UI_LANGS.map((lang) => {
        const src = sourceLang(skill.langs, lang);
        return { lang, src, html: treeBlock(d, skill, src) };
      });
      return renderVariants(variants, "div");
    },

    /** `skill_tree_node_tip`: what a node's tooltip says before the script has switched language. */
    treeNodeTip(skill, nodeId) {
      const src = sourceLang(skill.langs, "en");
      return src ? str(skill.langs[src].nodes[String(nodeId)]) : "";
    },

    /**
     * `skill_tree_json`: what skill-tree.js needs to recompute the description for any set of active
     * nodes -- the lines and the tree, and per language the raw parts with their status chips already
     * in them (so the script builds no chips itself) and the node tooltips.
     */
    treeJson(skill) {
      const d = data();
      if (!d) return "{}";
      const langs = {};
      for (const [src, L] of Object.entries(skill.langs ?? {})) {
        const labels = d.labels[src];
        langs[src] = {
          base: renderTags(L.base, L.st, labels),
          lt: L.lt.map((text) => (text ? renderTags(text, L.st, labels) : "")),
          nodes: L.nodes,
        };
      }
      const { baseUseView, lines, tree } = skill;
      return JSON.stringify({ baseUseView, lines, tree, langs }).replace(/</g, "\\u003c");
    },
  };
}
