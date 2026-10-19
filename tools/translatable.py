"""Which voice lines / bios can a contributor still translate?

Rule (docs/CONTRIBUTOR_EDITING_PLAN.md, "game text wins"), applied per language (en, hans, hant): a line is
translatable into a language only while the game's text in it is missing or equal to the JP text. The
sheet-only "manual" voice parts (battleStart, action ...) never come from the game, so they are always
translatable. A roster entry lists the languages still open in `langs`; a line is listed while any is open.

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


# Roster language codes: the game's `{lang}_*` processed files and the roster's `langs` / text fields use them.
LANGS = ("en", "hans", "hant")


def _entry(jp: str, current: dict, open_langs) -> dict | None:
    """{ jp, en?, hans?, hant?, langs } (a text omitted when empty), None when no language is open any more."""
    langs = [lang for lang in LANGS if lang in open_langs]
    if not langs:
        return None
    entry = {"jp": jp}
    for lang in LANGS:
        if current.get(lang):
            entry[lang] = current[lang]
    entry["langs"] = langs
    return entry


def is_translatable(jp: str, game_text: str) -> bool:
    """The game's text (of one language) is missing or just the JP text."""
    return bool(jp) and (not game_text or game_text == jp)


def effective_text(jp: str, game_text: str, community: str) -> str:
    """The text a page shows: the game's, unless it is missing or just the JP text, then the community's."""
    return game_text if game_text and game_text != jp else community


def bio_translatable(jp_bio: dict, en_bio: dict, community: dict | None = None,
                     zh_bio: dict | None = None, zh_community: dict | None = None) -> dict:
    """{ bioKey: { jp, en?, hans?, hant?, langs } } of the bios the game has no real text for in some language.

    `zh_bio` / `zh_community` are { "hans": {...}, "hant": {...} } (a missing language counts as empty).
    Each text field is the current effective text of its language: the game's, else the community's."""
    game = {"en": en_bio or {}, **{lang: (zh_bio or {}).get(lang, {}) for lang in LANGS[1:]}}
    comm = {"en": community or {}, **{lang: (zh_community or {}).get(lang, {}) for lang in LANGS[1:]}}
    result = {}
    for key, jp in jp_bio.items():
        open_langs = {lang for lang in LANGS if is_translatable(jp, game[lang].get(key, ""))}
        current = {lang: effective_text(jp, game[lang].get(key, ""), comm[lang].get(key, "")) for lang in LANGS}
        entry = _entry(jp, current, open_langs)
        if entry:
            result[key] = entry
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
    """{ voiceKey: { jp, en?, hans?, hant?, langs } } of the translatable lines the voice table of `name` renders.

    `data` holds the loaded _data/processed json under the keys jp_serif, jp_greeting, jp_voice,
    {en,hans,hant}_{serif,greeting,voice} and voice_master_keys (a missing one counts as empty)."""
    def table(kind: str, lang: str) -> dict:
        return data.get(f"{lang}_{kind}", {})

    jp_serif = data.get("jp_serif", {})
    jp_greeting = data.get("jp_greeting", {})
    jp_voice = data.get("jp_voice", {})

    lines = {}
    upper = f"_{name.upper()}_"

    def add_game_line(key: str, jp: str, game_kind: str, game_key: str):
        """A greeting or SERIF line: the game's text per language, the sheet's (`{lang}_voice`) as the community text."""
        game = {lang: table(game_kind, lang).get(game_key, "") for lang in LANGS}
        open_langs = {lang for lang in LANGS if is_translatable(jp, game[lang])}
        current = {lang: effective_text(jp, game[lang], table("voice", lang).get(key, "")) for lang in LANGS}
        entry = _entry(jp, current, open_langs)
        if entry:
            lines[key] = entry

    for part in GREETING_PARTS:
        key = f"voice_{name}_{part}"
        jp = jp_greeting.get(key, "")
        if jp:
            add_game_line(key, jp, "greeting", key)

    for upper_part, part in SERIF_WHITELIST.items():
        if "PLAYER" in upper and upper_part != "TRAINED":
            continue
        serif_key = f"SERIF{upper}{upper_part}"
        jp = jp_serif.get(serif_key, "")
        if jp:
            add_game_line(f"voice_{name}_{part}", jp, "serif", serif_key)

    known = data.get("voice_master_keys", {}).get(name, ())
    for part in MANUAL_PARTS:
        key = f"voice_{name}_{part}"
        jp = jp_voice.get(key, "")
        current = {lang: table("voice", lang).get(key, "") for lang in LANGS}
        if jp or any(current.values()) or key in known:
            lines[key] = _entry(jp, current, LANGS)

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


def bio_inputs(data: dict) -> dict:
    """The keyword arguments of `bio_translatable` for the zh game text and community text of `load_processed` data."""
    return {
        "community": data.get("en_bio_community", {}),
        "zh_bio": {lang: data.get(f"{lang}_bio", {}) for lang in LANGS[1:]},
        "zh_community": {lang: data.get(f"{lang}_bio_community", {}) for lang in LANGS[1:]},
    }


def load_processed(base: str = "_data/processed") -> dict:
    """The json inputs of voice_resource_lines / bio_translatable (a missing file counts as empty)."""
    data = {}
    names = ["jp_serif", "jp_greeting", "jp_voice", "jp_bio"]
    for lang in LANGS:
        names += [f"{lang}_{kind}" for kind in ("serif", "greeting", "voice", "bio", "bio_community")]
    for name in names:
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
