---
title: Main Quests
banner: true
---

## Overview

Main quests are quests that tell the main story of *Live A Hero*, surrounding {% chara_link Player %}.

<table>
<tr><th>Chapter</th><th>Title</th></tr>
{% for chapter in site.main_quests %}
<tr><td>{{ chapter.chapterId | minus: 100 }}</td><td><a href="{{ chapter.url }}">{{ chapter.title }}</a></td></tr>
{% endfor %}
</table>
