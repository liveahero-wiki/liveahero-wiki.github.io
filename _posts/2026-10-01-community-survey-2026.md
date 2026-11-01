---
title: Community Survey Result 2026
date: 2026-11-01 12:00:00 +08
lang: en
draft: true
eleventyExcludeFromCollections: true
---
{%- comment -%}
  Charts, numbers and graphs are generated: run `uv run -m analysis.lah2026` in survey-platform.
  - include survey-chart.html id="..."   one chart, in this post's `lang`
  - f.some_key                           a number from _data/survey2026/facts.json
  - survey-platform/analysis/out/lah2026/digest.md has every figure behind the charts, to write from.
  The ja and zh-tw posts share all of this; only the prose differs.
  Before publishing: delete `draft` and `eleventyExcludeFromCollections` above.
{%- endcomment -%}
{% assign f = site.data.survey2026.facts %}

> この記事には日本語版があります。詳しくは[こちら](/blog/2026/community-survey-2026.jp/)をご覧ください。
>
> 本文有繁體中文版，請見[這裡](/blog/2026/community-survey-2026.zh-tw/)。

> This article is long and has many interactive charts. Hover or tap a chart for exact numbers.

* unordered
{:toc}

# Foreword

We received **{{ f.respondents }}** responses this year, compared with {{ f.respondents_prev }} last year.
I had been running this survey for the past few years, and this is the first time where the number of respondents
is less than the previous year, and by such a huge margin.

Nonetheless, I still want to thank everyone who took the time to fill up the survey. I know it is not an easy task, and I plan to cut down certain questions that are less valuable.

## Disclaimer on Limitation of the Survey

Once again, the demographics percentage of this year's respondents is very different from past few years, in that the percentage of China and Japanese respondents are a lot less than previous year.
This means that many "2025 vs 2026" comparsions do not really tell if there is a sentiment change for the same group of people, because the underlying group of respondents are quite different. Take the comparison with a pinch of salt.

# Respondent Profile

## Source of respondents

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

Discord and Reddit covered more than half of the respondent source, Reddit's number nearly doubled from the previous year!

Compared to 2025, the biggest loss were traffic from this wiki, Bahamut (Taiwan game forum), X/Twitter and Weibo (China). I didn't dare to post on Zawazawa again, so that is another zero. This leads to significant decrease in China, Japan (and to some extend, Taiwan) respondents this year.

## Age

{% include survey-chart.html id="age" %}

The median age is {{ f.age_median }}. There was one respondent from Philipines that claimed to be 6 years old.

{% include survey-chart.html id="age_female" %}

{% include survey-chart.html id="age_japan" %}

## Gender

{% include survey-chart.html id="gender" %}

{% include survey-chart.html id="gender2" %}

{{ f.non_male_pct }}% of the respondents are non-male ({{ f.non_male_pct_prev }}% last year) and {{ f.transgender_pct }}% are transgender.

{% include survey-chart.html id="gender_japan" %}

### Female, non-binary and other respondents and where to find them

{% include survey-chart.html id="non_male_country" %}

## Country

{% include survey-chart.html id="region" %}

{% include survey-chart.html id="yoy_region" %}

{% include survey-chart.html id="country" %}

Japan share fell from {{ f.yoy["2025"].japan_pct }}% to {{ f.yoy["2026"].japan_pct }}%.
China share fell from {{ f.yoy["2025"].china_pct }}% to {{ f.yoy["2026"].china_pct }}%.
Taiwan share fell from {{ f.yoy["2025"].taiwan_pct }}% to {{ f.yoy["2026"].taiwan_pct }}%.

## Japanese proficiency

{% include survey-chart.html id="jp" %}

# The Game

## Actual Player

{% include survey-chart.html id="play_lah" %}

## Platform

{% include survey-chart.html id="platform" %}

## Playing Time

{% include survey-chart.html id="tenure" %}

## Main Character Configuration

{% include survey-chart.html id="mc_body" %}

{% include survey-chart.html id="mc_voice" %}

## Money spending

{% include survey-chart.html id="paying" %}

More than half of the respondents at least spent money in-game once in the entire journye.

### Definition of Spending level

|Grade|Description|
|-|-|
|XL|Bought regular paid stones|
|L|Bought event limited stone pack (large)|
|M|Bought event limited stone pack (small)|
|S|Bought new year grab bag, anniversary hero selection pack or anniversary stone pack|
|XS|Bought only the 10 stones for the 4th sales slot or the web shop value pack|
|Zero|Never spent money|

{% include survey-chart.html id="yoy_paying" %}

Compared to 2025, the number of free players increases slightly.

Among paying players, XL (biggest spender) and S tier (only spent in new year/anniversary) have some decrease, while XS tier saw the biggest increase. It is likely that these people went to buy the new web shop value pack.

{% include survey-chart.html id="money_items" %}

It seems that the attractiveness of the new year grab bag and 5th anniversary hero selection pack have decreased since previous survey run.

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

East Asia have the biggest percentage of paying players, with Taiwan being the top in this survey. However, because this survey has very little Japanese respondents, so we can't be certain that the percentage is right for the actual Japan player population.

{% include survey-chart.html id="paying_by_gender" %}

### Where players pay

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

LW only started selling in-game items on web shop this year, a result of [Epic Games v. Google](https://en.wikipedia.org/wiki/Epic_Games_v._Google) lawsuit that forces app stores to allow game developers to accept payment outside of the app store, so that the game developers can pay less transaction fee.

{% include survey-chart.html id="physical_by_paying" %}

As expected, respondents that bought in-game items are more likely to also buy physical merchandises, but there are also some free players that buy physical merchandises.

## Gameplay Style

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

## High Difficulty Quest

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

46% of the players are able to complete 90~100% of the SS rank. The percentage drops to 34.2% for SSS rank.

{% include survey-chart.html id="hdq_by_paying" %}

Players who spent more money in this game have higher chance of being able to complete SS/SSS rank quests,
but there are also many paying players that struggle in these hard game content.

## Game Elements' Rating

{% include survey-chart.html id="ratings_presentation" %}

For a game whose main selling point is attractive characters, it is no surprise that majority of the respondents
gave a very high rating for character design and voice acting.

{% include survey-chart.html id="ratings_illustrator" %}

The respondents also gave very high rating for how LifeWonders handled change of illustrators, with only 1.3% of the respondents who voiced dissatisfaction in this question (rating = 1~2). I think this is a good news for the company and the playerbase, as that means a character do not need to suffer from reduced story appearance due to illustrator issues.

{% include survey-chart.html id="ratings_story" %}

{% include survey-chart.html id="ratings_gameplay" %}

{% include survey-chart.html id="ratings_bipolar" %}

{% include survey-chart.html id="ratings_community" %}

## Read Story

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

## Event Rating

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

## Other games

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="Ranked voting of games (global)" %}

## English Wiki

{% include survey-chart.html id="wiki_usage" %}

{% include survey-chart.html id="wiki_new_feature" %}

# Character popularity

Every ranking below can be filtered by country, region, age, gender and playing status, and compared with 2024 and 2025. Click a character for their history.

{% include survey-ranking.html query="survey=lah&y=2026" title="Character popularity explorer" %}

| Male furry | Approval | Male Human | Approval | Female/Other | Approval |
|-|-|-|-|-|-|
|{% chara_link Pubraseer %}| 65.3% |{% chara_link Akashi %}  | 37.7% |{% chara_link Melide %}   |23.3%|
|{% chara_link Barrel %}   | 59.1% |{% chara_link Astar %}   | 36.7%|{% chara_link Melide %}    |19.4%|
|{% chara_link Monomasa %} | 53.3% |{% chara_link Ruchbath %}| 35.5% |{% chara_link Sensettia %}|17.1%|
|{% chara_link Ryekie %}   | 51.4% |{% chara_link ⇌Akashi %}| 32.3% |{% chara_link Sui %}       |16.6%|
|{% chara_link Sterio %}   | 49.4% |{% chara_link Roudin %}  | 28.5% |{% chara_link Flamier% }  |15.4%|

{% include survey-chart.html id="top10_size" %}

## Ranked Voting System

<!-- TODO: carry over the Tideman explanation from 2025. -->

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_global.svg"
  title="Ranked Voting (global)" %}

### Ranking for Specific Demographics

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_united_states.svg"
  title="Ranked Voting (United States respondents only)" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_japan.svg"
  title="Ranked Voting (Japan respondents only)" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_taiwan.svg"
  title="Ranked Voting (Taiwan respondents only)" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_china.svg"
  title="Ranked Voting (China respondents only)" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_non_male.svg"
  title="Ranked Voting (non-male respondents only)" %}

## Mobs and Kaibutsu

New this year: {{ f.mob_answered }} respondents picked their favourite mob characters and {{ f.kaibutsu_answered }} their favourite kaibutsu.

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="Mob popularity explorer" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="Ranked Voting (mobs)" %}

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="Kaibutsu popularity explorer" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="Ranked Voting (kaibutsu)" %}

## Best CP

{{ f.best_cp_respondents }} respondents submitted {{ f.best_cp_pairs }} pairings.

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="Best CP (pairs chosen by at least two respondents)" %}

<!-- TODO: paste the "Best CP (paste-ready)" table from digest.md. -->

## Humanoid vs Anthro Bias

{% include survey-chart.html id="anthro_everyone" %}

{% include survey-chart.html id="anthro_japan" %}

{% include survey-chart.html id="anthro_non_male" %}

# Free form questions

<!-- TODO: summarise analysis/out/lah2026/free_text.md (stop reasons, feedback, improvement, wiki feedback). Quote nothing that identifies a respondent. -->

# Afterword

<!-- TODO -->

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
