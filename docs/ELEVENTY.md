# Live A Hero Wiki — Eleventy Build

The site is built with [Eleventy](https://www.11ty.dev/) (v3). The templates, content and Python generators were written for Jekyll, so a thin compatibility layer in `wiki_plugins/` keeps them working unchanged: the same Liquid syntax, the same `site.data` / `site.<collection>` / `page.<field>` variables, and kramdown-style markdown.

```text
eleventy.config.js        # wires everything together
wiki_plugins/
├── index.js              # collections, redirects, filter registration
├── site.js               # the Jekyll-style `site` object (url, date_format, time, …)
├── sass.js, minify.js    # SCSS compilation and HTML minification
├── lib/                  # framework-free logic, importable from web/ later
│   ├── site-data.js      # _data/** -> site.data
│   ├── documents.js      # `page` and collection documents, flattened like Jekyll's
│   ├── chara.js, item.js, catalog.js, image.js, skill.js, skill-trigger.js   # ported from _plugins/*.rb
│   └── ruby*.js, decimal.js, strftime.js    # Ruby semantics: Time, Float, Integer-vs-String hash keys
├── liquid/               # LiquidJS engine, Jekyll-semantics filters, Liquid adapters for lib/
└── markdown/             # markdown-it configured to behave like kramdown
sitemap.11ty.js           # /sitemap.xml
redirects.11ty.js         # redirect stubs for `redirect_from`
scripts/compare-page.mjs  # compare the output with a Jekyll build
```

## Commands

| Command | |
|---|---|
| `pnpm eleventy:dev` | dev server with live reload (serves `cdn/` in place) |
| `pnpm eleventy:build` | build into `_site/` |
| `pnpm eleventy:strict` | build, failing on any unknown Liquid filter |
| `pnpm test` | unit tests (`node --test`) |

`ELEVENTY_ENV=production` additionally minifies the HTML (the CI does this). `ELEVENTY_COPY_CDN=1` copies the 2 GB `cdn/` checkout into the output.

Generated inputs have to exist before building, as in CI: `_statuses/`, `_data/translation/`, `_data/processed/*_voice.json`, `_data/wiki/SkillUpgradeModel.json` and `api/skill-index*.json` come from the Python tools (see `docs/PYTHON_SCRIPTS.md`). Eleventy ignores `.gitignore`, so these gitignored files are built.

## What templates see

- **`site.data`** is `_data/**` loaded once per build (`lib/site-data.js`), not Eleventy's data cascade — deep-merging 45 MB of data into every page would cost minutes. Folders nest, file names are keys. YAML mappings with integer keys (`Item.yml`, `SkillManualOverride.yml`) are `IntKeyMap`s that, like Ruby hashes, answer a lookup with the number `7` but not with the string `"7"`.
- **`site.charas`, `site.events`, `site.main_quests`, `site.statuses`, `site.posts`** are arrays of documents with the front matter at the top level (`chara.title`, `event.event_start_time`), sorted as `_config.yml` used to sort them. `site.time` is the build time, `site.url`, `site.date_format`, … are in `wiki_plugins/site.js`.
- **`page`** has the front matter at the top level (`page.title`, `page.characterId`) plus `page.url`, `page.path`, `page.date`; Eleventy's own `page.fileSlug` and `page.inputPath` stay available. Dates are in Asia/Tokyo.
- **Front matter timestamps** are `RubyTime`s: `{{ page.event_end_time }}` prints `2026-01-22 20:00:00 +0900`, which `assets/main.js` parses.
- Defaults formerly in `_config.yml` (`layout`, `unreleased`, `additional_scripts`, permalinks) are in the `_charas/_charas.11tydata.js`-style directory data files. `_statuses/_statuses.11tydata.js` is the one exception to the `.gitignore` of that folder.

## Liquid differences that are handled

LiquidJS is not Ruby Liquid. These would silently change the output, so they are emulated (`wiki_plugins/liquid/`, `wiki_plugins/lib/`):

- `{% include a.html x=y %}` with `include.x` (LiquidJS `jekyllInclude`); quoted parameters follow Jekyll's rules (`\"` is the only escape), other tags take strings literally (`'a\nb'` keeps the backslash) — `string-literals.js`.
- `where`, `where_exp`, `group_by`, `group_by_exp` iterate the values of Hashes and compare as strings; `sort` puts items without the key first; `split: " "` is awk-style; `slugify` keeps non-ASCII letters; `date` understands `%R`, Ruby Time offsets and the site timezone; `jsonify` of nothing is `null`; `xml_escape` leaves `'` alone.
- `divided_by` always divides as floating point, and every arithmetic filter on Floats is exact decimal arithmetic (Ruby Liquid goes through BigDecimal), printing `2.0` like Ruby does. Use `| floor` if an integer is wanted.
- `status_description` and friends read `skillEffectJson` from the calling template's context and render Liquid text stored in `_data` (`translation/Status.json`, `wiki/SkillManualOverride.yml`).

## Markdown differences that are handled

`wiki_plugins/markdown/` makes markdown-it produce what kramdown (GFM input, `header_links: true`) produced:

- headings: `<h2 id="quest-details"><a href="#quest-details"></a>Quest Details</h2>` (ids as in kramdown-parser-gfm, `-1`/`-2` for duplicates); `_sass/_main2.scss` draws the `#`.
- `* anything` followed by `{:toc}` is the table of contents (`ul#markdown-toc`); `{:.no_toc}` excludes a heading; `{:name: attrs}` / `{: name}` attribute lists.
- block HTML is raw up to its matching close tag, however many blank lines are inside; `markdown="1"` (also `block`, `span`, `0`) parses an element's content as markdown, even inside a raw block; text after a close tag starts a new block; stray `<` in raw HTML is escaped, as kramdown does.
- smart quotes, `--`, `---`, `...`; `~~x~~` is `<del>`; footnotes and definition lists in kramdown's markup; code spans and fences with rouge's classes (no syntax highlighting).
- tables: `+` in the separator row, tables without a header; lists: a marker line right after an item nests however little it is indented; whether an item gets `<p>` is decided per item, not per list.

## Checking a change against Jekyll

`scripts/compare-page.mjs` compares `_site/` with a Jekyll build, one normalized DOM node per line:

```bash
node scripts/compare-page.mjs faq/ guide/hero/     # single pages
node scripts/compare-page.mjs --all                 # everything, ranked by number of differences
```

The reference is the folder `jekyll-site/` (git-ignored): download the `jekyll-site` artifact of an old CI run into it. `--live` compares single pages with the deployed site instead. Differences that remain on purpose: item tooltips with a quote in the description are now escaped properly (they used to cut the attribute short), the footer credits Eleventy, `emoji` from jemoji is gone, `.MD` event files were renamed `.md` (so the "View source" link changed).
