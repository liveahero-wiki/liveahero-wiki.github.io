import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { checkEdit, gitBlobSha, splitFrontMatter } from '../../../wiki_plugins/lib/contrib-guard.js'
import { buildView, pickerLists } from './editor-data.ts'
import { appendSection, charaLinkText, detailsBlock, insertText, itemText, searchBy } from './insert.ts'
import { parseInclude, parseIncludeParams, prepareBody, renderPreview, type Renderers } from './preview.ts'
import { parseSource, rawUrl, toFileEol } from './source.ts'

const allowedIncludes = ['item.html', 'item-icon.html', 'quest-group.html']

describe('toolbar text', () => {
  it('chara_link, with an optional hero/sidekick variant, and names the guard would refuse', () => {
    assert.equal(charaLinkText('Ryekie'), '{% chara_link Ryekie %}')
    assert.equal(charaLinkText('Polaris Mask', 'h1'), '{% chara_link Polaris Mask|h1 %}')
    assert.equal(charaLinkText('Bad|Name'), null)
    assert.equal(charaLinkText(''), null)
  })
  it('item and item-icon includes', () => {
    assert.equal(itemText(10), '{% include item.html id=10 %}')
    assert.equal(itemText(35, true), '{% include item-icon.html id=35 %}')
    assert.equal(itemText(-1), null)
    assert.equal(itemText(1.5), null)
  })
  it('the generated text passes the guard as a free addition', () => {
    for (const add of [charaLinkText('Ryekie', 's1')!, itemText(10)!, itemText(35, true)!, detailsBlock('More', 'Text'), appendSection('Body', 'notes').value]) {
      const r = checkEdit('Body\n', `Body\n\n${add}`, { allowedIncludes })
      assert.deepEqual(r.violations, [], add)
    }
  })
  it('sections go at the end with one blank line and put the cursor after the heading', () => {
    assert.deepEqual(appendSection('Text\n\n\n', 'notes'), { value: 'Text\n\n## Notes\n\n', cursor: 'Text\n\n## Notes\n\n'.length })
    assert.equal(appendSection('', 'usage').value, '## Usage guide\n\n')
    assert.equal(appendSection('x', 'blank').cursor, 'x\n\n## '.length)
  })
  it('details block', () => assert.equal(detailsBlock('A <b> title', 'Text'), '<details>\n<summary>A  b  title</summary>\n\nText\n\n</details>\n'))
  it('insertText and searchBy', () => {
    assert.deepEqual(insertText('abcdef', 2, 4, 'X'), { value: 'abXef', cursor: 3 })
    assert.deepEqual(insertText('abc', 99, 99, 'Z'), { value: 'abcZ', cursor: 4 })
    const list = ['Ryekie', 'Barrel', 'Marie Rye', 'Zed']
    assert.deepEqual(searchBy(list, 'rye', (x) => x), ['Ryekie', 'Marie Rye'])
    assert.deepEqual(searchBy(list, '', (x) => x), [])
  })
})

describe('source handling', () => {
  it('rawUrl encodes each path segment', () => {
    assert.equal(rawUrl('o/r', '_charas/ryekie.md'), 'https://raw.githubusercontent.com/o/r/master/_charas/ryekie.md')
  })
  it('the base sha is the git blob sha of the whole original file (front matter included)', async () => {
    assert.equal(await gitBlobSha('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
    const file = '---\ntitle: X\n---\nBody\n'
    const { frontMatter, body } = splitFrontMatter(file)
    assert.equal(frontMatter + body, file)
    assert.equal(body, 'Body\n')
    assert.notEqual(await gitBlobSha(file), await gitBlobSha(body))
  })
})

describe('guard integration (the same checks the live editor runs)', () => {
  const before = 'Intro {% chara_link Ryekie %}.\n\n{% for x in y %}\n{{ x }}\n{% endfor %}\n\n| a | b |\n|---|---|\n| {% include item.html id=1 %} | z |\n'
  const check = (after: string) => checkEdit(before, after, { allowedIncludes })
  it('accepts plain text edits around templates and free tokens', () => {
    assert.equal(check(before.replace('Intro', 'A longer intro').replace('Ryekie', 'Barrel')).ok, true)
    assert.equal(check(`${before}\n## Notes\n\nSee {% include item.html id=22 %}\n`).ok, true)
  })
  it('names changed protected tokens, unknown includes and new html', () => {
    const changed = check(before.replace('{{ x }}', '{{ y }}'))
    assert.equal(changed.ok, false)
    assert.equal(changed.violations[0]!.code, 'protected-changed')
    assert.match(changed.violations[0]!.message, /\{\{ \}\} expression/)
    assert.equal(check(`${before}\n{% include header.html %}\n`).violations[0]!.code, 'protected-added')
    assert.equal(check(`${before}\n<script>x</script>\n`).violations[0]!.code, 'html-not-allowed')
    assert.equal(check(before.replace('{% endfor %}', '')).violations[0]!.code, 'protected-removed')
  })
})

describe('preview', () => {
  const r: Renderers = {
    chara: (input) => `<a class="chara">${input}</a>`,
    item: (file, p) => `<i class="${file}">${p.id}</i>`,
  }
  it('parses include parameters', () => {
    assert.deepEqual(parseIncludeParams('id=10 rewardType=1 name="Big Item" kind=word'), { id: 10, rewardType: 1, name: 'Big Item', kind: 'word' })
    assert.deepEqual(parseInclude('{% include quest-group.html eventId=3 %}'), { file: 'quest-group.html', params: { eventId: 3 } })
    assert.equal(parseInclude('{% assign x = 1 %}'), null)
  })
  it('renders markdown with the site setup (kramdown heading ids, tables)', () => {
    const html = renderPreview('## Usage guide\n\n| a | b |\n|---|---|\n| 1 | 2 |\n')
    assert.match(html, /<h2 id="usage-guide">/)
    assert.match(html, /<table>/)
  })
  it('real markup for chara_link, item and item-icon through the renderers', () => {
    const html = renderPreview('Hi {% chara_link Ryekie|h1 %} gets {% include item.html id=10 %} and {% include item-icon.html id=35 %}.', r)
    assert.match(html, /<a class="chara">Ryekie\|h1<\/a>/)
    assert.match(html, /<i class="item\.html">10<\/i>/)
    assert.match(html, /<i class="item-icon\.html">35<\/i>/)
    assert.doesNotMatch(html, /LAHPREVIEW/)
  })
  it('every other include and protected token is a labelled chip', () => {
    const html = renderPreview('{% include quest-group.html eventId=3 %}\n\n{% for x in y %}\n\nText {{ x }}\n\n{% endfor %}\n')
    assert.match(html, /\[include quest-group\.html\]/)
    assert.equal((html.match(/\[template\]/g) ?? []).length, 3)
    assert.doesNotMatch(html, /LAHPREVIEW/)
  })
  it('falls back to a chip when a renderer declines, and prints raw blocks and drops comments', () => {
    const html = renderPreview('{% chara_link Nobody %} {% raw %}{{ kept }}{% endraw %}{% comment %}hidden{% endcomment %} end', { chara: () => null })
    assert.match(html, /\[Nobody\]/)
    assert.match(html, /\{\{ kept \}\}/)
    assert.doesNotMatch(html, /hidden/)
    assert.match(html, / end/)
  })
  it('keeps kramdown attributes for the markdown setup and escapes labels', () => {
    const { source } = prepareBody('- a\n- b\n{:toc}\n\n{% include <x>.html %}')
    assert.match(source, /\{:toc\}/)
    const html = renderPreview('{% include "x<y".html %}')
    assert.doesNotMatch(html, /<y/)
  })
})

describe('editor data', () => {
  const raw = {
    version: '1',
    charas: [
      { title: 'Ryekie', url: '/charas/ryekie/', characterId: 5, cards: { h1: 'ryekie', s1: 'ryekie' }, titles: { h2: 'Ryekie Alt' } },
      { title: 'Ghost', url: '/charas/ghost/', unreleased: true, icon: 'ghost' },
      { url: '/x/' },
    ],
    items: { '3': { '10': { name: 'Gold', icon: 'gold', wiki: 1 }, '2': { name: 'Gem', icon: 'gem' } } },
  }
  it('lists characters and plain items (sorted by id) for the pickers', () => {
    const { charas, items } = pickerLists(raw)
    assert.deepEqual(charas.map((c) => c.title), ['Ryekie', 'Ghost'])
    assert.deepEqual(items, [{ id: 2, name: 'Gem' }, { id: 10, name: 'Gold' }])
    assert.deepEqual(pickerLists(null), { charas: [], items: [] })
  })
  it('renders with the real chara_link and lah_item functions', () => {
    const view = buildView(raw)
    const html = renderPreview('{% include item.html id=10 %} {% include item-icon.html id=2 %} {% chara_link Ryekie|h1 %} {% chara_link Ghost %} {% chara_link Nobody %}', view.renderers)
    assert.match(html, /<span class="item tippy" data-content=""><img src="\/cdn\/Sprite\/item_gold\.png"[^>]*> Gold<\/span>/)
    assert.match(html, /<img src="\/cdn\/Sprite\/item_gem\.png"/)
    assert.match(html, /<a href="\/charas\/ryekie\/#h10051"><span class="item"><img src="\/cdn\/Sprite\/icon_ryekie_h01\.png"/)
    assert.match(html, /<a href="\/charas\/ghost\/"><span class="item"><img src="\/assets\/img\/unreleased\/ghost\.png"/)
    assert.match(html, /Nobody/)
    assert.doesNotMatch(html, /\[Nobody\]/) // like the build: an unknown name prints as plain text
  })
  it('an unknown item id stays a chip, and unusable data falls back to chips', () => {
    assert.match(renderPreview('{% include item.html id=999 %}', buildView(raw).renderers), /\[include item\.html\]/)
    const broken = buildView({ charas: [{ title: 'A', url: '/a/' }] })
    assert.match(renderPreview('{% chara_link A %}', broken.renderers), /A/)
  })
})

describe('source files', () => {
  it('parseSource keeps the original blob sha, the body without front matter, and the line-break style', async () => {
    const lf = await parseSource('---\ntitle: X\n---\nBody\nline\n')
    assert.equal(lf.before, 'Body\nline\n')
    assert.equal(lf.crlf, false)
    assert.equal(lf.baseSha, await gitBlobSha('---\ntitle: X\n---\nBody\nline\n'))
    const crlf = await parseSource('---\r\ntitle: X\r\n---\r\nBody\r\nline\r\n')
    assert.equal(crlf.before, 'Body\nline\n')
    assert.equal(crlf.crlf, true)
    assert.equal(toFileEol(crlf.before, crlf.crlf), 'Body\r\nline\r\n')
    assert.equal(toFileEol('a\nb', false), 'a\nb')
  })
  it('a file without front matter is all body', async () => {
    const s = await parseSource('just text\n')
    assert.equal(s.before, 'just text\n')
  })
})
