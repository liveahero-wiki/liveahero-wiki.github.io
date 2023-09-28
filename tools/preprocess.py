import os.path
import json
import sys
from collections import defaultdict


def dumpJson(filename, obj, **kwargs):
    if "indent" not in kwargs:
        kwargs["indent"] = ""
    with open(filename, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, **kwargs)


def processPropertiesFile(raw_file, bio_file, serif_file, profile_file):
    with open(os.path.join("_data", "processed", raw_file), "r", encoding="utf-8") as f:
        lines = f.readlines()

    detail = {}
    serif = {}
    profile = {}

    for line in lines:
        s = line.split("=")

        if s[0].startswith("DETAIL"):
            detail[s[0]] = s[1][:-1].replace("<br><b><colo", "")

        if s[0].startswith("SERIF"):
            serif[s[0]] = s[1][:-1]

        if s[0].startswith("PROFILE_"):
            profile[s[0]] = s[1][:-1]

    dumpJson(os.path.join("_data", "processed", bio_file), detail)
    dumpJson(os.path.join("_data", "processed", serif_file), serif)
    dumpJson(os.path.join("_data", "processed", profile_file), profile)


def processShopFile():
    with open(os.path.join("_data", "ShopMaster.json"), "r", encoding="utf-8") as f:
        obj = json.load(f)

    stores = obj["stores"]

    for id, store in stores.items():
        for p in store["products"]:
            del p["storeProductNo"]
        dumpJson(os.path.join("_data", "stores", id + ".json"), store)


def processMasterDataCatalog():
    with open(
        os.path.join("_data", "MasterDataCatalog.json"), "r", encoding="utf-8"
    ) as f:
        obj = json.load(f)

    obj = list(obj)
    obj.sort()

    dumpJson(os.path.join("_data", "MasterDataCatalog_list.json"), obj)


CARD_OVERRIDE_ITEM = {
    1: "affiliation",
    3: "illustrator",
    5: "detail_h01",
    6: "detail_h02",
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
    processPropertiesFile("Japanese.properties", "jp_bio.json", "jp_serif.json", "jp_profile.json")
