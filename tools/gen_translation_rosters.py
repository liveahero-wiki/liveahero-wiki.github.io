#!python3
"""Generate the translation rosters: the single source for "which lines can a contributor still translate".

Run after the sheet downloads (`voice_gsheet.py download`, `bio_gsheet.py download`) and after masterdata.py
has regenerated _data/processed/{jp,en}_{serif,greeting,bio}.json.

Writes (gitignored, like the other generated inputs):
  _data/processed/voice_roster.json  { version, resources: { <resourceName>: { <voice key>: { jp, en?, hans?, hant?, langs } } } }
  _data/processed/bio_roster.json    { version, bios: { <bio key>: { jp, en?, hans?, hant?, langs } } }

Eleventy serves them as /api/voice-roster.json and /api/bio-roster.json (translation-rosters.11ty.js); the
wiki-cms submission types lah-voice-tl / lah-bio-tl validate submissions against them, the voice table and
bio infobox templates read them from site.data to decide what to offer, and contrib_intake.py uses them to
detect lines the game has translated in the meantime.

Only translatable lines are listed (tools/translatable.py): the game's text missing or equal to JP in at least
one language (en, hans, hant); the sheet-only "manual" voice parts always. `langs` lists the languages still
open for the line (the game's text wins per language). Resources without a translatable line are left out.
`en` / `hans` / `hant` are the effective current text of that language (game, else community), omitted when empty.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util
import translatable

VERSION_FILE = os.path.join("tools", "masterdata_ver.txt")


def get_version() -> str:
    try:
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return ""


def build_voice_roster(data: dict, names: list[str], version: str) -> dict:
    resources = {}
    for name in sorted(names):
        lines = translatable.voice_resource_lines(name, data)
        if lines:
            resources[name] = {k: lines[k] for k in sorted(lines)}
    return {"version": version, "resources": resources}


def build_bio_roster(data: dict, version: str) -> dict:
    bios = translatable.bio_translatable(data.get("jp_bio", {}), data.get("en_bio", {}), **translatable.bio_inputs(data))
    return {"version": version, "bios": {k: bios[k] for k in sorted(bios)}}


def main():
    parser = argparse.ArgumentParser(description="Generate voice-roster.json and bio-roster.json")
    parser.add_argument("--processed", default="_data/processed")
    parser.add_argument("--charas", default=["_charas"], help="markdown folder(s) scanned for voice-table includes", nargs="+")
    args = parser.parse_args()

    data = translatable.load_processed(args.processed)
    names = translatable.page_resource_names(*args.charas)
    version = get_version()

    voice = build_voice_roster(data, names, version)
    bio = build_bio_roster(data, version)
    wiki_util.dumpJson(os.path.join(args.processed, "voice_roster.json"), voice)
    wiki_util.dumpJson(os.path.join(args.processed, "bio_roster.json"), bio)

    lines = sum(len(v) for v in voice["resources"].values())
    print(f"voice roster: {lines} translatable lines in {len(voice['resources'])} of {len(names)} resources")
    print(f"bio roster: {len(bio['bios'])} translatable bios")


if __name__ == "__main__":
    main()
