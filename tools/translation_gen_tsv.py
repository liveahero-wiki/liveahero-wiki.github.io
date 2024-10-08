import csv

from wiki_util import *

def skillIdToCharaResourceNameMap() -> dict:
    HeroMaster = loadJson("_data/CardMaster.json")
    SidekickMaster = loadJson("_data/SidekickMaster.json")

    obj = {}

    for chara in HeroMaster.values():
        for skillId in chara["skillIds"]:
            obj[skillId] = chara["resourceName"]

    for chara in SidekickMaster.values():
        for skillId in chara["skillIds"]:
            obj[skillId] = chara["resourceName"]

        for skillId in chara["equipmentSkills"]:
            obj[skillId] = chara["resourceName"]

    return obj

def writeEnglishSkill():
    SkillMaster = loadJson("_data/SkillMaster.json")
    SkillName = loadYaml("_data/wiki/SkillNameTranslation.yml")

    charaMap = skillIdToCharaResourceNameMap()

    with open("skill-en.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillId", "charaName", "skillName", "description", "skillNameEng"])

        for skill in SkillMaster.values():
            si = int(skill["skillId"])
            charaName = charaMap.get(si, "")
            eng = SkillName.get(si, "")

            writer.writerow([
                skill["skillId"],
                charaName,
                skill["skillName"],
                sanitizeSkillDescription(skill["description"]),
                eng,
            ])


def main():
    SkillMaster = loadJson("_data/SkillMaster.json")

    charaMap = skillIdToCharaResourceNameMap()

    with open("skill-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillId", "charaNme", "skillName", "description"])
        for skill in SkillMaster.values():

            si = int(skill["skillId"])
            charaNme = charaMap.get(si, "")

            writer.writerow([
                skill["skillId"],
                charaNme,
                skill["skillName"],
                sanitizeSkillDescription(skill["description"]),
            ])

    SkillEffectMaster = loadJson("_data/SkillEffectMaster.json")
    with open("skill-effect-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillEffectId", "statusId", "overrideStatusName", "overrideStatusDescription"])
        for value in SkillEffectMaster.values():
            skillEffect = value["skillEffectJson"]
            if skillEffect["statusId"] == 0 or \
                not skillEffect.get("isOverrideStatusName", False) or \
                not skillEffect.get("isOverrideStatusDescription", False):
                continue

            writer.writerow([
                value["skillEffectId"],
                skillEffect["statusId"],
                skillEffect["overrideStatusName"],
                sanitizeSkillDescription(skillEffect["overrideStatusDescription"]),
            ])

if __name__ == '__main__':
    main()
    writeEnglishSkill()

