#!python3
"""Bio Google Sheet sync (the "Bio" tab of the translation sheet): community translations (English and
Chinese) of the hero / sidekick bios the game has not localized yet (game text missing or equal to JP in at
least one language, ~42 keys).

Columns: bioKey (the game's bio key, e.g. DETAIL_CEPH_H01), jp, enMachineTranslated, enApproved,
zhHansApproved, zhHantApproved, source (`wiki-cms #1a2b3c4d (Name)`, written by contrib_intake.py only, with
zhHansSource / zhHantSource for the Chinese columns) and status (`superseded` once the game ships its own text
in every language; upload sets it, the download then skips the row).

  upload    add rows for the translatable bio keys (never overwrites translator work: only `jp` and an
            empty -> `superseded` status are touched); creates the tab with its header row if missing
  download  write _data/processed/{en,hans,hant}_bio_community.json ({ bioKey: text }, gitignored);
            bio-infobox.html shows each as "(community translation)" while the game has no text of that
            language for the key

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
BIO_HEADERS = ["bioKey", "jp", "enMachineTranslated", "enApproved", "zhHansApproved", "zhHantApproved", "source", "status"]
# roster language -> (sheet column, output file of the download: { bioKey: community text })
LANG_COLUMNS = {
    "en": ("enApproved", "_data/processed/en_bio_community.json"),
    "hans": ("zhHansApproved", "_data/processed/hans_bio_community.json"),
    "hant": ("zhHantApproved", "_data/processed/hant_bio_community.json"),
}
SUPERSEDED = "superseded"


def generate_bio_rows(jp_bio: dict, en_bio: dict, zh_bio: dict | None = None) -> list[dict]:
    """One row per translatable bio key (the game's text missing or equal to JP in some language).
    `zh_bio` is { "hans": {...}, "hant": {...} } (the game's text)."""
    return [{"bioKey": key, "jp": entry["jp"]} for key, entry in translatable.bio_translatable(jp_bio, en_bio, zh_bio=zh_bio).items()]


def superseded_rows(jp_bio: dict, en_bio: dict, existing_keys, zh_bio: dict | None = None) -> list[dict]:
    """Rows of the sheet whose bio is no longer translatable (the game shipped its text in every language): marked `superseded`."""
    open_keys = translatable.bio_translatable(jp_bio, en_bio, zh_bio=zh_bio)
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
    """Sheet rows -> ({ lang: { bioKey: approved text } }, errors) for lang en / hans / hant. Rows marked
    superseded and empty cells are skipped; every loaded text goes through wiki_util.validateHtml (the error
    names the bio key and the column)."""
    community: dict[str, dict[str, str]] = {lang: {} for lang in LANG_COLUMNS}
    errors: list[str] = []
    for row in rows:
        key = row.get("bioKey", "")
        if not key or row.get("status", "") == SUPERSEDED:
            continue
        for lang, (column, _) in LANG_COLUMNS.items():
            text = str(row.get(column, ""))
            if not text:
                continue
            if (e := wiki_util.validateHtml(text)) is not None:
                errors.append(f"Invalid bio html({key}) in {column}: {text} {e}")
            community[lang][key] = text
    return community, errors


def load_zh_bio() -> dict:
    """The game's zh bios ({ "hans": {...}, "hant": {...} }; a missing file counts as empty)."""
    zh = {}
    for lang in ("hans", "hant"):
        try:
            zh[lang] = wiki_util.loadJson(f"_data/processed/{lang}_bio.json")
        except FileNotFoundError:
            zh[lang] = {}
    return zh


def cmd_upload(args):
    jp_bio = wiki_util.loadJson("_data/processed/jp_bio.json")
    en_bio = wiki_util.loadJson("_data/processed/en_bio.json")
    zh_bio = load_zh_bio()
    rows = generate_bio_rows(jp_bio, en_bio, zh_bio)
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
    rows += superseded_rows(jp_bio, en_bio, existing, zh_bio)

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
        print("BIO_CSV_URL is not set (the Bio tab is not published yet): writing empty community files")
        for _, path in LANG_COLUMNS.values():
            wiki_util.dumpJson(path, {})
        return

    rows = getTranslatedCsv(BIO_CSV_URL, BIO_CSV_CACHE, use_local=args.local)
    community, errors = process_bio_rows(rows)
    for lang, (_, path) in LANG_COLUMNS.items():
        wiki_util.dumpJson(path, community[lang])
    print("Downloaded community bio translations: " + ", ".join(f"{len(community[lang])} {lang}" for lang in LANG_COLUMNS))

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
    dl_parser = subparsers.add_parser("download", help="Download community bio translations (en, hans, hant)")
    dl_parser.add_argument("--local", action="store_true", help=f"Use cached CSV at {BIO_CSV_CACHE} instead of fetching")

    args = parser.parse_args()
    if args.command == "upload":
        cmd_upload(args)
    elif args.command == "download":
        cmd_download(args)


if __name__ == "__main__":
    main()
