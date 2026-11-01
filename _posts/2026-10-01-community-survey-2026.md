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

<!-- TODO: thanks, what changed in the survey this year (mobs, kaibutsu, best CP, wiki questions, zh-tw report). -->

## Disclaimer on Limitation of the Survey

<!-- TODO: carry over from 2025, update numbers. -->

# Respondent Profile

## Source of respondents

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

<!-- TODO -->

## Age

{% include survey-chart.html id="age" %}

The median age is {{ f.age_median }}.

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

<!-- TODO: Japan share fell from {{ f.yoy["2025"].japan_pct }}% to {{ f.yoy["2026"].japan_pct }}%. -->

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

{% include survey-chart.html id="money_items" %}

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

{% include survey-chart.html id="paying_by_gender" %}

### Where players pay

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

{% include survey-chart.html id="physical_by_paying" %}

## Gameplay Style

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

## High Difficulty Quest

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

{% include survey-chart.html id="hdq_by_paying" %}

## Game Elements' Rating

{% include survey-chart.html id="ratings_presentation" %}

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

<!-- TODO: insights by segment and year over year, from digest.md ("Segment ..." and "biggest approval changes"). Link each one to its explorer view. -->

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
