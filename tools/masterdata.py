import urllib.request
import os.path
import json
import sys
import argparse

from wiki_util import ensureDirs
from preprocess import *

HEADER = {
  "User-Agent": "LiveAHeroAPI",
  'Accept-Encoding': 'gzip, deflate',
}

def httpRequest(url):
    print(url)
    req = urllib.request.Request(url, None, HEADER)
    with urllib.request.urlopen(req) as res:
      if res.info().get('Content-Encoding') == 'gzip':
        pagedata = gzip.decompress(res.read())
      elif res.info().get('Content-Encoding') == 'deflate':
        pagedata = res.read()
      elif res.info().get('Content-Encoding'):
        raise Exception('Encoding type unknown: ' + res.info().get('Content-Encoding'))
      else:
        pagedata = res.read()
      data = pagedata.decode()
      return data

def getVersion():
  data = httpRequest("https://gateway.live-a-hero.jp/api/status/version")
  obj = json.loads(data)
  print(obj)
  if obj["result"] != True:
    raise Exception("Failed to get version")

  if not obj.get("client") or not obj.get("master"):
    print("No version")
    sys.exit(0)

  return obj["client"], obj["master"]

def getWikiVersion():
  with open(os.path.join("tools", "masterdata_ver.txt"), "r") as f:
    return f.readline()

def updateWikiVersion(ver):
  with open(os.path.join("tools", "masterdata_ver.txt"), "w") as f:
    f.write(str(ver))

def downloadMasterdata(masterVersion, filename):
  data = httpRequest(f"https://d1itvxfdul6wxg.cloudfront.net/datas/master/{masterVersion}/{filename}")
  with open(os.path.join("_data", filename + ".json"), "wb") as f:
    f.write(data.encode())


def downloadProperties(masterVersion, filename):
  ensureDirs("zzz/")
  data = httpRequest(f"https://d1itvxfdul6wxg.cloudfront.net/datas/catalog/{filename}")
  with open(os.path.join("zzz", filename), "wb") as f:
    f.write(data.encode())

def main(argv):
  parser = argparse.ArgumentParser()
  parser.add_argument("-f", "--force_download", help="Force download (version)", type=int)
  parser.add_argument("--skip_data", help="Skip masterdata download", action="store_true")
  args = parser.parse_args(argv)

  if args.force_download:
    mV = args.force_download
  else:
    appV, mV = getVersion()
    cur_ver = int(getWikiVersion())
    if mV <= cur_ver:
      print("Already up to date")
      sys.exit(0)

  masterDataList = [
    'MasterDataCatalog',
    'CardProfileOverrideMaster',
    #'BattleModelCustomMaster',
    'SkillMaster',
    'SkillEffectMaster',
    'SkillUpgradeMaster',
    'SidekickMaster',
    'ItemMaster',
    'StatusMaster',
    'CardMaster',
    'EventMaster',
    'ShopMaster',
    'QuestMaster',
    'HeroCardExpMaster',
    'SidekickCardExpMaster',
    'UserRankMaster',
    "ParallelWeaponExpMaster",
    "ParallelWeaponFormMaster",
    'AffiliationOfficeMaster',
    'UnexploredSkillMaster',
    'CharacterStoryMaster',
    #'SerifMaster',
    'SerifOverwriteMaster',
    'SalesMaster',
  ]

  if not args.skip_data:
    print(f"Downloading masterdata ver {mV}")
    updateWikiVersion(mV)

    for m in masterDataList:
      downloadMasterdata(mV, m)

    processMasterDataCatalog()
    processShopFile()
    processCardProfileOverride()
    processSalesFile()

  prop_files = [
    "Japanese.json",
    "English.json",
    "ChineseTraditional.json",
    "ChineseSimplified.json",
  ]

  tl_suffixes = [
    "_bio.json",
    "_serif.json",
    "_profile.json",
    "_library.json",
    "_sales_report.json",
    "_score_attack.json",
  ]

  for p in prop_files:
    downloadProperties(mV, p)

  processPropertiesFile("Japanese.json", *[f"jp{s}" for s in tl_suffixes])
  processPropertiesFile("English.json", *[f"en{s}" for s in tl_suffixes])

if __name__ == '__main__':
  main(None)
