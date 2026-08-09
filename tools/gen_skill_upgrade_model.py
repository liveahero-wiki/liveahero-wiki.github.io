"""Generate the interactive skill-tree ("bloom") model consumed by
_includes/hero-skill-evolution-v2.html + assets/skill-tree.js.

Unlike the search index (which only emits the *fully-maxed* skill text/cost),
this emits the raw per-tier condition lines, the View-cost deltas, and the
SkillUpgradeMaster DAG topology, so the browser can recompute the resolved
description + View cost for ANY subset of active upgrade nodes as the user
toggles them.

Output: _data/wiki/SkillUpgradeModel.json, keyed by stockId:
    { "<stockId>": { "heroName": str, "skills": [ <skill model>, ... ] } }
each skill model:
    { skillId, skillName, baseText, baseUseView,
      lines:  [ {node, serialNo, sig, type: "text"|"view", text, viewDelta} ],
      tree:   { "<nodeId>": {cond:[...], next:[...], desc, icon} },
      statusDescs: [ {name, desc, tp, fl?, icon?} ] }

The client selection algorithm (which line of a tiered progression survives for
a given active-node set) is validated here at build time: reconstructing the
all-active description/cost from the emitted model must byte-match the
authoritative maxed_skill_description / maxed_use_view in
generate_skill_search_index.py. A mismatch aborts the build.

Run from the repo root:  py tools/gen_skill_upgrade_model.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_skill_search_index as G
from wiki_util import loadJson, dumpJson, ensureDirs

OUT = "_data/wiki/SkillUpgradeModel.json"

_VISIBLE = re.compile(r"<[^>]+>|\s")


def _has_visible_text(s):
    return bool(_VISIBLE.sub("", s or ""))


def _sig(e, SEM):
    sej = SEM.get(str(e.get("skillEffectId")), {}).get("skillEffectJson", {})
    classes = ",".join(str(i.get("class")) for i in sej.get("effects", []))
    return f"{classes}|{sej.get('statusId')}"


def _view_delta(e, SEM):
    sej = SEM.get(str(e.get("skillEffectId")), {}).get("skillEffectJson", {})
    total = 0
    for inner in sej.get("effects", []):
        if inner.get("class") == "ChangeSkillBaseView":
            total += (inner.get("parameter") or {}).get("value", 0)
    return total


def _node_text(entry_id, node, SkillUpgradeTrans, GameTrans):
    """Translated tree-node tooltip: community override -> GameTrans dump -> raw JP."""
    t = (SkillUpgradeTrans.get(str(entry_id), {}).get("description")
         or GameTrans.get(f"SKILL_UPGRADE_DESCRIPTION_{entry_id}")
         or node.get("description") or "")
    return G.sanitizeSkillDescription(t)


def compute_rows(tree):
    """Lay the DAG out into visual rows by longest-path depth from a root
    (depth 0 = root; a merge node sits one below its deepest parent). Linear
    trees yield one node per row; diamonds yield two nodes on the branch rows.
    Columns within a row are ordered by node id for stability."""
    conds = {int(k): [int(c) for c in v["cond"]] for k, v in tree.items()}
    memo = {}

    def depth(n):
        if n not in memo:
            memo[n] = 0 if not conds[n] else 1 + max(depth(p) for p in conds[n])
        return memo[n]

    rows = {}
    for n in conds:
        rows.setdefault(depth(n), []).append(n)
    return [sorted(rows[d]) for d in sorted(rows)]


def build_skill_model(skill_id, m, nodes_by_skill, SkillUpgradeTrans):
    SM, SEM, SUM = m["SM"], m["SEM"], m["SUM"]
    SkillTrans, GameTrans = m["SkillTrans"], m["GameTrans"]
    sid = str(skill_id)
    skill = SM.get(sid, {})

    # baseText and each text line hold RAW game strings (with <style="..."> and
    # <color=>/<size=> markup). The client concatenates baseText + the surviving
    # lines and runs sanitizeSkillDescription on the WHOLE result -- sanitizing
    # per-part diverges from the whole (a <style="パッシブ領域"> region can span two
    # lines, and .strip() differs at boundaries), so raw+client-sanitize is the
    # only way to byte-match maxed_skill_description.
    base_text = (GameTrans.get(f"SKILL_DESCRIPTION_{sid}")
                 or SkillTrans.get(sid, {}).get("description")
                 or skill.get("description") or "")

    lines = []
    for e in (skill.get("effects") or []):
        cei = e.get("conditionEntityId", 0)
        cond = e.get("conditionDescription") or ""
        sn = e.get("serialNo")
        if _has_visible_text(cond):
            raw = (m["SkillCondTrans"].get(f"{sid}_{sn}", {}).get("description")
                   or GameTrans.get(f"SKILL_EFFECT_CONDITION_DESCRIPTION_{sid}_{sn}")
                   or cond)
            lines.append({
                "node": cei,
                "serialNo": sn,
                "sig": _sig(e, SEM),
                "type": "text",
                "text": raw,
            })
        vd = _view_delta(e, SEM)
        if vd:
            lines.append({
                "node": cei,
                "serialNo": sn,
                "sig": _sig(e, SEM),
                "type": "view",
                "viewDelta": vd,
            })

    tree = {}
    for entry_id in sorted(nodes_by_skill[skill_id]):
        node = SUM[str(entry_id)]
        tree[str(entry_id)] = {
            "cond": node.get("conditionIds") or [],
            "next": node.get("nextEntryIds") or [],
            "desc": _node_text(entry_id, node, SkillUpgradeTrans, GameTrans),
            "icon": node.get("iconAddress") or "",
        }

    return {
        "skillId": skill_id,
        "skillName": G.skill_name(skill_id, SM, SkillTrans, GameTrans),
        "baseText": base_text,
        "baseUseView": skill.get("useView", 0),
        "lines": lines,
        "tree": tree,
        # render-ready visual layout: rows of node cells (objects, so the Liquid
        # include needs no hash lookups). `tree` (above) carries the topology the
        # client uses for cascade + resolution.
        "rows": [[{"id": n, "icon": tree[str(n)]["icon"], "desc": tree[str(n)]["desc"]}
                  for n in row] for row in compute_rows(tree)],
        # initial (all-active / fully-bloomed) render for no-JS + first paint;
        # the client recomputes these on every toggle.
        "maxedText": G.maxed_skill_description(skill_id, SM, SEM, SkillTrans, GameTrans, SUM,
                                               m["SkillCondTrans"]),
        "maxedView": G.maxed_use_view(skill_id, SM, SEM),
        "statusDescs": G.build_status_descs(
            skill_id, SM, SEM, m["SMA"], m["StatusTrans"],
            m["SkillEffectTrans"], SUM, GameTrans),
    }


# --------------------------------------------------------------------------
# Reference implementation of the CLIENT selection, used only to self-check the
# emitted model against the authoritative maxed_* resolution. assets/skill-tree.js
# must mirror this exactly.
# --------------------------------------------------------------------------
def _resolve(model, active, SUM):
    tree = model["tree"]

    def children(n):
        return tree.get(str(n), {}).get("next", [])

    # global parent count over the WHOLE game tree (structural diamond detection,
    # matching maxed_skill_description.in_nonlinear_subtree)
    def descendants(n):
        seen, q = set(), list(children(n))
        while q:
            x = q.pop()
            if x in seen:
                continue
            seen.add(x)
            q.extend(children(x))
        return seen

    def subtree_nonlinear(n):
        for x in {n} | descendants(n):
            ch = children(x)
            if len(ch) > 1:
                return True
            for c in ch:
                if _GLOBAL_PARENTS.get(c, 0) > 1:
                    return True
        return False

    text_lines = [l for l in model["lines"] if l["type"] == "text"]
    gated = {l["sig"] for l in text_lines if l["node"] != 0}
    node_sigs = {}
    for l in text_lines:
        if l["node"] != 0:
            node_sigs.setdefault(l["node"], set()).add(l["sig"])

    kept = []
    for l in text_lines:
        node, s = l["node"], l["sig"]
        if node == 0:
            if s not in gated or not any(o["node"] in active and o["sig"] == s
                                         for o in text_lines if o["node"] != 0):
                kept.append(l)
            continue
        if node not in active:
            continue
        ad = descendants(node) & active
        if not ad:
            kept.append(l)
        elif any(s in node_sigs.get(d, set()) for d in ad):
            pass
        elif subtree_nonlinear(node):
            kept.append(l)

    kept.sort(key=lambda l: (bool(descendants(l["node"]) & active) if l["node"] else False,
                             l["serialNo"]))
    text = G.sanitizeSkillDescription(model["baseText"] + "".join(l["text"] for l in kept))

    view = model["baseUseView"] + sum(l["viewDelta"] for l in model["lines"]
                                      if l["type"] == "view"
                                      and (l["node"] == 0 or l["node"] in active))
    return text, view


_GLOBAL_PARENTS = {}


def main():
    m = G.load_all("en")
    SM, SEM, SUM = m["SM"], m["SEM"], m["SUM"]
    SkillTrans, GameTrans = m["SkillTrans"], m["GameTrans"]
    SkillUpgradeTrans = loadJson("_data/translation/SkillUpgrade.json") \
        if os.path.exists("_data/translation/SkillUpgrade.json") else {}

    global _GLOBAL_PARENTS
    _GLOBAL_PARENTS = {}
    for v in SUM.values():
        for c in (v.get("nextEntryIds") or []):
            _GLOBAL_PARENTS[c] = _GLOBAL_PARENTS.get(c, 0) + 1

    nodes_by_skill = {}
    for k, v in SUM.items():
        nodes_by_skill.setdefault(v["skillId"], set()).add(int(k))

    out = {}
    text_ok = view_ok = 0
    mismatches = []

    for stock_id, group in G.group_by_stock(m["CardMaster"]).items():
        rep = next((e for e in group if e.get("rarity") == G.HERO_MAX_RARITY), None)
        if rep is None:
            rep = max(group, key=lambda e: e.get("rarity", 0))

        # every skillId the hero can reference, filtered to those with a tree
        provider = rep.get("skillProvider") or {}
        referenced = []
        for a in (provider.get("activeSkills") or []):
            referenced.append((a.get("skillLearnNo", 99), a.get("skillId")))
        for p in (provider.get("passiveSkills") or []):
            referenced.append((90 + p.get("skillLearnNo", 9), p.get("skillId")))
        for q in (rep.get("skillUpgradeQuestInfos") or []):
            for c in (q.get("changeSkills") or []):
                referenced.append((50, c.get("afterSkillId")))
        for s in (rep.get("skillIds") or []):
            referenced.append((80, s))

        seen, tree_skills = set(), []
        for order, skill_id in sorted(referenced):
            if skill_id in nodes_by_skill and skill_id not in seen:
                seen.add(skill_id)
                tree_skills.append(skill_id)
        if not tree_skills:
            continue

        skills = []
        for skill_id in tree_skills:
            model = build_skill_model(skill_id, m, nodes_by_skill, SkillUpgradeTrans)
            skills.append(model)

            # self-check: all-active reconstruction must match the authoritative maxed
            active = set(nodes_by_skill[skill_id])
            got_text, got_view = _resolve(model, active, SUM)
            want_text = G.maxed_skill_description(skill_id, SM, SEM, SkillTrans, GameTrans, SUM,
                                                  m["SkillCondTrans"])
            want_view = G.maxed_use_view(skill_id, SM, SEM)
            if got_text == want_text:
                text_ok += 1
            else:
                mismatches.append(("text", skill_id, want_text, got_text))
            if got_view == want_view:
                view_ok += 1
            else:
                mismatches.append(("view", skill_id, want_view, got_view))

        name, _ = G.chara_name_and_page(rep, "h", m["chara_pages"])
        out[str(stock_id)] = {"heroName": name, "skills": skills}

    if mismatches:
        print(f"ERROR: {len(mismatches)} self-check mismatches (emitted model does "
              f"not reproduce maxed_*):", file=sys.stderr)
        for kind, skill_id, want, got in mismatches[:20]:
            print(f"  [{kind}] {skill_id}\n    want: {want!r}\n    got:  {got!r}",
                  file=sys.stderr)
        sys.exit(1)

    ensureDirs(OUT)
    dumpJson(OUT, out, indent=None)

    n_skills = sum(len(v["skills"]) for v in out.values())
    print(f"Wrote {OUT}: {len(out)} heroes, {n_skills} bloom skills")
    print(f"Self-check OK: {text_ok} text + {view_ok} view reconstructions match maxed_*")
    if G.missing_upgrade_nodes:
        print("Note: gated node ids absent from SkillUpgradeMaster:",
              dict(G.missing_upgrade_nodes))


if __name__ == "__main__":
    main()
