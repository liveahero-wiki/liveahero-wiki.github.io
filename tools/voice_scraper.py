"""Scrape character voice tables from the Japanese fan wiki (wikiwiki.jp/live-a-hero)
and assemble them into an index keyed by characterId.

The index is first built from the game masters (CardMaster.json / SidekickMaster.json),
then enriched with the `parts` (voice lines) scraped from each character's wiki page.
Reruns reload the existing index and only re-fetch the requested characters.

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
    13: "rankMax",
    15: "battleStart",
    16: "action",
    17: "attack",
    18: "skillA",
    19: "skillB",
    20: "smallDamage",
    21: "bigDamage",
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

# Voice-table column 1 label -> partName, split by section context.
# Some labels (トレーニング, アシスト, 他のヒーローについて) differ between hero/sidekick.
HERO_MAP = {
    "ヒーロー契約": "hero_gachaResult",
    "ヒーロー契約２": "hero_gachaResult_another",
    "あなたについて": "player",
    "あなたについて２": "player2",
    "他のヒーローについて": "hero",
    "他のヒーローについて２": "hero2",
    "営業出発": "salesStart",
    "営業帰着": "salesEnd",
    "トレーニング": "train",
    "イベント1": "eventA",
    "イベント2": "eventB",
    "イベント3": "eventC",
    "イベント4": "eventD",
    "タッチ": "touch",
    "タッチ２": "touch2",
    "最高ランク到達": "rankMax",
    "バトル開始": "battleStart",
    "行動時": "action",
    "攻撃時": "attack",
    "追加攻撃時": "skillA",
    "スキル": "skill",
    "スキル2": "skillB",
    "ダメージ１": "smallDamage",
    "ダメージ２": "bigDamage",
    "アシスト": "assisted",
    "必殺技": "special",
    "バトル勝利": "win",
    "バトル敗北": "lose",
}

SIDEKICK_MAP = {
    "サイドキック契約": "sidekick_gachaResult",
    "サイドキック契約2": "sidekick_gachaResult_another",
    "日常会話": "daily",
    "日常会話2": "daily2",
    "人間関係について": "relation",
    "人間関係について2": "relation2",
    "他のヒーローについて": "relation",
    "他のヒーローについて２": "relation2",
    "励まし": "appreciation",
    "励まし2": "appreciation2",
    "最大リレーション到達": "loveIndexMax",
    "トレーニング": "trained",
    "アシスト": "assist",
}


# --------------------------------------------------------------------------- #
# Index building
# --------------------------------------------------------------------------- #
def build_index() -> dict:
    """Build the initial index from CardMaster / SidekickMaster."""
    card = loadJson(CARD_MASTER)
    sidekick = loadJson(SIDEKICK_MASTER)

    chars = {}   # characterId -> {(type, stockId): child}
    names = {}   # characterId -> (min_stockId, cardName)

    def consume(entries, ctype):
        for e in entries.values():
            cid = e["characterId"]
            sid = e["stockId"]
            cur = names.get(cid)
            if cur is None or sid < cur[0]:
                names[cid] = (sid, e["cardName"])
            chars.setdefault(cid, {}).setdefault(
                (ctype, sid),
                {"stockId": sid, "type": ctype, "resourceName": e["resourceName"]},
            )

    consume(card, "hero")
    consume(sidekick, "sidekick")

    index = {}
    for cid in sorted(chars):
        # Sort by stockId; stable, so hero precedes sidekick on equal stockId.
        children = sorted(chars[cid].values(), key=lambda c: c["stockId"])
        index[str(cid)] = {"jp_name": names[cid][1], "children": children}
    return index


# --------------------------------------------------------------------------- #
# HTML fetching (cache-aware)
# --------------------------------------------------------------------------- #
def fetch_html(jp_name: str, cache_dir: str, refresh: bool) -> str:
    safe = jp_name.replace("/", "_").replace("\\", "_")
    cache_path = os.path.join(cache_dir, safe + ".html")

    if not refresh and os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            return f.read()

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
    s = unescape(s).strip()
    return re.sub(r"^(?:<br>)+|(?:<br>)+$", "", s)  # trim leading/trailing breaks


def _label_text(td) -> str:
    return "".join(td.itertext()).strip()


def parse_voice(content: str):
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
        mapping = SIDEKICK_MAP if is_sidekick else HERO_MAP

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
                label = _label_text(tds[0])
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
def merge_sections(entry: dict, sections: list):
    """Assign each parsed section's parts to the right child and log leftovers."""
    jp_name = entry["jp_name"]
    children = entry["children"]
    hero_children = [c for c in children if c["type"] == "hero"]
    sidekick_children = [c for c in children if c["type"] == "sidekick"]

    hero_sections = [s for s in sections if s["type"] == "hero"]
    side_sections = [s for s in sections if s["type"] == "sidekick"]

    def log_unmatched(sec):
        for label in sec["unmatched"]:
            print(f"  [{jp_name}] [{sec['summary']}] unmatched row: {label!r}")

    # Heroes: positional match in document / stockId order.
    for i, sec in enumerate(hero_sections):
        if i < len(hero_children):
            hero_children[i]["parts"] = sec["parts"]
        else:
            print(f"  [{jp_name}] extra hero section '{sec['summary']}' has no matching child")
        log_unmatched(sec)
    if len(hero_children) > len(hero_sections):
        missing = len(hero_children) - len(hero_sections)
        print(f"  [{jp_name}] {missing} hero child(ren) had no voice section")

    # Sidekick: the single sidekick child.
    for sec in side_sections:
        if sidekick_children:
            sidekick_children[0]["parts"] = sec["parts"]
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

    if args.force_rebuild or not os.path.exists(args.index):
        print("Building index from masters...")
        index = build_index()
    else:
        print(f"Loading index from {args.index}")
        index = loadJson(args.index)

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

        sections = parse_voice(content)
        if not sections:
            print(f"  [{jp_name}] no voice sections found")
            continue
        merge_sections(entry, sections)

    ensureDirs(args.index)
    dumpJson(args.index, index, indent="\t")
    print(f"Wrote {args.index}")


if __name__ == "__main__":
    main()
