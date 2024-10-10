import re
import json
import yaml


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

def sanitizeText(s):
    s = COLOR_PATTERN.sub(r'\2', s[:-1])
    s = SIZE_PATTERN.sub(r'<span style="font-size: calc(\1px * 0.75)">\2</span>', s)
    return s

PASSIVE_SKILL_FRONT_MARKER = '<style="パッシブ領域">'

PASSIVE_SKILL_PATTERN = re.compile(PASSIVE_SKILL_FRONT_MARKER + r'(.*?)</style>', re.DOTALL)
ENHANCEMENT_PATTERN = re.compile(r'<style="スキル強化">(.*?)</style>', re.DOTALL)
AUTO_ACTION_MARKER = '<style="オート行動"></style>'

def sanitizeSkillDescription(s: str) -> str:
    s = sanitizeText(s)

    s = s.replace(r'<style="改行"></style>', '<br>')
    s = PASSIVE_SKILL_PATTERN.sub(r'<wiki-passive>\1</wiki-passive>', s)
    s = ENHANCEMENT_PATTERN.sub(r'<wiki-enhance>\1</wiki-enhance>', s)
    if AUTO_ACTION_MARKER in s:
        s = s.replace(AUTO_ACTION_MARKER, '<wiki-auto-action>') + '</wiki-auto-action>'

    # LW cannot be trusted to close their tag
    if PASSIVE_SKILL_FRONT_MARKER in s:
        s = s.replace(PASSIVE_SKILL_FRONT_MARKER, '<wiki-passive>') + '</wiki-passive>'
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
