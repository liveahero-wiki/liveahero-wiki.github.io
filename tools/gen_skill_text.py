"""Generate the per-language skill text the wiki pages render.

Output: _data/processed/SkillText.json (gitignored, like the other generated _data files):
    {
      "rev": 1,
      "labels":   { "<lang>": { b, d, o, f, s, stk, unstk, chg, dot, fld, cnt } },   # tooltip header words
      "statuses": [ { id, icon, tp, fl, n: {<lang>: name}, d: {<lang>: description} } ],
      "skills":   { "<skillId>": {
            "n": { "<lang>": skill name },
            "t": { "<lang>": description with <wiki-status i=N>…</wiki-status> tags },
            "s": { "<lang>": [indexes into `statuses`] }          # tag i -> statuses[s[lang][i]]
      } }
    }
<lang> is one of en, zh-Hans, zh-Hant, ja. A language key exists only when that text really is in
that language (see skill_text.is_available): a skill with no English text has no "en" key, and the
renderer then shows the Japanese text to English readers. Skills with no text anywhere are omitted.

The text itself is built by generate_skill_search_index (community English > the game's own
localization dump > raw Japanese master), so the wiki and the skill-search UI agree. Statuses named
in the text are tagged by skill_text.Annotator; nothing here needs the sheet's hand-written
<wiki-status> tags any more (they are still honoured as hints).

Run from the repo root (needs zzz/, see tools/masterdata.py):
    py tools/gen_skill_text.py            write the file
    py tools/gen_skill_text.py --report   also print what the annotator could not place
"""
import argparse
import json
import os
import re
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_skill_search_index as G
from skill_text import LANGS, STATUS_LABELS, is_available

OUT = "_data/processed/SkillText.json"
REV = 1


def kit_index(m, resolver):
    """skill id -> status rows its hero's/sidekick's whole kit can name (a skill that belongs to
    several kits gets the union)."""
    SM, SEM = m["SM"], m["SEM"]
    kits = []
    for group in G.group_by_stock(m["CardMaster"]).values():
        kits.append(G.hero_kit_skill_ids(group))
    for group in G.group_by_stock(m["SidekickMaster"]).values():
        kits.append(G.sidekick_kit_skill_ids(group))
    rows_of_kit = [G.kit_status_rows(ids, SM, SEM, resolver) for ids in kits]
    kits_of_skill: dict = {}
    for n, ids in enumerate(kits):
        for sid in ids:
            kits_of_skill.setdefault(str(sid), []).append(n)

    cache: dict = {}

    def kit_rows(skill_id):
        key = tuple(kits_of_skill.get(str(skill_id), ()))
        if key not in cache:
            rows, seen = [], set()
            for n in key:
                for row in rows_of_kit[n]:
                    if row.ident not in seen:
                        seen.add(row.ident)
                        rows.append(row)
            cache[key] = rows
        return cache[key]

    return kit_rows


def load_contexts():
    """{lang: (m, resolver)}: every master/translation file the text needs, per language."""
    contexts = {}
    for lang in LANGS:
        m = G.load_all(lang)
        contexts[lang] = (m, G.resolver_for(m["SMA"], m["SEM"], m["StatusTrans"], m["SkillEffectTrans"],
                                            m["GameTrans"]))
    return contexts


def assemble(contexts, report: bool = False):
    """The SkillText.json document for `contexts` (see load_contexts), and per-language stats."""
    out_skills: dict = {}
    # a status entry is keyed by the row it comes from, so every language fills in its own name
    entries: dict = {}          # ident -> {id, icon, tp, fl, n, d}
    stats = {}

    for lang, (m, resolver) in contexts.items():
        SM, SEM = m["SM"], m["SEM"]
        kit_rows = kit_index(m, resolver)
        counts = Counter()
        mixed = []
        no_match = []

        for sid in SM:
            name = G.skill_name(sid, SM, m["SkillTrans"], m["GameTrans"]).strip()
            text = G.skill_description(sid, SM, m["SkillTrans"], m["GameTrans"], m["SkillCondTrans"])
            rec = out_skills.setdefault(sid, {})

            if name and is_available(lang, name):
                rec.setdefault("n", {})[lang] = name
                counts["name"] += 1
            if not (text and is_available(lang, text)):
                continue
            tagged, rows = G.annotate_rows(sid, text, SM, SEM, resolver, kit_rows=kit_rows(sid))
            rec.setdefault("t", {})[lang] = tagged
            counts["text"] += 1
            if report:
                if lang in ("en", "zh-Hans", "zh-Hant") and _is_mixed(lang, text):
                    mixed.append(sid)
                if rows and "<wiki-status" not in tagged:
                    no_match.append(sid)

            ids = []
            for row in rows:
                e = entries.setdefault(row.ident, {"id": row.status_id, "icon": row.icon,
                                                   "tp": row.tp, "fl": row.fl, "n": {}, "d": {}})
                e["n"][lang] = row.name
                if row.desc:
                    e["d"][lang] = row.desc
                ids.append(row.ident)
            if ids:
                rec.setdefault("s", {})[lang] = ids

        stats[lang] = (counts, mixed, no_match, resolver)

    # intern: number the status entries by first use, merging entries with identical content
    numbering: dict = {}
    statuses: list = []
    by_content: dict = {}

    def number(ident):
        if ident not in numbering:
            e = entries[ident]
            content = json.dumps(e, sort_keys=True, ensure_ascii=False)
            if content not in by_content:
                by_content[content] = len(statuses)
                statuses.append(e)
            numbering[ident] = by_content[content]
        return numbering[ident]

    skills = {}
    for sid, rec in out_skills.items():
        if "s" in rec:
            rec["s"] = {lang: [number(i) for i in idents] for lang, idents in rec["s"].items()}
        if rec.get("n") or rec.get("t"):
            skills[sid] = rec

    return {"rev": REV, "labels": STATUS_LABELS, "statuses": statuses, "skills": skills}, stats


def write(data, path=OUT):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))


_KANA = re.compile("[぀-ゟ゠-ヿ]")
_KANA_OR_HAN = re.compile("[぀-ヿ㐀-鿿]")


def _is_mixed(lang, text):
    """Available, but with some untranslated Japanese in it (worth a look in --report): any kana
    or kanji in English text, any kana (bar the middle dot) in Chinese text."""
    plain = re.sub(r"<[^>]*>", "", text).replace("・", "")
    return bool((_KANA_OR_HAN if lang == "en" else _KANA).search(plain))


def print_report(data, stats):
    skills = data["skills"]
    print(f"\nwrote {OUT}: {len(skills)} skills, {len(data['statuses'])} status entries, "
          f"{os.path.getsize(OUT) / 1e6:.1f} MB")
    for lang, (counts, mixed, no_match, resolver) in stats.items():
        rep = resolver.annotator.report
        print(f"\n[{lang}] names {counts['name']}, texts {counts['text']}")
        print(f"  status tags found in text: {rep.matches}; hand-written tags: {rep.hints} "
              f"({rep.hints_local} on the skill, {rep.hints_global} elsewhere, "
              f"{len(rep.hints_unresolved)} unresolved)")
        cat = resolver.catalog()
        if cat.ambiguous:
            print(f"  hand-written tags naming several statuses: "
                  f"{', '.join(f'{k} x{v}' for k, v in cat.ambiguous.most_common(8))}")
        if rep.shared_alias:
            print(f"  names shared by statuses with different tooltips: "
                  f"{', '.join(f'{k} x{v}' for k, v in rep.shared_alias.most_common(8))}")
        if rep.hints_unresolved:
            names = Counter(n for _, n in rep.hints_unresolved)
            print(f"  unresolved hand-written tags: {', '.join(f'{k} x{v}' for k, v in names.most_common(12))}")
        if mixed:
            print(f"  text containing some untranslated Japanese: {len(mixed)} (e.g. {mixed[:6]})")
        if no_match:
            print(f"  skills that apply statuses but name none in the text: {len(no_match)} "
                  f"(e.g. {no_match[:6]})")
        if resolver.template_missing:
            print(f"  status description templates with a missing value: {dict(resolver.template_missing)}")
    langs_missing = Counter()
    for rec in skills.values():
        for lang in LANGS:
            if lang not in rec.get("t", {}):
                langs_missing[lang] += 1
    print("\nskills without text in a language (the renderer falls back to Japanese):",
          dict(langs_missing))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--report", action="store_true", help="print what the annotator could not place")
    args = parser.parse_args()
    data, stats = assemble(load_contexts(), args.report)
    write(data)
    if args.report:
        print_report(data, stats)
    else:
        print(f"wrote {OUT}: {len(data['skills'])} skills, {len(data['statuses'])} status entries")


if __name__ == "__main__":
    main()
