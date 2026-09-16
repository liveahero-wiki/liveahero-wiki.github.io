"""Generate api/mob.json (mobs index) and combined per-series APNG icons.

Reads the curated mob list from mobs.md and, for each mob series, combines
its per-element icon PNGs (cdn/Sprite/icon_*.png) into a single auto-cycling
APNG under assets/img/mob/.

Local-only: source icons live under cdn/Sprite/, which is not available in
GitHub Actions CI. Run this manually and commit the generated outputs.

Usage:
    python tools/generate_mob_index.py
    python tools/generate_mob_index.py --test-run Acolyte
    python tools/generate_mob_index.py --force
"""

import argparse
import hashlib
import os
import re
from collections import Counter

from PIL import Image

from wiki_util import dumpJson

MOBS_MD = "mobs.md"
CDN_SPRITE = os.path.join("cdn", "Sprite")
OUT_DIR = os.path.join("assets", "img", "mob")
API = "api"

ICON_SIZE = 128

INDEX_SCHEMA_REV = "r1"

ELEMENT_ORDER = ["Fire", "Earth", "Water", "Light", "Shadow"]
ELEMENT_PATTERN = re.compile("|".join(ELEMENT_ORDER))

# Mark a series as a subvariant of another (heading -> parent heading). This
# only links the two in the JSON output; each still gets its own icon.
SUBVARIANT_OF = {
    "Ninja Trainee": "Trainee",
    "Ninja Trainee (Transform)": "Trainee (Transform)",
}

# Override the auto-detected category (default: "kaibutsu" if the heading
# contains "Kaibutsu", else "villain") for headings that don't fit that rule.
CATEGORY_OVERRIDES = {
    "Imposter": "kaibutsu",
    "Id Replica": "kaibutsu",
}

BLACKLIST = set([
    "Eno Seaman",
])

HARDCODE_KAIBUTSU = [
    {
        "id": "gatekeeper",
        "name": "Gatekeeper",
        "category": "kaibutsu",
        "parentSeries": None,
        "icon": "/" + OUT_DIR.replace(os.sep, "/") + "/icon_kaibutsuArmorBlack_h01.png",
        "sprites": [
            "fg_kaibutsuArmorBlack_h01.png"
        ],
    },
    {
        "id": "tear-kaibutsu",
        "name": "Tear (Kaibutsu)",
        "category": "kaibutsu",
        "parentSeries": None,
        "icon": "/" + OUT_DIR.replace(os.sep, "/") + "/icon_kaibutsuHokorobi_h01.png",
        "sprites": [
            "fg_kaibutsuHokorobi_h01.png"
        ],
    },
]

NAME_OVERRIDE_MAP = {
    "Villain": "Wolfman",
    "Villain (Summer)": "Wolfman (Summer)",
    "Villain (Transform)": "Wolfman (Transform)",
}

HEADING_PATTERN = re.compile(
    r'^### (?P<heading>.+?)\s*\n+'
    r'\{%\s*include\s+hero-infobox-unreleased\.html\s+(?P<attrs>.*?)%\}',
    re.DOTALL | re.MULTILINE,
)
SPRITES_ATTR_PATTERN = re.compile(r'sprites="([^"]*)"')
MOB_ATTR_PATTERN = re.compile(r'\bmob=true\b')


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def parse_mobs_md(path=MOBS_MD):
    """Return [{heading, sprites}, ...] for every `mob=true` entry, in file order."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    entries = []
    for m in HEADING_PATTERN.finditer(text):
        attrs = m.group("attrs")
        if not MOB_ATTR_PATTERN.search(attrs):
            continue
        sm = SPRITES_ATTR_PATTERN.search(attrs)
        if not sm:
            continue
        sprites = [s.strip() for s in sm.group(1).split(",") if s.strip()]
        entries.append({"heading": m.group("heading").strip(), "sprites": sprites})
    return entries


def element_rank(sprite):
    m = ELEMENT_PATTERN.search(sprite)
    return ELEMENT_ORDER.index(m.group(0)) if m else len(ELEMENT_ORDER)


def icon_filename(sprite):
    """fg_villainAcolyteEarth_s01 -> icon_villainAcolyteEarth_s01.png"""
    assert sprite.startswith("fg_"), f"unexpected sprite name: {sprite}"
    return "icon_" + sprite[len("fg_"):] + ".png"


VILLAIN_PREFIX_PATTERN = re.compile(r'^fg_villain([A-Z].*)$')


def strip_villain_prefix(sprite):
    """fg_villainAndroidSoldierFire_s01 -> fg_androidSoldierFire_s01, or None
    if sprite isn't villain-prefixed."""
    m = VILLAIN_PREFIX_PATTERN.match(sprite)
    if not m:
        return None
    rest = m.group(1)
    return "fg_" + rest[0].lower() + rest[1:]


def strip_element(filename):
    return ELEMENT_PATTERN.sub("", filename, count=1)


def combined_filename(icon_filenames):
    """Delete the element word from each icon filename; the most common
    result is the combined series filename (icon_wolfmanFire_h01.png,
    icon_wolfmanEarth_h01.png, ... -> icon_wolfman_h01.png)."""
    stripped = [strip_element(f) for f in icon_filenames]
    return Counter(stripped).most_common(1)[0][0]


def resolve_icons(sprites):
    """[(sprite, path), ...] for sprites whose icon file exists on disk."""
    resolved = []
    for sprite in sprites:
        path = os.path.join(CDN_SPRITE, icon_filename(sprite))
        if os.path.exists(path):
            resolved.append((sprite, path))
        else:
            print(f"  warning: missing icon for {sprite} ({path})")
    return resolved


def build_series(entry):
    heading = entry["heading"]
    sprites = entry["sprites"]

    if heading in BLACKLIST:
        return None

    heading = NAME_OVERRIDE_MAP.get(heading, heading)

    resolved = resolve_icons(sprites)
    if not resolved:
        stripped = [strip_villain_prefix(s) for s in sprites]
        if all(stripped):
            print(f"  no icons found for villain-prefixed sprites, retrying without 'villain' prefix")
            resolved = resolve_icons(stripped)
    if not resolved:
        print(f"  warning: no icons resolved for '{heading}', skipping")
        return None

    # Cycle fire -> earth -> water -> light -> shadow, regardless of the
    # order sprites happen to be listed in mobs.md.
    resolved.sort(key=lambda pair: element_rank(pair[0]))
    icon_paths = [path for _, path in resolved]

    out_filename = combined_filename([os.path.basename(p) for p in icon_paths])
    out_path = os.path.join(OUT_DIR, out_filename)

    parent = SUBVARIANT_OF.get(heading)
    category = CATEGORY_OVERRIDES.get(heading)
    if category is None:
        category = "kaibutsu" if "Kaibutsu" in heading else "villain"

    return {
        "id": slugify(heading),
        "name": heading,
        "category": category,
        "parentSeries": slugify(parent) if parent else None,
        "icon": "/" + out_path.replace(os.sep, "/"),
        "sprites": sprites,
        "_icon_paths": icon_paths,
        "_out_path": out_path,
    }


def _fit_to_canvas(frame):
    """Force a frame to exactly ICON_SIZE x ICON_SIZE.

    Source sprites have their transparent margins auto-trimmed by the game's
    asset pipeline, so they aren't reliably ICON_SIZE x ICON_SIZE. An APNG's
    first frame must match the IHDR canvas size exactly, or non-APNG-aware
    decoders (which read IDAT using IHDR's dimensions) desync every scanline
    and render garbage.
    """
    if frame.size == (ICON_SIZE, ICON_SIZE):
        return frame
    if frame.width > ICON_SIZE or frame.height > ICON_SIZE:
        return frame.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    canvas.paste(frame, (0, 0))
    return canvas


def write_apng(series, force):
    out_path = series["_out_path"]
    if os.path.exists(out_path) and not force:
        return "skipped"

    frames = [Image.open(p).convert("RGBA") for p in series["_icon_paths"]]
    frames = [_fit_to_canvas(frame) for frame in frames]
    os.makedirs(OUT_DIR, exist_ok=True)
    if len(frames) == 1:
        frames[0].save(out_path)
    else:
        frames[0].save(out_path, save_all=True, append_images=frames[1:],
                        duration=1000, loop=0, disposal=2)
    return "written"


def get_version():
    path = os.path.join("tools", "masterdata_ver.txt")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            v = f.read().strip()
        if v:
            return v
    h = hashlib.sha1()
    with open(MOBS_MD, "rb") as f:
        h.update(f.read())
    return h.hexdigest()[:12]


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test-run", metavar="NAME", default=None,
                        help="Only process the mob series matching this heading name or slug.")
    parser.add_argument("--force", action="store_true",
                        help="Rewrite APNG files even if they already exist.")
    return parser.parse_args()


def main():
    args = parse_args()
    entries = parse_mobs_md()

    if args.test_run:
        needle_slug = slugify(args.test_run)
        entries = [e for e in entries if slugify(e["heading"]) == needle_slug]
        if not entries:
            print(f"no mob series matching '{args.test_run}'")
            return

    series_list = []
    written = skipped = 0
    for entry in entries:
        print(f"{entry['heading']}:")
        series = build_series(entry)
        if series is None:
            continue

        status = write_apng(series, args.force)
        written += status == "written"
        skipped += status == "skipped"
        print(f"  -> {series['_out_path']} ({status}, {len(series['_icon_paths'])} frame(s))")

        del series["_icon_paths"]
        del series["_out_path"]
        series_list.append(series)

    series_list.extend(HARDCODE_KAIBUTSU)

    version = f"{get_version()}-{INDEX_SCHEMA_REV}"
    index = {"version": version, "series": series_list}

    os.makedirs(API, exist_ok=True)
    dumpJson(os.path.join(API, "mob.json"), index, indent='\t')

    print(f"\nversion: {version}")
    print(f"series: {len(series_list)} (apng written: {written}, skipped: {skipped})")


if __name__ == "__main__":
    main()
