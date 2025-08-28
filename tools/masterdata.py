import urllib.request
import os.path
import json
import sys

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
  data = httpRequest(f"https://d1itvxfdul6wxg.cloudfront.net/datas/catalog/{filename}")
  with open(os.path.join("_data", "processed", filename), "wb") as f:
    f.write(data.encode())

if __name__ == '__main__':
  force_download = False
  if len(sys.argv) > 1:
    mV = int(sys.argv[1])
    force_download = True
  else:
    appV, mV = getVersion()

  cur_ver = int(getWikiVersion())
  if not force_download and mV <= cur_ver:
    print("Already up to date")
    sys.exit(0)

  print(f"Downloading masterdata ver {mV}")
  updateWikiVersion(mV)

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
    #'EventMaster',
    'ShopMaster',
    'QuestMaster',
    'HeroCardExpMaster',
    'SidekickCardExpMaster',
    'UserRankMaster',
    "ParallelWeaponExpMaster",
    "ParallelWeaponFormMaster",
    'AffiliationOfficeMaster',
    'UnexploredSkillMaster',
    #'SerifMaster',
    'SerifOverwriteMaster',
  ]
  for m in masterDataList:
    downloadMasterdata(mV, m)

  processMasterDataCatalog()
  processShopFile()
  processCardProfileOverride()

  prop_files = [
    "Japanese.properties",
    "English.properties",
    "ChineseTraditional.properties",
    "ChineseSimplified.properties",
  ]

  for p in prop_files:
    downloadProperties(mV, p)
  processPropertiesFile("Japanese.properties", "jp_bio.json", "jp_serif.json", "jp_profile.json", "jp_library.json")
