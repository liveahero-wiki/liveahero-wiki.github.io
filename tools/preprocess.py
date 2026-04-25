import os.path
import json
import sys
import re
import collections
import yaml

from collections import defaultdict

from wiki_util import dumpJson, sanitizeText, omitEmptyDict

def processPropertiesFile(raw_file, bio_file, serif_file, profile_file, library_file, sales_report_file,
    score_attack_file,
    card_collection_file,
):
    with open(os.path.join("zzz", raw_file), "rb") as f:
        obj = json.load(f)

    detail = {}
    serif = {}
    profile = {}
    library = {}
    sales_report = {}
    score_attack = {}
    card_collection = {}

    for key, value in obj.items():
        s = [key, value]

        if s[0].startswith("DETAIL"):
            detail[s[0]] = sanitizeText(s[1])

        if s[0].startswith("SERIF"):
            serif[s[0]] = sanitizeText(s[1])

        if s[0].startswith("PROFILE_"):
            profile[s[0]] = sanitizeText(s[1])

        if s[0].startswith("LIBRARY_"):
            library[s[0]] = sanitizeText(s[1])

        if s[0].startswith("SALES_REPORT_") or s[0].startswith("SALES_EVENT_"):
            sales_report[s[0]] = sanitizeText(s[1])
        
        if s[0].startswith("HINT_SCORE_ATTACK_"):
            score_attack[s[0]] = sanitizeText(s[1])
        
        if s[0].startswith("COLLECTION_"):
            card_collection[s[0]] = sanitizeText(s[1])

    detail = collections.OrderedDict(sorted(detail.items()))
    serif = collections.OrderedDict(sorted(serif.items()))
    profile = collections.OrderedDict(sorted(profile.items()))
    library = collections.OrderedDict(sorted(library.items()))
    sales_report = collections.OrderedDict(sorted(sales_report.items()))
    score_attack = collections.OrderedDict(sorted(score_attack.items()))
    card_collection = collections.OrderedDict(sorted(card_collection.items()))

    dumpJson(os.path.join("_data", "processed", bio_file), detail)
    dumpJson(os.path.join("_data", "processed", serif_file), serif)
    dumpJson(os.path.join("_data", "processed", profile_file), profile)
    dumpJson(os.path.join("_data", "processed", library_file), library)
    dumpJson(os.path.join("_data", "processed", sales_report_file), sales_report)
    dumpJson(os.path.join("_data", "processed", score_attack_file), score_attack)
    dumpJson(os.path.join("_data", "processed", card_collection_file), card_collection)

def processShopFile():
    with open(os.path.join("_data", "ShopMaster.json"), "r", encoding="utf-8") as f:
        obj = json.load(f)

    stores = obj["stores"]

    for id, store in stores.items():
        for p in store["products"]:
            del p["storeProductNo"]
        dumpJson(os.path.join("_data", "stores", id + ".json"), store)


def processSalesFile():
    with open(os.path.join("_data", "SalesMaster.json"), "r", encoding="utf-8") as f:
        obj = json.load(f)

    data = defaultdict(set)

    for id, sale in obj.items():
        regionId = sale["regionId"]
        reports = sale["reports"]
        for report in reports:
            textKey = report["textKey"]
            if int(regionId) >= 200 and textKey.startswith("SALES_REPORT_"):
                continue
            data[regionId].add(textKey)

    data = {k: sorted(list(v)) for k, v in data.items()}

    dumpJson(os.path.join("_data", "processed", "sales_report_master.json"), data, indent='\t', sort_keys=True)

def processMasterDataCatalog():
    with open(
        os.path.join("_data", "MasterDataCatalog.json"), "r", encoding="utf-8"
    ) as f:
        obj = json.load(f)

    obj = list(obj)
    obj.sort()

    dumpJson(os.path.join("_data", "MasterDataCatalog_list.json"), obj)

# Skip ether stones
ITEM_NAME_BLACKLIST = [
    1,
    2,
]

def processItemInfo():
    with open(os.path.join("zzz", "English.json"), "rb") as f:
        obj = json.load(f)

    with open(os.path.join("_data", "ItemMaster.json"), "rb") as f:
        ItemMaster = json.load(f)

    with open(os.path.join("_data", "wiki", "Item.yml"), "rb") as f:
        ItemWiki = yaml.load(f, Loader=yaml.FullLoader)

    newItemWiki = {}

    for itemId in ItemMaster.keys():
        iid = int(itemId)
        if iid > 100000 and iid < 300000:
            continue
        if iid > 20000000 and iid < 30000000:
            continue

        origItemWikiName = ItemWiki.get(iid, {}).get("name", "")
        itemNameTranslated = obj.get(f"ITEM_NAME_{itemId}", "")
        itemDescriptionTranslated = obj.get(f"ITEM_DESCRIPTION_{itemId}", "")
        newItemWiki[iid] = omitEmptyDict({
            "name": itemNameTranslated if iid not in ITEM_NAME_BLACKLIST else origItemWikiName,
            "description": ItemWiki.get(iid, {}).get("description", itemDescriptionTranslated),
        })

    with open(os.path.join("_data", "wiki", "Item.yml"), "w", encoding="utf-8") as f:
        yaml.dump(newItemWiki, f, allow_unicode=True, sort_keys=False)

CARD_OVERRIDE_ITEM = {
    1: "affiliation",
    2: "job",
    3: "illustrator",
    5: "detail_h01",
    6: "detail_h02",
    8: "name",
}

def processCardProfileOverride():
    with open(
        os.path.join("_data", "CardProfileOverrideMaster.json"), "r", encoding="utf-8"
    ) as f:
        obj: dict = json.load(f)

    result = defaultdict(lambda: defaultdict(dict))

    for _, value in obj.items():
        stockId = value["stockId"]
        cardType = "hero" if value["cardType"] == 1 else "sidekick"
        overrideItem = CARD_OVERRIDE_ITEM[value["overrideItem"]]
        result[stockId][cardType][overrideItem] = value["textKey"]

    dumpJson(os.path.join("_data", "processed", "CardProfileOverride.json"), result, indent='\t')


if __name__ == "__main__":
    processCardProfileOverride()
    processPropertiesFile("Japanese.json", "jp_bio.json", "jp_serif.json", "jp_profile.json", "jp_library.json", "jp_sales_report.json", "jp_score_attack.json")
