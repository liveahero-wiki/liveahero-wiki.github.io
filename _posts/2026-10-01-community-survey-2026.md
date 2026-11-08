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
  - Both games have simultaneous official translation release. Such popularity gap between region exists despite no language barrier is quite interesting.
- **Tamacolle**
  - Surprisingly, Taiwan respondents has higher percentage of respondents still playing this game thant Japanese respondents, but it is likely just because the number of Japanese respondents is too low.

## English Wiki

{% include survey-chart.html id="wiki_usage" %}

{% include survey-chart.html id="wiki_new_feature" %}

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
| 1 | Pubraseer | 65.3% | 65.4% | +0 |
| 2 | Barrel | 59.1% | 47.5% | +3 |
| 3 | Monomasa | 53.3% | 53.5% | -1 |
| 4 | Ryekie | 51.4% | 48.5% | +0 |
| 5 | Sterio | 49.4% | 40.8% | +6 |
| 6 | Giansar | 47.9% | 49.5% | -3 |
| 7 | Norbrand | 44.7% | new | new |
| 8 | Toshu | 43.2% | 42.6% | +0 |
| 9 | Denebora | 42.4% | 31.7% | +10 |
| 10 | Tsuneaki | 41.9% | 47.0% | -4 |
| 11 | Valoray | 41.2% | 38.3% | +2 |
| 11 | reXer | 41.2% | 41.9% | -2 |
| 13 | Obsidius | 40.2% | 43.5% | -6 |
| 14 | Akashi | 37.7% | 41.4% | -4 |
| 15 | Sadayoshi | 37.5% | 38.9% | -3 |
| 16 | Astar | 36.7% | 37.8% | -2 |
| 16 | Yohack | 36.7% | 37.2% | -1 |
| 18 | Mokdai | 36.0% | 30.9% | +4 |
| 19 | Ruchbath | 35.5% | new | new |
| 20 | Astosis | 35.2% | 32.9% | -3 |
| 21 | Huckle | 34.5% | 25.7% | +6 |
| 22 | Galvo | 33.5% | 35.9% | -6 |
| 22 | Thuban | 33.5% | new | new |
| 24 | Gnomon | 32.8% | 27.5% | +0 |
| 25 | ⇌Akashi | 32.3% | new | new |

## All favourites: biggest approval changes 2025 -> 2026

| character | change (pp) | 2025 | 2026 | rank then -> now |
|---|---|---|---|---|
| Roiker | +13.2 | 17.6% | 30.8% | 48 -> 28 |
| Barrel | +11.6 | 47.5% | 59.1% | 5 -> 2 |
| Denebora | +10.7 | 31.7% | 42.4% | 19 -> 9 |
| Huckle | +8.8 | 25.7% | 34.5% | 27 -> 21 |
| Sterio | +8.6 | 40.8% | 49.4% | 11 -> 5 |
| Procy | +6.4 | 14.4% | 20.8% | 56 -> 49 |
| Senthak | +6.0 | 18.3% | 24.3% | 46 -> 39 |
| Taika | +5.5 | 21.8% | 27.3% | 39 -> 33 |
| Gnomon | +5.2 | 27.5% | 32.8% | 24 -> 24 |
| Mokdai | +5.1 | 30.9% | 36.0% | 22 -> 18 |
| Kiloc | -7.5 | 24.8% | 17.4% | 30 -> 58 |
| Gammei | -7.1 | 31.4% | 24.3% | 21 -> 39 |
| Antares | -6.0 | 14.4% | 8.4% | 56 -> 100 |
| Lilac | -5.5 | 29.9% | 24.3% | 23 -> 39 |
| Tsuneaki | -5.0 | 47.0% | 41.9% | 6 -> 10 |
| Shiratori | -5.0 | 17.6% | 12.7% | 48 -> 80 |
| Shaft | -4.8 | 20.5% | 15.6% | 41 -> 66 |
| Houley | -4.5 | 14.4% | 9.9% | 56 -> 89 |
| Seiichiro | -4.5 | 13.4% | 8.9% | 66 -> 99 |
| Polaris Mask | -4.0 | 23.8% | 19.9% | 32 -> 51 |

## Top 10: global top 25 (2026, n=403)

| rank | character | approval | 2025 | rank change |
|---|---|---|---|---|
| 1 | Pubraseer | 44.9% | 49.2% | +0 |
| 2 | Barrel | 36.5% | 28.5% | +2 |
| 3 | Monomasa | 32.3% | 37.9% | -1 |
| 4 | Giansar | 28.8% | 32.2% | -1 |
| 5 | Sterio | 27.5% | 18.0% | +7 |
| 6 | Ryekie | 23.8% | 26.0% | -1 |
| 7 | Obsidius | 22.1% | 24.3% | -1 |
| 8 | Tsuneaki | 20.8% | 22.8% | +2 |
| 9 | Norbrand | 19.9% | new | new |
| 10 | Sadayoshi | 19.1% | 24.3% | -4 |
| 11 | Astar | 18.6% | 16.4% | +5 |
| 12 | Akashi | 18.1% | 24.0% | -4 |
| 13 | Denebora | 17.9% | 11.7% | +9 |
| 13 | Ruchbath | 17.9% | new | new |
| 15 | reXer | 17.6% | 23.5% | -6 |
| 16 | Yohack | 15.9% | 16.8% | -3 |
| 17 | Toshu | 15.4% | 19.3% | -6 |
| 18 | Astosis | 14.9% | 12.2% | +3 |
| 19 | Valoray | 13.9% | 14.4% | -2 |
| 20 | Mokdai | 13.2% | 13.4% | -1 |
| 21 | Huckle | 12.4% | 10.2% | +4 |
| 22 | Roiker | 12.2% | 5.7% | +24 |
| 23 | Gammei | 11.7% | 16.6% | -8 |
| 24 | ⇌Akashi | 11.4% | new | new |
| 25 | Viscunam | 10.7% | 7.9% | +9 |

## Top 10: biggest approval changes 2025 -> 2026

| character | change (pp) | 2025 | 2026 | rank then -> now |
|---|---|---|---|---|
| Sterio | +9.6 | 18.0% | 27.5% | 12 -> 5 |
| Barrel | +8.0 | 28.5% | 36.5% | 4 -> 2 |
| Roiker | +6.5 | 5.7% | 12.2% | 46 -> 22 |
| Denebora | +6.1 | 11.7% | 17.9% | 22 -> 13 |
| Gnomon | +3.1 | 6.4% | 9.4% | 43 -> 31 |
| Viscunam | +2.8 | 7.9% | 10.7% | 34 -> 25 |
| Taika | +2.7 | 7.2% | 9.9% | 38 -> 28 |
| Astosis | +2.6 | 12.2% | 14.9% | 21 -> 18 |
| Sui | +2.5 | 2.0% | 4.5% | 82 -> 64 |
| Senthak | +2.4 | 4.0% | 6.5% | 58 -> 46 |
| Lilac | -7.1 | 16.8% | 9.7% | 13 -> 29 |
| Kiloc | -6.6 | 9.1% | 2.5% | 31 -> 83 |
| Akashi | -5.9 | 24.0% | 18.1% | 8 -> 12 |
| reXer | -5.9 | 23.5% | 17.6% | 9 -> 15 |
| Monomasa | -5.7 | 37.9% | 32.3% | 2 -> 3 |
| Galvo | -5.6 | 13.8% | 8.2% | 18 -> 33 |
| Sadayoshi | -5.2 | 24.3% | 19.1% | 6 -> 10 |
| Gammei | -4.9 | 16.6% | 11.7% | 15 -> 23 |
| Polaris Mask | -4.8 | 9.7% | 5.0% | 26 -> 56 |
| Exio | -4.4 | 10.4% | 6.0% | 24 -> 49 |

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

# Free form questions

<!-- TODO: summarise analysis/out/lah2026/free_text.md (stop reasons, feedback, improvement, wiki feedback). Quote nothing that identifies a respondent. -->

# Afterword

<!-- TODO -->

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
