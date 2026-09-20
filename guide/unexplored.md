---
title: Exploring the Unknown
banner: true
additional_scripts: ["/assets/filter.js"]
---

* this will be unordered
{:toc}

## Exploring the Unknown

- Player will challenge a roguelike game mode, with a boss fight at the end
- Consume 0 stamina with unlimited attempt
- 2 available modes: "Normal Mode," played at standard difficulty, and "Support Mode," where in exchange for earning lower scores per exploration compared to Normal Mode, enemies are weaker and allies receive additional buffs. Choose between Normal Mode and Support Mode when starting an exploration.
- Scores are calculated every time you play, the further you are the more scores are given
- Rewards are given based on cumulative score
- Exploration has its own map, which will be changed every attempt
- Player choose the path they will advance to, available paths are indicated by blue lines while red lines indicate path already taken
- Every node in path has different enemy depending on its symbol, winning the battle will advance the path
- 3 Exploration skills are available for choosing every time you win a battle, you can only choose one, list of exploration skills available below
- You can have a maximum of 7 skills every exploration 

## Exploration skills

{% assign skills = "" | split: "," %}
{% for pair in site.data.UnexploredSkillMaster %}
{% assign skills = skills | push: pair[1] %}
{% endfor %}

### Available skill tags

<details>
    <summary>{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_SKILL1_SUBJECT }}</summary>
    <div markdown="1">{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_SKILL1_BODY }}
    </div>
</details>
<details>
    <summary>{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_ROOKIE_SUBJECT }}</summary>
    <div markdown="1">{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_ROOKIE_BODY }}
    </div>
</details>
<details>
    <summary>{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_HAISUI_SUBJECT }}</summary>
    <div markdown="1">{{ site.data.wiki.UITranslation.UI_SUPPORT_SKILL_TAG_HAISUI_BODY }}
    </div>
</details>

<fieldset class="chara-filter" data-list="#unexplored-list">
    <legend>Filter</legend>
    <div class="control-panel">
        <div>Tag</div>
        <div> |
            <button data-field="tag" data-value="SKILL1">Skill 1</button>
            <button data-field="tag" data-value="ROOKIE">Rookie</button>
            <button data-field="tag" data-value="HAISUI">Desperation</button>
            <button data-field="tag" data-value="">None</button>
            | <button data-reset="tag">All</button>
        </div>
    </div>
</fieldset>

<div class="table-scroll">
<table id="unexplored-list" class="sort-table">
    <thead>
    <tr>
        <th data-type="string">Skill Name</th><th>Rarity</th><th data-type="string">Effect/Proc rate</th><th data-type="string">Tag</th>
    </tr>
    </thead>
    <tbody>
    {% for s in skills %}
    {% assign nid = s.baseSkillId | plus: 0 %}
    {% assign sid = s.baseSkillId | downcase %}
    {% assign skill = site.data.SkillMaster[sid] %}
    {% if skill.skillName == "" %}{% continue %}{% endif %}
    {% assign skillName = site.data.translation.Skill[sid].skillName %}
    {% assign tagKey = "" %}
    {% assign tagSubject = "" %}
    {% assign tagBody = "" %}
    {% if s.hintEntry %}
    {% assign tagKey = s.hintEntry.hintSubject | remove: "UI_SUPPORT_SKILL_TAG_" | remove: "_SUBJECT" %}
    {% assign tagSubject = site.data.wiki.UITranslation[s.hintEntry.hintSubject] | default: s.hintEntry.hintSubject %}
    {% endif %}
    <tr data-tag="{{ tagKey }}">
        <td title="{{ sid }}" class="translate skill-{{ s.rarity }}" data-translate="{% if skillName %}{{ skill.skillName }}{% endif %}" data-effects="{{ skill.effects | map: 'skillEffectId' | join: ',' }}">{{ skillName | default: skill.skillName }}</td>
        <td>{{ s.rarity }}</td>
        <td class="translate">{% include skill-description.html skillId=nid skill=skill %}</td>
        <td>{{ tagSubject }}</td>
    </tr>
    {% endfor %}
    </tbody>
</table>
</div>
