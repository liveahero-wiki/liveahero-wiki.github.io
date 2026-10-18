// Port of the relevant cases of wiki-cms/src/types/lah-{voice,bio}-tl/validate.test.ts (vitest) to node:test,
// plus the page-edit rules. The client validators must agree with the server's.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { errorsFor, isBlobSha, isEditablePath, startsWithFence, validateBio, validatePageEdit, validateVoice } from './validate.ts'
import { textProblem } from './text-rules.ts'

const codes = (errs: { path: string; code: string }[]) => errs.map((e) => `${e.path}:${e.code}`)

const line = (part: string, over: Record<string, unknown> = {}) => ({ key: `voice_ryekie_${part}`, base: "Let's go!", text: 'Here we go!', ...over })
const voice = (over: Record<string, unknown> = {}) => ({ resourceName: 'ryekie', lines: [line('action')], ...over })

describe('validateVoice jp transcription', () => {
  it('makes the translation optional; a blank jp counts as absent', () => {
    assert.deepEqual(validateVoice(voice({ lines: [line('action', { base: '', text: '', jp: '行くぞ' })] })), [])
    assert.deepEqual(validateVoice(voice({ lines: [line('action', { text: undefined, jp: '行くぞ' })] })), [])
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('action', { text: ' ', jp: '  ' })] }))), ['payload.lines.0.text:text_required'])
    assert.deepEqual(validateVoice(voice({ lines: [line('action', { jp: ' ' })] })), [])
  })
  it('is plain text of at most 2000 characters', () => {
    for (const t of ['<b>', '{{ x }}', 'nul\u0000', 5]) {
      assert.deepEqual(codes(validateVoice(voice({ lines: [line('action', { jp: t })] }))), ['payload.lines.0.jp:text_invalid'], String(t))
    }
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('action', { jp: 'あ'.repeat(2001) })] }))), ['payload.lines.0.jp:text_too_long'])
  })
})

describe('validateVoice', () => {
  it('accepts a valid payload (and a note)', () => {
    assert.deepEqual(validateVoice(voice()), [])
    assert.deepEqual(validateVoice(voice({ note: 'thanks' })), [])
  })
  it('rejects non-objects', () => {
    for (const bad of [null, undefined, 'x', 1, [], [voice()]]) assert.deepEqual(codes(validateVoice(bad)), ['payload:payload_invalid'])
  })
  it('checks the resource name', () => {
    for (const bad of ['', 'a-b', 'a b', 'ry/ekie', 5, null, 'x'.repeat(101)]) {
      assert.ok(codes(validateVoice(voice({ resourceName: bad }))).includes('payload.resourceName:resource_invalid'), String(bad))
    }
    assert.deepEqual(validateVoice(voice({ resourceName: 'Ry_ekie2', lines: [line('x', { key: 'voice_Ry_ekie2_x' })] })), [])
  })
  it('needs 1..100 lines', () => {
    assert.deepEqual(codes(validateVoice(voice({ lines: [] }))), ['payload.lines:lines_length'])
    assert.deepEqual(codes(validateVoice(voice({ lines: 'x' }))), ['payload.lines:lines_length'])
    const many = (n: number) => Array.from({ length: n }, (_, i) => line(`p${i}`))
    assert.deepEqual(validateVoice(voice({ lines: many(100) })), [])
    assert.deepEqual(codes(validateVoice(voice({ lines: many(101) }))), ['payload.lines:lines_length'])
  })
  it('keys must be voice_<resourceName>_<part> of the same resource and unique', () => {
    const bad = [{ key: 'voice_other_action' }, { key: 'voice_ryekie_' }, { key: 'ryekie_action' }, { key: 'voice_ryekie_a-b' }, { key: 5 }, { key: undefined }, { key: 'voice_ryekiex_a' }]
    for (const b of bad) assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', b)] }))), ['payload.lines.0.key:key_invalid'], JSON.stringify(b))
    const dup = validateVoice(voice({ lines: [line('a'), line('b'), line('a', { text: 'Other' })] }))
    assert.deepEqual(codes(dup), ['payload.lines.2.key:key_duplicate'])
  })
  it('malformed lines get a path', () => {
    assert.deepEqual(codes(validateVoice(voice({ lines: ['x'] }))), ['payload.lines.0:payload_invalid'])
  })
  it('text: required, at most 2000 characters, plain', () => {
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('a'), line('b', { text: '  \n ' })] }))), ['payload.lines.1.text:text_required'])
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { text: 5 })] }))), ['payload.lines.0.text:text_required'])
    assert.deepEqual(validateVoice(voice({ lines: [line('a', { text: 'x'.repeat(2000) })] })), [])
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { text: 'x'.repeat(2001) })] }))), ['payload.lines.0.text:text_too_long'])
    for (const t of ['<b>hi</b>', 'a > b', '{% if %}', '{{ x }}', '{# c #}', 'tab\there', 'nul\u0000', 'esc\u001b[0m', 'del\u007f', 'c1\u0085x']) {
      assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { text: t })] }))), ['payload.lines.0.text:text_invalid'], JSON.stringify(t))
    }
    assert.deepEqual(validateVoice(voice({ lines: [line('a', { text: 'Line one\nLine two { braces } 100% "quotes" 日本語' })] })), [])
  })
  it('base: a string up to 2000 characters, may be empty', () => {
    assert.deepEqual(validateVoice(voice({ lines: [line('a', { base: '' })] })), [])
    assert.deepEqual(validateVoice(voice({ lines: [line('a', { base: 'h<br>i {{x}}' })] })), []) // data from the sheet, not user text
    for (const b of [undefined, 5, null, 'x'.repeat(2001)]) assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { base: b })] }))), ['payload.lines.0.base:base_invalid'])
  })
  it('text must differ from base (ignoring surrounding space and CRLF)', () => {
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { base: 'Same', text: ' Same ' })] }))), ['payload.lines.0.text:text_same_as_base'])
    assert.deepEqual(codes(validateVoice(voice({ lines: [line('a', { base: 'A\r\nB', text: 'A\nB' })] }))), ['payload.lines.0.text:text_same_as_base'])
    assert.deepEqual(validateVoice(voice({ lines: [line('a', { base: 'Same', text: 'same' })] })), [])
  })
  it('note: optional, at most 500 characters, plain', () => {
    assert.deepEqual(validateVoice(voice({ note: 'x'.repeat(500) })), [])
    assert.deepEqual(codes(validateVoice(voice({ note: 'x'.repeat(501) }))), ['payload.note:note_too_long'])
    assert.deepEqual(codes(validateVoice(voice({ note: '<script>' }))), ['payload.note:note_invalid'])
    assert.deepEqual(codes(validateVoice(voice({ note: 5 }))), ['payload.note:note_invalid'])
    assert.deepEqual(validateVoice(voice({ note: null })), [])
    assert.deepEqual(validateVoice(voice({ note: '   ' })), [])
  })
  it('reports every error at once with a code, message and full path', () => {
    const errs = validateVoice(voice({ lines: [line('a', { text: '<b>' }), line('a'), { key: 'x' }], note: 'x'.repeat(501) }))
    assert.ok(errs.length >= 4)
    for (const e of errs) {
      assert.ok(e.code && e.message && e.path.startsWith('payload'))
    }
  })
  it('error paths follow the line index after a removal', () => {
    const lines = [line('a'), line('b', { text: '' }), line('c')]
    lines.splice(0, 1)
    assert.deepEqual(codes(validateVoice(voice({ lines }))), ['payload.lines.0.text:text_required'])
  })
})

describe('validateBio', () => {
  const bio = (over: Record<string, unknown> = {}) => ({ key: 'DETAIL_CEPH_H01', base: '', text: 'A friendly doctor.', ...over })
  it('accepts a valid payload', () => {
    assert.deepEqual(validateBio(bio()), [])
    assert.deepEqual(validateBio(bio({ note: 'hi' })), [])
  })
  it('rejects non-objects and bad keys', () => {
    assert.deepEqual(codes(validateBio(null)), ['payload:payload_invalid'])
    for (const k of ['', 'a b', 'x-y', 5, 'x'.repeat(101)]) assert.deepEqual(codes(validateBio(bio({ key: k }))), ['payload.key:key_invalid'])
  })
  it('uses the same text rules, with unprefixed single-bio paths', () => {
    assert.deepEqual(codes(validateBio(bio({ text: '' }))), ['payload.text:text_required'])
    assert.deepEqual(codes(validateBio(bio({ text: '<i>x</i>' }))), ['payload.text:text_invalid'])
    assert.deepEqual(codes(validateBio(bio({ base: 'Same', text: 'Same' }))), ['payload.text:text_same_as_base'])
    assert.deepEqual(codes(validateBio(bio({ base: 5 }))), ['payload.base:base_invalid'])
    assert.deepEqual(codes(validateBio(bio({ note: 'x'.repeat(501) }))), ['payload.note:note_too_long'])
  })
})

describe('textProblem', () => {
  it('trims and normalizes before measuring', () => {
    assert.equal(textProblem(' ' + 'x'.repeat(2000) + ' \r\n'), null)
    assert.equal(textProblem('x'.repeat(2001))?.code, 'text_too_long')
    assert.deepEqual(textProblem('x'.repeat(2001))?.params, { max: 2000 })
  })
  it('newlines are fine, tabs are not', () => {
    assert.equal(textProblem('a\nb\r\nc'), null)
    assert.equal(textProblem('a\tb')?.code, 'text_invalid')
  })
})

describe('validatePageEdit', () => {
  const sha = 'a'.repeat(40)
  const edit = (over: Record<string, unknown> = {}) => ({ path: '_charas/ryekie.md', baseSha: sha, after: '## Notes\n\nText\n', summary: 'Add usage guide', ...over })
  it('accepts a valid payload', () => {
    assert.deepEqual(validatePageEdit(edit()), [])
  })
  it('rejects non-objects', () => {
    for (const bad of [null, 'x', 3, [], undefined]) assert.deepEqual(codes(validatePageEdit(bad)), ['payload:payload_invalid'])
  })
  it('only editable paths', () => {
    for (const ok of ['_charas/ryekie.md', '_events/2204aprilfool.md', '_main_quests/chapter01.md', 'guide/sale.md', 'chara_quests.md', 'mobs.md', 'guide/a.b-c_d.md']) {
      assert.equal(isEditablePath(ok), true, ok)
    }
    for (const bad of ['_statuses/x.md', '_posts/2020-01-01-x.md', '_layouts/default.html', '_includes/a.md', 'guide/sub/x.md', '../mobs.md', '_charas/../mobs.md', '_charas/x.html', 'guide/.md', '/mobs.md', 'index.md', '_charas/x..md']) {
      assert.equal(isEditablePath(bad), false, bad)
      assert.deepEqual(codes(validatePageEdit(edit({ path: bad }))), ['payload.path:path_not_editable'], bad)
    }
    assert.deepEqual(codes(validatePageEdit(edit({ path: 5 }))), ['payload.path:path_not_editable'])
  })
  it('baseSha is 40 hex (case-insensitive)', () => {
    assert.deepEqual(validatePageEdit(edit({ baseSha: 'ABCDEF0123'.repeat(4) })), [])
    for (const bad of ['', 'a'.repeat(39), 'a'.repeat(41), 'g'.repeat(40), undefined, 5]) {
      assert.deepEqual(codes(validatePageEdit(edit({ baseSha: bad }))), ['payload.baseSha:base_sha_invalid'])
    }
    assert.equal(isBlobSha(sha), true)
    assert.equal(isBlobSha('xyz'), false)
  })
  it('after: string, at most 120000 chars, no NUL, no leading front matter fence', () => {
    assert.deepEqual(validatePageEdit(edit({ after: '' })), [])
    assert.deepEqual(validatePageEdit(edit({ after: 'x'.repeat(120_000) })), [])
    assert.deepEqual(codes(validatePageEdit(edit({ after: 'x'.repeat(120_001) }))), ['payload.after:after_too_long'])
    assert.deepEqual(codes(validatePageEdit(edit({ after: 'a\u0000b' }))), ['payload.after:after_nul'])
    assert.deepEqual(codes(validatePageEdit(edit({ after: 7 }))), ['payload.after:after_invalid'])
    for (const fence of ['---\ntitle: x\n---\nbody', '---\r\nx', '---', '--- \nx']) {
      assert.deepEqual(codes(validatePageEdit(edit({ after: fence }))), ['payload.after:after_front_matter'], JSON.stringify(fence))
    }
    // a horizontal rule later in the body, or a longer dash run, is fine
    assert.deepEqual(validatePageEdit(edit({ after: 'text\n\n---\n\nmore' })), [])
    assert.deepEqual(validatePageEdit(edit({ after: '----\nx' })), [])
    assert.equal(startsWithFence('---\nx'), true)
    assert.equal(startsWithFence(' ---\nx'), false)
  })
  it('summary: 3..120 characters after trimming, one line', () => {
    assert.deepEqual(validatePageEdit(edit({ summary: 'abc' })), [])
    assert.deepEqual(validatePageEdit(edit({ summary: ' abc ' })), [])
    assert.deepEqual(validatePageEdit(edit({ summary: 'x'.repeat(120) })), [])
    for (const bad of ['', 'ab', '  ab  ', 'x'.repeat(121), undefined, 5]) {
      assert.deepEqual(codes(validatePageEdit(edit({ summary: bad }))), ['payload.summary:summary_length'], String(bad))
    }
    for (const bad of ['two\nlines', 'tab\there', 'a\u2028b']) {
      assert.deepEqual(codes(validatePageEdit(edit({ summary: bad }))), ['payload.summary:summary_plain'], JSON.stringify(bad))
    }
  })
  it('reports every problem with a code, message and full path', () => {
    const errs = validatePageEdit({ path: 'x', baseSha: 'y', after: 5, summary: '' })
    assert.deepEqual(codes(errs), ['payload.path:path_not_editable', 'payload.baseSha:base_sha_invalid', 'payload.after:after_invalid', 'payload.summary:summary_length'])
    for (const e of errs) assert.ok(e.message)
  })
})

describe('errorsFor', () => {
  const errs = [
    { path: 'payload.lines.2.text', code: 'a', message: 'm' },
    { path: 'lines.3.key', code: 'b', message: 'm' },
    { path: 'payload.note', code: 'c', message: 'm' },
    { path: 'payload', code: 'd', message: 'm' },
  ]
  it('matches with or without the payload. prefix, by field or sub-path', () => {
    assert.deepEqual(errorsFor(errs, 'lines').map((e) => e.code), ['a', 'b'])
    assert.deepEqual(errorsFor(errs, 'note').map((e) => e.code), ['c'])
    assert.deepEqual(errorsFor(errs, 'lines.2.text').map((e) => e.code), ['a'])
    assert.deepEqual(errorsFor(errs, 'li').map((e) => e.code), [])
  })
})
