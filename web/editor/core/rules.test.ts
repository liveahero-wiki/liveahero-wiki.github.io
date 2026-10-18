import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_LINES, batchOf, batchesOf, checkAfter, checkNote, checkSummary, checkText, changedLines, isChanged, isPlaceholder, keyBelongs, normalizeNewlines } from './rules.ts'

describe('checkText (mirror of the server text rules)', () => {
  it('accepts a plain changed text, with line breaks', () => {
    assert.equal(checkText('Here we go!', "Let's go!"), null)
    assert.equal(checkText('two\nlines', ''), null)
    assert.equal(checkText('crlf\r\nbreak', ''), null)
  })
  it('refuses empty, html, template and control characters', () => {
    assert.equal(checkText('   ', 'x'), 'empty')
    assert.equal(checkText('a <b>', ''), 'angle')
    assert.equal(checkText('a > b', ''), 'angle')
    for (const bad of ['{% x %}', '{{ y }}', '{# c #}']) assert.equal(checkText(`hi ${bad}`, ''), 'template', bad)
    assert.equal(checkText('tab\there', ''), 'control')
    assert.equal(checkText('bell\u0007', ''), 'control')
    assert.equal(checkText('c1\u0085x', ''), 'control')
  })
  it('limits the length to 2000 after trimming', () => {
    assert.equal(checkText('a'.repeat(2000), ''), null)
    assert.equal(checkText('a'.repeat(2001), ''), 'tooLong')
    assert.equal(checkText(`  ${'a'.repeat(2000)}  `, ''), null)
  })
  it('refuses a text equal to the base, ignoring surrounding space and line-break style', () => {
    assert.equal(checkText('Same', 'Same'), 'same')
    assert.equal(checkText(' Same\r\nline ', 'Same\nline'), 'same')
    assert.equal(checkText('Other', 'Same'), null)
  })
})

describe('checkNote', () => {
  it('allows blank, plain notes up to 500 characters', () => {
    assert.equal(checkNote(''), null)
    assert.equal(checkNote('  '), null)
    assert.equal(checkNote('Spoken in the boss fight'), null)
    assert.equal(checkNote('a'.repeat(501)), 'tooLong')
    assert.equal(checkNote('<script>'), 'angle')
  })
})

describe('changed lines', () => {
  const line = (key: string, base: string, value: string) => ({ key, base, value })
  it('only lines whose trimmed text differs are changed', () => {
    assert.equal(isChanged(line('k', 'a', 'a')), false)
    assert.equal(isChanged(line('k', 'a', ' a \r\n')), false)
    assert.equal(isChanged(line('k', '', '')), false)
    assert.equal(isChanged(line('k', '', 'new')), true)
    assert.equal(isChanged(line('k', 'a', '')), true)
  })
  it('batchOf sends { key, base, text } for changed lines only, trimmed and normalized', () => {
    const { send, overflow } = batchOf([line('voice_x_a', 'old', 'old'), line('voice_x_b', '', ' new\r\ntext '), line('voice_x_c', 'was', 'now')])
    assert.deepEqual(send, [
      { key: 'voice_x_b', base: '', text: 'new\ntext' },
      { key: 'voice_x_c', base: 'was', text: 'now' },
    ])
    assert.equal(overflow, 0)
  })
  it('sends at most 100 lines and reports the rest', () => {
    const many = Array.from({ length: 130 }, (_, i) => line(`voice_x_${i}`, '', `t${i}`))
    const { send, overflow } = batchOf(many)
    assert.equal(send.length, MAX_LINES)
    assert.equal(overflow, 30)
    assert.equal(send[0]!.key, 'voice_x_0')
    assert.equal(changedLines(many).length, 130)
  })
})

describe('helpers', () => {
  it("'-' is the page's placeholder", () => {
    assert.equal(isPlaceholder('-'), true)
    assert.equal(isPlaceholder(' - '), true)
    assert.equal(isPlaceholder('--'), false)
    assert.equal(isPlaceholder('Hi'), false)
  })
  it('keyBelongs only accepts keys of the table own resource', () => {
    assert.equal(keyBelongs('voice_ryekie_action', 'ryekie'), true)
    assert.equal(keyBelongs('voice_ryekie_', 'ryekie'), false)
    assert.equal(keyBelongs('voice_other_action', 'ryekie'), false)
    assert.equal(keyBelongs('voice_ryekie_a b', 'ryekie'), false)
  })
  it('normalizeNewlines', () => assert.equal(normalizeNewlines('a\r\nb\rc'), 'a\nb\nc'))
})

describe('page edit rules', () => {
  it('summary: 3 to 120 characters, one plain line', () => {
    assert.equal(checkSummary('ab'), 'length')
    assert.equal(checkSummary('  abc  '), null)
    assert.equal(checkSummary('a'.repeat(120)), null)
    assert.equal(checkSummary('a'.repeat(121)), 'length')
    assert.equal(checkSummary('two\nlines'), 'plain')
  })
  it('after: size, NUL and a leading front matter fence', () => {
    assert.equal(checkAfter('## Notes\n'), null)
    assert.equal(checkAfter('a'.repeat(120_000)), null)
    assert.equal(checkAfter('a'.repeat(120_001)), 'tooLong')
    assert.equal(checkAfter('a\u0000b'), 'nul')
    assert.equal(checkAfter('---\ntitle: x\n---\n'), 'fence')
    assert.equal(checkAfter('--- \r\nx'), 'fence')
    assert.equal(checkAfter('----\nx'), null)
    assert.equal(checkAfter('text\n---\nmore'), null)
  })
})

describe('batchesOf (one submission per resource)', () => {
  const l = (resource: string, key: string, base: string, value: string) => ({ resource, key, base, value })
  it('groups changed lines by resource, in order, and caps each group', () => {
    const { groups, overflow } = batchesOf([l('a', 'voice_a_x', '', 'one'), l('b', 'voice_b_x', 'o', 'o'), l('b', 'voice_b_y', '', 'two'), l('a', 'voice_a_y', 'p', ' q ')])
    assert.deepEqual(groups, [
      { resource: 'a', lines: [{ key: 'voice_a_x', base: '', text: 'one' }, { key: 'voice_a_y', base: 'p', text: 'q' }] },
      { resource: 'b', lines: [{ key: 'voice_b_y', base: '', text: 'two' }] },
    ])
    assert.equal(overflow, 0)
    const many = Array.from({ length: 105 }, (_, i) => l('a', `voice_a_${i}`, '', `t${i}`))
    const r = batchesOf(many)
    assert.equal(r.groups[0]!.lines.length, 100)
    assert.equal(r.overflow, 5)
  })
})
