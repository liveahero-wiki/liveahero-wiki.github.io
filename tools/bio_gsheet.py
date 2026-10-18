#!python3
"""Bio Google Sheet sync (the "Bio" tab of the translation sheet): community English translations of the
hero / sidekick bios the game has not localized yet (game EN missing or equal to JP, ~42 keys).

Columns: bioKey (the game's bio key, e.g. DETAIL_CEPH_H01), jp, enMachineTranslated, enApproved, source
(`wiki-cms #1a2b3c4d (Name)`, written by contrib_intake.py only) and status (`superseded` once the game ships
its own EN text for the key; upload sets it, the download then skips the row).

  upload    add rows for the translatable bio keys (never overwrites translator work: only `jp` and an
            empty -> `superseded` status are touched); creates the tab with its header row if missing
  download  write _data/processed/en_bio_community.json ({ bioKey: text }, gitignored); bio-infobox.html
            shows it as "EN (community translation)" while the game has no EN text for the key

Shares the sheet helpers of voice_gsheet.py.
"""
import argparse
import io
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util
import translatable
from sheet_util import update_sheet, getTranslatedCsv
from voice_gsheet import GOOGLE_SHEET_ID, _connect

BIO_SHEET_NAME = "Bio"
BIO_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pubhtml?gid=701283641&single=true&output=csv"
BIO_CSV_CACHE = "zzz/bio-tl.csv"
BIO_HEADERS = ["bioKey", "jp", "enMachineTranslated", "enApproved", "source", "status"]
COMMUNITY_PATH = "_data/processed/en_bio_community.json"
SUPERSEDED = "superseded"


def generate_bio_rows(jp_bio: dict, en_bio: dict) -> list[dict]:
    """One row per translatable bio key (game EN missing or equal to JP)."""
    return [{"bioKey": key, "jp": entry["jp"]} for key, entry in translatable.bio_translatable(jp_bio, en_bio).items()]


def superseded_rows(jp_bio: dict, en_bio: dict, existing_keys) -> list[dict]:
    """Rows of the sheet whose bio is no longer translatable (the game shipped EN): marked `superseded`."""
    open_keys = translatable.bio_translatable(jp_bio, en_bio)
    return [{"bioKey": k, "status": SUPERSEDED} for k in existing_keys if k in jp_bio and k not in open_keys]


def get_or_create_worksheet(sh, name: str, headers: list[str], create: bool = True):
    """The worksheet `name`, created with a header row when the spreadsheet has no such tab yet (None when
    it is missing and `create` is false, i.e. on a dry run)."""
    import gspread
    try:
        return sh.worksheet(name)
    except gspread.WorksheetNotFound:
        if not create:
            return None
        print(f"Creating worksheet {name}")
        sheet = sh.add_worksheet(title=name, rows=100, cols=len(headers))
        sheet.update([headers], "A1")
        return sheet


def process_bio_rows(rows) -> tuple[dict, list[str]]:
    """Sheet rows -> ({ bioKey: enApproved }, errors). Rows marked superseded and rows without an approved
    text are skipped; every loaded text goes through wiki_util.validateHtml (the error names the bio key)."""
    community: dict[str, str] = {}
    errors: list[str] = []
    for row in rows:
        key = row.get("bioKey", "")
        text = str(row.get("enApproved", ""))
        if not key or not text or row.get("status", "") == SUPERSEDED:
            continue
        if (e := wiki_util.validateHtml(text)) is not None:
            errors.append(f"Invalid bio html({key}): {text} {e}")
        community[key] = text
    return community, errors


def cmd_upload(args):
    jp_bio = wiki_util.loadJson("_data/processed/jp_bio.json")
    en_bio = wiki_util.loadJson("_data/processed/en_bio.json")
    rows = generate_bio_rows(jp_bio, en_bio)
    print(f"  {len(rows)} translatable bios")

    try:
        gc, sh = _connect(GOOGLE_SHEET_ID)
    except Exception as e:
        print(f"Failed to connect to Google Sheet: {e}")
        return

    sheet = get_or_create_worksheet(sh, BIO_SHEET_NAME, BIO_HEADERS, create=not args.dry_run)
    if sheet is None:
        print(f"Dry run: the {BIO_SHEET_NAME} tab does not exist yet, it would be created with {len(rows)} rows")
        return
    existing = [k for k in sheet.col_values(1)[1:] if k]
    rows += superseded_rows(jp_bio, en_bio, existing)

    updated, new = update_sheet(
        gc, sheet, BIO_SHEET_NAME, rows,
        pks=["bioKey"],
        updatable_cols=["jp", "status"],
        patch_if_empty_cols=[],
        dry_run=args.dry_run,
    )
    print(f"\nSummary: {len(updated)} updated, {len(new)} new rows")


def cmd_download(args):
    if not BIO_CSV_URL:
        print("BIO_CSV_URL is not set (the Bio tab is not published yet): writing an empty "
              f"{COMMUNITY_PATH}")
        wiki_util.dumpJson(COMMUNITY_PATH, {})
        return

    rows = getTranslatedCsv(BIO_CSV_URL, BIO_CSV_CACHE, use_local=args.local)
    community, errors = process_bio_rows(rows)
    wiki_util.dumpJson(COMMUNITY_PATH, community)
    print(f"Downloaded {len(community)} community bio translations")

    for message in errors:
        print(message)
    if errors:
        sys.exit(1)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding="utf-8")

    parser = argparse.ArgumentParser(description="Bio Google Sheet sync")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("upload", help="Add the translatable bios to the Bio tab")
    dl_parser = subparsers.add_parser("download", help="Download community bio translations")
    dl_parser.add_argument("--local", action="store_true", help=f"Use cached CSV at {BIO_CSV_CACHE} instead of fetching")

    args = parser.parse_args()
    if args.command == "upload":
        cmd_upload(args)
    elif args.command == "download":
        cmd_download(args)


if __name__ == "__main__":
    main()
