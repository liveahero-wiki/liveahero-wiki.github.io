---
title: コミュニティサーベイ結果2026
date: 2026-11-09 21:00:00 +08
lang: ja
---
{%- comment -%}
  Translation of 2026-10-01-community-survey-2026.md: same includes and facts, only the prose differs.
  Before publishing: delete `draft` and `eleventyExcludeFromCollections` above.
{%- endcomment -%}
{% assign f = site.data.survey2026.facts %}

> この記事は英語版を機械翻訳したのち、一貫性を保つために編集したものです。翻訳ミスが残っている可能性があります。
>
> [英語版](/blog/2026/community-survey-2026/)と日本語版に相違がある場合は、英語版を正とします。本文有繁體中文版，請見[這裡](/blog/2026/community-survey-2026.zh-tw/)。

> この記事は長く、インタラクティブなグラフが多数含まれています。グラフにカーソルを合わせるかタップすると、正確な数値が表示されます。

* unordered
{:toc}

# まえがき

今年は**{{ f.respondents }}**件の回答が集まりました（昨年は{{ f.respondents_prev }}件）。
このアンケートを数年続けてきましたが、回答数が前年を下回ったのは今回が初めてで、しかも大幅な減少です。

それでも、時間を割いてアンケートに答えてくださった皆さんには心から感謝しています。簡単ではないことは承知しているので、価値の低い設問は減らしていくつもりです。

## 調査の限界に関する免責事項

今年も回答者の人口統計の割合は過去数年と大きく異なり、中国と日本の回答者の割合が前年よりずっと少なくなりました。
つまり、「2025年 vs 2026年」の比較の多くは、回答者の母集団がかなり違うため、同じ人たちの意識が変化したのかどうかを実際には示していません。比較は割り引いて受け取ってください。

# 回答者のプロフィール

## 回答者のソース

{% include survey-chart.html id="source" %}

{% include survey-chart.html id="yoy_source" %}

回答者の流入元の半分以上をDiscordとRedditが占めました。Redditの数は前年のほぼ倍になっています！

2025年と比べて最も減ったのは、このWikiからの流入、バハムート（台湾のゲーム掲示板）、X/Twitter、Weibo（中国）です。ざわざわにはもう投稿する勇気がなかったので、そこもゼロです。その結果、今年は中国・日本（そしてある程度は台湾）の回答者が大きく減りました。

## 年齢

{% include survey-chart.html id="age" %}

年齢の中央値は{{ f.age_median }}歳です。フィリピンから、6歳と答えた回答者が1人いました。

{% include survey-chart.html id="age_female" %}

{% include survey-chart.html id="age_japan" %}

## 性別

{% include survey-chart.html id="gender" %}

{% include survey-chart.html id="gender2" %}

回答者の{{ f.non_male_pct }}%が男性以外（昨年は{{ f.non_male_pct_prev }}%）で、{{ f.transgender_pct }}%がトランスジェンダーです。

{% include survey-chart.html id="gender_japan" %}

### 女性/ノンバイナリー/その他の回答者とそれらを見つける場所

{% include survey-chart.html id="non_male_country" %}

## 国

{% include survey-chart.html id="region" %}

{% include survey-chart.html id="yoy_region" %}

{% include survey-chart.html id="country_map" %}

{% include survey-chart.html id="country" %}

2025年と2026年のアンケートの間で：

- 日本の割合は{{ f.yoy["2025"].japan_pct }}%から{{ f.yoy["2026"].japan_pct }}%に下がりました。
- 中国の割合は{{ f.yoy["2025"].china_pct }}%から{{ f.yoy["2026"].china_pct }}%に下がりました。
- 台湾の割合は{{ f.yoy["2025"].taiwan_pct }}%から{{ f.yoy["2026"].taiwan_pct }}%に下がりました。

## 日本語読解能力

{% include survey-chart.html id="jp" %}

Live A Heroのストーリーを日本語で無理なく読むには少なくともN3レベルが必要だと仮定すると、それができる回答者はわずか14.9%です。
日本のプレイヤー（{{ f.jp_n1_japan }}）を除くと、その割合は11.2%まで下がります。

# ゲームについて

## 実際のプレイヤー

{% include survey-chart.html id="play_lah" %}

## 辞めた理由（21件の回答）

- 辞めた時点では英語翻訳がなかった
- 興味・モチベーションを失った
- 戦闘システムが複雑すぎる／ゲームの仕組みに不慣れ
- 欲しいキャラクターを引けなかった
- （無償の）ガチャ通貨が少なすぎる
- 他のガチャゲームも遊んでいて、Live A Heroを続ける時間がない

## プラットフォーム

{% include survey-chart.html id="platform" %}

{% include survey-graph.html path="/assets/img/survey-2026/platform_venn.ja.svg" title="プラットフォームの重なり" %}

複数のプラットフォームを併用している回答者は{{ f.platform_multi }}人（{{ f.platform_multi_pct }}%）です。図中の数字は、その組み合わせをちょうど選んだ回答者数です。どの領域も同じ大きさで描いており、面積は人数に比例しません。

PCのAndroidエミュレーターのみでプレイしている回答者が12人（3%）いますが、「Google Play Games on PC」のみでプレイしている人は1人もいません。

## プレイ期間

{% include survey-chart.html id="tenure" %}

- 回答者の4分の1近くが、ゲームのリリース時期前後にプレイを始めています。
- プレイヤーの増加は[3周年](/events/23093rdAnniversary/)の前後に急増するまではゆるやかでした。これはLifeWondersが公式翻訳を「計画している」と発表した時期です。
- 過去12か月でプレイヤーの増加が再び加速しました（主に海外のプレイヤー）。公式翻訳がついにリリースされたのも今年です。

## 主人公の構成

{% include survey-chart.html id="mc_body" %}

{% include survey-chart.html id="mc_voice" %}

## 課金について

{% include survey-chart.html id="paying" %}

回答者の半数以上が、これまでにゲーム内で少なくとも1回は課金しています。

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

2025年と比べて、無課金プレイヤーがわずかに増えました。

課金プレイヤーのうち、XL（最も課金する層）とS層（新年・周年のみ課金）はやや減り、XS層が最も大きく増えました。新しいWebショップ限定パックを買った人たちである可能性が高いです。

> このゲームでは東アジアが最も課金プレイヤーの割合が高いことが分かっていますが、今年のアンケートではこの層が最も大きく減っているため、その点も考慮してください。

{% include survey-chart.html id="money_items" %}

新年福袋と5周年ヒーロー指名パックの魅力は、前回のアンケートから下がったようです。

{% include survey-chart.html id="paying_by_region" %}

{% include survey-chart.html id="paying_east_asia" %}

課金プレイヤーの割合が最も高いのは東アジアで、今回は台湾がトップです。ただし、今回のアンケートは日本の回答者がとても少ないため、この割合が実際の日本のプレイヤー全体に当てはまるとは断言できません。

{% include survey-chart.html id="paying_by_gender" %}

### 購入先

{% include survey-chart.html id="money_web" %}

{% include survey-chart.html id="shop_by_platform" %}

LWが今年になってようやくWebショップでゲーム内アイテムの販売を始めたのは、アプリストアにゲーム開発者が外部決済を受け付けることを認めさせた[Epic Games対Google](https://en.wikipedia.org/wiki/Epic_Games_v._Google)訴訟の結果で、これにより開発者は決済手数料を抑えられます。

{% include survey-chart.html id="physical_by_paying" %}

予想どおり、ゲーム内アイテムを購入した回答者はグッズ（物販）も買う傾向が強いですが、無課金でグッズを買っている人もいます。

## ゲームプレイスタイル

{% include survey-chart.html id="login" %}

{% include survey-chart.html id="login_by_paying" %}

{% include survey-chart.html id="login_paying_share" %}

回答者の人口統計は毎年変わり、LifeWondersがゲーム機能を追加してきたにもかかわらず、これらのグラフの全体的な形は長年ほとんど変わっていません。このゲームが引き付けられるプレイヤーのタイプは固まっているようです。

## 高難易度クエスト

{% include survey-chart.html id="hdq_ss" %}

{% include survey-chart.html id="hdq_sss" %}

SSランクの90〜100%をクリアできるプレイヤーは46.9%です。SSSランクでは34.2%に下がります。

{% include survey-chart.html id="hdq_by_paying" %}

ゲームにより多く課金したプレイヤーほどSS/SSSランクのクエストをクリアできる確率は高いものの、これらの高難度コンテンツに苦戦している課金プレイヤーも大勢います。

## ゲーム要素の評価

{% include survey-chart.html id="ratings_presentation" %}

魅力的なキャラクターが一番の売りのゲームですから、大多数の回答者がキャラクターデザインとボイス演技に非常に高い評価をつけたのは意外ではありません。

{% include survey-chart.html id="ratings_illustrator" %}

回答者は、LifeWondersのイラストレーター交代への対応にも非常に高い評価をつけており、この設問で不満を示した（評価1〜2）回答者はわずか1.3%でした。イラストレーターの事情でキャラクターのストーリー出番が減ってしまう心配がないということなので、会社にとってもプレイヤーにとっても良い知らせだと思います。

{% include survey-chart.html id="ratings_story" %}

全体として、回答者はゲームのストーリー面にかなり高いスコアをつけています。

{% include survey-chart.html id="ratings_gameplay" %}

- 回答者のおよそ4分の3がゲームプレイの設計に好意的です
- 回答者のほぼ半数が、他のガチャゲームの方がこのゲームよりガチャシステムが優れていると考えています

{% include survey-chart.html id="ratings_bipolar" %}

- 回答者のほぼ半数が現在の新コンテンツの配信ペースがちょうどよいと考えており、残りの回答者はもっと頻繁に新コンテンツを出してほしいという傾向です

{% include survey-chart.html id="ratings_community" %}

- 回答者の半数以上が公式翻訳の品質に好意的なスコアをつけています
- 公式翻訳の配信スケジュールに不満を持つ回答者の割合は、それよりさらに高くなっています

## ストーリーを読むか

{% include survey-chart.html id="read_story" %}

{% include survey-chart.html id="read_story_by_jp" %}

> 注：この設問は複数回答可でした

- 日本語読解力がN1〜N3レベルの回答者は、当然ながらゲーム内でストーリーを直接読む傾向が強いですが、そのうち30%近くは公式／ファン／機械翻訳にも頼っています
- 回答者の84.5%は日本語読解力がN3未満です
  - 42.4%がファン翻訳に、28.8%が機械翻訳に頼っています
  - その半数以上は、公式翻訳されたゲームストーリーも読んでいます（何年も前にファン翻訳や機械翻訳で読んだ人も含みます）
- 回答者の11%は、ゲームストーリーをいかなる形でも読まず、キャラクター収集のためにプレイしています

## イベント評価

{% include survey-chart.html id="event_ratings" %}

{% include survey-chart.html id="event_by_jp" %}

- [サマーモンタージュ・ハレーション](/events/2607Montage/)が平均イベントスコア最高です（4.34）
- 全体として、日本語読解力がN3超の回答者は、それ以下の回答者より高いスコアをつける傾向があります
  - 唯一の例外が[サマーモンタージュ・ハレーション](/events/2607Montage/)です

## 他のゲーム

{% include survey-chart.html id="other_games_all" %}

{% include survey-chart.html id="other_games_elsewhere" %}

{% include survey-chart.html id="other_games_taiwan_china" %}

{% include survey-chart.html id="other_games_japan" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_games_global.svg"
  title="ゲームの順位付け投票（全体）" %}

昨年の解説をあまり繰り返したくないので、そちらは[こちら](/blog/2025/community-survey-2025.ja/)をご覧ください。

- **Gyee**：
  - 昨年は日本の回答者の3分の1以上がこのゲームを知りませんでした。今年はアンケートにゲームの日本語名を載せたところ、その割合は7.1%まで下がりました
- **Another Eidos of Dragonvein** vs **XXL Woofia**：
  - 日本の回答者はこのゲームをXXL Woofiaより上位にランクする傾向があり、それ以外の回答者は逆です。
  - どちらのゲームも公式翻訳が同時にリリースされています。言語の壁がないにもかかわらず、地域間でこうした人気の差があるのは非常に興味深いです。
- **Tamacolle**：
  - 意外なことに、台湾の回答者の方が日本の回答者よりこのゲームを今も遊んでいる割合が高いのですが、日本の回答者が少ないせいかもしれません。

# キャラクター人気度

下のランキングは、国・地域・年齢・性別・プレイ状況で絞り込み、2024年・2025年と比較できます。キャラクターをクリックすると、年ごとの推移を表示します。

{% include survey-ranking.html query="survey=lah&y=2026" title="キャラクター人気ランキング" %}

**支持率（全体）**

| 男性獣人 | 支持率 | 男性人間型 | 支持率 | 女性/その他 | 支持率 |
|-|-|-|-|-|-|
|{% chara_link Pubraseer %}| 65.3% |{% chara_link Akashi %}  | 37.7% |{% chara_link Melide %}   |23.3%|
|{% chara_link Barrel %}   | 59.1% |{% chara_link Astar %}   | 36.7%|{% chara_link ⇌Melide %}   |19.4%|
|{% chara_link Monomasa %} | 53.3% |{% chara_link Ruchbath %}| 35.5% |{% chara_link Sensettia %}|17.1%|
|{% chara_link Ryekie %}   | 51.4% |{% chara_link ⇌Akashi %}| 32.3% |{% chara_link Sui %}       |16.6%|
|{% chara_link Sterio %}   | 49.4% |{% chara_link Roudin %}  | 28.5% |{% chara_link Flamier %}  |15.4%|

誰も驚かないと思いますが、今年の人気ランキングも男性獣人キャラクターが圧倒しました。「男性獣人」「男性人間型」「女性/その他」の支持率トップは昨年とまったく同じで、王座を守り抜いた皆さんにおめでとうを言いたいです！

{% chara_link Akashi %}は「全お気に入り」ランキング（投票数無制限）での得票が多く、{% chara_link Astar %}は「お気に入りトップ10」での得票が多くなっています。

LifeWondersが公式にパラレル/ゼノ系のキャラクターを増やしてきたので、今回初めてアンケートに含めました。

**パラレルの自分同士の支持率（全体）**

| バージョン1 |支持率| バージョン2 |支持率|
|-|-|-|-|
|{% chara_link Akashi %} (勝) | 37.7% | {% chara_link ⇌Akashi %} | 32.3% |
|{% chara_link Broker %} | 26.8% | {% chara_link Branch %} (勝) | 31.5% |
|{% chara_link Melide %} (勝) | 23.3% | {% chara_link ⇌Melide %} | 19.4% |
|{% chara_link Crowne %} (勝) | 12.9% | {% chara_link Crowne (alter) %} | 6.0% |

{% include survey-chart.html id="top10_size" %}

毎年「トップ10しか選べないのは少なすぎる」という声が出ますが、そもそも10人すべてを選ばなかった回答者も大勢いることを改めてお伝えしておきます。

## 全お気に入り：全体トップ25（2026年、n=403）

| 順位 | キャラクター | 支持率 | 2025 | 順位変動 |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 65.3% | 65.4% | +0 |
| 2 | {% chara_link Barrel %} | 59.1% | 47.5% | +3 |
| 3 | {% chara_link Monomasa %} | 53.3% | 53.5% | -1 |
| 4 | {% chara_link Ryekie %} | 51.4% | 48.5% | +0 |
| 5 | {% chara_link Sterio %} | 49.4% | 40.8% | +6 |
| 6 | {% chara_link Giansar %} | 47.9% | 49.5% | -3 |
| 7 | {% chara_link Norbrand %} | 44.7% | 新規 | 新規 |
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
| 19 | {% chara_link Ruchbath %} | 35.5% | 新規 | 新規 |
| 20 | {% chara_link Astosis %} | 35.2% | 32.9% | -3 |
| 21 | {% chara_link Huckle %} | 34.5% | 25.7% | +6 |
| 22 | {% chara_link Galvo %} | 33.5% | 35.9% | -6 |
| 22 | {% chara_link Thuban %} | 33.5% | 新規 | 新規 |
| 24 | {% chara_link Gnomon %} | 32.8% | 27.5% | +0 |
| 25 | {% chara_link ⇌Akashi %} | 32.3% | 新規 | 新規 |

## 全お気に入り：支持率の変化が大きかったキャラクター 2025 -> 2026

| キャラクター | 変化（pp） | 2025 | 2026 | 順位（前年 -> 今年） |
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

## トップ10：全体トップ25（2026年、n=403）

| 順位 | キャラクター | 支持率 | 2025 | 順位変動 |
|---|---|---|---|---|
| 1 | {% chara_link Pubraseer %} | 44.9% | 49.2% | +0 |
| 2 | {% chara_link Barrel %} | 36.5% | 28.5% | +2 |
| 3 | {% chara_link Monomasa %} | 32.3% | 37.9% | -1 |
| 4 | {% chara_link Giansar %} | 28.8% | 32.2% | -1 |
| 5 | {% chara_link Sterio %} | 27.5% | 18.0% | +7 |
| 6 | {% chara_link Ryekie %} | 23.8% | 26.0% | -1 |
| 7 | {% chara_link Obsidius %} | 22.1% | 24.3% | -1 |
| 8 | {% chara_link Tsuneaki %} | 20.8% | 22.8% | +2 |
| 9 | {% chara_link Norbrand %} | 19.9% | 新規 | 新規 |
| 10 | {% chara_link Sadayoshi %} | 19.1% | 24.3% | -4 |
| 11 | {% chara_link Astar %} | 18.6% | 16.4% | +5 |
| 12 | {% chara_link Akashi %} | 18.1% | 24.0% | -4 |
| 13 | {% chara_link Denebora %} | 17.9% | 11.7% | +9 |
| 13 | {% chara_link Ruchbath %} | 17.9% | 新規 | 新規 |
| 15 | {% chara_link reXer %} | 17.6% | 23.5% | -6 |
| 16 | {% chara_link Yohack %} | 15.9% | 16.8% | -3 |
| 17 | {% chara_link Toshu %} | 15.4% | 19.3% | -6 |
| 18 | {% chara_link Astosis %} | 14.9% | 12.2% | +3 |
| 19 | {% chara_link Valoray %} | 13.9% | 14.4% | -2 |
| 20 | {% chara_link Mokdai %} | 13.2% | 13.4% | -1 |
| 21 | {% chara_link Huckle %} | 12.4% | 10.2% | +4 |
| 22 | {% chara_link Roiker %} | 12.2% | 5.7% | +24 |
| 23 | {% chara_link Gammei %} | 11.7% | 16.6% | -8 |
| 24 | {% chara_link ⇌Akashi %} | 11.4% | 新規 | 新規 |
| 25 | {% chara_link Viscunam %} | 10.7% | 7.9% | +9 |

## トップ10：支持率の変化が大きかったキャラクター 2025 -> 2026

| キャラクター | 変化（pp） | 2025 | 2026 | 順位（前年 -> 今年） |
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

## 順位付け投票システム

「全お気に入り」と「お気に入りトップ10」を選んでもらうのに加えて、トップ10を一列に順位付けしてもらう設問も用意しました。

このデータを使って、ティードマン方式（Tideman Method）による順位付け投票を試すことができます。

<details open markdown="1">
<summary>ティードマン方式（Wikipediaの定義）</summary>

**ランクドペア（RP）**は**ティードマン方式**とも呼ばれ、1987年にニコラウス・ティードマンが提案した、トーナメント形式の順位付け投票制度です。

他のすべての候補者と順番に比較したとき、いずれに対しても優先される候補者がいる場合、ランクドペア方式はその候補者が必ず勝つことを保証します。したがって、ランクドペア方式はコンドルセ勝者基準を満たします。つまり、[コンドルセ方式](https://en.wikipedia.org/wiki/Condorcet_method)の一種です。

ランクドペア方式は総当たり戦から始まり、候補者のすべての組み合わせについて1対1の勝利差を比較して、過半数に支持される候補者を探します。そのような候補者がいれば、その候補者が直ちに当選します。そうでなく、3人以上の候補者のあいだに
[コンドルセ・サイクル](https://en.wikipedia.org/wiki/Condorcet_paradox)（A > B > C > Aのようなじゃんけん的な循環）がある場合は、サイクル内で「最も弱い」対決、つまり最も引き分けに近いものを除外することでサイクルを断ち切ります。

出典：[Ranked Pairs (Wikipedia)](https://en.wikipedia.org/wiki/Ranked_pairs)

</details>

### 今回のアンケート向けにティードマン方式に加えた主な調整

1. 回答者のトップ10順位に入っているキャラクターの集合を*集合X*（*X<sub>1</sub>, X<sub>2</sub>, X<sub>3</sub>, ...*）、入っていないキャラクターの集合を*集合Y*（*Y<sub>1</sub>, Y<sub>2</sub>, ...*）とします
1. (*X<sub>i</sub>, Y<sub>j</sub>*)のすべての組について、回答者は*X<sub>i</sub>* > *Y<sub>j</sub>*と順位付けするものと仮定します 
    - これは、**すべてのキャラクター**ではなくトップ10だけを順位付けしてもらったために必要な処理です。すべてのキャラクターを一列に順位付けしてもらうのは、ほとんどの人にとって疲れるうえに退屈すぎるでしょう。

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

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_female.svg"
  title="順位付け投票（女性の回答者のみ）" %}

**日本**では{% chara_link Monomasa %}がコンドルセ勝者ですが、他のほとんどのグループでは{% chara_link Pubraseer %}が（唯一の、あるいは複数いるうちの1人の）コンドルセ勝者になる傾向があります。

**台湾**では、{% chara_link Ruchbath %}がトップ10に入った男性人間型キャラクターの最上位になりました。**日本**で最上位の男性人間型キャラクターは{% chara_link Rastaban %}です。

**中国の回答者**には単独のコンドルセ勝者がいません。{% chara_link Pubraseer %}と{% chara_link Barrel %}が50%ずつで互いに勝ち合っている（同率）ためです。中国のトップ10に入った男性人間型キャラクターは{% chara_link Astar %}だけです。

**女性の回答者**は小さなグループ（投票用紙は{{ f.female_answered }}枚のみ）なので、グラフは話半分に見てください。コンドルセ勝者はおらず、確定順位では{% chara_link Akashi %}が先頭で、{% chara_link Melide %}、{% chara_link Crowne %}と続きます。全体トップ10と重なるのは{% chara_link Pubraseer %}、{% chara_link Barrel %}、{% chara_link Sterio %}だけです。

## モブと怪物

今年の新設問です。{{ f.mob_answered }}人がお気に入りのモブキャラクターを、{{ f.kaibutsu_answered }}人がお気に入りの怪物を選びました。

### モブ

{% include survey-ranking.html query="survey=lah-mobs&y=2026" title="モブ人気ランキング" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_mob.svg"
  title="順位付け投票（モブ）" %}

> このレポートを書いている最中に、傭兵の一般人姿を選択肢に入れ忘れていたことに気づきました...

{% mob mercenary-transform %}が順位付け投票のコンドルセ勝者です。

**確定順位（トップ10）**：{% mob Mercenary (Transform) %} > {% mob Wolfman (Summer) %} > {% mob Wolfman %} > {% mob Wolfman (Transform) %} > {% mob Ranger %} > {% mob Ranger (Transform) %} > {% mob Wrestler %} > {% mob Acolyte %} > {% mob Mercenary (Clown) %} = {% mob Acolyte (Transform) %}

**同率**：{% mob Mercenary (Clown) %} = {% mob Acolyte (Transform) %}

### 怪物

{% include survey-ranking.html query="survey=lah-kaibutsu&y=2026" title="怪物人気ランキング" %}

{% include survey-graph.html path="/assets/img/survey-2026/ranked_voting_kaibutsu.svg"
  title="順位付け投票（怪物）" %}

{% mob id-replica %}の支持率が最も高く、2位との差が圧倒的です！{% chara_link Exio %}も誇らしいでしょう。

**確定順位（トップ10）**：{% mob Id Replica %} > {% mob Cetus/Plesiosaur Kaibutsu %} > {% mob Gatekeeper %} > {% mob Engine Kaibutsu (Adult) %} > {% mob Imposter %} > {% mob Palanquin Kaibutsu %} > {% mob Coal Tar Kaibutsu %} > {% mob Lizard Kaibutsu %} > {% mob Shark Kaibutsu %} > {% mob Ghost Kaibutsu (Adult) %}

## ベストCP

{{ f.best_cp_respondents }}人から計{{ f.best_cp_pairs }}組のカップリングが寄せられました。

{% include survey-graph.html path="/assets/img/survey-2026/best_cp.svg"
  title="ベストCP（2人以上が選んだ組み合わせ）" %}

> 1人しか支持していない関係は、ランダムすぎると判断して省略しています

| 組み合わせ | 人数 |
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

# プレイヤーフィードバック分析

この自由記述の分析はLLMアシスタントの助けを借りて行い、そのあと私が用語や文脈の曖昧さを手作業で確認・修正し、キャラクター名/リンクの書式を追加しました。

アンケートで{% chara_link Vergald %}、{% chara_link Norbrand %}、{% chara_link Theoreol %}の名前をつづり間違えた人が何人かいました。旦那認定は取り消します。

アンケートは6周年の前に終了しましたが、このアンケートレポートを公開するまでの間にLWはいくつか新しい改善をリリースしました：

- {% chara_link Thuban %}がリリースされました
- 初の★5女性バリアント：{% chara_link Sensettia|h2 %}
- メインクエスト第4章の公式翻訳
- スタミナ消費が少なくクリアできる新しい形式のアイテムサーチボックス
- 姉妹作（Housamo）に結婚システムが実装されました（あちらの主人公は高校生なのに、このゲームの主人公は社会人なのに……）

ソース列：

- **`feedback`**：「2025年9月30日から現在までにゲームが出したコンテンツや変更について、フィードバックはありますか？」（126件の回答）
- **`improvement`**：「このゲームにどのような改善を望みますか？（任意）」（213件の回答）

回答者403人のうち228人が少なくとも1つの列に記入し、111人が両方に記入しました。ほとんどが現役プレイヤーです。すでに辞めたプレイヤーには`(stopped)`と付けてあり、約12人だけです。

## 読み方

- **各回答は、まず個々の論点に分割しました。** そのうえで各論点をそれぞれのカテゴリに振り分けています。そのため、1人の回答者が複数のカテゴリに登場することがあり、長い回答は分解されています。
- **`×N`は、N人がほぼ同じ論点を述べたことを意味します。** そのあとの国コードがそれらの回答者を示すので、Nを確認できます。`~N`は非常に大きなテーマのおおよその人数で、キーワード検索を読み込みで照合したものです。同じ国が両方の列にほぼ同一の文面で登場する場合は、1回として数えています。
- **各カテゴリは、プレイヤーが気に入った点と、批判した点や要望した点を分けています。** 要望は、不足を示すものとして否定的・要望側に分類しています。
- **引用は短く切ってありますが、それ以外は原文のままです。** 翻訳方法に自信が持てない用語は、原語のまま残しています。
- **国コード**はISOです（ES = スペイン、SV = エルサルバドル、MO = マカオ、GB = イギリス）。`(F)`は`feedback`列、`(I)`は`improvement`列の論点で、文脈上役立つ場合に付けています。
- **ゲーム用語。** *ガチャ通貨*：「ether crystal / ether stones / stones / gems」、乙太虹石（IDの回答者は、ガチャや天井の文脈で「ether quartz」とも書いています）。*パラレル・クオーツ*（または単に「quartz」、平行石英 / 水晶）は別物で、**周回で入手できる強化素材**であり、現在は入手が遅く限られています（§3.9）。ガチャポイント交換所は契约所 / サーチ・ストラクチャ / 「search exchange」です。姉妹作の「Housamo」（放サモ / 放課後サモナーズ / TAS / 「Tokyo Afterschool Summoners」）は、比較の基準としてよく使われています。

---

## エグゼクティブサマリー：プレイヤーが最も望んでいること

| # | テーマ | 規模 | 方向性 |
|---|---|---|---|
| 1 | **翻訳**：より速く、定期的に、網羅的に、より高品質に、より多くの言語で | 約95人（記入者の約40%） | 圧倒的に「もっと、もっと速く」。公式翻訳そのものも、最も称賛された変更です。 |
| 2 | **ガチャ経済と天井**：無償通貨の増加、天井の引き下げや緩和、排出率の改善 | 約85人（約37%） | 大半が否定的：「ケチ」「1回の確定に1年待つ」。 |
| 3 | **オートバトル / 営業 / ロード時間などのQoL** | 約40人 | 最も好評だった仕様面の変更。続く要望：オートのデフォルトON、オートがパッシブを発動しない、スキップ/スイープ、ロード時間。 |
| 4 | **古いキャラ・弱いキャラ**：スキルツリーの頻度、強化、パワーインフレ | 約25人 | もっと頻繁に求められています。古い非限定ユニットに、少なくとも四半期に1回はスキルツリーを。 |
| 5 | **イベントの演出** vs **イベントの頻度 / ボックスイベント** | 約35人 | 演出（インタラクティブなマップ、カード）は好評。頻度、復刻、ボックス形式は批判されています。 |
| 6 | **alt とキャラクターの表現**：名指しのalt要望、女性★5、体型 | 約30人 | 具体的なキャラクターの要望が多数（§4に記載）。 |
| 7 | **コンテンツの深さ**：エンドゲーム、繰り返し遊べるモード、新モード | 約20人 | 「未踏探訪」スタイルは大好評。もっと欲しいという声です。 |
| 8 | **技術面**：ロード、ラグ、バグ、アカウント/データのバックアップ | 約25人 | ロードは改善したものの、依然として最大の不満の1つ。アカウントの保存は繰り返し出てくる悩みです。 |

---

## 1. 翻訳

約95人が翻訳に触れており、単独のテーマとしては断トツで最大です。その多くは「translations」や「faster translation」とだけ書いていました。

### 1.1 好意的な意見

- **公式翻訳があること自体が、最も称賛された変更です**（約25）。
  - 「5年も遅れたとはいえ、このゲームが得た最大の改善」（ID）。
  - 「5年越しに公式翻訳が来て最高。次のバッチが来るたびにワクワクして、もっと多くのキャラクターを知って好きになれる」（US）。
  - 「ゲームのアクセシビリティにとって大きな一歩」（US）。
  - 「翻訳はものすごく助かる…これから数か月ごとに出てくるのが待ちきれない」（US）。
  - ほかにAR、PR、PH、SG、ID、MY、UY、TW、BR、MOからも。
- **翻訳は商業面にも効果があります。** US：「翻訳のおかげでキャラクターにより感情移入できて、普段よりゲームにお金を使うようになった。」
- **中国語ローカライズがプラス点として挙げられました**（TW）：加分：中文化，系統優化（プラス：中国語化、システム最適化）。
  - 別のTWの回答者：介面與內容的中文化能更融入遊戲（インターフェースと内容の中国語化は、よりゲームに溶け込めるはず）。評価はされているものの、まだ違和感がないレベルではありません。
  - BR（中国語で）：翻译越来越多，越来越快（翻訳がどんどん増えて、どんどん速くなっている）。
- **配信されたバッチは気づかれていました。** US(F)：第3章と過去イベント2本が来て嬉しいが、今年のメインストーリー翻訳は少ないと指摘。
- **完璧でなくても、努力は認められています。** TW：「翻訳テキストはフォントや配置にまだ手直しが必要だが、とても歓迎すべき追加」。MY：「英語翻訳アップデートは少しぎこちなかったけど、とても感謝している」。US：「翻訳がまだ100%ではなくても」。

### 1.2 否定的な意見／要望

**A. 速度と配信頻度（最大の不満、約60）**

- 単なる「もっと速く／もっと多く翻訳を」が約45件。短い一言だけのものが多く、US、GB、FR、PL、BR、SG、ID、PH、LT、VN、MA、TW、CNなどから。
- 強い言い回し：
  - 「翻訳の速度は言い訳のしようがない」（CY）。
  - 「とても遅くてがっかり」（FR）。
  - 「古い翻訳を更新するペースが遅すぎるし、間隔も空きすぎ」（US）。
  - 官方翻譯真的太慢了（公式翻訳は本当に遅すぎる）（TW）。
  - 「LWさん、急いで…私の人生を捧げるから」（PH）。
  - 「英語版まで6年待たされて、さらにゆっくりした配信を待たされるなんてありえない」（US）。
- **バッチの大きさと頻度**：「数か月ごとに1〜2本は良いスタートだけど、もう9月半ばなのに第1章のBook 3とサイドイベント3本しかない」（US）。ほかに「もっと速く／大きなバッチで」（US）、「英語翻訳アップデートをもっと頻繁に」（BR、US）を求める声も。
- **日本と同時リリース**（×約8：ID、TH、US、FR、BR、AU、MY、PH）。
  - ID：「英語翻訳を日本のリリースと同期させて、海外のファンも一緒に楽しめるようにして」。
  - TH：新ストーリーの英語版を「日本と同時に」出してほしい。
  - FR：「リリース後に速く、できれば即座に」。
  - MY：古い積み残しを訳している*最中にも*、最新コンテンツを訳してほしい。
  - US：「日本のプレイヤー層と同じように遊べるなら、機械翻訳でも受け入れる」。

**B. スケジュールの透明性（×5）**

- PH：「翻訳について公式に告知してほしい。もう公開されていたと知って驚くのではなく」。
- VE：「リリースについてもっとはっきりさせて」。
- PR：「翻訳スケジュールについての追加の連絡」。
- PHとBR：*一定の*スケジュールを求めています。
- VN：「もっと定期的に更新して」。

**C. まだ翻訳されていないもの（カバレッジの穴）**

- **メインストーリー**：まだ一部のみ（US、MA、MX「半分くらいしか読めない」、EC、GB「メインストーリーをもっと」）。
  - CN：メインストーリーは第1部第4章から未翻訳。剧情第一部第四章就没有中文翻译了，新活动也没有翻译（ストーリー第1部第4章からもう中国語訳がなく、新イベントも未翻訳）。
  - 「メインストーリーとイベント」の翻訳を求める声（CN、SV、CL）。
- **キャラクタークエストとリンククエスト**（×3：FI ×2、PH）。FI：「キャラクタークエストとリンククエストには英語翻訳がない」。
  - PHは、ゲームが「メインストーリーとイベント以外のストーリーを訳さない放サモに続いてしまう」ことを心配しています。
- **イベントストーリー**：新イベント（CN、CL、TH、SV、ID）と**復刻イベント**（×4）。
  - US：「イベントが復刻されるなら、翻訳を優先すべき」。
  - TH：「復刻イベントには、放サモのように英語翻訳をつけるべき」。
  - SV：「復刻時に、抜けている章やイベントを訳して」。
  - AU：「復刻イベントの翻訳」。
  - CL：ヒーローの「デート」も翻訳してほしい。
- **スキル、スキルツリー、アビリティ、ステータス**：
  - GB：「スキルツリーが翻訳された状態でゲーム内に実装されれば、キットが直感的に理解しやすくなるのに」。
  - MY：「スキルツリーがリリース時に翻訳されていないのはおかしい。少なくともスキルは翻訳されるというのが売りだったのに」。
  - ID：「せめてスキルの翻訳をもっと速く」。
  - TH：一部のヒーロースキルが「まだ日本語のまま」。
  - US：「アビリティ、ステータス、サイドキック、UI要素がまだ未翻訳」。
  - CN：增加中文翻译，包括主线/活动剧情、角色技能等（メイン/イベントストーリー、キャラクタースキルなどの中国語翻訳を増やす）。
  - MO：新キャラのスキルテキストが「小作文」（作文のように長い文章）になっており、公式の中国語があっても、他のネットユーザーが書き直した中国語の説明（中译中）がないと理解できない。
  - ES：「冗長なテキストを減らして」
  - ID：ガチャバナーの新ユニット*戦闘トライアル*を翻訳してほしい。日本語以外のプレイヤーもスキルの仕組みやおすすめを確認できるように。
- **UI**（×4：US(I)、FI、ID、PH）。「UIの完全翻訳」（US）。
- **ボイスライン/戦闘ボイスの字幕**：§4.4参照。

**D. 翻訳の品質とUIへの収まり**

- テキストがUIの枠からはみ出す（FI、PH「翻訳に合わせてUIが収まるようにしてほしい」、ID「現在のゲーム内テキスト表示の問題を修正して」）。
- 文字抜けのバグ、漏字的bug（CN）（脱字のバグ）。
- ぎこちない品質：「これだけ大きなゲームにしては、シナリオ翻訳が少し恥ずかしい」（ES）。
- もっと丁寧にという素朴な要望：翻译认真一点啊（CN）（翻訳をもっと真面目にやってよ）、翻译用心点（CN）（翻訳に心を込めて）、「品質は良くなければならない」（BR）。
- フォントと配置に改善が必要（TW）。
- 「翻訳を1〜2年のうちに修正して」（TW）。
- **バグ**：「なぜか英語の設定が標準（日本語）に戻ることがある」（RU）。

**E. 方法**

- CL：翻訳は速くしてほしいが「人間の手によるものを。AIやMTLはなし」。
- US：日本版と同時になるなら機械翻訳でも受け入れる。
- MY：英語翻訳者を本当に増やせば「もっと速く最新に追いつける」。

**F. ほかの言語**

- **中国語**：簡体字×約7（CN）、繁体字×約6（TW、HK）。
  - HK：希望官方可以加快劇情翻譯的進度（公式にストーリー翻訳の進行を速めてほしい）。
  - CN：新活动剧情追加多语言（新イベントストーリーに多言語を追加）。
  - TW：更多劇情翻譯，活動劇情能更貼切展示當期sp角色（ストーリー翻訳をもっと増やし、イベントストーリーでは今回のSPキャラをもっとうまく見せてほしい）。
  - TW（stopped）：讀取真的問題很多，不能skip也很耗費耐心，龍脈有完整翻譯，這邊幾乎沒有（ロードの問題が本当に多く、スキップもできず根気が要る。龍脈には完全な翻訳があるのに、こちらはほぼない）。ロードへの不満に加え、完全翻訳のある別のゲーム「龍脈」（Another Eidos of Dragonvein）との比較です。
- **スペイン語**（EC「Spanish version」、SV「Include Spanish」）。
- **タイ語**（TH：「公式タイ語翻訳はとても難しい夢のように思える」）。
- 言語指定のない「他の言語の翻訳をもっと」（PH）、「多言語対応は拡大し続けられる」（AR）、「日本語以外の言語の対応が遅い」（MY）。
- 反対意見：日本語が読めるUSの回答者：「日本語は読めるけれど、やはり母語ではない」。

---

## 2. ガチャシステム

約85人。使われている用語：{% include item.html name="Ether Crystal" %} / ether stone(s) / 乙太虹石（IDの一部の回答者が書く「ether quartz」も）＝有償または無償のガチャ通貨。これは強化素材の{% include item.html name="Parallel Quartz" %}（§3.9）とは別物です。ticket＝エーテルチケット、「200 pull / spark / pity」＝200連の交換確定（天井）。

### 2.1 好意的な意見

- **今年はガチャ経済が改善されました。** US：「5.5周年の限定チケットや、イベント中のより頻繁なログインボーナスなど、ガチャ経済を良くしようとするLWの努力は、もう1つの良い兆し。」
- **少しずつの改善が認められています。**
  - TW：福利有變好在改善了，但感覺還是少了一點點（待遇は良くなってきているが、まだほんの少し足りない気がする）。
  - JP：「LWはガチャに調整を加えた」（ただし2.3を参照）。
- **バナーの機能とショップが称賛されました。**
  - IDは**召喚バナー内の戦闘トライアル**が気に入っています。
  - IDは**週替わりショップ**と、**購入可能な過去イベントのヒーロー補助スキン**が気に入っています。
- **廃止されたボックス交換**は「なくなって良かった」と書かれています（MY(F)、「Echoes of frontier memories」について。§6.2参照）。
- **★4ヒーローのバリアントの復活**は「人気のないキャラクターにとって有望な兆し」とされています（US。§4.1参照）。

### 2.2 否定的な意見：無償通貨の入手量（約65）

- **「無償の石/ジェム/結晶をもっと」という一般的な要望**：×約40、ほぼすべての国から。典型的な言い回しは「More gems」「more pulls opportunity」「more free stones」「more ways to earn stones」。
- **「ケチ」という捉え方：**
  - BN：「ニッチなゲームにしてはケチに感じる。」
  - CY：「素材、特にガチャに対してもっとケチらないで。」
  - RU：「ガチャ通貨にケチ。」
  - IT：「このゲームは本当にケチだ…アプリ内課金は高い…たった1キャラを確定させるのにほぼ1年貯めなければならないのは気が滅入る。」
  - US：「エーテル石の経済はひどすぎる。欲しいキャラを確定させるのにまだ1年待たなきゃいけないなんて最悪。」
  - VE：「そんなに必死に貯めても、年に2回の天井がやっと。」
  - BR：「前作のTASより報酬が少ない。」
- **具体的な数字：**
  - TW：福利非常少，一個版本只能湊到10~20抽（待遇が非常に少なく、1バージョンで10〜20連分しか貯まらない）。
  - TH：「1パッチあたり最低でも50ジェム」、「最低でも月100ジェム」、そして「だからプレイヤーが少ない」。
  - TW：相比其他同市場的遊戲，寶石給的數量會讓人想退坑（同じ市場の他のゲームと比べて、ジェムの量がやめたくなるレベル）。
- **無課金への思い**：「ゲームをもっと無課金向けにして」（US）、「無課金プレイ用に無料の★5をもっと」（TH）、「最近の無課金プレイヤーはプレイが大変」（TH）。「福利ユニットが古い」も（RU ×2：「ほとんどの福利ユニットが古い」と「使える福利ユニットをもっと」）。
- **他のゲームとの比較**：プロジェクトセカイ「通貨を手に入れる方法がまだある」（LT）、Eidos「最もひどい」（US、IT）。
- **具体的な入手増の要望：**
  - 毎日のエーテル晶石（TH）。デイリークエスト報酬（PH）。
  - **週間・累計ログイン報酬の改善**（×4：PH、ID、US、US）。
  - エーテルチケットのマルチ引きオプション（RS）。
  - チケットが必要な各クエストで、3枚すべてを使えるように（FR）。スキップチケット（US、stopped）。
  - **定期的な結晶の入手源**（US(I)：「石を貯めるのがあまりにも遅いので、LWにはエーテル石の別の定期入手源を追加してほしい」）、「結晶を稼げるコンテンツをもっと」（PH。ガチャ通貨なのか強化素材なのか曖昧だが、同じ回答でリソース獲得手段の増加とラフ購入の値下げも求めているのでここに分類）、「石をもらえるタスクをもっと」（MY）。
  - 月次の「Simulator」（GB(F)、原文のまま：「Change Simulator to Monthly」。おそらくチャレンジシミュレーションの報酬のこと）。
  - ジェム稼ぎのための「頻繁にリセットされるサイクルのあるエンドゲーム」（VN）。
  - US：「特に[無課金プレイヤーが]ストーリーをクリアしたあとは。」この回答者は、ストーリーの章を小さく分割して、完了のたびにジェム報酬が出るようにすることを提案しています（§5参照）。
  - デイリーカードガチャのより良いリマインダー（US）。
- **天井との複合**：「ジェム収入の増加か、より良い天井、またはその両方」（AR）、「ガチャを今のままにするなら、毎日か毎週にもっと無償ジェムを」（US）。

### 2.3 否定的な意見：天井、スパーク、排出率（約40）

- **200連のスパークは高すぎる／到達が遅すぎる**（×約15）。
  - 「この排出率の低さで、限定★5の確定に200連かかるのはやめてほしい」（US）。
  - 半分に：降井（200→100）（CN）（天井を200から100に下げる）、「キャラを天井まで引くのに必要なジェムの量は半分にすべき」（US）、「★5確定に必要な連数を減らして」（DE）、「ガチャポイントを下げて…引く人が増えても欲しいキャラが出ないのは気が滅入る」（MY）。
  - 「1回引くための石を5から2…3…4に減らして」（TH ×2、FとI）。
  - 「200連確定のために貯める時間を減らすため、ガチャ経済を拡大して」（US）。
- **天井がバナー間で引き継がれない**（×5）。
  - LU：「200連の天井がバナー間で引き継がれない。引き継げるようにするか、ガチャ経済を大幅に増やすべき。」
  - MY：或者能繼承保底數（あるいは天井カウントを引き継げるように）。
  - SG：「無課金プレイヤーが1回の天井のために200連分を貯めるのは難しいので、累積型の天井システムを。」
  - CN：契约所（ガチャポイント交換所）のポイントは次のバナーに持ち越せません。この回答者は**各バナーの契约所に100ポイント段階を設ける**ことを求めています。理由は「80〜90ポイント引くと、すでに欲しいキャラが出ることもあるのに、交換所には200ポイント交換しか並んでいない」から。200まで待つのは無駄で、余った90ポイントが使えないと感じています。
  - US：「余った天井ポイントは、Housamoのようにチケットと交換できるように。」
- **ソフト天井／確率上昇がない**（×6）。
  - VE：「天井システムの導入（スパークだけでなく、引く回数が増えるほど確率が上がるという意味で）。」
  - JP：「何回引いても★5の割合が変わらない…天井システムか確率アップを本当に作ってほしい。」
  - FI：「より良い天井システム、あるいは単に★5の確率を上げるのでは？」
  - US：恒常バナーでのスパーク、「あるいは少なくとも、★5が出るまで5〜10連ごとに確率上昇を。」
  - US：天井は「Eidosを除く他のガチャと比べてひどい」。
  - PH：「より良いガチャ排出率/天井、またはもっと無償/イベントのジェムを。」
- **排出率と公平性**（×約10）。
  - 「もっとずっと良いガチャ排出率」（US、stopped）、「ガチャシステムはとても不公平」（MX）、「ガチャシステムもかなり不公平」（ES）、「もっと優しいヒーロー排出率」（TH）、「限定キャラの排出率を上げて」（MY ×2：FとI）。
  - TW：機率提高（確率を上げて）。
  - 素朴な「より良いガチャシステム」（RU、VN、FR、ES、US、BR）。
- **交換天井／ショップ天井**：IDは「ether quartz、ガチャチケット、search exchange pity」を挙げています。厳しい入手量のせいで、新規プレイヤーが新ヒーローを引くのは難しくなっています。
- **特定のユニットを引けなかったことへの不満**（設計への苦情ではなく、感情のシグナルとして）：US(F)はHuckleのaltを引けなかった。MY(F)「エーテルを全部使ったのにAndrewとHuckleが出なかった」。US「S.Hydoorを引くために、もっと良いガチャを」。US「またS.Hydoorで外れを引かされた」。

### 2.4 ポイント交換所、セレクター、交換

- **無料の限定★5セレクター／自分で選べるパック**（×4）：能不能出限定五星的自选礼包？（限定★5の選択パックを出せないか？）（CN、FとI）、多點自選禮包（選択パックをもっと）（TW）、「Free limited 5* selector」（TH）、「無課金プレイ用に無料の★5をもっと」（TH）。
- **サーチ・ストラクチャ／ガチャポイント交換所**：
  - 古いユニットを追加して、購入できるように（IT）。
  - 「ショップの交換アイテム（ラフ、サーチ・ストラクチャなど）を更新して」（ID）。
- **フレンドポイントガチャ**：「フレンドポイントガチャの報酬を更新/改善して」（US）、「アライポイントでもっとできること」（US、stopped）。
- **ガチャ後の変換の利便性**：「レコードキューブへの一括交換ボタン」（PH）。IDは、余ったメモリーシャードとサイドキックの心をレコードキューブに一括変換できるようにしてほしい。ガチャのあとに1つずつ変換するのは面倒だからです。（§3.6にもあり。）

### 2.5 バナーと復刻の頻度（ガチャの排出側）

- **復刻が単調**：「復刻が多すぎる。新コンテンツは通常2か月に1回だけ」（SE）。
  - PH（ノンバイナリー）：「復刻バナーでは、初登場バナーをただ繰り返し復刻するのではなく、古いキャラ/altを混ぜたものをもっと。」
  - TW：瘋狂復刻劇情活動，久久才一次新的（ストーリーイベントを狂ったように復刻し、新しいものはなかなか来ない）。
- **altの待ち時間**：
  - 「キャラクターのaltが、たとえば3年もかからずに来るように」（MX）。
  - 「新しいキャラクターaltの公開に時間をかけすぎないで」（MX(F)）。
  - JP：新しいキャラクターを先行公開するなら半年以内には実装してほしい
  - JP：ディグラムとテオレールの限定化を早く…頼む…（{% chara_link Digram %}と{% chara_link Theoreol %}の限定バリアントを早く出して、という意味）
  - PH：「2つ目のaltが登場したことで、人気のないキャラクターの最初のaltを待つ辛さがいっそう厳しくなった。」
  - SE：「まだaltのないキャラクターに優先してaltを」（キャラクター一覧は§4.1参照）。
- **二極化**：USは「altをもらうキャラクターは公平」と書きながら、引く意欲がありません。VNは「altヒーローが1人しかいないので、限定ヒーローではなく無理にベースヒーローを使うようにしている」。

### 2.6 価格設定と収益化

- **月パス／月額パック**（×3：ID、PH、TH）。PH：「手頃な30日の月パス…課金の少ない人向けに、もっと手頃なゲーム内購入」。TH：「良い月パスがあれば、少ない出費でエーテル晶石を得られる」。
- **石パックの値下げ**（×4：TW 課金石變便宜一些（有償石をもう少し安く）、US stopped「石の価格を下げて」、PH「ラフの購入をもっと安く」、IT「アプリ内課金は高い」）。
- **クジラではなく「ドルフィン」（少額課金層）向けのショップセール**（US）。
- **中国での決済**：CNは中国区氪金平台（中国区の課金プラットフォーム）への対応を求めています。Webストアではエラー0003-0003（「この地域では支払い方法が利用できません」）が出ると述べ、**WeChat PayとAlipay**を提案しています。
- **商業面と翻訳のシグナル**：§1.1参照（USは、翻訳で支出が増えたと述べています）。

---

## 3. ゲーム機能へのフィードバックと要望

### 3.1 QoLとオートバトル

**好意的な意見（約40人がQoL項目に言及）**

- **オートバトル／連続オート／オート周回**（×約10：US ×4、ID ×2、TW、UY、MY、US nb）。「新しいスタミナとオートバトル機能だけで、Autumn Campaignが私のお気に入りになった」（US）。「ついにオートバトルが追加された、神に感謝」（ID）。連續戰鬥便利性很棒（連続戦闘の利便性が素晴らしい）（TW）。
- **営業の刷新**（×約9：FI、US ×3、ID ×2、MY、UY、TW）。「ずっと楽な作業になった」（US(F)）。「営業の管理はいつも苦痛だった。特に仕事が長い日や営業の通知が鳴らないときは」（FI）。派遣可以分時段領取收穫（派遣の収穫を時間帯ごとに受け取れる）（TW）。MY：「営業の刷新とバトルスキップで、ゲームがずっと速くなった」。
- **ロード時間と速度**：「最新パッチでロード時間を改善してくれて本当にありがたい」（US）、「ゲームが速く動く」（UY）、系統優化（システム最適化）（TW）。
- **複数スタミナ／複数バトル**：「スタミナを倍数で使う」機能は歓迎されていますが、以下を参照。
- **終わらない仕事**（TW）：「良いこと」。
- 全体として：「9/17アップデートのQoL変更はすべてとても良い」（US）、「LWは本当にプレイヤーのフィードバックを聞いてくれている」（MY）。

**否定的な意見／要望**

- **オートバトルがデフォルトでONになる**（×2：US(F)「デフォルトでオートバトルなのは[良くない]」、US(I)「オートバトルのデフォルトを未選択に戻して」）。
- **オートが必要ないコンテンツでも発動する**（US(F)）。
- **オートがパッシブ/S4スキルを使わない**（×3）：ID「オートでパッシブが連動してスキルが発動しない」、UY「オートバトルでS4を発動するパッシブスキル」、US nb「新しいサイドキックのパッシブ、あるいは過去の手動バトルで行ったすべての行動を自動で保存して繰り返すシステムへの作り直し」。
- **9/17アップデートのバグの多さ**（US）。
- **終わらない仕事では、ヒーローをその場で変更できない**（TW）。
- **繰り返しではなくスキップ／スイープを**（×約7）。
  - US nb：「新しく追加された、スタミナを倍数で使う機能は良いけれど、クエストをスキップするのではなく繰り返すことに変わりはない。」
  - US：「リリースされたばかりのマルチバトルは良いが、スキップ機能のほうがさらに良い。」
  - CN：一键扫荡（ワンクリックのスイープ）、さらに「挑戦回数3」のミッションでは3回周回ではなく3倍スタミナで。
  - ID：「クエストを複数回実行する機能」。
  - US（stopped）：スキップチケット。
  - VN：「ゲーム内のBlitz（高速クリア）」。
  - PL（stopped）：「デイリーの0/3ミッションチャレンジを、チケット使用1回と非使用2回ではなく、同じイベントミッションを3回やることでこなせたらいいのに。」
- **スピードアップ**（AR「バトルを加速するボタン」、CN 战斗高倍速（2～3倍速）（戦闘の高倍速（2〜3倍速）））。
- **戦闘中**：「バトルメニューの中からバトルをやり直す機能」（FI）、「戦闘中にステータス情報へ簡単にアクセスできるように」（CO）。
- **単調な周回**（CN「减少通常关卡的重复攻略数」（通常ステージの周回数を減らして）、US「クエスト/周回の繰り返しをスキップできるオプション」）。

### 3.2 オフィスと営業

- **オフィスが停滞していて、インタラクションが少ない**（×6）：CN 更新一下办公室，已经很久没有新东西了（オフィスを更新して。長い間新しいものがない）、TW 辦公室功能互動感很低（オフィス機能はインタラクション性が低い）、US「オフィスの拡張はどうだろう？ 少し停滞している」、ID「ヒーローとサイドキックの基礎ステータスを強化するオフィスの新機能」（他のゲームのユニットレベル上限拡張のようなもの）、AU「最大ランクに到達したあと、会社実印の使い道がない」、ID「オフィスの新機能」。
- **オフィスの贈り物/プレゼンテーションは、営業のように時間の蓄積を使うべき**（×4）：TW 辦公室的送獎 可以跟業務一樣改成時間累進（オフィスの報酬贈呈を、営業のように時間蓄積式に変えられる）、BR「営業が作り直されたのと同じように、最大時間に達する前にオフィスのプレゼンテーションを受け取れる方法」、TH「オフィスのギフトを営業ミッションと同じように改善して」、ほか同様の意見。
- **会社実印**：AU：最大ランクで使い道がない。US：「会社実印を入手する方法をもっと」、「実印の汎用的な入手方法」。

### 3.3 未踏探訪／探索モードとダンジョン

**好意的な意見**

- 「最新の未踏探訪はとても楽しく、ほどよく挑戦的」（US）。
- 「開発者は未踏探訪のスタイルをもっと活用すべき！ すごく楽しくて、簡単に繰り返し遊べる。イベントがこの形式で行われたら、ずっとエンゲージメントが上がると思う！」（US）。
- 「ダンジョンモードは本当にリプレイ性が高い！」（US）。
- エンドゲームは「パズルである限りでは、実はかなり難しい」（US、好意的〜中立）。

**否定的な意見**

- MY：「新しい探索モードは好きじゃない」、「探索モードをもっと簡単に、ノーマルモードを簡単にするみたいに」。
- ID：パワーインフレ、「特に最新の探索モード」。
- US：「旧探索に哀悼の意を（Press F）。」

### 3.4 ヒーローカードコレクション（コレクターズカード）

**好意的な意見**

- 「面白い…もっと拡張してほしい」（US）。
- 「ゲームプレイに何も加えなくても、なかなか良い」（US）。
- 「サマーモンタージュ・ハレーションのサマートレーディングカード」（US、イベントのビジュアルとして）。

**否定的な意見／要望**

- TW(F)：扣分：英雄卡片蒐集（マイナス点：ヒーローカード収集）（否定的、理由なし）。
- CN：カードが本物のホイルカードのように見える、きらめくポリゴンエフェクトによる**目の疲れ**。この回答者はそのせいでサマーモンタージュのカードを1枚も強化しておらず、**カードエフェクトをオフにする切り替え**を求めています（自主选择是否开启英雄卡特效（ヒーローカードのエフェクトをオンにするか自分で選べるように）、(I)にもあり）。
- 報酬（IT）：「カード収集で何か報酬（壁紙、石、カスタムアイコンなど）がもらえるべき」。
- さらなる機能（IT）：壁紙、ホーム画面、オリジナルアートワーク。
- 選択したカードをユーザープロフィールに表示（PH nb）。
- ID：カードのレアリティ用の「緑の三角」素材を、ショップに行かずに**すぐ購入**できるように。

### 3.5 カスタマイズとプロフィール（×約12）

- ホーム画面の**背景**変更（TW、VN、MA「新しいメインメニュー」）、**ホームページの音楽**（CN ×2：希望能更换主页的音乐（ホームの音楽を変更できるように）、自己更换主页音乐（ホームの音楽を自分で変更））。
- **名刺**のバリエーションとキャラクターとのインタラクションの組み合わせ（TW）。名刺の背景に最大4人のヒーローまたはサイドキック（TH）。
- **プロフィールアイコンの選択肢**（PH nb）、「プロフィールアバターをゲーム内キャラクターに変更」（TH）。
- **デスクのカスタマイズ**（GB）。もっと汎用的なキャラクターの**装飾**（MY、角色模組的小裝飾（キャラクターモデルの小さな飾り））。
- **称号**（TW）：称号の「new」バッジのせいで新しい称号を必ずクリックさせられ、そのまま装備されてしまいます。これは「強迫性障害の人には優しくない」。回答者は称号を固定できるようにしてほしい。
- **スキンシステム／プレミアムスキン**：「スキンシステムかキャラクター用アクセサリーをもっと」（VN）。ArknightsやR1999のように衣装全体の変更とVFX/SFXの変更を伴うプレミアムスキンシステム（US）。§4.3参照。
- すべてのユニット、モブ、特別なNPCを見られる**ギャラリー**（US）。
- **ログインカレンダー／履歴**と**プレイヤー情報・統計ページ**（AR）。

### 3.6 編成、UI、ソート、メニュー

- **編成/ロードアウトのスロットをもっと**（×3：CN 可以保存更多编队（より多くの編成を保存できるように）、TW 希望有更多編組（編成をもっと）×2（FとI）、US「ロードアウトスロットをもっと」）。
- **6人編成**（BR）、そして**サポート編成**の制限：MY 助戰角色編成那邊如果可以拔掉屬性限制改為最多編入6位任意屬性的角色也不錯（サポートキャラの編成で、属性制限を外して属性を問わず最大6人まで編成できたら良さそう）。
- **ソート/フィルターの保持**（×3：VN、CN、BR「UIソートシステム」）。CN：在备战界面将排序设置为"Lv"+"降序"（出撃準備画面でソートを「Lv」＋「降順」にしても）が毎回リセットされます。
- **ロールフィルター**（ID：「特定のロールのヒーローだけを表示」）。
- **サイドキックスキルの絞り込みと、人気パッシブのおすすめ**（TW：助手技能的塞選不夠多，或是建立大家在目標角色上近期所搭配的被動使用次數前幾名 (類似於角色之推薦被動搭配)（サイドキックスキルの絞り込みが足りない、もしくは、みんなが対象キャラに最近組み合わせているパッシブの使用回数上位を作ってほしい（キャラクターのおすすめパッシブ構成のように））。
- **「前回使用したチーム」に永続的な削除オプションが必要**（US）。
- **ショートカット**：「ランクアップ画面から直接レベリング画面へ移動」（US）、「{% include item.html name="Record Cube" %}への一括交換ボタン」（PH）、「余ったヒーローメモリーシャードやサイドキックの心をまとめてレコードキューブに変換」（ID）。
- **新しいスマホに切り替えたときのスキンの赤丸通知**（US）。
- **メニューが扱いにくい／メニューを改善して**（US(I)、US、BR「いくつかのUI変更」）。
- **CNの詳細なUIリスト**（異例なほど具体的なので残しました）：
  1. **メインストーリーの入口**をイベントの入口より目立たせる。イベントの入口は大きすぎて、新規プレイヤーをイベントへ誘導しているようで、イベントをタップするとイベントミッション画面が2回表示される。
  2. 新しいステージをタップしたときに「入りますか？」の確認を追加する（誤タップで「接続中」の待ちが2回発生する）。
  3. **サポート選択**画面の左下の戻るボタンに確認を追加する（ラグによるダブルタップで戦闘準備から抜けてしまう）。
  4. ヒーロー/サイドキックの長押しで、ステータスではなく**スキルセット**を先に開くようにする（そして点滅する黒い「接続中」画面をなくす）。
  5. **「习得装备技能」**を再設計し、装備スキルを最初から使えるようにする。現状では、発動順を変えるだけのためにスキルスロットを1つ消費してしまう。
  6. **接続**速度：ガチャ/編成/ショップからホーム画面に戻るとき、必ず接続ステップが入る。バックグラウンド化するかなくしてほしい。バトルのロードはステージをタップしてからサポート選択まで10秒以上かかる。別のアプリに切り替えて戻ると、「接続中」が数分間固まったままになる。
  7. 画面ごとにソート設定を記憶する。

### 3.7 パフォーマンス、バグ、技術面

- **ロード時間**（×約6：ID、CO、FI、CN（上記）、TW(stopped)、US）。最新パッチへの称賛もあります（US）。
- **ラグ**：「一部のヒーローの動きで体験全体がカクつく。ハイエンドのOSで、両方の端末で起きている」（ID、FとI）。US：「ラグを減らすため、スキル3、戦闘中キャラクター、アニメーション背景のアニメーションを無効化/スキップするオプション。」
- **バグ**：「たくさんのバグ」（BR）。TW：「いくつかのバグを修正して…バグ修正にもっと速く対応して」。THの挙げた例：タイトル画面のフリーズが2〜3回、編成名変更のエラーポップアップ（繰り返し発生）、ヒーロー/サイドキック一覧が時々表示されない（再参加が必要）、アートチェンジ機能に表情がない。
- **ダウンロードサイズ**（US：「ダウンロード時間を短く」）。
- **スキル3／奥義のスキップオプション**（TH「戦闘でのスキルアニメーションのスキップ」、「より速いスキルアニメーションのオプション」）。

### 3.8 パワーバランス、キット、スキルツリー

**好意的な意見**

- 新しいスキルツリーは気づかれていました：「この投稿の時点で、新しいアップデートによりスキルツリーが2つ追加されたが」（AU）。

**否定的な意見／要望**

- **古いユニットのスキルツリーの頻度**（×約15）。最も具体的なもの：
  - JP：「スキルツリーの追加ペースに不満がある。2026年は1月と9月の2回のみで、いずれも限定☆5キャラクターのみだった」（2026年のスキルツリーのリリースは1月と9月の2回のみで、どちらも限定★5のみ）。さらに、{% chara_link Furlong|h2 %}のリンククエストが追加された時にスキルツリーを見送ったのは機会損失だったと述べ、頻度を上げるよう求めています。
  - ID「過去のヒーローのキットをスキルツリーで、できるだけ早く改善してください」、「スキルツリーのない古いキャラクターは苦しんだ…あっても、{% chara_link Ryekie|h2 %}のようにまだゴミなものも」。
  - PH：**古いスキルツリー**を新しいものに合わせて更新してほしい（例：{% chara_link Akashi|h1 %}のスキルツリーは「めちゃくちゃ」）。
  - US「古い非限定ユニットのスキルツリーをもっと頻繁に」、「弱いユニットのスキルツリー更新をもっと速く」、ID「時代遅れのキャラクターにスキルツリーを追加するか強化する頻度をもっと上げて」、UY「古いユニット、特に発動率の低いスキルや、燃焼・毒を引き起こすスキルを持つユニットのスキルツリー」、BR、PH、TW（舊角色強化一年能多2-4隻＝古いキャラクターの強化を年に2〜4体増やす）、TH（「古いキャラクターへの強化をもっと」）。
  - FI：{% chara_link Pubraseer %}のスキルツリーを★3と★5の両方に。
- **パワーインフレ**（×3）：ID「パワーインフレが行き過ぎになってきている（特に最新の探索モード）」、JP：火属性ヒーローの強さのバランスが「突出して高い」、新しい水属性ヒーローはアタッカーが多くて不均衡。TH：「育てているヒーローは、おそらくもう新しいヒーローにメタで負けている」（PWシャードの遅さ）。
- **キット設計**（×約6）：
  - 「ダメージが高く、もっと楽しく設計されたキット」（BR）。
  - 「ゲームプレイに合わせてヒーローのキットをバランス調整し、取り残されるヒーローが出ないように」（ID）。
  - 「非常に特定のニッチなメカニクスに強く縛られない、ユニークまたはもっと柔軟なスキルとキットの実装」（US）。
  - 「チームのアーキタイプでプレミアムキャラクターへの依存を減らして」（US）。
  - 「もっと面白い★4のキットを！ MQLorenごめん、君じゃない（バリアが強化されるなら別。バリアを直して）」（US）。
  - **シールドの仕様**：「シールドが他のシールドを上書きせず、加算されるように」（GB）。
  - 「主人公にサイドキックスキル用の小さなバフを、たとえば無料のVPをくれるとか」（FI）。
- **個別のバフ要望**：加强木贞（CN、「{% chara_link Sadayoshi|h2 %}を強化して」）、「ベースの{% chara_link Barrel|h1 %}を強化して」（PH）。
- **難易度／ローテーション**：
  - 「別のユニットを使う理由ができるように、高難易度ステージをもっと」（US）。
  - 「SSSのローテーションをもっと頻繁に変更」（GB）、「SSS/SSのバリエーションをもっと」（US）。
  - 「SSSクエストは良かったけど、もっとバリエーションがあっていい」（US(F)）。
  - ★3以下の制限を★4以下に引き上げる（US）。
  - チャレンジクエストで、他の/おすすめ編成を許可する（US）。
- **理解しやすさ**（×5）：新規プレイヤー向けに、トライアルクエストのようにキャラクターの中核メカニクスを説明する（NG）、「ビルドガイド」（ID）、「フレンド/コミュニティのヒーロークリア一覧」（AU「所持しているヒーローをハイライト」）、「フレンド/コミュニティからおすすめチームを」（VN）、分かりやすいゲームプレイ/強化（US、stopped）、「ほどよいシナジーのある編成やヒーローのおすすめ」（ID）。

### 3.9 育成、素材、リソース

- **{% include item.html name="Parallel Quartz" %} / 平行石英 / 水晶（周回で入手できる強化アイテムで、ガチャ通貨ではない）**：現在は入手方法が遅く限られているとプレイヤーは言っています（×4：CL、TW（FとIで同じ文面、1回として計上）、TW、GB）。
  - CL：「デイリーチケットクエストやイベント報酬の中に閉じ込めず、パラレル・クオーツを無限に周回できるように」。
  - TW：希望素材緩和(尤其是平行石英)（素材を緩和してほしい（特に平行石英））（FとI）。
  - TW：平行武裝強化耗的水晶有點高（パラレルウェポン強化に必要なクオーツのコストが高い）。
  - GB：「より良いクオーツ周回」。
- **{% include item.html name="Dream Symbol" %} / {% include item.html name="Astro Credit" %}**は、イベント報酬や月替わりショップではなく、周回できるようにしてほしい（CL）。
- **★7素材**は、月替わりショップの更新ではなく周回できるように（US）。
- **PWシャードの速度**：「1つを最大にするのに2か月かかったので、基本的に1チームを育てるのに8か月必要」（TH）。
- **覚醒石**：一度にもっと多く入手できるように。「小6個、中5個、大3個」のような詰め合わせを出すチケット版も（FI）。
- **EXP／レベリング**：CNは、新規プレイヤーが高レアのヒーローをLv.60まで上げられず、難しいイベントコンテンツを遊べないと述べています。EXPアイテムをもっと増やし、EXP/ラフ（コイン）ステージの報酬を上げてほしいそうです。
- **スターシャード**：4000個の上限を撤廃する。{% chara_link Gnomon %}と{% chara_link Ruchbath %}をスターシャードショップに追加する（US）。
- **レベル上限と強化**：
  - ヒーローのレベル70（ID、PA「7星まで昇格でき、最大レベル70」）、開放等級上限（レベル上限の開放）（HK）。
  - 4つ目のパッシブスロット（ID ×2）。
  - ダブり引き以外の**刻印レベル**（VN）。古いモブを恒久化し、刻印レベルも付ける（PH）。
- **絆の作り直し**（ES）：キャラクターを多く持つ古参プレイヤーにとって、サイドキックのレベル上げは大変です。「サイドキックを100まで上げれば、誰でも装備できるようにする」ことを提案しています。
- **キャラクターのリセット**アイテムで強化素材を返却（TW 出重置角色返還升級素材的道具（キャラクターをリセットして強化素材を返還するアイテムを出して））。
- **キャンペーンクエストの経済**（AU）：ラフとスタミナの比率が通常のランクアップクエストよりわずかに良い程度で、覚醒石の技術書のおかげで通常クエストのほうがコスパが良くなっています。また、「経験、交流、荒稼ぎの技術書」をキャンペーンの無料クエストにも適用してほしいそうです。
- **素材周回**全般（US ×2、PH、VN「素材周回」、BR「リソースの改善」）。

### 3.10 エンドゲーム、コンテンツの深さ、新モード（約20）

- **エンドゲーム/ダンジョン/繰り返し遊べるコンテンツをもっと**（×約8：PH ×2、BR、VE、US、MY、VN）。「繰り返し遊べるコンテンツがもっと必要」（VE）。「意味のあるデイリー活動が不足している」（AR）。
- **新モード**（×約8）：
  - レイドボス/協力プレイ（TH）、非同期協力プレイ（GB）。
  - **PvPマッチ**：MYは、キャラクター選択を隠したオンラインのプレイヤー対プレイヤー戦を提案しています。レベルでマッチングし、報酬はエーテル（SPD順の行動順なので成立し得る）。
  - ArknightsのReclamation Algorithm（生息演算）のような**ローグライトやサンドボックス/ビルダーモード**（ID）、ミニゲームイベント（ID）、「新しいゲームモード」（VN）、更多新玩法和模式（新しい遊び方とモードをもっと）（MY）。
  - 「アーケードモード」：ストーリーをまとめた段落と、より長い戦闘シーケンス（PH、stopped）。
  - BR：「前作のようなAR、またはAnEiのようなEidos」（原文のまま）に加えてダンジョン。
  - US：イベントとアビリティ覚醒をもっと。
- **既存メカニクスへのコンテンツ追加**（AU、オフィス、スキルツリー）。
- GB(F)：「Change Challenge Simulator to Monthly」。

### 3.11 アカウント、データ、地域

- **セーブデータ／アカウントのバックアップ**（×7：TW、TH ×2、TH other、US、MA、PH）。TH(stopped)：「セーブデータが必要。リンクセーブは嫌い」。US：「より安全なデータ保存方法」。MA：「アカウントをメールかiCloudに連携したい」。PH：「Google/Appleアカウント連携」。TW：資料備份需要更靈活方便的方式（データのバックアップには、より柔軟で便利な方法が必要）。
- **中国での決済**（§2.6参照）。

### 3.12 新規プレイヤーの体験

- RU：「初心者向けではない」、福利ユニットが古い。
- US（stopped）：「分かりやすいゲームプレイ/強化」。
- CN：新規プレイヤーはLv.60に到達するのに苦労する。
- ID：ヒーローのビルドガイド（一度もプレイしたことのないプレイヤーからも）。
- 無課金については§2.2も参照。

---

## 4. キャラクター：デザイン、見た目、ボイス

### 4.1 alt、バリアント、どのキャラクターか

**好意的な意見**

- US：「★4ヒーローのバリアントが復活したのは、人気のないキャラクター、特に{% chara_link Kirsch %}や{% chara_link Maculata %}のような女性キャラクターにもついにイベントバリアントが来るという、有望な兆し。」
- US：「altをもらうキャラクターは妥当で、バリエーションも十分あるようなので、ログインして様子を見ようという気になる。」
- AR：「キャラクター、その関係性、設定、世界観に注がれた丁寧さが、プレイを続ける主な理由の1つ。」

**否定的な意見／要望**

- **名指しのalt／バリアント要望**（キャラクターごとにまとめ、人数付き）：
  - **{% chara_link Sui %}**（×4：FI ×2、US「Please give Sui an Alt in 2027」、SV）。**{% chara_link Borealis %}**（×2：US、SV）。
  - **{% chara_link Joezen %}**の2つ目のバリアント（US）。**{% chara_link Giansar %}**、**{% chara_link Hydoor %}**の2つ目のバリアント、**{% chara_link Theoreol %}**のバリアント（ID）。
  - **{% chara_link Hydoor|h2 %}**（US ×2）。
  - **{% chara_link Anna %}、{% chara_link Sensettia %}、{% chara_link Maculata %}**（FI）、さらに**{% chara_link Maculata %}と{% chara_link Kirsch %}**（US）。
  - **{% chara_link Crowne %}、{% chara_link Exio %}、{% chara_link Rutilix %}**（SV）。
  - **{% chara_link Obsidius %}**の2つ目のalt、サマーかバレンタイン（US）。
  - **「Mechanic GirlBoss」（{% chara_link Crowne %}）**のalt、初日からのファンが希望（BR）。
  - **{% chara_link Thuban %}と{% chara_link Vergald %}**のリリース（ID）。
  - **{% chara_link Digram %}と{% chara_link Theoreol %}**（JP）。
  - **{% chara_link Vergald %}と{% chara_link Norbrand %}**：もっと出番を（US）。
  - **{% chara_link Hisaki %}**（US）、**{% chara_link Gammei %}**（US）。
  - **Daddy {% chara_link Norbrand %}、{% chara_link Broker %}、{% chara_link Branch %}**：翻訳とストーリー（US）。
  - **{% chara_link Pubraseer %}**の★3と★5のスキルツリー（FI）。
  - **{% chara_link Barrel|h1 %}**の強化（PH）。
  - CN：加强贞义的大包（{% chara_link Sadayoshi %}の膨らみのサイズを増やして）
  - VN：「うちの旦那たちのバリエーションをもっと」（特定なし）。
- **構造的な要望**：まだaltのないキャラクターにalt（SE、BR 初日キャラクター、AR「古いキャラクター、あまり使われないキャラクター、世界観の奥深くにいるキャラクター」にストーリーやバリアントを）。PH（§2.5参照）も、他のキャラクターが2つ目のaltをもらうなかで最初のaltを待つ辛さを述べています。
- **個別のがっかり**：BR「{% chara_link Santetsu|h2 %}はまだがっかり」（デザイン）。「{% chara_link Roiker|h2 %}はイベントでだまされた…技術的には水着スキンがあるけれど、それは彼のaltユニットにしかなく、以前のほとんどのキャラクターはサイドキックにつくのに」（US）。沒有朱交這個遊戲可以等收了（朱交がいないなら、このゲームはもう終わりでいい）（TW、原文のまま、朱交＝Shukou Akanaru）。

### 4.2 表現、ジェンダー、体型

- **女性/男性以外の★5**（×約8）。「もう作ってよ、お願い」（PH、「5★ Female」、「More Anthro Females, Muscular Females」）。「少なくとも1〜2人の★5女性キャラクターを、獣人でも人間でもロボットでもいいから」（US）。「姉妹作のTokyo Afterschool Summonersのように、★5の女の子を追加して」（US）。「男性以外のSSRキャラクター/alt」（PH nb）。PA：火・水・闇以外の属性を持つ女性キャラクターをもっと。SV：「木属性の女性キャラクター」。FI：「ガーリーポップなキャラクターとバリアントをもっと」、Sui、Anna、Sensettia、Maculataを待っています。PH：「女性をもっと（特別惹かれるわけではないけど、デザインはすごく綺麗）」。
- **求められる男性アーキタイプ**：筋肉質な獣人や人間の男性（BO ×2、MY「背が高くて大きくて強くて筋肉質な獣人」）、もっと獣人を（CN stopped 出更多furry（もっとfurryを出して））、「もっとおじさんキャラを」（HK）、スカリー系ユニットをもっと（PH）、父性的で優しいキャラクター（TH「家族を本当に大切にしている人」）、顔が隠れている、ヘルメットやマントのキャラクター（PH）、「エロい見た目の男たち」（BO）、「LAHのようにショタを追加して」（US）と「REMOVE KOUKI REMOVE SHOTA」（US）の対立。
- **エロ／アダルト要素**：TW 有色色（エロ要素がほしい）（「more lewd」）、TW「見た目の良い水着キャラクター」。
- **LGBT+の表現**（AR）：「彼らを特別なものにしているストーリーテリング、キャラクター描写、LGBT+表現を決して失わないで」。US：「最高のLGBTQ+ガチャの1つ」。
- **新しい属性**（×3：SV「Earth, Steel, Wind」、PA「Steel and Earth」）、そして「ロール/属性のバリエーションをもっと」。

### 4.3 衣装、スキン、主人公のカスタマイズ

- **キャラクターの衣装をもっと**（×約6：US、SE「more costumes」、TW 更多外觀服裝樣式（外観・衣装のバリエーションをもっと）、VN、MA「プレイヤー用の衣装をもっと」）。TW：「水着キャラクター…差分を少なくしないで…竹本の極端な差分を見て。」TWは、衣装バリエーションのあるアートには**Live2D（Spine2D）版**も求めています。
- **スキンシステム**（×3）：VNのスキンシステム、**USのプレミアムスキンシステム**（Arknights/R1999のようなVFX/SFXの変更）、ID「スキンをもっと」。
- **ヒーローのアクセサリー**は「ヒーローの横に浮かぶアイテムだけではないものに」（US）。
- **主人公**（×約6）：FIは「オフィス用」にカジュアルな服装と戦闘スプライトを求めています。SV（×2）は**アバターの体型をもっと**（「ウサギ、ハイエナ、ライオン、コヨーテ…男性・女性のウサギのバリエーション…男性的な見た目のネコと女性的な見た目のイヌ」）と、アバターが話すシーンをもっと求めています。MAはイベントで入手できる衣装と、プレイヤー用の新しいユニットか見た目を求めています。FIは主人公のサイドキックスキルの強化（§3.8）。
- TH：ヒーローのアートチェンジ機能に表情変更を。

### 4.4 アニメーション、スプライト、演出

**好意的な意見**

- MY：「{% chara_link Roiker|h2 %}のようなより良いグラフィックと奥義スキルのアニメーション」（さらなる要望として）。
- イベントと戦闘の演出は「より映画的で魅力的」（US、§6参照）。
- ビジュアルの改善が認められています（US、BR「QoLと演出の改善」）。
- アートの品質：「素晴らしいアート」（US）。

**否定的な意見／要望**

- **奥義スキルのアニメーション**（×約5：MY ×2、MA、IT、TH）。IT：「本当にユニークなスキルにはドッカン級のアニメーションを」。MA：奥義は一般的な攻撃ではなく、スキルに関連した動作を見せるべき。待機ポーズ。THは、より速いスキルアニメーションかスキップを求めています。
- **古いスプライトの更新**（×約7：US、BR（Spine）、PH ×2、BA「古いアニメーション…パラレルフライトのメンバー」、PH（stopped）「古いキャラクターのアニメーション」、US「ローンチから1〜2周年まで」）。
- **Live2D（Spine2D）**（ID、「live 2d arts characters」）、**3Dモデル**（PH、stopped）、**ストーリー内のCGアート**（ID）、**コマ送りでの戦闘アニメーション確認**（TH）、「キャラクターの公式アート」（PH、stopped）、「アニメーションPV」（PH）。
- **ラグを減らすためのアニメーション無効化**（US）：§3.7参照。

### 4.5 ボイスと音楽

- **ボイスラインの字幕**（×4：FI「ボイスの字幕」、MY 遊戲內語音分頁要是實裝可閱覽的文字輔助聆聽（ゲーム内のボイスタブに、読めるテキストで聞き取りを補助する機能が実装されたら良い）、BR「ホーム画面ではすべて表示されるわけではないので、ヒーロー/サイドキック閲覧モードでボイスラインを再生するときの字幕」、PH nb「戦闘中やボイス再生ボタンのような、文字のない台詞の翻訳字幕」）。
- **キャラクターをタップしたときの台詞をもっと**（VN：「キャラクターをタップしたときの台詞をもっと増やして」）。
- **この2つの列では、ボイス演技やキャスティングについて直接コメントした回答者はいませんでした。**
- **音楽/OST**（好意的）：「音楽が大好き」（TH）、「イベントとメインストーリーのBGM、戦闘/シネマティクス」（US、好意的。「ここからは上がるだけ」）、「イベントのBGM…ずっと映画的で魅力的」（US）。
- **音楽の要望**：
  - GB：公式サウンドトラックのデジタル配信。
  - PH（詳細なリスト）：作曲家をもっと雇う。曲に「X Battle/Story/Boss Theme」ではなく固有の名前をつける（Housamoはそうしていた）。**サウンドトラックCD**のリリース（汎用のストック音楽を除く）。イラストレーターと同じように、**ゲーム内で作曲家をクレジット**する。ボーカル入りのアニメーションPV（「可能性はとても低い」）。
  - ホームページの音楽のカスタマイズ（CN ×2）。

---

## 5. ストーリー

### 5.1 好意的な意見

- **ストーリーはプレイする核心的な理由**（×約6）：「良いストーリー」（ID）、「ストーリーがすごく良い」（VE）、「音楽、キャラクター、テーマが大好き…ストーリーをもっと知りたくなった」（TH）、「ストーリーは両方のゲームの最高の部分の1つ」（US）、「ストーリーを拡充し続ける努力」（AR）。
- **メインクエストBook 2 第4章は2部構成でリリースされました**：「2部に分けられているのは興味深い。次が楽しみで、{% chara_link Velgard %}と{% chara_link Norbrand %}がもっと見られることを願っている」（US）。
- **イベントのストーリーテリング**：「イベント、ストーリー、バトルがどんどんダイナミックになってきた」（PR）、「ストーリーと戦闘がずっと映画的」（US）、**デートクエストの見せ方が良い**（GB）、TW（「イベントでインタラクティブな要素がもっと増えた」）。
- TW：希望能繼續看到與英雄們的有趣互動日常（ヒーローたちとの楽しいやり取りの日常を、これからも見続けたい）。

### 5.2 否定的な意見／要望

- **イベントストーリーの型が単調**（MY(F)）：「もう意外性がなくなってきている…新/旧キャラクター → 回想 → 希望を失う → 希望を取り戻す → ヒーローに変わる。変えるアイデアは自分にもないけど、何か新しいものを作ってほしい。」
- **区切りが長すぎる**（US）：メインとイベントの両方のストーリーが「あまりにも長すぎる…半分、あるいは3分の1に分割できるはず」。短くしてほしいのではなく、細かく区切ることで、ジェム報酬が増え、戦闘が入り、プレイヤーがより関わっている感覚を持てるようにしてほしいそうです。TASにも同じことを当てはめています。
- **イベントストーリーは、そのイベントのSPキャラクターをもっと引き立てるべき**（TW）。
- **恋愛／デート要素**（×約7）：
  - JP「デートクエスト或いは恋愛要素が欲しい」（放サモのような）。
  - BR「放サモのデートクエストのように、プレイヤーと1人のキャラクターが恋愛的な文脈で時間を過ごす、より長いストーリーライン」。
  - SV「放サモのような恋愛システム」。
  - PA「恋愛システム」。
  - ID「デート活動！！！（推しカプのキャラクターを選んで…あるいは彼らの住居で一緒に寝る！！！）」。
  - PE「関係性クエスト（ストーリー）」。
  - TW 想要可以更多與喜歡角色互動的玩法或關於喜歡角色的內容（好きなキャラクターともっと交流できる遊び方や、好きなキャラクターに関するコンテンツがほしい）も参照。
- **キャラクターの掘り下げ**：JP もっと各キャラクターの性格や背景の掘り下げが多いと嬉しいです。PE「キャラクターのサイドストーリーをもっと」。US(F)は「来年はリンククエストをもっと」を希望。AR「古いキャラクターにもっと機会を」（§4.1）。
- **メインストーリーをもっと**（GB「more main story」、EC「Main story {% chara_link Broker %} history」原文のまま、US(I)「more story」）。
- **ストーリー報酬とサイズ**：上記の区切り分割の提案を参照。
- **文章の質**：MY「良くて誠実なストーリーライティング」（要望）。TW 劇情改進（ストーリーの改善）（詳細なし）。
- **スキップのしやすさ**：MY(F)「毎回の台詞を訳すのに疲れたので、ストーリーの一部はスキップするしかなかった。」
- **ステージ選択での過去イベントの状態**（TH）：「ストーリーのすべてのステップで以前の状態を見られるべき。たとえば[ホワイトアウト・リベレーション](/events/2512Whiteout/)では、ステージ選択シーンの状態が、選んだ状態に応じて変わるべきで、完了済み（クリスマスツリー）のまま固定されるべきではない。」
- **アーケードモードのアイデア**（PH、stopped）：ストーリーをまとめた段落と、より長い戦闘。

---

## 6. イベント

### 6.1 好意的な意見（約25）

- **[ホワイトアウト・リベレーション](/events/2512Whiteout/)と[サマーモンタージュ・ハレーション](/events/2607Montage/)のインタラクティブなマップ**（×約9：BR、CL、FI、GB、US、ID、TW「活動中能互動的玩法變多了（イベントで触れる遊びが増えた）」、AU、CN）。「『ホワイトアウト・リベレーション』は、これまでで最高のイベント表現」（BR）。「マップは…良いアクセント」（FI）。「インタラクティブな『マップ』は…本当に楽しい」（CL）。GB：「ホワイトアウト・リベレーションにあったようなドット絵をもっと見たい」。
- **サマーモンタージュ・ハレーションのおまけ要素**：難易度の異なるボスと、キャラクターの追加コンテンツになるカード（BR、US(F)、GB「イベントの野球カードとデートクエストの見せ方」）。
- **全体的に高まる力の入れ方**（×約8）：「サマーモンタージュ・ハレーションのようなイベントにかけられる労力が増していることに感謝」（US）、「イベントのビジュアルにかけられた労力」（US）、活动的表现形式明显的在变得更多样化和丰富（イベントの表現形式が明らかに多様で豊かになってきている）（CN）、「イベントにいろいろな要素を加えて、より生き生きさせてくれるのが好き。より記憶に残る」（BR）、「Smoke & Mirrors と Whiteout Liberation は、これまでで一番好きなクエストの一部」（MY）、「創造的なイベントミッション選択」（ID）。
- **イベントのゲームプレイ**：「ホワイトアウト・リベレーションでのゲームプレイの扱い方が気に入ったし、サマーモンタージュで追加された機能も、またゲームをやりたくなるほど面白かった。もっと頻繁にやってくれれば、ゲームに戻ってくる」（AU）。SSSクエスト（US）。「Autumn Campaign」がお気に入り（US）。
- **イベントBGMとストーリー**（US）。**イベント中のより頻繁なログインボーナス**（US、§2.1参照）。

### 6.2 否定的な意見／要望

- **ボックス形式のイベント**（×6：MY(F)、RU、JP、TW、GB、それにMYの「★3にした」）。用語：**[Echoes of frontier memories](/events/2604Frontier/) / 殘響**（半周年イベント）。
  - MY：「引く方式のイベントで、『アクセサリー』交換にしても良くはならない…なくなって良かった。エーテルを全部使ったのにAndrewとHuckleが出なかったから★3にした。」
  - RU：「開封イベントは実装がひどかった（通常のショップと同じ報酬なのに、選べず、ボックスのリセットもできない）。開発者はこの種のイベントがどう機能すべきか理解していないようだ。」
  - JP：ボックス仕様のイベントだけ、少し不満でした。他の変更は、全て良いものです。
  - TW：殘響的活動道具兌換方式（殘響のイベントアイテム交換方式）（否定的）。
  - GB：「コンセプト自体は嫌いではないので、今後のイベントボックスは…改善されてほしい。」
- **抽選イベントの面倒さ**（US）：「また抽選イベントをやるなら、もっと面倒でないものに。」TW：希望可以有戳戳樂（戳戳樂（くじ引き式）のイベントがほしい）。
- **頻度**（×約7）。
  - 「1か月まるごとイベントをやっているのは超退屈…ログイン以外にやることがない」（US）。提案：**新イベントと同時の復刻**、**イベントテーマのダンジョン周回**。
  - TW：活動時間通常約1個月，而且瘋狂復刻劇情活動，久久才一次新的，實在太慢（イベント期間は通常約1か月で、しかもストーリーイベントを狂ったように復刻し、新しいものはなかなか来ない。本当に遅すぎる）。
  - 「コンテンツのスケジュールをもっと速く」（SE）、「復刻が多すぎる。新コンテンツは通常2か月に1回だけ」（SE）。
  - 「イベント、通貨、バナー、ストーリーをもっと」（US）、「イベントとアビリティ覚醒をもっと」（US）。
- **イベントの構成とメカニクス**：
  - 「イベントのボス戦に、死ぬまで攻撃するだけではない、もっと多様なメカニクスを。複数ラウンドでパズル/メカニクス（たとえば一定量のVPを使う）があるものが好き」（ID）。
  - 「イベントのマップ背景がもっとユニークだと嬉しい」（ID）。
  - 「モブ中心のイベントを減らして」（US）。
  - 「イベントのオフィス背景とBGMを、復刻後などに何らかの形で恒久化してほしい」（PH）。
  - **イベント称号の「new」バッジ**（TW、§3.5）。
  - 「引く動機が本当にない…イベントの評価が低くなる唯一の理由は、登場するキャラクターに興味がないから」（US、つまりイベント評価はキャラクター次第）。
  - **復刻イベント**には翻訳が必要（§1.2C）。
  - CN：イベントの入口が大きすぎてメインストーリーの入口を隠している（§3.6）。

---

## 7. その他

### 7.1 全体的な印象

- **好意的な意見**（×約12）：「素晴らしい」（VN）、都很好（どれも良い）（TW）、「これまでとても良い変化を遂げてきた」（SV）、「最近の変更でゲーム体験が良くなった」（SV）、「ゲームは良くなってきている」（ID、BO）、「正直、この2つのゲームにはとても愛着がある」（AR）、「Live A Heroが続いているのを見られて嬉しい」（MX）、「良い変更で、新しい方法への良い挑戦。それに、プレイヤーのフィードバックを本当に聞いてくれていて嬉しい」（MY(F)）。「QoLと演出の改善はゆっくりだけど着実に進められた…このペースが続くといい」（BR）。
- **ゲームの方向性への懸念**：CL：「ここ数年、品質が停滞している気がする…まるで、このゲームをHousamoほど人気にするのを諦めたかのよう。」TH：「だからプレイヤーが少ない。」US：「ゲームには良い広告か短いアニメーションが必要」（プロモーション）。
- **プレイヤーが基準にしているもの**：Housamo/TAS（データ、UI、恋愛、ショップ、オートストーリー、報酬、女性★5）、Eidos/龍脈（唯一これより悪いガチャで、完全翻訳あり）、プロジェクトセカイ（通貨）、Arknights、R1999、ZZZ（「このゲームがZenless Zone Zeroに似てくれればと思うが、開発者はmihoyoの予算を持っていない」）、ドッカン（アニメーション）。
- **感情的なコメント**：THは、このゲームのおかげで「もっと大きな夢を見る」ようになり、いつかこのゲームのキャラクターをデザインするのが目標だと述べています。ARはチームに感謝しています。TH：「優しくて父性的なキャラクターに、安心感と心の安らぎを覚える」（§4.2）。

### 7.2 辞めたプレイヤーが書いたこと（約12人）

- **ガチャ/経済**：「もっとずっと良いガチャ排出率、スキップチケット、アライポイントでもっとできること、石の価格引き下げ」（US）、「より良いガチャ、分かりやすいゲームプレイ/強化」（US）、「エーテル晶石をもっと入手する方法と、何らかの天井システム」（MX）、「リセットのサイクルがあるエンドゲーム…ジェムを獲得する方法をもっと」（VN）。
- **アカウント/技術面**：「セーブデータが必要。リンクセーブは嫌い」（TH）、ロードとスキップ不可（TW）、デイリー0/3ミッションの煩わしさ（PL）。
- **コンテンツ**：バリエーション/挑戦、公式アート（PH）、「3Dモデル」と「アーケードモード」（PH）、古いキャラクターのアニメーション（PH）、素材周回と翻訳（VN）、「出更多furry」（CN）（もっとfurryを出して）。

### 7.3 他に当てはまらないもの

- **Housamo固有**（LAHではない）：ストーリーの**AUTOボタン**の要望。

---

## 付録：各テーマの規模（回答者数）

| テーマ | ≈ N | 該当箇所 |
|---|---|---|
| 翻訳（全体） | 95 | §1 |
| うち「もっと速く／もっと多く」 | 60 | §1.2A |
| うち未翻訳のカバレッジの穴 | 25 | §1.2C |
| うち品質／UIへの収まり | 15 | §1.2D |
| ガチャ経済／天井（全体） | 85 | §2 |
| うち無償通貨の増加 | 65 | §2.2 |
| うち天井／スパーク／排出率 | 40 | §2.3 |
| QoL／オート／営業（好意的） | 40 | §3.1 |
| スキルツリー／古いキャラクターの強化 | 25 | §3.8 |
| イベント（全体） | 35 | §6 |
| altと名指しのキャラクター要望 | 20 | §4.1 |
| 表現（女性★5／体型） | 20 | §4.2 |
| エンドゲームと新モード | 20 | §3.10 |
| 恋愛／デート要素 | 7 | §5.2 |
| アカウント／データのバックアップ | 6 | §3.11 |

1人の回答者が複数の行に登場し得るため、カウントは重複しています。

# あとがき

このレポートがゲームについての新たな知見をもたらし、アンケートに答える価値があったと感じてもらえればうれしいです。

このアンケートとレポートの準備には多くの労力がかかりましたが、残念ながら回答者数があまり多くなかったため、結果の代表性は低くなっています。当初は10月末までにこのレポートを公開すると約束していましたが、1週間以上遅れてしまいました。モチベーションの低下、Wikiの他の改善作業、本業での消耗が一因です...

Housamoの周年祝いが数週間前倒しになったため、*あちらのゲーム*の周年までにアンケートを準備する時間さえありませんでした。それでも今年やることにした場合は、アンケートの規模をかなり小さくする必要がありそうです。

アンケートではWikiの利用状況、機能、フィードバックについても質問しましたが、その結果は、このWikiの開発の裏側について話す今後のブログ記事に移すことにしました。

ここまで読んでくださってありがとうございました。また次の機会にお会いしましょう！

<script defer src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<script defer src="/assets/chart.js"></script>
