// Interactive skill-tree ("bloom") UI for character pages.
//
// Rendered by _includes/hero-skill-evolution-v2.html from the model produced by
// tools/gen_skill_upgrade_model.py. Every node starts active (fully bloomed).
// Clicking a node toggles it: deactivating cascades to its descendants,
// activating cascades to its ancestors (a node can only be active when all its
// parents are). After each toggle the skill description + View cost are
// recomputed for the current active-node set.
//
// The description resolution + sanitizer below MIRROR the Python reference in
// tools/gen_skill_upgrade_model.py (_resolve) and tools/wiki_util.py
// (sanitizeSkillDescription). At all-active they must reproduce the emitted
// maxedText / maxedView byte-for-byte (asserted by the generator's self-check,
// and re-checkable in the browser).
(function () {
  "use strict";

  // Port of wiki_util.sanitizeSkillDescription. Applied to the WHOLE assembled
  // description (base + surviving lines), never per-part.
  function sanitize(s) {
    s = String(s == null ? "" : s).trim();
    s = s.replace(/<color=(.*?)>([\s\S]*?)<\/color>/g, "$2");
    s = s.replace(/<size=(\d+)>([\s\S]*?)<\/size>/g, "$2");
    s = s.split('<style="改行"></style>').join("<br>"); // 改行
    s = s.replace(/<style="パッシブ領域(_en)?">([\s\S]*?)<\/style>/g,
                  "<wiki-passive>$2</wiki-passive>"); // パッシブ領域
    s = s.replace(/<style="スキル強化(_en)?">([\s\S]*?)<\/style>/g,
                  "<wiki-enhance>$2</wiki-enhance>"); // スキル強化
    ['<style="オート行動_en"></style>',
     '<style="オート行動"></style>'].forEach(function (marker) { // オート行動
      if (s.indexOf(marker) !== -1) s = s.split(marker).join("<wiki-auto-action>") + "</wiki-auto-action>";
    });
    s = s.replace(/<style="オート行動(_en)?">([\s\S]*?)<\/style>/g,
                  "<wiki-auto-action>$2</wiki-auto-action>");
    ['<style="パッシブ領域_en">',
     '<style="パッシブ領域">'].forEach(function (marker) { // パッシブ領域 (front, unclosed)
      if (s.indexOf(marker) !== -1) s = s.split(marker).join("<wiki-passive>") + "</wiki-passive>";
    });
    s = s.split('<style="改行">').join("");
    s = s.split("</style>").join("");
    s = s.replace(/<size=(\d+)>/g, "");
    if (/^[+=]/.test(s)) s = "'" + s;
    return s;
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

      // Tier selection, mirroring G.select_condition_rows: lines sharing a
      // non-zero `group` are tiers of one sentence and only the unlocked one
      // with the highest `prio` is printed (an empty-texted winner erases the
      // sentence); `group` 0 lines stand alone. `order` places the surviving
      // line where the group starts, so a sentence keeps its slot in the
      // description whichever tier won.
      var live = (model.lines || []).filter(function (l) {
        return l.type === "text" && (l.node === 0 || active.has(l.node));
      });
      function gkey(l) { return l.group ? "g" + l.group : "s" + l.serialNo; }

      var top = {};
      live.forEach(function (l) {
        var k = gkey(l);
        if (!(k in top) || l.prio > top[k]) top[k] = l.prio;
      });

      var kept = [], seen = new Set();
      live.forEach(function (l) {
        var k = gkey(l);
        if (l.prio !== top[k] || !l.text) return;
        if (l.group) {
          var dk = k + "|" + l.text;
          if (seen.has(dk)) return;  // same winning tier listed twice in the data
          seen.add(dk);
        }
        kept.push(l);
      });

      kept.sort(function (a, b) { return a.order - b.order || a.serialNo - b.serialNo; });

      var text = sanitize(model.baseText + kept.map(function (l) { return l.text; }).join(""));

      // View-cost deltas are additive per unlocked node, never replacement tiers.
      var view = model.baseUseView;
      (model.lines || []).forEach(function (l) {
        if (l.type === "view" && (l.node === 0 || active.has(l.node))) view += l.viewDelta;
      });

      var descEl = root.querySelector("[data-st-desc]");
      var viewEl = root.querySelector("[data-st-view]");
      if (descEl) descEl.innerHTML = text;
      if (viewEl) viewEl.textContent = view;
    }

    root.querySelectorAll(".st-node").forEach(function (b) {
      b.addEventListener("click", function () { toggle(Number(b.dataset.node)); });
    });
    render();
  }

  function init() {
    document.querySelectorAll("[data-skill-tree]").forEach(initTree);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
