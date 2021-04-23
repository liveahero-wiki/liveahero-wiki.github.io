---
title: Parallel Weapon Remodelling
banner: true
---

* this will be unordered
{:toc}

### Parallel Weapon Remodelling

After clearing Main quest chapter 3 episode 13, A new feature Parallel Weapon Remodelling will be available and can be accessed from the training menu.

Parallel weapon has level, and to increase this level {% include item-icon.html id=59 %} Parallel Quartz is needed.

The maximum level is 100, and increasing parallel weapon's level will enhance your hero's parameter.

{% include item-icon.html id=59 %} Parallel Quartz can be obtained from event as of now.

#### Parallel Weapon Form

Aside from level, Each parallel weapon will have multiple forms.

This form can be changed using item design from events such as:

- {% include item-icon.html id=60 %} Base Design
- {% include item-icon.html id=61 %} Attack Design
- {% include item-icon.html id=62 %} Physical Design
- {% include item-icon.html id=63 %} Guard Design

Each form will give different status enhancement according to parallel weapon's level, such as more ATK or HP.

The level of parallel weapon will stay the same even after changing forms.

> as of now there is a bug where the change form function can't be used, there will be further notice when it's fixed

### Parallel Weapon Level Table


See full EXP table [^bigtable].

[^bigtable]:
    <table>
    <tr>
      <th>Level</th><th>XP to lv up</th><th>Total XP</th>
    </tr>
    {% for x in site.data.ParallelWeaponExpMaster %}
    <tr>
      <td>{{ x.level }}</td><td>{{ x.nextExp }}</td><td>{{ x.totalExp }}</td>
    </tr>
    {% endfor %}
    </table>
