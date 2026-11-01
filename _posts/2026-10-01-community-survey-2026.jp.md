---
title: コミュニティサーベイ結果2026
date: 2026-11-01 12:00:00 +08
lang: ja
draft: true
eleventyExcludeFromCollections: true
---
{%- comment -%}
  Translation of 2026-10-01-community-survey-2026.md: same includes and facts, only the prose differs.
  Before publishing: delete `draft` and `eleventyExcludeFromCollections` above.
{%- endcomment -%}
{% assign f = site.data.survey2026.facts %}

> この記事は英語版を機械翻訳したのち、一貫性を保つために編集したものです。翻訳ミスが残っている可能性があります。
>
> [英語版](/blog/2026/community-survey-2026/)と日本語版に相違がある場合は、英語版を正とします。

> この記事は長く、インタラクティブなグラフが多数含まれています。グラフにカーソルを合わせるかタップすると、正確な数値が表示されます。

* unordered
{:toc}

# まえがき

今年のアンケートには**{{ f.respondents }}**件の回答が集まりました（昨年は{{ f.respondents_prev }}件）。

<!-- TODO: thanks, what changed in the survey this year (mobs, kaibutsu, best CP, wiki questions, zh-tw report). -->

## 調査の限界に関する免責事項

<!-- TODO: carry over from 2025, update numbers. -->

# 回答者のプロフィール

## 回答者のソース

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

<!-- TODO -->

## 年齢

{% include survey-chart.html id="age" %}

年齢の中央値は{{ f.age_median }}歳です。

{% include survey-chart.html id="age_female" %}

{% include survey-chart.html id="age_japan" %}

## 性別

{% include survey-chart.html id="gender" %}

{% include survey-chart.html id="gender2" %}

回答者の{{ f.non_male_pct }}%が男性以外（昨年は{{ f.non_male_pct_prev }}%）、{{ f.transgender_pct }}%がトランスジェンダーです。

{% include survey-chart.html id="gender_japan" %}

### 女性/ノンバイナリー/その他の回答者とそれらを見つける場所

{% include survey-chart.html id="non_male_country" %}

## 国

{% include survey-chart.html id="region" %}

{% include survey-chart.html id="yoy_region" %}

{% include survey-chart.html id="country" %}

<!-- TODO: Japan share fell from {{ f.yoy["2025"].japan_pct }}% to {{ f.yoy["2026"].japan_pct }}%. -->

## 日本語読解能力

{% include survey-chart.html id="jp" %}

# ゲームについて

## 実際のプレイヤー

{% include survey-chart.html id="play_lah" %}

## プラットフォーム

{% include survey-chart.html id="platform" %}

## プレイ時間

{% include survey-chart.html id="tenure" %}

## 主人公の構成

{% include survey-chart.html id="mc_body" %}

{% include survey-chart.html id="mc_voice" %}

## 課金について

{% include survey-chart.html id="paying" %}

### 課金レベルの定義

|レベル|説明|
|-|-|
|XL|通常の有償石を購入した|
|L|イベント限定エーテル晶石パック（大）を購入した|
|M|イベント限定エーテル晶石パック（小）を購入した|
|S|新年福袋、周年ヒーロー指名パック、周年記念パックのいずれかを購入した|
|XS|4番目の営業枠の有償石10個、またはWebショップ限定パックのみ購入した|
|Zero|課金したことがない|

{% include survey-chart.html id="yoy_paying" %}

{% include survey-chart.html id="money_items" %}

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

{% include survey-chart.html id="paying_by_gender" %}

### 購入先

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

{% include survey-chart.html id="physical_by_paying" %}

## ゲームプレイスタイル

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

## 高難易度クエスト

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

{% include survey-chart.html id="hdq_by_paying" %}

## ゲーム要素の評価

{% include survey-chart.html id="ratings_presentation" %}

{% include survey-chart.html id="ratings_illustrator" %}

{% include survey-chart.html id="ratings_story" %}

{% include survey-chart.html id="ratings_gameplay" %}

{% include survey-chart.html id="ratings_bipolar" %}

{% include survey-chart.html id="ratings_community" %}

## ストーリーを読むか

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

## イベント評価

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

## 他のゲーム

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="ゲームの順位付け投票（全体）" %}

## English Wiki

{% include survey-chart.html id="wiki_usage" %}

{% include survey-chart.html id="wiki_new_feature" %}

# キャラクター人気度

下のランキングは、国・地域・年齢・性別・プレイ状況で絞り込み、2024年・2025年と比較できます。キャラクターをクリックすると、年ごとの推移を表示します。

{% include survey-ranking.html query="survey=lah&y=2026" title="キャラクター人気ランキング" %}

<!-- TODO: insights by segment and year over year, from digest.md ("Segment ..." and "biggest approval changes"). Link each one to its explorer view. -->

{% include survey-chart.html id="top10_size" %}

## 順位付け投票システム

<!-- TODO: carry over the Tideman explanation from 2025. -->

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_global.svg"
  title="順位付け投票（全体）" %}

### 特定の人口統計におけるランキング

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_united_states.svg"
  title="順位付け投票（アメリカの回答者のみ）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_japan.svg"
  title="順位付け投票（日本の回答者のみ）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_taiwan.svg"
  title="順位付け投票（台湾の回答者のみ）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_china.svg"
  title="順位付け投票（中国の回答者のみ）" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_non_male.svg"
  title="順位付け投票（男性以外の回答者のみ）" %}

## モブと怪物

今年の新設問です。{{ f.mob_answered }}人がお気に入りのモブキャラクターを、{{ f.kaibutsu_answered }}人がお気に入りの怪物を選びました。

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="モブ人気ランキング" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="順位付け投票（モブ）" %}

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="怪物人気ランキング" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="順位付け投票（怪物）" %}

## ベストCP

{{ f.best_cp_respondents }}人から計{{ f.best_cp_pairs }}組のカップリングが寄せられました。

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="ベストCP（2人以上が選んだ組み合わせ）" %}

<!-- TODO: paste the "Best CP (paste-ready)" table from digest.md. -->

## 人間型 vs 獣人型バイアス

{% include survey-chart.html id="anthro_everyone" %}

{% include survey-chart.html id="anthro_japan" %}

{% include survey-chart.html id="anthro_non_male" %}

# 自由回答

<!-- TODO: summarise analysis/out/lah2026/free_text.md (stop reasons, feedback, improvement, wiki feedback). Quote nothing that identifies a respondent. -->

# あとがき

<!-- TODO -->

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
