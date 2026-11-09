---
title: 社群問卷調查結果2026
date: 2026-11-01 12:00:00 +08
lang: zh-tw
draft: true
eleventyExcludeFromCollections: true
---
{%- comment -%}
  Translation of 2026-10-01-community-survey-2026.md: same includes and facts, only the prose differs.
  Before publishing: delete `draft` and `eleventyExcludeFromCollections` above.
{%- endcomment -%}
{% assign f = site.data.survey2026.facts %}

> この記事には日本語版があります。詳しくは[こちら](/blog/2026/community-survey-2026.ja/)をご覧ください。

> 本文由英文版翻譯並經過編輯。若[英文版](/blog/2026/community-survey-2026/)與中文版內容有出入，以英文版為準。

> 本文篇幅較長，並含有大量互動式圖表。將滑鼠移到圖表上或點擊圖表，即可查看精確數字。

* unordered
{:toc}

# 前言

今年的問卷共收到**{{ f.respondents }}**份回答，去年為{{ f.respondents_prev }}份。
我過去幾年都有舉辦這個問卷，這是回答人數第一次比前一年少，而且少得這麼多。

儘管如此，我還是要感謝每一位撥空填寫問卷的人。我知道這不是一件輕鬆的事，未来我打算刪減一些價值較低的題目。

## 問卷限制聲明

今年回答者的族群比例又和過去幾年有很大的不同，中國和日本回答者的比例比前一年少了許多。
這代表許多「2025 vs 2026」的比較，並不能真正反映同一群人的想法是否有改變，因為背後的回答者群體已經差異很大。請對這些比較抱持保留的態度。

# 回答者概況

## 回答者來源

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

Discord和Reddit佔了回答者來源的一半以上，Reddit的人數比前一年幾乎翻倍！

和2025年相比，流失最多的是來自本Wiki、巴哈姆特（台灣遊戲論壇）、X/Twitter和微博（中國）的流量。我不敢再去Zawazawa發文，所以那邊又是零。這導致今年中國、日本（以及某種程度上的台灣）回答者大幅減少。

## 年齡

{% include survey-chart.html id="age" %}

年齡中位數為{{ f.age_median }}歲。有一位來自菲律賓的回答者自稱6歲。

{% include survey-chart.html id="age_female" %}

{% include survey-chart.html id="age_japan" %}

## 性別

{% include survey-chart.html id="gender" %}

{% include survey-chart.html id="gender2" %}

{{ f.non_male_pct }}%的回答者為非男性（去年為{{ f.non_male_pct_prev }}%），{{ f.transgender_pct }}%為跨性別者。

{% include survey-chart.html id="gender_japan" %}

### 女性、非二元性別及其他性別回答者的分布

{% include survey-chart.html id="non_male_country" %}

## 國家

{% include survey-chart.html id="region" %}

{% include survey-chart.html id="yoy_region" %}

{% include survey-chart.html id="country_map" %}

{% include survey-chart.html id="country" %}

2025年到2026年的問卷之間：

- 日本的佔比從{{ f.yoy["2025"].japan_pct }}%降至{{ f.yoy["2026"].japan_pct }}%。
- 中國的佔比從{{ f.yoy["2025"].china_pct }}%降至{{ f.yoy["2026"].china_pct }}%。
- 台灣的佔比從{{ f.yoy["2025"].taiwan_pct }}%降至{{ f.yoy["2026"].taiwan_pct }}%。

## 日語閱讀能力

{% include survey-chart.html id="jp" %}

假設需要至少N3的程度才能順暢閱讀《Live A Hero》的日文劇情，那麼只有14.9%的回答者做得到。
如果排除日本玩家（{{ f.jp_n1_japan }}），比例會降到11.2%。

# 遊戲

## 實際玩家

{% include survey-chart.html id="play_lah" %}

## 停止遊玩的原因（21則回答）

- 放棄時還沒有英文翻譯
- 失去興趣／動力
- 戰鬥系統太複雜／不熟悉遊戲機制
- 抽不到想要的角色
- （免費）抽卡貨幣太少
- 回答者同時也玩其他抽卡遊戲，沒有時間繼續玩《Live A Hero》

## 平台

{% include survey-chart.html id="platform" %}

{% include survey-graph.html path="/assets/img/survey-2026/platform_venn.zh-tw.svg" title="平台重疊情形" %}

有{{ f.platform_multi }}位回答者（{{ f.platform_multi_pct }}%）使用不只一個平台。圖中的每個數字是剛好選了該平台組合的回答者人數；各區域大小相同，並非依比例繪製。

有12位回答者（3%）只透過PC上的Android模擬器遊玩，但沒有人只用「Google Play Games on PC」遊玩。

## 遊玩時間

{% include survey-chart.html id="tenure" %}

- 近四分之一的回答者在遊戲上線前後就開始玩了。
- 玩家成長一直很緩慢，直到[3週年](/events/23093rdAnniversary/)前後出現一波高峰，那正是LifeWonders宣布「計畫」推出官方翻譯的時期。
- 過去12個月玩家成長再度加速（主要是海外玩家）。這一年也是官方翻譯終於推出的一年。

## 主角設定

{% include survey-chart.html id="mc_body" %}

{% include survey-chart.html id="mc_voice" %}

## 課金

{% include survey-chart.html id="paying" %}

超過一半的回答者在遊玩過程中至少課金過一次。

### 課金等級定義

|等級|說明|
|-|-|
|XL|購買過一般付費石|
|L|購買過活動限定石頭禮包（大）|
|M|購買過活動限定石頭禮包（小）|
|S|購買過新年福袋、週年英雄選定禮包或週年石頭禮包|
|XS|只購買過第4個業務欄位所需的10顆石頭，或網頁商城的超值禮包|
|Zero|從未課金|

{% include survey-chart.html id="yoy_paying" %}

和2025年相比，免費玩家略有增加。

在課金玩家中，XL（花最多錢）和S級（只在新年／週年花錢）略有減少，XS級的增幅最大。這些人很可能是去買了新的網頁商城超值禮包。

> 我們知道東亞是這款遊戲課金玩家比例最高的地區，但這個族群在今年的問卷中也減少得最多，請將這點納入考量。

{% include survey-chart.html id="money_items" %}

和上一次問卷相比，新年福袋與5週年英雄選定禮包的吸引力似乎下降了。

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

東亞的課金玩家比例最高，其中台灣在本次問卷中居冠。不過，由於本次問卷的日本回答者非常少，我們無法確定這個比例是否符合日本實際的玩家群體。

{% include survey-chart.html id="paying_by_gender" %}

### 玩家在哪裡課金

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

LW直到今年才開始在網頁商城販售遊戲內道具，這是[Epic Games v. Google](https://en.wikipedia.org/wiki/Epic_Games_v._Google)訴訟的結果：該判決迫使應用程式商店允許遊戲開發商在商店之外收款，讓開發商可以支付較少的手續費。

{% include survey-chart.html id="physical_by_paying" %}

不出所料，購買過遊戲內道具的回答者也比較可能購買實體周邊，不過也有一些免費玩家會購買實體周邊。

## 遊玩風格

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

儘管問卷回答者的族群每年都在變動，LifeWonders也可能新增了更多遊戲功能，但這些圖表的整體形狀多年來仍大致相同。這款遊戲似乎已經固定了它所能吸引的玩家類型。

## 高難度任務

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

46.9%的玩家能完成90～100%的SS級。SSS級的比例則降到34.2%。

{% include survey-chart.html id="hdq_by_paying" %}

花越多錢的玩家，越有機會完成SS/SSS級任務，
但也有許多課金玩家在這些高難度內容中吃足苦頭。

## 遊戲要素評分

{% include survey-chart.html id="ratings_presentation" %}

對於一款以迷人角色為主要賣點的遊戲來說，多數回答者對角色設計和配音給出極高評價，並不令人意外。

{% include survey-chart.html id="ratings_illustrator" %}

回答者對LifeWonders處理畫師更換的方式也給出很高的評價，只有1.3%的回答者在這題表示不滿（評分1～2）。我認為這對公司和玩家群體都是好消息，因為這代表角色不必因為畫師的問題而減少劇情登場機會。

{% include survey-chart.html id="ratings_story" %}

整體而言，回答者對遊戲劇情面向的評分相當高。

{% include survey-chart.html id="ratings_gameplay" %}

- 近3/4的回答者對遊戲玩法設計持正面看法
- 近半數的回答者認為其他抽卡遊戲的抽卡系統比這款遊戲更好

{% include survey-chart.html id="ratings_bipolar" %}

- 近半數的回答者認為目前新內容的推出步調剛剛好，其餘的回答者則較傾向希望新內容推出得更頻繁

{% include survey-chart.html id="ratings_community" %}

- 超過半數的回答者對官方翻譯的品質給出正面評分
- 對官方翻譯的推出時程感到不滿的回答者比例更高

## 劇情閱讀

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

> 注意：這題可複選

- 日語閱讀能力在N1～N3程度的回答者，自然比較傾向直接在遊戲內閱讀劇情，但其中近30%也會依賴官方／粉絲／機器翻譯
- 84.5%的回答者日語閱讀能力低於N3
  - 42.4%依賴粉絲翻譯，28.8%依賴機器翻譯
  - 其中超過半數有閱讀官方翻譯的遊戲劇情（包括可能多年前讀過粉絲／機器翻譯的人）
- 11%的回答者玩這款遊戲只是為了收集角色，不以任何形式閱讀遊戲劇情

## 活動評分

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

- [Summer Montage Halation](/events/2607Montage/)的活動平均分數最高（4.34）
- 整體而言，日語閱讀能力高於N3的回答者，傾向給出比日語能力較低者更高的分數
  - 唯一的例外是[Summer Montage Halation](/events/2607Montage/)

## 其他遊戲

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="遊戲排序投票（全體）" %}

我不想重複太多去年的評論，你可以在[這裡](/blog/2025/community-survey-2025/#other-games)閱讀（英文）。

- **Gyee**：
  - 去年有超過三分之一的日本回答者從未聽過這款遊戲。但今年我在問卷中加上了遊戲的日文名稱，這個比例降到了7.1%
- **Another Eidos of Dragonvein** vs **XXL Woofia**：
  - 日本回答者傾向將這款遊戲排得比XXL Woofia高，其他回答者則相反。
  - 兩款遊戲都同步推出官方翻譯。在沒有語言隔閡的情況下，仍存在這種地區間的人氣落差，相當有趣。
- **Tamacolle**：
  - 令人意外的是，台灣回答者仍在玩這款遊戲的比例比日本回答者更高，但這可能只是因為日本回答者人數很少。

# 角色人氣

下方每個排行都可以依國家、地區、年齡、性別與遊玩狀態篩選，並與2024、2025年比較。點選角色可查看他的歷年變化。

{% include survey-ranking.html query="survey=lah&y=2026" title="角色人氣排行" %}

**支持率（全球）**

| 男性獸人 | 支持率 | 男性人型 | 支持率 | 女性／其他 | 支持率 |
|-|-|-|-|-|-|
|{% chara_link Pubraseer %}| 65.3% |{% chara_link Akashi %}  | 37.7% |{% chara_link Melide %}   |23.3%|
|{% chara_link Barrel %}   | 59.1% |{% chara_link Astar %}   | 36.7%|{% chara_link ⇌Melide %}   |19.4%|
|{% chara_link Monomasa %} | 53.3% |{% chara_link Ruchbath %}| 35.5% |{% chara_link Sensettia %}|17.1%|
|{% chara_link Ryekie %}   | 51.4% |{% chara_link ⇌Akashi %}| 32.3% |{% chara_link Sui %}       |16.6%|
|{% chara_link Sterio %}   | 49.4% |{% chara_link Roudin %}  | 28.5% |{% chara_link Flamier %}  |15.4%|

不出所料，男性獸人角色在今年的人氣排行中稱霸。「男性獸人」、「男性人型」和「女性／其他」三個類別的支持率冠軍與去年完全相同，恭喜他們成功守住王座！

{% chara_link Akashi %}在「所有最愛」排行（不限票數）中得票較多，但{% chara_link Astar %}在「前10名最愛」中得票較多。

LifeWonders現在正式推出了更多平行／異世界版本的角色，所以我第一次把他們納入問卷。

**平行版本角色的支持率（全球）**

| 版本1 |支持率| 版本2 |支持率|
|-|-|-|-|
|{% chara_link Akashi %}（勝） | 37.7% | {% chara_link ⇌Akashi %} | 32.3% |
|{% chara_link Broker %} | 26.8% | {% chara_link Branch %}（勝） | 31.5% |
|{% chara_link Melide %}（勝） | 23.3% | {% chara_link ⇌Melide %} | 19.4% |
|{% chara_link Crowne %}（勝） | 12.9% | {% chara_link Crowne (alter) %} | 6.0% |

{% include survey-chart.html id="top10_size" %}

每年都有人抱怨只能選前10名角色太少，在此提醒一下，也有許多回答者連10個角色都沒有選滿。

## 所有最愛：全球前25名（2026，n=403）

| 排名 | 角色 | 支持率 | 2025 | 排名變動 |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 65.3% | 65.4% | +0 |
| 2 | {% chara_link Barrel %} | 59.1% | 47.5% | +3 |
| 3 | {% chara_link Monomasa %} | 53.3% | 53.5% | -1 |
| 4 | {% chara_link Ryekie %} | 51.4% | 48.5% | +0 |
| 5 | {% chara_link Sterio %} | 49.4% | 40.8% | +6 |
| 6 | {% chara_link Giansar %} | 47.9% | 49.5% | -3 |
| 7 | {% chara_link Norbrand %} | 44.7% | 新進 | 新進 |
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
| 19 | {% chara_link Ruchbath %} | 35.5% | 新進 | 新進 |
| 20 | {% chara_link Astosis %} | 35.2% | 32.9% | -3 |
| 21 | {% chara_link Huckle %} | 34.5% | 25.7% | +6 |
| 22 | {% chara_link Galvo %} | 33.5% | 35.9% | -6 |
| 22 | {% chara_link Thuban %} | 33.5% | 新進 | 新進 |
| 24 | {% chara_link Gnomon %} | 32.8% | 27.5% | +0 |
| 25 | {% chara_link ⇌Akashi %} | 32.3% | 新進 | 新進 |

## 所有最愛：2025 -> 2026 支持率變動最大

| 角色 | 變動（百分點） | 2025 | 2026 | 排名（2025 -> 2026） |
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

## 前10名最愛：全球前25名（2026，n=403）

| 排名 | 角色 | 支持率 | 2025 | 排名變動 |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 44.9% | 49.2% | +0 |
| 2 | {% chara_link Barrel %} | 36.5% | 28.5% | +2 |
| 3 | {% chara_link Monomasa %} | 32.3% | 37.9% | -1 |
| 4 | {% chara_link Giansar %} | 28.8% | 32.2% | -1 |
| 5 | {% chara_link Sterio %} | 27.5% | 18.0% | +7 |
| 6 | {% chara_link Ryekie %} | 23.8% | 26.0% | -1 |
| 7 | {% chara_link Obsidius %} | 22.1% | 24.3% | -1 |
| 8 | {% chara_link Tsuneaki %} | 20.8% | 22.8% | +2 |
| 9 | {% chara_link Norbrand %} | 19.9% | 新進 | 新進 |
| 10 | {% chara_link Sadayoshi %} | 19.1% | 24.3% | -4 |
| 11 | {% chara_link Astar %} | 18.6% | 16.4% | +5 |
| 12 | {% chara_link Akashi %} | 18.1% | 24.0% | -4 |
| 13 | {% chara_link Denebora %} | 17.9% | 11.7% | +9 |
| 13 | {% chara_link Ruchbath %} | 17.9% | 新進 | 新進 |
| 15 | {% chara_link reXer %} | 17.6% | 23.5% | -6 |
| 16 | {% chara_link Yohack %} | 15.9% | 16.8% | -3 |
| 17 | {% chara_link Toshu %} | 15.4% | 19.3% | -6 |
| 18 | {% chara_link Astosis %} | 14.9% | 12.2% | +3 |
| 19 | {% chara_link Valoray %} | 13.9% | 14.4% | -2 |
| 20 | {% chara_link Mokdai %} | 13.2% | 13.4% | -1 |
| 21 | {% chara_link Huckle %} | 12.4% | 10.2% | +4 |
| 22 | {% chara_link Roiker %} | 12.2% | 5.7% | +24 |
| 23 | {% chara_link Gammei %} | 11.7% | 16.6% | -8 |
| 24 | {% chara_link ⇌Akashi %} | 11.4% | 新進 | 新進 |
| 25 | {% chara_link Viscunam %} | 10.7% | 7.9% | +9 |

## 前10名最愛：2025 -> 2026 支持率變動最大

| 角色 | 變動（百分點） | 2025 | 2026 | 排名（2025 -> 2026） |
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

## 排序投票制度

除了請回答者選出所有最愛的角色和前10名最愛的角色之外，我也請他們把前10名排成一個線性順序。

有了這些資料，我們就可以嘗試用蒂德曼方法進行排序投票。

<details open markdown="1">
<summary>蒂德曼方法（維基百科定義）</summary>

**排序配對（Ranked Pairs，RP）**，又稱**蒂德曼方法（Tideman method）**，是尼古拉斯·蒂德曼（Nicolaus Tideman）於1987年首次提出的一種錦標賽式排序投票制度。

如果有某位候選人在與其他每位候選人逐一比較時，都比對方更受偏好，排序配對程序保證該候選人會獲勝。因此，排序配對程序符合孔多塞贏家準則，也就是說，它是一種[孔多塞方法](https://en.wikipedia.org/wiki/Condorcet_method)。

排序配對一開始先進行循環賽，比較每一對候選人之間一對一的勝出差距，以找出受多數偏好的候選人；若存在這樣的候選人，就立即當選。否則，若出現由三位以上候選人構成的
[孔多塞循環](https://en.wikipedia.org/wiki/Condorcet_paradox)（類似剪刀石頭布的序列 A > B > C > A），則透過捨棄該循環中「最弱」的對決（即最接近平手的那一場）來打破循環。

來源：[Ranked Pairs (Wikipedia)](https://en.wikipedia.org/wiki/Ranked_pairs)

</details>

### 本次問卷對蒂德曼方法所做的主要調整

1. 令*集合X*（*X<sub>1</sub>, X<sub>2</sub>, X<sub>3</sub>, ...*）為出現在回答者前10名排名中的角色集合，另令*集合Y*（*Y<sub>1</sub>, Y<sub>2</sub>, ...*）為不在該回答者前10名排名中的角色集合
1. 對於每一組（*X<sub>i</sub>, Y<sub>j</sub>*），我們假設該回答者會將*X<sub>i</sub>* > *Y<sub>j</sub>* 排序
    - 這是必要的，因為我只請回答者排出前10名角色，而不是**所有角色**。要求回答者把所有角色排成線性順序，對大多數人來說太累也太無聊。

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_global.svg"
  title="排序投票（全體）" %}

### 特定族群的排名

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_united_states.svg"
  title="排序投票（僅美國回答者）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_japan.svg"
  title="排序投票（僅日本回答者）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_taiwan.svg"
  title="排序投票（僅台灣回答者）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_china.svg"
  title="排序投票（僅中國回答者）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_female.svg"
  title="排序投票（僅女性回答者）" %}

在**日本**，{% chara_link Monomasa %}是孔多塞贏家，而其他大多數族群則傾向由{% chara_link Pubraseer %}擔任（其中一位）孔多塞贏家。

在**台灣**，{% chara_link Ruchbath %}成為前10名中排名最高的男性人型角色。在**日本**，排名最高的男性人型角色則是{% chara_link Rastaban %}。

在**中國回答者**之中，沒有單一的孔多塞贏家，因為{% chara_link Pubraseer %}和{% chara_link Barrel %}互相勝過對方的機率各佔50%（平手）。{% chara_link Astar %}是中國前10名中唯一的男性人型角色。

**女性回答者**是一個小群體（只有{{ f.female_answered }}張選票），所以請對她們的圖表抱持保留態度：沒有孔多塞贏家，鎖定順序由{% chara_link Akashi %}領先，其後是{% chara_link Melide %}和{% chara_link Crowne %}。只有{% chara_link Pubraseer %}、{% chara_link Barrel %}和{% chara_link Sterio %}與全球前10名重疊。

## 路人角色與怪物

今年新增的題目：{{ f.mob_answered }}位回答者選出了他們最愛的路人角色，{{ f.kaibutsu_answered }}位選出了他們最愛的怪物。

### 路人角色

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="路人角色人氣排行" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="排序投票（路人角色）" %}

> 我是在寫這份報告時才發現，我忘了加入傭兵的平民形態……

{% mob mercenary-transform %}是排序投票中的孔多塞贏家。

**鎖定順序（前10名）**：{% mob Mercenary (Transform) %} > {% mob Wolfman (Summer) %} > {% mob Wolfman %} > {% mob Wolfman (Transform) %} > {% mob Ranger %} > {% mob Ranger (Transform) %} > {% mob Wrestler %} > {% mob Acolyte %} > {% mob Mercenary (Clown) %} = {% mob Acolyte (Transform) %}

**平手**：{% mob Mercenary (Clown) %} = {% mob Acolyte (Transform) %}

### 怪物

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="怪物人氣排行" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="排序投票（怪物）" %}

{% mob id-replica %}的支持率最高，而且與第二名的差距非常大！{% chara_link Exio %}一定會很驕傲。

**鎖定順序（前10名）**：{% mob Id Replica %} > {% mob Cetus/Plesiosaur Kaibutsu %} > {% mob Gatekeeper %} > {% mob Engine Kaibutsu (Adult) %} > {% mob Imposter %} > {% mob Palanquin Kaibutsu %} > {% mob Coal Tar Kaibutsu %} > {% mob Lizard Kaibutsu %} > {% mob Shark Kaibutsu %} > {% mob Ghost Kaibutsu (Adult) %}

## 最佳CP

共有{{ f.best_cp_respondents }}位回答者提交了{{ f.best_cp_pairs }}組配對。

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="最佳CP（至少兩位回答者選擇的配對）" %}

> 只有一位回答者支持的關係已省略，因為我認為那些太隨機了

| 配對 | 人數 |
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
| {% chara_link ⇌Akashi %} x {% chara_link Crowne (alter) %} | 2 |
| {% chara_link ⇌Akashi %} x {% chara_link ⇌Melide %} | 2 |

# 玩家意見分析

這份自由填答的分析是在LLM助理的協助下完成的，之後我手動檢查了用語／脈絡的歧義並加以修正，同時加上角色／連結的格式。

有幾個人在問卷中拼錯了{% chara_link Vergald %}、{% chara_link Norbrand %}和{% chara_link Theoreol %}的名字，我要吊銷你們的老公認證。

問卷在6週年之前就結束了，在這份問卷報告發布之前，LW又推出了一些新的改善：

- {% chara_link Thuban %}已經推出
- 主線任務第4章的官方翻譯
- 新形式的道具搜尋BOX，通關所需的體力更少

資料來源欄位：

- **`feedback`**：「對於遊戲在2025年9月30日至今推出的內容和改動，你有什麼想說的意見嗎？」（126則回答）
- **`improvement`**：「你希望這款遊戲有哪些改進？（選填）」（213則回答）

403位回答者中，有228位至少在其中一個欄位填寫了內容，111位兩個欄位都填了。幾乎全部都是現役玩家。已停止遊玩的玩家標記為`(stopped)`，只有大約12位。

## 如何閱讀

- **每則回答都先被拆成一個個獨立的論點。** 每個論點再歸入各自的類別。因此同一位回答者可能出現在多個類別中，冗長的回答也會被拆開。
- **`×N`表示有N位回答者提出了基本上相同的論點。** 後面的國家代碼列出了這些回答者，因此N可以被核對。`~N`是針對非常大的主題的約略人數，來自關鍵字比對並經過閱讀交叉檢查。若同一個國家在兩個欄位中出現近乎相同的文字，只計算一次。
- **每個類別都把玩家喜歡的部分與他們批評或要求的部分分開。** 需求會被歸在負面／需求這一側，因為它代表著某種缺口。
- **引用的話經過刪減，但除此之外都是逐字照錄。** 我不確定該怎麼翻譯的用語會保留原文。
- **國家代碼**使用ISO代碼（ES＝西班牙，SV＝薩爾瓦多，MO＝澳門，GB＝英國）。`(F)`表示該論點來自`feedback`欄位，`(I)`表示來自`improvement`欄位，僅在這有助於理解脈絡時標示。
- **遊戲用語。** *抽卡貨幣*：「ether crystal / ether stones / stones / gems」、乙太虹石（ID回答者也會在抽卡與保底的脈絡中把它寫成「ether quartz」）。*平行石英*（*Parallel Quartz*，或簡稱「quartz」、平行石英／水晶）則是另一種東西：它是一種**可刷取的養成素材**，現在取得方式緩慢且有限（§3.9）。點數兌換商店是契约所／Search Structure／「search exchange」。「Housamo」（放サモ／放課後サモナーズ／TAS／「Tokyo Afterschool Summoners」，姊妹作）經常被拿來當作比較基準。

---

## 摘要：玩家最想要什麼

| # | 主題 | 規模 | 傾向 |
|---|---|---|---|
| 1 | **翻譯**：更快、固定、完整、品質更好、更多語言 | ~95位回答者（~40%的填寫者） | 壓倒性地要求「更多、更快」。官方翻譯本身也是最受稱讚的改動。 |
| 2 | **抽卡經濟與保底**：更多免費貨幣、更低或更柔和的保底、更好的機率 | ~85（~37%） | 多為負面：「小氣」、「要等一年才拿得到一次保底」。 |
| 3 | **自動戰鬥／業務／讀取方面的便利性改善（QoL）** | ~40 | 最受喜愛的機制面改動。後續需求：預設開啟自動、自動戰鬥不會觸發被動、跳過／掃蕩、讀取時間。 |
| 4 | **舊角色與弱勢角色**：技能樹的推出頻率、強化、數值膨脹 | ~25 | 希望更常推出。舊的非限定角色，技能樹至少每季一次。 |
| 5 | **活動呈現**與**活動頻率／箱子活動** | ~35 | 呈現方式（互動式地圖、卡片）受到稱讚。頻率、復刻與箱子形式則被批評。 |
| 6 | **alt與角色呈現**：指名的alt需求、女性5★、體型 | ~30 | 有許多具體的角色需求（列於§4）。 |
| 7 | **內容深度**：終局內容、可重複遊玩的模式、新模式 | ~20 | 「未探之境」（Exploring the Unknown）風格很受喜愛。希望有更多。 |
| 8 | **技術面**：讀取、卡頓、bug、帳號／資料備份 | ~25 | 讀取已有改善，但仍是最令人困擾的問題之一。帳號保存是反覆出現的痛點。 |

---

## 1. 翻譯

~95位回答者提到了翻譯，是目前最大的單一主題。其中許多人只寫了「translations」或「faster translation」。

### 1.1 正面

- **有官方翻譯這件事本身，就是最受稱讚的改動**（~25）。
  - 「儘管遲了5年，這是這款遊戲有史以來最大的進步」（ID）。
  - 「很高興遊戲在5年後終於有了官方翻譯。我一直很期待下一批翻譯推出，好讓我學習並愛上更多角色」（US）。
  - 「對遊戲的易用性來說是很大的一步」（US）。
  - 「翻譯幫助很大……等不及現在每隔幾個月就能看到釋出了」（US）。
  - 另外還有來自AR、PR、PH、SG、ID、MY、UY、TW、BR、MO的回答。
- **翻譯有商業上的效果。** US：「翻譯確實讓我在這款遊戲上花了比平常更多的錢，因為我對角色產生了更深的情感連結。」
- **中文化被點名為加分項**（TW）：加分：中文化，系統優化。
  - 另一位TW回答者：介面與內容的中文化能更融入遊戲，所以受到肯定，但還不算無縫。
  - BR（以中文書寫）：翻译越来越多，越来越快。
- **已推出的批次有被注意到。** US(F)：很高興拿到第3章和兩個過往活動，不過他們指出今年的主線翻譯很少。
- **即使不完美，付出的努力也被認可。** TW：「雖然翻譯文字在字型和位置上還需要改進，但這是非常受歡迎的新增內容。」MY：「英文翻譯更新有點陽春，但非常感激。」US：「即使翻譯還沒有100%完善。」

### 1.2 負面／需求

**A. 速度與推出頻率（最主要的抱怨，~60）**

- 單純的「更快／更多翻譯」×~45。許多是只有一句話的回答，來自US、GB、FR、PL、BR、SG、ID、PH、LT、VN、MA、TW、CN等。
- 措辭強烈的：
  - 「翻譯的速度不可原諒」（CY）。
  - 「非常慢，令人失望」（FR）。
  - 「他們更新舊翻譯的速度太慢，頻率也太低」（US）。
  - 官方翻譯真的太慢了（TW）。
  - 「LW請快一點……我的人生都給你」（PH）。
  - 「離譜，我們等了六年才等到英文，還得等更久才能等到緩慢的釋出」（US）。
- **批次大小與頻率**：「每隔幾個月一兩個是不錯的開始，但現在已經是9月中了，我們只有第1章的第3冊和3個支線活動」（US）。其他人要求「更快／更大的批次」（US）以及「更頻繁的英文翻譯更新」（BR、US）。
- **與日本同步推出**（×~8：ID、TH、US、FR、BR、AU、MY、PH）。
  - ID：「讓英文翻譯與日本的推出同步，這樣國際粉絲也能一起享受。」
  - TH：希望新劇情的英文版「與日本一起」推出。
  - FR：「推出後盡快，或是立即。」
  - MY：在翻譯舊的積壓內容的*同時*，也翻譯最新的內容。
  - US：「如果這代表我們能和日本玩家同步拿到內容，我甚至願意接受機器翻譯。」

**B. 時程透明度（×5）**

- PH：「希望他們正式宣布翻譯，而不是讓人突然發現官方翻譯已經推出了。」
- VE：「推出時請更清楚地說明。」
- PR：「希望能有更多關於翻譯時程的溝通。」
- PH和BR：想要*固定的*時程。
- VN：「更規律地更新。」

**C. 仍未翻譯的部分（涵蓋範圍的缺口）**

- **主線劇情**：仍然只有部分（US、MA、MX「我只能讀到大約一半」、EC、GB「更多主線劇情」）。
  - CN：主線從第1部第4章開始就沒有翻譯。剧情第一部第四章就没有中文翻译了，新活动也没有翻译。
  - 玩家要求翻譯「主線劇情與活動」（CN、SV、CL）。
- **角色任務與連結任務**（×3：FI ×2、PH）。FI：「角色任務和連結任務沒有英文翻譯。」
  - PH擔心遊戲會「跟隨Housamo，不翻譯主線和活動以外的劇情。」
- **活動劇情**：新活動（CN、CL、TH、SV、ID）與**復刻活動**（×4）。
  - US：「如果活動要復刻，就應該推動它的翻譯。」
  - TH：「復刻活動應該像Housamo一樣附帶英文翻譯。」
  - SV：「在活動復刻時，把缺少的章節和活動翻譯出來。」
  - AU：「復刻活動的翻譯。」
  - CL：也希望英雄的「約會」被翻譯。
- **技能、技能樹、能力與狀態**：
  - GB：「希望技能樹在遊戲內推出時就附有翻譯，這樣更能直覺地理解角色的技能組。」
  - MY：「技能樹在推出時沒有翻譯真是太誇張了，因為那原本就是它們的賣點，至少技能會被翻譯。」
  - ID：「至少要更快地翻譯技能。」
  - TH：有些英雄技能「還是用日文」。
  - US：「能力、狀態、助手和UI元素仍然沒有翻譯。」
  - CN：增加中文翻译，包括主线/活动剧情、角色技能等。
  - MO：新角色的技能文字已經變成「小作文」，即使有官方中文，他們還是需要由其他網友撰寫的重新措辭的中文技能說明（中译中）才看得懂。
  - ES：「減少冗餘的文字」
  - ID：希望卡池中新角色的*戰鬥試玩*也被翻譯，讓非日本玩家能看到技能機制和建議。
- **UI**（×4：US(I)、FI、ID、PH）。「完整的UI翻譯」（US）。
- **語音／戰鬥台詞字幕**：見§4.4。

**D. 翻譯品質與UI適配**

- 文字溢出UI框（FI、PH「只要確保UI能容納翻譯就好」、ID「修正目前遊戲內的文字顯示問題」）。
- 缺字，漏字的bug（CN）。
- 品質尷尬：「對於這麼大的遊戲來說，劇情翻譯有點丟臉」（ES）。
- 單純要求更用心：翻译认真一点啊（CN）、翻译用心点（CN）、「品質必須要好」（BR）。
- 字型和位置需要改進（TW）。
- 「在1到2年內修正翻譯」（TW）。
- **Bug**：「有時英文語言不知為何會變回預設」（RU）。

**E. 方式**

- CL：希望翻譯更快「但仍然由人類完成。不要AI或機器翻譯。」
- US：如果這代表能與日本版同步，就願意接受機器翻譯。
- MY：如果他們真的僱用更多英文譯者，「就能更快追上最新內容。」

**F. 其他語言**

- **中文**：簡體中文×~7（CN），繁體中文×~6（TW、HK）。
  - HK：希望官方可以加快劇情翻譯的進度。
  - CN：新活动剧情追加多语言。
  - TW：更多劇情翻譯，活動劇情能更貼切展示當期sp角色。
  - TW (stopped)：讀取真的問題很多，不能skip也很耗費耐心，龍脈有完整翻譯，這邊幾乎沒有。這是對讀取時間的抱怨，加上與另一款遊戲「龍脈」（Another Eidos of Dragonvein）的比較，該遊戲有完整翻譯。
- **西班牙語**（EC「Spanish version」、SV「Include Spanish」）。
- **泰語**（TH：「官方泰文翻譯感覺是個非常遙遠的夢」）。
- 未指明的「更多其他語言的翻譯」（PH）、「多語言支援可以繼續擴大」（AR）、「非日語語言的實裝很慢」（MY）。
- 反方意見：能讀日文的US回答者：「雖然我能讀日文，但那仍然不是我的母語。」

---

## 2. 抽卡系統

~85位回答者。使用的用語：{% include item.html name="Ether Crystal" %}／ether stone(s)／乙太虹石（以及部分ID回答者寫的「ether quartz」）＝付費或免費的抽卡貨幣。這與{% include item.html name="Parallel Quartz" %}（養成素材，§3.9）是分開的。ticket＝以太券；「200 pull / spark / pity」＝200抽兌換保底。

### 2.1 正面

- **今年抽卡經濟有所改善。** US：「LW努力透過5.5週年期間的限定券，以及活動期間更頻繁的登入獎勵來提升抽卡經濟，又是一個好跡象。」
- **逐步的改善有被認可。**
  - TW：福利有變好在改善了，但感覺還是少了一點點。
  - JP：「LW對抽卡做了調整」（但見2.3）。
- **卡池功能與商店受到稱讚。**
  - ID喜歡**召喚卡池中的戰鬥試玩**。
  - ID喜歡**每週商店**以及**可購買的過往活動英雄輔助造型**。
- **被移除的箱子兌換**被形容為「還好他們把它拿掉了」（MY(F)，指「Echoes of frontier memories」；見§6.2）。
- **4★英雄變體回歸**被稱為「對不受歡迎的角色來說是個有希望的跡象」（US；見§4.1）。

### 2.2 負面：免費貨幣收入（~65）

- **泛泛的「更多免費石頭／寶石／水晶」**：×~40，幾乎每個國家都有。典型的措辭是「More gems」、「more pulls opportunity」、「more free stones」、「more ways to earn stones」。
- **「小氣」的說法：**
  - BN：「對一款小眾遊戲來說，感覺很小氣。」
  - CY：「在素材上，尤其是在抽卡上，不要那麼小氣。」
  - RU：「抽卡貨幣很小氣。」
  - IT：「這款遊戲真他媽小氣……應用程式內購買很貴……得存將近一整年才能保底1個角色，讓人很沮喪。」
  - US：「以太晶石的經濟爛透了。還得等一年才能保底想要的角色，很糟。」
  - VE：「就算拼命存，一年也只能拿到2次天井。」
  - BR：「獎勵比它的前作TAS還少。」
- **具體數字：**
  - TW：福利非常少，一個版本只能湊到10~20抽。
  - TH：「一個版本至少50顆寶石」、「一個月至少100顆寶石」，以及「這就是為什麼玩家這麼少。」
  - TW：相比其他同市場的遊戲，寶石給的數量會讓人想退坑。
- **對免費玩家的看法**：「讓遊戲更適合F2P」（US）、「給F2P玩家更多免費5星」（TH）、「現在F2P玩家很難玩」（TH）。還有「福利角色過時」（RU ×2：「大部分福利角色都過時了」以及「更多可用的福利角色」）。
- **與其他遊戲比較**：Project Sekai「我仍然有辦法取得貨幣」（LT）；Eidos「最過分的一個」（US、IT）。
- **具體的收入需求：**
  - 每日以太晶石（TH）。每日任務獎勵（PH）。
  - **更好的每週與累計登入獎勵**（×4：PH、ID、US、US）。
  - 以太券的連抽選項（RS）。
  - 每個需要券的任務都能使用全部三張券（FR）。跳過券（US，已停止）。
  - **可重複取得的水晶來源**（US(I)：「希望LW為以太晶石增加其他可重複的來源，因為刷起來慢得離譜」）、「更多可以刷水晶的內容」（PH；不確定指的是抽卡貨幣還是養成素材，歸在這裡是因為同一份回答還要求更多收集資源的方式與更便宜的里沃購買）、「更多取得石頭的任務」（MY）。
  - 每月「Simulator」（GB(F)，逐字：「Change Simulator to Monthly」；可能指強敵模擬裝置的獎勵）。
  - 「會頻繁重置的終局內容」，用來刷寶石（VN）。
  - US：「尤其是[F2P玩家]通關劇情之後。」這位回答者提議把劇情章節拆成更小的部分，讓每次完成都能獲得寶石獎勵（見§5）。
  - 更好的每日卡片抽取提醒（US）。
- **與保底混合的**：「更多寶石收入，和／或更好的保底」（AR）、「如果抽卡維持現狀，就要有更多每日或每週的免費寶石」（US）。

### 2.3 負面：保底、天井與機率（~40）

- **200抽的天井太貴／太慢達成**（×~15）。
  - 「以這麼低的機率，希望不用抽到200抽才能保底一隻限定5星」（US）。
  - 減半：降井（200→100）（CN）、「保底一個角色所需的寶石數量應該減半」（US）、「保底5星所需的抽數更少」（DE）、「降低抽卡點數……越多人抽卻還是沒拿到角色，就越讓人沮喪」（MY）。
  - 「把1抽所需的石頭從5顆降到2……3……4顆」（TH ×2，F和I）。
  - 「提升抽卡經濟，減少為200抽保底存石頭所需的時間」（US）。
- **保底不會在卡池之間繼承**（×5）。
  - LU：「200抽保底不會在卡池之間繼承。他們應該要讓它能繼承，或是大幅提升抽卡經濟。」
  - MY：或者能繼承保底數。
  - SG：「一個累積式的保底系統，因為F2P玩家很難為了單一保底存到200抽。」
  - CN：契约所（點數兌換商店）的點數無法帶到下一個卡池。這位回答者要求**在每個卡池的契约所加入100點的檔位**，因為「抽到80～90點有時就已經抽到想要的角色了，但商店只列出200點的兌換」。他們覺得等到200點很浪費，剩下的90點也沒辦法使用。
  - US：「剩餘的保底可以像Housamo那樣換成券。」
- **沒有軟保底／機率遞增**（×6）。
  - VE：「導入保底系統（也就是隨著抽數增加而提高機率，而不只是天井）。」
  - JP：「無論抽多少次，5星的機率都不會改變……我真的很希望他們做出保底系統或提高機率。」
  - FI：「更好的保底系統，或乾脆讓5星機率更高？」
  - US：常駐卡池的天井「或至少每五到十抽就提高一次機率，直到抽到5星為止」。
  - US：保底「和其他抽卡遊戲相比糟透了，Eidos除外」。
  - PH：「更好的抽卡機率／保底，或更多免費／活動寶石。」
- **機率與公平性**（×~10）。
  - 「好得多的抽卡機率」（US，已停止）、「抽卡系統非常不公平」（MX）、「抽卡系統也相當不公平」（ES）、「對英雄掉落率更友善一點」（TH）、「提高限定角色的抽取機率」（MY ×2：F和I）。
  - TW：機率提高。
  - 單純的「更好的抽卡系統」（RU、VN、FR、ES、US、BR）。
- **兌換保底／商店保底**：ID點名「ether quartz、抽卡券和search exchange保底」。嚴格的收入讓較新的玩家很難為新英雄抽卡。
- **沒能拿到特定角色的挫折**（不是設計上的抱怨，而是情緒訊號）：US(F)抽Huckle的alt槓龜；MY(F)「用光了所有以太晶石卻沒拿到Andrew和Huckle」；US「更好的抽卡，讓我能拿到我的該死的S.Hydoor」；US「我又一次在S.Hydoor上被坑了。」

### 2.4 點數商店、選擇券與兌換

- **免費限定5★選擇券／自選禮包**（×4）：能不能出限定五星的自选礼包？（CN，F和I）、多點自選禮包（TW）、「Free limited 5* selector」（TH）、「給F2P玩家更多免費5星」（TH）。
- **Search Structure／點數兌換商店**：
  - 加入舊角色讓他們可以購買（IT）。
  - 「更新商店的兌換品項（里沃、search structure等）」（ID）。
- **好友點數抽卡**：「更新／改善好友點數抽卡的獎勵」（US），以及「讓Ally Points有更多用途」（US，已停止）。
- **抽卡後轉換的便利性**：「記錄立方的全部兌換按鈕」（PH）。ID希望能批次把多餘的記憶碎片和助手之心轉換成記錄立方，因為抽卡後一個一個轉換很麻煩。（亦見§3.6。）

### 2.5 卡池與復刻頻率（卡池面）

- **復刻太重複**：「復刻太多了。通常每2個月才有新內容」（SE）。
  - PH（非二元性別）：「更多舊角色／alt的混合復刻卡池，而不是一再復刻他們的首次登場卡池。」
  - TW：瘋狂復刻劇情活動，久久才一次新的。
- **alt的等待時間**：
  - 「這樣角色的alt才不會要花，比方說，三年才出現」（MX）。
  - 「不要花太長時間才公布新的角色alt」（MX(F)）。
  - JP：新しいキャラクターを先行公開するなら半年以内には実装してほしい（如果要先公開新角色，希望半年以內實裝）。
  - JP：ディグラムとテオレールの限定化を早く…頼む…（希望能盡快推出{% chara_link Digram %}和{% chara_link Theoreol %}的限定版……拜託……）。
  - PH：「第2個alt的出現，讓等待不太受歡迎角色的第1個alt的痛苦更加殘酷。」
  - SE：「優先給還沒有alt的角色alt」（角色清單見§4.1）。
- **兩極化**：US寫道「得到alt的角色很公平」，但沒有動力去抽。VN「我強迫自己使用基礎英雄，而不是限定英雄，因為我只有一個alt英雄」。

### 2.6 定價與營利

- **月卡／每月禮包**（×3：ID、PH、TH）。PH：「一張負擔得起的30天月卡……為低課金玩家提供更實惠的遊戲內購買。」TH：「好的月卡，這樣我就能花比較少的錢獲得以太晶石。」
- **更便宜的石頭禮包**（×4：TW 課金石變便宜一些；US（已停止）「Lowered Stone Prices」；PH「更便宜的里沃購買」；IT「In-app purchases are EXPENSIVE」）。
- **瞄準「海豚」**而非鯨魚的商店優惠（US）。
- **中國支付**：CN希望有中国区氪金平台的支援。在網頁商城上他們遇到錯誤0003-0003（「此地區無法使用該付款方式」），並提議加入**微信支付與支付寶**。
- **營利與翻譯的訊號**：見§1.1（US表示翻譯讓他們花了更多錢）。

---

## 3. 遊戲功能意見與需求

### 3.1 QoL與自動戰鬥

**正面（~40位提到某項QoL改善）**

- **自動戰鬥／連續自動／自動重複**（×~10：US ×4、ID ×2、TW、UY、MY、US 非二元性別）。「Autumn Campaign光是因為新的體力和自動戰鬥功能，就成了我最喜歡的」（US）。「終於加入自動戰鬥了，感謝上蒼」（ID）。連續戰鬥便利性很棒（TW）。
- **業務（Sales）改版**（×~9：FI、US ×3、ID ×2、MY、UY、TW）。「輕鬆多了，不再是苦差事」（US(F)）。「管理業務一直都很痛苦，尤其是在工作很累的日子，或是業務通知沒有響的時候」（FI）。派遣可以分時段領取收穫（TW）。MY：「業務改版和跳過戰鬥讓遊戲快多了。」
- **讀取時間與速度**：「感謝老天，他們在最新的更新中改善了讀取時間」（US）、「遊戲跑得更快了」（UY）、系統優化（TW）。
- **多倍體力／連續戰鬥**：「以倍數消耗體力」的功能受到歡迎，但見下文。
- **Never-ending jobs**（TW）：「是件好事」。
- 整體：「9/17更新的QoL改動全都非常好」（US）、「LW真的有在聽玩家的意見」（MY）。

**負面／需求**

- **自動戰鬥預設為開啟**（×2：US(F)「預設為自動戰鬥並不[好]」、US(I)「把自動戰鬥的預設改回未選取」）。
- **自動戰鬥會在不需要的內容上觸發**（US(F)）。
- **自動戰鬥不會使用被動／S4技能**（×3）：ID「自動戰鬥沒有連動被動技能的發動」、UY「自動戰鬥中能由被動技能發動S4」、US 非二元性別「新的助手被動，或是重做一個能自動儲存並重複先前手動戰鬥中所有操作的系統」。
- **9/17更新的bug很多**（US）。
- **Never-ending jobs無法中途更換英雄**（TW）。
- **用跳過／掃蕩取代重複**（×~7）。
  - US 非二元性別：「新增的以倍數消耗體力的功能不錯，但你還是得重複打關卡，而不是直接跳過。」
  - US：「剛推出的連續戰鬥不錯，但如果有跳過功能會更好。」
  - CN：一键扫荡，另外對於「挑戰次數3」的任務，希望只消耗3倍體力，而不是打三次。
  - ID：「讓關卡可以一次跑多次的功能。」
  - US（已停止）：跳過券。
  - VN：「遊戲內的Blitz（快速通關）。」
  - PL（已停止）：「我希望能用同一個活動關卡打3次來完成每日0/3的挑戰任務，而不是1次要用券、2次不用券。」
- **加速**（AR「加速戰鬥的按鈕」；CN 战斗高倍速（2～3倍速））。
- **戰鬥中**：「能在戰鬥選單中重新開始戰鬥」（FI）、「戰鬥中可以輕鬆查看的數值資訊」（CO）。
- **重複刷關卡**（CN「减少通常关卡的重复攻略数」、US「可以跳過重複關卡／刷素材的選項」）。

### 3.2 辦公室與業務

- **辦公室感覺很陳舊／互動性低**（×6）：CN 更新一下办公室，已经很久没有新东西了；TW 辦公室功能互動感很低；US「辦公室可以擴充嗎？它有點陳舊了」；ID「辦公室新增強化英雄與助手基礎數值的功能」（就像其他遊戲的角色等級上限擴充）；AU「達到最高階級後，公司章就沒有其他用途了」；ID「辦公室的新功能」。
- **辦公室禮物／簡報應該像業務一樣採用時間累進**（×4）：TW 辦公室的送獎 可以跟業務一樣改成時間累進；BR「像業務改版那樣，讓人能在達到最大時間上限之前就領取辦公室簡報的方式」；TH「像業務任務那樣改善辦公室的禮物」；以及類似的意見。
- **公司章**：AU：達到最高階級後沒有用途。US：「更多取得公司章的方式」、「通用的公司章取得方式」。

### 3.3 未探之境（Exploring the Unknown）／探索模式與地下城

**正面**

- 「最新版本的Exploring The Unknown真的很好玩，挑戰性也恰到好處」（US）。
- 「開發團隊應該更常採用Explore the Unknown風格！那超級好玩，而且很容易重複遊玩。我可以想像，如果活動用這種方式進行，參與度會好得多！」（US）。
- 「地下城模式的可重複遊玩性真的很棒！」（US）。
- 終局內容「就它是個謎題而言，其實相當困難」（US，正面偏中性）。

**負面**

- MY：「我不喜歡新的探索模式」以及「讓探索模式不要那麼難，比如讓普通模式不要那麼難」。
- ID：數值膨脹，「尤其是最新的探索模式」。
- US：「為舊的Exploration按F致意。」

### 3.4 英雄收藏卡（Hero Card Collection）

**正面**

- 「有趣……希望他們能再擴充」（US）。
- 「即使沒有為遊玩增添什麼，也相當不錯」（US）。
- 「Summer Montage Halation中的Summer Trading Cards」（US，作為活動視覺效果）。

**負面／需求**

- TW(F)：扣分：英雄卡片蒐集（負面，沒有給出理由）。
- CN：閃亮多邊形效果造成的**眼睛疲勞**，讓卡片看起來像實體的閃卡。這位回答者因為這個原因沒有升級任何Summer Montage卡片，並要求**提供關閉卡片特效的開關**（自主选择是否开启英雄卡特效，(I)中也有）。
- 獎勵（IT）：「收集卡片應該給予一些獎勵（桌布、石頭、自訂頭像等）」。
- 更多功能（IT）：桌布、主畫面、獨特插圖。
- 在玩家個人檔案上顯示選定的卡片（PH 非二元性別）。
- ID：能**快速購買**卡片稀有度所需的「綠色三角形」素材，而不必特地去商店。

### 3.5 客製化與個人檔案（×~12）

- 更換主畫面**背景**（TW、VN、MA「新的主選單」）、**首頁音樂**（CN ×2：希望能更换主页的音乐 和 自己更换主页音乐）。
- **名片**的多樣性與角色互動組合（TW）。名片背景最多可放4位英雄或助手（TH）。
- **個人檔案圖示選項**（PH 非二元性別）、「個人檔案頭像換成遊戲內角色」（TH）。
- **桌面客製化**（GB）。更多通用的角色**裝飾**（MY，角色模組的小裝飾）。
- **稱號**（TW）：稱號上的「new」徽章會迫使玩家點擊新稱號，同時也會裝備它。這「對有強迫症的人不友善」。這位回答者希望能把稱號鎖定。
- **造型系統／高級造型**：「做一個造型系統或更多角色配件」（VN）；像明日方舟和重返未來1999那樣，可更換整套服裝與VFX/SFX的高級造型系統（US）；見§4.3。
- 能查看所有角色、路人角色與特殊NPC的**圖鑑**（US）。
- **登入日曆／歷史**以及**玩家資訊與統計頁面**（AR）。

### 3.6 編隊、UI、排序與選單

- **更多編隊／配置欄位**（×3：CN 可以保存更多编队；TW 希望有更多編組 ×2（F和I）；US「更多配置欄位」）。
- **6人隊伍**（BR），以及**支援隊伍**的限制：MY 助戰角色編成那邊如果可以拔掉屬性限制改為最多編入6位任意屬性的角色也不錯。
- **記住排序／篩選**（×3：VN、CN、BR「UI排序系統」）。CN：在备战界面将排序设置为"Lv"+"降序" 每次都會重置。
- **角色定位篩選**（ID：「只顯示特定定位的英雄」）。
- **助手技能篩選與熱門被動推薦**（TW：助手技能的塞選不夠多，或是建立大家在目標角色上近期所搭配的被動使用次數前幾名 (類似於角色之推薦被動搭配)）。
- **「使用上次隊伍」需要永久移除的選項**（US）。
- **捷徑**：「從階級提升畫面直接前往升級畫面」（US）、「{% include item.html name="Record Cube" %}的全部兌換按鈕」（PH）、「批次把多餘的英雄記憶碎片或助手之心轉換成記錄立方」（ID）。
- **換新手機時造型的紅點**（US）。
- **選單笨重／改善選單**（US(I)、US、BR「一些UI改動」）。
- **CN的詳細UI清單**（因為異常具體而保留）：
  1. 讓**主線入口**比活動入口更醒目。活動入口過大，彷彿在引導新玩家去玩活動，而且點擊活動時會再次顯示活動任務畫面。
  2. 點擊新關卡時，加入「進入？」的確認（誤觸會觸發兩次「連線中」的等待）。
  3. 在**支援選擇**畫面左下角的返回按鈕加入確認（因卡頓而連點兩下會退出戰鬥準備）。
  4. 長按英雄／助手時，應先開啟**技能組**而不是數值（並去掉閃爍的黑色「連線中」畫面）。
  5. 重新設計**「习得装备技能」**，讓裝備技能一開始就可使用。目前光是為了更改施放順序就要佔用一個技能欄位。
  6. **連線中**的速度：從抽卡／編隊／商店回到主畫面時會強制進行連線步驟。請改為背景進行或移除。戰鬥讀取從點擊關卡到支援選擇需要十幾秒。切換到其他應用程式再切回來，會讓「連線中」卡住好幾分鐘。
  7. 依每個畫面記住排序設定。

### 3.7 效能、bug與技術問題

- **讀取時間**（×~6）：ID、CO、FI、CN（見上）、TW（已停止）、US。有人稱讚最新的更新（US）。
- **卡頓**：「有些英雄的動作讓整個體驗變得卡頓。我用的是高階系統，兩台裝置上都會發生」（ID，F和I）。US：「能關閉／跳過技能3、戰鬥中角色與動態背景的動畫，以減少卡頓的選項。」
- **Bug**：「很多bug」（BR）；TW：「修正一些bug……並更快回應bug修正」；TH列舉：標題畫面卡住2～3次、編隊重新命名的錯誤彈窗（反覆出現）、英雄／助手清單有時消失（需要重新登入）、換圖功能缺少表情。
- **下載大小**（US：「更短的下載時間」）。
- **技能3／必殺技跳過選項**（TH「戰鬥中跳過技能動畫」、「更快的技能動畫選項」）。

### 3.8 戰力平衡、技能組與技能樹

**正面**

- 有注意到新的技能樹：「雖然截至這篇發文時的新更新已經新增了兩個技能樹」（AU）。

**負面／需求**

- **舊角色技能樹的推出頻率**（×~15）。最具體的：
  - JP：「スキルツリーの追加ペースに不満がある。2026年は1月と9月の2回のみで、いずれも限定☆5キャラクターのみだった」（對技能樹的新增步調不滿。2026年只有1月和9月兩次，而且都只有限定☆5角色）。他們還補充，在新增{% chara_link Furlong|h2 %}的連結任務時沒有同時推出他的技能樹，是錯失的機會，並要求提高頻率。
  - ID「請盡快透過技能樹改善過去英雄的技能組」、「沒有技能樹的老角色吃足了苦頭……就算有一個也還是廢，像{% chara_link Ryekie|h2 %}」。
  - PH：更新**舊的技能樹**，使其與新的看齊（例如{% chara_link Akashi|h1 %}的技能樹「亂七八糟」）。
  - US「更頻繁地為舊的非限定角色推出技能樹」、「更快更新較弱角色的技能樹」，ID「更常為過時的角色新增技能樹或強化他們」，UY「為舊角色推出技能樹，尤其是發動機率低的技能，以及會造成燃燒或中毒的角色」，BR、PH，TW（舊角色強化一年能多2-4隻），TH（「更多舊角色的強化」）。
  - FI：{% chara_link Pubraseer %}的3★和5★技能樹。
- **數值膨脹**（×3）：ID「數值膨脹開始變得太過頭了（尤其是最新的探索模式）」；JP：火屬性英雄的戰力平衡「突出して高い」（高得突出），而新的水屬性英雄大多是攻擊型，不平衡。TH：「你正在培養的英雄很可能已經被更新的英雄在環境中淘汰了」（PW碎片取得緩慢）。
- **技能組設計**（×~6）：
  - 「設計得更有趣、傷害也好的技能組」（BR）。
  - 「讓英雄技能組與玩法取得平衡，這樣就不會有英雄被冷落」（ID）。
  - 「實裝獨特或更靈活、不會被嚴格限制在非常特定的小眾機制上的技能與技能組」（US）。
  - 「隊伍類型不要那麼依賴高級角色」（US）。
  - 「做更有趣的4★技能組！抱歉MQLoren你不是（除非是障壁升級。請修好障壁）」（US）。
  - **護盾機制**：「護盾會疊加到其他護盾上，而不是覆寫它們」（GB）。
  - 「給主角的助手技能一點小強化，像是免費給VP」（FI）。
- **個別角色強化需求**：加强木贞（CN，「加強{% chara_link Sadayoshi|h2 %}」）、「強化基礎版{% chara_link Barrel|h1 %}」（PH）。
- **難度／輪替**：
  - 「更多高難度關卡，讓我有理由使用不同的角色」（US）。
  - 「更頻繁更換SSS輪替」（GB）、「更好的SSS/SS多樣性」（US）。
  - 「SSS任務不錯，雖然還可以更多樣」（US(F)）。
  - 把3★以下的限制提高到4★以下（US）。
  - 挑戰任務允許其他／推薦的編隊（US）。
- **理解度**（×5）：為新玩家說明角色的核心機制，像是試煉任務（NG）；「配裝指南」（ID）；「好友／社群英雄通關清單」（AU「為我們擁有的英雄標示重點」）；「推薦好友／社群的隊伍」（VN）；更容易理解的玩法／養成（US，已停止）；「能提供不錯協同效果的陣容或英雄推薦」（ID）。

### 3.9 成長、素材與資源

- **{% include item.html name="Parallel Quartz" %}／平行石英／水晶（可刷取的養成道具，不是抽卡貨幣）**：玩家表示現在取得的方式緩慢且有限（×4：CL、TW（F和I中文字相同，只計算一次）、TW、GB）。
  - CL：「可以無限刷取的Parallel Quartz，而不是被鎖在每日券任務和活動獎勵之下」。
  - TW：希望素材緩和(尤其是平行石英)（F和I）。
  - TW：平行武裝強化耗的水晶有點高。
  - GB：「更好的水晶刷取方式」。
- **{% include item.html name="Dream Symbol" %}／{% include item.html name="Astro Credit" %}**應該可以刷取，而不是只靠活動獎勵與每月商店（CL）。
- **7★素材**可以刷取，而不是靠每月商店更新（US）。
- **PW碎片速度**：「花了2個月才滿1個，所以基本上要8個月才能養成1支隊伍」（TH）。
- **力量石**：一次取得更多，以及能給出組合的券種變體，例如「6個小、5個中、3個大」（FI）。
- **經驗值／升級**：CN表示新手無法把高星英雄升到Lv.60，因此打不了高難度的活動內容。他們要求更多經驗值道具，以及更高的經驗值／里沃（金幣）關卡獎勵。
- **星辰碎片**：移除4000的上限；把{% chara_link Gnomon %}和{% chara_link Ruchbath %}加入星辰碎片商店（US）。
- **等級上限與強化**：
  - 英雄等級70（ID、PA「突破到7星，最高等級70」）、開放等級上限（HK）。
  - 第四個被動欄位（ID ×2）。
  - 除了抽到重複角色之外的**刻印等級**取得方式（VN）；舊的路人角色變成永久，並且有刻印等級（PH）。
- **羈絆改版**（ES）：對擁有大量角色的老玩家來說，助手很難升級；建議「把助手升到100級就足以讓所有人裝備它」。
- **重置角色**道具，可返還養成素材（TW 出重置角色返還升級素材的道具）。
- **Campaign任務經濟**（AU）：laf對體力的比率只比一般的升階任務好一點點，而力量石手冊讓一般任務更划算。他們還要求「經驗值、社交與賺大錢手冊」也適用於Campaign的免費任務。
- **素材刷取**整體而言（US ×2、PH、VN「素材刷取」、BR「資源方面的改善」）。

### 3.10 終局內容、內容深度與新模式（~20）

- **更多終局內容／地下城／可重複遊玩的內容**（×~8：PH ×2、BR、VE、US、MY、VN）。「需要更多可重複遊玩的內容」（VE）。「缺乏有意義的每日活動」（AR）。
- **新模式**（×~8）：
  - 討伐Boss／合作（TH），非同步合作（GB）。
  - **PvP對戰**：MY提議做線上玩家對玩家，隱藏角色選擇、等級匹配，並以以太晶石作為獎勵（以spd決定行動順序使其可行）。
  - **Rogue-lite與沙盒／建造模式**，像明日方舟的生息演算（ID）、小遊戲活動（ID）、「新遊戲模式」（VN）、更多新玩法和模式（MY）。
  - 「Arcade Mode」：濃縮的劇情段落搭配更長的戰鬥場景（PH，已停止）。
  - BR：「像它前作那樣的AR，或是像AnEi那樣的Eidos」（逐字）加上地下城。
  - US：更多活動與能力覺醒。
- **為現有機制增加更多內容**（AU、辦公室、技能樹）。
- GB(F)：「Change Challenge Simulator to Monthly」。

### 3.11 帳號、資料與地區

- **存檔資料／帳號備份**（×7：TW、TH ×2、TH 其他、US、MA、PH）。TH（已停止）：「請提供存檔資料功能。我討厭連結存檔。」US：「更安全的存檔方式。」MA：「把我們的帳號連結到電子郵件或iCloud。」PH：「Google/Apple帳號連結。」TW：資料備份需要更靈活方便的方式。
- **中國支付**（見§2.6）。

### 3.12 新手體驗

- RU：「對新手不友善」，福利角色過時。
- US（已停止）：「更容易理解的玩法／養成。」
- CN：新手很難達到Lv.60。
- ID：英雄配裝指南（也來自一位從未玩過的玩家）。
- 亦見§2.2關於F2P的部分。

---

## 4. 角色：設計、外觀、配音

### 4.1 alt、變體與哪些角色

**正面**

- US：「4星英雄變體的回歸，對不受歡迎的角色來說是個有希望的跡象，讓他們終於也能拿到活動變體，尤其是像{% chara_link Kirsch %}和{% chara_link Maculata %}這樣的女性角色。」
- US：「得到alt的角色很公平，而且似乎有足夠的多樣性，讓我願意登入看看。」
- AR：「對角色、他們的關係、背景設定與世界觀所投入的用心，是我持續遊玩的主要原因之一。」

**負面／需求**

- **指名的alt／變體需求**（依角色分組並附上人數）：
  - **{% chara_link Sui %}**（×4：FI ×2、US「請在2027年給Sui一個Alt」、SV）。**{% chara_link Borealis %}**（×2：US、SV）。
  - **{% chara_link Joezen %}**的第二個變體（US）。**{% chara_link Giansar %}**、**{% chara_link Hydoor %}**的第二個變體，**{% chara_link Theoreol %}**的變體（ID）。
  - **{% chara_link Hydoor|h2 %}**（US ×2）。
  - **{% chara_link Anna %}、{% chara_link Sensettia %}、{% chara_link Maculata %}**（FI），另外還有**{% chara_link Maculata %}和{% chara_link Kirsch %}**（US）。
  - **{% chara_link Crowne %}、{% chara_link Exio %}、{% chara_link Rutilix %}**（SV）。
  - **{% chara_link Obsidius %}**的第二個alt，夏日或情人節款（US）。
  - **「Mechanic GirlBoss」（{% chara_link Crowne %}）**alt，由一位第一天就入坑的粉絲提出（BR）。
  - **{% chara_link Thuban %}與{% chara_link Vergald %}**的推出（ID）。
  - **{% chara_link Digram %}和{% chara_link Theoreol %}**（JP）。
  - **{% chara_link Vergald %}和{% chara_link Norbrand %}**：更多他們的內容（US）。
  - **{% chara_link Hisaki %}**（US）、**{% chara_link Gammei %}**（US）。
  - **爸爸{% chara_link Norbrand %}、{% chara_link Broker %}、{% chara_link Branch %}**：翻譯與劇情（US）。
  - **{% chara_link Pubraseer %}**的3★與5★技能樹（FI）。
  - **{% chara_link Barrel|h1 %}**強化（PH）。
  - CN：加强贞义的大包（增加{% chara_link Sadayoshi %}的鼓包大小）
  - VN：「更多我老公們的變體」（未指名）。
- **系統性的需求**：給還沒有alt的角色alt（SE、BR第一天角色、AR「老角色、較少被使用的角色，以及來自世界觀更深處的角色」獲得劇情或變體）。PH（見§2.5）也指出，當其他角色拿到第二個alt時，等待第一個alt是多麼痛苦。
- **個別的失望**：BR「{% chara_link Santetsu|h2 %}仍然令人失望」（設計方面）。「{% chara_link Roiker|h2 %}在他的活動中被騙了……他技術上現在有了泳裝造型，但只在他的alt角色身上，而之前大部分角色的泳裝都是給助手」（US）。沒有朱交這個遊戲可以等收了（TW，逐字，朱交＝Shukou Akanaru）。

### 4.2 呈現、性別與體型

- **女性／非男性5★**（×~8）。「Make one already pls」（PH，「5★ Female」、「More Anthro Females, Muscular Females」）。「至少1或2個5★女性角色，無論是獸人、人類還是機器人」（US）。「像它的姊妹作Tokyo Afterschool Summoners那樣加入一些5星女孩」（US）。「非男性的SSR角色／alt」（PH 非二元性別）。PA：更多屬性不只是火、水或暗的女性角色。SV：「木屬性女性角色」。FI：「更多可愛少女風的角色與變體」，正在等Sui、Anna、Sensettia、Maculata。PH：「更多女性（雖然我並不真的被她們吸引，但設計看起來真的很漂亮）」。
- **想要的男性類型**：肌肉獸人與人類男性（BO ×2、MY「高大、壯碩又肌肉發達的獸人」）、更多獸人（CN 已停止 出更多furry）、「更多大叔角色」（HK）、更多鱗類角色（PH）、慈父型的善良角色（TH「真心關愛家人的」）、有隱藏面容、頭盔或斗篷的角色（PH）、「看起來很騷的男人」（BO）、「像LAH那樣加入正太」（US）對上「移除KOUKI，移除正太」（US）。
- **色色／成人內容**：TW 有色色、TW「更好看的泳裝角色」。
- **LGBT+呈現**（AR）：「千萬不要失去讓它們如此獨特的敘事、角色寫作和LGBT+呈現」。US：「最好的LGBTQ+抽卡遊戲之一」。
- **新屬性**（×3：SV「土、鋼、風」、PA「鋼與土」），以及「更多定位／屬性的多樣性」。

### 4.3 服裝、造型與主角客製化

- **更多角色服裝**（×~6：US、SE「更多服裝」、TW 更多外觀服裝樣式、VN、MA「更多給玩家的服裝」）。TW：「泳裝角色……不要把差分做得太少……看看竹本的極端差分。」TW也要求，當插畫有服裝變化時，要提供**Live2D（Spine2D）版本**。
- **造型系統**（×3）：VN的造型系統、**US的高級造型系統**（像明日方舟／重返未來1999那樣的VFX/SFX變化）、ID「更多造型」。
- **英雄配件**「應該不只是漂浮在英雄旁邊的物品」（US）。
- **主角**（×~6）：FI想要便服以及「辦公室用」的戰鬥立繪；SV（×2）想要**更多角色外型**（「兔子、鬣狗、獅子、土狼……公兔與母兔的變體……看起來像男性的貓和看起來像女性的狗」），以及更多角色開口說話的場景；MA想要從活動中獲得的服裝，以及為玩家提供新角色或新外觀；FI主角助手技能強化（§3.8）。
- TH：英雄換圖功能的表情切換。

### 4.4 動畫、立繪與呈現

**正面**

- MY：「更好的畫面，以及像{% chara_link Roiker|h2 %}那樣的必殺技動畫」（作為要求更多）。
- 活動與戰鬥的呈現「更具電影感、更吸引人」（US，見§6）。
- 視覺上的改善有被認可（US、BR「QoL與呈現的改善」）。
- 美術品質：「出色的美術」（US）。

**負面／需求**

- **必殺技動畫**（×~5：MY ×2、MA、IT、TH）。IT：「為真正獨特的技能提供Dokkan等級的動畫」。MA：必殺技應該展示與技能相關的動作，而不是通用的攻擊；待機姿勢；TH希望更快的技能動畫或跳過。
- **更新舊立繪**（×~7：US、BR（Spine）、PH ×2、BA「較舊的動畫……Parallel Flight成員」、PH（已停止）「老角色的動畫」、US「從上線到第1或第2週年」）。
- **Live2D（Spine2D）**（ID，「live 2d arts characters」）、**3D模型**（PH，已停止）、**劇情中的CG美術**（ID）、**逐格檢視戰鬥動畫**（TH）、「角色的官方美術」（PH，已停止）、「動畫PV」（PH）。
- **關閉動畫以減少卡頓**（US）：見§3.7。

### 4.5 配音與音樂

- **語音台詞字幕**（×4：FI「語音的字幕」、MY 遊戲內語音分頁要是實裝可閱覽的文字輔助聆聽、BR「在英雄／助手檢視模式播放語音台詞時顯示字幕，因為並非所有台詞都會顯示在主畫面」、PH 非二元性別「為戰鬥中或語音播放按鈕等沒有文字的對話提供翻譯字幕」）。
- **更多點擊角色的對話**（VN：「帶來更多點擊角色時的對話」）。
- **在這兩個欄位中，沒有回答者直接評論配音表現或選角。**
- **音樂／OST**（正面）：「我喜歡它的音樂」（TH）、「活動與主線的BGM，以及戰鬥／過場動畫」（US，正面；「從這裡只會越來越好」）、「活動BGM……更具電影感、更吸引人」（US）。
- **音樂方面的需求**：
  - GB：官方原聲帶的數位發行。
  - PH（詳細清單）：僱用更多作曲家；給歌曲取獨特的名字，而不是「X Battle/Story/Boss Theme」（Housamo就是這麼做的）；發行**CD原聲帶**（不含通用的素材庫音樂）；**在遊戲內標示作曲家**，就像標示畫師一樣；附有人聲的動畫PV（「可能性非常低」）。
  - 自訂首頁音樂（CN ×2）。

---

## 5. 劇情

### 5.1 正面

- **劇情是遊玩的核心理由之一**（×~6）：「好劇情」（ID）、「劇情太棒了」（VE）、「喜歡它的音樂、角色、主題……讓我想更深入了解它的劇情」（TH）、「劇情……是兩款遊戲最棒的部分之一」（US）、「持續努力擴充劇情」（AR）。
- **主線任務第2部第4章分成兩部分推出**：「看到它被拆成2部分很有趣。期待下一部分，也希望能看到更多{% chara_link Velgard %}和{% chara_link Norbrand %}」（US）。
- **活動敘事**：「活動、劇情和戰鬥變得越來越有動態感」（PR）、「劇情和戰鬥更有電影感」（US）、**約會任務的呈現很好**（GB）、TW（「活動中有更多互動內容」）。
- TW：希望能繼續看到與英雄們的有趣互動日常。

### 5.2 負面／需求

- **活動劇情的公式很重複**（MY(F)）：「感覺已經沒有驚喜的元素了……新／舊角色→回憶閃回→失去希望→重拾希望→變成英雄。我甚至不知道該怎麼改，但希望他們能做出一些新的東西。」
- **篇幅太長**（US）：主線和活動劇情都「遠遠、遠遠太長了……可以切成一半甚至三份」。他們不是想要縮短，而是拆開，這樣就能給予更多寶石獎勵、加入戰鬥，讓玩家更有參與感。他們也把這點套用到TAS上。
- **活動劇情應該更突顯該活動的SP角色**（TW）。
- **戀愛／約會內容**（×~7）：
  - JP「デートクエスト或いは恋愛要素が欲しい」（想要約會任務或戀愛要素），像放サモ那樣。
  - BR「更長的劇情，讓玩家和另一個角色在浪漫的情境下共度時光，就像Housamo的約會任務」。
  - SV「戀愛系統，像Housamo那樣」。
  - PA「戀愛系統」。
  - ID「約會活動！！！（選擇你的本命角色……或是在他們的住處一起睡覺！！！）」。
  - PE「關係任務（劇情）」。
  - 另見TW 想要可以更多與喜歡角色互動的玩法或關於喜歡角色的內容。
- **角色深度**：JP もっと各キャラクターの性格や背景の掘り下げが多いと嬉しいです（希望能更多地深入描寫每個角色的個性與背景）。PE「更多角色的支線劇情」。US(F)希望「明年有更多連結任務」。AR「給老角色更多機會」（§4.1）。
- **更多主線劇情**（GB「更多主線劇情」、EC「Main story {% chara_link Broker %} history」逐字、US(I)「更多劇情」）。
- **劇情獎勵與切分**：見上方的劇情分段建議。
- **寫作品質**：MY「好的、真誠的劇情寫作」（需求）。TW 劇情改進（沒有細節）。
- **可跳過性**：MY(F)「有些劇情我只好跳過，因為我厭倦了翻譯每一句對話。」
- **關卡選擇畫面中的過往活動狀態**（TH）：「劇情的每一步都應該能看到先前的狀態，像是[Whiteout Liberation](/events/2512Whiteout/)，關卡選擇場景的狀態應該隨著所選的狀態而改變，而不是一直停留在已完成（聖誕樹）。」
- **Arcade模式的點子**（PH，已停止）：濃縮的劇情段落搭配更長的戰鬥。

---

## 6. 活動

### 6.1 正面（~25）

- **[Whiteout Liberation](/events/2512Whiteout/)和[Summer Montage Halation](/events/2607Montage/)中的互動式地圖**（×~9：BR、CL、FI、GB、US、ID、TW「活動中能互動的玩法變多了」、AU、CN）。「『Whiteout liberation』是目前為止活動呈現得最好的」（BR）。「地圖……是個很棒的點綴」（FI）。「互動式『地圖』……真的很好玩」（CL）。GB：「希望能有更多像Whiteout liberation那樣的像素美術。」
- **Summer Montage Halation的額外內容**：有不同難度的Boss，以及作為額外角色內容的卡片（BR、US(F)、GB「活動的棒球卡，以及約會任務的呈現方式」）。
- **整體投入的心力在提升**（×~8）：「我很欣賞像Summer Montage Halation這樣的活動所投入的心力越來越多」（US）、「活動視覺效果上投入的心力」（US）、活动的表现形式明显的在变得更多样化和丰富（CN）、「我喜歡他們在活動中加入不同的東西，讓活動更生動，也更令人難忘」（BR）、「Smoke & Mirrors和Whiteout Liberation是我目前最喜歡的任務之一」（MY）、「有創意的活動任務選擇」（ID）。
- **活動玩法**：「我喜歡他們在Whiteout Liberation中處理遊戲玩法的方式，而他們在Summer Montage中加入的功能……也很有趣，讓我更想回來玩遊戲。如果他們能更常這樣做，我就會回到這款遊戲」（AU）。SSS任務（US）。「Autumn Campaign」最喜歡（US）。
- **活動BGM與劇情**（US）。**活動期間更頻繁的登入獎勵**（US，見§2.1）。

### 6.2 負面／需求

- **箱子形式的活動**（×6：MY(F)、RU、JP、TW、GB，再加上MY的「我給它3星」）。用語：**[Echoes of frontier memories](/events/2604Frontier/)／殘響**（半週年活動）。
  - MY：「抽取式的活動，『配件』兌換並沒有讓它變得比較好……還好他們把它拿掉了。我給它3星，因為我用光了所有以太晶石，卻沒有拿到Andrew和Huckle。」
  - RU：「開箱活動實作得很差（獎勵和一般商店一樣，卻不能選擇想要的東西，也不能重置箱子），開發團隊似乎誤解了這類活動應該如何運作。」
  - JP：ボックス仕様のイベントだけ、少し不満でした。他の変更は、全て良いものです。（只有箱子形式的活動讓我有點不滿。其他的改動都很好。）
  - TW：殘響的活動道具兌換方式（負面）。
  - GB：「希望未來的活動箱子……能有所改進，因為我並不討厭這個概念。」
- **抽籤活動的繁瑣**（US）：「如果他們再辦一次抽籤活動，請讓它不要那麼繁瑣。」TW：希望可以有戳戳樂（想要戳戳樂形式的抽籤活動）。
- **頻率**（×~7）。
  - 「活動整整一個月都在進行，超級無聊……除了登入以外沒事可做」（US）。建議：**在新活動的同時進行復刻**，以及**活動主題的地下城挑戰**。
  - TW：活動時間通常約1個月，而且瘋狂復刻劇情活動，久久才一次新的，實在太慢。
  - 「更快的內容時程」（SE）、「復刻太多了。通常每2個月才有新內容」（SE）。
  - 「更多活動、更多貨幣、更多卡池、更多劇情」（US）、「更多活動與更多能力覺醒」（US）。
- **活動結構與機制**：
  - 「活動Boss戰的機制更多樣，而不只是一直攻擊到它們死掉。我喜歡那種有多個回合、附帶謎題／機制的（例如，消耗一定量的VP）」（ID）。
  - 「希望活動能有更多獨特的地圖背景」（ID）。
  - 「少一點以路人角色為主的活動」（US）。
  - 「活動的辦公室背景與BGM能以某種方式永久保留，也許是在復刻之後」（PH）。
  - **活動標題的「new」徽章**（TW，§3.5）。
  - 「我真的沒有抽卡的動力……活動被評得低，唯一的原因是我並不在乎出場的角色」（US，所以活動評分是由角色驅動的）。
  - **復刻活動**需要翻譯（§1.2C）。
  - CN：活動入口過大，擋住了主線入口（§3.6）。

---

## 7. 其他

### 7.1 整體看法

- **正面**（×~12）：「太棒了」（VN）、都很好（TW）、「到目前為止它經歷了非常好的改變」（SV）、「最近的改動改善了遊戲體驗」（SV）、「遊戲正在變得更好」（ID、BO）、「我老實說對這兩款遊戲都有很多愛」（AR）、「我很高興看到Live A Hero持續下去」（MX）、「這是很好的改動，也是對新方式的一次不錯的嘗試。也很高興他們真的有在聽玩家的意見」（MY(F)）。「QoL與呈現的改善雖然緩慢但確實地進行著……希望能維持這個步調」（BR）。
- **對遊戲走向的擔憂**：CL：「我仍然覺得過去幾年的品質停滯了……幾乎像是他們已經放棄讓這款遊戲變得和Housamo一樣受歡迎。」TH：「這就是為什麼玩家這麼少。」US：「需要好的遊戲宣傳或一段短動畫」（推廣）。
- **玩家使用的比較基準**：Housamo/TAS（資料、UI、戀愛、商店、自動播放劇情、獎勵、女性5★）、Eidos／龍脈（唯一更糟的抽卡遊戲，有完整翻譯）、Project Sekai（貨幣）、明日方舟、重返未來1999、絕區零（「希望這款遊戲能變得像絕區零……但可惜開發團隊……沒有米哈遊的預算」）、Dokkan（動畫）。
- **情感上的話**：TH表示這款遊戲讓他們「夢想得更遠」，目標是有一天為它設計一個角色。AR感謝團隊。TH：「善良、慈父般的角色讓我感到安全與安慰」（§4.2）。

### 7.2 已停止遊玩的玩家寫了什麼（約一打）

- **抽卡／經濟**：「好得多的抽卡機率、跳過券、讓Ally Points有更多用途、降低石頭價格」（US）；「更好的抽卡、更容易理解的玩法／養成」（US）；「更好的取得更多以太晶石的方式，以及一些保底系統」（MX）；「會頻繁重置的終局內容……更多取得寶石的方式」（VN）。
- **帳號／技術**：「需要存檔資料。我討厭連結存檔」（TH）；讀取與無法跳過（TW）；每日0/3任務的困擾（PL）。
- **內容**：多樣性／挑戰性、官方美術（PH）、「3D模型」與「Arcade Mode」（PH）、老角色的動畫（PH）、素材刷取與翻譯（VN）、出更多furry（CN）。

### 7.3 其他地方放不下的項目

- **Housamo專屬**（與LAH無關）：要求劇情**AUTO按鈕**。

---

## 附錄：各主題的規模（回答者人數）

| 主題 | ≈ N | 位置 |
|---|---|---|
| 翻譯（全部） | 95 | §1 |
| 其中「更快／更多」 | 60 | §1.2A |
| 其中尚未翻譯的涵蓋範圍缺口 | 25 | §1.2C |
| 其中品質／UI適配 | 15 | §1.2D |
| 抽卡經濟／保底（全部） | 85 | §2 |
| 其中更多免費貨幣 | 65 | §2.2 |
| 其中保底／天井／機率 | 40 | §2.3 |
| QoL／自動戰鬥／業務（正面） | 40 | §3.1 |
| 技能樹／舊角色強化 | 25 | §3.8 |
| 活動（全部） | 35 | §6 |
| alt與指名的角色需求 | 20 | §4.1 |
| 呈現（女性5★／體型） | 20 | §4.2 |
| 終局內容與新模式 | 20 | §3.10 |
| 戀愛／約會內容 | 7 | §5.2 |
| 帳號／資料備份 | 6 | §3.11 |

由於同一位回答者可能出現在多列中，各列的數字會有重疊。

# 後記

我希望這份報告能帶給你更多對這款遊戲的了解，也讓你覺得填寫問卷是值得的。

這份問卷和報告花了我很多心力準備，但可惜回答人數不多，所以結果的代表性較低。我原本承諾在10月底前發布這份報告，結果超過了期限一個多星期。這部分是因為動力下降、忙著做其他Wiki的改進，以及本業消耗掉的精力……

Housamo的週年慶提前了幾週，所以我連在它的週年慶之前為*那款遊戲*準備問卷的時間都沒有。如果我決定今年還是要做，我想我得把問卷的規模大幅縮減。

問卷也詢問了Wiki的使用情況、功能與意見回饋，但我決定把這些結果移到未來的一篇部落格文章中，在那篇文章裡我會談談這個Wiki開發的一些幕後故事。

感謝你讀到這裡，我們下次再見！

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
