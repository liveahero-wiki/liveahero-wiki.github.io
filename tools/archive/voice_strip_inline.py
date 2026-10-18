#!python3
"""One-shot cleanup (kept for history): strip the dead inline translation params from voice-table includes.

`_includes/voice-table.html` only reads `resourceName`; the `KEY = "translation"` params that the 215
`{% include voice-table.html resourceName="x" KEY = "..." %}` blocks in _charas/*.md still carry were never
shown (the game text and the Google Sheet are the sources now). Before deleting them this tool compares every
inline value with what the site shows and writes the lines that exist ONLY inline (no game EN text for the
line, nothing in the sheet's en_voice) to zzz/inline-voice-not-in-sheet.json ({ "voice_<res>_<part>": text }),
so a maintainer can import them into the sheet (python tools/voice_gsheet.py patch_temp reads a similar
file). Inline values that differ from an existing sheet text are listed in
zzz/inline-voice-differs-from-sheet.json for review. Then every block is rewritten to
`{% include voice-table.html resourceName="x" %}`; the rest of each file stays byte-identical (CRLF/LF kept).

  py tools/voice_strip_inline.py --dry-run     # report only
  py tools/voice_strip_inline.py               # write the json files and rewrite the pages

Needs _data/processed/en_voice.json (py tools/voice_gsheet.py download).
"""
import argparse
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
import wiki_util
import translatable

INCLUDE_START = re.compile(r"\{%-?\s*include\s+voice-table\.html")
PARAM = re.compile(r"""\s*([\w-]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([\w.-]+))""", re.DOTALL)
CLOSE = re.compile(r"\s*-?%\}")


def parse_blocks(text: str) -> list[dict]:
    """Every voice-table include of `text`: { start, end, params: [(name, raw, value)] }.

    Walks the params one by one (so a `%}` inside a quoted value is no problem). A block that does not
    parse up to its closing `%}` raises ValueError."""
    blocks = []
    for m in INCLUDE_START.finditer(text):
        pos = m.end()
        params = []
        while True:
            c = CLOSE.match(text, pos)
            if c:
                end = c.end()
                break
            p = PARAM.match(text, pos)
            if not p:
                line = text.count("\n", 0, pos) + 1
                raise ValueError(f"unparsable voice-table include near line {line}: {text[pos:pos + 60]!r}")
            value = p.group(2) if p.group(2) is not None else p.group(3) if p.group(3) is not None else p.group(4)
            params.append((p.group(1), p.group(0).strip(), value.replace('\\"', '"').replace("\\'", "'")))
            pos = p.end()
        blocks.append({"start": m.start(), "end": end, "params": params})
    return blocks


def resolve(resource: str, param: str) -> tuple[str, str]:
    """(resourceName, part) of an inline param. A table of several names ("player1,player2") spells the name
    into the param (PLAYER1_TRAINED)."""
    if "," in resource:
        for n in resource.split(","):
            if param.upper().startswith(n.upper() + "_"):
                return n, param[len(n) + 1:]
        return resource.split(",")[0], param
    return resource, param


def sheet_key(resource_name: str, param: str) -> str:
    """`voice_<resourceName>_<part>` of an inline param (serif parts are upper case in the includes)."""
    part = translatable.SERIF_WHITELIST.get(param.upper())
    if part is None or param in translatable.GREETING_PARTS or param in translatable.MANUAL_PARTS:
        part = param
    return f"voice_{resource_name}_{part}"


def serif_key(resource_name: str, param: str) -> str | None:
    return f"SERIF_{resource_name.upper()}_{param.upper()}" if param.upper() in translatable.SERIF_WHITELIST else None


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<br\s*/?>", " ", s or "", flags=re.IGNORECASE)).strip()


def collapse(text: str, block: dict) -> str:
    """The include without its inline params (resourceName kept as written)."""
    rn = [raw for name, raw, _ in block["params"] if name == "resourceName"]
    return "{% include voice-table.html " + rn[0] + " %}"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--dir", default="_charas")
    parser.add_argument("--processed", default="_data/processed")
    parser.add_argument("--out", default="zzz")
    args = parser.parse_args()

    data = translatable.load_processed(args.processed)
    if not data["en_voice"]:
        sys.exit("_data/processed/en_voice.json is missing or empty: run `py tools/voice_gsheet.py download` first")

    only_inline: dict[str, str] = {}
    differs: dict[str, dict] = {}
    seen_params: dict[str, int] = {}
    stats = {"blocks": 0, "stripped_blocks": 0, "params": 0, "same_as_game": 0, "same_as_sheet": 0,
             "differs_game": 0, "differs_sheet": 0, "only_inline": 0}
    rewrites = {}

    for path in sorted(glob.glob(os.path.join(args.dir, "*.md"))):
        with open(path, "rb") as f:
            raw = f.read().decode("utf-8")
        blocks = parse_blocks(raw)
        if not blocks:
            continue
        out = []
        last = 0
        for block in blocks:
            stats["blocks"] += 1
            names = [v for n, _, v in block["params"] if n == "resourceName"]
            if len(names) != 1:
                raise SystemExit(f"{path}: a voice-table include without exactly one resourceName")
            resource = names[0]
            inline = [(n, v) for n, _, v in block["params"] if n != "resourceName"]
            if not inline:
                continue
            stats["stripped_blocks"] += 1
            for param, value in inline:
                seen_params[param] = seen_params.get(param, 0) + 1
                stats["params"] += 1
                if not norm(value):
                    continue
                name, part = resolve(resource, param)
                key = sheet_key(name, part)
                sk = serif_key(name, part)
                game_en = (data["en_serif"].get(sk, "") if sk else data["en_greeting"].get(key, ""))
                jp = (data["jp_serif"].get(sk, "") if sk else data["jp_greeting"].get(key, ""))
                game_en = "" if game_en == jp else game_en
                sheet_en = data["en_voice"].get(key, "")
                if game_en:
                    stats["same_as_game" if norm(game_en) == norm(value) else "differs_game"] += 1
                elif sheet_en:
                    if norm(sheet_en) == norm(value):
                        stats["same_as_sheet"] += 1
                    else:
                        stats["differs_sheet"] += 1
                        differs[key] = {"inline": value, "sheet": sheet_en}
                else:
                    stats["only_inline"] += 1
                    only_inline[key] = value
            out.append(raw[last:block["start"]])
            out.append(collapse(raw, block))
            last = block["end"]
        out.append(raw[last:])
        new = "".join(out)
        if new != raw:
            rewrites[path] = new

    print(f"{stats['blocks']} voice-table includes, {stats['stripped_blocks']} with inline params "
          f"({stats['params']} params) in {len(rewrites)} files")
    print(f"  param names: {', '.join(f'{k}x{v}' for k, v in sorted(seen_params.items()))}")
    print(f"  same as the game's EN: {stats['same_as_game']}, game has other text (game wins): {stats['differs_game']}")
    print(f"  same as the sheet: {stats['same_as_sheet']}, sheet has other text: {stats['differs_sheet']}")
    print(f"  only inline (not in game, not in sheet): {stats['only_inline']}")

    if args.dry_run:
        return
    os.makedirs(args.out, exist_ok=True)
    wiki_util.dumpJson(os.path.join(args.out, "inline-voice-not-in-sheet.json"), only_inline, indent=2)
    wiki_util.dumpJson(os.path.join(args.out, "inline-voice-differs-from-sheet.json"), differs, indent=2)
    for path, new in rewrites.items():
        with open(path, "wb") as f:
            f.write(new.encode("utf-8"))
    print(f"wrote {len(rewrites)} pages, {args.out}/inline-voice-not-in-sheet.json ({len(only_inline)} lines)")


if __name__ == "__main__":
    main()
