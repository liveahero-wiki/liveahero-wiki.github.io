---
title: Programming Guide
banner: true
---

* Unordered
{:toc}

## Notes for Programmers

This wiki is powered by [Eleventy](https://www.11ty.dev/docs/), a static site generator. The templating language is [Liquid](https://shopify.github.io/liquid/basics/introduction/) with the [additional filters and tags that Jekyll provides](https://jekyllrb.com/docs/liquid/): the site was built with Jekyll before, and a compatibility layer keeps its templates working (`site.data`, `page.title`, `{% raw %}{% include a.html x=y %}{% endraw %}`, kramdown-style markdown). See [`docs/ELEVENTY.md`](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/docs/ELEVENTY.md) for the details.

To preview the site locally, install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/), run `pnpm install`, then `pnpm eleventy:dev` and open the address it prints. `pnpm test` runs the unit tests of the plugins.

- [Jekyll Cheatsheet](https://learn.cloudcannon.com/jekyll-cheat-sheet/). Super useful for the Liquid and markdown syntax

> I swear to god that Jekyll/Liquid's documentation is a lot easier to understand than SemanticWiki's documentation, so please read.

For code change that affects significant parts of the website (excluding trivial bug fixes), please open a new Pull Request instead of directly commiting to the master branch.

For code change related to website design, please include screenshot preview whenever possible.

### Code convention

You can use any modern HTML/CSS/JS features you like. **Bootstrap and JQuery are banned**, other dependencies can be considered.

We do most of the content processing and rendering in Liquid and the JavaScript plugins so that the content is ready as soon as web browser downloads
a page. However, if certain feature is too difficult to implement in Liquid or it is not neccessary to load as soon as possible, it is good to embed some information as [`data-*` attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
in some HTML elements and do more processing in client-side JS. Think: progressive enhancement.

## Random things about Liquid templating

1. To enumerate all objects in a map/dictionary (e.g. `{"a": 1, "b": b}`), do this:

   ```
   {% raw %}{% for pair in obj_map %}
   {{ pair[0] }} is key, {{ pair[1] }} is value
   {% endfor %}{% endraw %}
   ```

1. To access parameters passed to a template, use `include.varname`. Example:

   ```
   # Somewhere in a .md file
   {% raw %}{% include awesome-tmpl.html username="Alex" %}{% endraw %}
   ```

   ```
   # In `_includes/awesome-tmpl.html`
   Username: {% raw %}{{ include.username }}{% endraw %}
   ```

1. Comment syntax in Liquid is `{% raw %}{% comment %}blah blah{% endcomment %}{% endraw %}`.

1. Key of map/dictionary is type sensitive. `{1: "hello", 2: "world"}` uses integer as key. `{"1": "hello", "2": "world"}`
   string as key. Make sure you the key is in correct type when you do `{% raw %}{% assign value = obj_map[key] %}{% endraw %}`.

1. To convert string into integer, use `{% raw %}{% assign x_int = x_str | plus: 0 %}{% endraw %}`.

1. To convert integer into string, use `{% raw %}{% assign x_str = x_int | downcase %}{% endraw %}`.

1. You cannot re-assign to variable used in the for loop enumeration, in another words this is not allowed:

   ```
   {% raw %}{% for flower in flowers %}
   {% assign flower = flower | upcase %} # `flower` still won't be changed
   {% endfor %}{% endraw %}
   ```

   Instead create a new variable:

   ```
   {% raw %}{% for flower in flowers %}
   {% assign f = flower | upcase %}
   {% endfor %}{% endraw %}
   ```

<!--
### Implementation details

#### Hero info

Heroes are registered in the `_charas` directory. Each `.md` is one data record. Each hero will have a page with `_layout/charas.html` template. [Jekyll Collections](https://jekyllrb.com/docs/collections/) is used here. You can access the info through `site.charas` when doing templating, see how it used in `/charas.html` for example.
-->
