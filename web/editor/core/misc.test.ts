import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_REPO, parseRepo, readConfig } from './config.ts'
import { bioEntry, dataUrl } from './data.ts'
import { draftKey, readDraft, writeDraft } from './drafts.ts'
import { describeSubmission, rowsOf, safeUrl, statusText } from './mine.ts'
import { makeT } from '../i18n/t.ts'
import { baseOf, resourceNames, resourceOf } from '../voice/collect.ts'

const mem = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }
}

describe('drafts', () => {
  it('are keyed by path and base version', () => {
    assert.notEqual(draftKey('_charas/a.md', 'aaa'), draftKey('_charas/a.md', 'bbb'))
    assert.notEqual(draftKey('_charas/a.md', 'aaa'), draftKey('_charas/b.md', 'aaa'))
  })
  it('round-trip and clear', () => {
    const s = mem()
    assert.equal(readDraft('p.md', 'x', s), null)
    writeDraft('p.md', 'x', { body: 'hello', summary: 'fix' }, s, 42)
    assert.deepEqual(readDraft('p.md', 'x', s), { body: 'hello', summary: 'fix', savedAt: 42 })
    assert.equal(readDraft('p.md', 'y', s), null) // another base version: the draft does not apply
    writeDraft('p.md', 'x', null, s)
    assert.equal(readDraft('p.md', 'x', s), null)
  })
  it('never throw when storage is missing, full or corrupt', () => {
    assert.equal(readDraft('p.md', 'x', null), null)
    writeDraft('p.md', 'x', { body: 'a', summary: '' }, null)
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    assert.equal(readDraft('p.md', 'x', broken), null)
    writeDraft('p.md', 'x', { body: 'a', summary: '' }, broken)
    writeDraft('p.md', 'x', null, broken)
    const s = mem()
    s.setItem(draftKey('p.md', 'x'), '{not json')
    assert.equal(readDraft('p.md', 'x', s), null)
    s.setItem(draftKey('p.md', 'x'), JSON.stringify({ summary: 'no body' }))
    assert.equal(readDraft('p.md', 'x', s), null)
  })
})

describe('config', () => {
  const el = (attrs: Record<string, string>) => ({ closest: (sel: string) => (sel.slice(1, -1) in attrs ? { getAttribute: (n: string) => attrs[n] ?? null } : null) })
  const doc = (attrs: Record<string, string> = {}, meta: Record<string, string> = {}) => ({
    querySelector: (sel: string) => {
      const m = /^meta\[name="(.+)"\]$/.exec(sel)
      if (m) return m[1]! in meta ? { getAttribute: () => meta[m[1]!] ?? null } : null
      const a = sel.slice(1, -1)
      return a in attrs ? { getAttribute: (n: string) => attrs[n] ?? null } : null
    },
  })
  it('reads the api and repo from the clicked element or its ancestors', () => {
    const c = readConfig(el({ 'data-cms-api': 'https://cms.example/', 'data-github-repo': 'https://github.com/o/r' }), doc())
    assert.deepEqual(c, { api: 'https://cms.example', repo: 'o/r' })
  })
  it('falls back to any element, then <meta>, then the default repo', () => {
    assert.equal(readConfig(el({}), doc({ 'data-cms-api': 'https://x.test' })).api, 'https://x.test')
    assert.equal(readConfig(el({}), doc({}, { 'cms-api': 'https://m.test/' })).api, 'https://m.test')
    const none = readConfig(el({}), doc())
    assert.deepEqual(none, { api: '', repo: DEFAULT_REPO })
  })
  it('parseRepo', () => {
    assert.equal(parseRepo('https://github.com/liveahero-wiki/liveahero-wiki.github.io'), 'liveahero-wiki/liveahero-wiki.github.io')
    assert.equal(parseRepo('https://github.com/o/r.git/'), 'o/r')
    assert.equal(parseRepo('o/r'), 'o/r')
    assert.equal(parseRepo('https://evil.example/o/r'), null)
    assert.equal(parseRepo('../x'), null)
    assert.equal(parseRepo(null), null)
  })
})

describe('data', () => {
  it('dataUrl resolves next to assets/cms/', () => {
    assert.equal(dataUrl('bio-roster.json', 'https://wiki.example/assets/cms/editor.js'), 'https://wiki.example/api/bio-roster.json')
  })
  it('bioEntry offers only roster keys and drops a text that is a copy of the Japanese', () => {
    const roster = { bios: { DETAIL_A_H01: { jp: '日本語', en: 'English' }, DETAIL_B_H01: { jp: '同じ', en: '同じ' }, DETAIL_C_H01: { jp: 'だけ' } } }
    const all = ['en', 'zh-Hans', 'zh-Hant']
    assert.deepEqual(bioEntry(roster, 'DETAIL_A_H01'), { jp: '日本語', bases: { en: 'English', 'zh-Hans': '', 'zh-Hant': '' }, langs: all })
    assert.deepEqual(bioEntry(roster, 'DETAIL_B_H01'), { jp: '同じ', bases: { en: '', 'zh-Hans': '', 'zh-Hant': '' }, langs: all })
    assert.deepEqual(bioEntry(roster, 'DETAIL_C_H01'), { jp: 'だけ', bases: { en: '', 'zh-Hans': '', 'zh-Hant': '' }, langs: all })
    assert.equal(bioEntry(roster, 'DETAIL_NOPE_H01'), null)
    assert.equal(bioEntry(roster, '__proto__'), null)
    assert.equal(bioEntry(null, 'DETAIL_A_H01'), null)
    assert.equal(bioEntry({ bios: {} }, 'DETAIL_A_H01'), null)
  })
  it('bioEntry reads the Chinese texts and the open languages of the roster entry', () => {
    const roster = { bios: { DETAIL_A_H01: { jp: '日本語', en: 'English', hans: '简介', hant: '日本語', langs: ['hant', 'hans'] }, DETAIL_B_H01: { jp: '', langs: ['en', 'hans'] } } }
    assert.deepEqual(bioEntry(roster, 'DETAIL_A_H01'), { jp: '日本語', bases: { en: 'English', 'zh-Hans': '简介', 'zh-Hant': '' }, langs: ['zh-Hans', 'zh-Hant'] })
    // no Japanese text to translate from: only English can be suggested
    assert.deepEqual(bioEntry(roster, 'DETAIL_B_H01')?.langs, ['en'])
  })
  it("voice cells: the page's '-' is no text", () => {
    assert.equal(baseOf('-'), '')
    assert.equal(baseOf(' Hello '), 'Hello')
  })
})

describe('my contributions', () => {
  const t = makeT('en')
  const sub = (over: Record<string, unknown>) => ({ id: 'i', type: 'lah-bio-tl', groupId: 'all', state: 'pending', version: 1, createdAt: 1, updatedAt: 1, title: '', payload: {}, tags: {}, lang: 'en', explanation: '', demoUrl: '', revision: null, outcome: null, ...over }) as never
  it('describes each type', () => {
    assert.equal(describeSubmission(t, { type: 'lah-voice-tl', payload: { resourceName: 'ryekie', lines: [1, 2, 3] } }), 'Voice lines: ryekie (3)')
    assert.equal(describeSubmission(t, { type: 'lah-bio-tl', payload: { key: 'DETAIL_CEPH_H01' } }), 'Bio translation: DETAIL_CEPH_H01')
    assert.equal(describeSubmission(t, { type: 'lah-page-edit', payload: { path: '_charas/a.md' } }), 'Page edit: _charas/a.md')
  })
  it('status: pending, approved, then the type outcome', () => {
    assert.equal(statusText(t, { state: 'pending', outcome: null }), 'Waiting for review')
    assert.equal(statusText(t, { state: 'approved', outcome: null }), 'Approved')
    assert.equal(statusText(t, { state: 'approved', outcome: { status: 'synced' } }), 'Added to the translation sheet')
    assert.equal(statusText(t, { state: 'approved', outcome: { status: 'pr_open' } }), 'Pull request open')
    assert.equal(statusText(t, { state: 'approved', outcome: { status: 'merged' } }), t('outcome_merged'))
    assert.equal(statusText(t, { state: 'approved', outcome: { status: 'custom', label: 'Shown as is' } }), 'Shown as is')
    assert.equal(statusText(t, { state: 'approved', outcome: { status: 'custom' } }), 'Approved')
  })
  it('rows: newest first, other types dropped, only https links', () => {
    const rows = rowsOf(t, [
      [sub({ id: 'a', createdAt: 1, payload: { key: 'K1' } })],
      [sub({ id: 'b', createdAt: 5, type: 'lah-page-edit', state: 'approved', payload: { path: 'mobs.md' }, outcome: { status: 'pr_open', url: 'https://github.com/o/r/pull/3' } })],
      [sub({ id: 'c', createdAt: 9, type: 'lah-team-formation' })],
    ])
    assert.deepEqual(rows.map((r) => r.id), ['b', 'a'])
    assert.equal(rows[0]!.url, 'https://github.com/o/r/pull/3')
    assert.equal(safeUrl('javascript:alert(1)'), null)
    assert.equal(safeUrl('http://x.test'), null)
    assert.equal(safeUrl(undefined), null)
  })
})

describe('multi-name voice tables', () => {
  it('a key belongs to the longest matching name of the table', () => {
    const names = resourceNames('ryekie, ryekie_b')
    assert.deepEqual(names, ['ryekie', 'ryekie_b'])
    assert.equal(resourceOf('voice_ryekie_h_gachaResult_another', names), 'ryekie')
    assert.equal(resourceOf('voice_ryekie_b_action', names), 'ryekie_b')
    assert.equal(resourceOf('voice_other_action', names), null)
  })
})
