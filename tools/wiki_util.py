import re
import json
import yaml
import os
import os.path

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

def sanitizeText(s: str):
    s = COLOR_PATTERN.sub(r'\2', s.strip())
    s = SIZE_PATTERN.sub(r'<span style="font-size: calc(\1px * 0.75)">\2</span>', s)
    return s

PASSIVE_SKILL_FRONT_MARKER = ['<style="パッシブ領域_en">', '<style="パッシブ領域">']

PASSIVE_SKILL_PATTERN = re.compile(r'<style="パッシブ領域(_en)?">(.*?)</style>', re.DOTALL)
ENHANCEMENT_PATTERN = re.compile(r'<style="スキル強化(_en)?">(.*?)</style>', re.DOTALL)
AUTO_ACTION_MARKER = ['<style="オート行動_en"></style>', '<style="オート行動"></style>']
AUTO_ACTION_PATTERN = re.compile(r'<style="オート行動(_en)?">(.*?)</style>', re.DOTALL)

def sanitizeSkillDescription(s: str) -> str:
    s = COLOR_PATTERN.sub(r'\2', s.strip())
    s = SIZE_PATTERN.sub(r'\2', s)

    s = s.replace(r'<style="改行"></style>', '<br>')
    s = PASSIVE_SKILL_PATTERN.sub(r'<wiki-passive>\2</wiki-passive>', s)
    s = ENHANCEMENT_PATTERN.sub(r'<wiki-enhance>\2</wiki-enhance>', s)

    for marker in AUTO_ACTION_MARKER:
        if marker in s:
            s = s.replace(marker, '<wiki-auto-action>') + '</wiki-auto-action>'

    s = AUTO_ACTION_PATTERN.sub(r'<wiki-auto-action>\2</wiki-auto-action>', s)

    # LW cannot be trusted to close their tag
    for marker in PASSIVE_SKILL_FRONT_MARKER:
        if marker in s:
            s = s.replace(marker, '<wiki-passive>') + '</wiki-passive>'
    s = s.replace('<style="改行">', '')
    s = s.replace('</style>', '')

    return s

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
