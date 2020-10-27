import urllib.request
import os.path
import json
import sys

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
  appV, mV = getVersion()

  cur_ver = int(getWikiVersion())
  if mV <= cur_ver:
    print("Already up to date")
    sys.exit(0)

  print(f"Downloading masterdata ver {mV}")
  updateWikiVersion(mV)

  masterDataList = [
    'SkillMaster',
    'SkillEffectMaster',
    'SidekickMaster',
    'ItemMaster',
    'StatusMaster',
    'CardMaster',
    'ShopMaster',
    'QuestMaster',
  ]
  for m in masterDataList:
    downloadMasterdata(mV, m)
