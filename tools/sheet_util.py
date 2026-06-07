import json
import os

import gspread
from gspread.utils import ValueInputOption
import requests

def load_gsheet_credentials() -> dict:
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

def update_sheet(gc: gspread.Client, sheet: gspread.Worksheet, sheet_name: str, data: list, pks: list, updatable_cols: list, patch_if_empty_cols: list, dry_run: bool = False):
    """
    sheet: gspread worksheet object
    sheet_name: str name for logging
    data: list of dicts (from csv)
    pks: list of str, primary key column names (e.g. ['skillId'])
    updatable_cols: list of str, columns to update (e.g. ['skillName', 'description'])
    patch_if_empty_cols: list of str, columns to patch if empty (e.g. ['description'])
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
    col_indices = {name: get_column_index(headers, name) for name in (updatable_cols + patch_if_empty_cols)}
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
                if new_val != old_val and new_val != "":
                    print(f"  [UPDATE] {pk}: {col} '{old_val}' -> '{new_val}'")

                    col_idx = col_indices[col]
                    if col_idx:
                        updates.append(gspread.Cell(row_idx, col_idx, new_val))
                        changed = True

            for col in patch_if_empty_cols:
                new_val = row.get(col, "")
                old_val = str(current_row.get(col, ""))
                if old_val == "" and new_val != "":
                    print(f"  [PATCH] {pk}: {col} '{new_val}'")
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
