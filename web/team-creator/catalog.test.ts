import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HASH_KEYS, parseParams, toParams } from '../cms-plugin/filters.ts'
import {
  CORE_KEYS,
  TAG_PREFIX,
  activeCoreCount,
  emptyState,
  filterItems,
  matchesQuery,
  matchesTags,
  normalizeSearch,
  parseHash,
  serializeHash,
  sortItems,
  type CatalogState,
} from './catalog.ts'

const tagDefs = [
  { key: 'teamType', options: [{ value: 'manual' }, { value: 'auto' }] },
  { key: 'successRate', options: [{ value: 'high' }, { value: 'medium' }, { value: 'low' }] },
]
const item = (id: string, createdAt: number, over: Record<string, unknown> = {}) => ({
  id,
  createdAt,
  title: `Team ${id}`,
  lang: 'en' as const,
  tags: { teamType: 'manual', successRate: 'high' } as Record<string, string>,
  payload: { n: Number(id.replace(/\D/g, '')) || 0 } as unknown,
  ...over,
})

describe('search', () => {
  it('is case-insensitive, NFKC-normalised and matches every word', () => {
    assert.equal(normalizeSearch('  ＳＳＳ   Team '), 'sss team')
    assert.equal(matchesQuery('SSS Lantern 3-turn clear', 'lantern sss'), true)
    assert.equal(matchesQuery('SSS Lantern 3-turn clear', 'ＬＡＮＴＥＲＮ'), true)
    assert.equal(matchesQuery('SSS Lantern', 'lantern auto'), false)
    assert.equal(matchesQuery('三回合通关', '回合'), true)
    assert.equal(matchesQuery('', ''), true)
    assert.equal(matchesQuery('', 'x'), false)
  })
})

describe('tag matching', () => {
  it('is "any of" within a tag and "all" across tags; empty selections are ignored', () => {
    const t = { teamType: 'auto', successRate: 'low' }
    assert.equal(matchesTags(t, {}), true)
    assert.equal(matchesTags(t, { teamType: [] }), true)
    assert.equal(matchesTags(t, { teamType: ['manual', 'auto'] }), true)
    assert.equal(matchesTags(t, { teamType: ['manual'] }), false)
    assert.equal(matchesTags(t, { teamType: ['auto'], successRate: ['high', 'medium'] }), false)
    assert.equal(matchesTags({}, { teamType: ['auto'] }), false)
  })
})

describe('hash', () => {
  it('round-trips core state and leaves unknown keys to the plugin', () => {
    const { core, rest } = parseHash('#q=sss%20auto&sort=oldest&lang=ja&t.teamType=manual,auto&hero=12641&xhero=1,2&tree=0', tagDefs)
    assert.deepEqual(core, { q: 'sss auto', sort: 'oldest', lang: 'ja', tags: { teamType: ['manual', 'auto'] } })
    assert.deepEqual(Object.fromEntries(rest), { hero: '12641', xhero: '1,2', tree: '0' })
    assert.equal(serializeHash(core, Object.fromEntries(rest)), '#q=sss%20auto&sort=oldest&lang=ja&t.teamType=manual,auto&hero=12641&xhero=1,2&tree=0')
  })
  it('omits defaults and returns an empty string when nothing is set', () => {
    assert.equal(serializeHash(emptyState()), '')
    assert.equal(serializeHash({ ...emptyState(), q: '  ' }), '')
    assert.equal(serializeHash(emptyState(), { target: 'quest-616001' }), '#target=quest-616001')
  })
  it('drops unknown tag keys, unknown tag values and unknown languages; accepts a hash without #', () => {
    const { core } = parseHash('t.nope=x&t.teamType=bogus&t.successRate=low,bogus&lang=xx&q=a', tagDefs)
    assert.deepEqual(core, { q: 'a', sort: 'newest', lang: 'all', tags: { successRate: ['low'] } })
    assert.deepEqual(parseHash('', tagDefs).core, emptyState())
    assert.deepEqual(parseHash('#', tagDefs).core, emptyState())
  })
  it('handles percent-encoded commas and encodes awkward search text', () => {
    assert.deepEqual(parseHash('#t.successRate=high%2Clow', tagDefs).core.tags, { successRate: ['high', 'low'] })
    const s = serializeHash({ ...emptyState(), q: 'a&b=c#d' })
    assert.equal(parseHash(s, tagDefs).core.q, 'a&b=c#d')
  })
  it('core hash keys do not overlap the plugin filter keys', () => {
    for (const k of HASH_KEYS) {
      assert.ok(!(CORE_KEYS as readonly string[]).includes(k), k)
      assert.ok(!k.startsWith(TAG_PREFIX), k)
    }
  })
  it('keeps the plugin filter params through a parse/serialize round trip', () => {
    const hash = '#q=x&t.teamType=auto&target=quest-616001&hero=12641&xhero=1,2&sk=7&xsk=8&tree=0&bloom=0&lim=2'
    const { core, rest } = parseHash(hash, tagDefs)
    const pluginParams = toParams(parseParams(rest))
    const again = parseHash(serializeHash(core, pluginParams), tagDefs)
    assert.deepEqual(again.core, core)
    assert.deepEqual(toParams(parseParams(again.rest)), pluginParams)
    for (const k of ['target', 'hero', 'xhero', 'sk', 'xsk', 'tree', 'bloom', 'lim']) assert.ok(k in pluginParams, k)
  })
})

describe('sorting and filtering', () => {
  const items = [item('3', 3000), item('2', 2000), item('1', 1000)]
  it('newest (default and unknown keys), oldest, and plugin sorts with newest as the tie-break', () => {
    assert.deepEqual(sortItems(items, 'newest').map((i) => i.id), ['3', '2', '1'])
    assert.deepEqual(sortItems(items, 'bogus').map((i) => i.id), ['3', '2', '1'])
    assert.deepEqual(sortItems(items, 'oldest').map((i) => i.id), ['1', '2', '3'])
    const byParity = { key: 'parity', compare: (a: unknown, b: unknown) => ((a as { n: number }).n % 2) - ((b as { n: number }).n % 2) }
    assert.deepEqual(sortItems(items, 'parity', [byParity]).map((i) => i.id), ['2', '3', '1'])
    assert.deepEqual(items.map((i) => i.id), ['3', '2', '1']) // input is not mutated
  })
  it('combines title, language, tags and the plugin test', () => {
    const list = [
      item('1', 1, { title: 'SSS auto', tags: { teamType: 'auto', successRate: 'low' } }),
      item('2', 2, { title: 'SSS manual', lang: 'ja' }),
      item('3', 3, { title: '', payload: { n: 9 } }),
    ]
    const state = (over: Partial<CatalogState>): CatalogState => ({ ...emptyState(), ...over })
    assert.deepEqual(filterItems(list, state({ q: 'sss' })).map((i) => i.id), ['1', '2'])
    assert.deepEqual(filterItems(list, state({ lang: 'ja' })).map((i) => i.id), ['2'])
    assert.deepEqual(filterItems(list, state({ tags: { teamType: ['auto'] } })).map((i) => i.id), ['1'])
    assert.deepEqual(filterItems(list, state({}), { test: (p) => (p as { n: number }).n === 9 }).map((i) => i.id), ['3'])
    assert.deepEqual(filterItems(list, state({ q: 'zzz' })), [])
  })
  it('counts active core filters', () => {
    assert.deepEqual(activeCoreCount(emptyState()), { basic: 0, advanced: 0 })
    assert.deepEqual(activeCoreCount({ q: 'x', sort: 'oldest', lang: 'ja', tags: { teamType: ['auto'], successRate: [] } }), { basic: 1, advanced: 2 })
  })
})
