---
title: コミュニティサーベイ結果2025
date: 2025-10-01 12:00:00 +08
---

<style>
.comment {
  color: blue;
}
</style>

> この記事は非常に長く、いくつかの視覚化が含まれています。一部のインタラクティブなチャートは、画面サイズが小さいとうまく機能しません。
>
> より良い読書体験のために、この記事をより広い画面でお読みください。

* unordered
{:toc}


# まえがき

今年の調査では**596**件の回答を達成しました。これは昨年の調査よりわずかに少ないです。

様々なソーシャルメディアプラットフォームでこの言葉を広めるのを手伝ってくれた方々に感謝します！

ゼロから調査プラットフォーム全体をコーディングしたのはこれが初めてです。

- もはやGoogleフォームに依存しないので、中国のユーザーはVPNを使用せずに調査を見ることができます
- Googleフォームでは利用できない、よりカスタムな質問タイプ（例：キャラクターランキングの質問、質問間の回答のコピー）
- 重複/スパム回答の可能性を検出するためのより多くのデータポイント

調査の日本語翻訳のチェックを手伝ってくれた無理様に感謝します。

## 調査の限界に関する免責事項

今年の回答者の人口統計学的割合は、過去数年間とは大きく異なり、東アジア人の割合が全回答者の半分以上になり、東アジア人以外の回答者の絶対数も減少しました。
これは、「2024年対2025年」の比較の多くが、回答者の根底にあるグループがかなり異なるため、同じ人々のグループの感情の変化を実際には示していないことを意味します。比較は割り引いて考えてください。

Wikiwiki/Zawazawa（日本の匿名掲示板）で調査を公開しようとしたのはこれが初めてです。それは数人の日本人回答者を引き付けましたが、多くの否定的なコメントと低評価も受けました。私はこの調査を5年間実施してきましたが、このような敵意を受けたのは初めてです。日本人が他のグループよりも人気投票を嫌う人々の割合が高いのか、それとも匿名性の仮面の後ろに隠れて結果を恐れることなく意地悪く行動しているだけなのかを判断するのは困難です。

人気投票の結果を見たくない人がいることは理解しています。なぜなら、どんなデータでもいいとこ取りして自分の物語に合うようにねじ曲げるろくでなしがいるかもしれないからです。
だから、はっきりさせておきます。

1.  「他のキャラクターよりも人気のあるキャラクターがいる」という事実は、「LifeWondersの公式投稿/動画へのエンゲージメント数」、「ファンアートの数」など、他の多くの方法で誰もが観察できる事実です。この人気投票がなくても、どんなデータでもいいとこ取りして自分の物語に合うようにねじ曲げる人々は常に存在し、彼らがそうするためのデータはたくさんあります。調査結果がそのような人々の数を増やすべきではありません。
2.  私はこの調査を長年実施してきました。調査結果の公表後、誰もが礼儀正しく行動したとは言えませんが、ほとんどのグループやサーバーにはすでに侮辱やヘイトスピーチを管理するルールがあるため、そのような言説が過度にエスカレートするのを目撃したことはありません。
3.  調査結果を使って他人をいじめる人々については、彼らは他の時にも他のカレン的なことをしていると確信しています。したがって、一般的なオンラインのアドバイスが適用されます。その人があまりにも迷惑である場合は、ブロックして自分の人生を歩み続けてください。

# 回答者のプロフィール

## 回答者のソース

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Discord", "value": 140}, {"name": "X (Twitter)", "value": 91}, {"name": "English wiki / 英語版wiki", "value": 90}, {"name": "巴哈姆特 (Taiwan)", "value": 88}, {"name": "Weibo 微博", "value": 41}, {"name": "Reddit", "value": 38}, {"name": "Tencent QQ", "value": 26}, {"name": "Youtube", "value": 26}, {"name": "BlueSky", "value": 24}, {"name": "other", "value": 11}, {"name": "Facebook", "value": 10}, {"name": "Zawazawa", "value": 8}, {"name": "Bilibili", "value": 3}]}]}'
  title="回答者のソース" %}

回答者の大多数はDiscord（23.49％）を介して調査を見つけました。巴哈姆特（台湾のゲーマーフォーラム）、Twitter / X、および英語のWikiはそれぞれ約15％を占めています。

## 年齢

{% include figure-image.html path="/assets/img/survey-2025/age.jpg"
  title="回答者の年齢" %}

これはモバイルガチャゲームなので、年齢分布が若い側に偏っているのは当然です。

この時点で、最年長の回答者（55歳）は最年少の回答者の祖父になる可能性があります...（15歳）

{% include figure-image.html path="/assets/img/survey-2025/age-other.jpg"
  title="回答者の年齢（最初のグラフは女性回答者のみ、2番目のグラフは日本のみ）" %}

## 性別

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Male / 男性", "value": 529}, {"name": "Female / 女性", "value": 31}, {"name": "Other / 其他 / その他", "value": 22}, {"name": "Non-binary / 非二元性別 / ノンバイナリー", "value": 14}]}]}'
  title="性別" %}

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Cisgender / 順性別 / シスジェンダー", "value": 575}, {"name": "Transgender / 跨性別 / トランスジェンダー", "value": 21}]}]}'
  title="シスジェンダー対トランスジェンダー" %}

回答者の11.24％は非男性（昨年の7.5％から増加）で、3.52％はトランスジェンダーです（昨年より低い）

### 女性/ノンバイナリー/その他の回答者とそれらを見つける場所

{% include figure-image.html path="/assets/img/survey-2025/other-gender-country.jpg"
title="女性/ノンバイナリー/その他の回答者の国" %}

- この調査の女性回答者の多くは日本出身です。

## 国

上位3か国は台湾、中国、日本です

透明性レポート：

- 「クリスマス島」(Christmas Island) 出身の1人が米国のIPアドレスを使用しています
- 「シエラレオネ」(Sierra Leone) 出身の1人がマレーシアのIPアドレスを使用しています
- 「中国」出身の多くの人々が他のさまざまな国のIPアドレスを使用していますが、中国にはグレートファイアウォールがあるため、多くの中国人がVPNを使用しているため、それはある種予想されます。一部はすでに他の国に恒久的に移住している可能性があります

東アジアがゲームにとって最も重要な市場であることは明らかです（文化的に日本に近い）。それに東南アジアと北米が続きます。

<table class="bordered">
  <tr>
    <th>地域</th>
    <th>出身国</th>
    <th>カウント</th>
    <th>パーセンテージ</th>
  </tr>
  <tr>
    <td rowspan="6">東アジア<br>314 (52.68%)</td>
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
    <td rowspan="7">東南アジア<br>110 (18.46%)</td>
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
    <td rowspan="6">北アメリカ<br>88 (14.77%)</td>
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
    <td rowspan="18">ヨーロッパ<br>44 (7.38%)</td>
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
    <td rowspan="7">南アメリカ<br>29 (4.87%)</td>
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
    <td rowspan="3">オセアニア<br>7 (1.17%)</td>
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
    <td rowspan="2">西アジア<br>2 (0.34%)</td>
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
    <td rowspan="2">アフリカ<br>2 (0.34%)</td>
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

このゲームの予想される最大のプレイヤーベースは日本であるにもかかわらず、この調査は依然として同程度の割合の日本人プレイヤーを捉えることができませんでした。

## 日本語能力

{% include apache-chart.html
  options='{"legend": {"data": ["N1", "N2", "N3", "N4", "N5", "Zero knowledge / 完全不会 / 知識ゼロ"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "N1", "value": 106}, {"name": "N2", "value": 13}, {"name": "N3", "value": 15}, {"name": "N4", "value": 35}, {"name": "N5", "value": 93}, {"name": "Zero knowledge / 完全不会 / 知識ゼロ", "value": 334}]}]}'
  title="日本語読解能力" %}

- 回答者の56.04％は日本語をまったく読めません。
- 106人の回答者がN1レベルの読解能力を持っています（17.79％）。日本人を除くと、N1レベルの読解能力を持つ回答者はわずか21人です（3.52％）
- ゲーム内の日本語のストーリーを快適に読むには少なくともN3が必要だと推定していますが、このカテゴリに当てはまるのは回答者の22.48％だけです。

# ゲームについて

## 実際のプレイヤー

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Still playing / 还在玩 / 今もやってる", "value": 516}, {"name": "Has stopped playing / 已弃坑 / 辞めた", "value": 49}, {"name": "Heard of but never play / 听过但没玩过 / やったことない", "value": 31}]}]}'
    title="ライブ・ア・ヒーローをプレイしていますか？" %}

- 回答者の86.58％はまだゲームをプレイしています
- 通常、ゲームをプレイしていない、またはゲームをやめた人は、この調査に時間を費やす可能性が自然に低くなるため、円グラフは、現在もゲームをプレイしている人の声だけを気にしている場合に、この調査の他のデータを読むときに除外したい票数を教えてくれます。

## やめた理由

ゲームをプレイしたが現在はプレイをやめている回答者の理由は次のとおりです。

- 翻訳がない
- 興味/モチベーションを失った
- バトルシステムが複雑すぎる/ゲームの仕組みに慣れていない
- 欲しいキャラクターを引けなかったのでやめた
- （無料の）ガチャ石が少なすぎる
- 退屈/単調な周回、スキップチケットなし、報酬が不十分
- お気に入りのキャラクターをアップグレードした後は何もすることがない
- 電話のストレージが不足している
- 回答者は他のガチャゲームもプレイしており、ライブ・ア・ヒーローを続ける時間がない
- NSFW要素がない

## プラットフォーム

{% include figure-image.html path="/assets/img/survey-2025/lah_survey_venn_chart.svg"
  title="プレイヤーがライブ・ア・ヒーローをプレイするために使用するプラットフォーム" %}

回答者の大多数はAndroidを使用してゲームをプレイしています。かなりの数の人が複数のプラットフォームを使用してゲームをプレイしています。

<span class="comment">日常のプレイには携帯電話を使用し、時々iPadに切り替えて夫を大きな画面で見るプレイヤーがいることを知っています。</span>

## プレイ時間

{% include figure-image.html path="/assets/img/survey-2025/play-lah-time.jpg"
  title="ライブ・ア・ヒーロープレイヤーはどのくらいの期間ゲームをプレイしていますか？" %}

X軸はプレイ日数です（終了日は2024年9月30日に設定）。回答者の半分弱が、ゲームの発売直後にライブ・ア・ヒーローのプレイを開始しました。それ以来、プレイヤーベースは直線的に成長しているようです。

360日ごとに小さな隆起があり、これは記念日が他の時期よりも多くのプレイヤーをもたらすためと考えられます。

「過去720日間」の隆起は非常に急で、これは3周年が起こった時期とほぼ同じです。LifeWondersが公式翻訳に取り組んでいると発表したときに、多くの海外プレイヤーがゲームを試しているのではないかと思います。

## 主人公の構成

{% include apache-chart.html
  options='{"legend": {"data": ["1", "2", "3", "4"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "1", "value": 213}, {"name": "2", "value": 49}, {"name": "3", "value": 234}, {"name": "4", "value": 20}]}]}'
  title="主人公の体型" %}

- おさらい：
  - タイプ1： <img width="64" height="64" src="/cdn/Sprite/icon_player1_s01.png" loading="lazy">
  - タイプ2： <img width="64" height="64" src="/cdn/Sprite/icon_player2_s01.png" loading="lazy">
  - タイプ3： <img width="64" height="64" src="/cdn/Sprite/icon_player3_s01.png" loading="lazy">
  - タイプ4： <img width="64" height="64" src="/cdn/Sprite/icon_player4_s01.png" loading="lazy">

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "1 (Hiroki Goto 後藤ヒロキ)", "value": 229}, {"name": "2 (Iwanaga Yuhei 岩永悠平)", "value": 127}, {"name": "3 (Yu Amano 天野ユウ)", "value": 87}, {"name": "4 (Yui Toita 戸板優衣)", "value": 49}, {"name": "5 (Orie Kimoto 樹元オリエ)", "value": 24}]}]}'
  title="主人公の声" %}

後藤ヒロキ（最初の男性の声）は男性の声市場のほぼ50％を占め、他の2つはそれぞれ約25％です。女性の声では、Yui ToitaがOrie Kimotoよりもわずかに人気があります。

後藤ヒロキと戸板優衣は**ゲームにリストされている順序で**最初の男性/女性の声であるため、多くのユーザーが[デフォルト効果](https://en.wikipedia.org/wiki/Default_effect)のために部分的にそれらを選択していると思います。

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

興味深い点：

- 女性の回答者（シスとトランス）は、ほとんど人間の体型のみを選択します。
- 女性の体型を選択するシス男性の回答者がいます（異性愛者のプレイヤー？！）。
  - LifeWondersがゲーム内で女性の体型を選択したプレイヤーの数だけで女性プレイヤーの数を推定している場合、これらの異性愛者の男性プレイヤーが含まれているため、過大評価することになります

## 課金について

{% include apache-chart.html
  options='{"dataset": [{"source": [["In App Purchase Item", "All time", "Last 12 months only"], ["Regular paid stones\n非特价石头\n通常の有償石", 57, 44], ["Anniversary stone pack\n周年礼包\n周年記念パック", 148, 97], ["Event limited stone pack (large)\n活動限定礼包 （大）/ イベント限定エーテル晶石パック（大）", 153, 128], ["Anniversary Hero selection pack\n周年英雄选定礼包\n周年ヒーロー指名パック", 163, 137], ["10 stones for the 4th sales slot\n第4個营業所需的十石\n4番目の营業枠に有償エーテル晶石10個", 174, 138], ["New year grab bag\n新年福袋", 186, 168], ["Event limited stone pack (small)\n活動限定礼包（小）\nイベント限定エーテル晶石パック（小）", 193, 183], ["Not at all\n无课金\n無課金", 212, 212]]}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {}, "label": {}, "tooltip": {}, "series": [{"type": "bar"}, {"type": "bar"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="アプリ内課金（全期間vs過去12ヶ月のみ）" %}

- 「新年福袋」を購入した回答者の方が「周年ヒーロー指名パック」よりも多いようです。考えられる説明の1つは、回答者がランダムな限定5つ星を手に入れるチャンスを、特定の恒常5つ星を手に入れるチャンスよりも高く評価しているということです。
- 周年記念の石パックの人気が最も大きく減少しました

他の視覚化を理解しやすくするために、ここで**課金レベル**の概念を紹介します。

### 課金レベルの定義

|グレード|説明|
|-|-|
|XL| 通常の有償エーテル石（より高価）を購入した人 |
|L| イベント限定のエーテル石パック（大）を購入した人 |
|M| イベント限定のエーテル石パック（小）を購入した人 |
|S| 周年記念パックおよび/または新年福袋のみを購入した人（つまり、年に1、2回しか課金しない） |
|XS| 4番目の営業枠のために10個の有償石のみを購入した人 |
|Zero| このゲームにお金を払ったことがない |

各課金レベルの基準は、人々が各製品をどれくらいの頻度で購入するかを数えていないため、完全に正確ではありませんが、全体的な傾向を把握するには十分です。

{% include apache-chart.html
  options='{"legend": {"data": ["XL", "L", "M", "S", "XS", "Zero"]}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "XL", "value": 57}, {"name": "L", "value": 106}, {"name": "M", "value": 53}, {"name": "S", "value": 75}, {"name": "XS", "value": 93}, {"name": "Zero", "value": 212}], "color": ["#6c2b6d", "#8f3371", "#b13c6c", "#d14a61", "#e3685c", "#e98d6b"]}]}'
  title="ライブ・ア・ヒーロープレイヤーの何人がゲーム内でお金を払っていますか？" %}

プレイヤーの50％以上が、実際にはライブ・ア・ヒーローで少なくともいくらかのお金を払っています。完全に無課金のプレイヤーは、私が最初に思っていたよりも少ないです。

{% include figure-image.html path="/assets/img/survey-2025/spending-region.jpg"
  title="ライブ・ア・ヒーロープレイヤーの何人がゲーム内でお金を払っていますか？（地域別）" %}

{% include figure-image.html path="/assets/img/survey-2025/spending-east-asia.jpg"
  title="ライブ・ア・ヒーロープレイヤーの何人がゲーム内でお金を払っていますか？（東アジア）" %}

- 東アジアは、ゲーム内でお金を払うライブ・ア・ヒーロープレイヤーの割合が最も高い
- 米国やヨーロッパなどの他の先進国も、課金プレイヤーの割合が高いです。
  - ゲームに公式翻訳があれば、これらの市場からより多くの課金プレイヤーを確実に連れてくるでしょう

{% include figure-image.html path="/assets/img/survey-2025/spending-gender.jpg"
  title="ライブ・ア・ヒーロープレイヤーの何人がゲーム内でお金を払っていますか？（性別別）" %}

女性の回答者の割合は男性の回答者よりもはるかに低いですが、彼女たちは男性の回答者とほぼ同じくらいお金を払っています。

## ゲームプレイスタイル

{% include apache-chart.html
  aspectRatio="1.2"
  options='{"dataset": [{"source": [["gender", "login", "value"], ["Other\n其他\nその他", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 2], ["Other\n其他\nその他", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 10], ["Other\n其他\nその他", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 3], ["Other\n其他\nその他", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 1], ["Other\n其他\nその他", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["Other\n其他\nその他", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Other\n其他\nその他", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 4], ["Non-binary\n非二元性別\nノンバイナリー", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 1], ["Non-binary\n非二元性別\nノンバイナリー", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 4], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 6], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 0], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Non-binary\n非二元性別\nノンバイナリー", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 1], ["Male\n男性", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 113], ["Male\n男性", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 143], ["Male\n男性", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 117], ["Male\n男性", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 29], ["Male\n男性", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 21], ["Male\n男性", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 6], ["Male\n男性", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 26], ["Female\n女性", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 5], ["Female\n女性", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 11], ["Female\n女性", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 5], ["Female\n女性", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 2], ["Female\n女性", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["Female\n女性", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["Female\n女性", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2]]}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Male\n男性"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Female\n女性"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Non-binary\n非二元性別\nノンバイナリー"}}}, {"transform": {"type": "filter", "config": {"dimension": "gender", "value": "Other\n其他\nその他"}}}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {"data": ["Male\n男性", "Female\n女性", "Non-binary\n非二元性別\nノンバイナリー", "Other\n其他\nその他"]}, "label": {}, "tooltip": {}, "series": [{"name": "Male\n男性", "type": "bar", "datasetIndex": 1, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Female\n女性", "type": "bar", "datasetIndex": 2, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Non-binary\n非二元性別\nノンバイナリー", "type": "bar", "datasetIndex": 3, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}, {"name": "Other\n其他\nその他", "type": "bar", "datasetIndex": 4, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="「ライブ・ア・ヒーロープレイヤーがゲームをどのようにプレイするか」対「性別」" %}

{% include apache-chart.html
  aspectRatio="1.2"
  options='{"dataset": [{"source": [["paying", "login", "value"], ["Zero", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 36], ["Zero", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 66], ["Zero", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 60], ["Zero", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 18], ["Zero", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 7], ["Zero", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 4], ["Zero", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 21], ["XS", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 3], ["XS", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 3], ["XS", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 6], ["XS", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 0], ["XS", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 0], ["XS", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 0], ["XS", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 1], ["XL", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 25], ["XL", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 22], ["XL", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 4], ["XL", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 2], ["XL", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["XL", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["XL", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2], ["S", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 14], ["S", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 28], ["S", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 19], ["S", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 3], ["S", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 4], ["S", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 3], ["S", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 4], ["M", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 15], ["M", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 17], ["M", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 13], ["M", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 3], ["M", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 1], ["M", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 1], ["M", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 3], ["L", "Login almost everyday, clear all game content in\nthe most optimised method\n几乎每天登录，会试图以最优化方式通过所有游戏内容\nほぼ毎日ログインし、最も最適化された方法ですべてのゲームコン\nテンツをクリアする", 28], ["L", "Login almost everyday, clear almost all stamina,\nbut does not always able to clear hard game\ncontent\n几乎每天登录，消耗所有AP，但并非能通过所有高难内容\nほぼ毎日ログインし、スタミナはほぼクリアしているが、難しいク\nエストは大体クリアできない", 32], ["L", "Only login once a day, to clear current stamina\nand sales only\n每天登录一次，只消耗AP和营业\nログインは1日1回のみで、現在のスタミナと营業をクリアするの\nみ", 29], ["L", "Only login once a week, try to clear as much\nmissions as possible during that\n每周登录一次，在当天尽可能完成任务\nログインは週に1回だけ、やる時はできるだけ多くのミッションや\nクエストをクリアするようにする。", 6], ["L", "Only login once a day, not using stamina\n每天登录一次，不消耗AP\nログインは1日1回のみ、スタミナは使わない", 9], ["L", "Only login once a week, not using stamina\n每周登录一次，不消耗AP\n週に1度しかログインせず、スタミナを使わない", 0], ["L", "Only login once in a while\n偶尔登录\nたまにしかログインしない", 2]]}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "Zero"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "XS"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "S"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "M"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "L"}}}, {"transform": {"type": "filter", "config": {"dimension": "paying", "value": "XL"}}}], "toolbox": {"show": true, "feature": {"magicType": {"show": true, "type": ["stack"]}}}, "legend": {"data": ["Zero", "XS", "S", "M", "L", "XL"]}, "label": {}, "tooltip": {}, "series": [{"name": "Zero", "type": "bar", "datasetIndex": 1, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#e98d6b"}, {"name": "XS", "type": "bar", "datasetIndex": 2, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#e3685c"}, {"name": "S", "type": "bar", "datasetIndex": 3, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#d14a61"}, {"name": "M", "type": "bar", "datasetIndex": 4, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#b13c6c"}, {"name": "L", "type": "bar", "datasetIndex": 5, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#8f3371"}, {"name": "XL", "type": "bar", "datasetIndex": 6, "encode": {"x": "value", "y": "login"}, "label": {"show": true}, "emphasis": {"focus": "series"}, "stack": "x", "color": "#6c2b6d"}], "yAxis": {"type": "category"}, "xAxis": {}}'
  title="「ライブ・ア・ヒーロープレイヤーがゲームをどのようにプレイするか」対「課金レベル」" %}

- プレイヤーの約75%が1日に少なくとも1回はログインしています。
- プレイヤーの約55%がAPを全て使い切るようにしています。
- 最も熱心にゲームをプレイしている層（最終段階）は、課金ユーザーである可能性も高いです。
- 男性を除くプレイヤーの中では、男性プレイヤーに比べて時々しかプレイしない人がわずかに多いです。
- 女性プレイヤーは他のグループに比べて、ゲームプレイを最大限に最適化する傾向が低いです。

## 高難易度クエスト

{% include figure-image.html path="/assets/img/survey-2025/hdq.jpg"
  title=高難易度クエストのクリア率" %}

{% include figure-image.html path="/assets/img/survey-2025/hdq-gender.jpg"
  title="性別別の高難易度クエストクリア率" %}

- 全体では、回答者の半数が高難易度コンテンツの80%以上をクリアできると報告しています（中央値）。
- データを性別で見てみると、男性回答者のピークが90%～100%の範囲であるのに対し、その他の回答者のピークは70%～80%の範囲にあります。

## ゲーム要素の評価

{% include figure-image.html path="/assets/img/survey-2025/game-score.jpg"
  title="「ライブ・ア・ヒーロー」ゲーム要素のスコア" %}

- 当然のことながら、ほとんどの回答者がキャラクターデザインに最高の評価を与えています。
- 難易度評価は平均スコアが3.55（中央値=4）と最も低かったです。

## 他のゲーム

{% include figure-image.html path="/assets/img/survey-2025/play-other-game.jpg"
  title="ライブ・ア・ヒーロー」プレイヤーがプレイした他のLGBTゲーム" %}

- **Gyee**
    - 全てのゲームの中で、「聞いたことはあるがプレイしたことはない」と「すでにやめた」を合わせた数が最も多いです。
    - 日本の回答者の3分の1以上がこのゲームを聞いたことがありません。
- **Fantastic Boyfriends (F彼)**
    - LifeWondersが開発した唯一の買い切り型ゲームであり、「やめた」は「まだプレイしている」と同じように扱うことができます。
    - 回答者の大半が日本語を理解できず、公式翻訳の見込みもないため、多くの海外回答者が「聞いたことはあるがプレイしたことはない」と答えたのは当然です。
    - 日本の回答者でさえ、3分の1以上が「ゲームを聞いたことはあるがプレイしたことはない」と答えています。
    - <span class="comment">正直なところ、このゲームは非常にしっかりしたストーリー構成で、登場キャラクターが限られているため、各キャラクターが輝く時間が増えています。日本語が理解できるなら、ぜひ試してみてください。</span>
- **Tokyo Afterschool Summoners**
    - 『ライブ・ア・ヒーロー！』プレイヤーの70%近くが、同じくLifeWondersが開発した古いゲームである『東京放課後サモナーズ』をまだプレイしており、23.9%がやめています。
- **Tamacolle**
    - 主にデブ専やショタ好きをターゲットにした男性同性愛者向けのガチャゲームです。
    - 日本国外の回答者で「聞いたことがない」と答えた数が最も多いです。
    - 日本でさえ、プレイヤー数はかなり少ないようです。
- **AnotherEidos of Dragon Vein**
    - 日本の回答者はほぼ全員がこのゲームを知っています。この層の回答者にとっては、「聞いたことはあるが試したことはない」か「現在このゲームにハマっている」のどちらかです。「試してからやめた」日本の回答者は非常に少ないです。
      - このゲームがLifeWondersの収益にとって最大の競合相手であると言っても過言ではないでしょう。
    - 東アジア以外では、このゲームをまだプレイしている回答者の数が2024年からわずかに減少したようです。
- **Crave Saga**
    - このゲームは、同性愛者向け日本製ガチャゲームの中で、現在プレイしている日本人プレイヤー数が（『たまこれ』に次いで）2番目に少ないです。離脱率もかなり高いです。
    - このゲームのパ
- **XXL Woofia**
    - ゲイプレイヤー市場に参入しようとする最新のガチャゲーム。2025年6月に英語、中国語、韓国語で初登場しました。
    - 日本国外では、このゲームをまだプレイしている回答者の数が非常に多く、『東京放課後サモナーズ』に次いで2番目です。
    - しかし日本では、2025年9月上旬に日本語版がリリースされたばかりのため、このゲームを試した回答者の数は非常に少ないです。
      - <span class="comment">日本語版がリリースされる前の数ヶ月間、この無修正R18ゲームを渇望していた日本のゲイプレイヤーたちは、非日本語話者が長年直面してきた問題、つまり言語の壁に直面しました。</span>
      - このゲームはまだ非常に新しいため、来年再び調査して、プレイヤーをどれだけ維持できるかを確認します。

## 無料ガチャ通貨

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Less than other gacha games / 比别的游戏少 / 他のガチャゲームより少ない", "value": 319}, {"name": "About the same / 和别的游戏差不多 / ほぼ同じ", "value": 154}, {"name": "More generous than other gacha games / 比别的游戏大方 / 他のガチャゲームより気前がいい", "value": 38}, {"name": "Don't play other gacha games / 没玩别的扭蛋游戏 / 他のガチャゲームはやらない", "value": 5}]}]}'
  title="無料ガチャ通貨に関する意見" %}

『ライブ・ア・ヒーロー！』プレイヤーの61.82%が、他のガチャゲームよりも無料ガチャの配布が少ない（A）と考えているのに対し、他のガチャゲームよりも気前が良い（B）と考えているのはわずか7.36%でした。

{% include figure-image.html path="/assets/img/survey-2025/gacha-stone-spending.jpg"
  title="「無料ガチャ通貨に関する意見」対「課金レベル」" %}

グループAとグループBの課金額を調べたところ、回答者の課金額と無料ガチャ通貨の十分性に関する意見との間に相関は見られませんでした。

> 「『ライブ・ア・ヒーロー！』が他のガチャゲームより無料ガチャ通貨を多く配布しているか、少なく配布しているか」だけを問うのは、最善の質問ではないかもしれません。
>
> 時には他のガチャゲーム<span class="masked">（例えば『Crave Saga』）</span>がより多くの無料ガチャ通貨を配布することがありますが、同時に月に4つのガチャバナーがあります。すべてのキャラクターが欲しい場合、結局は厳しい状況になります。
>
> また、ガチャゲーム<span class="masked">（『XXL Woofia』）</span>が無料ガチャ通貨を非常に気前よく配布する一方で、キャラクターのスキルを役立たせるためには多くの重複を入手する必要があるケースもあります。
>
> したがって、プレイヤーベースにとって健全であるかどうかを評価するためには、ガチャのメカニズム全体を考慮する必要があります...

## 翻訳

{% include figure-image.html path="/assets/img/survey-2025/translation.jpg"
  title="翻訳予測" %}

再び、公式翻訳なしでゲームの周年を祝い、回答者の35.7%が正しい予測をしたことになります。

この数字は昨年の周年記念（27.2%）よりもはるかに高く、LifeWondersが昨年の周年記念で約束を果たさなかったことで、海外プレイヤーが信頼を失ったことがわかります。

## ストーリーを読むか

{% include apache-chart.html
  options='{"legend": {}, "label": {"formatter": "{b}: {d}%"}, "tooltip": {"formatter": "{b}<br>{c} ({d}%)"}, "series": [{"type": "pie", "data": [{"name": "Yes, I read fan translation when available / 会，如果有粉丝翻译 / はい （ファンの翻訳があれば読みます）", "value": 255}, {"name": "Yes, I read the story in-game (Japanese) / 会，我直接看日文原文 / はい（日本語）", "value": 165}, {"name": "No / 不会 / いいえ", "value": 96}]}]}'
  title="『ライブ・ア・ヒーロー！』のプレイヤーはゲーム内でストーリーを読みますか？" %}

回答者の半数近くがファン翻訳に頼る必要があります。

> 注：中国語コミュニティは、ゲームのさまざまな部分を翻訳するファン翻訳者が多いため、英語コミュニティよりも幸運です。

> 昨年から「はい、機械翻訳とある程度の推測を頼りにゲーム内でストーリーを読んでいます」という選択肢を追加する必要があると言っていましたが、忘れてしまいました...

## イベント評価

{% include figure-image.html path="/assets/img/survey-2025/event.jpg"
  title="イベント評価" %}

{% include figure-image.html path="/assets/img/survey-2025/event-reading.jpg"
  title="イベント評価（日本語読解力別）" %}

- 日本語読解能力がN3以上または同等の回答者は、それ以下の回答者よりもイベントを高く評価する傾向があるようです。
- このパターンの唯一の例外は[「栄光のライジング・ムーン」](/events/2410RisingMoon/)です。これは、海外プレイヤーが{% chara_link Pubraseer|h2 %}の限定バージョンがついに登場したことを喜んでいるためだと推測します。

# キャラクター人気度

<details open markdown="1">
<summary>全体</summary>

{% include figure-image.html path="/assets/img/survey-2025/all-fav-bar.jpg"
  clip=true
  title="すべてのお気に入り 人気ランキング（全世界）" %}

{% include figure-image.html path="/assets/img/survey-2025/top10-bar.jpg"
  clip=true
  title="人気ランキングトップ10（全世界） %}

各カテゴリの「全員がお気に入り」人気ランキングのトップ

<div class="table-scroll">
<table>
  <tr>
    <th>男性（獣人）</th>
    <th>支持率</th>
    <th>男性（人）</th>
    <th>支持率</th>
    <th>女性/その他</th>
    <th>支持率</th>
  </tr>
  <tr>
    <td>{% chara_link Pubraseer %}</td>
    <td>65.4%</td>
    <td>{% chara_link Akashi %}</td>
    <td>41.4%</td>
    <td>{% chara_link Melide %}</td>
    <td>19.5%</td>
  </tr>
  <tr>
    <td>{% chara_link Monomasa %}</td>
    <td>53.5%</td>
    <td>{% chara_link Astar %}</td>
    <td>37.8%</td>
    <td>{% chara_link Sensettia %}</td>
    <td>13.3%</td>
  </tr>
  <tr>
    <td>{% chara_link Giansar %}</td>
    <td>49.5%</td>
    <td>{% chara_link Roudin %}</td>
    <td>31.5%</td>
    <td>{% chara_link Sui %}</td>
    <td>11.6%</td>
  </tr>
  <tr>
    <td>{% chara_link Ryekie %}</td>
    <td>48.5%</td>
    <td>{% chara_link Gammei %}</td>
    <td>31.4%</td>
    <td>{% chara_link Hitomi %}</td>
    <td>10.7%</td>
  </tr>
  <tr>
    <td>{% chara_link Barrel %}</td>
    <td>47.5%</td>
    <td>{% chara_link Lilac %}</td>
    <td>29.9%</td>
    <td>{% chara_link Flamier %}, {% chara_link Zaniah %}</td>
    <td>10.6%</td>
  </tr>
</table>
</div>

> {% chara_link Player %}はすべてのカテゴリに該当するため、この表には含まれていません。

コメント：

- 筋肉質な男性獣人キャラクターが再び人気ランキングを席巻し、{% chara_link Pubraseer %}がトップでした。
- 回答者の半数以上（支持率 > 50%）に好かれているのは{% chara_link Pubraseer %}と{% chara_link Monomasa %}のみです。
  - **支持率**：キャラクターを「全員がお気に入り」に含めた回答者の割合
- 1位と2位の差はかなり大きいです。
- 「男性（獣人）」と「男性（人）」の1位は2024年と全く同じです。{% chara_link Sensettia %}は今年、{% chara_link Melide %}に1位の座を明け渡しました。
  - これは、最近のストーリーで{% chara_link Melide %}が登場する時間の長さと大いに関係があると思われます。
- {% chara_link Denebora %}はこれまでのところ最も期待されている未実装キャラクターです（支持率31.7%）。

{% include figure-image.html path="/assets/img/survey-2025/all-fav-top-10.jpg"
  clip=true
  title="全お気に入り vs トップ10 (2025年)" %}

</details>

<details markdown="1">
<summary>2024 vs 2025</summary>

{% include figure-image.html path="/assets/img/survey-2025/all-fav-2024-2025.jpg"
  clip=true
  title="全お気に入り (2024年 vs 2025年)" %}

{% include figure-image.html path="/assets/img/survey-2025/approval-rating-change.jpg"
  clip=true
  title="支持率の変化 (2024年 vs 2025年)" %}

- 2024年と2025年の調査の間に、バリアントやベースフォームがリリースされたキャラクター（{% chara_link Astar %}、{% chara_link Barte %}、{% chara_link Yohack %}、{% chara_link Gaisei %}など）は、ランキングがかなり上昇したようです。
- {% chara_link Obsidius %}、{% chara_link Sterio %}、{% chara_link Barrel %}は2024年と2025年の調査の間で最も支持率を失いました。
  - 注意：今年の調査は{% chara_link Barrel|h3 %}が発表される前に終了しました。

</details>

<details markdown="1">
<summary>日本 / 台湾 / 中国</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-japan.jpg"
  clip=true
  title="全お気に入り vs トップ10（日本のみ）" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-taiwan.jpg"
  clip=true
  title="全お気に入り vs トップ10（台湾のみ）" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-china.jpg"
  clip=true
  title="全お気に入り vs トップ10（中国のみ）" %}

</details>

<details markdown="1">
<summary>女性 / ノンバイナリー / その他</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-female.jpg"
  clip=true
  title="全お気に入り vs トップ10 （女性の回答者のみ）" %}

{% include figure-image.html path="/assets/img/survey-2025/fav-other.jpg"
  clip=true
  title="全お気に入り vs トップ10 （ノンバイナリー / その他の回答者のみ）" %}

- そもそも男性以外の回答者数が少ないため、票が同数になることが多いです。
- 男性以外の回答者の中では、{% chara_link Tsuneaki %}が{% chara_link Pubraseer %}に代わってトップになりましたが、{% chara_link Pubraseer %}も「トップ10」ランキングではかなり上位にランクインしています。
- LifeWondersは過去のAGFイベントで{% chara_link Gaisei %}と{% chara_link Vlaham %}を宣伝して女性プレイヤーを増やそうとしましたが、実際に女性回答者はこれらのキャラクターに、全体の回答者（それぞれ7.7%と18.0%）よりも高い支持率（それぞれ35.5%と32.3%）を与えています。

</details>

<details markdown="1">
<summary>お気に入りが10キャラ未満の人</summary>

{% include figure-image.html path="/assets/img/survey-2025/fav-less-than-10.jpg"
  clip=true
  title="お気に入り10個未満を選択した回答者" %}

欲情したプレイヤー向けの餌でいっぱいのこのガチャゲームで、心を捧げるキャラクターの数を制限できるこれらの人々に拍手を送りましょう。

{% include figure-image.html path="/assets/img/survey-2025/top10-less-than-10-vs-exactly-10.jpg"
  clip=true
  title="トップ10（10未満を選択した人 vs ちょうど10を選択した人）" %}

</details>

## 順位付け投票システム

調査回答者にお気に入りのキャラクター全員とトップ10のお気に入りキャラクターを選んでもらうだけでなく、トップ10を線形順にランク付けしてもらいました。

このデータを使って、タイドマン方式による順位付け投票を試みることができます。

<details open markdown="1">
<summary>タイドマン方式（ウィキペディアの定義）</summary>

**ランク付けペア法（RP）**、または**タイドマン方式**としても知られるこの方法は、1987年にニコラウス・タイドマンによって初めて提案された、トーナメント形式の順位付け投票システムです。

他のすべての候補者と1対1で比較した場合に、他の候補者よりも好まれる候補者がいる場合、ランク付けペア法はその候補者が勝利することを保証します。したがって、ランク付けペア法はコンドルセ勝者基準に準拠しており、つまり[コンドルセ方式](https://en.wikipedia.org/wiki/Condorcet_method)の一種です。

ランク付けペア法は、総当たり戦から始まります。各候補者のペアについて1対1の勝利差を比較し、過半数に好まれる候補者を見つけます。そのような候補者が存在する場合、その候補者は直ちに当選します。そうでない場合、3人以上の候補者による[コンドルセのパラドックス](https://en.wikipedia.org/wiki/Condorcet_paradox)（A > B > C > Aのようなじゃんけんのようなシーケンス）がある場合、そのサイクルはサイクル内で「最も弱い」選挙、つまり最も引き分けに近い選挙を削除することによって破られます。

出典：[Ranked Pairs (Wikipedia)](https://en.wikipedia.org/wiki/Ranked_pairs)

</details>

### この調査のためにタイドマン方式に加えた主な修正

1.  回答者のトップ10ランキングに含まれるキャラクターの集合を*集合X*（*X<sub>1</sub>, X<sub>2</sub>, X<sub>3</sub>, ...*）、回答者のトップ10ランキングに含まれないキャラクターの集合を*集合Y*（*Y<sub>1</sub>, Y<sub>2</sub>, ...*）とします。
2.  各ペア（*X<sub>i</sub>, Y<sub>j</sub>*）について、回答者は *X<sub>i</sub>* > *Y<sub>j</sub>* とランク付けすると仮定します。
    - これは、私が回答者に**すべてのキャラクター**ではなくトップ10のキャラクターのみをランク付けするように依頼したためです。すべてのキャラクターを線形順にランク付けするように依頼するのは、ほとんどの人にとってあまりにも疲れ、退屈な作業でしょう。

完全な表へのリンクはこちらです。自由にスプレッドシートにインポートしてデータを探索してください：

  - [Global Respondents' Pairwise Rank Matrix](/misc/survey-2025/global_pairwise_ranking.html)
  - [Japan Respondents' Pairwise Rank Matrix](/misc/survey-2025/japan_pairwise_ranking.html)
  - [Taiwan Respondents' Pairwise Rank Matrix](/misc/survey-2025/taiwan_pairwise_ranking.html)
  - [China Respondents' Pairwise Rank Matrix](/misc/survey-2025/china_pairwise_ranking.html)
  - [Female Respondents' Pairwise Rank Matrix](/misc/survey-2025/female_pairwise_ranking.html)

{% include figure-image.html path="/assets/img/survey-2025/ranked_voting_global.svg"
  title="Ranked Voting (global)" %}

> 注意：
>
> {% chara_link Pubraseer %}から{% chara_link Giansar %}へのエッジは、65.47%の確率で{% chara_link Pubraseer %} > {% chara_link Giansar %}であり、34.53%の確率で{% chara_link Giansar %} > {% chara_link Pubraseer %}であることを意味します。
>
> ネットワークグラフには、リンクが最も多い上位10キャラクターのみを表示しています。そうしないと、グラフが大きすぎて視覚化できません。
>
> タイドマン方式は勝利差が弱いリンクを明示的に削除するため、生データには**コンドルセサイクル**が存在する可能性がありますが、上記のネットワークグラフではそれらのリンクを描画していません。

  - {% chara_link Pubraseer %}は他のすべてのキャラクターに対して50%以上の確率で勝利しており、全体ランキングで唯一の**コンドルセ勝者**となっています。
    - つまり、どの**コンドルセ方式**を使用しても、{% chara_link Pubraseer %}は常に勝者として選出されます。
  - （順位データを使用しない）トップ10お気に入りランキングでは{% chara_link Obsidius %}が{% chara_link Akashi %}よりも上位ですが、回答者の優先順位を考慮すると、彼らの順位は入れ替わります。
  - グラフの最長経路を見つけることで、ランキングを作成できます：
    - {% chara_link Pubraseer %} > {% chara_link Monomasa %} > {% chara_link Giansar %} > {% chara_link Barrel %} > {% chara_link Ryekie %} > {% chara_link Akashi %} > {% chara_link Obsidius %} > {% chara_link reXer %} > {% chara_link Sadayoshi %} > {% chara_link Tsuneaki %}
  - {% chara_link Obsidius %} vs {% chara_link Sadayoshi %}は引き分けです。彼らは互いに50%の確率で勝利します。
  - 全体データの上位10キャラクターにはコンドルセサイクルはありません。
    - コンドルセサイクルは通常、サンプルサイズが大きくなるにつれてまれになります。

公正さの定義によっては、タイドマン方式は完全に公正ではないかもしれません。実際、3人以上の候補者がいる投票システムで、人間が望むすべての投票基準を満たすことができるものはありません。なぜなら、いくつかの投票基準は実際には互いに矛盾するからです。したがって、この結果は参考程度に考えてください。しかし、タイドマン方式はより優れた順位付け投票システムの一つと見なされており、戦術的投票戦略によって操作するのがはるかに困難です。

上記の生データを使用して、他の種類の[投票システム](https://en.wikipedia.org/wiki/Comparison_of_electoral_systems)を実装し、いくつかのシステムがより公正である一方で、他のシステムがほとんどの人にとって望ましくない結果につながる可能性があることを確認できます。

### 特定の人口統計におけるランキング

{% include figure-image.html path="/assets/img/survey-2025/ranked_voting_japan.svg"
  title="Ranked Voting (Japan Respondents Only)" %}

{% include figure-image.html path="/assets/img/survey-2025/ranked_voting_taiwan.svg"
  title="Ranked Voting (Taiwan Respondents only)" %}

{% include figure-image.html path="/assets/img/survey-2025/ranked_voting_china.svg"
  title="Ranked Voting (China Respondents only)" %}

- 日本では、{% chara_link Akashi %}が他のすべてのキャラクターに対して50%以上の確率で勝利しており、日本人回答者にとって唯一の**コンドルセ勝者**となっています。
  - つまり、どの**コンドルセ方式**を使用しても、{% chara_link Akashi %}は常に勝者として選出されます。
- 国別の順位付け投票結果は、投票数が少ないため、多くのコンドルセサイクルがあります。
  - 例えば、日本では、{% chara_link Ryekie %}、{% chara_link Pubraseer %}、{% chara_link Lilac %}がコンドルセサイクルを形成しています。
    - | ペア | 勝利差 |
      |-|-|
      | {% chara_link Ryekie %} > {% chara_link Pubraseer %} | 55.17% |
      | {% chara_link Pubraseer %} > {% chara_link Lilac %} | 55.26% |
      | {% chara_link Lilac %} > {% chara_link Ryekie %} | 52.94% |
  - タイドマン方式では、最も勝利差が弱いペア、この場合は最後のペア（52.94%）を削除することでコンドルセサイクルを破る必要があります。したがって、最終的なランキングは {% chara_link Ryekie %} > {% chara_link Pubraseer %} > {% chara_link Lilac %} となります。

{% include figure-image.html path="/assets/img/survey-2025/ranked_voting_female.svg"
  title="Ranked Voting (Female Respondents only)" %}

  - 女性回答者の投票には、単一のコンドルセ勝者はいません。
    - つまり、異なる**コンドルセ方式**では、サイクル内で異なる勝者が選出される可能性があります。
    - タイドマン方式を使用すると、{% chara_link Sadayoshi %}が選出されます（ネットワークグラフに示されているように）。
    - 女性回答者は31人のみですので、この結果はさらに参考程度に考えてください。

## 人間型 vs 獣人型バイアス

私はこの調査を5年間実施してきましたが、擬人化キャラクター（獣人キャラクター）が毎年の人気ランキングでほぼ常にトップに立ってきました。このため、多くの人が「ケモナーが調査を征服した」と考えるようになりました。そこで、この疑問に答えてみましょう：調査は獣人キャラクターだけを好む回答者によって圧倒的に支配されているのでしょうか？

まず、『ライブ・ア・ヒーロー！』のキャラクターを「性別」（男性、女性、その他）と「タイプ」（人間型、獣人型、その他）で分類してみました。表はこちらで確認できます：[こちら](/misc/chara_category/)。

このゲームの男性キャラクターの中で、「人間型」と「獣人型」の比率はほぼ50/50であることがわかります。したがって、『ライブ・ア・ヒーロー！』のキャラクター人気が獣人キャラクターや人間型キャラクターに偏っていない場合、分布は50%を中心とした[正規分布](https://ja.wikipedia.org/wiki/%E6%AD%A3%E8%A6%8F%E5%88%86%E5%B8%83)のようになるはずです。

{% include figure-image.html path="/assets/img/survey-2025/anthro-loving.jpg"
  title="獣人好き度の分布" %}

計算式：

  - 回答者の**獣人好き度** = 「好きな獣人キャラクターの総数」 / 「好きなキャラクターの総数」（パーセンテージに変換）
  - パーセンテージが高いほど、回答者が人間型キャラクターよりも獣人キャラクターを好むことを意味します。
  - 100%は、回答者が獣人キャラクターのみを好むことを意味します。
  - したがって、全体では、回答者の50%がお気に入りのキャラクター全員を数えた場合、獣人好き度が少なくとも62.5%になります。
  - 回答者がお気に入りのキャラクターをトップ10しか選べない場合、この比率はさらに高くなります。

> 注意：
>
> これは、回答者がすべての文脈で獣人キャラクターに偏っていることを100%証明するものではありません。もう一つの可能性として、LifeWondersが魅力的な人間型キャラクターよりも魅力的な獣人キャラクターを作成するのがわずかに得意であるということが考えられます。

{% include figure-image.html path="/assets/img/survey-2025/anthro-loving-japan.jpg"
  title="獣人好き度の分布 (Japan only)" %}

  - 日本の回答者の獣人好き度は全体の回答者よりもわずかに低いですが、トップ10のお気に入りキャラクターのみを数えると獣人好き度が増加するという全体的な傾向に従っています。
  - 0%～5%と95%～100%の範囲に2つのピークがあります（つまり、ほとんど人間型キャラクターしか好きでない人々と、ほとんど獣人キャラクターしか好きでない人々）。一部の日本の回答者はかなり極端な場合があります。

{% include figure-image.html path="/assets/img/survey-2025/anthro-loving-female.jpg"
  title="獣人好き度の分布 (Female respondents)" %}

  - 女性回答者の獣人好き度分布が、「全員がお気に入り」の統計では正規分布に似ていることは非常に興味深いです。
  - しかし、女性回答者がトップ10のお気に入りのみを選ぶことを強制されると、分布は他の性別グループと同様に獣人キャラクターの方にシフトします。

# 自由回答

今年の調査では、AIによる要約がどういうわけか幻覚を起こしすぎると感じたため、結局すべてのコメントを手動で確認することにしました。フォーマットが少し乱雑かもしれませんが、コメントを見逃していないという保証はできません。

<span class="comment">青色の文字は私自身の言葉です</span>。

## プレイヤーが気に入っている点

  - ほとんどのコメントは、キャラクターデザインの良さに関するものです。
    - 魅力的な男性キャラクター、獣人キャラクター、デブキャラクター、ロボット/非人間キャラクターがいる
    - 声優の演技が良い
      - キャラクターをタッチした時やユニットを最大レベルにした時のファンサービスボイス
    - ゲームバトルでの高品質でクールなキャラクターモデルとアニメーション
    - ヒーローというテーマ
    - スーツブレイクシステム
    - 純粋なエロティシズムのために優れたビジュアル言語を犠牲にしないデザイン
  - ゲームプレイ
    - 時間を取らない簡単/カジュアルなゲームプレイ
    - 縦画面表示
    - 何らかのオートプレイ機能がある
    - 5年間運営されているにもかかわらず、ゲームユニットのスキルインフレがそれほど高くない
  - ストーリー
    - 興味深いストーリーと優れた世界観の構築。LifeWondersがストーリーの質を確保するためにどれだけ注意を払っているかが容易にわかる
    - 多くの人が、バックストーリーや他のキャラクターとの交流を通じて、ストーリーがキャラクターの魅力を高めていることを賞賛している
      - キャラクターによって性格は異なるが、結局のところ、ほとんどが主人公に親切である
      - エロティシズムが常に許されるR18ゲームと比較して、ある回答者は、キャラクターたちの慎み深さや、自分たちを見守ってくれた信頼する人物（主人公）の前で、こんな恥知らずな姿を晒していいものかという葛藤が見られる点を気に入っている
      - ある回答者は「このゲームにはNTRがない」と述べている。<span class="comment">その回答者は『アナザーエイドス』に怒っているような気がします</span>
    - 主に「高校生」である『放サモ』と比較して、社会人を中心としたストーリー
    - 「カイブツに食べられたら消滅する」といった、実際にリスクの高いストーリー
    - 主人公がストーリーで無能ではない
    - 全体的なストーリーの結末は決まっているものの、プレイヤーにはストーリーにいくつかのバリエーションを持たせるための「選択肢」が何らかの形で与えられている
    - キャラクター間の交流
    - ある回答者は、『放サモ』よりも示唆的でない『ライブ・ア・ヒーロー！』のストーリーを好む
      - <span class="comment">「改善点」のセクションでは、ストーリーが十分に示唆的でないと不満を言う他の人々を見ることができます</span>
    - BGMが良い
  - ピックアップキャラクターを確実に入手できる天井システムがある
  - ファンアートがたくさんあるゲームフランチャイズ

### 過去12ヶ月のコンテンツに特化したコメント

  - 戦闘中のビジュアルパフォーマンス、ボイス付きの対話、カットシーン、BGMの質が、同ジャンルの他のゲームを超えて大幅に向上した。これにより、ストーリーへの没入感が増している。
  - [未踏域調査](https://www.google.com/search?q=/guide/unexplored/)のシークレットボスにたどり着きやすくなった
    - <span class="comment">本当ですか？私はまだたどり着けていませんが...</span>
  - 回答者から賞賛された新機能
    - 過去の概念/イベントを振り返るための用語集（エクシオのノート）
    - 新キャラクターのゲームスキルを試すためのお試しクエスト
    - ネームカードは良い追加機能
    - <span class="comment">当然のことながら、多くの人々が多大な創造性と工夫を凝らして、自分のネームカードをエロティックに見せている</span>
    - ウィークリーミッション、ただし、まだ非常に渋いと感じる人もいる

## プレイヤーが望む改善点

### 翻訳

調査回答者のほとんどが日本国外のプレイヤーであるため、翻訳の欠如は明らかに最も多く言及されたフィードバックの一つです：

  - ある回答者は文字通りこう言いました：日本は時間厳守を非常に重視するのに、「今しばらくお待ちください」が文字通り1年以上続くのはどういうことか？まるでプレイヤーに嘘をついているようだ
  - ある日本人回答者も、今日に至るまで海外プレイヤー向けの公式翻訳がないことを懸念している
  - 一部のプレイヤーは、スキル説明やゲーム内のバトルガイドを理解できないため、ゲームコンテンツをクリアするのが困難である
  - 一部の海外プレイヤーはゲームのWikiで何とかなるが、行ったり来たりして確認するのは非常に疲れる
  - ゲームのお知らせを理解できないため、新機能がいつ実装されたかさえ知らない人もいる
  - ストーリーと演出の質が向上したことは感じられるが、翻訳がないため、その内容を全く理解できない
  - 同じ分野で競合する他のすべてのガチャゲームがすでに公式翻訳を提供しているのに、このゲームだけがまだ提供していないという事実は、プレイヤーに非常に裏切られたと感じさせる。
  - ある回答者は、LifeWondersが日本以外の地域でゲームを削除し、それがどれだけゲームの収益を急落させるか見てみろと挑発している

### ストーリー

  - 一部の人はストーリーモードのボイスをスキップできることを望んでおり、ボイス付きの対話が自分のペースでストーリーを読むのを妨げると不満を述べている
  - また、主人公に自己投影するプレイヤーもおり、主人公のボイスが没入感を壊すと述べている
    - 主人公のボイスをオン/オフするゲーム設定が良い解決策かもしれない
  - 新しいメインクエストを待つ時間が長すぎる
    - ある回答者は、メインクエストとイベントクエストの頻度をよりバランスよくすべきだと考えている
  - キャラクターの魅力を掘り下げるためにもっと長いイベントクエストストーリーを。イベントのスペシャルクエストは短すぎる
  - 一部の回答者は、『ライブ・ア・ヒーロー！』のストーリーが『東京放課後サモナーズ』に比べてはるかに示唆的でないと不満を述べている
  - デートクエストの実装
  - 「さらに、2年近く更新されていなかったメインストーリーの脚本と演出は、かなり否定的なレビューを受け、賛否両論を巻き起こしました。正直なところ、ゲームの将来の運営が心配です。」
    - <span class="comment">このコメントは日本人回答者によるものです。私はTwitter/Xの日本人プレイヤーは最新のメインクエストにほとんど肯定的だと思っていたので、かなり驚きました（もっとも、私は日本語が理解できませんが）</span>

### イベント

  - プレイヤーがやることがほとんどない、穴埋め的なキャンペーン（周回キャンペーンなど）が多すぎる。海外プレイヤーにとって、「リンククエストキャンペーン」も穴埋めと見なされる。なぜなら、キャンペーンの唯一のコンテンツである日本語のストーリーを理解できないからだ。
  - どのイベントも非常に予測可能な形式である：イベント通貨を集め、イベントショップでアイテムと交換する。これをあまりにも反復的だと感じる人もいる
    - 反復的な周回以外にも、イベント中にゲームをプレイする他の方法が欲しい
  - ストーリーCGの実装を求める要望
  - コンテンツ制作の頻度を上げてほしい
  - 一部の人は、イベントの周回クエストをイベント最終日まで続くようにしてほしいと要望している。
  - 一部の回答者は、基本的なゲーム内バトルメカニクスの説明を超えて、実際に高難易度クエストをどう攻略するかのガイドをLifeWondersに作成してほしいと要望している
  - 一部のプレイヤーはゲームが難しすぎると不満を述べ、他のプレイヤーはもっと挑戦的なクエスト（エンドゲームコンテンツ）をプレイしたいと願っている
  - あるプレイヤーは、多くのステータス効果が倍率やターン数が違うだけで同様の効果を持っていると不満を述べ、LWにそれらを標準化してほしいと望んでいる
    - <span class="comment">LWがこれを変更するとは思えません。これはほとんどのガチャゲームが「ゲーム難易度の調整」と「多様性の追加」のために採用する方法です</span>
  - 周回効率
    - イベント周回に必要な時間を短縮してほしい
    - より多くのスタミナを消費し、より多くの報酬を与える周回クエスト
    - スキップチケットとスタミナ倍消費機能
    - スキル3のアニメーションをスキップ、アニメーション速度の向上
    - より良いオートバトルシステム
    - 無限周回のための自動継続
    - スタミナドリンクを999になるまで消費できるようにしてほしい

### ゲーム機能

  - どのヒーロー/サイドキックが相性が良いかを把握するのが非常に難しい
  - ネームカード
    - ネームカードにもっとカスタマイズ性が欲しい
    - ネームカードの称号が無意味に感じる
  - キャラクターと交流するためのミニゲームを増やしてほしい