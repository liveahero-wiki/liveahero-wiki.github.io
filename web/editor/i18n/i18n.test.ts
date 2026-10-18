import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { bundles, hasKey, makeT } from './t.ts'
import { en } from './en.ts'
import { errorText, fieldText, SubmitError } from '../core/submit.ts'

const LANGS = ['en', 'zh-Hans', 'zh-Hant', 'ja'] as const
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('editor i18n bundles', () => {
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
      for (const [k, v] of Object.entries(en)) assert.deepEqual(placeholders(b[k]!), placeholders(v), `${lang}.${k}`)
    }
  })

  it('makeT fills params and falls back to English for an unknown language', () => {
    assert.equal(makeT('en')('signedInAs', { name: 'Ann' }), 'Signed in as Ann')
    assert.equal(makeT('ja')('signedInAs', { name: 'Ann' }), 'Ann としてサインイン中')
    assert.equal(makeT('xx' as never)('close'), 'Close')
    assert.ok(hasKey('close') && !hasKey('nope'))
  })

  it('every server error code the editor maps has a message in each language', () => {
    for (const lang of LANGS) {
      const t = makeT(lang)
      for (const code of ['validation_failed', 'turnstile_failed', 'too_large', 'daily_cap', 'pending_cap', 'rate_limited', 'network', 'verify_missing', 'verify_load']) {
        assert.notEqual(errorText(t, new SubmitError(code === 'network' ? 0 : 400, code)), t('errUnknown'), `${lang} ${code}`)
      }
    }
  })

  it('field errors of the three types are localized, unknown codes keep the server message', () => {
    const t = makeT('zh-Hans')
    for (const code of ['text_required', 'text_too_long', 'text_invalid', 'text_same_as_base', 'key_invalid', 'key_duplicate', 'line_not_translatable', 'bio_not_translatable', 'unknown_resource', 'lines_length', 'note_too_long', 'note_invalid', 'path_not_editable', 'base_sha_invalid', 'after_too_long', 'after_front_matter', 'summary_length', 'summary_plain']) {
      assert.ok(hasKey(`fe_${code}`), code)
    }
    assert.equal(fieldText(t, { path: 'payload.lines.0.text', code: 'text_too_long', params: { max: 2000 } }), '最多2000个字符。')
    assert.equal(fieldText(t, { path: 'x', code: 'brand_new', message: 'English fallback' }), 'English fallback')
  })
})
