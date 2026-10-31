"""Resolve enemy skill names + descriptions, read off in-game screenshots, to skill IDs.

Input is a JSON file of transcribed enemies (see SKILL.md for the shape). For every skill it
looks up the candidates by name in zzz/English.json and zzz/Japanese.json (SKILL_NAME_<id>),
scores each one by how closely its description matches the transcription, and prints the best
match with its rivals. It then writes the `{% include skill-table-manual.html %}` lines.

    py -I .claude/skills/document-enemy-skills/scripts/resolve_skill_ids.py enemies.json

A match is only trustworthy at ratio 1.00 with no rival at 1.00. Everything else is printed as
CHECK or TIE and has to be settled by hand -- read what the script prints, do not take the top
row on faith. Run from the repository root.
"""

import argparse
import difflib
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))


def load(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as f:
        return json.load(f)


def norm(s):
    """Compare descriptions without markup or line-break noise, and case-insensitively."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", s or "")).strip().lower()


class Index:
    def __init__(self):
        self.en = load("zzz", "English.json")
        self.ja = load("zzz", "Japanese.json")
        self.master = load("_data", "SkillMaster.json")
        self.by_name = {}
        for src in (self.en, self.ja):
            for key, value in src.items():
                m = re.fullmatch(r"SKILL_NAME_(\d+)", key)
                if m:
                    self.by_name.setdefault(norm(value), set()).add(m.group(1))
        # a skill whose name was never translated is only in SkillMaster
        for sid, skill in self.master.items():
            name = norm(skill.get("skillName"))
            if name:
                self.by_name.setdefault(name, set()).add(sid)

    def description(self, sid):
        """The English description if there is one, else the raw Japanese of SkillMaster."""
        text = self.en.get("SKILL_DESCRIPTION_" + sid)
        if text:
            return norm(text), "en"
        return norm(self.master.get(sid, {}).get("description")), "ja"

    def resolve(self, name, desc, want_equip):
        """Candidates sharing the name, best first: (ratio, sid, source, isEquip, description)."""
        scored = []
        for sid in sorted(self.by_name.get(norm(name), ()), key=int):
            skill = self.master.get(sid)
            if skill is None:
                continue  # named in the language dump but not in this masterdata version
            text, src = self.description(sid)
            ratio = difflib.SequenceMatcher(None, norm(desc), text).ratio()
            # a passive can never be a main skill, so a section mismatch sinks the candidate
            rank = ratio + (0.5 if bool(skill.get("isEquip")) == want_equip else 0.0)
            scored.append((rank, ratio, sid, src, bool(skill.get("isEquip")), text))
        scored.sort(reverse=True)
        return scored


def report(index, enemies):
    """Print one block per enemy and collect the resolved ids; returns True if all were certain."""
    resolved, certain = [], True
    for enemy in enemies:
        label = enemy.get("en") or enemy.get("jp") or "?"
        print("=" * 78)
        print(f"{label}  ({enemy.get('jp', '')})")
        picked = {"enemy": enemy, "skills": [], "equip": []}
        for key, want_equip in (("skills", False), ("equip", True)):
            print(f"--- {key} ---")
            for name, desc in enemy.get(key, []):
                scored = index.resolve(name, desc, want_equip)
                if not scored:
                    print(f"  {name:28} -> NO CANDIDATE WITH THIS NAME")
                    picked[key].append(None)
                    certain = False
                    continue
                _, ratio, sid, src, is_equip, _ = scored[0]
                ties = [c for c in scored[1:] if abs(c[1] - ratio) < 0.005 and c[4] == is_equip]
                flag = ""
                if ties:
                    flag = f"  <-- TIE with {', '.join(c[2] for c in ties)}"
                elif ratio < 0.995:
                    flag = "  <-- CHECK (description differs from the screenshot)"
                if flag:
                    certain = False
                print(f"  {name:28} -> {sid:>8}  ratio={ratio:.2f} equip={is_equip} [{src}]{flag}")
                for rival in scored[1:4]:
                    print(f"      rival {rival[2]:>8} ratio={rival[1]:.2f} equip={rival[4]} | {rival[5][:88]}")
                picked[key].append(sid)
        resolved.append(picked)
    return resolved, certain


def start_status(skill_text, name, candidates):
    """The first of the enemy's own skills that applies the status `name`, for startStatuses.

    A statusId is not enough on its own -- the game overrides names and tooltips per skill, so
    the same id is both "Damage Counter" and "Growth" -- which is why the spec names a skill.
    """
    statuses = skill_text["statuses"]
    for sid in candidates:
        for indexes in (skill_text["skills"].get(sid, {}).get("s") or {}).values():
            if any(statuses[i]["n"].get("en") == name for i in indexes):
                return sid
    return None


def includes(resolved, skill_text):
    print("\n" + "=" * 78)
    print("include lines (check every CHECK/TIE above before pasting these)")
    print("=" * 78)
    for item in resolved:
        enemy = item["enemy"]
        ids = [s for s in item["equip"] + item["skills"] if s]
        args = ['skillIds="%s"' % ",".join(s or "????" for s in item["skills"])]
        if item["equip"]:
            args.append('equipmentSkills="%s"' % ",".join(s or "????" for s in item["equip"]))
        starts = []
        for status in enemy.get("statuses") or []:
            name, count = (status + [None])[:2] if isinstance(status, list) else (status, None)
            sid = start_status(skill_text, name, ids)
            if sid is None:
                print(f"\n  !! no skill of {enemy.get('en')} applies the status {name!r}: "
                      f"find the skill that grants it and write <skillId>:{name} by hand")
                sid = "????"
            starts.append(":".join(str(p) for p in (sid, name, count) if p is not None))
        if starts:
            args.append('startStatuses="%s"' % ", ".join(starts))
        print(f"\n<details>\n<summary>{enemy.get('en') or enemy.get('jp')}</summary>\n")
        print("{%% include skill-table-manual.html %s %%}\n</details>" % " ".join(args))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("transcription", help="JSON file of transcribed enemies")
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    with open(args.transcription, encoding="utf-8") as f:
        enemies = json.load(f)
    resolved, certain = report(Index(), enemies)
    includes(resolved, load("_data", "processed", "SkillText.json"))
    if not certain:
        print("\nSome matches are not certain: settle every CHECK/TIE by hand (see SKILL.md).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
