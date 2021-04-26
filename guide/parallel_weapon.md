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

Parameter enhancement grows linearly with Parallel weapon's level.

{% include item-icon.html id=59 %} Parallel Quartz can only be obtained from events as of now.

### Parallel Weapon Form

Aside from level, Each parallel weapon will have a set of 4 forms.

This form can be changed using item design from events.

Each form will give different status enhancement according to parallel weapon's level, such as more ATK or HP:

- {% include item-icon.html id=60 %} Base Design

| Status           | Max Enhancement at PLv 100 |
|------------------|----------------------------|
| HP               | 1000                       |
| ATK              | 500                        |
| Damage Reduction | 250                        |


- {% include item-icon.html id=61 %} Attack Design

| Status           | Max Enhancement at PLv 100 |
|------------------|----------------------------|
| HP               | 750                        |
| ATK              | 750                        |
| Damage Reduction | 187                        |


- {% include item-icon.html id=62 %} Physical Design

| Status           | Max Enhancement at PLv 100 |
|------------------|----------------------------|
| HP               | 1500                       |
| ATK              | 375                        |
| Damage Reduction | 187                        |


- {% include item-icon.html id=63 %} Guard Design

| Status           | Max Enhancement at PLv 100 |
|------------------|----------------------------|
| HP               | 750                        |
| ATK              | 375                        |
| Damage Reduction | 375                        |


The level of parallel weapon will stay the same even after changing forms.

### Parallel Weapon Level Table

Here is the full exp table to level parallel weapon:

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
