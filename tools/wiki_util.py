import re
import json
import yaml
import os
import os.path
import glob
import xml.etree.ElementTree as ET

def ensureDirs(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def omitEmptyDict(**kwargs) -> dict:
    obj = {}
    has_key = False
    for k, v in kwargs.items():
        if v != "":
            has_key = True
            obj[k] = v
    if has_key:
        return obj
    return None

COLOR_PATTERN = re.compile(r"<color=(.*?)>(.*?)</color>", re.DOTALL)
SIZE_PATTERN = re.compile(r"<size=(\d+)>(.*?)</size>", re.DOTALL)
SIZE_PREFIX = re.compile(r"<size=(\d+)>", re.DOTALL)
COLOR_PREFIX = re.compile(r"<color=[^>]*>")
SPRITE_PATTERN = re.compile(r"<sprite=(\d+)>", re.DOTALL)
ALIGN_PATTERN = re.compile(r"<align=center>(.*?)</align>", re.DOTALL)

def sanitizeText(s: str):
    s = COLOR_PATTERN.sub(r'\2', s.strip())
    #s = s.replace('<align=center>', '')
    s = SPRITE_PATTERN.sub(r'(Sprite \1)', s) # TODO
    s = ALIGN_PATTERN.sub(r'\1', s)
    s = SIZE_PATTERN.sub(r'<span style="font-size: calc(\1px * 0.75)">\2</span>', s)
    return s

# The game marks styled regions as <style="パッシブ領域">, <style="スキル強化">, <style="オート行動">.
# Localized dumps append a language suffix (_en, _cn, _tw, ...), and some strings drop a quote
# (<style=パッシブ領域">), so the suffix and both quotes are matched leniently.
_STYLE_OPEN = r'<style="?{name}(?:_[A-Za-z]{{2}})?"?>'

def _style(name: str) -> str:
    return _STYLE_OPEN.format(name=name)

PASSIVE_SKILL_PATTERN = re.compile(_style('パッシブ領域') + r'(.*?)</style>', re.DOTALL)
PASSIVE_SKILL_FRONT_MARKER = re.compile(_style('パッシブ領域'))
ENHANCEMENT_PATTERN = re.compile(_style('(?:スキル)?強化') + r'(.*?)</style>', re.DOTALL)
ENHANCEMENT_OPEN_PATTERN = re.compile(_style('(?:スキル)?強化'))
AUTO_ACTION_MARKER = re.compile(_style('オート行動') + '</style>')
AUTO_ACTION_PATTERN = re.compile(_style('オート行動') + r'(.*?)</style>', re.DOTALL)
LINE_BREAK_PATTERN = re.compile(r'<style="?改行"?></style>')
LINE_BREAK_OPEN_PATTERN = re.compile(r'<style="?改行"?>')

FORMULA_PREFIX_PATTERN = re.compile(r'^[\+\=]')

def sanitizeSkillDescriptionForDisplay(s: str) -> str:
    """Game markup -> the wiki tag set (<br>, <wiki-passive>, <wiki-enhance>, <wiki-auto-action>).

    This is the text shown to readers. assets/skill-tree.js ports it line by line and
    tools/testdata/sanitize_cases.json pins both implementations to the same cases."""
    s = COLOR_PATTERN.sub(r'\2', s.strip())
    s = SIZE_PATTERN.sub(r'\2', s)

    s = LINE_BREAK_PATTERN.sub('<br>', s)
    s = PASSIVE_SKILL_PATTERN.sub(r'<wiki-passive>\1</wiki-passive>', s)
    s = ENHANCEMENT_PATTERN.sub(r'<wiki-enhance>\1</wiki-enhance>', s)

    if AUTO_ACTION_MARKER.search(s):
        s = AUTO_ACTION_MARKER.sub('<wiki-auto-action>', s) + '</wiki-auto-action>'

    s = AUTO_ACTION_PATTERN.sub(r'<wiki-auto-action>\1</wiki-auto-action>', s)

    # LW cannot be trusted to close their tag
    if PASSIVE_SKILL_FRONT_MARKER.search(s):
        s = PASSIVE_SKILL_FRONT_MARKER.sub('<wiki-passive>', s) + '</wiki-passive>'
    s = LINE_BREAK_OPEN_PATTERN.sub('', s)
    # an enhance region whose end is missing: how far it ran is unknown, so it is not highlighted
    s = ENHANCEMENT_OPEN_PATTERN.sub('', s)
    s = s.replace('</style>', '')
    # remove stray size / color openers (the game does not always close them)
    s = SIZE_PREFIX.sub('', s)
    s = COLOR_PREFIX.sub('', s)
    return s

def sanitizeSkillDescription(s: str) -> str:
    """sanitizeSkillDescriptionForDisplay + a guard for the Google Sheet round trip
    (translation_gen_tsv.py): a leading + or = would be turned into a formula."""
    s = sanitizeSkillDescriptionForDisplay(s)
    if FORMULA_PREFIX_PATTERN.match(s):
        s = "'" + s
    return s

FRONT_MATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)

def read_front_matter(path):
    """Return the parsed YAML front-matter of a Jekyll markdown file, or None."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    m = FRONT_MATTER_PATTERN.match(text)
    if not m:
        return None
    return yaml.safe_load(m.group(1))

def build_chara_pages(charas_dir) -> dict:
    """Map characterId -> { title, url, data } for released chara pages.

    Mirrors Jekyll's CharaMap (skips `unreleased`) so the resolved title/url
    match what the `stockIdToLink` Liquid filter would produce. The url is the
    explicit `permalink` front-matter or Jekyll's default `/charas/<filename>/`.
    """
    pages = {}
    for path in glob.glob(os.path.join(charas_dir, "*.md")):
        fm = read_front_matter(path)
        if not fm:
            continue
        cid = fm.get("characterId")
        if cid is None or fm.get("unreleased"):
            continue
        filename = os.path.splitext(os.path.basename(path))[0]
        url = fm.get("permalink") or f"/charas/{filename}/"
        pages[cid] = {"title": fm.get("title", ""), "url": url, "data": fm}
    return pages

def loadJson(filename) -> dict:
    with open(filename, "rb") as f:
        return json.load(f)

def loadYaml(filename) -> dict:
    with open(filename, "rb") as f:
        return yaml.safe_load(f)

def dumpJson(filename, obj, **kwargs):
    if "indent" not in kwargs:
        kwargs["indent"] = ""
    with open(filename, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, **kwargs)

has_invalid_html = False

LESSER_PATTERN = re.compile(r"\s<(\s|=|\d)")
GREATER_PATTERN = re.compile(r"\s<(\s|=|\d)")

def validateHtml(s: str):
    try:
        # a bunch of hack because html is more leniant than actual xml
        # we only want to detect if html tags are closed correctly
        s = LESSER_PATTERN.sub(" ", s)
        s = GREATER_PATTERN.sub(" ", s)
        s = s.replace("<br>", " ").replace("&nbsp;", "").replace("&", " ")

        ET.fromstring("<xml>" + s + "</xml>")
        return None
    except ET.ParseError as e:
        global has_invalid_html
        has_invalid_html = True
        return e
