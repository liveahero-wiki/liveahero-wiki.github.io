import os
import json
import re
import argparse
import yaml

EVENT_NAME_PATTERN = re.compile(r"([a-zA-Z_]+)(\d+)")
DETECT_YAML = re.compile("---(.*?)---", re.MULTILINE | re.DOTALL)

with open("_data/EventMaster.json", "r", encoding="utf-8") as f:
    EventMaster: dict = json.load(f)

def getCharaIdToPageMap() -> dict:
  files = next(os.walk("_charas"))[2]

  obj = {}
  for file in files:
    with open(os.path.join("_charas", file), "r", encoding="utf-8") as f:
        text = f.read()
    m = DETECT_YAML.match(text)
    front_matter: dict = yaml.safe_load(m.group(1))
    obj[front_matter.get('characterId')] = front_matter.get("title")

  return obj

def generate_event(eventId: str, prefix: str = ""):
    E = EventMaster[eventId]
    baseResourceName = E.get("baseResourceName")

    charaIdToPageMap = getCharaIdToPageMap()

    m = EVENT_NAME_PATTERN.match(baseResourceName)
    if not m:
        if prefix:
            pageName = prefix + baseResourceName
        else:
            print(f"Event name pattern not found for {baseResourceName}. Use --prefix to add prefix")
            return
    else:
        pageName = m.group(2) + m.group(1)

    shopId = E['eventPortalJson'].get('storeId')
    terms = E['eventPortalJson'].get('terms', [])
    questInfos = E['eventPortalJson'].get('questInfos', [])
    questBonusJsons = E.get('questBonusJsons', [])

    with open(f"_events/{pageName}.md", "w", encoding="utf-8") as f:
        f.write(f"---\n")
        f.write(f"title: \n")
        f.write(f"eventId: {eventId}\n")
        f.write(f"jp_title: \n")
        f.write(f"banner_image: \n")
        f.write(f"gacha: true\n")

        for term in terms:
            keys = term.get('keys', [])
            endAt = term.get('endAt').replace(" ", "T") + "+09"
            if "UI_MISSION" in keys:
                f.write(f"event_start_time: \n")
                f.write(f"event_end_time: {endAt}\n")
            if "UI_FREE_QUEST" in keys:
                f.write(f"farm_start_time: \n")
                f.write(f"farm_end_time: {endAt}\n")
            if "UI_SALES" in keys:
                f.write(f"sales_start_time: \n")
                f.write(f"sales_end_time: {endAt}\n")

        f.write(f"news_link: \n")
        f.write(f"---\n\n")
        f.write(f"* this will be unordered\n{{:toc}}\n\n")
        f.write(f"## Event Preview\n\nTODO\n\n")
        f.write(f"## Event Banners\n\nTODO\n\n")
        
        if questBonusJsons:
            f.write(f"## Free Quest Bonus\n\n")
            f.write(f"Here is a list of heroes and sidekicks which grants bonus in this event:\n\n")

            f.write(f"| Hero | +Bonus (%) |\n")
            f.write(f"|---|---|\n")
            for questBonusJson in questBonusJsons:
                bonusClass = questBonusJson.get('class')
                stockId = questBonusJson.get('targetStockId')
                variant = stockId % 10
                charaId = stockId // 10 - 1000
                suffix = ""
                if bonusClass == "HeroQuestRewardBonus":
                    suffix = f"|h{variant}"
                    f.write(f"| {{% chara_link {charaIdToPageMap[charaId]}{suffix} %}} | {questBonusJson.get('bonusValue')} |\n")
            
            f.write(f"\n| Sidekick | +Bonus (%) |\n")
            f.write(f"|---|---|\n")
            for questBonusJson in questBonusJsons:
                bonusClass = questBonusJson.get('class')
                stockId = questBonusJson.get('targetStockId')
                charaId = stockId // 10 - 1000
                if bonusClass == "SidekickQuestRewardBonus":
                    f.write(f"| {{% chara_link {charaIdToPageMap[charaId]} %}} | {questBonusJson.get('bonusValue')} |\n")
            f.write(f"\n")

        f.write(f"## Event Sales Bonus\n\nTODO\n\n")
        f.write(f"## Special Mission\n\nTODO\n\n")
        f.write(f"## Limited Time Mission\n\nTODO\n\n")

        if shopId:
            f.write(f"## Event Shop\n\n{{% include shop-table.html id={shopId} %}}\n\n")

        if questInfos:
            f.write(f"## Quest Details\n\n")

            for questInfo in questInfos:
                questType = questInfo.get('type', 0)
                if questType == 5:
                    f.write(f"### Main Quests\n\n{{% include quest-group.html chapterId={questInfo.get('chapterId')} %}}\n\n")
                elif questType == 6:
                    f.write(f"### Free Quests\n\n{{% include quest-group.html chapterId={questInfo.get('chapterId')} %}}\n\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("eventId", type=str, help="Event ID")
    parser.add_argument("--prefix", type=str, help="Prefix for event name")
    args = parser.parse_args()
    generate_event(args.eventId, args.prefix)
