---
title: Community Survey Result 2025
date: 2025-10-01 12:00:00 +08
---

<style>
.comment {
  color: blue;
}
</style>

> This article is very long and contain a few visualizations. Some interactive charts do not work well in small screen size.
>
> For better reading experience, please read this article in wider screen.

* unordered
{:toc}


# Foreword

We have achieved **596** responses in this year’s survey, slightly less than last year's survey.

Thank you to those who have helped me spread the word on various social media platforms!

This is the first time I have coded up an entire survey platform from scratch:

- No longer depends on Google Form, so China users can see the survey without using VPN
- More custom question types that are not available with Google Form (e.g. character ranking question, copying answers between questions)
- More data points to detect possible duplicate/spam responses

Special thanks to 無理 for helping to check Japanese translation in the survey.

## Disclaimer on Limitation of the Survey

The demographics percentage of this year's respondents is very different from past few years, in that the percentage of East Asians became more than half of the total respondents, and the absolute number of non East-Asian respondents also have decreased.
This means that many "2024 vs 2025" comparsions do not really tell if there is a sentiment change for the same group of people, because the underlying group of respondents are quite different. Take the comparison with a pinch of salt.

Despite trying my best to make the survey more user-friendly to Japanese and some Japanese Twitter/BlueSky users helping to repost the survey, we still failed to attract enough Japanese respondents.
This is also the first time I tried to publish the survey in Wikiwiki/Zawazawa. Although that did attract a few more Japanese respondents, I also received a lot of negative comments and downvotes from those anonymous users (ironically, I was the only forum user that uses an actual user name instead of just posting anonymously).
I have ran this survey for 5 years, and this is the first time I received such hostility.

I do not know if "Japanese people who were willing to participate in this survey" and "Japanese people who were very against to this survey" do not also have very different opinions about the questions of this survey, so all the Japan results below cannot meaningfully represent the overall Japan playerbase.

I understand that some people do not want to see the popularity poll result as there might be jerks who would cherry pick any data and twist it to fit their narrative.
So let me get this straight:

1. "Some characters being more popular than others" is a fact that everyone can observe through many other ways, such as "engagement count on LifeWonders' official posts/videos", "the number of fan arts" and so on. Even without this popularity poll, people who would cherry pick any data and twist it to fit their narrative always exist. The survey result should not increase the number of such people.
1. I have ran this survey for many years. While I can't say that everyone acted civil after the result publication, but I have not witnessed such discourse escalated too much, because most groups and servers already have rules to control insults and hate speech.
1. For those people who twist the result of popularity poll for their nown arrative, I am sure these people do other Karen stuffs in other time too. So the general online advise applies: if the person is being too annoying, just block them and move on with your life.


# Respondent Profile

## Source of respondents

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Discord", "value": 140}, {"name": "X (Twitter)", "value": 91}, {"name": "English wiki / 英語版wiki", "value": 90}, {"name": "巴哈姆特 (Taiwan)", "value": 88}, {"name": "Weibo 微博", "value": 41}, {"name": "Reddit", "value": 38}, {"name": "Tencent QQ", "value": 26}, {"name": "Youtube", "value": 26}, {"name": "BlueSky", "value": 24}, {"name": "other", "value": 11}, {"name": "Facebook", "value": 10}, {"name": "Zawazawa", "value": 8}, {"name": "Bilibili", "value": 3}]}]}'
  title="Source of Respondents" %}

Majority of the respondents found the survey via Discord (23.49%). Taiwan Bahamut Forum, Twitter/X and English Wiki each take approximately 15%.

## Age

{% include figure-image.html path="/assets/img/survey-2025/age.jpg"
  title="Age of Respondents" %}

Since this is a mobile gacha game, it is no surprise that the age distribution is skewed towards the younger side.

At this point, the oldest respondent (55 year old) can be the youngest respondent’s grandfather... (15 years old)

{% include figure-image.html path="/assets/img/survey-2025/age-other.jpg"
  title="Age of Respondents" %}

## Gender

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Male / 男性", "value": 529}, {"name": "Female / 女性", "value": 31}, {"name": "Other / 其他 / その他", "value": 22}, {"name": "Non-binary / 非二元性別 / ノンバイナリー", "value": 14}]}]}'
  title="Gender" %}

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Cisgender / 順性別 / シスジェンダー", "value": 575}, {"name": "Transgender / 跨性別 / トランスジェンダー", "value": 21}]}]}'
  title="Cisgender vs Transgender" %}

11.24% of the respondents are non-male (up from 7.5% last year) and 3.52% are transgender (lower than last year)

### Female/Non-Binary/Other Respondents and Where to Find them

{% include figure-image.html path="/assets/img/survey-2025/other-gender-country.jpg"
  title="Countries of Female/Non-Binary/Other Respondents" %}

- A lot of the female respondents for this survey come from Japan.

## Country

Top 3 countries are Taiwan, China and Japan

Transparency report:

- One person from "Christmas Island" uses USA ip address
- One person from "Sierra Leone" uses Malaysia ip address
- Many people from "China" use ip address from various other countries, but that is kind of expected since China has the Great Firewall so many China people use VPN. Some might have already migrated to other countries permanently

It is clear that East Asia is the most important market for the game (being culturally close to Japan), followed by Southeast Asia and North America.

<table class="bordered">
  <tr>
    <th>Region</th>
    <th>Country of birth / 出身国</th>
    <th>Count</th>
    <th>Percentage</th>
  </tr>
  <tr>
    <td rowspan="6">East Asia<br>314 (52.68%)</td>
    <td>Taiwan</td>
    <td>118</td>
    <td>19.80%</td>
  </tr>
  <tr>
    <td>China</td>
    <td>90</td>
    <td>15.10%</td>
  </tr>
  <tr>
    <td>Japan</td>
    <td>85</td>
    <td>14.26%</td>
  </tr>
  <tr>
    <td>Hong Kong</td>
    <td>16</td>
    <td>2.68%</td>
  </tr>
  <tr>
    <td>Korea, South</td>
    <td>3</td>
    <td>0.50%</td>
  </tr>
  <tr>
    <td>Macau</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td rowspan="7">Southeastern Asia<br>110 (18.46%)</td>
    <td>Indonesia</td>
    <td>28</td>
    <td>4.70%</td>
  </tr>
  <tr>
    <td>Vietnam</td>
    <td>26</td>
    <td>4.36%</td>
  </tr>
  <tr>
    <td>Thailand</td>
    <td>20</td>
    <td>3.36%</td>
  </tr>
  <tr>
    <td>Malaysia</td>
    <td>18</td>
    <td>3.02%</td>
  </tr>
  <tr>
    <td>Philippines</td>
    <td>13</td>
    <td>2.18%</td>
  </tr>
  <tr>
    <td>Singapore</td>
    <td>4</td>
    <td>0.67%</td>
  </tr>
  <tr>
    <td>Brunei</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="6">North America<br>88 (14.77%)</td>
    <td>United States</td>
    <td>71</td>
    <td>11.91%</td>
  </tr>
  <tr>
    <td>Mexico</td>
    <td>8</td>
    <td>1.34%</td>
  </tr>
  <tr>
    <td>Canada</td>
    <td>4</td>
    <td>0.67%</td>
  </tr>
  <tr>
    <td>Puerto Rico</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>El Salvador</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>Costa Rica</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="18">Europe<br>44 (7.38%)</td>
    <td>Russia</td>
    <td>6</td>
    <td>1.01%</td>
  </tr>
  <tr>
    <td>Italy</td>
    <td>5</td>
    <td>0.84%</td>
  </tr>
  <tr>
    <td>Germany</td>
    <td>5</td>
    <td>0.84%</td>
  </tr>
  <tr>
    <td>Spain</td>
    <td>4</td>
    <td>0.67%</td>
  </tr>
  <tr>
    <td>France</td>
    <td>4</td>
    <td>0.67%</td>
  </tr>
  <tr>
    <td>United Kingdom</td>
    <td>3</td>
    <td>0.50%</td>
  </tr>
  <tr>
    <td>Finland</td>
    <td>3</td>
    <td>0.50%</td>
  </tr>
  <tr>
    <td>Romania</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>Czech Republic</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>Belgium</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>Portugal</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Poland</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Norway</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Netherlands</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Denmark</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Cyprus</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Belarus</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Andorra</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="7">South America<br>29 (4.87%)</td>
    <td>Brazil</td>
    <td>13</td>
    <td>2.18%</td>
  </tr>
  <tr>
    <td>Chile</td>
    <td>6</td>
    <td>1.01%</td>
  </tr>
  <tr>
    <td>Venezuela</td>
    <td>5</td>
    <td>0.84%</td>
  </tr>
  <tr>
    <td>Ecuador</td>
    <td>2</td>
    <td>0.34%</td>
  </tr>
  <tr>
    <td>Uruguay</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Paraguay</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Argentina</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="3">Oceania<br>7 (1.17%)</td>
    <td>Australia</td>
    <td>5</td>
    <td>0.84%</td>
  </tr>
  <tr>
    <td>French Polynesia</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Christmas Island</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="2">Western Asia<br>2 (0.34%)</td>
    <td>Turkey</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Iran</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td rowspan="2">Africa<br>2 (0.34%)</td>
    <td>Sierra Leone</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
  <tr>
    <td>Morocco</td>
    <td>1</td>
    <td>0.17%</td>
  </tr>
</table>

I think the most surprising fact to me is how many more Taiwan respondents I have gotten after translating the survey to Chinese.

Despite the largest expected player base of this game being Japan, this survey still was not able to capture the same proportion of Japanese players (only 22). I just don’t know where these Japanese people are lurking.

China should also be a pretty big player base of this game, but because the survey was conducted via Google Forms, people living in China cannot access Google websites unless they use VPN. It does not mean that there are very few China LAH players.

## Japanese proficiency

{% include apache-chart.html
  options='{"legend": {"data": ["N1", "N2", "N3", "N4", "N5", "Zero knowledge / 完全不会 / 知識ゼロ"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "N1", "value": 106}, {"name": "N2", "value": 13}, {"name": "N3", "value": 15}, {"name": "N4", "value": 35}, {"name": "N5", "value": 93}, {"name": "Zero knowledge / 完全不会 / 知識ゼロ", "value": 334}]}]}'
  title="Japanese Language Reading Proficiency" %}

- 56.04% of the respondents cannot read Japanese at all.
- 106 respondents has N1-level reading ability (17.79%). If excluding Japanese people, only 21 respondents have N1-level reading ability (3.52%)
- I estimate that you need at least N3 to be able to rea the in-game Japanese story comfortably, only
  22.48% of the respondents fit in this category.

# The Game

## Actual Player

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Still playing / 还在玩 / 今もやってる", "value": 516}, {"name": "Has stopped playing / 已弃坑 / 辞めた", "value": 49}, {"name": "Heard of but never play / 听过但没玩过 / やったことない", "value": 31}]}]}'
  title="Do you play Live A Hero?" %}

- 86.58% of the respondents are still playing the game
- Usually people who do not play the game or has abandoned the game are naturally less likely to spend time filling up this survey, so the pie chart just tell you how much votes you might want to exclude when reading other data of this survey if you only care about the voices of those who currently still play the game

## Stop Reason

Among the respondents who has played the game but now has stopped playing, these are the reasons:

- No translation
- Lost interest/motivation
- Battle system is too complicated / unfamiliar with game mechanics
- Quit becasue respondent cannot pull the character they want
- Too little (free) pull currency
- Boring/monotonous grinding, no skip ticket, not enough reward
- Nothing to do after upgrading favourite character(s)
- Phone storage shortage
- Respondent also play other gacha games, no time to keep Live A Hero
- No NSFW element

## Platform

{% include figure-image.html path="/assets/img/survey-2025/lah_survey_venn_chart.svg"
  title="Which platform(s) Players Use to Play Live A Hero" %}

Majority of the respondents use Android to play the game. Quite a few people use multiple platforms to play the game.

## Playing Time

{% include figure-image.html path="/assets/img/survey-2025/play-lah-time.jpg"
  title="How Long Have Live A Hero Players Been Playing the Game?" %}

X-axis is the number of days played (end date is set to 30 Sep 2024). Slightly less than half of the respondents started playing Live A Hero immediately after the game’s launch. Since then, the player base seems to be growing at a linear scale.

There are small bumps near every 360 days, likely due to the anniversary bringing more players than other times of the year.

The bump at "last 720 days" is quite steep, which is roughly when 3rd anniversary happened. I suspect that there might be a lot of oversea players trying out the game when LifeWonders announced that they were working on official translation.

## Main Character Configuration

{% include apache-chart.html
  options='{"legend": {"data": ["1", "2", "3", "4"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "1", "value": 213}, {"name": "2", "value": 49}, {"name": "3", "value": 234}, {"name": "4", "value": 20}]}]}'
  title="Main character body type" %}

- Refresher:
  - Type 1: <img width="64" height="64" src="/cdn/Sprite/icon_player1_s01.png" loading="lazy">
  - Type 2: <img width="64" height="64" src="/cdn/Sprite/icon_player2_s01.png" loading="lazy">
  - Type 3: <img width="64" height="64" src="/cdn/Sprite/icon_player3_s01.png" loading="lazy">
  - Type 4: <img width="64" height="64" src="/cdn/Sprite/icon_player4_s01.png" loading="lazy">

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "1 (Hiroki Goto 後藤ヒロキ)", "value": 229}, {"name": "2 (Iwanaga Yuhei 岩永悠平)", "value": 127}, {"name": "3 (Yu Amano 天野ユウ)", "value": 87}, {"name": "4 (Yui Toita 戸板優衣)", "value": 49}, {"name": "5 (Orie Kimoto 樹元オリエ)", "value": 24}]}]}'
  title="Main character voice" %}

Hiroki Goto (first male voice) took nearly 50% of the male voice’s market, the other two are about 25% each. For female voice, Yui Toita is slightly more popular than Orie Kimoto.

Since Hiroki Goto and Yui Toita are the first male/female voice **in the order listed by the game**, I think many users choose them partly due to the [default effect](https://en.wikipedia.org/wiki/Default_effect).

<div class="table-scroll">
<table class="bordered">
  <tr>
    <th colspan="2"></th>
    <th colspan="5">Which MC body type did you choose?<br>您选择的主角体型？<br>あなたが選んだ主人公の体型は？</th>
  </tr>
  <tr>
    <th>What gender do you identify as?<br>您的性别？<br>あなたの性別は？</th>
    <th>Are you Cisgender or Transgender?<br>您是順性別还是跨性別？<br>あなたはシスジェンダーですか、それともトランスジェンダーですか？</th>
    <th>1</th>
    <th>2</th>
    <th>3</th>
    <th>4</th>
    <th>Grand Total</th>
  </tr>
  <tr>
    <td rowspan="2">Male / 男性</td>
    <td>Cisgender / 順性別 / シスジェンダー</td>
    <td>205</td>
    <td>20</td>
    <td>211</td>
    <td>12</td>
    <td>448</td>
  </tr>
  <tr>
    <td>Transgender / 跨性別 / トランスジェンダー</td>
    <td>1</td>
    <td>2</td>
    <td>4</td>
    <td></td>
    <td>7</td>
  </tr>
  <tr>
    <td rowspan="2">Female / 女性</td>
    <td>Cisgender / 順性別 / シスジェンダー</td>
    <td>2</td>
    <td>18</td>
    <td>1</td>
    <td>5</td>
    <td>26</td>
  </tr>
  <tr>
    <td>Transgender / 跨性別 / トランスジェンダー</td>
    <td></td>
    <td></td>
    <td>1</td>
    <td></td>
    <td>1</td>
  </tr>
  <tr>
    <td rowspan="2">Non-binary / 非二元性別 / ノンバイナリー</td>
    <td>Cisgender / 順性別 / シスジェンダー</td>
    <td>1</td>
    <td>1</td>
    <td>5</td>
    <td></td>
    <td>7</td>
  </tr>
  <tr>
    <td>Transgender / 跨性別 / トランスジェンダー</td>
    <td>2</td>
    <td></td>
    <td>2</td>
    <td>2</td>
    <td>6</td>
  </tr>
  <tr>
    <td rowspan="2">Other / 其他 / その他</td>
    <td>Cisgender / 順性別 / シスジェンダー</td>
    <td>2</td>
    <td>6</td>
    <td>8</td>
    <td>1</td>
    <td>17</td>
  </tr>
  <tr>
    <td>Transgender / 跨性別 / トランスジェンダー</td>
    <td></td>
    <td>2</td>
    <td>2</td>
    <td></td>
    <td>4</td>
  </tr>
  <tr>
    <td>Grand Total</td>
    <td></td>
    <td>213</td>
    <td>49</td>
    <td>234</td>
    <td>20</td>
    <td>516</td>
  </tr>
</table>
</div>

Interesting points:

- Female respondents (cis and trans) mostly only choose human body types.
- There are cis-male respondents who choose female body types (straight players?!).

## Money spending

{% include apache-chart.html
  options='{"dataset": [{"source": [["In App Purchase Item", "All time", "Last 12 months only"], ["Regular paid stones\n非特价石头\n通常の有償石", 57, 44], ["Anniversary stone pack\n周年礼包\n周年記念パック", 148, 97], ["Event limited stone pack (large)\n活動限定礼包 （大）/ イベント限定エーテル晶石パック（大）", 153, 128], ["Anniversary Hero selection pack\n周年英雄选定礼包\n周年ヒーロー指名パック", 163, 137], ["10 stones for the 4th sales slot\n第4個营業所需的十石\n4番目の营業枠に有償エーテル晶石10個", 174, 138], ["New year grab bag\n新年福袋", 186, 168], ["Event limited stone pack (small)\n活動限定礼包（小）\nイベント限定エーテル晶石パック（小）", 193, 183], ["Not at all\n无课金\n無課金", 212, 212]]}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {}, "label": {}, "tooltip": {}, "series": [{"type": "bar"}, {"type": "bar"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="In-App Purchase (All time vs Last 12 months only)" %}

- It seems that more respondents bought "New Year Grab Bag" than "Anniversary Hero Selection Pack". One possible explanation is the respondents value the chance of getting random limited 5 star to be higher than the chance of getting a specific permanent 5 star.
- Anniversary stone pack has the biggest decrease in popularity

To help make other visualizations easier to understand, we will introduce the concept of **Spending Level** here.

### Definition of Spending level

|Grade|Description|
|-|-|
|XL| Those who had bought regular paid Ether gem (more expensive) |
|L| Those who had bought the event-limited Ether Gem pack (large) |
|M| Those who had bought the event-limited Ether Gem pack (small) |
|S| Only bought the Anniversary pack and/or New Year Grab Bag (i.e. spent only once or twice a year) |
|XS| Only bought the ten paid stones for fourth Sales slot |
|Zero| Never spent money in this game |

The criteria for each spending level isn't completely accurate as we don't count how often people buy each product, but it is enough to get a sense of the general trend.

{% include apache-chart.html
  options='{"legend": {"data": ["XL", "L", "M", "S", "XS", "Zero"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "XL", "value": 57}, {"name": "L", "value": 106}, {"name": "M", "value": 53}, {"name": "S", "value": 75}, {"name": "XS", "value": 93}, {"name": "Zero", "value": 212}], "color": ["#6c2b6d", "#8f3371", "#b13c6c", "#d14a61", "#e3685c", "#e98d6b"]}]}'
  title="How Many Live A Hero Player Spend Money In-game?" %}

More than 50% of the players actually spend at least some amount of money in Live A Hero. Completely free-to-play players are less than what I originally thought.

{% include figure-image.html path="/assets/img/survey-2025/spending-region.jpg"
  title="How Many Live A Hero Player Spend Money In-game? (by Region)" %}

{% include figure-image.html path="/assets/img/survey-2025/spending-east-asia.jpg"
  title="How Many Live A Hero Player Spend Money In-game? (East Asia)" %}

- East Asia has the highest percentage of Live A Hero players that spend money in-game
- Other developed economies like United States and Europe also have high percentage of paying players.
  - If the game has official translation, it will surely bring a lot more paying players from these markets

{% include figure-image.html path="/assets/img/survey-2025/spending-gender.jpg"
  title="How Many Live A Hero Player Spend Money In-game? (by Gender)" %}

Although the percentage of female respondents is much lower than male respondents, they spend nearly as much as male respondents

## Gameplay Style

{% include apache-chart.html
  aspectRatio="1.2"
  options='{"dataset": [{"source": [["gender", "login", "value"], ["Other\n其他\nその他", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 2], ["Other\n其他\nその他", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 10], ["Other\n其他\nその他", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 3], ["Other\n其他\nその他", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 1], ["Other\n其他\nその他", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["Other\n其他\nその他", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Other\n其他\nその他", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 4], ["Non-binary\n非二元性別\nノンバイナリー", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 1], ["Non-binary\n非二元性別\nノンバイナリー", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 4], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 6], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 0], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 1], ["Male\n男性", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 113], ["Male\n男性", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 143], ["Male\n男性", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 117], ["Male\n男性", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 29], ["Male\n男性", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 21], ["Male\n男性", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 6], ["Male\n男性", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 26], ["Female\n女性", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 5], ["Female\n女性", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 11], ["Female\n女性", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 5], ["Female\n女性", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 2], ["Female\n女性", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["Female\n女性", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Female\n女性", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2]]}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Male\n男性"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Female\n女性"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Non-binary\n非二元性別\nノンバイナリー"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Other\n其他\nその他"}}}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {"data": ["Male\n男性", "Female\n女性", "Non-binary\n非二元性別\nノンバイナリー", "Other\n其他\nその他"]}, "label": {}, "tooltip": {}, "series": [{"name": "Male\n男性", "type": "bar", "datasetIndex": 1, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Female\n女性", "type": "bar", "datasetIndex": 2, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Non-binary\n非二元性別\nノンバイナリー", "type": "bar", "datasetIndex": 3, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Other\n其他\nその他", "type": "bar", "datasetIndex": 4, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="\"How Live A Hero Players Play the Game\" against \"Gender\"" %}

{% include apache-chart.html
  aspectRatio="1.2"
  options='{"dataset": [{"source": [["paying", "login", "value"], ["Zero", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 36], ["Zero", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 66], ["Zero", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 60], ["Zero", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 18], ["Zero", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 7], ["Zero", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 4], ["Zero", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 21], ["XS", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 3], ["XS", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 3], ["XS", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 6], ["XS", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 0], ["XS", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["XS", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 0], ["XS", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 1], ["XL", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 25], ["XL", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 22], ["XL", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 4], ["XL", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 2], ["XL", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["XL", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["XL", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2], ["S", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 14], ["S", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 28], ["S", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 19], ["S", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 3], ["S", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 4], ["S", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 3], ["S", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 4], ["M", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 15], ["M", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 17], ["M", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 13], ["M", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 3], ["M", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["M", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["M", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 3], ["L", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 28], ["L", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 32], ["L", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 29], ["L", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 6], ["L", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 9], ["L", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 0], ["L", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2]]}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "Zero"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "XS"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "S"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "M"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "L"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "XL"}}}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {"data": ["Zero", "XS", "S", "M", "L", "XL"]}, "label": {}, "tooltip": {}, "series": [{"name": "Zero", "type": "bar", "datasetIndex": 1, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#e98d6b"}, {"name": "XS", "type": "bar", "datasetIndex": 2, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#e3685c"}, {"name": "S", "type": "bar", "datasetIndex": 3, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#d14a61"}, {"name": "M", "type": "bar", "datasetIndex": 4, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#b13c6c"}, {"name": "L", "type": "bar", "datasetIndex": 5, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#8f3371"}, {"name": "XL", "type": "bar", "datasetIndex": 6, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#6c2b6d"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="\"How Live A Hero Players Play the Game\" against \"Spending Level\"" %}

- About 75% of the players login at least once a day.
- About 55% of the players will make sure all AP are used.
- Those who play the game in the most earnest way (last tier) are more likely to be paying customer too.

- Among non-male players, slightly more only play the game occasionally compared to the male counterpart
- Female players are less likely to optimize their game play to the maximum compared to other groups.

## High Difficulty Quest

{% include figure-image.html path="/assets/img/survey-2025/hdq.jpg"
  title="High Difficulty Quest Completion Percentage" %}

{% include figure-image.html path="/assets/img/survey-2025/hdq-gender.jpg"
  title="High Difficulty Quest Completion Percentage by Gender" %}

- Globally, half of the respondents report that they can complete >= 80% of the Hard Difficulty Content (median)
- When we examine the data by gender, we find that male respondents' peak is around 90%~100% range, all other respondents peak at 70%~80% range.

## Game Elements’ Rating

{% include figure-image.html path="/assets/img/survey-2025/game-score.jpg"
  title="Live A Hero Game Element's Score" %}

- Unsurprisingly, most respondents give the highest rating for character design
- Difficulty rating has the lowest average score of 3.55 (median=4）).

## Other games

{% include figure-image.html path="/assets/img/survey-2025/play-other-game.jpg"
  title="What Other lGbt Games Played by Live A Hero Players" %}

- **Gyee**
  - Among all the games, it has the highest combined count of "heard of but never play" and "has abandoned the game"
  - More than a third of Japan respondents have never hard of this game
- **Fantastic Boyfriends (F彼)**
  - The only buy-out game developed by LifeWonders, you can treat “abandoned” the same as “still playing”
  - It is not surprising that plenty of non-Japan respondents said “they heard of it but never played it”, since the majority of the respondents do not understand Japanese and the game has no hope of ever getting official translation.
  - Even among Japan respondents, there are more than a third of them that has "heard of the game but never play"
  - <span class="comment">In all honesty, the game has a very solid story writing, and it benefited from having limited number of characters, so each characters has more exposure to shine. If you can understand Japanese, definitely give it a try.</span>
- **Tokyo Afterschool Summoners**
  - Close to 70% LAH players are still playing Tokyo Afterschool Summoners, which is also another older game developed by LifeWonders, while 23.9% have abandoned it.
- **Tamacolle**
  - It is a gay gacha game that is mostly focused chubby and shota characters
  - It has the highest number of respondents outside Japan who have "never heard of" the game
  - Even in Japan, the number of players seem fairly low
- **AnotherEidos of Dragon Vein**
  - Practically all Japanese respondents know about this game. To this group of respondents, you either "heard of it but never try", or "currently stuck in the game". Very few Japanese respondents have "tried the game then abandoned it".
    - It is probably not incorrect to say that this game is the biggest competitor to LifeWonders' revenue
  - Out of east asia, the number of respondents that still play this game seems to have dropped from 2024 slightly
- **Crave Saga**
  - This game has the second lowest current Japanese players (just above Tamacolle) among all the Japanese gacha games that target gay players. Its abandonment rate is also fairly high.
  - The game's per
- **XXL Woofia**
  - The latest gacha game that tries to take a pie in the gay player market. It first debutted with English, Chinese and Korean languages
  - Outside of Japan, this game has a very high number of respondents still playing the game, only second to Tokyo Afterschool Summoners
  - In Japan, however, the number of respondents that have tried the game is very low, as the game had only released japanese language in early September 2025.
    - <span class="comment">For a short few months before Japanese language was released, gay players in Japan that craved for this uncensored R18 game faced the problem that non-Japanese people have been facing for years: language hurdle</span>
  - The game is still very young, we will check again next year to see how well it can retain these players

Sizable number of respondents have at least tried playing Another Eidos and Crave Saga (372 and 303 respectively), but the former seem more able to retain players. They are gay gacha games that have R18 content. and provide some form of translation, but from what I have seen, Another Eidos’ translation quality is much higher than Crave Saga.

Maybe next year I should add questions to rate the story, characters and general satisfaction of these games too.

## Free Gacha Pull Currency

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Less than other gacha games / 比别的游戏少 / 他のガチャゲームより少ない", "value": 319}, {"name": "About the same / 和别的游戏差不多 / ほぼ同じ", "value": 154}, {"name": "More generous than other gacha games / 比别的游戏大方 / 他のガチャゲームより気前がいい", "value": 38}, {"name": "Don\'t play other gacha games / 没玩别的扭蛋游戏 / 他のガチャゲームはやらない", "value": 5}]}]}'
  title="Free Gacha Pull Currency Opinion" %}

61.82% of the LAH players think the game gives less free gacha pulls than other gacha games (A), while only 7.36% of them think LAH is more generous than other gacha games (B).

{% include figure-image.html path="/assets/img/survey-2025/gacha-stone-spending.jpg"
  title="Free Gacha Pull Currency Opinion against Spending Level" %}

When we examine the spending level of the group A and group B, we see no colleration between the spending level of the respondents and their opinion on the sufficiency of free gacha pull currency.

## Translation

{% include figure-image.html path="/assets/img/survey-2025/translation.jpg"
  title="Translation Prediction" %}

Once again, we celebrate another game anniversary without official translation, which means 35.7% of the respondents made the correct prediction.

This number is much higher than last anniversary (27.2%), you can see that oversea players had lost faith in LifeWonders when they failed to fulfill their promise in last anniversary.

## Read Story

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Yes, I read fan translation when available / 会，如果有粉丝翻译 / はい （ファンの翻訳があれば読みます）", "value": 255}, {"name": "Yes, I read the story in-game (Japanese) / 会，我直接看日文原文 / はい（日本語）", "value": 165}, {"name": "No / 不会 / いいえ", "value": 96}]}]}'
  title="Do Live A Hero Player Read Story In-game?" %}

Close to half of the respondents need to rely on fan translation.

> Note: Chinese community are more lucky than English community due to having more fan translators helping to translate different parts of the game.

> I said from last year that I need to add the option of "Yes, I read the story in-game with the help of machine translation and some guesswork", but I forgot...

## Event Rating

{% include figure-image.html path="/assets/img/survey-2025/event.jpg"
  title="Event Rating" %}

{% include figure-image.html path="/assets/img/survey-2025/event-reading.jpg"
  title="Event Rating (by different Japanese Reading Language Proficiency)" %}

- It seems that respondents that have Japanese reading skill higher or equivalent to N3 are more likely to rate events higher than those with lower Japanese reading skill
- The only outlier to this pattern is [The Glorious Rising Moon](/events/2410RisingMoon/). I suspect it is because global players are just happy to see {% chara_link Pubraseer|h2 %} finally getting his limited variant.

# Character popularity

<details open markdown="1">
<summary>Global</summary>

{% include figure-image.html path="/assets/img/survey-2025/all-fav-bar.jpg"
  clip=true
  title="All Favourites Popularity Ranking (Global)" %}

{% include figure-image.html path="/assets/img/survey-2025/top10-bar.jpg"
  clip=true
  title="Top 10 Favourites Popularity Ranking (Global)" %}

Top spots for “All favourites” popularity ranking for each category

<div class="table-scroll">
<table>
  <tr>
    <th>Male furry</th>
    <th>Approval Rating</th>
    <th>Male Human</th>
    <th>Approval Rating</th>
    <th>Female/Other</th>
    <th>Approval Rating</th>
  </tr>
  <tr>
    <td>{% chara_link Pubraseer %}</td>
    <td>65.4%</td>
    <td>{% chara_link Akashi %}</td>
    <td>41.4%</td>
    <td>{% chara_link Sensettia %}</td>
    <td>13.3%</td>
  </tr>
  <tr>
    <td>{% chara_link Monomasa %}</td>
    <td>53.5%</td>
    <td>{% chara_link Astar %}</td>
    <td>37.8%</td>
    <td>{% chara_link Sui %}</td>
    <td>11.6%</td>
  </tr>
  <tr>
    <td>{% chara_link Giansar %}</td>
    <td>49.5%</td>
    <td>{% chara_link Roudin %}</td>
    <td>31.5%</td>
    <td>{% chara_link Hitomi %}</td>
    <td>10.7%</td>
  </tr>
  <tr>
    <td>{% chara_link Ryekie %}</td>
    <td>48.5%</td>
    <td>{% chara_link Gammei %}</td>
    <td>31.4%</td>
    <td>{% chara_link Flamier %}, {% chara_link Zahniah %}</td>
    <td>10.6%</td>
  </tr>
  <tr>
    <td>{% chara_link Barrel %}</td>
    <td>47.5%</td>
    <td>{% chara_link Lilac %}</td>
    <td>29.9%</td>
    <td>{% chara_link Cerastium %}</td>
    <td>9.1%</td>
  </tr>
</table>
</div>

> {% chara_link Player %} is not included in this table because they fit in all categories

Comments:

- Muscular male furry characters once again dominated the popularity ranking, with {% chara_link Pubraseer %} being the top.
- Only {% chara_link Pubraseer %} and {% chara_link Monomasa %} are liked by more than half of the respondents (approval rating > 50%)
- The gap between first place and second place is quite significant.
- Top 1 for "Male furry', "Male human" and "Female/Other" are exactly the same as 2024.

{% include figure-image.html path="/assets/img/survey-2025/all-fav-top-10.jpg"
  clip=true
  title="All Favourites vs Top 10 (2025)" %}

</details>

<details markdown="1">
<summary>2024 vs 2025</summary>

{% include figure-image.html path="/assets/img/survey-2025/all-fav-2024-2025.jpg"
  clip=true
  title="All Favourites (2024 vs 2025)" %}

{% include figure-image.html path="/assets/img/survey-2025/approval-rating-change.jpg"
  clip=true
  title="Approval Rating Change (2024 vs 2025)" %}

- It seems that characters that gotten their variant forms or base form released between the time when 2024 and 2025 surveys were carried out (such as {% chara_link Astar %}, {% chara_link Barte %}, {% chara_link Yohack %}) and {% chara_link Gaisei %} have their ranking boosted quite significantly
- {% chara_link Obsidius %}, {% chara_link Sterio %} and {% chara_link Barrel %} lost the most approval rating between 2024 and 2025 survey
  - Reminder: this year's survey was ended before {% chara_link Barrel|h3 %} was announced

</details>

<details markdown="1">
<summary>Japan / Taiwan / China</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-japan.jpg"
  clip=true
  title="All Favourites vs Top 10 (Japan only)" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-taiwan.jpg"
  clip=true
  title="All Favourites vs Top 10 (Taiwan only)" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-china.jpg"
  clip=true
  title="All Favourites vs Top 10 (China only)" %}

</details>

<details markdown="1">
<summary>Female / Non-binary / Other respondents</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-female.jpg"
  clip=true
  title="All Favourites vs Top 10 (Female respondents)" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-other.jpg"
  clip=true
  title="All Favourites vs Top 10 (Non-binary/Other respondents)" %}

- The number of non-male respondents is small to begin with, so there are a lot of ties in votes.
- Among non-male respondents, {% chara_link Tsuneaki %} replaced {% chara_link Pubraseer %}'s to take the top spot, but {% chara_link Pubraseer %} is still ranked fairly high in the "Top 10" ranking.
- LifeWonders promoted {% chara_link Gaisei %} and {% chara_link Vlaham %} in past AGF events to attract more female players, and indeed the female respondents give these characters higher approval rating (35.5% and 32.3% respectively) than the overall respondents (only 7.7% and 18.0% respectively)

</details>

<details markdown="1">
<summary>People with less than 10 favourites</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-less-than-10.jpg"
  clip=true
  title="Respondents who chose < 10 favourites" %}

In this gacha game that is full of baits for thirsty players, let us applaud these people who can limit the amount of characters they devote their hearts for.

{% include figure-image.html path="/assets/img/survey-2025/top10-less-than-10-vs-exactly-10.jpg"
  clip=true
  title="Top 10 (those who chose < 10 vs those who chose exactly 10)" %}

</details>

## Humanoid vs Anthro Bias

I have been running this survey for 5 years, and anthro characters almost always came on top in every year's popularity ranking. This has led many people to think that "furry lovers have conquered the survey". So let's try to answer this question: is the survey overwhelmingly dominated by respondents that only like anthro characters?

First of all, I tried to categorize Live A Hero characters by "Gender" (Male, Female and Other) and "Type" (Humanoid, Anthro and Other). The table can be found [here](/misc/chara_category/).

We can see that among the male characters in this game, the ratio of "humanoid" vs "anthro" is almost 50/50.
So if the respondent population does not have bias towards anthro character or humanoid character, then we should see the distribution to be binomial centered around 50%.


{% include figure-image.html path="/assets/img/survey-2025/anthro-loving.jpg"
  title="Anthro-loving Ratio Distribution" %}

Formula:

- Anthro-loving ratio of a respondent = "total number of anthro characters they like" / "total number of characters they like" (converted to percentage)
- Higher percentage means the responden prefers more anthro character than humanoid characters.
- 100% means the respondent only like anthro characters

- So globally, 50% of the respondents have an anthro-loving ratio of at least 62.5% when countring all their favourite characters.
- The ratio is even higher when respondents can only choose top 10 favourite characters.

{% include figure-image.html path="/assets/img/survey-2025/anthro-loving-japan.jpg"
  title="Anthro-loving Ratio Distribution (Japan only)" %}

- Japan respondents' anthro-loving ratio is slightly lower than global respondents, but it follows the global trend that the anthro-loving ratio increases when we only count top 10 favourite characters.
- There are two peaks at the 0%~5% and 95%~100% range (i.e. people who almost only like humanoid characters vs people who almost only like anthro characters). Some of the Japan respondents can be quite extreme.

{% include figure-image.html path="/assets/img/survey-2025/anthro-loving-female.jpg"
  title="Anthro-loving Ratio Distribution (Female respondents)" %}

- It is very interesting that female respondents' anthro-loving ratio distribution resembles a binomial distribution for the "all favourites".
- However, when the female respondents are forced to pick the top 10, then the distribution shifts towards antho characters like other gender group.

# Free form questions

For this year's survey, I ended up manually going through all the comments instead of using AI summarization, as I find the latter hallucinated too much for some reason. The formatting may be a bit messy, and I can't guarantee I did not miss any comment.

<span class="comment">Words coloured in blue are my own</span>.

## What People Like

- Most comments are all about good character designs. 
    - Has hot men characters, furry characters, chubby characters, robotic/non-human characters
    - Good voice acting
        - Fan service voice lines when touching characters and max leveling units
    - Cool character models and animations in game battle that are high in quality
    - Hero theme
    - Torn suit system
    - Design that does not sacrifice good visual language for pure eroticism
- Gameplay
    - Easy / casual game play that is not time consuming
    - Vertical game display
    - Has some form of auto play mechanism
    - Despite running for 5 years, game unit’s skill inflation isn’t super high
- Story
    - Interesting story writing with good world building. It is easy to see how much care LifeWonders take in ensuring the quality of story
    - Many praised how the story enhanced the appeal of the characters through back story and interaction with other characters
        - Different characters may have different personality, but at the end of the day, most are kind to the main character
        - Compared to R18 games where eroticism is always allowed, one respondent like that you can see the characters' modesty and the conflict of whether it's okay to expose themselves in such a shameless state in front of the person they trust (the main character) who has observed them
        - A respondent mentioned “there is no NTR in this game”. <span class="comment">I have a feeling the respondent is angry with AnotherEidos</span>
    - Story that is centered more around working adults (compared to Housamo which are mostly “high schoolers”)
    - Story that actually has high stake, like “you will disappear after being eaten by Kaibutsu”
    - Main character isn’t useless in the story
    - Player having some form of “choices” to get some variations in the story, even though the overall story ending is already decided
    - Interaction between characters
    - One respondent prefers Live A Hero that has story less suggestive than Housamo
        - <span class="comment">In next section, you will see other people complained that the story is not suggestive enough</span>
    - Good BGM
- Has mechanism to guarantee getting a rate-up character
- Game franchise that has lots of fan arts

### Some comments more specific to content for past 12 months

- The quality of visual performance within battle, voiced dialogues, cutscenes and BGMs have significantly improved, beyond other games of similar genre. This increases the story immersion.
- It is now easier to get to secret boss of Unexplored Quest
  - <span class="comment">Really? I still can’t reach there yet...</span>
- Glossary (Exio’s notes) to review past concepts/events
- One requests for implementing trial quest to try out older characters
- Name card is a good addition
    - <span class="comment">Unsurprisingly, a lot of people employ a great amount of creativity and ingenuity to make their name card looks erotic</span>
- Weekly mission, though some still feel it is very stingy

## Improvement People Want to See

### Translation

Since most survey respondents are not from Japan, the lack of translation is obviously one of the most mentioned feedback:

- One respondent literally said: Japan views punctuality very seriously, but “please wait a while” literally is more than one year? Almost like lying to the players
- A Japanese respondent also feels concerned that there is no official translation for foreign players to this day
- Some players have difficulty in clearing game content because not being able to understand skill description and in-game battle guide
- Some oversea players can get by with the game wiki, but the back and forth checking is very tiring
- Some does not even know when a new feature is implemented due to not understanding game announcement
- People can feel that the story and performance quality has improved, but lack of translation means they cannot understand any of it
- The fact that all other gacha games competing in the same space already have official translations but this game still doesn’t, make players feel very betrayed.
- One respondent dares LifeWonders to remove the game for non-Japan region and witness how much that tanks the game’s revenue

### Story

- Some people prefer to able to skip the voice acting, and complains that the voiced dialogue prevents them from reading at their own pace
- There are also players who project themselves as the main character, and saying that the voiced dialogue for main character breaks that immersion for them
    - An option to turn off main character voice might be a good solution
- Waited too long to get new Main Quest
    - One respondent thinks that the frequency of Main Quest and Event Quest should be more balanced
- Longer Event Quest story to flesh out a character’s charm. Event Special Quest is too short
- Some respondents complained that Live A Hero’s story is a lot less suggestive as compared to Tokyo Afterschool Summoner
- Implementation of Date Quest
- “To top it off, the script and direction for the main story—which hadn't been updated for nearly two years—received quite negative reviews, sparking mixed reactions. Honestly, I'm worried about the future of the game's operation.”
    - <span class="comment">This comment was written by a Japanese respondent. I was quite surprised by it, as I thought Japanese players on Twitter/X are mostly positive with the latest Main Quest (but then again, I can’t understand Japanese)</span>

### Event

- Too many filler campaigns (like farming campaigns) where players have nothing much to do. For oversea players, “Link Quest campaigns” also counts as filler, because they cannot understand the only content of the campaign, which is just story in Japanese.
- Every event has a very predictable formula: farm event currency, then trade items in the event shop. Some feel this is too repetitive
    - People want more ways to play the game during an event other than repetitive farming
- Request for implementation of story CG
- Increase the content production frequency
- Some people request that the event farming quest should last till the final day of the event.
- Some respondents request LifeWonders to make guide on how to actually beat hard-difficulty quest, beyond the basic in-game battle mechanics description
- Some players complained the game is too hard, while other players wish to have more challenging quests to play (end-game content)
- One player complained that many statuses have similar effect, just with different multiplier and/or turn count, and wants LW to standardize them
    - <span class="comment">I don’t think LW will change this, this is the method most gacha games employ to “adjust game difficulty” and “add variety”</span>
- Farming efficiency
    - Reduce time needed to farm event
    - Farming quest that uses more stamina and gives more reward
    - Skip ticket and double stamina usage
    - Skip skill 3’s animation, increase animation speed
    - Better auto battle system
    - Auto continue for infinite farming
    - Able to consume stamina drink till you reach 999

### Game Feature

- Very difficult to figure out what heroes / sidekicks work well together
- Name card
    - Want more customization to the name card
    - Name card title feels useless
- More mini game to interact with character
- More features in Office
    - Accessories for Office
    - More rewards from Office
    - “My Alice” from “Crash Fever”
- More customization for home screen
- The latest hard-difficulty quest of Main Quest 2-3 introduced the “two-teams” mechanic, but player is only allowed to borrow a friend support for one of the team, which hurts players who don’t have a lot of strong units yet
    - Forming one strong team is hard enough, now I need to have two teams at the same time??
- Want to be able to directly buy the required amount of multiple items for one upgrade in one go, rather than having to go back and forth multiple times to check how much they need to buy
- Sort/filter function for sidekick skills and passives
- One click to exchange all duplicates to record cubes
- App notification when stamina is full
- 100-pulls friend point gacha with a single click
- Make “reuse previous team combination” a default-ON option in settings instead of asking about it every login. If the player does not want it (which should be a minority), they can turn it off in settings.
- Make “use stamina to play this quest again” a default-ON option in settings instead of asking about it every login. If the player does not want it (which should be a minority), they can turn it off in settings.
    - <span class="comment">Crave Saga and XXL Woofia already implement the last two features as default-ON option</span>
- Scenario replays will display the same scenario and battles as when first viewed.
- Sandbox quest to test characters
- Add favourite tags for most used friend supports
- NSFW mode

### Gacha & Monetization

- Some respondents request for the implementation of monthly pass instead of limited event gem pack
- Many people want to be able to support the game at lower price point monthly
- Monthly pass is a very common feature in other gacha games, LifeWonders really need to consider this
- Paid skins are also mentioned a few times
- New players complain that it is very slow and boring at the early stage of playing, since accumulating gacha currency and upgrading resources are very challenging.
    - One player said it takes months to upgrade one character
    - One respondent observed that their friends often quit the game before that, leading to poor retention rate
    - <span class="comment">I am guessing that most of the complaints might be referring more to the end-game upgrades like Parallel Quartz, Blooming and Skill Tree, which indeed would take a freaking long time to accumulate enough materials to upgrade.</span>
- It takes a lot of units to make certain gameplay streak possible, but the game provides very little gacha currency to get units, so it is difficult to achieve that gameplay streak unless you spend money
- People requests that rerun banners should have higher guaranteed rates for limited units
- People welcomed the improved mechanics to new characters, but lament that most are for 5 star characters only
- There are a few complaints about old characters’ skills being useless in the current environment. People want more frequent release of skill tree
    - Some people complained that old characters are still useless after skill tree enhancement
- One respondent said “Anniversary got worse” (no specific details), another respondent is displeased the anniversary ticket has been stuck to 3 tickets for years.

### Characters

- One respondent complained that 5 star characters for the last 12 months were almost all just male hunk bodytype, only one (furry) is chubby. No chubby human limited variant in the last 12 months.
- Limited variants for female character
- Equal chance of getting limited variant for all characters
- Some players are not satisfied about the company’s decision to increase the proportion of characters that are not popular to gay men for the sake of diversity
- Female players on the hand think we need more female characters
- Some respondents are against the implementation of shota characters
    - <span class="comment">I can’t comment much, we all know how east asian vs other countries have very different views on fictional shota characters...</span>
- More furries characters
    - More female furries characters
- More grandpa characters
- More slim-body characters
    - More slim-body non-human characters

<span class="comment">So you see, when your playerbase becomes diverse enough, you will have opposing needs from the playerbase. Given how slow it is for Live A Hero to release a new unit (variant or new character), there is no way for LifeWonders to satisfy everyone.</span>

<span class="comment">Fortunately, the percentage of respondents that actually complain about the proportion of character type remains pretty low. The community in general is more tolerant than you might think.</span>

<span class="masked">I will drop the truth bomb here: most people that complain about diversity are asian males. Japanese female respondents and quite a few male respondents outside east asia are supportive of more female characters.</span>

- Implementation of event-themed main character skins
- Increase the suggestive-level for damaged clothes skin
    - <span class="comment">Some characters’ damaged skin might be more conservative, but I think {% chara_link Antares %} is almost completely naked now</span>
- One person complains that they cannot get their character naked
    - <span class="comment">Please, this is a SFW game</span>
- Some players wish to have same characters getting more chance to appear (even if it means more limited variants) instead of blindlessly increase the number of new characters
- New art when upgrading 5 star characters
    - <span class="comment">I supposed the person wants 5 star characters to have at least 3 unique arts?</span>
- Improve spine models for older characters
- The quality of spine models for some new characters are worse than others.
- Some people complain that the recent accessory for some characters’ spine models are getting too simple and boring
- There are people request for changing skin on spine models
- Bigger bulge on spine model
    - <span class="comment">If XXL Woofia can get away with having gigantic bulge in the “SFW” Google Play/Apple Store version, I think LifeWonders can be a bit more bold too...</span>
- HD character arts
- Characters’ legs are too short

# Bugs & Performance

- Loading time being too slow is the most common complaint in this category, especially at the login screen.
- Some people also experienced random game crashes at login screen
- Friend list management page is very slow

## New Illustrator Wishlist

People sure was not holding back when it comes to illustrator wishlist, we received tons of names for this question.

I did my absolute best to try finding the illustrator, but I wasn't able to fix all the typos, so I could only list the names I couldn't find verbatim.

Some of the suggestions are literally moonshot, so please do take a look at the list. To quote a joke from a friend: "some people dream so big, you can open a (Hero) Path".

> Warning: most of the social links are NSFW

<details open markdown="1">
<summary>Illustrator wishlist (in no particular order)</summary>

1. Zoyu (卓羽)
    - https://x.com/ZoYu26152516
    - https://x.com/wuedti
1. Terujirou
    - https://x.com/terujirou1014
1. Sollyz
    - https://x.com/sollyzsundyz
1. Gryffindor (Rainer)
    - https://x.com/Gryffindor131
1. Abashiri
    -  https://x.com/abasirisippo
1. Estper
    - https://x.com/tiger_est
    - <span class="comment">Most people wrote this as "Espter" which caused me a long time to find...</span>
1. Istani
    - https://x.com/kemoistani
1. Monogg
    - https://x.com/MonogG
1. Jacketbear (山藥人)
    - https://x.com/jacketbear
1. Gamubear
    - https://x.com/BearWivMe
1. Bonti\*age
    -  https://x.com/bont1age
1. Takikaze
    - https://x.com/takikaze217
1. Nviek
    - https://x.com/nviek5
1. Mato
    - https://x.com/matomonstera
1. Gammachaos
    - https://x.com/gammachaos
    - <span class="comment">Funny comment from a respondent:</span> "every gay gacha game needs a Horkeu Kamui clone"
1. TakaTaka
    - https://x.com/TakaTakaPig
1. Juggermelon
    - https://x.com/Juggermelon
1. KokuKokuBoo
    - https://x.com/kokukokuboo
1. Jiraiya
    - https://x.com/jiraiyajpn
1. Kuromine Hiraya (湯あたり)
    - https://x.com/kuromine_hiraya
1. RPBBW (紅紫藍黑白)
    - https://x.com/noku13456
1. Null Ghost
    - https://x.com/nullghost_art
1. GlenSaru
    - https://x.com/glensaru
1. 一夫多獸
    - https://www.pixiv.net/en/users/7576657
1. 文碧
    - https://x.com/Fumimimimidory
1. ZOROJ
    - https://bsky.app/profile/zoroj.bsky.social/
1. DOPQ
    - https://x.com/yy62401
1. Posporo
    - https://x.com/P0SPORO
1. 18plusplus
    - https://x.com/18plus_plus
1. DaemonTor
    - https://x.com/perverteddaemon
1. KNN
    - https://x.com/Kunn00_
1. 種
    - https://x.com/Energy_camdy
1. Mixter
    - https://x.com/mixterArt
1. Racoon21
    - https://x.com/raccoon_21c
1. Kurotero (クロテロ)
    - https://x.com/kurotero/
1. DUNE
    - https://x.com/GT_DunE
1. ルイズ
    - https://x.com/Takaxvfruizu1
1. 爱画画的Breeze
    - https://x.com/BreezeM18
1. Asutaro
1. Mazjojo
    - https://x.com/mazjojomania
1. Tepen
    - https://x.com/tptptpn
1. こるく
    - https://x.com/kemo_0519
1. わお
    - https://x.com/wao_kinoto
1. ヒャク
    - https://x.com/hyaku1063
1. Futei (ふてー)
    - https://x.com/MTI777
1. Kijimaru
    - https://x.com/kijimarie
1. Natsume Yakumushi
1. Dangpa
    - https://x.com/dangpaart
1. Ghostfood
    - https://bsky.app/profile/ghostfood.bsky.social
1. ChesschireBacon
    - https://bsky.app/profile/chesschirebacon.bsky.social
1. seamonsterping (海怪平)
    - https://x.com/seamonsterping?lang=en
1. yuuuki_dogs
    - https://x.com/yuuuki_dogs
1. Robokeh
    - https://x.com/Robodraws
1. Buranko
1. Kaitodraws
    - https://x.com/kaitodraws1
1. Wolf Con F
    - https://x.com/f_con
1. Uleez
    - https://x.com/Uleezoo
1. 土狼弐
    - https://x.com/d_raw_two/
1. Nama Kobura
1. Neumo (にゅうも)
    - https://twitter.com/neumokun
1. foooooxes
    - https://x.com/foooooxes
1. risuou
    - https://x.com/risuou
1. 狗芒五
    - https://x.com/ekqopi7bfldyyqa
1. Magangz
    - https://x.com/makidogang
1. 木狼
    - https://x.com/mokurou8810
1. 大地巧太
    - https://x.com/nikubo
1. Ross
    - https://x.com/ross_ciaco
1. 肉鍋
    - https://x.com/nikunabe1989
1. ぬぬたろう
    - https://x.com/nunutaro3
1. Riotaro
    - https://x.com/Riotaro15
1. ねこ丼
    - https://x.com/nekodon_san
1. Nekogaki
    - https://x.com/nekogaki0324
1. UZA
    - https://x.com/art_uza
1. zifu
    - https://x.com/zifuuuun
1. 吉川達哉
    - https://x.com/0t0_yoshikawa
1. 村山竜大
    - https://x.com/ovopack
1. 狼小魂
    - https://x.com/Yama_wolfsoul
    - https://www.plurk.com/Yamacat
1. 昆布茶
    - https://x.com/kbc_omaso
1. 吃肉的草狼
    - https://x.com/weedwolfeatmeat
1. SUV
    - https://x.com/suv032
1. 狐塚遁
    - https://x.com/cotton_nottoc
1. maio
1. 梅拉德Mallards
    - https://x.com/Mallards1305
1. ヒャク
    - https://x.com/hyaku1063
1. GabyT
    - https://www.youtube.com/channel/UCJr7ptN1tz60UMhzElyfaQg
1. Taran Fildder
    - https://x.com/tfiddlerart
1. ANhes
    - https://x.com/anhesart
1. Stranj
    - https://x.com/CivetStranj
1. Chunie
    - https://x.com/chunieart
1. Nesskain
    - https://x.com/nesskain
1. Nikiciy
    - https://x.com/konnikichan
1. 月潟ロッシ
    - https://x.com/RossiThukigata
1. rou
   - https://x.com/radcanine
1. TulRang_C
   - https://x.com/tulrang
1. Underwater Sponge
   - https://x.com/UWSponge
1. 熊谷しん
   - https://x.com/kumagayasin
1. O-RO
   - https://x.com/DogoroNumber3
1. Zololee (黄金の大猫)
   - https://x.com/goldenbigcat/
   - https://www.pixiv.net/users/196845
1. Dsharp
    - https://x.com/Dsharp_K
1. 欺久
1. Luode jun (大罗德)
    - https://x.com/luodejun
1. bnav5
    - https://bsky.app/profile/bnav5.bsky.social
1. Chinatsu Kurahana
1. ニジタロウ/星端 朗
    - https://x.com/nizitaro1
1. neumokun
    - https://x.com/Neumokun
1. kouta_nagamori (永守浩太)
    - https://x.com/kouta_nagamori/
1. Adios
    - https://x.com/Adiosarts
1. kamado023 (かまど)
    - https://x.com/kamado023
1. HOWDY
    - https://x.com/HOWDY_FUR
1. Yūji Iwasaki (岩崎優次)
    - Cipher Academy, JJK:Modulo
1. kimidori (きみどり)
    - https://twitter.com/dera_kimidori
1. にゃんこね(ro)
    - https://x.com/nyankone2
1. kame3
1. もふあき
    - https://x.com/mofuaki_
1. ZUN (博麗神主)
    - https://x.com/korindo
1. Hirohiko Araki (荒木飛呂彦)
    - https://x.com/araki_jojo
    - <span class="comment">"JoJo's Bizarre Adventure"'s artist</span>
1. Masashi Kishimoto (岸本斉史)
    - https://x.com/kishimotomasshi
    - <span class="comment">Naruto's artist</span>
1. Haiki
    - https://x.com/haiki396g
1. Bellsalt
    - https://x.com/bellsaltr
    - <span class="comment">The respondent wrote "Beltsalt", that took me days to find the correct name</span>
1. Kaeru
    - https://bsky.app/profile/frog1432.bsky.social
1. cfsy10
    - https://x.com/cfsy10
1. Jocob Mott
    - https://www.instagram.com/jacob_mott_bwb/
1. Caro
    - https://x.com/Caro_zalt
1. Luwei
    - https://x.com/chang52084
1. izm
    - https://x.com/izm_rm7
1. 鱼
    - https://x.com/fishingmanMAX
1. Kul
    - https://x.com/KulPlant
1. FSL6
    - https://x.com/FanSL_Art
1. KD钙
    - https://x.com/kd_gai
1. LukeOx
    - https://x.com/luke_c419
1. 舵丸
    - https://x.com/kajimaru_0507
1. 泥水
    - https://x.com/doromiez
1. 怒涛
    - https://x.com/sousuke000
1. Sky
    - https://x.com/sky_gomi
1. 黑轩
1. 行丸
    - https://saru59.sakura.ne.jp/
1. Itohiro (いとひろ)
    - https://x.com/itohiro0305
1. KAJIKA
1. Manabiko (まなびこ)
    - https://x.com/manabiko_
    - <span class="comment">(Technically they already did [Cetus](/mobs/#cetusplesiosaur-kaibutsu) in this game)</span>
1. Ninahachi (ニナハチ)
    - https://x.com/nijuunanayo
1. 閃耀菌
    - https://x.com/shan_yao_jun
1. Yudai
    - https://x.com/Grandeur023
1. Go Fujimoto (藤本郷)
    - https://x.com/go_fujimoto
1. Gai Mizuki (水樹凱)
    - https://x.com/mizukigai
1. Sakuramaru
    - https://x.com/sakuramaru123
1. Hiko
    - https://x.com/hicochi788
1. Jin
    - https://x.com/jin_jinx
1. Kumao
    - https://x.com/kumao_cafe_
1. Kuromine Hiraya
    - https://x.com/kuromine_hiraya
1. Yunosuke
    - https://x.com/UN0SK
1. Edamame
    - https://x.com/edamamego_02ma3
1. DoPq
    - https://x.com/yy62401
1. Topi
    - https://x.com/topi5356
1. Daisukebear
    - https://bsky.app/profile/daisukebear.bsky.social
1. Hisbam
    - https://x.com/hisbam_hisbam
1. Tevit
    - https://x.com/Tevit15
1. Osuman
1. Magmataishi (まぐまたいし)
    - https://x.com/magma00
1. Ammamiya (あまみや)
    - https://x.com/ammami8
1. Doosoo
    - https://x.com/rntentn
1. Konohanaya
    - https://x.com/Konohanaya/
1. adj (阿形)
    - https://x.com/0110ADJ
1. みきてゃ
    - https://x.com/mine_miki0840
1. Shikaku Yamamoto
    - https://x.com/s_k_k
1. Me~
    - https://x.com/mee04__
1. Suzuka Morino
    - https://x.com/karana_cat
1. Emboss
    - https://x.com/Emboss0320
1. Tomotiso
    - https://x.com/Tomotiso2k
1. Nekotiger
    - https://x.com/mosaKemono
1. Iyoko
    - https://x.com/iyoko_145
1. LLJH
    - https://x.com/LLJHLISHIFU
1. LAGOON
    - https://x.com/LAGOON_XVI
1. ThemeFinland
    - https://x.com/ThemeFinland
1. Mandaro
    - https://x.com/augoose_cong
1. Posuka Demizu
    - https://x.com/DemizuPosuka
1. Paru Itagaki
    - https://x.com/itaparu99
1. Yifeng
    - https://x.com/Yifeng_LZ
1. KOBITOWANI
    - https://x.com/K0BIT0WANI
1. Kunoma
1. Kawara Gawara
1. Shamoji (杓文字)
    - https://x.com/samoji
1. Tamura_Kazumasa
    - https://x.com/Tamura_Kazumasa
1. Tos Tos F Ski (とすとすFスキー)
    - https://x.com/Tos_Tos_F_ski/
1. Niku 18 (肉良獣八)
    - https://x.com/niku_18
1. Chirenbo
    - https://vxtwitter.com/Chirenbo
1. FruitzJam
    - https://x.com/FruitzJam/
    - <span class="comment">Respondent wrote this as "Fruitzyjam", costing me some time to find the right name</span>
1. Ponzu
    - https://x.com/ponzu_tas/
1. Retsito/Morskart
    - https://x.com/morskart
1. Bakedanuki
1. bozi
    - https://x.com/bozi_exe
1. Joseph A.J
1. Miazuma Shouki
    - https://x.com/miazuma_shouki
1. Numaro
1. Tigerlion Moikana
    - https://x.com/tigerlion_art
    - Mexican bara artist
1. Fearfac666
    - https://x.com/fearfac666
1. Rikiya Koyama
    - <span class="comment">I am not sure, is this the voice actor 小山力也?</span>
1. 赤田
    - <span class="comment">Respondent did not provide any social network user name, maybe it is https://x.com/akatadobuchiki</span>
1. 遊茶
    - https://x.com/usa_kotobuki
1. YaoYaoReer (述麓)
    - https://weibo.com/u/2128358004
    - https://x.com/YaoYaoRe
1. jung_ryeong
    - https://x.com/jung__ryeong
1. HIFUMI_2nd
    - https://x.com/HIFUMI_2nd
1. waaaaaa_i
    - https://x.com/waaaaaa_i
1. Pulin Nabe/kakenari_
    - https://x.com/kakenari_
1. Arima_bn_Skeb
    - https://x.com/Arima_bn_Skeb
1. 綠草茶GREENTEA
    - https://x.com/GREENTEA781016
1. えだまめ號
    - https://x.com/edamamego_02ma3
1. Gamma-G
    - https://x.com/gamma_DH
    - <span class="comment">God bless the brave soul that ask for this, they do not know...</span>
1. Tokuni
    - https://x.com/toktoktokuni
1. 阿莫AMO
    - https://x.com/AMO9612
1. YAN
    - https://x.com/bltyann
1. 00047
    - https://x.com/479992103
1. Ryota-H
    - https://x.com/Ryota_H
1. WINEMVEE
    - https://x.com/winemvee
1. piikeisandaa
    - https://bsky.app/profile/piikeisandaa.bsky.social
1. 村上タロス
    - https://x.com/murakami_ta
    - https://www.pixiv.net/en/users/66210
1. dokeshin
    - https://x.com/dokeshin
1. Tsuroe
    - https://x.com/chuurow/
1. jrjresq
    - https://bsky.app/profile/jrjr.esq

</details>

<details open markdown="1">
<summary>List of illustrators that were in the wishlist but already has work in this game  (in no particular order)</summary>

1. 朱交赤成
1. BomBom
1. Sawch_cls
1. BKMITA
1. Yow
1. YED
1. Naop
1. Vorusu
1. gozu_farm
1. Nullq
1. wasp
1. カヂロ

</details>

## New Voice Actor Wishlist

Less respondents actually provide a wishlist for voice actors than for illustrators. Most admit that they do not know much about voice actor industry and just trust LifeWonders to make the call.

Despite that, we still receive a lot of names. Processing this question turned out to be quite challenging, because some people wrote voice actors' names as English (Hiragana), sometime even with accent symbols. Other people wrote in Kanji names. Furthermore, there were also several typos or alternative names. This made deduplication difficult.

<details open markdown="1">
<summary>List of voice actor that got mentioned by multiple respondents</summary>

1. Akio Otsuka (大塚明夫) 11 times
1. Kenjiro Tsuda (津田健次郎) 11 times
1. Junichi Suwabe (諏訪部順一) 9 times
1. Satoshi Hino (日野聰) 6 times
1. Kazuya Nakai (中井和哉) 6 times
1. Akira Ishida (石田彰) 5 times
1. Natsuki Hanae (花江夏樹) 4 times
1. Takaya Kuroda (黑田崇矢) 4 times
1. Yuichi Nakamura (中村悠一) 3 times
1. Subaru Kimura (木村昴) 3 times
1. Tomokazu Sugita (杉田智和) 3 times
1. Fumihiko Tachiki (立木文彦) 3 times
1. Hikaru Midorikawa (緑川光) 3 times
1. Yūki Ono (小野友樹) 3 times
1. Genda Tesshō (玄田哲章) 3 times
1. Yū Kobayashi (小林优) 2 times
1. Kazuhiko Inoue (井上和彦) 2 times
1. Takuya Eguchi (江口拓也) 2 times
1. Shunsuke Takeuchi (武内駿輔) 2 times
1. Takahiro Sakurai (櫻井孝宏) 2 times
1. Hiroki Tōchi (東地宏樹) 2 times
1. Kenji Hamada (浜田賢二) 2 times
1. Kosuke Toriumi (鳥海浩輔) 2 times
1. Masahiro Ogata (尾形真宏) 2 times
1. George Nakata (中田譲治) 2 times

</details>

<details markdown="1">
<summary>Other voice actor with less mentions (in no particular order)</summary>

1. Yūsuke Kobayashi (小林裕介)
1. Jun'ichi Kanemaru (金丸淳一)
1. Matsuda Kenichiro (松田健一郎)
1. Masakazu Morita (森田成一)
1. Kazuhiro Yamaji (山路和弘)
1. Shuhei Sakaguchi (阪口周平)
1. Yūsuke Kobayashi (小林裕介)
1. Jun'ichi Kanemaru (金丸淳一)
1. Matsuda Kenichiro (松田健一郎)
1. Tsuguo Mogami (最上嗣生)
1. Yuma Uchida (内田雄馬)
1. Hikaru Hanada (花田光)
1. Kazuya Nakai (中井和哉)
1. Takahiro Mizushima (水岛大宙)
1. Rica Matsumoto (松本梨香)
1. Fairouz Ai (ファイルーズあい)
1. Romi Park (朴璐美)
1. Aoi Yūki (悠木碧)
1. Ikue Ōtani (大谷育江)
1. Yurina Amami (雨宮結梨菜)
1. Ikezawa Haruna (池澤 春菜)
1. Aoki Sayaka (あおき さやか)
1. Amamiya Sora (雨宮 天)
1. Asanuma Shintarou (浅沼 晋太郎)
1. Azakami Youhei (阿座上 陽平)
1. Ban Taito (坂 泰斗)
1. Canna Nobutoshi (神奈 延年)
1. Cho Kasumi (長 克巳)
1. Eguchi Takuya (江口 拓也)
1. Furukawa Makoto (古川 慎)
1. Ginga Banjō (銀河 万丈)
1. Hanawa Eiji (花輪 英司)
1. Hayami Saori (早見 沙織)
1. Hirohashi Ryo (広橋 涼)
1. Hirose Daisuke (廣瀬 大介)
1. Hoshino Takanori (星野 貴紀)
1. Hosoya Yoshimasa (細谷 佳正)
1. Junya Inaba (稲葉純弥)
1. Ishikawa Yui (石川 由依)
1. Kakihara Tetsuya (柿原 徹也)
1. Kamiya Hiroshi (神谷 浩史)
1. Kawata Taeko (川田 妙子)
1. Kawasumi Ayako (川澄 綾子)
1. Kawashima Tokuyoshi (川島 得愛)
1. Kikuchi Kokoro (菊池 こころ)
1. Kimura Ryohei (木村 良平)
1. Kumamoto Kenta (隈本 健太)
1. Kusunoki Taiten (楠 大典)
1. Maeno Tomoaki (前野 智昭)
1. Masuda Yuki (増田 ゆうき)
1. Masuyama Takeaki (益山 武明)
1. Midorikawa Hikaru (緑川 光)
1. Miki Shin-ichiro (三木 眞一郎)
1. Miyano Mamoru (宮野 真守)
1. Mizunaka Masaaki (水中 雅章)
1. Mizuki Nana (水樹 奈々)
1. Morikawa Toshiyuki (森川 智之)
1. Murase Ayumu (村瀬 歩)
1. Nagasako Takashi (長嶝 高士)
1. Nakahara Anko (長原 杏子)
1. Nakamura Kotaro (中村 浩太郎)
1. Nakao Ryūsei (中尾 隆聖)
1. Nazuka Kaori (名塚 佳織)
1. Nishikawa Takanori (西川 貴教)
1. Noto Mamiko (能登 麻美子)
1. Ochiai Rumi (落合 るみ)
1. Okitsu Kazuyuki (興津 和幸)
1. Ōmoto Makiko (大本 眞基子)
1. Ono Daisuke (小野 大輔)
1. Ōtsuka Hōchū (大塚 芳忠)
1. Ōtsuka Takeo (大塚 剛央)
1. Otoshiro Kiyori (音代 継)
1. Saitō Ayaka (齋藤 彩夏)
1. Satō Takuya (佐藤 拓也)
1. Sawashiro Miyuki (沢城 みゆき)
1. Seki Tomokazu (関 智一)
1. Shingaki Tarusuke (新垣 樽助)
1. Shiraishi Ryoko (白石 涼子)
1. Shimono Hiro (下野 紘)
1. Sugiyama Noriaki (杉山 紀彰)
1. Sugō Takayuki (菅生 隆之)
1. Takeuchi Shunsuke (武内 駿輔)
1. Tanezaki Atsumi (種﨑 敦美)
1. Teppōzuka Yōko (鉄砲塚 葉子)
1. Toriumi Kosuke (鳥海 浩輔)
1. Uchida Yuma (内田 雄馬)
1. Uchiyama Kouki (内山 昂輝)
1. Ueda Reina (上田 麗奈)
1. Umehara Yuichiro (梅原 裕一郎)
1. Wakamoto Norio (若本 規夫)
1. Yamada Kōichi (山寺 宏一)
1. Yamashita Daiki (山下 大輝)
1. Yasui Kunihiko (安井 邦彦)
1. Yusa Kōji (遊佐 浩二)
1. Nakai Kazuya (中井 和哉) - The Japanese voice actor for Roronao Zoro.
1. Volcano Ota (ボルケーノ太田)
1. Josuke Shinomiya (篠宮穰祐)
  - <span class="comment">Old Barguest VA in Housamo</span>
1. Hatsune Miku (初音ミク)
  - <span class="comment">Yep, the infamous vocaloid</span>

</details>

Due to time constraint, I did not make a list of voice actors that respondents wished for but are actually already performed for this game. But I have to say, quite a few people ask for the voice actor for {% chara_link Theoreol %} (子安武人).

# Afterword

I hope you enjoy reading this report, because the whole process took me months to prepare. Many times the thought of “I should be paid for this work” flashed in my mind. It really is not easy to conduct a survey of this size, and then write a report about it!

For a lGbt game that we all know caters more towards gay players, I think LifeWonders’ success in attracting more players from other demographics is pretty commendable. If they can grow the group of paying players to keep the business running [while still staying true to their original mission](https://www.lifewonders.co.jp/?lang=en), I think that is good for everyone. (Ironically, "serving global market is also in their missions).

While waiting for the ever elusive release of official translation, this wiki will still be here supporting oversea players.

See you in next year survey!

<script defer src="https://echarts.apache.org/en/js/vendors/echarts/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
