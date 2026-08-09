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

    // global parent count over the whole tree (structural diamond detection)
    var gparent = {};
    nodes.forEach(function (n) {
      children(n).forEach(function (c) { gparent[c] = (gparent[c] || 0) + 1; });
    });

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

    function subtreeNonlinear(n) {
      var all = new Set(desc[n]); all.add(n);
      var res = false;
      all.forEach(function (x) {
        var ch = children(x);
        if (ch.length > 1) res = true;
        ch.forEach(function (c) { if ((gparent[c] || 0) > 1) res = true; });
      });
      return res;
    }

    function activeDescendants(n) {
      var out = [];
      desc[n].forEach(function (d) { if (active.has(d)) out.push(d); });
      return out;
    }

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

      var lines = model.lines || [];
      var textLines = lines.filter(function (l) { return l.type === "text"; });
      var gated = new Set();
      textLines.forEach(function (l) { if (l.node !== 0) gated.add(l.sig); });
      var nodeSigs = {};
      textLines.forEach(function (l) {
        if (l.node !== 0) (nodeSigs[l.node] = nodeSigs[l.node] || new Set()).add(l.sig);
      });

      var kept = [];
      textLines.forEach(function (l) {
        if (l.node === 0) {
          var anyActive = textLines.some(function (o) {
            return o.node !== 0 && active.has(o.node) && o.sig === l.sig;
          });
          if (!gated.has(l.sig) || !anyActive) kept.push(l);
          return;
        }
        if (!active.has(l.node)) return;
        var ad = activeDescendants(l.node);
        if (ad.length === 0) { kept.push(l); return; }
        var supersededSameSig = ad.some(function (d) {
          return nodeSigs[d] && nodeSigs[d].has(l.sig);
        });
        if (supersededSameSig) return;
        if (subtreeNonlinear(l.node)) kept.push(l);
      });

      kept.sort(function (a, b) {
        var ta = a.node ? (activeDescendants(a.node).length ? 1 : 0) : 0;
        var tb = b.node ? (activeDescendants(b.node).length ? 1 : 0) : 0;
        return ta - tb || a.serialNo - b.serialNo;
      });

      var text = sanitize(model.baseText + kept.map(function (l) { return l.text; }).join(""));

      var view = model.baseUseView;
      lines.forEach(function (l) {
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
