import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { clip, livePagePath, plural, readBio, readPageEdit, readVoice, voicePart } from './payload.ts'

describe('readVoice', () => {
  it('reads a well-formed payload', () => {
    const p = { resourceName: 'ryekie', lines: [{ key: 'voice_ryekie_a', base: 'b', text: 't' }], note: 'n' }
    assert.deepEqual(readVoice(p), p)
  })
  it('tolerates garbage without throwing and drops a blank note', () => {
    assert.deepEqual(readVoice(null), { resourceName: '', lines: [] })
    assert.deepEqual(readVoice('x'), { resourceName: '', lines: [] })
    assert.deepEqual(readVoice({ resourceName: 5, lines: 'x', note: '  ' }), { resourceName: '', lines: [] })
    assert.deepEqual(readVoice({ resourceName: 'r', lines: [null, { key: 7, text: 't' }, 'x'] }), {
      resourceName: 'r',
      lines: [
        { key: '', base: '', text: '' },
        { key: '', base: '', text: 't' },
        { key: '', base: '', text: '' },
      ],
    })
  })
  it('returns copies of the lines, so editing them cannot touch the input', () => {
    const input = { resourceName: 'r', lines: [{ key: 'voice_r_a', base: '', text: 't' }] }
    readVoice(input).lines[0].text = 'changed'
    assert.equal(input.lines[0].text, 't')
  })
})

describe('readBio / readPageEdit', () => {
  it('read known fields and default the rest', () => {
    assert.deepEqual(readBio({ key: 'DETAIL_X_H01', base: 'b', text: 't', note: 'n', extra: 1 }), { key: 'DETAIL_X_H01', base: 'b', text: 't', note: 'n' })
    assert.deepEqual(readBio(undefined), { key: '', base: '', text: '' })
    assert.deepEqual(readPageEdit({ path: 'mobs.md', baseSha: 'a'.repeat(40), after: 'x', summary: 's' }), { path: 'mobs.md', baseSha: 'a'.repeat(40), after: 'x', summary: 's' })
    assert.deepEqual(readPageEdit([]), { path: '', baseSha: '', after: '', summary: '' })
  })
})

describe('voicePart', () => {
  it('strips the voice_<resource>_ prefix', () => {
    assert.equal(voicePart('ryekie', 'voice_ryekie_action'), 'action')
    assert.equal(voicePart('ryekie', 'voice_ryekie_skill_1'), 'skill_1')
  })
  it('keeps keys that do not carry the prefix (shown as-is so a bad key is visible)', () => {
    assert.equal(voicePart('ryekie', 'voice_other_action'), 'voice_other_action')
    assert.equal(voicePart('ryekie', 'voice_ryekie_'), 'voice_ryekie_')
  })
})

describe('clip / plural', () => {
  it('collapses whitespace and cuts with an ellipsis', () => {
    assert.equal(clip('a\n  b', 80), 'a b')
    assert.equal(clip('x'.repeat(100), 80), 'x'.repeat(79) + '…')
    assert.equal(clip('x'.repeat(80), 80), 'x'.repeat(80))
  })
  it('plural', () => {
    assert.equal(plural(1, 'line'), '1 line')
    assert.equal(plural(0, 'line'), '0 lines')
    assert.equal(plural(12, 'line'), '12 lines')
  })
})

describe('livePagePath', () => {
  it('maps repo paths to the live URL', () => {
    assert.equal(livePagePath('_charas/ryekie.md'), '/charas/ryekie/')
    assert.equal(livePagePath('_events/2204aprilfool.md'), '/events/2204aprilfool/')
    assert.equal(livePagePath('_main_quests/chapter01.md'), '/main_quests/chapter01/')
    assert.equal(livePagePath('guide/sale.md'), '/guide/sale/')
    assert.equal(livePagePath('mobs.md'), '/mobs/')
    assert.equal(livePagePath('chara_quests.md'), '/chara_quests/')
  })
  it('null for anything else', () => {
    assert.equal(livePagePath('_posts/x.md'), null)
    assert.equal(livePagePath(''), null)
  })
})
