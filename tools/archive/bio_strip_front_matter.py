#!python3
"""One-shot cleanup (kept for history): remove the dead BIO_H01 / BIO_H02 / BIO_S01 front matter of _charas/*.md.

_layouts/chara.html passed them to the infoboxes, which never read them: bios render from
_data/processed/{jp,en,hans,hant}_bio.json (_includes/bio-infobox.html). Before deleting the texts this tool
looks for the ones that translate a bio key the game has no EN text for yet (the keys of
_data/processed/bio_roster.json; the key is `DETAIL_<RESOURCENAME>_H01|H02|S01` of the card with that
stockId, as in hero-infobox.html / sidekick-infobox.html) and writes them to zzz/inline-bio-not-in-sheet.json
({ bioKey: text }) to seed the Bio tab. The three keys (and their indented continuation lines) are then
removed; the rest of each file stays byte-identical (CRLF/LF kept) and the YAML is checked to parse to the
same data minus those keys.

  py tools/gen_translation_rosters.py
  py tools/bio_strip_front_matter.py --dry-run
  py tools/bio_strip_front_matter.py
"""
import argparse
import glob
import os
import re
import sys

import yaml

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util

KEY_LINE = re.compile(r"^(\s*)(BIO_H01|BIO_H02|BIO_S01):")
FRONT_MATTER = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.DOTALL)


def indent_of(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def strip_keys(front_matter: str) -> str:
    """Remove the BIO_* keys with their continuation lines (more indented than the key; blank lines only
    when more indented text follows, so the blank lines before the next key stay)."""
    lines = front_matter.splitlines(keepends=True)
    out = []
    i = 0
    while i < len(lines):
        m = KEY_LINE.match(lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        key_indent = len(m.group(1))
        i += 1
        while i < len(lines):
            j = i
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and indent_of(lines[j]) > key_indent:
                i = j + 1
            else:
                break
    return "".join(out)


def bio_texts(data: dict) -> list[tuple[str, str, str]]:
    """(kind, stockId, text) of the BIO_* values of a page's parsed front matter."""
    found = []
    for hero in data.get("heroes") or []:
        for name in ("BIO_H01", "BIO_H02"):
            if hero.get(name):
                found.append((name[4:], hero["stockId"], str(hero[name])))
    for sk in data.get("sidekicks") or []:
        if sk.get("BIO_S01"):
            found.append(("S01", sk["stockId"], str(sk["BIO_S01"])))
    return found


def drop_keys(data: dict) -> dict:
    for group in ("heroes", "sidekicks"):
        for item in data.get(group) or []:
            for name in ("BIO_H01", "BIO_H02", "BIO_S01"):
                item.pop(name, None)
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--dir", default="_charas")
    parser.add_argument("--out", default="zzz")
    args = parser.parse_args()

    cards = {v["stockId"]: v["resourceName"] for v in wiki_util.loadJson("_data/CardMaster.json").values()}
    sidekicks = {v["stockId"]: v["resourceName"] for v in wiki_util.loadJson("_data/SidekickMaster.json").values()}
    roster = wiki_util.loadJson("_data/processed/bio_roster.json")["bios"]
    jp_bio = wiki_util.loadJson("_data/processed/jp_bio.json")

    seed: dict[str, str] = {}
    total = 0
    files = {}
    for path in sorted(glob.glob(os.path.join(args.dir, "*.md"))):
        with open(path, "rb") as f:
            raw = f.read().decode("utf-8")
        m = FRONT_MATTER.match(raw)
        if not m or "BIO_" not in m.group(1):
            continue
        fm = m.group(1)
        data = yaml.safe_load(fm)
        for kind, stock_id, text in bio_texts(data):
            total += 1
            names = sidekicks if kind == "S01" else cards
            resource = names.get(stock_id)
            key = f"DETAIL_{resource.upper()}_{kind}" if resource else None
            if key in roster and text.strip() and text.strip() != jp_bio.get(key, "").strip():
                seed[key] = text
        new_fm = strip_keys(fm)
        if yaml.safe_load(new_fm) != drop_keys(yaml.safe_load(fm)):
            raise SystemExit(f"{path}: the stripped YAML differs from the original minus BIO_* keys")
        files[path] = raw[:m.start(1)] + new_fm + raw[m.end(1):]

    print(f"{total} BIO_* texts in {len(files)} files; {len(seed)} of them translate one of the "
          f"{len(roster)} translatable bio keys")
    if args.dry_run:
        return
    os.makedirs(args.out, exist_ok=True)
    wiki_util.dumpJson(os.path.join(args.out, "inline-bio-not-in-sheet.json"), seed, indent=2)
    for path, text in files.items():
        with open(path, "wb") as f:
            f.write(text.encode("utf-8"))
    print(f"rewrote {len(files)} files, wrote {args.out}/inline-bio-not-in-sheet.json")


if __name__ == "__main__":
    main()
