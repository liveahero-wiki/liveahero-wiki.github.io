#!python3
"""Translation intake: approved wiki-cms submissions -> Google Sheet (docs/CONTRIBUTOR_EDITING_PLAN.md, Track A).

Run hourly by .github/workflows/translation-intake.yml. For the submission types `lah-voice-tl` (Voice tab)
and `lah-bio-tl` (Bio tab) it

  1. GETs the approved submissions nobody has synced yet from wiki-cms (`/api/internal/submissions/<type>`,
     bearer CLI_TOKEN; rows that already carry an outcome are not listed any more),
  2. per line compares the sheet's current `enApproved` with the `base` the contributor saw: empty or equal
     -> writes `text` (voice: line breaks become `<br>`; bio keeps them); a voice line may also carry `jp`
     (the transcription of a line the game has no Japanese text for), written into the `jp` column only
     while that is empty (else conflict; a line is written whole or not at all); sets the `source` column to
     `wiki-cms #<id first 8> (<displayName>)`; otherwise it is a conflict (a translator changed the sheet in
     the meantime) and nothing is written; a key that is no longer translatable per the freshly generated
     rosters (the game shipped its own text) is `superseded`, nothing is written,
  3. POSTs the outcome per submission to `.../external` (`synced` / `conflict` / `superseded`, the written
     keys and the conflicts) and
  4. dispatches site.yml when something was written, so the change goes live without waiting for the cron.

Idempotent: a line whose sheet text already equals the new text counts as written without writing again
(a run that wrote the sheet but failed to POST is simply repeated), and the Worker skips rows that have an
outcome. `plan_updates` is pure; the HTTP client and the sheet are thin wrappers (fakeable in tests).

Environment: CMS_URL (the Worker origin), CLI_TOKEN, GOOGLE_CREDENTIALS_JSON (via sheet_util), and
GH_TOKEN + GH_REPO for the dispatch (the workflow sets them). `--dry-run` prints the plan and neither writes
the sheet, nor POSTs, nor dispatches.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util

# kind -> wiki-cms submission type, sheet tab, key column of the tab
KINDS = {
    "voice": {"type": "lah-voice-tl", "sheet": "Voice", "key_col": "voiceFilename"},
    "bio": {"type": "lah-bio-tl", "sheet": "Bio", "key_col": "bioKey"},
}
SOURCE_COL = "source"
TEXT_COL = "enApproved"
JP_COL = "jp"
# Who transcribed `jp` (same label as `source`); set only when a contributor's JP was written. voice_gsheet.py upload
# never replaces a `jp` that has one with the text scraped from the JP wiki.
JP_SOURCE_COL = "jpSource"
MAX_CONFLICTS = 100  # keep the stored JSON small
MAX_CURRENT_CHARS = 500

LABELS = {
    "partial": "Some lines were added; the others changed in the meantime",
    "conflict": "The sheet text changed in the meantime",
    "superseded": "The game now has this text",
}

_BR = re.compile(r"<br\s*/?>", re.IGNORECASE)


def normalize(text: str) -> str:
    """Compare texts regardless of line breaks (`<br>` vs newline) and whitespace runs."""
    return re.sub(r"\s+", " ", _BR.sub(" ", text or "")).strip()


def source_label(sub_id: str, display_name: str) -> str:
    name = re.sub(r"\s+", " ", display_name or "").strip()
    return f"wiki-cms #{sub_id[:8]} ({name})"


def sheet_text(kind: str, text: str) -> str:
    """The text as stored in the sheet: voice lines use `<br>`, bios keep their newlines."""
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if kind == "voice":
        return text.replace("\n", "<br>")
    return text


def _is_plain(text: str) -> bool:
    return bool(text.strip()) and "<" not in text and "{%" not in text and "{{" not in text


def roster_entry(rosters: dict | None, kind: str, key: str, resource_name: str = "") -> dict | None:
    """The roster entry of a still translatable key, else None. `rosters` is None when no roster is given
    (then every key counts as translatable)."""
    if rosters is None:
        return {}
    if kind == "voice":
        return rosters.get("voice", {}).get("resources", {}).get(resource_name, {}).get(key)
    return rosters.get("bio", {}).get("bios", {}).get(key)


def plan_updates(submissions: list[dict], sheet_rows: dict, rosters: dict | None = None,
                 sheet_jp: dict | None = None) -> dict:
    """Decide what to write and what to report back. Pure.

    submissions: oldest first, each { kind: 'voice'|'bio', id, displayName, payload } (payload as
        documented in the plan: voice { resourceName, lines: [{ key, base, text, jp? }] }, bio { key, base, text }).
        A voice line may carry `jp` (the transcription of a line the game has no Japanese text for) and then
        `text` may be empty.
    sheet_rows: { kind: { key: current enApproved } } for keys that have a sheet row.
    sheet_jp: { kind: { key: current jp } } (voice only; a missing key counts as empty).
    rosters: { voice: <voice-roster.json>, bio: <bio-roster.json> } or None.

    Returns { writes: [{ kind, key, text, source, jp, set_jp, new_row }], results: [{ kind, id, external }] }.
    `text` is None when only the JP is written; `jp` is what a new row gets (the submitted JP, else the
    roster's); `set_jp` says a submitted JP goes into the (existing or new) row. A line is written whole or not at all.
    Several submissions for one key in a run are applied in order: the later one sees the earlier write."""
    working = {kind: dict(rows) for kind, rows in sheet_rows.items()}
    working_jp = {kind: dict(rows) for kind, rows in (sheet_jp or {}).items()}
    writes: dict[tuple[str, str], dict] = {}
    results = []

    for sub in submissions:
        kind = sub["kind"]
        payload = sub.get("payload") or {}
        if kind == "voice":
            resource_name = payload.get("resourceName", "")
            lines = payload.get("lines") or []
        else:
            resource_name = ""
            lines = [payload] if payload.get("key") else []
        rows = working.setdefault(kind, {})
        jps = working_jp.setdefault(kind, {})
        source = source_label(sub["id"], sub.get("displayName", ""))

        written: list[str] = []
        conflicts: list[dict] = []
        superseded = 0
        for line in lines:
            key = str(line.get("key", ""))
            base = str(line.get("base", ""))
            text = str(line.get("text", "")).strip()
            jp_in = str(line.get("jp", "")).strip() if kind == "voice" else ""
            entry = roster_entry(rosters, kind, key, resource_name)
            if not key or entry is None:
                superseded += 1
                continue
            if (text and not _is_plain(text)) or (jp_in and not _is_plain(jp_in)) or not (text or jp_in):
                conflicts.append({"key": key, "base": base, "current": "(invalid text)"})
                continue

            new_text = sheet_text(kind, text) if text else None
            new_jp = sheet_text(kind, jp_in) if jp_in else None
            current = rows.get(key, "")
            # the roster's JP is what the table shows: it stands in for a sheet row without one
            current_jp = jps.get(key, "") or entry.get("jp", "")

            en_write = False
            if new_text is not None and normalize(current) != normalize(new_text):
                if normalize(current) in ("", normalize(base)):
                    en_write = True
                else:
                    conflicts.append({"key": key, "base": base, "current": current})
                    continue
            jp_write = False
            if new_jp is not None and normalize(current_jp) != normalize(new_jp):
                if normalize(current_jp) == "":
                    jp_write = True
                else:
                    conflicts.append({"key": key, "base": base, "current": current_jp})
                    continue

            if en_write or jp_write:
                prev = writes.get((kind, key), {})
                if en_write:
                    rows[key] = new_text
                if jp_write:
                    jps[key] = new_jp
                writes[(kind, key)] = {
                    "kind": kind, "key": key, "source": source,
                    "text": new_text if en_write else prev.get("text"),
                    "set_jp": jp_write or prev.get("set_jp", False),
                    "jp": new_jp if jp_write else prev.get("jp") or entry.get("jp", ""),
                    "new_row": key not in sheet_rows.get(kind, {}),
                }
            written.append(key)  # also when it was already there (an earlier run wrote it before it could report)

        if written and conflicts:
            status = "partial"  # some lines are in the sheet, the others need a moderator
        elif written:
            status = "synced"
        elif conflicts:
            status = "conflict"
        else:
            status = "superseded"  # every line is gone from the rosters (or there was nothing to do)

        outcome = {"status": status}
        if status in LABELS:
            outcome["label"] = LABELS[status]
        external = {
            "outcome": outcome,
            "written": written,
            "conflicts": [
                {**c, "current": c["current"][:MAX_CURRENT_CHARS]} for c in conflicts[:MAX_CONFLICTS]
            ],
        }
        results.append({"kind": kind, "id": sub["id"], "external": external, "superseded": superseded})

    return {"writes": list(writes.values()), "results": results}


# ---------------------------------------------------------------------------------------- IO wrappers

class CmsClient:
    """wiki-cms internal API (bearer CLI_TOKEN)."""

    def __init__(self, base_url: str, token: str, timeout: int = 30):
        self.base = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    def _request(self, method: str, path: str, body=None):
        data = None if body is None else json.dumps(body).encode("utf-8")
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/json")
        req.add_header("User-Agent", "lah-wiki-translation-intake")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def list_submissions(self, type_id: str, limit: int = 100) -> list[dict]:
        return self._request("GET", f"/api/internal/submissions/{type_id}?limit={limit}").get("items", [])

    def post_external(self, type_id: str, results: list[dict]) -> dict:
        return self._request("POST", f"/api/internal/submissions/{type_id}/external", {"results": results})


class GspreadSheet:
    """The translation spreadsheet (needs GOOGLE_CREDENTIALS_JSON). Interface used by main():
    read(kind) -> { key: current enApproved }, read_jp(kind) -> { key: current jp }, apply(writes)."""

    def __init__(self, spreadsheet):
        self.sh = spreadsheet
        self._tabs: dict[str, object] = {}

    def _tab(self, kind: str):
        if kind not in self._tabs:
            self._tabs[kind] = self.sh.worksheet(KINDS[kind]["sheet"])
        return self._tabs[kind]

    def read(self, kind: str) -> dict[str, str]:
        key_col = KINDS[kind]["key_col"]
        return {str(r.get(key_col, "")): str(r.get(TEXT_COL, "")) for r in self._tab(kind).get_all_records() if r.get(key_col)}

    def read_jp(self, kind: str) -> dict[str, str]:
        """{ key: current jp } (the tab's `jp` column; a tab without one reads as empty)."""
        key_col = KINDS[kind]["key_col"]
        return {str(r.get(key_col, "")): str(r.get(JP_COL, "")) for r in self._tab(kind).get_all_records() if r.get(key_col)}

    def apply(self, writes: list[dict]):
        import gspread
        for kind in KINDS:
            ops = [w for w in writes if w["kind"] == kind]
            if not ops:
                continue
            tab = self._tab(kind)
            key_col = KINDS[kind]["key_col"]
            headers = tab.row_values(1)
            wanted = [SOURCE_COL] + ([JP_SOURCE_COL] if any(w.get("set_jp") for w in ops) else [])
            for name in wanted:
                if name not in headers:
                    col = len(headers) + 1
                    if col > tab.col_count:
                        tab.add_cols(col - tab.col_count)
                    tab.update_cell(1, col, name)
                    headers.append(name)
            idx = {h: i + 1 for i, h in enumerate(headers)}
            keys = tab.col_values(idx[key_col])
            cells = []
            new_rows = []
            for op in ops:
                if op["key"] in keys:
                    row = keys.index(op["key"]) + 1
                    if op["text"] is not None:
                        cells.append(gspread.Cell(row, idx[TEXT_COL], op["text"]))
                    if op.get("set_jp") and JP_COL in idx:
                        cells.append(gspread.Cell(row, idx[JP_COL], op["jp"]))
                        cells.append(gspread.Cell(row, idx[JP_SOURCE_COL], op["source"]))
                    cells.append(gspread.Cell(row, idx[SOURCE_COL], op["source"]))
                else:
                    values = {key_col: op["key"], JP_COL: op.get("jp", ""), TEXT_COL: op["text"] or "", SOURCE_COL: op["source"]}
                    if op.get("set_jp"):
                        values[JP_SOURCE_COL] = op["source"]
                    new_rows.append([values.get(h, "") for h in headers])
            if cells:
                tab.update_cells(cells)  # RAW: a text starting with = or + is never a formula
            if new_rows:
                tab.append_rows(new_rows)


def open_spreadsheet() -> GspreadSheet:
    import gspread
    from sheet_util import load_gsheet_credentials
    from voice_gsheet import GOOGLE_SHEET_ID
    gc = gspread.service_account_from_dict(load_gsheet_credentials())
    return GspreadSheet(gc.open_by_key(GOOGLE_SHEET_ID))


def dispatch_site_build() -> bool:
    """`gh workflow run site.yml` (GH_TOKEN, GH_REPO from the environment); a failure only warns, the cron rebuilds anyway."""
    proc = subprocess.run(["gh", "workflow", "run", "site.yml"], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"Warning: could not dispatch site.yml: {proc.stderr.strip()}")
        return False
    print("Dispatched site.yml")
    return True


def load_rosters(processed: str = "_data/processed") -> dict:
    rosters = {
        "voice": wiki_util.loadJson(os.path.join(processed, "voice_roster.json")),
        "bio": wiki_util.loadJson(os.path.join(processed, "bio_roster.json")),
    }
    if not rosters["voice"].get("resources"):
        raise RuntimeError("voice_roster.json has no resources: run gen_translation_rosters.py first")
    return rosters


def collect_submissions(client: CmsClient) -> list[dict]:
    subs = []
    for kind, info in KINDS.items():
        for item in client.list_submissions(info["type"]):
            subs.append({**item, "kind": kind})
    subs.sort(key=lambda s: str(s.get("approvedAt") or ""))
    return subs


def run(client: CmsClient, sheet, rosters: dict, dry_run: bool = False, dispatch=dispatch_site_build) -> dict:
    subs = collect_submissions(client)
    print(f"{len(subs)} approved submission(s) to sync")
    if not subs:
        return {"writes": [], "results": []}

    sheet_rows = {kind: sheet.read(kind) for kind in {s["kind"] for s in subs}}
    sheet_jp = {"voice": sheet.read_jp("voice")} if "voice" in sheet_rows else {}
    plan = plan_updates(subs, sheet_rows, rosters, sheet_jp)

    for w in plan["writes"]:
        jp_note = f" jp={w['jp'][:40]!r}" if w.get("set_jp") else ""
        print(f"  [WRITE] {w['kind']} {w['key']}: {(w['text'] or '')[:80]!r}{jp_note} <- {w['source']}")
    for r in plan["results"]:
        ext = r["external"]
        print(f"  [{ext['outcome']['status'].upper()}] {r['kind']} {r['id']}: "
              f"{len(ext['written'])} written, {len(ext['conflicts'])} conflict(s), {r['superseded']} superseded")
    if dry_run:
        print("Dry run: nothing written, nothing posted")
        return plan

    if plan["writes"]:
        sheet.apply(plan["writes"])

    for kind, info in KINDS.items():
        results = [{"id": r["id"], "external": r["external"]} for r in plan["results"] if r["kind"] == kind]
        if results:
            print(f"  POST {info['type']}: {client.post_external(info['type'], results)}")

    if plan["writes"]:
        dispatch()
    return plan


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding="utf-8")

    parser = argparse.ArgumentParser(description="Sync approved wiki-cms translation submissions into the Google Sheet")
    parser.add_argument("--dry-run", action="store_true", help="print the plan; no sheet writes, no POST, no dispatch")
    args = parser.parse_args()

    cms_url = os.environ.get("CMS_URL", "")
    token = os.environ.get("CLI_TOKEN", "")
    if not cms_url or not token:
        sys.exit("CMS_URL and CLI_TOKEN are required")

    run(CmsClient(cms_url, token), open_spreadsheet(), load_rosters(), dry_run=args.dry_run)


if __name__ == "__main__":
    main()
