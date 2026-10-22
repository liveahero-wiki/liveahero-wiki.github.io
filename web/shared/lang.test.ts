import { afterEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { langFromTag, onLangChange, pageLang, pickText, setPageLang, type Lang } from './lang.ts'

/** A bare page: `<html>` attributes, `navigator.language`, document events and (optionally) the head script's setSkillLang. */
function fakePage({ skillLang, htmlLang = '', language = 'en-US', setSkillLang }: { skillLang?: string; htmlLang?: string; language?: string; setSkillLang?: (lang: Lang) => void }) {
  const attrs: Record<string, string> = skillLang === undefined ? {} : { 'data-skill-lang': skillLang }
  const target = new EventTarget()
  const document = {
    documentElement: { lang: htmlLang, getAttribute: (k: string) => attrs[k] ?? null, setAttribute: (k: string, v: string) => void (attrs[k] = v) },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  }
  for (const [k, value] of Object.entries({ document, navigator: { language }, window: { setSkillLang } })) {
    Object.defineProperty(globalThis, k, { value, configurable: true, writable: true })
  }
  return attrs
}

const saved = Object.fromEntries(['document', 'navigator', 'window'].map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]))
afterEach(() => {
  for (const [k, d] of Object.entries(saved)) {
    if (d) Object.defineProperty(globalThis, k, d)
    else delete (globalThis as Record<string, unknown>)[k]
  }
})

describe('langFromTag', () => {
  it('maps BCP-47 tags to the four UI languages', () => {
    assert.equal(langFromTag('ja-JP'), 'ja')
    assert.equal(langFromTag('zh-TW'), 'zh-Hant')
    assert.equal(langFromTag('zh-Hant-HK'), 'zh-Hant')
    assert.equal(langFromTag('zh-CN'), 'zh-Hans')
    assert.equal(langFromTag('en-GB'), 'en')
    assert.equal(langFromTag('fr'), null)
    assert.equal(langFromTag(''), null)
  })
})

describe('pageLang', () => {
  it('prefers <html data-skill-lang>', () => {
    fakePage({ skillLang: 'zh-Hant', htmlLang: 'ja', language: 'en' })
    assert.equal(pageLang(), 'zh-Hant')
  })
  it('falls back to <html lang>, then navigator.language, then English', () => {
    fakePage({ skillLang: 'fr', htmlLang: 'ja-JP' })
    assert.equal(pageLang(), 'ja')
    fakePage({ language: 'zh-CN' })
    assert.equal(pageLang(), 'zh-Hans')
    fakePage({ language: 'ko' })
    assert.equal(pageLang(), 'en')
  })
})

describe('setPageLang / onLangChange', () => {
  it('uses the head script when the page has it', () => {
    const calls: Lang[] = []
    const attrs = fakePage({ skillLang: 'en', setSkillLang: (l) => void calls.push(l) })
    setPageLang('ja')
    assert.deepEqual(calls, ['ja'])
    assert.equal(attrs['data-skill-lang'], 'en') // the head script owns the change
  })
  it('without the head script, sets the attribute and tells listeners', () => {
    const attrs = fakePage({ skillLang: 'en' })
    const heard: Lang[] = []
    const off = onLangChange((l) => heard.push(l))
    setPageLang('zh-Hans')
    off()
    setPageLang('ja')
    assert.equal(attrs['data-skill-lang'], 'ja')
    assert.deepEqual(heard, ['zh-Hans'])
  })
})

describe('pickText', () => {
  it('falls back to English', () => {
    assert.equal(pickText({ en: 'A', ja: 'エー' }, 'ja'), 'エー')
    assert.equal(pickText({ en: 'A' }, 'zh-Hant'), 'A')
  })
})
