---
title: Contributing Guide
banner: true
---

* unordered list
{:toc}

## Foreword

Welcome to the fan-made Live A Hero Wiki! Basically all the contributors (which are like 2~3 people so far) discuss issues in `#lah-wiki` channel of [LAH Discord (Herocord)](https://discord.gg/zpc7PCk). Feel free to report bugs there.

## Create account for wiki edit

For all potential wiki contributors, you need to [sign up for a free Github account](https://github.com/join), which is the website where this wiki is hosted.

### Edit a page

Every page should have a "View source" link on top. It will lead you to the edit page in Github. If you don't have a Github account, you will be prompted to make one.

After that, if you are a new contributor, you may be asked to "fork" the repository, just agree with it. What this means is you will be editing a copied version of the Wiki before it goes through our review process.

You will now see a simple editing interface. Most pages are written in Markdown syntax. Please see our [Writing Guide](/contributing/writing/).

Once you are done, you can click "Propose changes" and follow the instructions to create a "Pull Request". A Wiki collaborator will review your change and accept it.

For existing Wiki collaborator, you can just choose "Commit directly to the `master` branch" and click "Commit changes" to skip the review process.

Please feel free to fix typos and phrasings.

Keep in mind that vandalism is reversible, but the punitive measures you'll face for committing this is not.

When editing articles, please try to write objectively and formally about the topics at hand while using proper English. Avoid writing in the first person, casual figures of speech, spelling and grammatical errors, et cetera unless appropriate for the situation. Information should be accurately and concisely conveyed, and article contributions should reflect this goal.

- [Writing Guide](/contributing/writing/)
- [Programming Guide](/contributing/programming/)

## Contributor editing

Pages that have an **Edit** button on top (the pencil, next to the GitHub link) can be edited in the browser without a GitHub account. Your change becomes a pull request that a collaborator reviews. A check named `contrib-guard` makes sure such a change only touches the text of the page; this section lists what it allows. Anything it does not allow can still be changed on GitHub (**Edit on GitHub**), where a collaborator reviews it as usual.

### Which pages

Only the body of existing pages: `_charas/*.md`, `_events/*.md`, `_main_quests/*.md`, `guide/*.md`, `chara_quests.md` and `mobs.md`. The front matter (the block between the `---` lines at the top) is never shown and cannot change. New or deleted files, layouts, includes, data and scripts need GitHub.

### Templates

Pages contain Liquid templates: `{% raw %}{% ... %}{% endraw %}`, `{% raw %}{{ ... }}{% endraw %}` and kramdown attributes such as `{% raw %}{:toc}{% endraw %}`. You can add, edit and remove two kinds of them:

- `{% raw %}{% chara_link Name %}{% endraw %}` and `{% raw %}{% chara_link Name|h1 %}{% endraw %}` (`h` or `s` and a number picks the hero or sidekick variant).
- `{% raw %}{% include item.html id=11 %}{% endraw %}` and the other allowed includes, with **plain parameters only**: numbers, `true`/`false`/`nil` or quoted text such as `name="Ether Crystal"`. No variables (`page.id`), no filters (`| upcase`), and no `"`, `'`, `<`, `>`, `{`, `}`, `|`, `;` inside the quoted text. The parameters `style` and `on...` are not allowed.

Every other template is **protected**: the editor compares your text with the old page and rejects the change when a protected template was added, removed, changed or moved. You can freely edit the text around a `{% raw %}{% for %}{% endraw %}` loop or a `{% raw %}{{ ... }}{% endraw %}`, just not the template itself. The message names the template, for example "this `{% raw %}{% for %}{% endraw %}` tag was changed". Line endings do not matter.

The includes you can use are listed in [`/api/contrib-includes.json`](/api/contrib-includes.json): every file in `_includes/` except page chrome and page structure (`header`, `footer`, `banner`, `pagefind-search`, `skill-lang-picker`, `wiki-msg`, `js/` and `style/`, `voice-table`, `bio-infobox`, `hero-infobox*`, `sidekick-infobox`, `hero-skill-evolution-v2`, `card-*`, `chara-*`, `team-creator-link` and the generated `quest-infobox`, `skill-description`, `skill-table-v2`). The list lives in `wiki_plugins/lib/contrib-guard.js` (`INCLUDE_DENYLIST`). An existing call of a denied include, or of an allowed one with variables, stays in the page as it is; it just cannot be edited.

### HTML

Existing HTML can stay or be deleted, and the text inside it is editable. You can add:

- `<details>` (the only attribute is `open`) with `<summary>`, and `<br>`;
- tables: `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`, `<colgroup>`, `<col>`, with no attributes except `colspan`, `rowspan` (numbers) and `align` (`left`, `right`, `center`).

Everything else is rejected when it is new: other tags (`<div>`, `<img>`, `<a>`, `<svg>`, `<script>`, `<iframe>`...), `style=`, `on...=` handlers, `javascript:` and HTML comments. Use Markdown for links, images and code. Changing the attributes of an existing tag counts as adding a new tag. `<https://...>` links are fine.

## Instructions on specific tasks

### Translate voice lines and bios

Voice line and bio translations are kept in the [LAH Translation sheet](https://docs.google.com/spreadsheets/d/1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I/edit), which is the source of truth. A character page does **not** contain any translation text, it only names the voice table:

```
{% raw %}{% include voice-table.html resourceName="ryekie" %}{% endraw %}
```

The table is filled from the game's own data and from the sheet (older pages had `RELATION = "..."` style parameters in this include; they were never shown and have been removed).

- **Game text always wins.** A community translation is shown only while the game has no English text for the line (missing, or the same as the Japanese text). As soon as the game ships its own English text, the game's version is used and the sheet text is ignored.
- **Suggest translations (no Github account needed).** A voice table that still has lines to translate has a "Suggest translations" button, and a bio that is not translated yet has a "Suggest an English translation" link. Sign in, write your translations and submit. A moderator reviews them; approved translations are copied into the sheet automatically and appear on the wiki with the next site build. The sheet's `source` column records who suggested a line.
- **Translators with access to the sheet** edit it directly:
  - tab `Voice`: one row per line, keyed `voice_<resourceName>_<part>`. Write the English text into `enApproved` (`enMachineTranslated` is only a hint and is not shown). A new line is written as `<br>`.
  - tab `Bio`: one row per bio that the game has not translated yet, keyed by the game's bio key (like `DETAIL_CEPH_H01`). Write the English text into `enApproved`; blank lines separate paragraphs. The tab is shown as "EN (community translation)" next to the bio.
  - Keep HTML tags closed: the site build checks every text and fails on a broken tag.
  - Please contact @rongjie in `#lah-wiki` to get access permission to the sheet.

| Part names | Notes |
|-|-|
| h_gachaResult, s_gachaResult | Gacha summon lines |
| appreciation, daily, eventA, eventB, eventC, eventD, hero, hero2, player, player2, relation, touch, touch2, train, trained | Only some characters may have eventC, eventD, hero2 and player2. A line the game has already translated is not editable here |
| battleStart, action, attack, skillA, skillB, special, smallDamage, bigDamage, win, lose, assist, assisted, loveIndexMax, rankMax, salesStart, salesEnd | These lines only exist in the sheet; the game has no Japanese text for them. Every such line the game's voice list (`VoiceMaster`) knows is offered, also when nobody has transcribed it yet: "Suggest translations" then shows a Japanese box next to the English one, and you can send the Japanese you hear, the English, or both. |

### Translate sales report

1. Copy original text from [`_data/processed/jp_sales_report.json`](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/processed/jp_sales_report.json)
   to [`_data/wiki/SalesReport.json`](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/SalesReport.json)
1. Change all `{Number}` to `<code>characterNumber</code>` (e.g. `{0}` to `<code>character0</code>`). For english text, there should be whitespace before and after the `<code>` syntax.

### Update illustrator/voice actor/affiliation/item info

- Illustrator info: [_data/wiki/Illustrator.yml](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/Illustrator.yml)
- Voice actor info: [_data/wiki/VoiceActor.yml](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/VoiceActor.yml)
- Affiliation: [_data/wiki/Affiliation.yml](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/Affiliation.yml)
  - Follow official translation of Agency in [LifeWonders Shop](https://lifewonders-shop.jp/en/collections/live-a-hero)
- Item: [_data/wiki/Item.yml](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/Item.yml)
  - Item id can be found in [Item list](/items/) page.
 
### Skill, Skill Effect, Status Translation

- Currently translation work are done on Google Sheet: [LAH Translation sheet](https://docs.google.com/spreadsheets/d/1PVTqJxN2-VF1TwSdlisrrLgW1vWlRKJSmv1cpCBaY-I/edit). Google Account is required.
- Please contact @rongjie in `#lah-wiki` to get access permission and coordinate works.
- You are welcomed to report bug related to skill info in `#lah-wiki`:
  - Please post the skill menu screenshot with expanded status details.
- A skill description comes from the sheet when it has been translated there, otherwise from the game's own
  English text (and from its Chinese and Japanese text for readers of those languages).
  Status names in the text are linked to their tooltips automatically; there is no need to wrap them in
  `<wiki-status>` any more (an existing tag is still understood).

<!--### Translate skill name

Take {% chara_link Exio|h1 %} hero S1 skill for example:

1. Hover your mouse cursor over the skill name, you will see the skill id (an integer)
  - In this example, it is `1035101`
1. Go to [`_data/wiki/SkillNameTranslation.yml``](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/SkillNameTranslation.yml)
1. Add a new skill name translation like `1035101: "<new skill name>"`

### Fix auto-generated skill description

TODO

-->
<!--

### Create page for new Hero `/charas/:name/`

1. Under `_charas/` directory, [create a new `name.md` file](https://github.com/liveahero-wiki/liveahero-wiki.github.io/new/master/_charas).  See [Hero file name convention](#hero-file-name-convention).
2. Copy the content of [akashi's page](https://raw.githubusercontent.com/liveahero-wiki/liveahero-wiki.github.io/master/_charas/akashi.md) into this file and edit accordingly.

#### Hero file name convention

- `name` should be lowercase of English name in official trailer.
- For single-word English name like `Akashi`, file name will be `akashi.md`
- For multi-word English name like `Polaris Mask`, replace whitespace with underscore (`_`), so it becomes `polaris_mask.md`.
- For name with `&` like `Kouki & Sirius`, replace `&` with `and`, so it becomes `kouki_and_sirius.md`.
-->
