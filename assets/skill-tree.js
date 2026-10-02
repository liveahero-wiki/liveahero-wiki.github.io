// Interactive skill-tree ("bloom") UI for character pages.
//
// Rendered by _includes/hero-skill-evolution-v2.html from the model produced by
// tools/gen_skill_upgrade_model.py. Every node starts active (fully bloomed).
// Clicking a node toggles it: deactivating cascades to its descendants,
// activating cascades to its ancestors (a node can only be active when all its
// parents are). After each toggle the skill description + View cost are
// recomputed for the current active-node set.
//
// The page carries the description once per language (see wiki_plugins/lib/skill-text.js), so
// a toggle rewrites every language's block and a change of language needs no work here beyond the
// node tooltips. The server already printed the all-active description, so nothing is rendered
// at load.
//
// The description resolution + sanitizer below MIRROR the Python reference in
// tools/gen_skill_upgrade_model.py (_resolve) and tools/wiki_util.py
// (sanitizeSkillDescriptionForDisplay). At all-active they must reproduce the emitted
// `maxed` text byte-for-byte; wiki_plugins/lib/skill-tree.test.js checks that for every skill,
// and tools/testdata/sanitize_cases.json pins the sanitizer for both implementations.
(function () {
  "use strict";

  // Port of wiki_util.sanitizeSkillDescriptionForDisplay. Applied to the WHOLE assembled
  // description (base + surviving lines), never per-part. The language suffix (_en, _cn, _tw...) and
  // either quote may be missing in the game's markup.
  function style(name) { return '<style="?' + name + '(?:_[A-Za-z]{2})?"?>'; }
  var PASSIVE = new RegExp(style("パッシブ領域") + "([\\s\\S]*?)</style>", "g");
  var PASSIVE_FRONT = new RegExp(style("パッシブ領域"), "g");
  var ENHANCE = new RegExp(style("(?:スキル)?強化") + "([\\s\\S]*?)</style>", "g");
  var ENHANCE_OPEN = new RegExp(style("(?:スキル)?強化"), "g");
  var AUTO_MARKER = new RegExp(style("オート行動") + "</style>", "g");
  var AUTO = new RegExp(style("オート行動") + "([\\s\\S]*?)</style>", "g");
  var LINE_BREAK = /<style="?改行"?><\/style>/g;
  var LINE_BREAK_OPEN = /<style="?改行"?>/g;

  function sanitize(s) {
    s = String(s == null ? "" : s).trim();
    s = s.replace(/<color=(.*?)>([\s\S]*?)<\/color>/g, "$2");
    s = s.replace(/<size=(\d+)>([\s\S]*?)<\/size>/g, "$2");
    s = s.replace(LINE_BREAK, "<br>");
    s = s.replace(PASSIVE, "<wiki-passive>$1</wiki-passive>");
    s = s.replace(ENHANCE, "<wiki-enhance>$1</wiki-enhance>");
    if (s.search(AUTO_MARKER) !== -1) s = s.replace(AUTO_MARKER, "<wiki-auto-action>") + "</wiki-auto-action>";
    s = s.replace(AUTO, "<wiki-auto-action>$1</wiki-auto-action>");
    // the game cannot be trusted to close this tag
    if (s.search(PASSIVE_FRONT) !== -1) s = s.replace(PASSIVE_FRONT, "<wiki-passive>") + "</wiki-passive>";
    s = s.replace(LINE_BREAK_OPEN, "");
    // an enhance region whose end is missing: how far it ran is unknown, so it is not highlighted
    s = s.replace(ENHANCE_OPEN, "");
    s = s.split("</style>").join("");
    s = s.replace(/<size=(\d+)>/g, "");
    s = s.replace(/<color=[^>]*>/g, "");
    return s;
  }

  // Tier selection, mirroring G.select_condition_rows: lines sharing a
  // non-zero `group` are tiers of one sentence and only the unlocked one
  // with the highest `prio` is printed (an empty-texted winner erases the
  // sentence); `group` 0 lines stand alone. `order` places the surviving
  // line where the group starts, so a sentence keeps its slot in the
  // description whichever tier won. `lt` is one language's text per line.
  function survivingLines(model, lt, active) {
    var lines = model.lines;
    var live = [];
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (l.type === "text" && (l.node === 0 || active.has(l.node))) live.push(i);
    }
    function gkey(l) { return l.group ? "g" + l.group : "s" + l.serialNo; }

    var top = {};
    live.forEach(function (i) {
      var k = gkey(lines[i]);
      if (!(k in top) || lines[i].prio > top[k]) top[k] = lines[i].prio;
    });

    var kept = [], seen = new Set();
    live.forEach(function (i) {
      var l = lines[i], k = gkey(l);
      if (l.prio !== top[k] || !lt[i]) return;
      if (l.group) {
        var dk = k + "|" + lt[i];
        if (seen.has(dk)) return;  // same winning tier listed twice in the data
        seen.add(dk);
      }
      kept.push(i);
    });

    kept.sort(function (a, b) {
      return lines[a].order - lines[b].order || lines[a].serialNo - lines[b].serialNo;
    });
    return kept;
  }

  function resolveText(model, langModel, active) {
    var kept = survivingLines(model, langModel.lt, active);
    return sanitize(langModel.base + kept.map(function (i) { return langModel.lt[i]; }).join(""));
  }

  // View-cost deltas are additive per unlocked node, never replacement tiers.
  function resolveView(model, active) {
    var view = model.baseUseView;
    model.lines.forEach(function (l) {
      if (l.type === "view" && (l.node === 0 || active.has(l.node))) view += l.viewDelta;
    });
    return view;
  }

  var tooltipOptions = {
    content: function (e) { return e.dataset.content; },
    allowHTML: true,
    interactive: true,
    appendTo: function () { return document.body; }
  };

  // The language shown, with the same fallback the page's blocks use: its own, else Japanese.
  function modelLang(model, lang) {
    if (model.langs[lang]) return lang;
    if (model.langs.ja) return "ja";
    return Object.keys(model.langs)[0];
  }

  function initTree(root) {
    var script = root.querySelector(".st-model");
    if (!script) return;
    var model;
    try { model = JSON.parse(script.textContent); } catch (e) { return; }

    var tree = model.tree || {};
    var nodes = Object.keys(tree).map(Number);
    var active = new Set(nodes); // default: fully bloomed

    var buttons = {};
    root.querySelectorAll(".st-node").forEach(function (b) {
      buttons[Number(b.dataset.node)] = b;
    });

    function children(n) { return (tree[n] && tree[n].next) || []; }
    function parents(n) { return (tree[n] && tree[n].cond) || []; }

    function reachable(n, step) {
      var seen = new Set(), q = step(n).slice();
      while (q.length) {
        var x = q.pop();
        if (seen.has(x)) continue;
        seen.add(x);
        step(x).forEach(function (y) { q.push(y); });
      }
      return seen;
    }
    var desc = {}, anc = {};
    nodes.forEach(function (n) {
      desc[n] = reachable(n, children);
      anc[n] = reachable(n, parents);
    });

    function toggle(n) {
      if (active.has(n)) {
        active.delete(n);
        desc[n].forEach(function (d) { active.delete(d); });
      } else {
        active.add(n);
        anc[n].forEach(function (a) { active.add(a); });
      }
      render();
    }

    function render() {
      nodes.forEach(function (n) {
        buttons[n].classList.toggle("is-active", active.has(n));
      });

      // Every language's block is rewritten, so switching language later needs no render. A block
      // knows the language of its text from its (or its wrapper's) lang attribute.
      root.querySelectorAll("[data-st-text]").forEach(function (el) {
        var holder = el.closest("[lang]");
        var langModel = model.langs[holder ? holder.getAttribute("lang") : "en"];
        if (!langModel) return;
        el.querySelectorAll(".tippy").forEach(function (chip) { if (chip._tippy) chip._tippy.destroy(); });
        el.innerHTML = resolveText(model, langModel, active);
        if (window.tippy) window.tippy(el.querySelectorAll(".tippy"), tooltipOptions);
      });

      var viewEl = root.querySelector("[data-st-view]");
      if (viewEl) viewEl.textContent = resolveView(model, active);
    }

    // Node tooltips are not part of the page's language blocks: the page prints the English ones.
    function applyNodeTips() {
      var lang = document.documentElement.getAttribute("data-skill-lang") || "en";
      var nodesText = model.langs[modelLang(model, lang)].nodes;
      Object.keys(buttons).forEach(function (n) {
        var text = nodesText[n];
        if (text === undefined) return;
        buttons[n].dataset.content = text;
        if (buttons[n]._tippy) buttons[n]._tippy.setContent(text);
      });
    }

    root.querySelectorAll(".st-node").forEach(function (b) {
      b.addEventListener("click", function () { toggle(Number(b.dataset.node)); });
    });
    document.addEventListener("skilllangchange", applyNodeTips);
    if ((document.documentElement.getAttribute("data-skill-lang") || "en") !== "en") applyNodeTips();
  }

  function init() {
    document.querySelectorAll("[data-skill-tree]").forEach(initTree);
  }

  // for wiki_plugins/lib/skill-tree.test.js
  window.WikiSkillTree = { sanitize: sanitize, resolveText: resolveText, resolveView: resolveView };

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
