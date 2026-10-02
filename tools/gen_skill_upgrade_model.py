"""Generate the interactive skill-tree ("bloom") model consumed by
_includes/hero-skill-evolution-v2.html + assets/skill-tree.js.

Unlike the search index (which only emits the *fully-maxed* skill text/cost),
this emits the raw per-tier condition lines, the View-cost deltas, and the
SkillUpgradeMaster DAG topology, so the browser can recompute the resolved
description + View cost for ANY subset of active upgrade nodes as the user
toggles them. Text is emitted once per language (en, zh-Hans, zh-Hant, ja), so the
page can switch language without a reload; see wiki_plugins/lib/skill-text.js.

Output: _data/wiki/SkillUpgradeModel.json, keyed by stockId:
    { "<stockId>": { "heroName": str, "skills": [ <skill model>, ... ] } }
each skill model:
    { skillId, baseUseView, maxedView,
      lines:  [ {node, serialNo, group, prio, order, type: "text"|"view", viewDelta} ],
      tree:   { "<nodeId>": {cond:[...], next:[...], icon} },
      rows:   [ [ {id, icon} ] ],
      langs:  { "<lang>": {
          name,                         # skill name
          base,                         # raw base text
          lt:     [ raw text per line ],# aligned with `lines`; "" for view lines
          nodes:  { "<nodeId>": tooltip },
          maxed,                        # the all-active description (what the page prints first)
          st:     [ {id, name, desc, tp, fl?, icon?} ],   # statuses; <wiki-status i=N> indexes it
          foot:   [ indexes into st ],  # the statuses listed under `maxed`
          changes:[ {name, description, st} ]
      } } }
A language is present only when every text part really is in that language; the page then
shows Japanese to readers of the others.

base and every `lt` entry are RAW game strings (with <style="..."> and <color=>/<size=>
markup) in which the statuses are already tagged (<wiki-status i=N>name</wiki-status>), one
shared `st` list for the whole skill. The client concatenates base + the surviving lines and
runs the display sanitizer on the WHOLE result.

A text line's (group, prio) is the game's own conditionGroupId /
conditionPriority: lines sharing a non-zero group are tiers of one sentence and
only the unlocked one with the highest prio is printed; group 0 lines are
independent. `order` is the group's first serialNo -- where the sentence sits in
the description no matter which tier won.

The client selection algorithm (which line of a tiered progression survives for
a given active-node set) is validated here at build time, for every language: reconstructing
the all-active description/cost from the emitted model must reproduce the authoritative
maxed_skill_description / maxed_use_view in generate_skill_search_index.py (tags aside).
A mismatch aborts the build.

Run from the repo root:  py tools/gen_skill_upgrade_model.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_skill_search_index as G
from skill_text import LANGS, is_available, plain_text
from wiki_util import loadJson, dumpJson, ensureDirs, sanitizeSkillDescriptionForDisplay

OUT = "_data/wiki/SkillUpgradeModel.json"

_TAG = re.compile(r"<wiki-status i=(\d+)>")


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
    return sanitizeSkillDescriptionForDisplay(t)


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


def build_skeleton(skill_id, SM, SEM, SUM, nodes_by_skill):
    """The language-independent part of a skill model: lines (without their text), tree, rows."""
    skill = SM.get(str(skill_id), {})

    # Text lines carry the game's conditionGroupId/conditionPriority so the
    # client can run G.select_condition_rows' selection for any active-node set.
    # A whole group is emitted (tiers with empty text included): an empty-texted
    # tier that outranks the others legitimately erases the sentence -- see
    # 1033207, where unlocking the "all allies" tier drops the "self only" line.
    groups = {}
    for e in (skill.get("effects") or []):
        gid = e.get("conditionGroupId", 0)
        key = ("g", gid) if gid else ("s", e.get("serialNo", 0))
        groups.setdefault(key, []).append(e)

    lines = []
    for rows in groups.values():
        if not any(e.get("conditionDescription") for e in rows):
            continue  # markup/effect-only group, nothing to print at any tier
        order = min(e.get("serialNo", 0) for e in rows)
        for e in rows:
            lines.append({
                "node": e.get("conditionEntityId", 0),
                "serialNo": e.get("serialNo"),
                "group": e.get("conditionGroupId", 0),
                "prio": e.get("conditionPriority", 0),
                "order": order,
                "type": "text",
            })

    # View-cost deltas are additive per unlocked node (never replacement tiers),
    # so they need no group bookkeeping -- see G.maxed_use_view.
    for e in (skill.get("effects") or []):
        vd = _view_delta(e, SEM)
        if vd:
            lines.append({
                "node": e.get("conditionEntityId", 0),
                "serialNo": e.get("serialNo"),
                "type": "view",
                "viewDelta": vd,
            })
    lines.sort(key=lambda l: (l["type"] != "text", l.get("order", 0), l["serialNo"]))

    tree = {}
    for entry_id in sorted(nodes_by_skill[skill_id]):
        node = SUM[str(entry_id)]
        tree[str(entry_id)] = {
            "cond": node.get("conditionIds") or [],
            "next": node.get("nextEntryIds") or [],
            "icon": node.get("iconAddress") or "",
        }

    return {
        "skillId": skill_id,
        "baseUseView": skill.get("useView", 0),
        "maxedView": G.maxed_use_view(skill_id, SM, SEM),
        "lines": lines,
        "tree": tree,
        # render-ready visual layout: rows of node cells (objects, so the Liquid
        # include needs no hash lookups). `tree` (above) carries the topology the
        # client uses for cascade + resolution.
        "rows": [[{"id": n, "icon": tree[str(n)]["icon"]} for n in row] for row in compute_rows(tree)],
    }


def _status_entry(row):
    entry = G.row_to_desc(row)
    entry["id"] = row.status_id
    return entry


def build_language(skill_id, skeleton, m, resolver, kit_rows, SkillUpgradeTrans):
    """The text of one skill in one language, or None when it is not really in that language."""
    SM, SEM, SUM = m["SM"], m["SEM"], m["SUM"]
    SkillTrans, GameTrans = m["SkillTrans"], m["GameTrans"]
    sid = str(skill_id)
    skill = SM.get(sid, {})

    # base and each text line hold RAW game strings (with <style="..."> and
    # <color=>/<size=> markup). The client concatenates base + the surviving
    # lines and runs sanitizeSkillDescriptionForDisplay on the WHOLE result -- sanitizing
    # per-part diverges from the whole (a <style="パッシブ領域"> region can span two
    # lines, and .strip() differs at boundaries), so raw+client-sanitize is the
    # only way to byte-match maxed_skill_description.
    base = (SkillTrans.get(sid, {}).get("description")
            or GameTrans.get(f"SKILL_DESCRIPTION_{sid}")
            or skill.get("description") or "")
    texts = {}
    for e in (skill.get("effects") or []):
        sn = e.get("serialNo")
        cond = e.get("conditionDescription") or ""
        texts[sn] = (m["SkillCondTrans"].get(f"{sid}_{sn}", {}).get("description")
                     or GameTrans.get(f"SKILL_EFFECT_CONDITION_DESCRIPTION_{sid}_{sn}")
                     or cond) if cond else ""
    line_texts = [texts.get(l["serialNo"], "") if l["type"] == "text" else "" for l in skeleton["lines"]]

    lang = m["_lang"]
    for part in [base] + [t for t in line_texts if t]:
        shown = sanitizeSkillDescriptionForDisplay(part)
        if plain_text(shown).strip() and not is_available(lang, shown):
            return None

    # tag the statuses in every part, sharing one status list so an index means the same thing in
    # base, in every line, and in whatever mix of them the player's node choices produce
    annotator = G._annotator(resolver)
    footer, others = G.annotation_candidates(skill_id, SM, SEM, resolver, SUM, kit_rows)
    displayed = len(footer)
    base_tagged, footer = annotator.annotate(base, footer, others, ctx=sid)
    lt = []
    for text in line_texts:
        tagged, footer = annotator.annotate(text, footer, others, ctx=sid) if text else (text, footer)
        lt.append(tagged)

    model = {
        "name": G.skill_name(skill_id, SM, SkillTrans, GameTrans),
        "base": base_tagged,
        "lt": lt,
        "nodes": {},
        "st": [_status_entry(r) for r in footer],
        "changes": [],
    }
    for entry_id in skeleton["tree"]:
        node = SUM[str(entry_id)]
        model["nodes"][entry_id] = _node_text(entry_id, node, SkillUpgradeTrans, GameTrans)

    # in-combat ChangeActiveSkill transforms this skill gains (a bloom skill
    # can introduce one the un-upgraded skill never had), rendered as the
    # same <details> the base skill table uses.
    change_ids = [cid for ids in G.collect_change_skills([skill_id], SM, SEM).values() for cid in ids]
    for cs in G.change_skills(
            change_ids, skill_id, SM, SkillTrans, GameTrans,
            annotate=lambda s, text: G.annotated_text(s, text, SM, SEM, resolver, kit_rows=kit_rows)):
        model["changes"].append({"name": cs["name"], "description": cs["description"],
                                 "st": cs.get("statusDescs", [])})

    # initial (all-active / fully-bloomed) render for no-JS + first paint; the client recomputes
    # it on every toggle.
    full = {**skeleton, **model}
    model["maxed"] = _resolve(full, set(map(int, skeleton["tree"])))[0]
    used = []
    for i in (int(x) for x in _TAG.findall(model["maxed"])):
        if i >= displayed and i not in used:
            used.append(i)
    model["foot"] = list(range(displayed)) + used
    return model


# --------------------------------------------------------------------------
# Reference implementation of the CLIENT selection, used only to self-check the
# emitted model against the authoritative maxed_* resolution. assets/skill-tree.js
# must mirror this exactly.
# --------------------------------------------------------------------------
def _resolve(model, active):
    """(description, view cost) of a skill model, in whichever language it carries text for."""
    lines, lt = model["lines"], model["lt"]
    text_lines = [(l, lt[i]) for i, l in enumerate(lines) if l["type"] == "text"]

    def gkey(l):
        return ("g", l["group"]) if l["group"] else ("s", l["serialNo"])

    live = [(l, t) for l, t in text_lines if l["node"] == 0 or l["node"] in active]
    top = {}
    for l, _ in live:
        k = gkey(l)
        top[k] = max(top.get(k, l["prio"]), l["prio"])

    kept, seen = [], set()
    for l, t in live:
        k = gkey(l)
        if l["prio"] != top[k] or not t:
            continue
        if l["group"]:
            if (k, t) in seen:
                continue  # same winning tier listed twice in the master data
            seen.add((k, t))
        kept.append((l, t))

    kept.sort(key=lambda lt_: (lt_[0]["order"], lt_[0]["serialNo"]))
    text = sanitizeSkillDescriptionForDisplay(model["base"] + "".join(t for _, t in kept))

    view = model["baseUseView"] + sum(l["viewDelta"] for l in lines
                                      if l["type"] == "view"
                                      and (l["node"] == 0 or l["node"] in active))
    return text, view


def _strip_status_tags(text):
    return re.sub(r"</?wiki-status[^>]*>", "", text)


def main():
    contexts = {}
    for lang in LANGS:
        m = G.load_all(lang)
        m["_lang"] = lang
        resolver = G.resolver_for(m["SMA"], m["SEM"], m["StatusTrans"], m["SkillEffectTrans"], m["GameTrans"])
        contexts[lang] = (m, resolver)
    m_en = contexts["en"][0]
    SM, SEM, SUM = m_en["SM"], m_en["SEM"], m_en["SUM"]
    # the community translation of tree-node tooltips is English only
    SkillUpgradeTrans = loadJson("_data/translation/SkillUpgrade.json") \
        if os.path.exists("_data/translation/SkillUpgrade.json") else {}

    nodes_by_skill = {}
    for k, v in SUM.items():
        nodes_by_skill.setdefault(v["skillId"], set()).add(int(k))

    out = {}
    text_ok = view_ok = 0
    mismatches = []
    dropped = {lang: 0 for lang in LANGS}

    for stock_id, group in G.group_by_stock(m_en["CardMaster"]).items():
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

        kit_ids = G.hero_kit_skill_ids(group)
        kits = {lang: G.kit_status_rows(kit_ids, m["SM"], m["SEM"], resolver)
                for lang, (m, resolver) in contexts.items()}

        skills = []
        for skill_id in tree_skills:
            model = build_skeleton(skill_id, SM, SEM, SUM, nodes_by_skill)
            langs = {}
            for lang, (m, resolver) in contexts.items():
                built = build_language(skill_id, model, m, resolver, kits[lang],
                                       SkillUpgradeTrans if lang == "en" else {})
                if built is None:
                    dropped[lang] += 1
                    continue
                langs[lang] = built

                # self-check: all-active reconstruction must match the authoritative maxed text
                # (status tags only wrap text, and the sheet's own tags are re-tagged, so both
                # sides are compared without them)
                active = set(nodes_by_skill[skill_id])
                got_text, got_view = _resolve({**model, **built}, active)
                want_text = G.maxed_skill_description(skill_id, m["SM"], m["SkillTrans"], m["GameTrans"],
                                                      m["SUM"], m["SkillCondTrans"])
                want_view = G.maxed_use_view(skill_id, m["SM"], m["SEM"])
                if _strip_status_tags(got_text) == _strip_status_tags(want_text):
                    text_ok += 1
                else:
                    mismatches.append(("text", lang, skill_id, _strip_status_tags(want_text),
                                       _strip_status_tags(got_text)))
                if got_view == want_view:
                    view_ok += 1
                else:
                    mismatches.append(("view", lang, skill_id, want_view, got_view))
                bad = [i for i in (int(x) for x in _TAG.findall(got_text)) if i >= len(built["st"])]
                if bad:
                    mismatches.append(("tag", lang, skill_id, "indexes within st", bad))

            # a node tooltip that is not really in its language shows the Japanese one instead
            for lang, built in langs.items():
                for node, text in built["nodes"].items():
                    if lang != "ja" and "ja" in langs and not is_available(lang, text):
                        built["nodes"][node] = langs["ja"]["nodes"][node]
            model["langs"] = langs
            skills.append(model)

        name, _ = G.chara_name_and_page(rep, "h", m_en["chara_pages"])
        out[str(stock_id)] = {"heroName": name, "skills": skills}

    if mismatches:
        print(f"ERROR: {len(mismatches)} self-check mismatches (emitted model does "
              f"not reproduce maxed_*):", file=sys.stderr)
        for kind, lang, skill_id, want, got in mismatches[:20]:
            print(f"  [{kind}/{lang}] {skill_id}\n    want: {want!r}\n    got:  {got!r}",
                  file=sys.stderr)
        sys.exit(1)

    ensureDirs(OUT)
    dumpJson(OUT, out, indent=None, separators=(",", ":"))

    n_skills = sum(len(v["skills"]) for v in out.values())
    print(f"Wrote {OUT}: {len(out)} heroes, {n_skills} bloom skills "
          f"({os.path.getsize(OUT) / 1e6:.2f} MB)")
    print(f"Self-check OK: {text_ok} text + {view_ok} view reconstructions match maxed_*")
    print("Skills without text in a language (Japanese is shown instead):",
          {lang: n for lang, n in dropped.items() if n})
    if G.missing_upgrade_nodes:
        print("Note: gated node ids absent from SkillUpgradeMaster:",
              dict(G.missing_upgrade_nodes))


if __name__ == "__main__":
    main()
