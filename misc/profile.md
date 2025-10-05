---
title: Character Profile List
banner: true
wide_content: true
---

<p>This is a list of character with official profile info fromm Hero-encyclopedia</p>

{% assign charas = site.charas | where_exp: "item", "item.profile != null" %}

<div class="table-scroll">
<table class="sort-table bordered">
<tr><th data-type="string">Name</th><th>Height (cm)</th><th>Weight (kg)</th><th>Age</th><th data-type="string">Birthday</th><th data-type="string">Birthplace</th></tr>
{% for chara in charas %}
<tr>
<td><a class="item" href="{{ chara.url }}"><img src="{{ chara | charaPageToIcon }}"  width="32" height="32" loading="lazy"> {{ chara.title }}</a></td>
<td>{{ chara.profile.height }}</td>
<td>{{ chara.profile.weight }}</td>
<td>{{ chara.profile.age }}</td>
<td>{{ chara.profile.birthday }}</td>
<td>{{ chara.profile.birthplace }}</td>
</tr>
{% endfor %}
</table>
</div>
