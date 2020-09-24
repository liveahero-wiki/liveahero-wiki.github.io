---
title: Contributing Guide
banner: true
---

1. The generated Toc will be an ordered list
{:toc}

## Foreword

Welcome to the fan-made Live A Hero Wiki! It is still work in progress, so thanks for considering to contribute
this project.

The owner of this wiki is currently focusing on laying out the fundamentals of this websites and writing contributing guides
so that more people can start contributing (we need content writers!). Design is less of a priority now, we promise we will
get back to the website design later when we have enough active contributors.

## How to contribute

For all potential wiki contributors, you must create a Github account beforehand (free plan is enough).
If this is hosted with MediaWiki, we would have ask you to create wiki account as well, so please don't
be discouraged by the need to create a new account.

### Edit a page

Every page should have a "Edit this page" link on top. It will lead you to the edit page in Github. The interface
should be pretty intuitive to use.

Most pages are written in Markdown syntax. Please see [Basic writing and formatting syntax](https://docs.github.com/en/github/writing-on-github/basic-writing-and-formatting-syntax)

- [Additional features from Kramdown](https://kramdown.gettalong.org/converter/html.html)

Please feel free to fix typos and phrasings.

Keep in mind that vandalism is reversible, but the punitive measures you'll face for committing this is not.

When editing articles, please try to write objectively and formally about the topics at hand while using proper English. Avoid writing in the first person, casual figures of speech, spelling and grammatical errors, et cetera unless appropriate for the situation. Information should be accurately and concisely conveyed, and article contributions should reflect this goal.

### Upload image

You can upload image file by going to [this page](https://github.com/liveahero-wiki/liveahero-wiki.github.io/upload/master/assets/img).

## Task Coordination

If you plan to contribute something big, such as starting a new group of pages, changing design of the websites and adding new feature, please create a new issue in our [Github issue](https://github.com/liveahero-wiki/liveahero-wiki.github.io/issues) page before beginning your work.

## More instructions on specific task

### Create page for new Hero `/heroes/:name/`

1. Under `_heroes/` directory, [create a new `name.md` file](https://github.com/liveahero-wiki/liveahero-wiki.github.io/new/master/_heroes).  See [Hero file name convention](#hero-file-name-convention).
2. Copy the content of [akashi's page](https://raw.githubusercontent.com/liveahero-wiki/liveahero-wiki.github.io/master/_heroes/akashi.md) into this file and edit accordingly.

#### Hero file name convention

- `name` should be lowercase of English name in official trailer.
- For single-word English name like `Akashi`, file name will be `akashi.md`
- For multi-word English name like `Polaris Mask`, replace whitespace with underscore (`_`), so it becomes `polaris_mask.md`.
- For name with `&` like `Kouki & Sirius`, replace `&` with `and`, so it becomes `kouki_and_sirius.md`.

## Notes for Programmers

This wiki is powered by [Jekyll](https://jekyllrb.com/docs/), a static site generator. The templating language is [Liquid](https://shopify.github.io/liquid/basics/introduction/), which looks very similar to Jinja2 and ejs templating language. Jekyll has provided [additional Liquid filters and tags](https://jekyllrb.com/docs/liquid/) to make life easier.

- [Testing your GitHub Pages site locally with Jekyll](https://docs.github.com/en/github/working-with-github-pages/testing-your-github-pages-site-locally-with-jekyll)

For code change that affects significant parts of the website (excluding trivial bug fixes), please open a new Pull Request instead of directly commiting to the master branch.

For code change related to website design, please include screenshot preview whenever possible.
