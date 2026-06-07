#!python3
import os
import sys
import io
import json
import csv
import argparse
import gspread

import requests
import translation_gen_tsv
from sheet_util import load_gsheet_credentials, send_discord_webhook, update_sheet

# Reconfigure standard output and standard error to use UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# Hardcoded Sheet ID
GOOGLE_SHEET_ID = "1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    args = parser.parse_args()

    # 1. Generate TSVs
    print("Generating TSVs...")
    translation_gen_tsv.main()

    # 2. Read TSVs
    print("Reading generated TSVs...")

    with open("skill-jp.tsv", "r", encoding="utf-8") as f:
        skill_data = list(csv.DictReader(f, delimiter='\t'))

    with open("skill-effect-jp.tsv", "r", encoding="utf-8") as f:
        skill_effect_data = list(csv.DictReader(f, delimiter='\t'))

    with open("status-jp.tsv", "r", encoding="utf-8") as f:
        status_data = list(csv.DictReader(f, delimiter='\t'))

    # 3. Update Sheets
    try:
        creds = load_gsheet_credentials()
        gc = gspread.service_account_from_dict(creds)
        sh = gc.open_by_key(GOOGLE_SHEET_ID)
    except Exception as e:
        msg = f"Failed to connect to Google Sheet: {e}"
        print(msg)
        if args.dry_run:
             print("Dry run failed to connect. Ensure you have valid credentials (GOOGLE_CREDENTIALS_JSON) set even for dry run if you want to compare data.")
        return

    report = []

    # Skill
    sheet = sh.worksheet("EN skill")
    updated_s, new_s = update_sheet(gc, sheet, "EN skill", skill_data,
                                ['skillId'], ['charaName', 'skillName', 'description'],
                                ['skillNameTranslated'],
                                args.dry_run)

    sheet = sh.worksheet("EN skill effect")
    updated_se, new_se = update_sheet(gc, sheet, "EN skill effect", skill_effect_data,
                                  ['skillEffectId'], ['statusId', 'overrideStatusName', 'overrideStatusDescription'],
                                  ['overrideStatusNameTranslated', 'overrideStatusDescriptionTranslated'],
                                  args.dry_run)

    sheet = sh.worksheet("EN status")
    updated_st, new_st = update_sheet(gc, sheet, "EN status", status_data,
                                  ['statusId'], ['statusName', 'description', 'statusNameTranslated'],
                                  ['descriptionTranslated'],
                                  args.dry_run)

    # Report
    msg = io.StringIO()
    msg.write("## Translation Sheet Update Report\n")
    if args.dry_run:
        msg.write(" (DRY RUN)\n")

    def joined_pks(ids: list[tuple[str, ...]]) -> str:
        return ", ".join("-".join(id) for id in ids)

    if updated_s or new_s:
        msg.write(f"- **Skills**: {len(updated_s)} updated, {len(new_s)} new\n")
        msg.write("  - Updated IDs: ")
        msg.write(joined_pks(updated_s))
        msg.write("\n")
        msg.write("  - New IDs: ")
        msg.write(joined_pks(new_s))
        msg.write("\n")
    if updated_se or new_se:
        msg.write(f"- **Skill Effects**: {len(updated_se)} updated, {len(new_se)} new\n")
        msg.write("  - Updated IDs: ")
        msg.write(joined_pks(updated_se))
        msg.write("\n")
        msg.write("  - New IDs: ")
        msg.write(joined_pks(new_se))
        msg.write("\n")
    if updated_st or new_st:
        msg.write(f"- **Status**: {len(updated_st)} updated, {len(new_st)} new\n")
        msg.write("  - Updated IDs: ")
        msg.write(joined_pks(updated_st))
        msg.write("\n")
        msg.write("  - New IDs: ")
        msg.write(joined_pks(new_st))
        msg.write("\n")

    if not (updated_s or new_s or updated_se or new_se or updated_st or new_st):
        msg.write("No changes detected.\n")

    report = msg.getvalue()
    print(report)

    if not args.dry_run:
        webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
        if webhook_url:
            send_discord_webhook(webhook_url, report)
        else:
            print("DISCORD_WEBHOOK_URL not set, skipping webhook.")

if __name__ == "__main__":
    import masterdata
    #masterdata.main(["--force_download=1", "--skip_data"])
    main()
