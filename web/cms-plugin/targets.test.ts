import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SITE } from './roster.ts'
import { findTarget, parseTargets, targetChoices, targetHref, targetLabel } from './targets.ts'

const sim = { id: 'quest-616001', label: { en: 'Simulator - Lantern (SSS)', ja: 'シミュレーター' }, url: '/guide/challenge_simulator/' }
const rogue = { id: 'rogue-2609', label: { en: 'Unexplored boss' } }
const old = { id: 'quest-605001', label: { en: 'Old simulator' }, retired: true }

describe('parseTargets', () => {
  it('reads valid entries in registry order and keeps url / retired', () => {
    const t = parseTargets({ support: 'optional', targets: [sim, rogue, old] })
    assert.deepEqual(t.map((x) => x.id), ['quest-616001', 'rogue-2609', 'quest-605001'])
    assert.equal(t[0].url, '/guide/challenge_simulator/')
    assert.equal(t[1].url, undefined)
    assert.equal(t[2].retired, true)
    assert.equal(t[0].retired, undefined)
  })
  it('absent, null or malformed targets give an empty list', () => {
    assert.deepEqual(parseTargets({}), [])
    assert.deepEqual(parseTargets(undefined), [])
    assert.deepEqual(parseTargets({ targets: null }), [])
    const warnings: string[] = []
    assert.deepEqual(parseTargets({ targets: 'x' }, (m) => warnings.push(m)), [])
    assert.equal(warnings.length, 1)
  })
  it('ignores malformed entries with a warning', () => {
    const warnings: string[] = []
    const t = parseTargets(
      {
        targets: [
          null,
          'quest-1',
          { label: { en: 'no id' } },
          { id: 'Upper', label: { en: 'x' } },
          { id: '-lead', label: { en: 'x' } },
          { id: 'a'.repeat(65), label: { en: 'x' } },
          { id: 'no-label' },
          { id: 'empty-label', label: { en: '  ', xx: 'unknown language' } },
          rogue,
          { id: 'rogue-2609', label: { en: 'duplicate' } },
        ],
      },
      (m) => warnings.push(m),
    )
    assert.deepEqual(t.map((x) => x.id), ['rogue-2609'])
    assert.equal(warnings.length, 9)
  })
  it('drops an unsafe url but keeps the entry; only retired === true retires', () => {
    for (const url of ['javascript:alert(1)', '//evil.example/', 'guide/x/', 'http://insecure.example/', 5]) {
      const [t] = parseTargets({ targets: [{ ...rogue, url, retired: 'yes' }] })
      assert.equal(t.id, 'rogue-2609')
      assert.equal(t.url, undefined, String(url))
      assert.equal(t.retired, undefined)
    }
    assert.equal(parseTargets({ targets: [{ ...rogue, url: 'https://example.com/x' }] })[0].url, 'https://example.com/x')
  })
})

describe('targetLabel', () => {
  it('falls back from the UI language to en, then ja, then any language, then the id', () => {
    assert.equal(targetLabel(sim, 'ja'), 'シミュレーター')
    assert.equal(targetLabel(sim, 'zh-Hant'), 'Simulator - Lantern (SSS)')
    assert.equal(targetLabel({ id: 'x', label: { ja: '日本語' } }, 'zh-Hans'), '日本語')
    assert.equal(targetLabel({ id: 'x', label: { 'zh-Hans': '简体' } }, 'ja'), '简体')
    assert.equal(targetLabel({ id: 'x', label: {} }, 'en'), 'x')
  })
})

describe('targetHref', () => {
  it('resolves site paths against the wiki and passes https through', () => {
    assert.equal(targetHref({ url: '/guide/challenge_simulator/' }), `${SITE}/guide/challenge_simulator/`)
    assert.equal(targetHref({ url: 'https://example.com/a' }), 'https://example.com/a')
    assert.equal(targetHref({}), '')
    assert.equal(targetHref({ url: 'javascript:alert(1)' }), '')
  })
})

describe('targetChoices', () => {
  const all = parseTargets({ targets: [sim, rogue, old] })
  it('hides retired entries', () => {
    assert.deepEqual(targetChoices(all, null).map((t) => t.id), ['quest-616001', 'rogue-2609'])
    assert.deepEqual(targetChoices(all, 'rogue-2609').map((t) => t.id), ['quest-616001', 'rogue-2609'])
  })
  it('keeps the current value even when retired (keeps registry order)', () => {
    assert.deepEqual(targetChoices(all, 'quest-605001').map((t) => t.id), ['quest-616001', 'rogue-2609', 'quest-605001'])
  })
  it('offers an unlisted current value by its raw id', () => {
    const c = targetChoices(all, 'gone-1')
    assert.equal(c.at(-1)?.id, 'gone-1')
    assert.equal(targetLabel(c.at(-1)!, 'en'), 'gone-1')
  })
  it('findTarget', () => {
    assert.equal(findTarget(all, 'rogue-2609')?.id, 'rogue-2609')
    assert.equal(findTarget(all, 'nope'), undefined)
  })
})
