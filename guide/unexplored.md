---
title: Exploring the Unknown
banner: true
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

<div class="table-scroll">
<table class="sort-table">
    <tr>
        <th data-type="string">Skill Name</th><th>Rarity</th><th data-type="string">Effect/Proc rate</th>
    </tr>
    {% for s in skills %}
    {% assign nid = s.baseSkillId | plus: 0 %}
    {% assign sid = s.baseSkillId | downcase %}
    {% assign skill = site.data.SkillMaster[sid] %}
    {% if skill.skillName == "" %}{% continue %}{% endif %}
    {% assign skillName = site.data.translation.Skill[sid].skillName %}
    <tr>
        <td title="{{ sid }}" class="translate skill-{{ s.rarity }}" data-translate="{% if skillName %}{{ skill.skillName }}{% endif %}" data-effects="{{ skill.effects | map: 'skillEffectId' | join: ',' }}">{{ skillName | default: skill.skillName }}</td>
        <td>{{ s.rarity }}</td>
        <td class="translate">{% include skill-description.html skillId=nid skill=skill %}</td>
    </tr>
    {% endfor %}
</table>
</div>
