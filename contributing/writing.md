---
title: Writing Guide
banner: true
---

* Unordered
{:toc}

## Important Markdown syntax

This is a summary of [Basic writing and formatting syntax](https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/basic-writing-and-formatting-syntax)
with more important syntaxes that you must know.

### Headings

```
# Heading 1

## Heading 2

### Heading 3

#### Heading 1
```

Because most pages will already have a default heading 1 for the page title, you should start your article's heading with
heading 2.

> Note: Make sure everything after a heading is separated with a new line

Wrong:

```
# awesome title
my super duper awesome essay I just wrote
```

Correct:

```
# awesome title

my super duper awesome essay I just wrote
```

### Lists

#### Ordered list

```
1. Item 1
1. Item 2
1. Item 3
1. Item 4
```

1. Item 1
1. Item 2
1. Item 3
1. Item 4

> Note: you can just use `1.` for everything. Markdown parser will auto-number the list items.

#### Unordered list

```
- Item 1
- Item 2
- Item 3
- Item 4
```

- Item 1
- Item 2
- Item 3
- Item 4

#### More complex example

```
- Item 1
- Item 2
  1. Item 2.a
  1. Item 2.b
    - Item 2.b.i
    - Item 2.b.ii
  1. Item 2.c
```

- Item 1
- Item 2
  1. Item 2.a
  1. Item 2.b
    - Item 2.b.i
    - Item 2.b.ii
  1. Item 2.c

### Links

Write `[Wikipedia](https://en.wikipedia.org)` to get [Wikipedia](https://en.wikipedia.org).

For LAH Wiki's internal pages, please omit the domain name. For example, write `/charas/akashi/` instead of `https://liveahero-wiki.github.io/charas/akashi/`.

### Images

Write `![game logo](/assets/img/logo.png)` to add this:

![game logo](/assets/img/logo.png)

### Table

```
| Header1 | Header2 | Header3 |
|---------+---------+---------|
| a       | b       | c       |
| d       | e       | f       |
```

| Header1 | Header2 | Header3 |
|---------+---------+---------|
| a       | b       | c       |
| d       | e       | f       |

If you are really lazy, you can choose not to add extra whitespace and `-`.

```
| Header1 | Header2 | Header3 |
|-+-+-|
| a | b | c |
| d | e | f |
```

And if you are really really lazy, just use a [Markdown table generator](https://www.tablesgenerator.com/markdown_tables).

### Collapsible box

```
<details>
<summary>Do not click me</summary>
<p>Put your secret here</p>
</details>
```

<details>
<summary>Do not click me</summary>
<p>Put your secret here</p>
</details>

---

To have it expanded by default, add a ` open` in the <code>&lt;details&gt;</code> tag.

```
<details open>
<summary>I am opened by default anyway</summary>
<p>Put your secret here</p>
</details>
```

<details open>
<summary>I am opened by default anyway</summary>
<p>Put your secret here</p>
</details>

### Table of content

To create a auto-generated table of content like the one at the top of this page, you can write:

```
* unordered list
{:toc}
```

### Footnotes

```
Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.
```

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.

### Definition lists

To add a nice indented definition list, you can write:

```
LifeWonders
: Video game publisher in Japan

Wiki
: A website or database developed collaboratively by a community of users, allowing any user to add and edit content.
```

LifeWonders
: Video game publisher in Japan

Wiki
: A website or database developed collaboratively by a community of users, allowing any user to add and edit content.

## Common Wiki templates

We use templates to do fancy things like adding item and status icons.

- [Item template](/items/)
- [Status template](/statuses)

### Character link templates

Put the character name listed in [Characters page](/charas/) inside `{% raw %}{% chara_link name %}{% endraw %}`.

Example:

```
{% raw %}{% chara_link Akashi %} and {% chara_link Player %} went to
{% chara_link Procy %}'s pub for a drink. They met {% chara_link Polaris Mask %}
there. {% chara_link Kouki & Sirius %}'s performance was playing on the TV
(not that anyone was watching it).

{% chara_link Player %} got so drunk he saw {% chara_link Broker %}
in their dream that night.{% endraw %}
```

{% chara_link Akashi %} and {% chara_link Player %} went to
{% chara_link Procy %}'s pub for a drink. They met {% chara_link Polaris Mask %}
there. {% chara_link Kouki & Sirius %}'s performance was playing on the TV
(not that anyone was watching it).

{% chara_link Player %} got so drunk he saw {% chara_link Broker %}
in their dream that night.
