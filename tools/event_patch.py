import os
import json

with open("_data/EventMaster.json", "r", encoding="utf-8") as f:
    EventMaster: dict = json.load(f)

event_pairs = []

for eventId in EventMaster:
    E = EventMaster[eventId]
    if len(E["baseResourceName"]) == 0:
        continue
    event_pairs.append((E["eventId"], E["baseResourceName"]))

import re
import yaml
from shlex import split as ssplit
from textwrap import TextWrapper

DETECT_YAML = re.compile(r"---(.*?)---", re.MULTILINE | re.DOTALL)
DETECT_TAG = re.compile(r"\{\%(.*?)\%\}", re.MULTILINE | re.DOTALL)
DETECT_NL2 = re.compile(r"\n{2,}", re.MULTILINE)

def str_presenter(dumper, data):
  return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')

class Bio(str):
    pass

def main():
  os.makedirs("_temp", exist_ok=True)
  yaml.add_representer(Bio, str_presenter)
  yaml.representer.SafeRepresenter.add_representer(Bio, str_presenter)

  wrapper = TextWrapper(width=80)

  files = next(os.walk("_events"))[2]

  for file in files:
    with open(os.path.join("_events", file), "r", encoding="utf-8") as f:
        text = f.read()
    m = DETECT_YAML.match(text)
    front_matter_text = m.group(1)
    front_matter: dict = yaml.safe_load(front_matter_text)

    banner_image = front_matter["banner_image"]
    for eventId, baseResourceName in event_pairs:
        if banner_image.endswith(baseResourceName + ".jpg"):
            ss = front_matter_text.split("\n")
            ss.insert(2, f"eventId: {eventId}")
            front_matter_text = "\n".join(ss)
            front_matter["eventId"] = eventId
            break

    if "eventId" not in front_matter:
        print(f"Event ID not found for _events/{file}")
        continue

    after_front_matter = text.split("---\n\n", 1)[1]

    VAR = {}
    last_tag = ""
    prev_match = None
    voices = []

    for m in DETECT_TAG.finditer(text):
        #print(m)
        tag = m.group(1).strip()
        if tag.startswith("include"):
            comp = ssplit(tag)
            isHero = "hero-infobox.html" in tag
            isSk = "sidekick-infobox.html" in tag

    with open(os.path.join("_events", file), "w", encoding="utf-8", newline="\n") as f:
        f.write("---")
        f.write(front_matter_text)
        #yaml.safe_dump(front_matter, f, sort_keys=False, allow_unicode=True)
        f.write("---\n\n")
        f.write(after_front_matter)
        #if len(voices) > 0:
        #    f.write("\n\n".join("{{% {}\n%}}".format(v) for v in voices))
        #    f.write("\n\n")
        #f.write(text[prev_match.end(0):].strip("\n "))
        #if not front_matter.get("unreleased"):
        #    f.write("\n")

main()