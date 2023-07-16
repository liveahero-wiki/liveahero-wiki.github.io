---
title: Unexplored
banner: true
---

* this will be unordered
{:toc}

## Unexplored Exploration

- Player will challenge a roguelike game mode, with a boss fight at the end
- Consume 0 stamina with unlimited attempt
- Scores are calculated every time you play, the further you are the more scores are given
- Rewards are given based on cumulative score
- Exploration has its own map, which will be changed every attempt
- Player choose the path they will advance to, available paths are indicated by blue lines while red lines indicate path already taken
- Every node in path has different enemy depending on its symbol, winning the battle will advance the path
- 3 Unexplored skills are available for choosing every time you win a battle, you can only choose one, list of unexplored skills available below
- You can have a maximum of 7 skills every exploration 

## Unexplored skills

{% assign skills = "" | split: "," %}
{% for pair in site.data.UnexploredSkillMaster %}
{% assign skills = skills | push: pair[1] %}
{% endfor %}

> Help translate this page by filling [`SkillManualOverride.yml`](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/SkillManualOverride.yml). Skill Id can be obtained by mouse-over the skill name.

<div class="table-scroll">
<table class="sort-table">
    <tr>
        <th data-type="string">Skill Name</th><th>Rarity</th><th data-type="string">Effect/Proc rate</th>
    </tr>
    {% for s in skills %}
    {% assign nid = s.baseSkillId | plus: 0 %}
    {% assign sid = s.baseSkillId | downcase %}
    {% assign skill = site.data.SkillMaster[sid] %}
    {% assign skillName = site.data.wiki.SkillNameTranslation[nid] %}
    {% assign skillOverride = site.data.wiki.SkillManualOverride[sid] %}
    {% capture autoSkillDesc %}{% include skill-description.html skillId=nid skill=skill %}{% endcapture %}
    <tr>
        <td title="{{ sid }}" class="translate" data-translate="{% if skillName %}{{ skill.skillName }}{% endif %}" data-effects="{{ skill.effects | map: 'skillEffectId' | join: ',' }}">{{ skillName | default: skill.skillName }}</td>
        <td>{{ s.rarity }}</td>
        <td class="translate" data-translate="{{ autoSkillDesc | xml_escape }}">{{ skillOverride | default: skill.description }}</td>
    </tr>
    {% endfor %}
</table>
</div>
