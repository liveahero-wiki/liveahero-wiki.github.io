---
title: Parallel Weapon Remodelling
banner: true
---

* this will be unordered
{:toc}

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
