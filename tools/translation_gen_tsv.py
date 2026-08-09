import csv
import re

from wiki_util import *

# Strips wiki/style tags and whitespace; used to tell a real text-bearing
# condition line apart from a markup-only filler (e.g. a lone <style="改行"></style>).
# Mirrors _has_visible_text in generate_skill_search_index / gen_skill_upgrade_model.
_VISIBLE_TEXT_RE = re.compile(r"<[^>]+>|\s")


def _has_visible_text(s) -> bool:
    return bool(_VISIBLE_TEXT_RE.sub("", s or ""))


def skillIdToCharaResourceNameMap() -> dict:
    HeroMaster = loadJson("_data/CardMaster.json")
    SidekickMaster = loadJson("_data/SidekickMaster.json")

    obj = {}

    for chara in HeroMaster.values():
        for skillId in chara["skillIds"]:
            obj[skillId] = chara["resourceName"]

        # bloom (skill-tree) skill ids are not in skillIds; map them too so the
        # skill-upgrade sheet gets a chara name. They live on skillProvider and
        # in the before->after skillUpgradeQuestInfos change map.
        provider = chara.get("skillProvider") or {}
        for a in (provider.get("activeSkills") or []) + (provider.get("passiveSkills") or []):
            obj[a["skillId"]] = chara["resourceName"]
        for q in (chara.get("skillUpgradeQuestInfos") or []):
            for c in (q.get("changeSkills") or []):
                obj[c["afterSkillId"]] = chara["resourceName"]

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

    EnglishMaster = loadJson("zzz/English.json")

    charaMap = skillIdToCharaResourceNameMap()

    with open("skill-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillId", "charaName", "skillName", "description", "skillNameTranslated", "descriptionTranslated"])
        for status in SkillMaster.values():

            si = int(status["skillId"])
            charaName = charaMap.get(si, "")

            writer.writerow([
                status["skillId"],
                charaName,
                status["skillName"],
                sanitizeSkillDescription(status["description"]),
                EnglishMaster.get(f"SKILL_NAME_{si}", ""),
                sanitizeSkillDescription(EnglishMaster.get(f"SKILL_DESCRIPTION_{si}", "")),
            ])

    SkillEffectMaster = loadJson("_data/SkillEffectMaster.json")
    with open("skill-effect-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillEffectId", "statusId", "overrideStatusName", "overrideStatusDescription", "overrideStatusNameTranslated", "overrideStatusDescriptionTranslated"])
        for value in SkillEffectMaster.values():
            skillEffect = value["skillEffectJson"]
            #if skillEffect["statusId"] == 0 or \
            #    not (skillEffect.get("isOverrideStatusName", False) or \
            #    skillEffect.get("isOverrideStatusDescription", False)):
            #    continue
            if skillEffect["statusId"] == 0 or \
                len(skillEffect.get("overrideStatusDescription", "")) == 0:
                continue

            sei = int(value["skillEffectId"])

            writer.writerow([
                value["skillEffectId"],
                skillEffect["statusId"],
                skillEffect["overrideStatusName"],
                sanitizeSkillDescription(skillEffect["overrideStatusDescription"]),
                EnglishMaster.get(f"OVERRIDE_STATUS_NAME_{sei}", ""),
                sanitizeSkillDescription(EnglishMaster.get(f"OVERRIDE_STATUS_DESCRIPTION_{sei}", "")),
            ])

    StatusMaster = loadJson("_data/StatusMaster.json")
    with open("status-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["statusId", "statusName", "description", "statusNameTranslated", "descriptionTranslated"])
        for status in StatusMaster.values():
            si = int(status["statusId"])

            writer.writerow([
                status["statusId"],
                status["statusName"],
                sanitizeSkillDescription(status["description"]),
                EnglishMaster.get(f"STATUS_NAME_{si}", ""),
                sanitizeSkillDescription(EnglishMaster.get(f"STATUS_DESCRIPTION_{si}", "")),
            ])

    SkillUpgradeMaster = loadJson("_data/SkillUpgradeMaster.json")
    with open("skill-upgrade-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillEntryId", "skillId", "charaName", "description", "descriptionTranslated"])
        for node in SkillUpgradeMaster.values():
            ei = int(node["skillEntryId"])
            sk = int(node["skillId"])

            writer.writerow([
                node["skillEntryId"],
                node["skillId"],
                charaMap.get(sk, ""),
                sanitizeSkillDescription(node["description"]),
                sanitizeSkillDescription(EnglishMaster.get(f"SKILL_UPGRADE_DESCRIPTION_{ei}", "")),
            ])

    # Per-tier condition lines shown in the bloom skill tree
    # (_includes/hero-skill-evolution-v2.html). Keyed by (skillId, serialNo);
    # not covered by any other sheet. Only text-bearing lines are emitted.
    with open("skill-condition-jp.tsv", "w", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["skillId", "serialNo", "charaName", "description", "descriptionTranslated"])
        for skill in SkillMaster.values():
            si = int(skill["skillId"])
            for e in (skill.get("effects") or []):
                cond = e.get("conditionDescription") or ""
                if not _has_visible_text(cond):
                    continue
                sn = e.get("serialNo")

                writer.writerow([
                    skill["skillId"],
                    sn,
                    charaMap.get(si, ""),
                    sanitizeSkillDescription(cond),
                    sanitizeSkillDescription(EnglishMaster.get(f"SKILL_EFFECT_CONDITION_DESCRIPTION_{si}_{sn}", "")),
                ])

if __name__ == '__main__':
    main()
    #writeEnglishSkill()
    #writeEnglishStatus()

