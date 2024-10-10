import csv
import json
import yaml
import io
import argparse

import requests

import wiki_util

SKILL_TL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=1388379188&single=true&output=tsv"
SKILL_EFFECT_TL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQGnHrxbjI27aRZLsu52ZiBlhZIqLEA4nsd0nICwGlzFPH_v2AQlvC5hf7mvvs8i7-XhfRkq0HcbhU1/pub?gid=1473812801&single=true&output=tsv"

def getTranslatedTsv(url, filename, use_local=True):
    if not use_local:
        resp = requests.get(url)
        if resp.status_code != 200:
            raise FileNotFoundError(url)

        content = resp.content.decode("utf-8")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        reader = csv.DictReader(io.StringIO(content), delimiter='\t')
        for row in reader:
            yield row
    else:
        with open(filename, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter='\t')
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
            obj[row["skillId"]] = skill

    wiki_util.ensureDirs("_data/translation/")
    wiki_util.dumpJson("_data/translation/Skill.json", obj, indent=2)

def processSkillEffectTranslation(use_local: bool):
    rows = getTranslatedTsv(SKILL_EFFECT_TL_URL, "skill-effect-tl.tsv", use_local)

    obj = {}
    for row in rows:
        skill = wiki_util.omitEmptyDict(
            skillName=row["overrideStatusNameTranslated"],
            description=row["overrideStatusDescriptionTranslated"],
        )
        if skill:
            obj[row["skillEffectId"]] = skill

    wiki_util.ensureDirs("_data/translation/")
    wiki_util.dumpJson("_data/translation/SkillEffect.json", obj, indent=2)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--use_local", action="store_true")
    ARGS = parser.parse_args()

    processSkillTranslation(ARGS.use_local)
    processSkillEffectTranslation(ARGS.use_local)
