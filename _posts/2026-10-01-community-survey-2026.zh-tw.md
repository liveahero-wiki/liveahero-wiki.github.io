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

> 本文由英文版翻譯並經過編輯。若[英文版](/blog/2026/community-survey-2026/)與中文版內容有出入，以英文版為準。

> 本文篇幅較長，並含有大量互動式圖表。將滑鼠移到圖表上或點擊圖表，即可查看精確數字。

* unordered
{:toc}

# 前言

今年的問卷共收到**{{ f.respondents }}**份回答（去年為{{ f.respondents_prev }}份）。

<!-- TODO: thanks, what changed in the survey this year (mobs, kaibutsu, best CP, wiki questions, zh-tw report). -->

## 問卷限制聲明

<!-- TODO: carry over from 2025, update numbers. -->

# 回答者概況

## 回答者來源

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

<!-- TODO -->

## 年齡

{% include survey-chart.html id="age" %}

年齡中位數為{{ f.age_median }}歲。

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

<!-- TODO: Japan share fell from {{ f.yoy["2025"].japan_pct }}% to {{ f.yoy["2026"].japan_pct }}%. -->

## 日語閱讀能力

{% include survey-chart.html id="jp" %}

# 遊戲

## 實際玩家

{% include survey-chart.html id="play_lah" %}

## 平台

{% include survey-chart.html id="platform" %}

{% include survey-graph.html path="/assets/img/survey-2026/platform_venn.zh-tw.svg" title="平台重疊情形" %}

有 {{ f.platform_multi }} 位受訪者（{{ f.platform_multi_pct }}%）同時使用多個平台。圖中數字是剛好選了該平台組合的受訪者人數；各區域大小相同，並非依比例繪製。

## 遊玩時間

{% include survey-chart.html id="tenure" %}

## 主角設定

{% include survey-chart.html id="mc_body" %}

{% include survey-chart.html id="mc_voice" %}

## 課金

{% include survey-chart.html id="paying" %}

### 課金等級定義

|等級|說明|
|-|-|
|XL|購買過一般付費石|
|L|購買過活動限定禮包（大）|
|M|購買過活動限定禮包（小）|
|S|購買過新年福袋、週年英雄選定禮包或週年禮包|
|XS|只購買過第4個營業欄位所需的十石或網頁商城限定禮包|
|Zero|從未課金|

{% include survey-chart.html id="yoy_paying" %}

{% include survey-chart.html id="money_items" %}

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

{% include survey-chart.html id="paying_by_gender" %}

### 購買管道

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

{% include survey-chart.html id="physical_by_paying" %}

## 遊玩風格

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

## 高難度關卡

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

{% include survey-chart.html id="hdq_by_paying" %}

## 遊戲要素評分

{% include survey-chart.html id="ratings_presentation" %}

{% include survey-chart.html id="ratings_illustrator" %}

{% include survey-chart.html id="ratings_story" %}

{% include survey-chart.html id="ratings_gameplay" %}

{% include survey-chart.html id="ratings_bipolar" %}

{% include survey-chart.html id="ratings_community" %}

## 劇情閱讀

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

## 活動評分

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

## 其他遊戲

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="遊戲排序投票（全體）" %}

## 英文Wiki

{% include survey-chart.html id="wiki_usage" %}

{% include survey-chart.html id="wiki_new_feature" %}

# 角色人氣

下方排行可依國家、地區、年齡、性別與遊玩狀態篩選，並與2024、2025年比較。點選角色可查看歷年變化。

{% include survey-ranking.html query="survey=lah&y=2026" title="角色人氣排行" %}

<!-- TODO: insights by segment and year over year, from digest.md ("Segment ..." and "biggest approval changes"). Link each one to its explorer view. -->

{% include survey-chart.html id="top10_size" %}

## 排序投票制度

<!-- TODO: carry over the Tideman explanation from 2025. -->

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

## 路人角色與怪物

今年新增的題目：{{ f.mob_answered }}人選了喜愛的路人角色，{{ f.kaibutsu_answered }}人選了喜愛的怪物。

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="路人角色人氣排行" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="排序投票（路人角色）" %}

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="怪物人氣排行" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="排序投票（怪物）" %}

## 最佳CP

共有{{ f.best_cp_respondents }}人提交了{{ f.best_cp_pairs }}組配對。

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="最佳CP（至少兩人選擇的配對）" %}

<!-- TODO: paste the "Best CP (paste-ready)" table from digest.md. -->

## 人類型與獸人偏好

{% include survey-chart.html id="anthro_everyone" %}

{% include survey-chart.html id="anthro_japan" %}

{% include survey-chart.html id="anthro_non_male" %}

# 開放式問題

<!-- TODO: summarise analysis/out/lah2026/free_text.md (stop reasons, feedback, improvement, wiki feedback). Quote nothing that identifies a respondent. -->

# 後記

<!-- TODO -->

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
