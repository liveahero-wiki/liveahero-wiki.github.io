---
title: Unexplored
banner: true
---

* this will be unordered
{:toc}

## Unexplored skills

{% assign skills = "" | split: "," %}
{% for pair in site.data.UnexploredSkillMaster %}
{% assign skills = skills | push: pair[1] %}
{% endfor %}

<div class="table-scroll">
<table>
    <tr>
        <th>Skill Name</th><th>Rarity</th><th>Effect/Proc rate</th>
    </tr>
    {% for s in skills %}
    {% assign nid = s.baseSkillId | plus: 0 %}
    {% assign sid = s.baseSkillId | downcase %}
    {% assign skill = site.data.SkillMaster[sid] %}
    {% assign skillName = site.data.wiki.SkillNameTranslation[nid] %}
    <tr>
        <td title="{{ sid }}" class="translate" data-translate="{% if skillName %}{{ skill.skillName }}{% endif %}" data-effects="{{ skill.effects | map: 'skillEffectId' | join: ',' }}">{{ skillName | default: skill.skillName }}</td>
        <td>{{ s.rarity }}</td>
        <td title="{{ skill.description }}">{% include skill-description.html skillId=nid skill=skill %}</td>
    </tr>
    {% endfor %}
</table>
</div>
