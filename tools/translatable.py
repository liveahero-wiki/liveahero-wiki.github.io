"""Which voice lines / bios can a contributor still translate?

Rule (docs/CONTRIBUTOR_EDITING_PLAN.md, "game text wins"): a line is translatable only while the game's
EN text is missing or equal to the JP text. The sheet-only "manual" voice parts (battleStart, action ...)
never come from the game, so they are always translatable.

The voice row universe replicates `_includes/voice-table.html` (keep the two in sync): for every
resourceName of a voice table, the greeting parts, the whitelisted SERIF parts and the manual parts that
render a row (a manual part also when VoiceMaster knows the line: the game has no JP text for it, a
contributor can transcribe it). Keys are the sheet's `voice_<resourceName>_<part>`; the SERIF parts are lowercased/camel-cased
there (`eventA`) while the template's whitelist is upper case (`EVENTA`).

Pure functions only (no network, no sheet access) so the roster generator, the Bio upload and the tests
share them.
"""
import glob
import os
import re

import wiki_util

# Sheet part names of the SERIF lines (the includes' `voice-table.html` list the same names).
SERIF_PARTS = [
    "appreciation", "daily", "eventA", "eventB", "eventC", "eventD", "eventE", "hero", "hero2", "player", "player2",
    "relation", "touch", "touch2", "train", "trained",
]
# upper case (as in the SERIF_<NAME>_<PART> keys) -> sheet part name
SERIF_WHITELIST = {part.upper(): part for part in SERIF_PARTS}
MANUAL_PARTS = [
    "battleStart", "boss_battleStart", "action", "attack", "skill", "skillA", "skillB", "special", "special2",
    "smallDamage", "bigDamage", "win", "lose", "assist", "assisted", "loveIndexMax", "rankMax", "salesStart",
    "salesEnd",
]
GREETING_PARTS = ["h_gachaResult", "h_gachaResult_another", "s_gachaResult", "s_gachaResult_another"]
# VoiceMaster `voiceKind` -> MANUAL_PARTS name (same numbering as voice_scraper.VOICE_KIND_MAP).
VOICE_KIND_PARTS = {
    7: "salesStart",
    8: "salesEnd",
    13: "rankMax",
    14: "loveIndexMax",
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
}

VOICE_TABLE_PATTERN = re.compile(r'voice-table\.html\s+resourceName\s*=\s*"([^"]+)"')


def _lang_pair(jp: str, en: str) -> dict:
    """{ jp, en } with en omitted when empty."""
    entry = {"jp": jp}
    if en:
        entry["en"] = en
    return entry


def is_translatable(jp: str, game_en: str) -> bool:
    """The game's EN is missing or just the JP text."""
    return bool(jp) and (not game_en or game_en == jp)


def bio_translatable(jp_bio: dict, en_bio: dict, community: dict | None = None) -> dict:
    """{ bioKey: { jp, en? } } of the bios the game has no real EN text for.

    `en` is the current effective text: the game's (never set here, it is missing or equal to JP) else
    the community translation."""
    community = community or {}
    result = {}
    for key, jp in jp_bio.items():
        if is_translatable(jp, en_bio.get(key, "")):
            result[key] = _lang_pair(jp, community.get(key, ""))
    return result


def voice_master_keys(voice_master: dict) -> dict:
    """{ resourceName: {voice key} } of the manual voice lines VoiceMaster knows. The game ships no
    Japanese text for them, so they exist here even when the sheet has no row yet. The key is the entry's
    `voiceFilename`, else `voice_<resourceName>_<part>`; filenames that are not a manual part are skipped
    (the table could not render them)."""
    known: dict[str, set[str]] = {}
    for entries in voice_master.values():
        for e in entries:
            part = VOICE_KIND_PARTS.get(e.get("voiceKind"))
            name = e.get("resourceName", "")
            if not part or not name:
                continue
            key = e.get("voiceFilename") or f"voice_{name}_{part}"
            prefix = f"voice_{name}_"
            if key.startswith(prefix) and key[len(prefix):] in MANUAL_PARTS:
                known.setdefault(name, set()).add(key)
    return known


def voice_resource_lines(name: str, data: dict) -> dict:
    """{ voiceKey: { jp, en? } } of the translatable lines the voice table of `name` renders.

    `data` holds the loaded _data/processed json under the keys jp_serif, en_serif, jp_greeting,
    en_greeting, jp_voice, en_voice and voice_master_keys (a missing one counts as empty)."""
    jp_serif = data.get("jp_serif", {})
    en_serif = data.get("en_serif", {})
    jp_greeting = data.get("jp_greeting", {})
    en_greeting = data.get("en_greeting", {})
    jp_voice = data.get("jp_voice", {})
    en_voice = data.get("en_voice", {})

    lines = {}
    upper = f"_{name.upper()}_"

    for part in GREETING_PARTS:
        key = f"voice_{name}_{part}"
        jp = jp_greeting.get(key, "")
        game_en = en_greeting.get(key, "")
        if jp and is_translatable(jp, game_en):
            lines[key] = _lang_pair(jp, game_en or en_voice.get(key, ""))

    for upper_part, part in SERIF_WHITELIST.items():
        if "PLAYER" in upper and upper_part != "TRAINED":
            continue
        serif_key = f"SERIF{upper}{upper_part}"
        jp = jp_serif.get(serif_key, "")
        if not jp:
            continue
        game_en = en_serif.get(serif_key, "")
        if is_translatable(jp, game_en):
            key = f"voice_{name}_{part}"
            lines[key] = _lang_pair(jp, game_en if game_en and game_en != jp else en_voice.get(key, ""))

    known = data.get("voice_master_keys", {}).get(name, ())
    for part in MANUAL_PARTS:
        key = f"voice_{name}_{part}"
        jp = jp_voice.get(key, "")
        en = en_voice.get(key, "")
        if jp or en or key in known:
            lines[key] = _lang_pair(jp, en)

    return lines


def page_resource_names(*dirs: str) -> list[str]:
    """Every resourceName used by a `voice-table.html` include in the markdown files of `dirs`, split at
    commas ("player1,player2" shows one table for several names), in first-seen order."""
    names: list[str] = []
    seen: set[str] = set()
    for d in dirs:
        for path in sorted(glob.glob(os.path.join(d, "*.md"))):
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
            for m in VOICE_TABLE_PATTERN.finditer(text):
                for n in m.group(1).split(","):
                    n = n.strip()
                    if n and n not in seen:
                        seen.add(n)
                        names.append(n)
    return names


def load_processed(base: str = "_data/processed") -> dict:
    """The json inputs of voice_resource_lines / bio_translatable (a missing file counts as empty)."""
    data = {}
    for name in ("jp_serif", "en_serif", "jp_greeting", "en_greeting", "jp_voice", "en_voice",
                 "jp_bio", "en_bio", "en_bio_community"):
        try:
            data[name] = wiki_util.loadJson(os.path.join(base, f"{name}.json"))
        except FileNotFoundError:
            data[name] = {}
    try:
        voice_master = wiki_util.loadJson(os.path.join(base, os.pardir, "VoiceMaster.json"))
    except FileNotFoundError:
        voice_master = {}
    data["voice_master_keys"] = voice_master_keys(voice_master)
    return data
