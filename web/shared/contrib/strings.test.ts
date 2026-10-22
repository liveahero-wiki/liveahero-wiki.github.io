import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createT } from '../i18n.ts'
import { LANGS } from '../lang.ts'
import { contribStrings, signInErrorText, type ContribKey } from './strings.ts'

const t = createT(contribStrings)('en')
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('contribStrings', () => {
  it('every language has every key, with the same {placeholders} as English', () => {
    for (const lang of LANGS) {
      assert.deepEqual(Object.keys(contribStrings[lang]).sort(), Object.keys(contribStrings.en).sort(), lang)
      for (const [k, v] of Object.entries(contribStrings.en)) {
        const s = contribStrings[lang][k as ContribKey]
        assert.ok(s.trim(), `${lang}.${k}`)
        assert.deepEqual(placeholders(s), placeholders(v), `${lang}.${k}`)
      }
    }
  })
})

describe('signInErrorText', () => {
  it('maps popup_blocked, closed and the account age rule', () => {
    assert.equal(signInErrorText(t, 'en', { code: 'popup_blocked' }), t('popupBlocked'))
    assert.equal(signInErrorText(t, 'en', { code: 'closed' }), t('signInClosed'))
    assert.match(signInErrorText(t, 'en', { code: 'account_too_young', eligibleAt: Date.UTC(2026, 10, 20) }), /at least 30 days old/)
    assert.equal(signInErrorText(t, 'en', { code: 'account_too_young' }), t('tooYoungNoDate', { days: 30 }))
    assert.equal(signInErrorText(t, 'en', new Error('x')), t('signInFailed'))
    assert.equal(signInErrorText(t, 'en', null), t('signInFailed'))
  })
  it('localizes through the given lookup', () => {
    const ja = createT(contribStrings)('ja')
    assert.equal(signInErrorText(ja, 'ja', { code: 'closed' }), contribStrings.ja.signInClosed)
  })
})
