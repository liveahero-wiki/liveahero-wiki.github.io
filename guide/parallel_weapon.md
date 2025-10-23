---
title: Parallel Weapon Remodelling
banner: true
---

* this will be unordered
{:toc}

### Parallel Weapon Remodelling

After clearing Main Quest 1-3, episode 13, a new feature **Parallel Weapon Remodelling** will be available and can be accessed from the [Training](/guide/training/) menu.

Parallel Weapon Level (P.Lv) can be increased by consuming {% include item.html id=59 %}.

1300 {% include item.html id=59 %} is needed to reach the max P.Lv 100. See full consumption table [^bigtable].

Increasing P.Lv will enhance your hero's parameter linearly.

{% include item.html id=59 %} can be obtained from Event Shop and [Challenge Simulator](/guide/challenge_simulator/) Shop.

### Parallel Weapon Form

Aside from level, each parallel weapon has 4 different forms.

Parallel Weapon Form can be changed using Design Item.

A few points in regards to change form:

- Changing form is only possible after a minimum of level 1 parallel weapon.
- Changing form require one design item and override the previous form.
- In the parallel weapon interface, you can change the weapon form by clicking the blue "変更" (change) button.
- The level of parallel weapon will stay the same even after changing forms.

Each form will give different status enhancement according to parallel weapon's level, such as more ATK or HP:

- {% include item-icon.html id=60 %} Base Design

| Status           | Max Enhancement at P.Lv 100 |
|------------------|----------------------------|
| HP               | 1000                       |
| ATK              | 500                        |
| Damage Reduction | 250                        |


- {% include item-icon.html id=61 %} Attack Design

| Status           | Max Enhancement at P.Lv 100 |
|------------------|----------------------------|
| HP               | 750                        |
| ATK              | 750                        |
| Damage Reduction | 187                        |


- {% include item-icon.html id=62 %} Physical Design

| Status           | Max Enhancement at P.Lv 100 |
|------------------|----------------------------|
| HP               | 1500                       |
| ATK              | 375                        |
| Damage Reduction | 187                        |


- {% include item-icon.html id=63 %} Guard Design

| Status           | Max Enhancement at P.Lv 100 |
|------------------|----------------------------|
| HP               | 750                        |
| ATK              | 375                        |
| Damage Reduction | 375                        |

[^bigtable]:
    <table>
    <tr>
      <th>Level</th><th>{% include item-icon.html id=59 %} to lv up</th><th>Total {% include item-icon.html id=59 %}</th>
    </tr>
    {% for x in site.data.ParallelWeaponExpMaster %}
    <tr>
      <td>{{ x.level }}</td><td>{{ x.nextExp }}</td><td>{{ x.totalExp }}</td>
    </tr>
    {% endfor %}
    </table>
