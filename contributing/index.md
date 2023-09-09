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

Every page should have a "Edit this page" link on top. It will lead you to the edit page in Github. If you don't have a Github account, you will be prompted to make one.

After that, if you are a new contributor, you may be asked to "fork" the repository, just agree with it. What this means is you will be editing a copied version of the Wiki before it goes through our review process.

You will now see a simple editing interface. Most pages are written in Markdown syntax. Please see our [Writing Guide](/contributing/writing/).

Once you are done, you can click "Propose changes" and follow the instructions to create a "Pull Request". A Wiki collaborator will review your change and accept it.

For existing Wiki collaborator, you can just choose "Commit directly to the `master` branch" and click "Commit changes" to skip the review process.

Please feel free to fix typos and phrasings.

Keep in mind that vandalism is reversible, but the punitive measures you'll face for committing this is not.

When editing articles, please try to write objectively and formally about the topics at hand while using proper English. Avoid writing in the first person, casual figures of speech, spelling and grammatical errors, et cetera unless appropriate for the situation. Information should be accurately and concisely conveyed, and article contributions should reflect this goal.

- [Writing Guide](/contributing/writing/)
- [Programming Guide](/contributing/programming/)

## Instructions on specific tasks

### Translate voice line

Take {% chara_link Ryekie %} for example [source code](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_charas/ryekie.md)

1. To translate the "relation" line, add `RELATION = "<translation>"`
  - New line should be written as `<br>`

```
{% raw %}
{% include voice-table.html resourceName="exio"
...
RELATION = "hello world"
...
%}
{% endraw %}
```

### Translate skill name

Take {% chara_link Exio|h1 %} hero S1 skill for example:

1. Hover your mouse cursor over the skill name, you will see the skill id (an integer)
  - In this example, it is `1035101`
1. Go to [`_data/wiki/SkillNameTranslation.yml``](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/SkillNameTranslation.yml)
1. Add a new skill name translation like `1035101: "<new skill name>"`

### Fix auto-generated skill description

TODO

### Manually override a skill description

When the auto generated version is too long and simplifying by code is nearly impossible, we just override the description with a hand-written one

Take {% chara_link Exio|h1 %} hero S1 skill for example:

1. Hover your mouse cursor over the skill name, you will see the skill id (an integer)
  - In this example, it is `1035101`
1. Go to [`_data/wiki/SkillManualOverride.yml``](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/_data/wiki/SkillManualOverride.yml)
1. Add a new hand-written skill description like `1035101: "<new skill description>"`
  - New line should be written as `<br>`
  - Double quote needs to be written as `\"`
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
