import sys
import os
import re
import yaml
from shlex import split as ssplit
from textwrap import TextWrapper

DETECT_YAML = re.compile("---(.*?)---", re.MULTILINE | re.DOTALL)
DETECT_TAG = re.compile("\{\%(.*?)\%\}", re.MULTILINE | re.DOTALL)
DETECT_NL2 = re.compile("\n{2,}", re.MULTILINE)

def str_presenter(dumper, data):
  return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')

class Bio(str):
    pass

def main():
  os.makedirs("_temp", exist_ok=True)
  yaml.add_representer(Bio, str_presenter)
  yaml.representer.SafeRepresenter.add_representer(Bio, str_presenter)

  wrapper = TextWrapper(width=80)

  files = next(os.walk("_charas"))[2]

  for file in files:
    with open(os.path.join("_charas", file), "r", encoding="utf-8") as f:
        text = f.read()
    m = DETECT_YAML.match(text)
    front_matter: dict = yaml.safe_load(m.group(1))

    VAR = {}
    last_tag = ""
    prev_match = None
    voices = []

    for m in DETECT_TAG.finditer(text):
        #print(m)
        tag = m.group(1).strip()
        if tag.startswith("capture"):
            last_tag = tag.split(" ")[1]
        elif tag.startswith("endcapture"):
            bio = text[prev_match.end(0):m.start(0)].strip()
            para = DETECT_NL2.split(bio)

            bio = "\n\n".join("\n".join(wrapper.wrap(p)) for p in para)
            VAR[last_tag] = Bio(bio)
        elif tag.startswith("include"):
            comp = ssplit(tag)
            isHero = "hero-infobox.html" in tag
            isSk = "sidekick-infobox.html" in tag


            if isHero or isSk:
                card = {}

                for c in comp[2:]:
                    name, value = c.split("=")
                    if name == "stockId":
                        value = int(value)
                    if name in VAR:
                        value = VAR[name]
                    card[name] = value

                if isHero:
                    front_matter.setdefault("heroes", []).append(card)
                elif isSk:
                    front_matter.setdefault("sidekicks", []).append(card)
            elif "voice-table.html" == comp[1]:
                voices.append(tag)
            elif "hero-infobox-unreleased.html" == comp[1]:
                front_matter["sprites"] = comp[2].split("=")[1]
        else:
            continue

        prev_match = m

    with open(os.path.join("_temp", file), "w", encoding="utf-8", newline="\n") as f:
        f.write("---\n")
        yaml.safe_dump(front_matter, f, sort_keys=False, allow_unicode=True)
        f.write("---\n\n")
        for v in voices:
            f.write("{{% {}\n%}}\n".format(v))
        f.write("\n")
        f.write(text[prev_match.end(0):].strip("\n "))
        f.write("\n")

    #break

main()
