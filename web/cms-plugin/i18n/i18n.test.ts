import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { bundles, makeT, errorText } from './t.ts'
import { en } from './en.ts'
import { ERROR_CODES, validateTeamPayload } from '../validate.ts'

const LANGS = ['en', 'zh-Hans', 'zh-Hant', 'ja'] as const
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('i18n bundles', () => {
  it('every key in en exists (non-empty) in the other bundles, and there are no extra keys', () => {
    const enKeys = Object.keys(en).sort()
    for (const lang of LANGS) {
      const b = bundles[lang] as Record<string, string>
      assert.deepEqual(Object.keys(b).sort(), enKeys, lang)
      for (const k of enKeys) assert.ok(b[k] && b[k].trim(), `${lang}.${k}`)
    }
  })

  it('every translation uses the same {placeholders} as English', () => {
    for (const lang of LANGS) {
      const b = bundles[lang] as Record<string, string>
      for (const [k, v] of Object.entries(en)) {
        assert.deepEqual(placeholders(b[k]), placeholders(v), `${lang}.${k}`)
      }
    }
  })

  it('every validate.ts error code has a message in each bundle', () => {
    for (const lang of LANGS) {
      const b = bundles[lang] as Record<string, string>
      for (const code of ERROR_CODES) assert.ok(b[`error_${code}`], `${lang}.error_${code}`)
    }
  })

  it('errorText fills params, localizes the focus kind and falls back to message for unknown codes', () => {
    const t = makeT('ja')
    assert.equal(errorText(t, { path: 'payload.heroes', code: 'duplicate_hero', message: 'x', params: { slots: '1,3' } }), 'スロット1, 3で同じヒーローが使われています。')
    assert.equal(errorText(t, { path: 'payload.heroes', code: 'focus_missing', message: 'x', params: { kind: 'sidekick', stockId: 1 } }), 'このページのサイドキックをチームに含めてください。')
    assert.equal(errorText(t, { path: 'payload', code: 'something_new', message: 'English fallback' }), 'English fallback')
  })

  it('every code the validator actually emits is covered', () => {
    const r = validateTeamPayload(
      { v: 2, supportIndex: 9, heroes: [{ stockId: 'x', lv: 0, bloom: 1, active: 5, passives: [1, 1, 1] }, { stockId: 5, active: 5 }, { stockId: 5 }] },
      { options: { focus: { kind: 'hero', stockId: 77 } } },
      { roster: { heroes: [{ stockId: 1 }], sidekicks: [{ stockId: 1 }] } },
    )
    assert.ok(!r.ok)
    if (!r.ok) for (const e of r.errors) assert.ok((en as Record<string, string>)[`error_${e.code}`], e.code)
  })

  it('unknown language falls back to English', () => {
    assert.equal(makeT('xx' as 'en')('close'), 'Close')
  })
})
