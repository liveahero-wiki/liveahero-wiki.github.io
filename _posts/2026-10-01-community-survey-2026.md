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

{% include survey-chart.html id="country_map" %}

{% include survey-chart.html id="country" %}

Between 2025 and 2026 survey:

- Japan share fell from {{ f.yoy["2025"].japan_pct }}% to {{ f.yoy["2026"].japan_pct }}%.
- China share fell from {{ f.yoy["2025"].china_pct }}% to {{ f.yoy["2026"].china_pct }}%.
- Taiwan share fell from {{ f.yoy["2025"].taiwan_pct }}% to {{ f.yoy["2026"].taiwan_pct }}%.

## Japanese proficiency

{% include survey-chart.html id="jp" %}

If we assume that you need at least N3 level to be able to read Live A Hero story in Japanese comfortably, then only 14.9% of the respondents can do so.
If we exclude the Japan players ({{ f.jp_n1_japan }}), the percentage drops to 11.2%.

# The Game

## Actual Player

{% include survey-chart.html id="play_lah" %}

## Stop Reason (21 answers)

- No English translation at the time when they gave up
- Lost interest/motivation
- Battle system is too complicated / unfamiliar with game mechanics
- Quit becasue respondent cannot pull the character they want
- Too little (free) pull currency
- Respondent also play other gacha games, no time to keep Live A Hero

## Platform

{% include survey-chart.html id="platform" %}

{% include survey-graph.html path="/assets/img/survey-2026/platform_venn.en.svg" title="Platform overlap" %}

{{ f.platform_multi }} respondents ({{ f.platform_multi_pct }}%) use more than one platform. Each number in the diagram is the respondents who chose exactly that combination; the regions are all the same size, so it is not drawn to scale.

12 respondents (3%) play exclusively via Android emulators on PC, but no one plays exclusively on "Google Play Games on PC"

## Playing Time

{% include survey-chart.html id="tenure" %}

- We have close a quarter of the respondents that started playing this game near the game launch date.
- The player growth was slow until there was a spike near [3rd anniversary](/events/23093rdAnniversary/), which was the time when LifeWonders announced they "planned" to release official translation.
- The player growth reaccelerated in the past 12 months (mostly oversea players). This is also the year where official translation was finally released.

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

> We know that East-Asia has the highest percentage of paying players for this game, but this player segment also decreased the most in this year's survey, so take that into the consideration.

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

Despite the demographics of the survey respondents changes every year and LifeWonders may have added more game features, the overall shape of these charts still remain pretty much the same across many years. The game seem to have cemented the type of players it can attract.

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

In general, the respondents gave a pretty high score for the story aspect of the game.

{% include survey-chart.html id="ratings_gameplay" %}

- Nearly 3/4 of the respondents are positive about the gameplay design
- Nearly half of the respondents think that other gacha games have better gacha system than this game

{% include survey-chart.html id="ratings_bipolar" %}

- Nearly half of the respondents think the current pace of new content release is optimal, while rest of the respondents lean more towards wanting a more frequent new content release

{% include survey-chart.html id="ratings_community" %}

- More than half of the respondents give positive score for the quality of official translation
- Even higher percentage of the respondents are dissatisfied with the release schedule of the official translation

## Read Story

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

> Note: This question allowed multiple answers

- Respondents with Japanese reading ability ranging N1~N3 level naturally are more likely to read the game story directly in-game, but nearly 30% of them also rely on official/fan/machine translation
- 57.1% of the respondents have Japanese reading ability below N3 level
  - 42.4% rely on fan translation while 28.8% rely on machine translation
  - More than half of them do read official translated game story (including those that may have read fan/machine translation years ago)
- 11% of the respondents play the game to collect characters without reading the game story in any form

## Event Rating

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

- [Summer Montage Halation](/events/2607Montage/) has the highest average event score (4.34)
- In general, respondents with Japanese reading ability > N3 level tend to give higher score than those with lower Japanese reading ability
  - The only excepption is [Summer Montage Halation](/events/2607Montage/)

## Other games

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="Ranked voting of games (global)" %}

I don't want to repeat too much from my last year commentary, you can read it [here](/blog/2025/community-survey-2025/#other-games).

- **Gyee**:
  - Last year, more than a third of Japan respondents had never heard of this game. But since I added the Japanese name of the game in the survey this year, the percentage dropped to 7.1%
- **Another Eidoes of Dragonvein** vs **XXL Woofia**:
  - Japan respondents tend to rank this game higher than XXL Woofia, while the opposite is true for the rest of the respondents.
  - Both games have simultaneous official translation release. Existence of such popularity gap between region despite no language barrier is quite interesting.
- **Tamacolle**
  - Surprisingly, Taiwan respondents has higher percentage of respondents still playing this game thant Japanese respondents, but it might just be due to the number of Japanese respondents is too low.

# Character popularity

Every ranking below can be filtered by country, region, age, gender and playing status, and compared with 2024 and 2025. Click a character for their history.

{% include survey-ranking.html query="survey=lah&y=2026" title="Character popularity explorer" %}

**Approval Rating (Global)**

| Male Anthro | Approval | Male Humanoid | Approval | Female/Other | Approval |
|-|-|-|-|-|-|
|{% chara_link Pubraseer %}| 65.3% |{% chara_link Akashi %}  | 37.7% |{% chara_link Melide %}   |23.3%|
|{% chara_link Barrel %}   | 59.1% |{% chara_link Astar %}   | 36.7%|{% chara_link ⇌Melide %}   |19.4%|
|{% chara_link Monomasa %} | 53.3% |{% chara_link Ruchbath %}| 35.5% |{% chara_link Sensettia %}|17.1%|
|{% chara_link Ryekie %}   | 51.4% |{% chara_link ⇌Akashi %}| 32.3% |{% chara_link Sui %}       |16.6%|
|{% chara_link Sterio %}   | 49.4% |{% chara_link Roudin %}  | 28.5% |{% chara_link Flamier %}  |15.4%|

To no one's surprise, male anthro characters dominated this year's popularity ranking. The approval rating winner in "Male Anthro", "Male Humanoid" and "Female/Other" are exactly the same as last year, congratulations to them for successfully defending their thrones!

{% chara_link Akashi %} has more votes in "All favourites" ranking (unlimited votes), but {% chara_link Astar %} has more votes in "Top 10 favourites".

LifeWonders officially introduced more parallel/xeno characters now, so I included them in the survey for the first time.

**Approval Rating for parallel selfs (Global)**

| Version 1 |Approval Rating| Version 2 |Approval Rating|
|-|-|-|-|
|{% chara_link Akashi %} (win) | 37.7% | {% chara_link ⇌Akashi %} | 32.3% |
|{% chara_link Broker %} | 26.8% | {% chara_link Branch %} (win) | 31.5 % |
|{% chara_link Melide %} (win) | 23.3% | {% chara_link ⇌Melide %} | 19.4% |
|{% chara_link Crowne %} (win) | 12.9% | {% chara_link Crowne (alter) %} | 6.0% |

{% include survey-chart.html id="top10_size" %}

Every year there are people complaining that only allowing top 10 characters are too little, so here is a reminder that there are also plenty respondents that do not even choose full 10 characters.

## All favourites: global top 25 (2026, n=403)

| rank | character | approval | 2025 | rank change |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 65.3% | 65.4% | +0 |
| 2 | {% chara_link Barrel %} | 59.1% | 47.5% | +3 |
| 3 | {% chara_link Monomasa %} | 53.3% | 53.5% | -1 |
| 4 | {% chara_link Ryekie %} | 51.4% | 48.5% | +0 |
| 5 | {% chara_link Sterio %} | 49.4% | 40.8% | +6 |
| 6 | {% chara_link Giansar %} | 47.9% | 49.5% | -3 |
| 7 | {% chara_link Norbrand %} | 44.7% | new | new |
| 8 | {% chara_link Toshu %} | 43.2% | 42.6% | +0 |
| 9 | {% chara_link Denebora %} | 42.4% | 31.7% | +10 |
| 10 | {% chara_link Tsuneaki %} | 41.9% | 47.0% | -4 |
| 11 | {% chara_link Valoray %} | 41.2% | 38.3% | +2 |
| 11 | {% chara_link reXer %} | 41.2% | 41.9% | -2 |
| 13 | {% chara_link Obsidius %} | 40.2% | 43.5% | -6 |
| 14 | {% chara_link Akashi %} | 37.7% | 41.4% | -4 |
| 15 | {% chara_link Sadayoshi %} | 37.5% | 38.9% | -3 |
| 16 | {% chara_link Astar %} | 36.7% | 37.8% | -2 |
| 16 | {% chara_link Yohack %} | 36.7% | 37.2% | -1 |
| 18 | {% chara_link Mokdai %} | 36.0% | 30.9% | +4 |
| 19 | {% chara_link Ruchbath %} | 35.5% | new | new |
| 20 | {% chara_link Astosis %} | 35.2% | 32.9% | -3 |
| 21 | {% chara_link Huckle %} | 34.5% | 25.7% | +6 |
| 22 | {% chara_link Galvo %} | 33.5% | 35.9% | -6 |
| 22 | {% chara_link Thuban %} | 33.5% | new | new |
| 24 | {% chara_link Gnomon %} | 32.8% | 27.5% | +0 |
| 25 | {% chara_link ⇌Akashi %} | 32.3% | new | new |

## All favourites: biggest approval changes 2025 -> 2026

| character | change (pp) | 2025 | 2026 | rank then -> now |
|---|---|---|---|---|
| {% chara_link Roiker %} | +13.2 | 17.6% | 30.8% | 48 -> 28 |
| {% chara_link Barrel %} | +11.6 | 47.5% | 59.1% | 5 -> 2 |
| {% chara_link Denebora %} | +10.7 | 31.7% | 42.4% | 19 -> 9 |
| {% chara_link Huckle %} | +8.8 | 25.7% | 34.5% | 27 -> 21 |
| {% chara_link Sterio %} | +8.6 | 40.8% | 49.4% | 11 -> 5 |
| {% chara_link Procy %} | +6.4 | 14.4% | 20.8% | 56 -> 49 |
| {% chara_link Senthak %} | +6.0 | 18.3% | 24.3% | 46 -> 39 |
| {% chara_link Taika %} | +5.5 | 21.8% | 27.3% | 39 -> 33 |
| {% chara_link Gnomon %} | +5.2 | 27.5% | 32.8% | 24 -> 24 |
| {% chara_link Mokdai %} | +5.1 | 30.9% | 36.0% | 22 -> 18 |
| {% chara_link Kiloc %} | -7.5 | 24.8% | 17.4% | 30 -> 58 |
| {% chara_link Gammei %} | -7.1 | 31.4% | 24.3% | 21 -> 39 |
| {% chara_link Antares %} | -6.0 | 14.4% | 8.4% | 56 -> 100 |
| {% chara_link Lilac %} | -5.5 | 29.9% | 24.3% | 23 -> 39 |
| {% chara_link Tsuneaki %} | -5.0 | 47.0% | 41.9% | 6 -> 10 |
| {% chara_link Shiratori %} | -5.0 | 17.6% | 12.7% | 48 -> 80 |
| {% chara_link Shaft %} | -4.8 | 20.5% | 15.6% | 41 -> 66 |
| {% chara_link Houley %} | -4.5 | 14.4% | 9.9% | 56 -> 89 |
| {% chara_link Seiichiro %} | -4.5 | 13.4% | 8.9% | 66 -> 99 |
| {% chara_link Polaris Mask %} | -4.0 | 23.8% | 19.9% | 32 -> 51 |

## Top 10: global top 25 (2026, n=403)

| rank | character | approval | 2025 | rank change |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 44.9% | 49.2% | +0 |
| 2 | {% chara_link Barrel %} | 36.5% | 28.5% | +2 |
| 3 | {% chara_link Monomasa %} | 32.3% | 37.9% | -1 |
| 4 | {% chara_link Giansar %} | 28.8% | 32.2% | -1 |
| 5 | {% chara_link Sterio %} | 27.5% | 18.0% | +7 |
| 6 | {% chara_link Ryekie %} | 23.8% | 26.0% | -1 |
| 7 | {% chara_link Obsidius %} | 22.1% | 24.3% | -1 |
| 8 | {% chara_link Tsuneaki %} | 20.8% | 22.8% | +2 |
| 9 | {% chara_link Norbrand %} | 19.9% | new | new |
| 10 | {% chara_link Sadayoshi %} | 19.1% | 24.3% | -4 |
| 11 | {% chara_link Astar %} | 18.6% | 16.4% | +5 |
| 12 | {% chara_link Akashi %} | 18.1% | 24.0% | -4 |
| 13 | {% chara_link Denebora %} | 17.9% | 11.7% | +9 |
| 13 | {% chara_link Ruchbath %} | 17.9% | new | new |
| 15 | {% chara_link reXer %} | 17.6% | 23.5% | -6 |
| 16 | {% chara_link Yohack %} | 15.9% | 16.8% | -3 |
| 17 | {% chara_link Toshu %} | 15.4% | 19.3% | -6 |
| 18 | {% chara_link Astosis %} | 14.9% | 12.2% | +3 |
| 19 | {% chara_link Valoray %} | 13.9% | 14.4% | -2 |
| 20 | {% chara_link Mokdai %} | 13.2% | 13.4% | -1 |
| 21 | {% chara_link Huckle %} | 12.4% | 10.2% | +4 |
| 22 | {% chara_link Roiker %} | 12.2% | 5.7% | +24 |
| 23 | {% chara_link Gammei %} | 11.7% | 16.6% | -8 |
| 24 | {% chara_link ⇌Akashi %} | 11.4% | new | new |
| 25 | {% chara_link Viscunam %} | 10.7% | 7.9% | +9 |

## Top 10: biggest approval changes 2025 -> 2026

| character | change (pp) | 2025 | 2026 | rank then -> now |
|---|---|---|---|---|
| {% chara_link Sterio %} | +9.6 | 18.0% | 27.5% | 12 -> 5 |
| {% chara_link Barrel %} | +8.0 | 28.5% | 36.5% | 4 -> 2 |
| {% chara_link Roiker %} | +6.5 | 5.7% | 12.2% | 46 -> 22 |
| {% chara_link Denebora %} | +6.1 | 11.7% | 17.9% | 22 -> 13 |
| {% chara_link Gnomon %} | +3.1 | 6.4% | 9.4% | 43 -> 31 |
| {% chara_link Viscunam %} | +2.8 | 7.9% | 10.7% | 34 -> 25 |
| {% chara_link Taika %} | +2.7 | 7.2% | 9.9% | 38 -> 28 |
| {% chara_link Astosis %} | +2.6 | 12.2% | 14.9% | 21 -> 18 |
| {% chara_link Sui %} | +2.5 | 2.0% | 4.5% | 82 -> 64 |
| {% chara_link Senthak %} | +2.4 | 4.0% | 6.5% | 58 -> 46 |
| {% chara_link Lilac %} | -7.1 | 16.8% | 9.7% | 13 -> 29 |
| {% chara_link Kiloc %} | -6.6 | 9.1% | 2.5% | 31 -> 83 |
| {% chara_link Akashi %} | -5.9 | 24.0% | 18.1% | 8 -> 12 |
| {% chara_link reXer %} | -5.9 | 23.5% | 17.6% | 9 -> 15 |
| {% chara_link Monomasa %} | -5.7 | 37.9% | 32.3% | 2 -> 3 |
| {% chara_link Galvo %} | -5.6 | 13.8% | 8.2% | 18 -> 33 |
| {% chara_link Sadayoshi %} | -5.2 | 24.3% | 19.1% | 6 -> 10 |
| {% chara_link Gammei %} | -4.9 | 16.6% | 11.7% | 15 -> 23 |
| {% chara_link Polaris Mask %} | -4.8 | 9.7% | 5.0% | 26 -> 56 |
| {% chara_link Exio %} | -4.4 | 10.4% | 6.0% | 24 -> 49 |

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

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_female.svg"
  title="Ranked Voting (female respondents only)" %}

In **Japan**, {% chara_link Monomasa %} is the Cordocet winner, where most other respondent groups tend to put {% chara_link Pubraseer %} as (one of) the Cordocet winner.

In **Taiwan**, {% chara_link Ruchbath %} became the highest male human character in the top 10. For **Japan**, the highest male human character is {% chara_link Rastaban %}.

Among **China respondents**, there is no single Cordocet winner, because {% chara_link Pubraseer %} and {% chara_link Barrel %} won over the other character at 50% of the time (tie). {% chara_link Astar %} is the only male humanoid character in China's top 10.

**Female respondents** are a small group (only {{ f.female_answered }} ballots), so take their graph with a grain of salt: there is no Cordocet winner, and {% chara_link Akashi %} leads the locked order, followed by {% chara_link Melide %} and {% chara_link Crowne %}. Only {% chara_link Pubraseer %}, {% chara_link Barrel %} and {% chara_link Sterio %} overlap with the global top 10.

## Mobs and Kaibutsu

New this year: {{ f.mob_answered }} respondents picked their favourite mob characters and {{ f.kaibutsu_answered }} their favourite kaibutsu.

### Mobs

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="Mob popularity explorer" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="Ranked Voting (mobs)" %}

> I only realized that I forgot to add the civilian form of Mercenary while writing this report...

{% mob mercenary-transform %} is the Cordocet Winner in the ranked voting.

**Locked order (top 10)**: {% mob Mercenary (Transform) %} > {% mob Wolfman (Summer) %} > {% mob Wolfman %} > {% mob Wolfman (Transform) %} > {% mob Ranger %} > {% mob Ranger (Transform) %} > {% mob Wrestler %} > {% mob Acolyte %} > {% mob Mercenary (Clown) %} > {% mob Acolyte (Transform) %}

**Tie**: {% mob Mercenary (Clown) %} = {% mob Acolyte (Transform) %}

### Kaibutsu

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="Kaibutsu popularity explorer" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="Ranked Voting (kaibutsu)" %}

{% mob id-replica %} has the highest approval rating, and the gap between it and the second place is huge! {% chara_link Exio %} would be proud.

**Locked order (top 10)**: {% mob Id Replica %} > {% mob Cetus/Plesiosaur Kaibutsu %} > {% mob Gatekeeper %} > {% mob Engine Kaibutsu (Adult) %} > {% mob Imposter %} > {% mob Palanquin Kaibutsu %} > {% mob Coal Tar Kaibutsu %} > {% mob Lizard Kaibutsu %} > {% mob Shark Kaibutsu %} > {% mob Ghost Kaibutsu (Adult) %}

## Best CP

{{ f.best_cp_respondents }} respondents submitted {{ f.best_cp_pairs }} pairings.

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="Best CP (pairs chosen by at least two respondents)" %}

> Relationships that were only supported by one respondent are omitted, as I considered them as being too random

| Pairs | Count |
|-|-|
| {% chara_link Huckle %} x {% chara_link Ryekie %} | 54 |
| {% chara_link Barrel %} x {% chara_link Furlong %} | 39 |
| {% chara_link Monomasa %} x {% chara_link Sadayoshi %} | 31 |
| {% chara_link Giansar %} x {% chara_link reXer %} | 27 |
| {% chara_link Norbrand %} x {% chara_link Vergald %} | 27 |
| {% chara_link Giansar %} x {% chara_link Sadayoshi %} | 26 |
| {% chara_link Akashi %} x {% chara_link ⇌Akashi %} | 24 |
| {% chara_link Barrel %} x {% chara_link Gammei %} | 17 |
| {% chara_link Phein %} x {% chara_link Procy %} | 17 |
| {% chara_link Goro %} x {% chara_link Isaribi %} | 16 |
| {% chara_link Branch %} x {% chara_link Broker %} | 14 |
| {% chara_link Gammei %} x {% chara_link Tsuneaki %} | 13 |
| {% chara_link Exio %} x {% chara_link Yoshiori %} | 12 |
| {% chara_link Melide %} x {% chara_link Monomasa %} | 12 |
| {% chara_link Canes %} x {% chara_link Sterio %} | 11 |
| {% chara_link Saotome %} x {% chara_link Shiratori %} | 11 |
| {% chara_link Alchiba %} x {% chara_link Vulpecula %} | 9 |
| {% chara_link Astosis %} x {% chara_link Yohack %} | 9 |
| {% chara_link Gomeisa %} x {% chara_link Procy %} | 8 |
| {% chara_link Barrel %} x {% chara_link Ryekie %} | 7 |
| {% chara_link Akashi %} x {% chara_link Kyoichi %} | 6 |
| {% chara_link Borealis %} x {% chara_link Goro %} | 6 |
| {% chara_link Esperdica %} x {% chara_link Raizi %} | 6 |
| {% chara_link Gammei %} x {% chara_link Suhail %} | 6 |
| {% chara_link Sensettia %} x {% chara_link Viscunam %} | 6 |
| {% chara_link Amekuni %} x {% chara_link Ruchbath %} | 5 |
| {% chara_link Astar %} x {% chara_link Senthak %} | 5 |
| {% chara_link Barrel %} x {% chara_link Mokdai %} | 5 |
| {% chara_link Exio %} x {% chara_link Huckle %} | 5 |
| {% chara_link Gnomon %} x {% chara_link Rutilix %} | 5 |
| {% chara_link Obsidius %} x {% chara_link Roiker %} | 5 |
| {% chara_link Rastaban %} x {% chara_link Thuban %} | 5 |
| {% chara_link Barrel %} x {% chara_link Monomasa %} | 4 |
| {% chara_link Hitomi %} x {% chara_link Sui %} | 4 |
| {% chara_link Mokdai %} x {% chara_link Yohack %} | 4 |
| {% chara_link Roiker %} x {% chara_link Yvaga %} | 4 |
| {% chara_link Sadayoshi %} x {% chara_link Tsuneaki %} | 4 |
| {% chara_link Akashi %} x {% chara_link Mokdai %} | 3 |
| {% chara_link Antares %} x {% chara_link Taika %} | 3 |
| {% chara_link Barrel %} x {% chara_link Pubraseer %} | 3 |
| {% chara_link Branch %} x {% chara_link Norbrand %} | 3 |
| {% chara_link Crowne %} x {% chara_link Maculata %} | 3 |
| {% chara_link Crowne %} x {% chara_link Sui %} | 3 |
| {% chara_link Flamier %} x {% chara_link Lilac %} | 3 |
| {% chara_link Gammei %} x {% chara_link Okitaka %} | 3 |
| {% chara_link Giansar %} x {% chara_link Hydoor %} | 3 |
| {% chara_link Hydoor %} x {% chara_link Isaribi %} | 3 |
| {% chara_link Lilac %} x {% chara_link Roudin %} | 3 |
| {% chara_link Pubraseer %} x {% chara_link Ryekie %} | 3 |
| {% chara_link Shoen %} x {% chara_link Toshu %} | 3 |
| {% chara_link Akashi %} x {% chara_link Crowne %} | 2 |
| {% chara_link Akashi %} x {% chara_link Rutilix %} | 2 |
| {% chara_link Akashi %} x {% chara_link Sui %} | 2 |
| {% chara_link Akashi %} x {% chara_link Yoshiori %} | 2 |
| {% chara_link Alend %} x {% chara_link Saotome %} | 2 |
| {% chara_link Alend %} x {% chara_link Turbak %} | 2 |
| {% chara_link Amekuni %} x {% chara_link Shiratori %} | 2 |
| {% chara_link Astosis %} x {% chara_link Tsuneaki %} | 2 |
| {% chara_link Barrel %} x {% chara_link Giansar %} | 2 |
| {% chara_link Barrel %} x {% chara_link Sterio %} | 2 |
| {% chara_link Broker %} x {% chara_link Exio %} | 2 |
| {% chara_link Bygul %} x {% chara_link Mokdai %} | 2 |
| {% chara_link Conche %} x {% chara_link Sterio %} | 2 |
| {% chara_link Crowne %} x {% chara_link Hisaki %} | 2 |
| {% chara_link Crowne %} x {% chara_link Mokdai %} | 2 |
| {% chara_link Danzo %} x {% chara_link Victom %} | 2 |
| {% chara_link Denebora %} x {% chara_link Pubraseer %} | 2 |
| {% chara_link Gaisei %} x {% chara_link Yotaro %} | 2 |
| {% chara_link Gammei %} x {% chara_link Huckle %} | 2 |
| {% chara_link Giansar %} x {% chara_link Monomasa %} | 2 |
| {% chara_link Giansar %} x {% chara_link Ruchbath %} | 2 |
| {% chara_link Giansar %} x {% chara_link Vulpecula %} | 2 |
| {% chara_link Gnomon %} x {% chara_link Hydoor %} | 2 |
| {% chara_link Grigory %} x {% chara_link Santetsu %} | 2 |
| {% chara_link Melide %} x {% chara_link Yoshiori %} | 2 |
| {% chara_link Mokdai %} x {% chara_link Ryekie %} | 2 |
| {% chara_link Obsidius %} x {% chara_link Pubraseer %} | 2 |
| {% chara_link Obsidius %} x {% chara_link Yvaga %} | 2 |
| {% chara_link Pubraseer %} x {% chara_link Ruchbath %} | 2 |
| {% chara_link Pubraseer %} x {% chara_link Sterio %} | 2 |
| {% chara_link Pubraseer %} x {% chara_link Tsuneaki %} | 2 |
| {% chara_link Pubraseer %} x {% chara_link Valoray %} | 2 |
| {% chara_link Rastaban %} x {% chara_link Yuhang %} | 2 |
| {% chara_link Reticul %} x {% chara_link Roiker %} | 2 |
| {% chara_link Roudin %} x {% chara_link Ruchbath %} | 2 |
| {% chara_link Taika %} x {% chara_link Toshu %} | 2 |
| {% chara_link Thuban %} x {% chara_link Vergald %} | 2 |
| {% chara_link ⇌Akashi %} x {% chara_link Crowne (Alter) %} | 2 |
| {% chara_link ⇌Akashi %} x {% chara_link ⇌Melide %} | 2 |

# Player Feedback Analysis

This free text analysis was done with the help of LLM assistant, then I manually scan for term/context ambiguity and fix them, add character/link formatting.

A few people misspelled {% chara_link Vergald %}, {% chara_link Norbrand %} and {% chara_link Theoreol %}'s name in the survey, I am revoking your husbando certificate.

The survey ended before 6th anniversary, and since then LW has released some new improvements before this survey report is published:

- {% chara_link Thuban %} has been released
- Main Quest Chapter 4's official translation
- New form of Item Search Box that takes less stamina to clear

Source columns:

- **`feedback`**: "Do you have any feedback to say about the content and changes put out by the game between {previous anniversary cutoff} till now?" (126 answers)
- **`improvement`**: "What improvements would you like to see in this game? (Optional)" (213 answers)

228 of 403 respondents wrote in at least one column and 111 wrote in both. Almost all are current players. Players who have stopped are tagged `(stopped)`, and there are only about ten of them.

## How to read this

- **Each answer was split into individual points first.** A point was then filed under its own category. One respondent can therefore appear in several categories, and long answers are broken apart.
- **`×N` means N respondents made essentially the same point.** The country codes after it list them, so N can be checked. `~N` is an approximate count for very large themes, from keyword matching cross-checked by reading. Where the same country appears in both columns with near-identical text, it is counted once.
- **Each category separates what players liked from what they criticised or asked for.** A request is filed under the negative or request side because it signals a gap.
- **Quotes are trimmed but otherwise verbatim.** Terms I am unsure how to translate are kept in the original language.
- **Country codes** are ISO (ES = Spain, SV = El Salvador, MO = Macau, GB = United Kingdom). `(F)` marks a point from the `feedback` column and `(I)` one from `improvement`, when that is useful context.
- **Game terms.** *Gacha currency*: "ether crystal / ether stones / stones / gems", 乙太虹石 (ID respondents also write "ether quartz" for it, in the context of pulling and pity). *Parallel Quartz* (or just "quartz", 平行石英 / 水晶) is a different thing: a **farmable upgrade material**, whose acquisition is now slow and limited (§3.9). The pull-point shop is 契约所 / Search Structure / "search exchange". "Housamo" (放サモ / 放課後サモナーズ / TAS / "Tokyo Afterschool Summoners", a sister game) is often used as a benchmark.

---

## Executive summary: what players want most

| # | Theme | Size | Direction |
|---|---|---|---|
| 1 | **Translation**: faster, regular, complete, better quality, more languages | ~95 respondents (~40% of writers) | Overwhelmingly "more, faster". The official translation itself is also the most-praised change. |
| 2 | **Pull economy and pity**: more free currency, lower or softer pity, better rates | ~85 (~37%) | Mostly negative: "stingy", "wait a year for one guarantee". |
| 3 | **Auto-battle / sales / loading QoL** | ~40 | The most-liked mechanical change. Follow-ups: default-ON auto, auto not triggering passives, skip/sweep, loading times. |
| 4 | **Old and weak characters**: skill-tree cadence, buffs, power creep | ~25 | Wanted more often. Skill trees at least once per quarter, for older non-limited units. |
| 5 | **Event presentation** vs **event cadence / box events** | ~35 | Presentation (interactive maps, cards) praised. Cadence, reruns and the box format criticised. |
| 6 | **Alts and character representation**: named alt requests, female 5★, body types | ~30 | Many specific character asks (listed in §4). |
| 7 | **Content depth**: endgame, replayable modes, new modes | ~20 | "Exploring the Unknown" style is loved. More of it is wanted. |
| 8 | **Technical**: loading, lag, bugs, account/data backup | ~25 | Loading improved but is still a top annoyance. Account saving is a recurring pain point. |

---

## 1. Translation

~95 respondents touched on translation, by far the largest single theme. Many of them wrote only "translations" or "faster translation".

### 1.1 Positive

- **Having an official translation at all is the single most-praised change** (~25).
  - "Biggest improvement this game has gotten despite the long overdue for 5 years" (ID).
  - "Love that the game received its official translation after 5 years. I'm constantly excited for the next batch to drop to learn and fall in love with more of the characters" (US).
  - "A big move for the game's accessibility" (US).
  - "Translations are a huge help... can't wait for them to be released every few months now" (US).
  - Also from AR, PR, PH, SG, ID, MY, UY, TW, BR, MO.
- **Translation has a commercial effect.** US: "the translations did get me to spend more on the game than I normally would as I got more emotionally attached to the characters."
- **Chinese localisation was called out as a plus** (TW): 加分：中文化，系統優化.
  - Another TW respondent: 介面與內容的中文化能更融入遊戲 ("the Chinese interface and content could blend into the game better"), so it is appreciated but not yet seamless.
  - BR (in Chinese): 翻译越来越多，越来越快 ("more and more translation, faster and faster").
- **Delivered batches were noticed.** US(F): happy to get Chapter 3 and two past events, though they note few main-story translations this year.
- **Effort is recognised even when imperfect.** TW: "Even though the translated text still need some work in terms of fonts and placement, it is a very welcomed addition." MY: "English translation update was abit janky but very appreciated." US: "even if the translations aren't 100% yet."

### 1.2 Negative / requests

**A. Speed and release cadence (the dominant complaint, ~60)**

- Plain "faster / more translations" ×~45. Many are bare one-liners, from US, GB, FR, PL, BR, SG, ID, PH, LT, VN, MA, TW, CN and others.
- Strong wording:
  - "Translation speed is inexcusable" (CY).
  - "Very slow and disappointing" (FR).
  - "The rate at which they update old translations is too slow and infrequent" (US).
  - 官方翻譯真的太慢了 (TW).
  - "LW please make haste... my life will be yours" (PH).
  - "Absurd we wait six years for english and have to wait EVEN longer for the slow release" (US).
- **Batch size and frequency**: "one or 2 every few months is a good start but it's mid September and we only have book 3 of chapter 1 and 3 side events" (US). Others ask for "quicker/larger batches" (US) and "more frequent English translation updates" (BR, US).
- **Release in sync with Japan** (×~8: ID, TH, US, FR, BR, AU, MY, PH).
  - ID: "Let the English translation sync with japanese release so international fan can enjoy it too."
  - TH: wants a new story's English release "together with japan."
  - FR: "faster or instant after released."
  - MY: translate the newest content *while* translating the old backlog.
  - US: would "even take a machine translation if it means we get stuff as the JP playerbase."

**B. Schedule transparency (×5)**

- PH: "hope they announce the translation officially and not being surprised that official translation has already been dropped."
- VE: "be more clear when they release them."
- PR: "additional communication in regards to the translation schedule."
- PH and BR: want a *consistent* schedule.
- VN: "update it more regularly."

**C. What is still untranslated (coverage gaps)**

- **Main story**: still partial (US, MA, MX "I can only read about half", EC, GB "more main story").
  - CN: the main story is untranslated from Book 1 Chapter 4. 剧情第一部第四章就没有中文翻译了，新活动也没有翻译.
  - Players ask for the translation of "main story and events" (CN, SV, CL).
- **Character quests and link quests** (×3: FI ×2, PH). FI: "no English translation for the character and link quests."
  - PH fears the game will "follow Housamo on not translating story that isn't main story or events."
- **Event stories**: new events (CN, CL, TH, SV, ID) and **rerun events** (×4).
  - US: "If an event is being rerun it should be pushed for translation."
  - TH: "rerun event should come with eng translate like housamo."
  - SV: "translate the missing chapters and events when they repeat."
  - AU: "Translation on rerun events."
  - CL: also wants the hero "dates" translated.
- **Skills, skill trees, abilities and statuses**:
  - GB: "wish skill trees were released translated in game so the kits are more intuitively understood."
  - MY: "crazy that skill trees are not translated on their release, since that was their whole thing that at least the skills will be translated."
  - ID: "Faster translation of skills at very least."
  - TH: some hero skills "still use japanese."
  - US: "abilities, statuses, sidekicks and ui elements are still untranslated."
  - CN: 增加中文翻译，包括主线/活动剧情、角色技能等.
  - MO: new character skill text has become "小作文" (essay-like) and even with official Chinese they need a reworded chinese skill description (中译中) written by other online users to understand it.
  - ID: wants the new-unit *combat trial* in the banner translated, so non-JP players can see skill mechanics and recommendations.
- **UI** (×4: US(I), FI, ID, PH). "Full ui translation" (US).
- **Voice-line / battle-line subtitles**: see §4.4.

**D. Translation quality and UI fit**

- Text overflowing UI boxes (FI, PH "just make sure the UI fits the translation", ID "fixing current in-game text display issues").
- Missing characters, 漏字的bug (CN).
- Awkward quality: "Scenario translation is a bit embarrassing for a game this big" (ES).
- Plain requests for more care: 翻译认真一点啊 (CN), 翻译用心点 (CN), "quality has to be good" (BR).
- Fonts and placement need work (TW).
- "Fixes the translation in the 1 to 2 years" (TW).
- **Bug**: "Sometimes English language changes to standard for some reason" (RU).

**E. Method**

- CL: wants faster translations "but still made by humans. No AI or MTL."
- US: would accept machine translation if it means parity with the JP release.
- MY: if they actually hired more English translators "they can catch up to the latest even faster."

**F. Other languages**

- **Chinese**: zh-cn ×~7 (CN), zh-tw ×~6 (TW, HK).
  - HK: 希望官方可以加快劇情翻譯的進度.
  - CN: 新活动剧情追加多语言 (add more languages to new event stories).
  - TW: 更多劇情翻譯，活動劇情能更貼切展示當期sp角色.
  - TW (stopped): 讀取真的問題很多，不能skip也很耗費耐心，龍脈有完整翻譯，這邊幾乎沒有. This is loading complaints plus a comparison to another game, "龍脈" (Another Eidos of Dragonvein), which has full translation.
- **Spanish** (EC "Spanish version", SV "Include Spanish").
- **Thai** (TH: "an official Thai translation feels like a very difficult dream").
- Unspecified "more other language translations" (PH), "multilingual support can continue to expand" (AR), "slow implementation of non-Japanese languages" (MY).
- Counterpoint: JP-literate US respondent: "While I can read Japanese, it still isn't my native language."

---

## 2. Gacha system

~85 respondents. Terms used: {% include item.html name="Ether Crystal" %} / ether stone(s) / 乙太虹石 (and "ether quartz" as written by some ID respondents) = the paid or free gacha currency. This is separate from {% include item.html name="Parallel Quartz" %}, the upgrade material (§3.9). ticket = ether ticket; "200 pull / spark / pity" = the 200-pull exchange guarantee.

### 2.1 Positive

- **Pull economy was improved this year.** US: "efforts from LW to increase pull economy through limited tickets during 5.5 Anniversary and more frequent log in bonuses during events is another good sign."
- **Incremental improvements acknowledged.**
  - TW: 福利有變好在改善了，但感覺還是少了一點點 ("welfare has improved but still a little too little").
  - JP: "LW made adjustments to the gacha" (but see 2.3).
- **Banner features and shops praised.**
  - ID likes the **combat trial in the summoning banner**.
  - ID likes the **weekly shop** and **purchasable past-event hero auxiliary skins**.
- **The removed box exchange** is described as "Good thing they remove it" (MY(F), on "Echoes of frontier memories"; see §6.2).
- **4★ hero variants returning** is called "a promising sign for unpopular characters" (US; see §4.1).

### 2.2 Negative: free currency income (~65)

- **General "more free stones/gems/crystals"**: ×~40, in almost every country. Typical phrasing is "More gems", "more pulls opportunity", "more free stones", "more ways to earn stones".
- **Stinginess framing:**
  - BN: "It feels stingy for a niche game."
  - CY: "Less stingy with mats and especially with the gacha."
  - RU: "stingy with pull currency."
  - IT: "this game is so damn stingy... In-app purchases are EXPENSIVE... having to save almost a whole year to guarantee 1 single character is depressing."
  - US: "The ether stone economy is so trash. Still having to wait a year to guarantee a character you want sucks."
  - VE: "we barely get 2 sparks per year if you save that hard."
  - BR: "less rewards than its predecessor TAS."
- **Concrete figures:**
  - TW: 福利非常少，一個版本只能湊到10~20抽 ("only 10–20 pulls per patch").
  - TH: "at least 50 gem in one patch", "at least 100 gems/month", and "that's why there are low players."
  - TW: 相比其他同市場的遊戲，寶石給的數量會讓人想退坑 ("the gem amount makes me want to quit").
- **F2P sentiment**: "make the game more F2P" (US), "more free 5 star for f2p play" (TH), "F2P players are hard to play these days" (TH). Also "welfare units outdated" (RU ×2: "most welfare units outdated" and "more usable welfare units").
- **Comparison to other games**: Project Sekai "I still have ways to acquire currency" (LT); Eidos "the most egregious one" (US, IT).
- **Specific income asks:**
  - Daily ether crystals (TH). Daily quest rewards (PH).
  - **Better weekly and cumulative login rewards** (×4: PH, ID, US, US).
  - Multi-pull option for ether tickets (RS).
  - Use all three tickets on each quest requiring tickets (FR). Skip tickets (US, stopped).
  - **A recurring crystal source** (US(I): "LW adds other recurring sources for ether stones with how abysmally slow the grind is"), "more content to farm crystals on" (PH; ambiguous whether this means gacha currency or an upgrade material, filed here because the same answer asks for more ways to collect resources and cheaper livo purchases), "more tasks to get stone" (MY).
  - Monthly "Simulator" (GB(F), verbatim: "Change Simulator to Monthly"; likely Challenge Simulation rewards).
  - "Endgame that has a cycle of reset frequently" to farm gems (VN).
  - US: "ESPECIALLY once [F2P players] cleared the story." The respondent proposes splitting story chapters into smaller parts so each completion gives a gem reward (see §5).
  - Better reminder for daily card pulls (US).
- **Mixed with pity**: "more gem income and/or better pity" (AR), "more free gems daily or weekly if the gacha is to remain the same" (US).

### 2.3 Negative: pity, spark and rates (~40)

- **200-pull spark is too expensive / too slow to reach** (×~15).
  - "Wish it didn't take 200 pulls to guarantee a limited 5 star with how low rates are" (US).
  - Halve it: 降井（200→100） (CN), "the amount of gems needed to pity a character needs to be halved" (US), "less pulls necessary for guaranteed 5 star" (DE), "Lower the pull point... the more people pull but still not getting the character is a downer" (MY).
  - "Reduce stones for 1 roll from 5 to 2... 3... 4" (TH ×2, F and I).
  - "Increased pull economy to reduce the amount of time needed to save for the 200 pull guarantee" (US).
- **Pity does not carry over between banners** (×4).
  - LU: "200 summon pity that doesn't carry over between banners. They should either let it carry over or drastically increase pull-economy."
  - MY: 或者能繼承保底數 ("or let pity carry over").
  - SG: "An accumulated pity system since it's difficult for F2P players to save up to 200 pulls for a single pity."
  - CN: points from the 契约所 (pull-point shop) can't be carried to the next banner. The respondent asks for a **100-point tier on every banner's 契约所**, because "pulling 80–90 points sometimes already yields the wanted character, while the shop only lists 200-point exchanges". They find waiting to 200 wasteful and the 90 leftover points unusable.
  - US: "Leftover pity can be traded in for tickets like Housamo."
- **No soft pity / increasing rate** (×6).
  - VE: "introduction of a pity system (as in increase rates as your pull count goes up, not just sparking)."
  - JP: "the percentage of 5star doesn't change no matter how many pulls... I really wish they made a pity system or increase the odds."
  - FI: "Better pity system or just make the 5 stars have a higher chance?"
  - US: spark on the permanent banner "or at least a rate increase every five to ten scouts until you get a 5star."
  - US: pity "atrocious compared to other gachas excluding Eidos."
  - PH: "Better gacha rates/pity or more free/event gems."
- **Rates and fairness** (×~10).
  - "MUCH better Gacha Rates" (US, stopped), "gacha system is very unfair" (MX), "the gacha system is also pretty unfair" (ES), "kinder hero drop rates" (TH), "Increase pulling rate for limited characters" (MY ×2: F and I).
  - TW: 機率提高.
  - Plain "better gacha system" (RU, VN, FR, ES, US, BR).
- **Exchange-pity / shop pity**: ID names "ether quartz, gacha tickets and search exchange pity". The strict income makes it hard for newer players to pull for new heroes.
- **Frustration at failing to get a specific unit** (not a design complaint but a sentiment signal): US(F) whiffed Huckle's alt; MY(F) "used all my ether but doesn't get Andrew and Huckle"; US "Better gacha so I can get my friggin S.Hydoor"; US "I got shafted for S.Hydoor once again."

### 2.4 Pull-point shops, selectors and exchange

- **Free limited 5★ selector / select-your-own pack** (×5): 能不能出限定五星的自选礼包？(CN, F and I), 多點自選禮包 (TW), "Free limited 5* selector" (TH), "more free 5 star for f2p play" (TH).
- **Search Structure / pull-point shop**:
  - Add old units so they can be purchased (IT).
  - "Update the exchange item from shop (livo, search structure, etc)" (ID).
- **Friend-point gacha**: "Update/improve the rewards in the friend points gacha" (US) and "Something more to do w/ Ally Points" (US, stopped).
- **Convenience for post-pull conversion**: "Exchange all button for record cube" (PH). ID wants batch conversion of extra memory shards and sidekick hearts into record cubes, since doing it one by one after pulls is a hassle. (Also in §3.6.)

### 2.5 Banner and rerun cadence (the pool side)

- **Reruns are repetitive**: "TOO MANY REPRINTS. Usually only new content every 2 months" (SE).
  - PH (non-binary): "More old character/alt mix ups for reprint banners and not simply just repeatedly rerunning their debut banner."
  - TW: "瘋狂復刻劇情活動，久久才一次新的" (crazy reruns of story events, new ones are slow).
- **Alt wait time**:
  - "so that character alts don't take, say, three years to arrive" (MX).
  - "not take too long to reveal new character alts" (MX(F)).
  - JP: 新しいキャラクターを先行公開するなら半年以内には実装してほしい ("if you preview a new character, release them within half a year").
  - JP: ディグラムとテオレールの限定化を早く…頼む… ("hurry up with releasing limited variant for Digram and Theoreal").
  - PH: "The advent of 2nd alts makes the pain of waiting for the 1st alt of a not so popular character all the more brutal."
  - SE: "Focus on giving alts to characters who already don't have one" (see §4.1 for the character list).
- **Polarisation**: US wrote "the characters getting alts are fair" but has no motivation to pull. VN "forced myself to use base heroes rather than limited heroes because I only have one alter hero".

### 2.6 Pricing and monetisation

- **Monthly pass / monthly packs** (×3: ID, PH, TH). PH: "An affordable 30 day monthly pass... more affordable in-game purchases for low spenders." TH: "good monthly pass, so I can spend less to gain the ether crystals."
- **Cheaper stone packs** (×4: TW 課金石變便宜一些; US stopped "Lowered Stone Prices"; PH "less expensive livo purchases"; IT "In-app purchases are EXPENSIVE").
- **Shop deals aimed at "dolphins"** rather than whales (US).
- **China payment**: CN wants 中国区氪金平台 support. On the web store they hit error 0003-0003 ("payment method not available in this region") and propose **WeChat Pay and Alipay**.
- **Commerce vs translation signal**: see §1.1 (US says translation increased spending).

---

## 3. Game feature feedback and request

### 3.1 QoL and auto-battle

**Positive (~40 mention a QoL item)**

- **Auto-battle / continuous auto / auto-repeat** (×~10: US ×4, ID ×2, TW, UY, MY, US nb). "Autumn Campaign has been my favorite just from the new Stamina and Auto Battle features alone" (US). "Finally added auto battler praise the lord" (ID). 連續戰鬥便利性很棒 (TW).
- **Sales (業務) revamp** (×~9: FI, US ×3, ID ×2, MY, UY, TW). "Much less of a chore" (US(F)). "It was always such pain to manage sales, especially if I'm having long work day or the sales notification doesn't go off" (FI). 派遣可以分時段領取收穫 (TW). MY: "Sales revamp and skip battles make game much faster."
- **Loading time and speed**: "Thank God they improved the loading times in the latest patch" (US), "the game runs faster" (UY), 系統優化 (TW).
- **Multi-stamina / multi-battle**: the "stamina in multiples" feature is welcomed, but see below.
- **Never-ending jobs** (TW): "a good thing".
- Overall: "QoL changes from 9/17 update are all very good" (US), "LW actually listen to the players feedback" (MY).

**Negative / requests**

- **Auto-battle defaults to ON** (×2: US(F) "defaulting to auto-battle is not [good]", US(I) "Return auto battle default to not selected").
- **Auto triggers on content that doesn't need it** (US(F)).
- **Auto does not use passive/S4 skills** (×3): ID "Auto but not linked to passive for skill activation", UY "Passive skill to activate S4 in autobattle", US nb "new sidekick passives or a rework of the system that automatically saves and repeats all actions taken in previous manual battles".
- **Bugginess of the 9/17 update** (US).
- **Never-ending jobs can't change heroes on the fly** (TW).
- **Skip / sweep instead of repeating** (×~7).
  - US nb: "The newly added feature to use stamina in multiples is nice but you still repeat the quest rather than skipping it."
  - US: "The just released multi battle is nice but a skip function would be even better."
  - CN: 一键扫荡, plus 3× stamina for a "challenge count 3" mission rather than three runs.
  - ID: "A feature to run multiple times for quest."
  - US (stopped): skip tickets.
  - VN: "Blitz (fast clear) in game."
  - PL (stopped): "I wish I could do my daily 0/3 mission challenge by doing the same event mission 3 times, instead of 1 ticketed and 2 non-ticketed."
- **Speed-up** (AR "Button to speed up the battle"; CN 战斗高倍速（2～3倍速）).
- **In-battle**: "Ability to restart battle within the battle menu" (FI), "easily accessible stat information during combat" (CO).
- **Repetitive grinding** (CN "减少通常关卡的重复攻略数", US "options to skip having to repeat quests/farming").

### 3.2 Office and sales

- **Office feels stale / low interaction** (×6): CN 更新一下办公室，已经很久没有新东西了; TW 辦公室功能互動感很低; US "an expansion on the office? It's been a bit stale"; ID "New feature in Office to strengthen base stats of hero and sidekick" (like other games' unit level-cap extensions); AU "after reaching maximum rank, no other purpose for Company Seals"; ID "new feature in office".
- **Office gifts / presentation should use time accumulation like Sales** (×4): TW 辦公室的送獎 可以跟業務一樣改成時間累進; BR "A way to claim Office Presentations before reaching the maximum time limit similar to how Sales were remade"; TH "improve gift in office the same way as sale missions"; and similar.
- **Company Seals**: AU: no purpose at max rank. US: "More ways to get company seals", "Universal method for Seals".

### 3.3 Exploring the Unknown / exploration mode and dungeon

**Positive**

- "The newest Exploring The Unknown version has been really fun and pleasantly challenging" (US).
- "The developers should utilize Explore the Unknown style more! That is super fun and replayable easily. I can see events having much better engagement if one were to be ran like that!" (US).
- "The dungeon mode has really good replayability!" (US).
- Endgame is "actually pretty hard insofar as it's a puzzle" (US, positive-neutral).

**Negative**

- MY: "I don't like the new exploration mode" and "make the exploration mode less hard, like make the normal mode less hard".
- ID: power creep "especially the newest exploration mode".
- US: "Press F to pay respects for old Exploration."

### 3.4 Hero Card Collection (collector's cards)

**Positive**

- "Interesting... hope they expand more on it" (US).
- "Pretty neat even if it doesn't add anything to gameplay" (US).
- "Summer Trading Cards in Summer Montage Halation" (US, as event visuals).

**Negative / requests**

- TW(F): 扣分：英雄卡片蒐集 (negative, no reason given).
- CN: **eye strain** from the shiny polygon effect, which makes the card look like a physical foil card. The respondent did not upgrade any Summer Montage cards for that reason, and asks for a **toggle to turn card effects off** (自主选择是否开启英雄卡特效, also in (I)).
- Rewards (IT): "Collecting cards should give some rewards (wallpapers, stones, custom pfp, etc)".
- More features (IT): wallpaper, home screen, unique artworks.
- Display selected cards on the user profile (PH nb).
- ID: **quick-buy** of the "green triangle" material for card rarity, instead of going to the shop.

### 3.5 Customisation and profile (×~12)

- Home-screen **background** change (TW, VN, MA "new Main Menu"), **homepage music** (CN ×2: 希望能更换主页的音乐 and 自己更换主页音乐).
- **Business card** variety and character-interaction combos (TW). Up to 4 heroes or sidekicks on the business card background (TH).
- **Profile icon options** (PH nb), "profile avatar change into in-game character" (TH).
- **Desk customisation** (GB). More generic character **decorations** (MY, 角色模組的小裝飾).
- **Titles** (TW): the "new" badge on titles forces the player to click the new title, which also equips it. This is "unfriendly to those with OCD". The respondent wants titles locked in.
- **Skin system / premium skins**: "make a skin system or more accessory for the characters" (VN); a premium skin system with whole-outfit changes and VFX/SFX changes like Arknights and R1999 (US); see §4.3.
- **Gallery** to see all units, mobs and special NPCs (US).

### 3.6 Formation, UI, sorting and menus

- **More formation/loadout slots** (×4: CN 可以保存更多编队; TW 希望有更多編組 ×2 (F and I); US "More loadout slots").
- **Team of 6** (BR), and **support team** restriction: MY 助戰角色編成那邊如果可以拔掉屬性限制改為最多編入6位任意屬性的角色也不錯.
- **Persistent sort/filter** (×3: VN, CN, BR "ui sorting system"). CN: 在备战界面将排序设置为"Lv"+"降序" resets every time.
- **Role filter** (ID: "only show heroes of specific roles").
- **Sidekick skill filtering and popular-passive recommendations** (TW: 助手技能的塞選不夠多，或是建立大家在目標角色上近期所搭配的被動使用次數前幾名 (類似於角色之推薦被動搭配)).
- **"Used Last Team" needs a permanent remove option** (US).
- **Shortcuts**: "go to the leveling screen directly from the rank up screen" (US), "Exchange all button for {% include item.html name="Record Cube" %}" (PH), "convert extra hero memory shards or sidekick hearts into record cubes in a batch" (ID).
- **Red dot for skins when switching to a new phone** (US).
- **Menus are clunky / improve menus** (US(I), US, BR "a few UI changes").
- **CN's detailed UI list** (preserved because it is unusually specific):
  1. Make the **main story entrance more visible** than the event entrance. The event entry is oversized, as though steering new players to events, and tapping Events shows the event mission screen a second time.
  2. Add a confirm "enter?" when tapping a new stage (accidental taps trigger two "connecting" waits).
  3. Add a confirm on the bottom-left back button on the **support selection** screen (a double-tap from lag exits the battle prep).
  4. Long-press on hero/sidekick should open **Skill Set** first instead of Stats (and drop the flashing black "connecting" screen).
  5. Redesign **"习得装备技能"**, so equipment skills are available from the start. It currently consumes a skill slot just to change cast order.
  6. **Connecting** speed: returning to the home screen from Gacha / Formation / Shop forces a connecting step. Make it background or remove it. Battle load takes ten-plus seconds from stage tap to support selection. Switching to another app and back leaves "connecting" stuck for minutes.
  7. Remember sort settings per screen.

### 3.7 Performance, bugs and technical

- **Loading times** (×~6): ID, CO, FI, CN (above), TW(stopped), US. Praise exists for the latest patch (US).
- **Lag**: "Some of the hero's move making the whole experience lagging. I am on high-end OS and it's happening on both of my devices" (ID, F and I). US: "An option to disable/skip animations for Skill 3, in-battle characters, and animated backgrounds to reduce lag."
- **Bugs**: "plenty of bugs" (BR); TW: "fix some of the bug... and respond to the bug fixes faster"; TH listed: title-screen hang 2–3×, formation rename error pop-up (repeating), hero/sidekick lists sometimes missing (need to rejoin), and the art-change feature lacking expressions.
- **Download size** (US: "smaller download times").
- **Skill 3 / ultimate skip option** (TH "skill animation skip in combat", "faster skill animation option").

### 3.8 Power balance, kits and skill trees

**Positive**

- New skill trees were noticed: "although new update as of this post has added two new skill trees" (AU).

**Negative / requests**

- **Skill tree cadence for old units** (×~15). The most specific:
  - JP: "スキルツリーの追加ペースに不満がある。2026年は1月と9月の2回のみで、いずれも限定☆5キャラクターのみだった" (only two skill-tree releases in 2026, January and September, both limited ★5 only). They add that skipping the skill tree for {% chara_link Furlong|h2 %} when his link quest was added was a missed chance, and ask for higher frequency.
  - ID "Please improve past hero kit via skill tree as soon as possible", "older characters without skill tree suffered... even with one but still garbage like {% chara_link Ryekie|h2 %}".
  - PH: update **old skill trees** to match newer ones (e.g., {% chara_link Akashi|h1 %}'s skill tree is "all over the place").
  - US "More frequent skill trees for older non-limited units", "Faster skill tree updates for weaker units", ID "more often adding skill tree to outdated characters or buff them", UY "Skill tree for older units, especially ones with low activation-percentage skills and those that cause burn or poison", BR, PH, TW (舊角色強化一年能多2-4隻 = 2–4 more old-character buffs per year), TH ("more buff to old character").
  - FI: {% chara_link Pubraseer %} skill tree for both 3★ and 5★.
- **Power creep** (×3): ID "the powercreep starting to get way too much (especially the newest exploration mode)"; JP: fire hero power balance is "突出して高い", and new water heroes are mostly attackers, which is unbalanced. TH: "heroes you are building probably already fall off to meta by newer heroes" (PW shard slowness).
- **Kit design** (×~6):
  - "More fun designed kits with good damage" (BR).
  - "Balance the hero kit with gameplay so no hero will be left out" (ID).
  - "Implementation of unique or more flexible skills and kits that aren't heavily restricted to a very specific niche mechanic" (US).
  - "Less dependent on premium characters for team archetypes" (US).
  - "Make more interesting 4★ kits! Sorry MQLoren you're not it (unless barrier upscale. Fix barrier pls)" (US).
  - **Shield mechanics**: "Shields being added to other shields and not rewriting them" (GB).
  - "Give the Protagonist a small buff for the sidekick skill, like giving free VP" (FI).
- **Individual buff requests**: 加强木贞 (CN, "buff {% chara_link Sadayoshi|h2 %}"), "buff Base {% chara_link Barrel|h1 %}" (PH).
- **Difficulty / rotation**:
  - "More High Difficulty stages so I have a reason to use different units" (US).
  - "More frequently changing SSS rotation" (GB), "better SSS/SS variety" (US).
  - "SSS quests were nice although they could use more variety" (US(F)).
  - Raise the 3★-and-below restriction to 4★-and-below (US).
  - Allow other / recommended formations for challenge quests (US).
- **Understanding** (×5): explain character core mechanics for new players, like the trial quests (NG); "build guide" (ID); "friend/community hero clear list" (AU "highlighted heroes for those that we own"); "recommend teams from friends/community" (VN); easier-to-understand gameplay/upgrading (US, stopped); "lineup or hero recommendations that would provide a decent synergy" (ID).

### 3.9 Progression, materials and resources

- **{% include item.html name="Parallel Quartz" %} / 平行石英 / 水晶 (farmable upgrade item, not gacha currency)**: players say the ways to get it are now slow and limited (×4: CL, TW (same text in F and I, counted once), TW, GB).
  - CL: "Infinitely grindable Parallel Quartz instead of them being locked under daily ticket quests and event rewards".
  - TW: 希望素材緩和(尤其是平行石英) (F and I).
  - TW: 平行武裝強化耗的水晶有點高 (the quartz cost of strengthening Parallel Weapon Enhancement is high).
  - GB: "better quartz farming".
- **{% include item.html name="Dream Symbol" %} / {% include item.html name="Astro Credit" %}** should be grindable instead of event rewards and monthly shop (CL).
- **7★ mats** grindable instead of the monthly shop refresh (US).
- **PW shard speed**: "it took 2 months to max one so basically you need 8 months to build 1 team" (TH).
- **Powerstones**: obtained more at once, and a ticket variant that gives a mix, e.g., "6 small, 5 medium, 3 big" (FI).
- **EXP / leveling**: CN says newcomers can't level high-star heroes to Lv.60 and so can't play hard event content. They ask for more EXP items and a higher EXP/Livo (coin) stage reward.
- **Star Shards**: remove the 4000 cap; add Gnomon and Ruchbath to the Star Shard shop (US).
- **Level cap and upgrades**:
  - Level 70 for heroes (ID, PA "ascend up to 7 stars, maximum level 70"), 開放等級上限 (HK).
  - Fourth passive slot (ID ×2).
  - **Engrave level** beyond pulling dupes (VN); older mobs permanent and with engrave levels (PH).
- **Bonds rework** (ES): sidekicks are hard to level for veterans with many characters; suggest "lvling a sidekick to 100 is enough to everyone to equip it".
- **Reset character** item that refunds upgrade materials (TW 出重置角色返還升級素材的道具).
- **Campaign quest economy** (AU): the laf-to-stamina ratio is only slightly better than regular rank-up quests, and Powerstone manuals make regular quests more cost-effective. They also ask that the "experience, social and making mad money manuals" apply to campaign free quests.
- **Material grinding** in general (US ×2, PH, VN "material farming", BR "resource improvements").

### 3.10 Endgame, content depth and new modes (~20)

- **More endgame / dungeons / replayable content** (×~8: PH ×2, BR, VE, US, MY, VN). "More replayable content is needed" (VE). "Lack of meaningful daily activities" (AR).
- **New modes** (×~8):
  - Raid boss / co-op (TH), asynchronous co-op (GB).
  - **PvP match**: MY proposes online player-vs-player with hidden character picks, level-matched, and ether as the reward (spd-based turn order makes it viable).
  - **Rogue-lite and sandbox / builder mode** like Arknights' Reclamation Algorithm (ID), Mini-game event (ID), "new game mode" (VN), 更多新玩法和模式 (MY).
  - "Arcade Mode": summarised story paragraphs with longer battle sequences (PH, stopped).
  - BR: "ARs like its predecessor or an Eidos like in AnEi" (verbatim) plus dungeons.
  - US: more events and ability awakenings.
- **More content to existing mechanics** (AU, Office, Skill Trees).

### 3.11 Account, data and region

- **Save data / account backup** (×6: TW, TH ×2, TH other, US, MA, PH). TH(stopped): "plz need save game data. I hate link save." US: "a more secure way to save data." MA: "connecting our account to email or iCloud." PH: "Google/Apple account linking." TW: 資料備份需要更靈活方便的方式.
- **China payment** (see §2.6).

### 3.12 New-player experience

- RU: "not newbie-friendly", welfare units outdated.
- US (stopped): "easier to understand gameplay/upgrading."
- CN: new players struggle to reach Lv.60.
- ID: hero build guide (also from a player who has never played).
- See also §2.2 on F2P.

---

## 4. Character: design, appearance, voice

### 4.1 Alts, variants and which characters

**Positive**

- US: "The return of 4 star hero variants is a promising sign for unpopular characters to finally get event variants, especially for female characters like {% chara_link Kirsch %} and {% chara_link Maculata %}."
- US: "The characters getting alts are fair and it seems there's enough variety that I'll log in to check things out."
- AR: "The amount of care put into the characters, their relationships, lore, and worldbuilding is one of the main reasons I continue playing."

**Negative / requests**

- **Named alt / variant requests** (grouped by character, with counts):
  - **{% chara_link Sui %}** (×4: FI ×2, US "Please give Sui an Alt in 2027", SV). **{% chara_link Borealis %}** (×2: US, SV).
  - **{% chara_link Joezen %}** second variant (US). **{% chara_link Giansar %}**, **{% chara_link Hydoor %}** second variants, **{% chara_link Theoreol %}** variant (ID).
  - **{% chara_link Hydoor|h2 %}** (US ×2).
  - **{% chara_link Anna %}, {% chara_link Sensettia %}, {% chara_link Maculata %}** (FI), also **{% chara_link Maculata %} and {% chara_link Kirsch %}** (US).
  - **{% chara_link Crowne %}, {% chara_link Exio %}, {% chara_link Rutilix %}** (SV).
  - **{% chara_link Obsidius %}** second alt as Summer or Valentine's (US).
  - **"Mechanic GirlBoss" ({% chara_link Crowne %})** alt, wanted by a day-one fan (BR).
  - **{% chara_link Thuban %} & {% chara_link Vergald %}** release (ID).
  - **{% chara_link Digram %} and {% chara_link Theoreol %}** (JP).
  - **{% chara_link Vergald %} and {% chara_link Norbrand %}**: more of them (US).
  - **{% chara_link Hisaki %}** (US), **{% chara_link Gammei %}** (US).
  - **Daddy {% chara_link Norbrand %}, {% chara_link Broker %}, {% chara_link Branch %}**: translation and story (US).
  - **{% chara_link Pubraseer %}** 3★ and 5★ skill tree (FI).
  - **{% chara_link Barrel|h1 %}** buff (PH).
  - CN: 加强贞义的大包 ("increase {% chara_link Sadayoshi %}'s bulge size")
  - VN: "More variants of my husbands" (non-specific).
- **Systemic asks**: alts for characters who don't have one yet (SE, BR day-1 characters, AR "older characters, underused characters and characters from the deeper parts of the lore" to receive stories or variants). PH (see §2.5) also notes how painful waiting for a first alt is once other characters get second ones.
- **Individual disappointment**: BR "{% chara_link Santetsu|h2 %} still disappoints" (design). "{% chara_link Roiker|h2 %} got cheated during his event... he technically has a swimwear skin now, but only on his alt unit, where most of the characters prior get them on their sidekick" (US). 沒有朱交這個遊戲可以等收了 (TW, verbatim, 朱交 = Shukou Akanaru).

### 4.2 Representation, gender and body type

- **Female / non-male 5★** (×~8). "Make one already pls" (PH, "5★ Female", "More Anthro Females, Muscular Females"). "At least 1 or 2 5★ female characters either furry or human or robot" (US). "Add some 5 star girlies like their sister game Tokyo Afterschool Summoners" (US). "Non-male SSR characters/alts" (PH nb). PA: more female characters "with elements other than just fire, water, or dark". SV: "female Wood element character". FI: "more girlypop characters and variants", waiting on Sui, Anna, Sensettia, Maculata. PH: "more women (Not really attracted to them, the designs look really pretty though)".
- **Male archetypes wanted**: muscular furry and human men (BO ×2, MY "tall, big, strong and muscular beastmen"), more furry (CN stopped 出更多furry), "more uncle character" (HK), more scalie units (PH), fatherly kind characters (TH "who genuinely cares about his family"), characters with hidden faces, helmets or cloaks (PH), "slutty looking dudes" (BO), "Add shotas like LAH" (US) versus "REMOVE KOUKI REMOVE SHOTA" (US).
- **Lewd / adult content**: TW 有色色 ("more lewd"), TW "better looking swimsuit characters".
- **LGBT+ representation** (AR): "never lose the storytelling, character writing, and LGBT+ representation that make them so distinctive". US: "one of the best LGBTQ+ gachas".
- **New elements** (×3: SV "Earth, Steel, Wind", PA "Steel and Earth"), and "more variety of roles/elements".

### 4.3 Outfits, skins and protagonist customisation

- **More outfits for characters** (×~6: US, SE "more costumes", TW 更多外觀服裝樣式, VN, MA "more outfits for the player"). TW: "swimsuit characters... don't make the 差分 too few... look at 竹本 (Takemoto)'s extreme 差分." TW also asks for **Live2D (Spine2D) versions** when the art has outfit variation.
- **Skin systems** (×3): VN skin system, **US premium skin system** (VFX/SFX change like Arknights/R1999), ID "More skins".
- **Hero accessories** "should be more than just floating items by the hero" (US).
- **Protagonist** (×~6): FI wants casual wear and a battle sprite "for the Office"; SV (×2) wants **more avatar bodies** ("Rabbit, Hyena, Lion, Coyote... male and female rabbit variants... male-looking cat and female-looking dog") and more scenes where the avatar speaks; MA wants outfits earned from events and a new unit or look for the player; FI protagonist sidekick-skill buff (§3.8).
- TH: change-expression for hero art-change feature.

### 4.4 Animation, sprites and presentation

**Positive**

- MY: "Better graphics and Ultimate skill animations like {% chara_link Roiker|h2 %}'s" (as a request for more).
- Presentation of events and fights is "more cinematic and captivating" (US, see §6).
- Visual improvements acknowledged (US, BR "improvements to QoL and presentation").
- Art quality: "fantastic art" (US).

**Negative / requests**

- **Ultimate-skill animation** (×~5: MY ×2, MA, IT, TH). IT: "Dokkan level animations for really unique skills". MA: ultimates should show an action related to the skill, not a generic attack; idle pose; TH wants faster skill animation or skip.
- **Update older sprites** (×~7: US, BR (Spine), PH ×2, BA "older animations... Parallel Flight members", PH (stopped) "older character's animations", US "from launch to 1st or 2nd Anniversary").
- **Live2D (Spine2D)** (ID, "live 2d arts characters"), **3D models** (PH, stopped), **CG art in stories** (ID), **frame-by-frame combat animation inspection** (TH), "official art of the characters" (PH, stopped), "animated PV" (PH).
- **Disabling animation to reduce lag** (US): see §3.7.

### 4.5 Voice and music

- **Voice-line subtitles** (×4: FI "Subtitles for voices", MY 遊戲內語音分頁要是實裝可閱覽的文字輔助聆聽, BR "Subtitles when playing voice lines in the Hero/Sidekick Viewing Mode since not all of them are displayed in the Home screen", PH nb "Translated subtitles for non-written dialogue like in battles or the voice playback buttons").
- **More tap-the-character dialogue** (VN: "bring more dialogue where we tap the characters").
- **No respondent commented directly on voice-acting performance or casting in these two columns.**
- **Music / OST** (positive): "I love its music" (TH), "event and main story BGMs and fights/cinematics" (US, positive; "Only up from here"), "event BGMs... much more cinematic and captivating" (US).
- **Music requests**:
  - GB: digital release of the official soundtrack.
  - PH (a detailed list): hire more composers; give songs unique names instead of "X Battle/Story/Boss Theme" (Housamo did this); release a **CD soundtrack** (excluding generic stock music); **credit the composers in-game** just like the illustrators; an animated PV with vocals ("very unlikely").
  - Custom homepage music (CN ×2).

---

## 5. Story

### 5.1 Positive

- **Story is a core reason to play** (×~6): "good story" (ID), "The stories are so good" (VE), "love its music, characters, themes... made me want to learn more about its story" (TH), "story... one of the best parts of both games" (US), "Continued effort to expand the stories" (AR).
- **Main Quest Book 2 Ch.4 was released in two parts**: "interesting to see it broken down into 2 parts. Looking forward to the next one and hopefully seeing more of {% chara_link Velgard %} and {% chara_link Norbrand %}" (US).
- **Event storytelling**: "events, stories, and battles have become more and more dynamic" (PR), "story and fights are much more cinematic" (US), **date quests are well presented** (GB), TW ("more interactive things in events").
- TW: 希望能繼續看到與英雄們的有趣互動日常 (wants to keep seeing fun daily interactions with the heroes).

### 5.2 Negative / requests

- **Event story formula is repetitive** (MY(F)): "Like it's not getting the element of surprise anymore... New/old character → flashback memory → lost hope → regain back hope → turn to a hero. I don't even have an idea to change it but hope they can make something new."
- **Segments too long** (US): both main and event story "FAR FAR too long... could be split in half or even thirds". They don't want them shortened, but broken up, so that more gem rewards are given, battles are included and the player feels more involved. They apply this to TAS too.
- **Event story should better highlight the SP character of that event** (TW).
- **Romance / date content** (×~7):
  - JP "デートクエスト或いは恋愛要素が欲しい" like 放サモ.
  - BR "Longer storylines where the player and one other character spend time together in a romantic context, like Housamo's Date Quests".
  - SV "romance system, like in Housamo".
  - PA "love system".
  - ID "dating activities!!! (choose your shipped characters... or sleep together in their residence!!!)".
  - PE "Relationship quest (stories)".
  - See also TW 想要可以更多與喜歡角色互動的玩法或關於喜歡角色的內容.
- **Character depth**: JP もっと各キャラクターの性格や背景の掘り下げが多いと嬉しいです (more exploration of each character's personality and background). PE "More side stories for characters". US(F) wants "more Link Quests next year". AR "more opportunities for older characters" (§4.1).
- **More main story** (GB "more main story", EC "Main story {% chara_link Broker %} history" verbatim, US(I) "more story").
- **Story rewards and sizing**: see the segment-split suggestion above.
- **Writing quality**: MY "Good and genuine storywriting" (request). TW 劇情改進 (no detail).
- **Skip-ability**: MY(F) "Some of the story had to skip since I'm tired of translating every dialogue."
- **Past-event state in stage-select** (TH): "every step of story should be able to see previous states, such as [Whiteout Liberation](/events/2512Whiteout/), the state of stage selecting scene should change according to selected state, not just stay as finished (Christmas tree)."
- **Arcade-mode idea** (PH, stopped): summarised story paragraphs with longer battles.

---

## 6. Event

### 6.1 Positive (~25)

- **Interactive maps in [Whiteout Liberation](/events/2512Whiteout/) and [Summer Montage Halation](/events/2607Montage/)** (×~9: BR, CL, FI, GB, US, ID, TW "活動中能互動的玩法變多了", AU, CN). "'Whiteout liberation' has the best representation of event so far" (BR). "The map... is a nice touch" (FI). "Interactive 'maps'... are really fun" (CL). GB: "wish for more pixel art like was in whiteout liberation".
- **Summer Montage Halation extras**: boss with different difficulties and cards that serve as extra character content (BR, US(F), GB "the event baseball cards and how the date quests were presented").
- **Overall rising effort** (×~8): "I appreciate the increasing amount of effort that events like Summer Montage Halation got" (US), "the effort put into event visuals" (US), 活动的表现形式明显的在变得更多样化和丰富 (CN), "love when they add different things to events to bring them more to life, makes them more memorable" (BR), "Smoke & Mirrors and Whiteout Liberation were some of my favourite quests so far" (MY), "creative event mission selection" (ID).
- **Event gameplay**: "I liked how they handle the game play in Whiteout Liberation, and the feature they added in Summer Montage... was also interesting to get me back to play the game more. If they did that more often, I'd get back to the game" (AU). SSS quests (US). "Autumn Campaign" favourite (US).
- **Event BGM and story** (US). **More frequent log-in bonuses during events** (US, see §2.1).

### 6.2 Negative / requests

- **Box-format events** (×6: MY(F), RU, JP, TW, GB, plus the MY "I put it 3 star"). Terms: **[Echoes of frontier memories](/events/2604Frontier/) / 殘響** (half-anni event).
  - MY: "The pulling method event, 'accessory' exchange doesn't make it any better... Good thing they remove it. I put it 3 star because I used all my ether but didn't get Andrew and Huckle."
  - RU: "unboxing event was badly implemented (same rewards as the usual shop but w/o ability to choose what you get, inability to reset the box), devs seem to misunderstand how this type of event is supposed to function."
  - JP: ボックス仕様のイベントだけ、少し不満でした。他の変更は、全て良いものです。
  - TW: 殘響的活動道具兌換方式 (negative).
  - GB: "hope future event boxes... get improved because I don't dislike the concept."
- **Lottery event tedium** (US): "If they make another lottery event, make it less tedious." TW: 希望可以有戳戳樂 (wants a lottery-style event, 戳戳樂).
- **Cadence** (×~7).
  - "Super boring having events run for a whole month at a time... nothing to do aside from logging in" (US). Suggestions: **reruns simultaneously with new events** and **event-themed dungeon runs**.
  - TW: 活動時間通常約1個月，而且瘋狂復刻劇情活動，久久才一次新的，實在太慢.
  - "Faster Content Schedule" (SE), "TOO MANY REPRINTS. Usually only new content every 2 months" (SE).
  - "more events, more currency, more banners, more story" (US), "More events and more ability awakenings" (US).
- **Event structure and mechanics**:
  - "More variety of mechanics in the event boss fights, not just attack until they die. I like the ones with multiple rounds with puzzle/mechanic (e.g., use a certain amount of VP)" (ID).
  - "Hopefully more unique map background for events" (ID).
  - "Less mob-focused events" (US).
  - "Event office background and BGM permanent in some way, maybe after rerun" (PH).
  - **Event title "new" badge** (TW, §3.5).
  - "I have no real motivation to pull... the only reason an event gets ranked low is because I don't really care about the characters who show up" (US, so event rating is character-driven).
  - **Rerun events** need translation (§1.2C).
  - CN: the event entrance is oversized and hides the main story entrance (§3.6).

---

## 7. Other

### 7.1 General sentiment

- **Positive** (×~12): "Amazing" (VN), 都很好 (TW), "It has undergone very good changes to date" (SV), "Recent changes have improved the game experience" (SV), "The game is getting better" (ID, BO), "I honestly have a lot of love for both of these games" (AR), "I've enjoyed seeing Live A Hero continue" (MX), "Its a good changes and a good try on new method. Also glad they actually listen to the players feedback" (MY(F)). "Improvements to QoL and presentation were taken slowly but surely... hope this pace can be kept" (BR).
- **Concerns about the game's trajectory**: CL: "I still feel like the quality stalled the past years... almost like they had given up trying to make this game as popular as Housamo." TH: "That's why there are low players." US: "needs good advertisement for the game or a short animation" (promotion).
- **Benchmarks players use**: Housamo/TAS (data, UI, romance, shop, auto-story, rewards, female 5★), Eidos/龍脈 (the only gacha worse, full translation), Project Sekai (currency), Arknights, R1999, ZZZ ("wish this game became similar to Zenless Zone Zero... but alas the devs... don't have mihoyo's budget"), Dokkan (animations).
- **Emotional notes**: TH says the game made them "dream bigger", with a goal to someday design a character for it. AR thanks the team. TH: "kind, fatherly characters make me feel safe and comforted" (§4.2).

### 7.2 What players who have stopped wrote (about a dozen)

- **Gacha / economy**: "MUCH better Gacha Rates, Skip Tickets, Something more to do w/ Ally Points, Lowered Stone Prices" (US); "Better gatcha pulls, easier to understand gameplay/upgrading" (US); "Better ways to obtain more Ether crystals and some pity system" (MX); "Endgame that has a cycle of reset... more way to gain gems" (VN).
- **Account/technical**: "need save game data. I hate link save" (TH); loading and no-skip (TW); daily 0/3 mission annoyance (PL).
- **Content**: variety/challenge, official art (PH), "3D models" and "Arcade Mode" (PH), older character animations (PH), material farming and translation (VN), "出更多furry" (CN).

### 7.3 Items that don't fit elsewhere

- **Housamo-specific** (not LAH): story **AUTO button** and, for LAH, a **login calendar / history** and **player information and statistics page** (AR).
- ES: "Less redundant text" (verbatim; context unclear).
- GB(F): "Change Simulator to Monthly" (verbatim; context unclear, see §2.2).
- TW: 沒有朱交這個遊戲可以等收了 (verbatim; context unclear).
- CN (verbatim): 加强贞义的大包 (§3.8).
- JP: the preview-then-release timing request (§2.5).

---

## Appendix: How big is each theme (respondents)

| Theme | ≈ N | Where |
|---|---|---|
| Translation (any) | 95 | §1 |
| of which "faster / more" | 60 | §1.2A |
| of which untranslated coverage gaps | 25 | §1.2C |
| of which quality / UI fit | 15 | §1.2D |
| Pull economy / pity (any) | 85 | §2 |
| of which more free currency | 65 | §2.2 |
| of which pity / spark / rates | 40 | §2.3 |
| QoL / auto / sales (positive) | 40 | §3.1 |
| Skill trees / old-character buffs | 25 | §3.8 |
| Events (any) | 35 | §6 |
| Alts and named character requests | 20 | §4.1 |
| Representation (female 5★ / body types) | 20 | §4.2 |
| Endgame and new modes | 20 | §3.10 |
| Romance / date content | 7 | §5.2 |
| Account / data backup | 6 | §3.11 |

Counts overlap, because one respondent can appear in several rows.

# Afterword

I hope this report brings more insight about the game, and makes you feel that filling up the survey was worth it.

This survey and its report took me a lot of effort to prepare, but unfortunately the number of respondents are not that great, so the result is less representative. I initially promised to publish this report by the end of October, and I missed that deadline by more than a week. This was partly due to lower motivation, working on other wiki improvements and just the energy drain from my day job...

Housamo's anniversary celebration was brought forward by a few weeks, so I didn't even have time to prepare survey for *that game* before its anniversary. If I decide to still go about doing it this year, I guess I would have to shrink the survey size by a lot.

The survey also asked about wiki usage, feature and feedback, but I have decided to move their results into a future blog post where talk about some behind the scene of this wiki's development.

Thank you for reading till this far, see you at another time!

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
