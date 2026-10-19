#!python3
"""Voice line Google Sheet sync (the "Voice" tab of the translation sheet).

Columns: voiceFilename (key, `voice_<resourceName>_<part>`), jp, enMachineTranslated, enApproved, the optional
zhHansApproved / zhHantApproved (Chinese community translations) and the optional `source` (who wrote the
translation, e.g. `wiki-cms #1a2b3c4d (Name)`; with zhHansSource / zhHantSource for the Chinese columns; written
only by contrib_intake.py, never touched by `upload`: they are neither updatable nor patched, and new rows leave
them empty) and `jpSource` (the same label, set when a contributor transcribed the `jp` of a line the JP wiki
scrape (voice_scraper.py) had no text for; `upload` leaves such a `jp` alone, the contributor's text wins). The
sheet is the source of truth for community translations; the game's own text always wins on the pages (see
tools/translatable.py).
"""
import os
import sys
import io
import argparse
import gspread

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util
from sheet_util import load_gsheet_credentials, update_sheet, getTranslatedCsv

GOOGLE_SHEET_ID = "1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I"
VOICE_SHEET_NAME = "Voice"
VOICE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=689437481&single=true&output=csv"
VOICE_CSV_CACHE = "zzz/voice-tl.csv"

SERIF_PARTS = {
    "appreciation", "daily", "eventA", "eventB", "eventC", "eventD",
    "hero", "hero2", "player", "player2", "relation", "touch", "touch2", "train", "trained",
}
GREETING_PARTS = {"h_gachaResult", "h_gachaResult_another", "s_gachaResult"}

# Roster language -> (sheet column, output file of the download: { voiceFilename: community text })
LANG_COLUMNS = {
    "en": ("enApproved", "_data/processed/en_voice.json"),
    "hans": ("zhHansApproved", "_data/processed/hans_voice.json"),
    "hant": ("zhHantApproved", "_data/processed/hant_voice.json"),
}


def _try_load(path: str) -> dict:
    try:
        return wiki_util.loadJson(path)
    except FileNotFoundError:
        return {}


def drop_contributor_jp(rows: list[dict], current: list[dict]) -> list[dict]:
    """`rows` without the `jp` of every line whose sheet row has a `jpSource`: a contributor's transcription is
    preferred over the text scraped from the JP wiki (update_sheet never writes an empty value)."""
    owned = {str(r.get("voiceFilename", "")) for r in current if str(r.get("jpSource", "")).strip()}
    return [{k: v for k, v in row.items() if k != "jp"} if row.get("voiceFilename") in owned else row for row in rows]


def generate_voice_rows(index_path: str) -> list[dict]:
    voice_index = wiki_util.loadJson(index_path)

    jp_serif = _try_load("_data/processed/jp_serif.json")
    en_serif = _try_load("_data/processed/en_serif.json")
    jp_greeting = _try_load("_data/processed/jp_greeting.json")
    en_greeting = _try_load("_data/processed/en_greeting.json")

    rows = []
    seen: set[str] = set()

    for char_data in voice_index.values():
        for variant in char_data.get("children", []):
            resource_name: str = variant["resourceName"]
            for part in variant.get("parts", []):
                voice_filename: str = part["voiceFilename"]
                part_name: str = part["partName"]

                if voice_filename in seen:
                    continue
                seen.add(voice_filename)

                serif_key = voice_filename.replace("voice_", "serif_").upper()

                if part_name in GREETING_PARTS:
                    jp = jp_greeting.get(voice_filename, jp_serif.get(serif_key, part.get("jp", "")))
                    en_approved = en_greeting.get(voice_filename, en_serif.get(serif_key, ""))
                elif part_name in SERIF_PARTS:
                    jp = jp_serif.get(serif_key, part.get("jp", ""))
                    en_approved = en_serif.get(serif_key, "")
                else:
                    jp = part.get("jp", "")
                    en_approved = ""

                # NOTE: Don't push if jp == en_approved, as this means the line hasn't been translated yet.
                if jp == en_approved:
                    en_approved = ""

                row = wiki_util.omitEmptyDict(
                    voiceFilename=voice_filename,
                    jp=jp,
                    enMachineTranslated="",
                    enApproved=en_approved,
                )
                if row:
                    row["voiceFilename"] = voice_filename
                    rows.append(row)

    return rows


def _connect(sheet_id: str):
    creds = load_gsheet_credentials()
    gc = gspread.service_account_from_dict(creds)
    return gc, gc.open_by_key(sheet_id)


def cmd_upload(args):
    print("Generating voice rows...")
    rows = generate_voice_rows(args.index)
    print(f"  {len(rows)} total entries")

    try:
        gc, sh = _connect(GOOGLE_SHEET_ID)
    except Exception as e:
        print(f"Failed to connect to Google Sheet: {e}")
        return

    sheet = sh.worksheet(VOICE_SHEET_NAME)
    rows = drop_contributor_jp(rows, sheet.get_all_records())
    updated, new = update_sheet(
        gc, sheet, VOICE_SHEET_NAME, rows,
        pks=["voiceFilename"],
        updatable_cols=["jp", "enApproved"],
        patch_if_empty_cols=[],
        dry_run=args.dry_run,
    )

    print(f"\nSummary: {len(updated)} updated, {len(new)} new rows")


def _is_serif_or_greeting(voice_filename: str) -> bool:
    return any(voice_filename.endswith(f"_{p}") for p in SERIF_PARTS | GREETING_PARTS)


def cmd_patch_temp(args):
    temp_voice = wiki_util.loadJson("zzz/TempVoice.json")
    en_greeting = wiki_util.loadJson("_data/processed/en_greeting.json")
    en_serif = wiki_util.loadJson("_data/processed/en_serif.json")

    rows = []
    for resource_name, parts_list in temp_voice.items():
        for entry in parts_list:
            part = entry.get("part", "")
            en_approved = entry.get("enApproved", "")
            if not part or not en_approved:
                continue
            voice_filename = f"voice_{resource_name}_{part}"
            if part in GREETING_PARTS:
                if en_greeting.get(voice_filename):
                    continue
            elif part in SERIF_PARTS:
                serif_key = voice_filename.replace("voice_", "serif_").upper()
                if en_serif.get(serif_key):
                    continue

            rows.append({"voiceFilename": voice_filename, "enApproved": en_approved})

    print(f"Loaded {len(rows)} entries from zzz/TempVoice.json")

    try:
        gc, sh = _connect(GOOGLE_SHEET_ID)
    except Exception as e:
        print(f"Failed to connect to Google Sheet: {e}")
        return

    sheet = sh.worksheet(VOICE_SHEET_NAME)
    updated, new = update_sheet(
        gc, sheet, VOICE_SHEET_NAME, rows,
        pks=["voiceFilename"],
        updatable_cols=[],
        patch_if_empty_cols=["enApproved"],
        dry_run=args.dry_run,
    )

    print(f"\nSummary: {len(updated)} patched, {len(new)} new rows")


def process_voice_rows(rows) -> tuple[dict, dict, list[str]]:
    """Sheet rows -> (jp_voice, { lang: { voiceFilename: text } } for en / hans / hant, errors). Every loaded
    text goes through wiki_util.validateHtml; each error names the voice filename and the column (like
    translation_download_tsv.py does for skills)."""
    jp_voice: dict[str, str] = {}
    texts: dict[str, dict[str, str]] = {lang: {} for lang in LANG_COLUMNS}
    errors: list[str] = []

    for row in rows:
        filename = row.get("voiceFilename", "")
        if not filename:
            continue

        jp_text = str(row.get("jp", ""))
        if jp_text and not _is_serif_or_greeting(filename):
            if (e := wiki_util.validateHtml(jp_text)) is not None:
                errors.append(f"Invalid voice html({filename}) in jp: {jp_text} {e}")
            jp_voice[filename] = jp_text

        for lang, (column, _) in LANG_COLUMNS.items():
            text = str(row.get(column, ""))
            if text:
                if (e := wiki_util.validateHtml(text)) is not None:
                    errors.append(f"Invalid voice html({filename}) in {column}: {text} {e}")
                texts[lang][filename] = text

    return jp_voice, texts, errors


def cmd_download(args):
    rows = getTranslatedCsv(VOICE_CSV_URL, VOICE_CSV_CACHE, use_local=args.local)
    jp_voice, texts, errors = process_voice_rows(rows)

    wiki_util.dumpJson("_data/processed/jp_voice.json", jp_voice)
    for lang, (_, path) in LANG_COLUMNS.items():
        wiki_util.dumpJson(path, texts[lang])

    print(f"Downloaded {len(jp_voice)} jp entries, " + ", ".join(f"{len(texts[lang])} {lang}" for lang in LANG_COLUMNS) + " entries")

    # fail the build like translation_download_tsv.py: unclosed tags typed into the sheet would break pages
    for message in errors:
        print(message)
    if errors:
        sys.exit(1)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding="utf-8")

    parser = argparse.ArgumentParser(description="Voice line Google Sheet sync")
    parser.add_argument("--index", default="tools/voice_index.json", help="Path to voice index JSON")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")

    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("upload", help="Upload voice lines to Google Sheet")
    dl_parser = subparsers.add_parser("download", help="Download voice lines from Google Sheet")
    dl_parser.add_argument("--local", action="store_true", help=f"Use cached CSV at {VOICE_CSV_CACHE} instead of fetching")
    subparsers.add_parser("patch_temp", help="Patch enApproved from zzz/TempVoice.json into Google Sheet")

    args = parser.parse_args()

    if args.command == "upload":
        cmd_upload(args)
    elif args.command == "download":
        cmd_download(args)
    elif args.command == "patch_temp":
        cmd_patch_temp(args)


if __name__ == "__main__":
    main()
