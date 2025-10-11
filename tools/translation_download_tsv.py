import csv
import io
import argparse
import xml.etree.ElementTree as ET
import sys
import re

import requests

import wiki_util

SKILL_TL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=1388379188&single=true&output=csv"
SKILL_EFFECT_TL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=1473812801&single=true&output=csv"
STATUS_TL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=1446280214&single=true&output=csv"

has_invalid_html = False

LESSER_PATTERN = re.compile(r"\s<(\s|=|\d)")
GREATER_PATTERN = re.compile(r"\s<(\s|=|\d)")

def validateHtml(s: str):
    try:
        # a bunch of hack because html is more leniant than actual xml
        # we only want to detect if html tags are closed correctly
        s = LESSER_PATTERN.sub(" ", s)
        s = GREATER_PATTERN.sub(" ", s)
        s = s.replace("<br>", " ").replace(" & ", " ").replace("&nbsp;", "")

        ET.fromstring("<xml>" + s + "</xml>")
        return None
    except ET.ParseError as e:
        global has_invalid_html
        has_invalid_html = True
        return e

def getTranslatedTsv(url, filename, use_local=True):
    if not use_local:
        resp = requests.get(url)
        if resp.status_code != 200:
            raise FileNotFoundError(url)

        content = resp.content.decode("utf-8")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        reader = csv.DictReader(io.StringIO(content))
        for row in reader:
            yield row
    else:
        with open(filename, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield row

def processSkillTranslation(use_local: bool):
    rows = getTranslatedTsv(SKILL_TL_URL, "skill-tl.tsv", use_local)

    obj = {}
    for row in rows:
        skill = wiki_util.omitEmptyDict(
            skillName=row["skillNameTranslated"],
            description=row["descriptionTranslated"],
        )
        if skill:
            if (e := validateHtml(row["descriptionTranslated"])) is not None:
                print(f"Invalid skill html({row["skillId"]}):", row["descriptionTranslated"], e)
            obj[row["skillId"]] = skill

    wiki_util.ensureDirs("_data/translation/")
    wiki_util.dumpJson("_data/translation/Skill.json", obj, indent=2)

    CardMaster = wiki_util.loadJson("_data/CardMaster.json")
    SidekickMaster = wiki_util.loadJson("_data/SidekickMaster.json")

    heroes={}
    sidekicks={}
    for chara in CardMaster.values():
        all_present = True
        for skillId in chara["skillIds"]:
            skill = obj.get(str(skillId))
            if not skill or not skill.get("description"):
                all_present = False
                break
        if all_present:
            heroes[chara["stockId"]] = True

    for chara in SidekickMaster.values():
        all_present = True
        for skillId in chara["skillIds"]:
            skill = obj.get(str(skillId))
            if not skill or not skill.get("description"):
                all_present = False
                break
        for skillId in chara["equipmentSkills"]:
            skill = obj.get(str(skillId))
            if not skill or not skill.get("description"):
                all_present = False
                break

        if all_present:
            sidekicks[chara["stockId"]] = True

    wiki_util.dumpJson("_data/translation/SkillV2Whitelist.json", dict(heroes=heroes, sidekicks=sidekicks))

def processSkillEffectTranslation(use_local: bool):
    rows = getTranslatedTsv(SKILL_EFFECT_TL_URL, "skill-effect-tl.tsv", use_local)

    obj = {}
    for row in rows:
        skillEffect = wiki_util.omitEmptyDict(
            overrideStatusName=row["overrideStatusNameTranslated"],
            overrideStatusDescription=row["overrideStatusDescriptionTranslated"],
        )
        if skillEffect:
            if (e := validateHtml(row["overrideStatusDescriptionTranslated"])) is not None:
                print(f"Invalid skillEffect html({row["skillEffectId"]}):", row["overrideStatusDescriptionTranslated"], e)
            obj[row["skillEffectId"]] = skillEffect

    wiki_util.ensureDirs("_data/translation/")
    wiki_util.dumpJson("_data/translation/SkillEffect.json", obj, indent=2)

def processStatusTranslation(use_local: bool):
    rows = getTranslatedTsv(STATUS_TL_URL, "status-tl.tsv", use_local)

    obj = {}
    for row in rows:
        status = wiki_util.omitEmptyDict(
            name=row["statusNameTranslated"],
            description=row["descriptionTranslated"],
            icon=row["icon"],
        )
        if status:
            if (e := validateHtml(row["descriptionTranslated"])) is not None:
                print(f"Invalid status html({row["statusId"]}):", row["descriptionTranslated"], e)
            obj[row["statusId"]] = status

    wiki_util.ensureDirs("_data/translation/")
    wiki_util.dumpJson("_data/translation/Status.json", obj, indent=2)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--use_local", action="store_true")
    ARGS = parser.parse_args()

    processSkillTranslation(ARGS.use_local)
    processSkillEffectTranslation(ARGS.use_local)
    processStatusTranslation(ARGS.use_local)

    if has_invalid_html:
        sys.exit(1)
