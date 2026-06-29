"""Audit skill-effect classes reachable from CardMaster / SidekickMaster.

The skill-search index labels skills by mapping each effect's `class` to taxonomy
label keys (see generate_skill_search_index.classify). To improve that mapping we
need evidence: for every effect class, which reachable skills use it, what their
Japanese descriptions / parameters look like, and what labels the generator
currently produces. This tool gathers exactly that, scoped to the SAME reachable
entity set the index is built from (heroes + sidekicks), not the whole
SkillEffectMaster.json (which is full of mob/unused effects).

Run from the repo root, like the generator:

    python tools/audit_skill_effects.py classes              # freq-ranked classes
    python tools/audit_skill_effects.py class TurnBaseMultipleAttack [More...]
    python tools/audit_skill_effects.py report [--out PATH]   # human-readable HTML

Add --json to `classes` / `class` for machine-readable output. Frequencies match
the generator's "UNMAPPED CLASSES" counts (same per-skill-row, fresh-visited walk).
"""

import argparse
import html
import json
import os
import sys
from collections import Counter, OrderedDict, defaultdict

import generate_skill_search_index as gen
from generate_skill_search_index import classify, resolve_status_name


# --- reachable effect-occurrence collection --------------------------------

def walk_skill_effects(skill_id, SM, SEM, visited):
    """Yield (owning_skill_id, skillEffectId, sej, inner) for every inner effect
    reachable from skill_id, mirroring label_skill's traversal: fold in
    ChangeActiveSkill targets and appendPassiveSkillIds (visited-guarded). This
    makes coverage match exactly the effects that contribute to a skill's labels."""
    sid = str(skill_id)
    if sid in visited:
        return
    visited.add(sid)
    skill = SM.get(sid)
    if not skill:
        return
    for eff in skill.get("effects", []) or []:
        sem = SEM.get(str(eff.get("skillEffectId")))
        if not sem:
            continue
        sej = sem.get("skillEffectJson", {})
        for inner in sej.get("effects", []):
            yield skill_id, eff.get("skillEffectId"), sej, inner
            if inner.get("class") == "ChangeActiveSkill":
                tgt = (inner.get("parameter") or {}).get("skillId")
                if tgt:
                    yield from walk_skill_effects(tgt, SM, SEM, visited)
    for pid in skill.get("appendPassiveSkillIds") or []:
        yield from walk_skill_effects(pid, SM, SEM, visited)


def collect_occurrences(m):
    """Walk every reachable hero/sidekick skill row and return a flat list of
    effect occurrences. One occurrence per inner effect, attributed to the entity
    (character) and the skill row it was reached from -- matching the generator's
    per-skill-row label_skill calls, so counts line up with UNMAPPED CLASSES."""
    SM, SEM, SMA = m["SM"], m["SEM"], m["SMA"]
    StatusTrans = m["StatusTrans"]
    entities = gen.build_entities(m)
    occ = []
    for e in entities:
        rows = list(e.get("skills") or [])
        rows += [dict(r, _maxed=True) for r in (e.get("skillsMaxed") or [])]
        for row in rows:
            maxed = row.get("_maxed", False)
            visited = set()  # fresh per skill row, mirroring skill_obj/label_skill
            for owner_sid, se_id, sej, inner in walk_skill_effects(
                    row["skillId"], SM, SEM, visited):
                cls = inner.get("class", "")
                labels, _dmg, recognized = classify(cls, inner)
                params = inner.get("parameter") or {}
                status_id = sej.get("statusId") or 0
                occ.append({
                    "class": cls,
                    "recognized": recognized,
                    "labels": sorted(labels),
                    "skillEffectId": se_id,
                    "ownerSkillId": owner_sid,
                    "description": sej.get("description") or "",
                    "overrideName": sej.get("overrideStatusName") or "",
                    "overrideDesc": sej.get("overrideStatusDescription") or "",
                    "statusId": status_id,
                    "statusName": (resolve_status_name(status_id, StatusTrans, SMA)
                                   if status_id else ""),
                    "persistence": bool(sej.get("persistence")),
                    "parameter": params,
                    "entity": e["name"],
                    "page": e.get("page") or "",
                    "kind": e["kind"],
                    "stockId": e.get("stockId"),
                    "slot": row.get("slot", ""),
                    "maxed": maxed,
                    "skillLabels": row.get("labels") or [],
                })
    return occ


# --- aggregation helpers ----------------------------------------------------

def by_class(occ):
    groups = defaultdict(list)
    for o in occ:
        groups[o["class"]].append(o)
    return groups


def class_rows(occ):
    """One summary row per class, sorted by descending frequency then name."""
    groups = by_class(occ)
    rows = []
    for cls, items in groups.items():
        labels = sorted({l for o in items for l in o["labels"]})
        rows.append({
            "class": cls,
            "count": len(items),
            "recognized": all(o["recognized"] for o in items),
            "labels": labels,
        })
    rows.sort(key=lambda r: (-r["count"], r["class"]))
    return rows


def signatures(items):
    """Collapse occurrences of one class into distinct signatures keyed by
    (description, parameter key-shape, resulting labels). For each signature
    report the count, the value range (the key threshold signal), persistence
    count, distinct statuses, and a few example characters/skills."""
    sigs = OrderedDict()
    for o in items:
        pkeys = tuple(sorted((o["parameter"] or {}).keys()))
        key = (o["description"], pkeys, tuple(o["labels"]))
        s = sigs.get(key)
        if s is None:
            s = sigs[key] = {
                "description": o["description"],
                "paramKeys": list(pkeys),
                "labels": list(o["labels"]),
                "count": 0,
                "persistenceCount": 0,
                "values": [],
                "statuses": {},
                "examples": [],
            }
        s["count"] += 1
        if o["persistence"]:
            s["persistenceCount"] += 1
        v = (o["parameter"] or {}).get("value")
        if isinstance(v, (int, float)):
            s["values"].append(v)
        if o["statusId"]:
            s["statuses"][o["statusId"]] = o["statusName"]
        if len(s["examples"]) < 3:
            s["examples"].append({
                "entity": o["entity"], "slot": o["slot"],
                "skillEffectId": o["skillEffectId"],
                "parameter": o["parameter"],
            })
    out = []
    for s in sigs.values():
        vals = s.pop("values")
        s["valueRange"] = [min(vals), max(vals)] if vals else None
        s["statuses"] = [f"{sid}:{name}" for sid, name in sorted(s["statuses"].items())]
        out.append(s)
    out.sort(key=lambda s: -s["count"])
    return out


# --- subcommands ------------------------------------------------------------

def cmd_classes(m, args):
    rows = class_rows(collect_occurrences(m))
    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return
    print(f"{'count':>5}  {'ok':<3} {'class':<42} labels")
    for r in rows:
        ok = "yes" if r["recognized"] else "NO"
        labels = ",".join(r["labels"]) or "-"
        print(f"{r['count']:>5}  {ok:<3} {r['class']:<42} {labels}")
    print(f"\n{len(rows)} classes, "
          f"{sum(1 for r in rows if not r['recognized'])} unmapped")


def cmd_class(m, args):
    groups = by_class(collect_occurrences(m))
    result = OrderedDict()
    for cls in args.names:
        items = groups.get(cls)
        if not items:
            print(f"# {cls}: no reachable occurrences", file=sys.stderr)
            continue
        result[cls] = {
            "count": len(items),
            "recognized": all(o["recognized"] for o in items),
            "signatures": signatures(items),
        }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    for cls, info in result.items():
        flag = "" if info["recognized"] else "  [UNMAPPED]"
        print(f"\n=== {cls}  ({info['count']} occurrences){flag} ===")
        for s in info["signatures"]:
            vr = s["valueRange"]
            vr = f"value {vr[0]}..{vr[1]}" if vr else "no value"
            print(f"\n  x{s['count']}  labels={','.join(s['labels']) or '-'}  "
                  f"{vr}  persistence={s['persistenceCount']}/{s['count']}")
            print(f"    desc: {s['description'] or '(empty)'}")
            print(f"    params: {sorted(s['paramKeys'])}")
            if s["statuses"]:
                print(f"    statuses: {', '.join(s['statuses'])}")
            for ex in s["examples"]:
                print(f"    e.g. {ex['entity']} [{ex['slot']}] "
                      f"se#{ex['skillEffectId']} {json.dumps(ex['parameter'], ensure_ascii=False)}")


def cmd_report(m, args):
    occ = collect_occurrences(m)
    groups = by_class(occ)
    rows = class_rows(occ)
    out_path = args.out or os.path.join(gen.API, "skill-effects-audit.html")

    def esc(x):
        return html.escape(str(x), quote=True)

    parts = [
        "<!doctype html><meta charset='utf-8'>",
        r"<base href='https://liveahero-wiki.github.io/'>",
        "<title>Skill-effect class audit</title>",
        "<style>body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:80rem}"
        "details{border:1px solid #ccc;border-radius:6px;margin:.4rem 0;padding:.4rem .8rem}"
        "summary{cursor:pointer;font-weight:600}"
        "summary .n{color:#888;font-weight:400}"
        ".unmapped summary{color:#b00}"
        "table{border-collapse:collapse;width:100%;margin:.5rem 0;font-size:13px}"
        "th,td{border:1px solid #ddd;padding:3px 6px;text-align:left;vertical-align:top}"
        "th{background:#f4f4f4}code{background:#f4f4f4;padding:0 3px}"
        ".jp{font-size:13px}</style>",
        f"<h1>Skill-effect class audit</h1><p>{len(rows)} classes, "
        f"{sum(1 for r in rows if not r['recognized'])} unmapped, "
        f"{len(occ)} reachable occurrences. Version {esc(gen.get_version())}.</p>",
    ]
    # one <details> per class, sorted by class name for stable diffs
    for cls in sorted(groups):
        items = groups[cls]
        recognized = all(o["recognized"] for o in items)
        cls_labels = sorted({l for o in items for l in o["labels"]})
        cssclass = "" if recognized else " class='unmapped'"
        parts.append(
            f"<details{cssclass}><summary>{esc(cls)} "
            f"<span class='n'>&times;{len(items)} &middot; "
            f"{'mapped' if recognized else 'UNMAPPED'} &middot; "
            f"{esc(','.join(cls_labels) or '-')}</span></summary>")
        parts.append("<table><tr><th>Character</th><th>Slot</th><th>Skill</th>"
                     "<th>SE#</th><th>Description</th><th>Parameter</th>"
                     "<th>Effect labels</th></tr>")
        # sort occurrences deterministically for diffing
        for o in sorted(items, key=lambda o: (o["entity"], o["ownerSkillId"],
                                               o["skillEffectId"] or 0, o["slot"])):
            link = (f"<a href='{esc(o['page'])}'>{esc(o['entity'])}</a>"
                    if o["page"] else esc(o["entity"]))
            slot = o["slot"] + (" (maxed)" if o["maxed"] else "")
            desc = o["description"] or o["overrideName"] or ""
            param = json.dumps(o["parameter"], ensure_ascii=False, sort_keys=True)
            parts.append(
                f"<tr><td>{link}</td><td>{esc(slot)}</td>"
                f"<td>{esc(o['ownerSkillId'])}</td><td>{esc(o['skillEffectId'])}</td>"
                f"<td class='jp'>{esc(desc)}</td><td><code>{esc(param)}</code></td>"
                f"<td>{esc(','.join(o['labels']) or '-')}</td></tr>")
        parts.append("</table></details>")

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    print(f"wrote {out_path} ({len(rows)} classes, {len(occ)} occurrences)")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    pc = sub.add_parser("classes", help="list classes by descending frequency")
    pc.add_argument("--json", action="store_true")
    pc.set_defaults(func=cmd_classes)

    pk = sub.add_parser("class", help="evidence for one or more classes")
    pk.add_argument("names", nargs="+")
    pk.add_argument("--json", action="store_true")
    pk.set_defaults(func=cmd_class)

    pr = sub.add_parser("report", help="write the human-readable HTML report")
    pr.add_argument("--out", help="output path (default api/skill-effects-audit.html)")
    pr.set_defaults(func=cmd_report)

    args = p.parse_args(argv)
    # Descriptions are Japanese; force UTF-8 stdout so printing them does not die
    # on a legacy console codepage (e.g. Windows cp1252).
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    m = gen.load_all()
    args.func(m, args)


if __name__ == "__main__":
    main()
