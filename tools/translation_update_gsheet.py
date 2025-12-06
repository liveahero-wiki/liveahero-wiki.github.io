import os
import sys
import io
import json
import csv
import argparse
import gspread
from gspread.utils import ValueInputOption
import requests
import translation_gen_tsv

import sys
import io

# Reconfigure standard output and standard error to use UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# Hardcoded Sheet ID
GOOGLE_SHEET_ID = "1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I"

def load_credentials():
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if not creds_json:
        # Fallback to file if env not set (useful for local dev)
        if os.path.exists("credentials.json"):
            with open("credentials.json", "r") as f:
                return json.load(f)
        raise ValueError("GOOGLE_CREDENTIALS_JSON environment variable not set")
    
    # Parse JSON from env var and return dict
    return json.loads(creds_json)

def send_discord_webhook(url, message):
    if not url:
        return
    payload = {"content": message}
    try:
        requests.post(url, json=payload)
    except Exception as e:
        print(f"Failed to send discord webhook: {e}")

def get_column_index(headers: list[str], name: str) -> int | None:
    try:
        return headers.index(name) + 1 # 1-based index for gspread
    except ValueError:
        return None

def update_sheet(gc: gspread.Client, sheet: gspread.Worksheet, sheet_name: str, data: list, pks: list, updatable_cols: list, dry_run: bool = False):
    """
    sheet: gspread worksheet object
    sheet_name: str name for logging
    data: list of dicts (from csv)
    pks: list of str, primary key column names (e.g. ['skillId'])
    updatable_cols: list of str, columns to update (e.g. ['skillName', 'description'])
    """
    print(f"Processing {sheet_name}...")
    
    try:
        current_data = sheet.get_all_records()
        headers = sheet.row_values(1)
    except Exception as e:
        print(f"Error reading sheet {sheet_name}: {e}")
        return [], []

    # Map current rows by PK
    # Create a compound key if multiple PKs
    def get_pk(row):
        return tuple(str(row.get(k, "")) for k in pks)

    existing_rows = {get_pk(row): (i + 2, row) for i, row in enumerate(current_data)} # i+2 because row 1 is header, 0-indexed list

    updates = [] # List of Cell objects
    new_rows = []
    
    updated_ids = []
    new_ids = []

    # Column mapping (Header Name -> Index)
    col_indices = {name: get_column_index(headers, name) for name in updatable_cols}
    # PK indices for sorting
    pk_indices = [get_column_index(headers, name) for name in pks]

    for row in data:
        pk = get_pk(row)
        
        if pk in existing_rows:
            row_idx, current_row = existing_rows[pk]
            # Check for changes
            changed = False
            for col in updatable_cols:
                new_val = row.get(col, "")
                old_val = str(current_row.get(col, ""))
                
                # Normalize newlines just in case
                if new_val != old_val:
                    print(f"  [UPDATE] {pk}: {col} '{old_val}' -> '{new_val}'")
                    
                    col_idx = col_indices[col]
                    if col_idx:
                        updates.append(gspread.Cell(row_idx, col_idx, new_val))
                        changed = True
            
            if changed:
                updated_ids.append(pk)
        else:
            # New row
            # Construct row based on headers
            new_row_data = []
            for h in headers:
                new_row_data.append(row.get(h, ""))
            
            print(f"  [NEW] {pk}")
            
            new_rows.append(new_row_data)
            new_ids.append(pk)

    if not dry_run:
        if updates:
            print(f"  Updating {len(updates)} cells...")
            sheet.update_cells(updates)

        if new_rows:
            print(f"  Appending {len(new_rows)} rows...")
            sheet.append_rows(new_rows, value_input_option=ValueInputOption.user_entered)

            # format column A as number
            #sheet.format("A2:A", {"numberFormat": {"type": "NUMBER", "pattern": "0"}})

        # Sort
        # Assuming sort by PKs in order
        if pk_indices and all(pk_indices):
            print(f"  Sorting...")
            # gspread run sort on the whole sheet excluding frozen rows
            specs = [(idx, 'asc') for idx in pk_indices]
            try:
                sheet.sort(*specs)
            except Exception as e:
                print(f"  Warning: Sort failed: {e}")

    return updated_ids, new_ids

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
        creds = load_credentials()
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
                                ['skillId'], ['charaName', 'skillName', 'description'], args.dry_run)
    
    sheet = sh.worksheet("EN skill effect")
    updated_se, new_se = update_sheet(gc, sheet, "EN skill effect", skill_effect_data, 
                                  ['skillEffectId'], ['statusId', 'overrideStatusName', 'overrideStatusDescription'], args.dry_run)
                                  
    sheet = sh.worksheet("EN status")
    updated_st, new_st = update_sheet(gc, sheet, "EN status", status_data, 
                                  ['statusId'], ['statusName', 'description'], args.dry_run)
    
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
    main()
