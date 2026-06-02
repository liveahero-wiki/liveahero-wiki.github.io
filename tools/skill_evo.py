import json
import os
import io

with open(os.path.join("_data", "SkillUpgradeMaster.json"), "r", encoding="utf-8") as f:
    SkillUpgradeMaster: dict = json.load(f)

roots = set(SkillUpgradeMaster.keys())

for skillId in SkillUpgradeMaster:
    S = SkillUpgradeMaster[skillId]
    children = S.get("nextEntryIds")
    if not children:
        continue

    C = []

    for child in children:
        childS = str(child)
        if childS in roots:
            roots.remove(childS)
        C.append(SkillUpgradeMaster[childS])

    S["children"] = C

def dfs(f: io.BufferedWriter, root: dict, tag=""):
    children = root.get("children", [])
    if len(children) == 0:
        f.write(f'{root["description"]}\n')
        return
    f.write(f'<details {tag}>\n<summary>{root["description"]}</summary>\n<div class="indent">')
    for child in children:
        dfs(f, child)
    f.write('\n</div></details>\n')

Result = {}

#with open("t.md", "w", encoding="utf-8") as f:
#    f.write("""---
#title: testing
#---
#
#<style>
#.indent {
#  padding-left: 20px;
#}
#</style>
#
#""")
#    for root in roots:
#
#        dfs(f, SkillUpgradeMaster[root])
#        f.write("<br><br><br>\n")

for root in roots:
    f = io.StringIO()
    dfs(f, SkillUpgradeMaster[root], 'class="skill-evo"')

    Result[SkillUpgradeMaster[root]["skillId"]] = f.getvalue()

with open(os.path.join("_data", "processed", "SkillUpgradeMaster.json"), "w", encoding="utf-8") as f:
    json.dump(Result, f, ensure_ascii=False)
