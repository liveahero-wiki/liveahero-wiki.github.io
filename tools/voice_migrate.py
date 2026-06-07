"""One-time migration: extract English translations from _charas/*.md voice-table
includes into zzz/TempVoice.json, then rewrite legacy 'skill' parts to skillA/skillB.

Usage:
    python tools/voice_migrate.py extract        # Phase 1
    python tools/voice_migrate.py rewrite_skill  # Phase 2
"""

import argparse
import glob
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util

CHARA_DIR = "_charas"
TEMP_VOICE_PATH = "zzz/TempVoice.json"
VOICE_MASTER_PATH = "_data/VoiceMaster.json"

# Attribute name as written in _charas/*.md → canonical partName in voice_index / sheet
ATTR_TO_PART: dict[str, str] = {
    "h_gachaResult": "h_gachaResult",
    "s_gachaResult": "s_gachaResult",
    "salesStart": "salesStart",
    "salesEnd": "salesEnd",
    "battleStart": "battleStart",
    "boss_battleStart": "boss_battleStart",
    "action": "action",
    "attack": "attack",
    "skill": "skill",
    "skillA": "skillA",
    "skillB": "skillB",
    "special": "special",
    "special2": "special2",
    "smallDamage": "smallDamage",
    "bigDamage": "bigDamage",
    "win": "win",
    "lose": "lose",
    "assist": "assist",
    "assisted": "assisted",
    "rankMax": "rankMax",
    "loveIndexMax": "loveIndexMax",
    "APPRECIATION": "appreciation",
    "DAILY": "daily",
    "HERO": "hero",
    "HERO2": "hero2",
    "PLAYER": "player",
    "PLAYER2": "player2",
    "RELATION": "relation",
    "TOUCH": "touch",
    "TOUCH2": "touch2",
    "TRAIN": "train",
    "TRAINED": "trained",
    "EVENTA": "eventA",
    "EVENTB": "eventB",
    "EVENTC": "eventC",
    "EVENTD": "eventD",
}

_SKIP_ATTRS = {"style", "resourceName"}

_INCLUDE_BLOCK_RE = re.compile(
    r"\{%-?\s*include\s+voice-table\.html\s+(.*?)-?%\}",
    re.DOTALL,
)
_ATTR_RE = re.compile(r"(\w+)\s*=\s*\"([^\"]*)\"")


def _normalize_attr(attr_name: str) -> str | None:
    """Return canonical partName, or None to skip."""
    if attr_name in _SKIP_ATTRS:
        return None
    if attr_name in ATTR_TO_PART:
        return ATTR_TO_PART[attr_name]
    print(f"  [WARN] Unknown attribute: {attr_name!r}")
    return attr_name


def _parse_block(block: str) -> tuple[list[str], list[tuple[str, str]]]:
    """Return (resourceNames, [(attr_name, value), ...]) for one include block."""
    resource_name = ""
    attrs: list[tuple[str, str]] = []
    for m in _ATTR_RE.finditer(block):
        key, value = m.group(1), m.group(2)
        if key == "resourceName":
            resource_name = value
        else:
            attrs.append((key, value))
    rns = [r.strip() for r in resource_name.split(",") if r.strip()]
    return rns, attrs


def cmd_extract(args):
    chara_files = sorted(glob.glob(os.path.join(CHARA_DIR, "*.md")))
    print(f"Scanning {len(chara_files)} character files...")

    # rn → {part: enApproved} — later values override earlier ones
    temp: dict[str, dict[str, str]] = {}

    for md_path in chara_files:
        with open(md_path, "r", encoding="utf-8") as f:
            content = f.read()

        for match in _INCLUDE_BLOCK_RE.finditer(content):
            rns, attrs = _parse_block(match.group(1))
            if not rns:
                continue
            # Drop empty-value attributes
            attrs = [(k, v) for k, v in attrs if v.strip()]
            if not attrs:
                continue

            if len(rns) == 1:
                rn = rns[0]
                for attr_name, value in attrs:
                    part = _normalize_attr(attr_name)
                    if part is not None:
                        temp.setdefault(rn, {})[part] = value
            else:
                # Comma-separated resourceNames: use prefix matching to assign attrs
                rn_upper_map = {rn.upper(): rn for rn in rns}
                assigned: set[str] = set()

                for attr_name, value in attrs:
                    for rn_upper, rn in rn_upper_map.items():
                        prefix = rn_upper + "_"
                        if attr_name.upper().startswith(prefix):
                            suffix = attr_name[len(prefix):]
                            part = _normalize_attr(suffix)
                            if part is not None:
                                temp.setdefault(rn, {})[part] = value
                            assigned.add(attr_name)
                            break

                # Attrs not matched to any specific resourceName → assign to all
                for attr_name, value in attrs:
                    if attr_name not in assigned:
                        part = _normalize_attr(attr_name)
                        if part is None:
                            continue
                        for rn in rns:
                            temp.setdefault(rn, {})[part] = value

    result = {
        rn: [{"part": part, "enApproved": val} for part, val in parts.items()]
        for rn, parts in sorted(temp.items())
    }

    wiki_util.ensureDirs(TEMP_VOICE_PATH)
    wiki_util.dumpJson(TEMP_VOICE_PATH, result, indent=2)
    total = sum(len(v) for v in result.values())
    print(f"Extracted {len(result)} resourceNames, {total} total parts → {TEMP_VOICE_PATH}")


def _build_rn_voicekinds(voice_master: dict) -> dict[str, set[int]]:
    rn_vk: dict[str, set[int]] = {}
    for entries in voice_master.values():
        for entry in entries:
            rn = entry.get("resourceName", "")
            vk = entry.get("voiceKind")
            if rn and vk is not None:
                rn_vk.setdefault(rn, set()).add(int(vk))
    return rn_vk


def cmd_rewrite_skill(args):
    temp_voice: dict = wiki_util.loadJson(TEMP_VOICE_PATH)
    voice_master: dict = wiki_util.loadJson(VOICE_MASTER_PATH)
    rn_vk = _build_rn_voicekinds(voice_master)

    changed = 0
    warned = 0

    for rn, parts_list in temp_voice.items():
        part_names = {p["part"] for p in parts_list}
        if "skill" not in part_names:
            continue
        if "skillA" in part_names or "skillB" in part_names:
            continue

        vk_set = rn_vk.get(rn, set())
        has_18 = 18 in vk_set
        has_19 = 19 in vk_set

        if not has_18 and not has_19:
            print(f"  [WARN] {rn}: has 'skill' but no skillA/skillB voiceKind in VoiceMaster — left as-is")
            warned += 1
            continue

        if has_18 and has_19:
            print(f"  [WARN] {rn}: has both skillA and skillB voiceKinds; renaming 'skill' → 'skillA' (review skillB manually)")
            warned += 1
            continue

        target = "skillA" if has_18 else "skillB"

        for p in parts_list:
            if p["part"] == "skill":
                p["part"] = target
                changed += 1

    wiki_util.dumpJson(TEMP_VOICE_PATH, temp_voice, indent=2)
    print(f"Renamed {changed} 'skill' → skillA/skillB ({warned} warnings) → {TEMP_VOICE_PATH}")


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding="utf-8")

    parser = argparse.ArgumentParser(description="Voice translation migration tool")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("extract", help="Phase 1: extract translations from _charas/*.md")
    subparsers.add_parser("rewrite_skill", help="Phase 2: rewrite 'skill' part to skillA/skillB")

    args = parser.parse_args()

    if args.command == "extract":
        cmd_extract(args)
    elif args.command == "rewrite_skill":
        cmd_rewrite_skill(args)


if __name__ == "__main__":
    main()
