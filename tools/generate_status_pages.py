import json
import os
import re
import io

# Setup paths
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '_data')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', '_statuses')

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def to_dict(master, key):
    if isinstance(master, list):
        return {str(item[key]): item for item in master}
    elif isinstance(master, dict):
        return {str(k): v for k, v in master.items()}
    return master

def extract_status_ids_from_skill(skill_id, skill_master, skill_effect_master):
    skill = skill_master.get(str(skill_id))
    if not skill:
        return set()

    status_ids = set()
    for effect_info in skill.get('effects', []):
        effect_id = str(effect_info.get('skillEffectId'))
        skill_effect = skill_effect_master.get(effect_id)
        if skill_effect:
            skill_effect_json = skill_effect.get('skillEffectJson', {})
            status_id = skill_effect_json.get('statusId', 0)
            if status_id != 0:
                status_ids.add(status_id)
    return status_ids

def main():
    # Load masters
    card_master = load_json('CardMaster.json')
    sidekick_master = load_json('SidekickMaster.json')
    skill_master = load_json('SkillMaster.json')
    skill_effect_master = load_json('SkillEffectMaster.json')
    status_master = load_json('StatusMaster.json')
    
    status_tl_path = os.path.join(DATA_DIR, 'translation', 'Status.json')
    with open(status_tl_path, 'r', encoding='utf-8') as f:
        status_tl = json.load(f)

    # Convert to dicts for fast lookup
    skill_master_dict = to_dict(skill_master, 'skillId')
    skill_effect_master_dict = to_dict(skill_effect_master, 'skillEffectId')
    status_master_dict = to_dict(status_master, 'statusId')

    # 1. Collect Heroes and Sidekicks, keep highest rarity/level per stockId
    heroes_by_stock = {}
    for card in (card_master if isinstance(card_master, list) else card_master.values()):
        stock_id = str(card.get('stockId', 0))
        if stock_id == '0':
            continue
        rarity = card.get('rarity', 0)
        if stock_id not in heroes_by_stock or rarity > heroes_by_stock[stock_id].get('rarity', 0):
            heroes_by_stock[stock_id] = card

    sidekicks_by_stock = {}
    for sk in (sidekick_master if isinstance(sidekick_master, list) else sidekick_master.values()):
        stock_id = str(sk.get('stockId', 0))
        if stock_id == '0':
            continue
        
        growths = sk.get('growths', [])
        level = growths[-1].get('level', 0) if growths else 0
        sk['_calculated_level'] = level

        if stock_id not in sidekicks_by_stock or level > sidekicks_by_stock[stock_id].get('_calculated_level', 0):
            sidekicks_by_stock[stock_id] = sk

    # 2. Extract skills and their statuses
    # Data structure: status_id -> 'hero' | 'sidekick_active' | 'sidekick_passive' -> list of {stockId, skillId}
    status_to_skills = {}

    def add_to_status(status_id, category, stock_id, skill_id):
        if status_id == 0: return
        sid = str(status_id)
        if sid not in status_to_skills:
            status_to_skills[sid] = {'hero': [], 'sidekick_active': [], 'sidekick_passive': []}
        
        # Check for duplicates before adding
        for item in status_to_skills[sid][category]:
            if item['stockId'] == stock_id and item['skillId'] == skill_id:
                return
        
        status_to_skills[sid][category].append({'stockId': stock_id, 'skillId': skill_id})

    # For Heroes: active skills (skillIds) + passive skills (passiveSkillIds) [though they typically don't apply statuses but might]
    for stock_id, hero in heroes_by_stock.items():
        # Active skills
        for skill_id in hero.get('skillIds', []):
            if skill_id == 0: continue
            status_ids = extract_status_ids_from_skill(skill_id, skill_master_dict, skill_effect_master_dict)
            for sid in status_ids:
                add_to_status(sid, 'hero', stock_id, skill_id)

    # For Sidekicks: active skills (skillIds) + passive skills (equipmentSkills)
    for stock_id, sk in sidekicks_by_stock.items():
        # Active skills
        for skill_id in sk.get('skillIds', []):
            if skill_id == 0: continue
            status_ids = extract_status_ids_from_skill(skill_id, skill_master_dict, skill_effect_master_dict)
            for sid in status_ids:
                add_to_status(sid, 'sidekick_active', stock_id, skill_id)
        
        # Passive skills
        for skill_id in sk.get('equipmentSkills', []):
            if skill_id == 0: continue
            status_ids = extract_status_ids_from_skill(skill_id, skill_master_dict, skill_effect_master_dict)
            for sid in status_ids:
                add_to_status(sid, 'sidekick_passive', stock_id, skill_id)


    # 3. Generate Markdown files
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for status_id, categories in status_to_skills.items():
        # Clean status_id
        status_id_str = str(status_id)
        
        # Find translated name or fallback to JP
        en_name = ""
        jp_name = ""
        
        if status_id_str in status_tl:
            en_name = status_tl[status_id_str].get('name', '')
            
        if status_id_str in status_master_dict:
            jp_name = status_master_dict[status_id_str].get('statusName', '')
            
        title = en_name if en_name else jp_name
        if not title:
             title = f"Status {status_id_str}" # Fallback
             
        # Escape quotes in title
        title_escaped = title.replace('"', '\\"')
        writer = io.StringIO()
        writer.write(f"""---
title: "{title_escaped}"
status_id: {status_id_str}
---

""")
        
        def render_category(cat_name, cat_list, chara_type_num, writer: io.BufferedWriter):
            if not cat_list: return
            writer.write(f"## {cat_name}\n\n")
            writer.write("<table>\n")
            for item in cat_list:
                stock_id = item['stockId']
                skill_id = item['skillId']
                writer.write("<tr>\n")

                writer.write("<td>\n")
                writer.write(f"{{{{ {stock_id} | stockIdToLink: {chara_type_num} }}}}")
                writer.write("</td>\n")

                writer.write("<td>\n")
                writer.write(f"{{% assign skill = site.data.SkillMaster[\"{skill_id}\"] %}}\n")
                writer.write(f"{{% include skill-description.html skillId={skill_id} skill=skill %}}\n")
                writer.write("</td>\n")

                writer.write("</tr>\n")
            writer.write("</table>")

        render_category("Hero Skills", categories['hero'], 1, writer)
        render_category("Sidekick Active Skills", categories['sidekick_active'], 2, writer)
        render_category("Sidekick Passive Skills", categories['sidekick_passive'], 2, writer)
        
        file_path = os.path.join(OUTPUT_DIR, f"{status_id_str}.md")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(writer.getvalue())

    print(f"Generated {len(status_to_skills)} status pages in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
