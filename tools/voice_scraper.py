"""Scrape character voice tables from the Japanese fan wiki (wikiwiki.jp/live-a-hero)
and assemble them into an index keyed by characterId.

The index is built from VoiceMaster.json (stockId discovery, voiceFilename, buttonLabel)
and SidekickMaster.json / CardMaster.json (jp_name). The index is then enriched with
`parts` (voice lines) scraped from each character's wiki page.
Reruns reload the existing index, augment it with any new stockIds from VoiceMaster,
then only re-fetch the requested characters.

Usage:
    python tools/voice_scraper.py [resourceA,resourceB,...] \
        [--index tools/voice_index.json] [--force-rebuild] [--refresh] \
        [--cache-dir zzz/voice_html]
"""

import argparse
import os
import os.path
import re
from html import unescape
from urllib.parse import quote

import requests
from lxml import etree, html

from wiki_util import loadJson, dumpJson, ensureDirs

VOICE_MASTER = "_data/VoiceMaster.json"
CARD_MASTER = "_data/CardMaster.json"
SIDEKICK_MASTER = "_data/SidekickMaster.json"

BASE_URL = "https://wikiwiki.jp/live-a-hero/"
HEADER = {"User-Agent": "LiveAHeroAPI"}

VOICE_KIND_MAP = {
    1: "h_gachaResult",
    2: "s_gachaResult",
    3: "daily",
    4: "player",
    5: "hero",
    6: "relation",
    7: "salesStart",
    8: "salesEnd",
    9: "train",
    10: "trained",
    11: "appreciation",
    12: "touch",
    13: "loveIndexMax",
    14: "rankMax",
    15: "battleStart",
    16: "action",
    17: "attack",
    18: "skillA",
    19: "skillB",
    20: "smallDamage",
    21: "bigDamage",
    22: "assist",
    23: "assisted",
    24: "special",
    25: "win",
    26: "lose",
    27: "eventA",
    28: "eventB",
    29: "eventC",
    30: "eventD",
    # 32-35 are not fixed, need to check voiceFilename in VoiceMaster
    32: "h_gachaResult_another",
    33: "player_another",
    34: "hero_another",
    35: "touch_another",
}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
_FULLWIDTH_TABLE = str.maketrans("０１２３４５６７８９（）", "0123456789()")


def _norm_label(label: str) -> str:
    """Normalize fullwidth digits/parentheses to ASCII so VoiceMaster labels match wiki labels."""
    return label.translate(_FULLWIDTH_TABLE)


# Wiki pages occasionally use a label text that differs from VoiceMaster's buttonLabel.
# Map the wiki variant to the normalized VoiceMaster string so it resolves correctly.
_LABEL_ALIASES = {
    ("35", "ヒーロー契約2"): "ヒーロー契約時2",  # Exio wiki omits 時; VoiceMaster has ヒーロー契約時２
    ("25", "必殺技(変化後)"): "必殺技(変化時)", # Andrew anniversary
    ("128", "最高ランク到"): "最高ランク到達", # Phein
}

_JP_NAME_TO_WIKI_PAGES = {
    "コウキ": "コウキ＆シリウス",
}

DEFAULT_SPOILER_TEXT = "ここにテキストを入力"

def _cid(sid: int) -> int:
    """Derive characterId from stockId."""
    return (sid // 10) % 1000


def build_name_lookup(card: dict, sidekick: dict) -> dict:
    """Return {characterId: cardName} using the minimum-stockId entry per character."""
    names = {}  # characterId -> (min_stockId, cardName)
    for e in list(card.values()) + list(sidekick.values()):
        cid = e["characterId"]
        sid = e["stockId"]
        cur = names.get(cid)
        if cur is None or sid < cur[0]:
            names[cid] = (sid, e["cardName"])
    return {cid: v[1] for cid, v in names.items()}


def build_voice_meta(voice_master: dict) -> dict:
    """Return {stockId_int: {"hero": {partName: filename}, "sidekick": {partName: filename}}}."""
    result = {}
    for sid_str, entries in voice_master.items():
        sid = int(sid_str)
        meta = {"hero": {}, "sidekick": {}}
        for e in entries:
            part = VOICE_KIND_MAP.get(e.get("voiceKind"))
            if part is None:
                continue
            type_key = "hero" if e["cardType"] == 1 else "sidekick"
            filename = e.get("voiceFilename") or ""
            if not filename:
                filename = f"voice_{e['resourceName']}_{part}"
            meta[type_key][part] = filename
        result[sid] = meta
    return result


def build_label_maps(voice_master: dict):
    """Return (hero_map, sidekick_map): {buttonLabel -> partName} built from VoiceMaster."""
    hero_map = {}
    sidekick_map = {}
    for entries in voice_master.values():
        for e in entries:
            label = e.get("buttonLabel", "").strip()
            part = VOICE_KIND_MAP.get(e.get("voiceKind"))
            if not label or part is None:
                continue
            label = _norm_label(label)
            if e["cardType"] == 1:
                hero_map[label] = part
            else:
                sidekick_map[label] = part
    return hero_map, sidekick_map


# --------------------------------------------------------------------------- #
# Index building
# --------------------------------------------------------------------------- #
def build_index(voice_master: dict) -> dict:
    """Build the initial index from VoiceMaster (structure) + CardMaster/SidekickMaster (jp_name)."""
    card = loadJson(CARD_MASTER)
    sidekick = loadJson(SIDEKICK_MASTER)
    name_lookup = build_name_lookup(card, sidekick)

    chars = {}  # characterId -> {(type, stockId): child}

    for sid_str, entries in voice_master.items():
        sid = int(sid_str)
        cid = _cid(sid)
        resource = entries[0]["resourceName"]
        types_present = {e["cardType"] for e in entries}
        if 1 in types_present:
            chars.setdefault(cid, {}).setdefault(
                ("hero", sid),
                {"stockId": sid, "type": "hero", "resourceName": resource},
            )
        if 2 in types_present:
            chars.setdefault(cid, {}).setdefault(
                ("sidekick", sid),
                {"stockId": sid, "type": "sidekick", "resourceName": resource},
            )

    index = {}
    for cid in sorted(chars):
        jp_name = name_lookup.get(cid, str(cid))
        children = sorted(chars[cid].values(), key=lambda c: c["stockId"])
        index[str(cid)] = {"jp_name": jp_name, "children": children}
    return index


def augment_index(index: dict, voice_master: dict, name_lookup: dict) -> bool:
    """Add new stockId children (and new character entries) discovered in VoiceMaster.

    Returns True if the index was modified.
    """
    changed = False
    for sid_str, entries in voice_master.items():
        sid = int(sid_str)
        cid = _cid(sid)
        cid_str = str(cid)
        resource = entries[0]["resourceName"]
        types_present = {e["cardType"] for e in entries}

        if cid_str not in index:
            index[cid_str] = {"jp_name": name_lookup.get(cid, str(cid)), "children": []}
            changed = True

        entry = index[cid_str]
        existing = {(c["type"], c["stockId"]) for c in entry["children"]}
        added = False

        for ctype, type_key in ((1, "hero"), (2, "sidekick")):
            if ctype in types_present and (type_key, sid) not in existing:
                entry["children"].append({"stockId": sid, "type": type_key, "resourceName": resource})
                added = True
                changed = True

        if added:
            entry["children"].sort(key=lambda c: c["stockId"])

    return changed


# --------------------------------------------------------------------------- #
# HTML fetching (cache-aware)
# --------------------------------------------------------------------------- #
def fetch_html(jp_name: str, cache_dir: str, refresh: bool) -> str:
    safe = jp_name.replace("/", "_").replace("\\", "_")
    cache_path = os.path.join(cache_dir, safe + ".html")

    if not refresh and os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            return f.read()

    jp_name = _JP_NAME_TO_WIKI_PAGES.get(jp_name, jp_name)
    url = BASE_URL + quote(jp_name, safe="")
    print(f"GET {url}")
    resp = requests.get(url, headers=HEADER)
    resp.encoding = "utf-8"
    if resp.status_code != 200:
        raise FileNotFoundError(f"{url} -> HTTP {resp.status_code}")

    ensureDirs(cache_path)
    with open(cache_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(resp.text)
    return resp.text


# --------------------------------------------------------------------------- #
# Parsing
# --------------------------------------------------------------------------- #
BR_PATTERN = re.compile(r"<br\b[^>]*>", re.IGNORECASE)
RUBY_DROP_PATTERN = re.compile(r"<(rp|rt)\b[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
# Strip every tag except the normalized <br> line breaks.
TAG_PATTERN = re.compile(r"<(?!br>)[^>]*>")


def cell_text(td) -> str:
    """Extract the JP text of a voice cell, keeping <br> line breaks but dropping
    ruby readings and wrapper spans, to match the existing jp_serif format."""
    chunks = [td.text or ""]
    for child in td:
        chunks.append(etree.tostring(child, encoding="unicode", method="html"))
    s = "".join(chunks)
    #s = RUBY_DROP_PATTERN.sub("", s)   # drop <rt>/<rp> reading annotations
    s = BR_PATTERN.sub("<br>", s)      # normalize <br class="spacer"> -> <br>
    s = TAG_PATTERN.sub("", s)         # strip remaining tags (ruby, spans, ...)
    s = s.replace(DEFAULT_SPOILER_TEXT, "")
    s = unescape(s).strip()
    return re.sub(r"^(?:<br>)+|(?:<br>)+$", "", s)  # trim leading/trailing breaks


def _label_text(td) -> str:
    return "".join(td.itertext()).strip()


def parse_voice(content: str, hero_map: dict, sidekick_map: dict, characterId: str):
    """Parse a page's HTML and return the ordered list of voice sections:

        [{"type": "hero"|"sidekick",
          "summary": "<fold-summary text>",
          "parts": [{"partName": ..., "jp": ...}, ...],
          "unmatched": [<col1 label>, ...]}, ...]

    Matching the sections back to the index is left to the caller.
    """
    tree = html.fromstring(content)
    sections = []

    for summary in tree.xpath("//div[contains(@class,'fold-summary')]"):
        title = summary.text_content().strip()
        if not title.endswith("/ボイス"):
            continue  # skip タイトルコール, キャラクターPV, nested spoiler folds, etc.

        is_sidekick = title.startswith("サイドキック")
        mapping = sidekick_map if is_sidekick else hero_map

        container = summary.getparent()
        contents = container.xpath("./div[contains(@class,'fold-content')]")
        if not contents:
            continue

        parts = []
        unmatched = []
        # .//table absorbs nested spoiler tables (e.g. 第2部2章13話クリア後).
        for table in contents[0].xpath(".//table"):
            for tr in table.xpath(".//tr"):
                tds = tr.findall("td")
                if len(tds) < 2:
                    continue  # heading row (th) or malformed -> skip silently
                label = _norm_label(_label_text(tds[0]))
                label = _LABEL_ALIASES.get((characterId, label), label)
                part_name = mapping.get(label)
                if part_name is None:
                    unmatched.append(label)
                    continue
                parts.append({"partName": part_name, "jp": cell_text(tds[1])})

        sections.append(
            {
                "type": "sidekick" if is_sidekick else "hero",
                "summary": title,
                "parts": parts,
                "unmatched": unmatched,
            }
        )

    return sections


# --------------------------------------------------------------------------- #
# Merging parsed sections back into the index
# --------------------------------------------------------------------------- #
def merge_sections(entry: dict, sections: list, voice_meta: dict):
    """Assign each parsed section's parts to the right child, add voiceFilename, and log leftovers."""
    jp_name = entry["jp_name"]
    children = entry["children"]
    hero_children = [c for c in children if c["type"] == "hero"]
    sidekick_children = [c for c in children if c["type"] == "sidekick"]

    hero_sections = [s for s in sections if s["type"] == "hero"]
    side_sections = [s for s in sections if s["type"] == "sidekick"]

    def enrich_parts(child, parts):
        type_key = child["type"]
        fm = voice_meta.get(child["stockId"], {}).get(type_key, {})
        for p in parts:
            p["voiceFilename"] = fm.get(
                p["partName"],
                f"voice_{child['resourceName']}_{p['partName']}",
            )
        return parts

    def log_unmatched(sec):
        for label in sec["unmatched"]:
            print(f"  [{jp_name}] [{sec['summary']}] unmatched row: {label!r}")

    # Heroes: positional match in document / stockId order.
    for i, sec in enumerate(hero_sections):
        if i < len(hero_children):
            hero_children[i]["parts"] = enrich_parts(hero_children[i], sec["parts"])
        else:
            print(f"  [{jp_name}] extra hero section '{sec['summary']}' has no matching child")
        log_unmatched(sec)
    if len(hero_children) > len(hero_sections):
        missing = len(hero_children) - len(hero_sections)
        print(f"  [{jp_name}] {missing} hero child(ren) had no voice section")

    # Sidekick: the single sidekick child.
    for sec in side_sections:
        if sidekick_children:
            sidekick_children[0]["parts"] = enrich_parts(sidekick_children[0], sec["parts"])
        else:
            print(f"  [{jp_name}] sidekick section '{sec['summary']}' but no sidekick child")
        log_unmatched(sec)
    if len(side_sections) > 1:
        print(f"  [{jp_name}] {len(side_sections)} sidekick sections found (expected 1)")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "resources",
        nargs="?",
        help="Comma-separated resourceName list restricting which characters to fetch "
        "(default: all characters).",
    )
    parser.add_argument("--index", default="tools/voice_index.json", help="Index file path")
    parser.add_argument("--force-rebuild", action="store_true", help="Rebuild index from masters")
    parser.add_argument("--refresh", action="store_true", help="Ignore cached HTML, re-download")
    parser.add_argument("--cache-dir", default="zzz/voice_html", help="Raw HTML cache directory")
    args = parser.parse_args(argv)

    voice_master = loadJson(VOICE_MASTER)
    voice_meta = build_voice_meta(voice_master)
    hero_map, sidekick_map = build_label_maps(voice_master)

    if args.force_rebuild or not os.path.exists(args.index):
        print("Building index from masters...")
        index = build_index(voice_master)
    else:
        print(f"Loading index from {args.index}")
        index = loadJson(args.index)
        card = loadJson(CARD_MASTER)
        sidekick_master = loadJson(SIDEKICK_MASTER)
        name_lookup = build_name_lookup(card, sidekick_master)
        if augment_index(index, voice_master, name_lookup):
            print("Index augmented with new stockId data from VoiceMaster")

    wanted = None
    if args.resources:
        wanted = {r.strip() for r in args.resources.split(",") if r.strip()}

    for cid, entry in index.items():
        if wanted is not None and not any(
            c["resourceName"] in wanted for c in entry["children"]
        ):
            continue

        jp_name = entry["jp_name"]
        print(f"Processing {cid} ({jp_name})")
        try:
            content = fetch_html(jp_name, args.cache_dir, args.refresh)
        except Exception as exc:  # network / missing page -> log and continue
            print(f"  [{jp_name}] fetch failed: {exc}")
            continue

        sections = parse_voice(content, hero_map, sidekick_map, cid)
        if not sections:
            print(f"  [{jp_name}] no voice sections found")
            continue
        merge_sections(entry, sections, voice_meta)

    ensureDirs(args.index)
    dumpJson(args.index, index, indent="\t")
    print(f"Wrote {args.index}")


if __name__ == "__main__":
    main()
