import os
import re
import yaml
import json

from wiki_util import dumpJson

CHAR_SUB = re.compile("{(\\d+)}", re.DOTALL)
DETECT_YAML = re.compile(r"---(.*?)---", re.MULTILINE | re.DOTALL)
DETECT_SALES_REPORT = re.compile(r"<details><summary>(.*?)</summary>(.*?)</details>", re.DOTALL)

def str_presenter(dumper, data):
  return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')

class Bio(str):
    pass

def processOneReport(key, value):
  value = re.sub(CHAR_SUB, "<code>character\\1</code>", value)

  return f"""<details><summary>{key}</summary>
<p>{value}</p></details>
"""

def main():
  with open("sales_report.txt", "w", encoding="utf-8") as w:
    with open("_data/processed/Japanese.properties", "r") as f:
      for l in f:
        key, value = l.split("=", 1)
        if key.startswith("SALES_REPORT_") or key.startswith("SALES_EVENT_"):
          w.write(processOneReport(key, value))
          w.write("\n")

def extractSalesReport():
  yaml.add_representer(Bio, str_presenter)
  yaml.representer.SafeRepresenter.add_representer(Bio, str_presenter)

  files = next(os.walk("_events"))[2]

  with open("_data/processed/sales_report_master.json", "r", encoding="utf-8") as f:
    sales_report_master: dict = json.load(f)

  with open("_data/EventMaster.json", "r", encoding="utf-8") as f:
    EventMaster: dict = json.load(f)

  data = {}

  for file in files:
    with open(os.path.join("_events", file), "r", encoding="utf-8") as f:
      text = f.read()

    m = DETECT_YAML.match(text)
    front_matter: dict = yaml.safe_load(m.group(1))

    eventId = front_matter.get("eventId")
    if not eventId:
      continue

    eventPortalJson = EventMaster[str(eventId)].get("eventPortalJson", {})
    if not eventPortalJson:
      continue

    regionIds = eventPortalJson.get("salesRegionIds", [])
    if len(regionIds) == 0:
      continue
    regionId = regionIds[0]

    reports = list(filter(lambda x: x.startswith("SALES_EVENT_"), sales_report_master.get(str(regionId), [])))
    i = 0

    found = False
    for m in DETECT_SALES_REPORT.findall(text):
      title = m[0]
      content = m[1]

      if title.endswith("(Translated)"):
        found = True
        title = reports[i]
        i += 1
        data[title] = Bio(content.strip())
        
    if found:
      print(f"Translation found in _events/{file}")

  dumpJson("_data/wiki/SalesReport.json", data, indent='\t', sort_keys=True)

if __name__ == '__main__':
  #main()
  extractSalesReport()
