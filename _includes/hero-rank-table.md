{% assign rankTable = site.data.HeroCardExpMaster %}
<table>
<tr>
  <th>Level</th><th>XP to lv up</th><th>Total XP</th>
</tr>
{% for level in rankTable %}
<tr>
  <td>{{ level.level }}</td><td>{{ level.nextExp }}</td><td>{{ level.totalExp }}</td>
</tr>
{% endfor %}
</table>
