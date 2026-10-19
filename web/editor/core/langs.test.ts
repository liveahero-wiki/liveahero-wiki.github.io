import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { LANG_CODE, TL_LANGS, langOfCode, langsOf, perLang } from './langs.ts'
import { collectRows } from '../voice/collect.ts'

describe('langs', () => {
  it('maps the page codes to submission languages and back', () => {
    assert.deepEqual(TL_LANGS.map((l) => LANG_CODE[l]), ['en', 'hans', 'hant'])
    assert.equal(langOfCode('hans'), 'zh-Hans')
    assert.equal(langOfCode('hant'), 'zh-Hant')
    assert.equal(langOfCode('en'), 'en')
    assert.equal(langOfCode(null), 'en')
    assert.equal(langOfCode('fr'), 'en')
  })
  it('langsOf: the listed languages in a fixed order; nothing listed offers all', () => {
    assert.deepEqual(langsOf('hant en'), ['en', 'zh-Hant'])
    assert.deepEqual(langsOf(['hans']), ['zh-Hans'])
    assert.deepEqual(langsOf('  hans   hant '), ['zh-Hans', 'zh-Hant'])
    for (const none of [null, undefined, '', ' ', [], ['fr'], 'fr']) assert.deepEqual(langsOf(none), ['en', 'zh-Hans', 'zh-Hant'])
  })
  it('perLang builds a record', () => {
    assert.deepEqual(perLang((l) => l.length), { en: 2, 'zh-Hans': 7, 'zh-Hant': 7 })
  })
})

// A voice-table row as `collectRows` reads it, without a DOM.
const cell = (text: string) => ({ cloneNode: () => cell(text), querySelectorAll: () => [], textContent: text })
const row = (attrs: Record<string, string>, cells: Record<string, string>, jp: string, badge = 'action') => ({
  getAttribute: (n: string) => attrs[n] ?? null,
  querySelector: (sel: string) => {
    if (sel === '.voice-text') return cell(jp)
    if (sel === '.voice-key-badge') return { textContent: badge }
    const m = /data-lang="(\w+)"/.exec(sel)
    return m && m[1]! in cells ? cell(cells[m[1]!]!) : null
  },
})
const table = (...rows: ReturnType<typeof row>[]) => ({ querySelectorAll: () => rows }) as unknown as Element

describe('collectRows', () => {
  it('reads the text of every language and the languages the row still offers', () => {
    const r = row({ 'data-voice-key': 'voice_abc_action', 'data-tl-langs': 'en hant' }, { en: 'Go!', hans: '-', hant: '走吧' }, '行くぜ')
    const [line] = collectRows(table(r), ['abc'])
    assert.deepEqual(line!.bases, { en: 'Go!', 'zh-Hans': '', 'zh-Hant': '走吧' })
    assert.deepEqual(line!.langs, ['en', 'zh-Hant'])
    assert.equal(line!.jp, '行くぜ')
  })
  it('a row without the attribute (an older page) offers every language', () => {
    const r = row({ 'data-voice-key': 'voice_abc_action' }, { en: '-', hans: '-', hant: '-' }, '行くぜ')
    assert.deepEqual(collectRows(table(r), ['abc'])[0]!.langs, ['en', 'zh-Hans', 'zh-Hant'])
  })
  it('a line without Japanese text can only be transcribed and translated into English', () => {
    const r = row({ 'data-voice-key': 'voice_abc_win', 'data-tl-langs': 'en hans hant' }, { en: '-', hans: '-', hant: '-' }, '-')
    const [line] = collectRows(table(r), ['abc'])
    assert.equal(line!.jpEditable, true)
    assert.deepEqual(line!.langs, ['en'])
  })
})
