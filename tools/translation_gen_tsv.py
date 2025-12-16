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
    Skill = loadJson("_data/translation/Skill.json")

    charaMap = skillIdToCharaResourceNameMap()

    with open("skill-en.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        #writer.writerow(["skillId", "charaName", "skillName", "description", "skillNameTranslated", "descriptionTranslated"])

        for skill in SkillMaster.values():
            si = int(skill["skillId"])
            charaName = charaMap.get(si, "")
            ss = Skill.get(si, "")

            writer.writerow([
                skill["skillId"],
                charaName,
                skill["skillName"],
                sanitizeSkillDescription(skill["description"]),
                ss["skillName"] if ss else "",
                ss["description"] if ss else "",
            ])

def writeEnglishStatus():
    StatusMaster = loadJson("_data/StatusMaster.json")
    StatusWiki = loadJson("_data/translation/Status.json")

    with open("status-en.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        #writer.writerow(["statusId", "statusName", "description", "icon", "statusNameTranslated", "descriptionTranslated"])
        for status in StatusMaster.values():

            swiki = StatusWiki.get(str(status["statusId"]))

            writer.writerow([
                status["statusId"],
                status["statusName"],
                sanitizeSkillDescription(status["description"]),
                swiki.get("icon", "") if swiki else "",
                swiki.get("name", "") if swiki else "",
                swiki.get("description", "") if swiki else "",
            ])

def main():
    SkillMaster = loadJson("_data/SkillMaster.json")

    charaMap = skillIdToCharaResourceNameMap()

    with open("skill-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillId", "charaName", "skillName", "description"])
        for status in SkillMaster.values():

            si = int(status["skillId"])
            charaName = charaMap.get(si, "")

            writer.writerow([
                status["skillId"],
                charaName,
                status["skillName"],
                sanitizeSkillDescription(status["description"]),
            ])

    SkillEffectMaster = loadJson("_data/SkillEffectMaster.json")
    with open("skill-effect-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillEffectId", "statusId", "overrideStatusName", "overrideStatusDescription"])
        for value in SkillEffectMaster.values():
            skillEffect = value["skillEffectJson"]
            if skillEffect["statusId"] == 0 or \
                not (skillEffect.get("isOverrideStatusName", False) or \
                skillEffect.get("isOverrideStatusDescription", False)):
                continue

            writer.writerow([
                value["skillEffectId"],
                skillEffect["statusId"],
                skillEffect["overrideStatusName"],
                sanitizeSkillDescription(skillEffect["overrideStatusDescription"]),
            ])

    StatusMaster = loadJson("_data/StatusMaster.json")
    with open("status-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["statusId", "statusName", "description"])
        for status in StatusMaster.values():
            writer.writerow([
                status["statusId"],
                status["statusName"],
                sanitizeSkillDescription(status["description"]),
            ])

if __name__ == '__main__':
    main()
    #writeEnglishSkill()
    #writeEnglishStatus()

