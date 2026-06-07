#!python3
import os
import sys
import io
import argparse
import gspread

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util
from sheet_util import load_gsheet_credentials, update_sheet

GOOGLE_SHEET_ID = "1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I"
VOICE_SHEET_NAME = "Voice"

SERIF_PARTS = {
    "appreciation", "daily", "eventA", "eventB", "eventC", "eventD",
    "hero", "hero2", "player", "player2", "relation", "touch", "touch2", "train", "trained",
}
GREETING_PARTS = {"h_gachaResult", "h_gachaResult_another", "s_gachaResult"}

# Lang code → sheet column name (extensible for zh-Hans/zh-Hant)
LANG_COL = {
    "jp": "jp",
    "en": "enApproved",
}


def _try_load(path: str) -> dict:
    try:
        return wiki_util.loadJson(path)
    except FileNotFoundError:
        return {}


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

                if part_name in GREETING_PARTS:
                    jp = jp_greeting.get(voice_filename, part.get("jp", ""))
                    en_approved = en_greeting.get(voice_filename, "")
                elif part_name in SERIF_PARTS:
                    serif_key = voice_filename.replace("voice_", "serif_").upper()#f"SERIF_{resource_name.upper()}_{part_name.upper()}"
                    jp = jp_serif.get(serif_key, part.get("jp", ""))
                    en_approved = en_serif.get(serif_key, "")
                else:
                    jp = part.get("jp", "")
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


def cmd_download(args):
    try:
        _, sh = _connect(GOOGLE_SHEET_ID)
    except Exception as e:
        print(f"Failed to connect to Google Sheet: {e}")
        return

    sheet = sh.worksheet(VOICE_SHEET_NAME)
    records = sheet.get_all_records()

    jp_voice: dict[str, str] = {}
    en_voice: dict[str, str] = {}

    for row in records:
        filename = row.get("voiceFilename", "")
        if not filename:
            continue

        jp_text = str(row.get("jp", ""))
        if jp_text and not _is_serif_or_greeting(filename):
            jp_voice[filename] = jp_text

        en_text = str(row.get("enApproved", ""))
        if en_text:
            en_voice[filename] = en_text

    wiki_util.dumpJson("_data/processed/jp_voice.json", jp_voice)
    wiki_util.dumpJson("_data/processed/en_voice.json", en_voice)

    print(f"Downloaded {len(jp_voice)} jp entries, {len(en_voice)} en entries")


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding="utf-8")

    parser = argparse.ArgumentParser(description="Voice line Google Sheet sync")
    parser.add_argument("--index", default="tools/voice_index.json", help="Path to voice index JSON")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")

    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("upload", help="Upload voice lines to Google Sheet")
    subparsers.add_parser("download", help="Download voice lines from Google Sheet")

    args = parser.parse_args()

    if args.command == "upload":
        cmd_upload(args)
    elif args.command == "download":
        cmd_download(args)


if __name__ == "__main__":
    main()
