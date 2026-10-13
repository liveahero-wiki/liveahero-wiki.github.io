import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  HASH_KEYS, activeCount, addId, defaultFilterState, limitedCount, parseParams, removeId, setMaxLimited, testPayload, toParams, toggleTarget, type FilterState,
} from './filters.ts'
import { buildRoster } from './roster.ts'

const slot = (stockId: number, extra: Record<string, unknown> = {}) => ({ stockId, lv: 60, plv: 0, fans: 0, engrave: 0, bloom: false, skillTree: false, active: null, passives: [], ...extra })
const team = (heroes: Record<string, unknown>[], extra: Record<string, unknown> = {}) => ({ v: 1, supportIndex: null, heroes, ...extra })
const state = (patch: Partial<FilterState> = {}): FilterState => ({ ...defaultFilterState(), ...patch })

const roster = buildRoster({
  heroes: [1, 2, 3, 4, 5].map((stockId) => ({ stockId, characterId: stockId, name: { en: `H${stockId}` }, resourceName: 'x', rarity: 5, element: 1, role: 'attack', hasSkillTree: true, limited: stockId <= 2 })),
  sidekicks: [{ stockId: 1, characterId: 1, name: { en: 'S1' }, resourceName: 'x', rarity: 4, limited: true }],
})

describe('hash params', () => {
  it('the default state has no params, and an empty hash is the default state', () => {
    assert.deepEqual(toParams(defaultFilterState()), {})
    assert.deepEqual(parseParams(new URLSearchParams('')), defaultFilterState())
  })
  it('round-trips every key', () => {
    const s = state({ targets: ['quest-616001', 'rogue-2609'], heroIn: [12641, 10011], heroOut: [20021], skIn: [12641], skOut: [10021, 10031], tree: false, bloom: false, maxLimited: 2 })
    const params = toParams(s)
    assert.deepEqual(Object.keys(params).sort(), [...HASH_KEYS].sort())
    assert.deepEqual(params, { target: 'quest-616001,rogue-2609', hero: '12641,10011', xhero: '20021', sk: '12641', xsk: '10021,10031', tree: '0', bloom: '0', lim: '2' })
    assert.deepEqual(parseParams(new URLSearchParams(params)), s)
  })
  it('lim=0 is kept, lim=5 is the default and is not written', () => {
    assert.deepEqual(toParams(state({ maxLimited: 0 })), { lim: '0' })
    assert.deepEqual(toParams(state({ maxLimited: 5 })), {})
    assert.equal(parseParams(new URLSearchParams('lim=0')).maxLimited, 0)
  })
  it('deep links from the chara pages', () => {
    assert.deepEqual(parseParams(new URLSearchParams('hero=12641')).heroIn, [12641])
    assert.deepEqual(parseParams(new URLSearchParams('sk=12641')).skIn, [12641])
    assert.deepEqual(parseParams(new URLSearchParams('target=quest-616001')).targets, ['quest-616001'])
  })
  it('is lenient: bad values fall back, duplicates collapse, lists are capped', () => {
    const s = parseParams(new URLSearchParams('hero=abc,12,12,-3,0,1.5,&xhero=12,7&lim=9&tree=1&bloom=x&target=Bad Id,ok-1,ok-1'))
    assert.deepEqual(s.heroIn, [12])
    assert.deepEqual(s.heroOut, [7]) // 12 is required, so it cannot also be excluded
    assert.equal(s.maxLimited, 5)
    assert.equal(s.tree, true)
    assert.equal(s.bloom, true)
    assert.deepEqual(s.targets, ['ok-1'])
    const many = Array.from({ length: 40 }, (_, i) => i + 1).join(',')
    assert.equal(parseParams(new URLSearchParams({ hero: many })).heroIn.length, 12)
    assert.equal(parseParams(new URLSearchParams('lim=abc')).maxLimited, 5)
    assert.equal(parseParams(new URLSearchParams('lim=-1')).maxLimited, 5)
  })
})

describe('state transitions', () => {
  it('toggleTarget adds and removes', () => {
    const a = toggleTarget(state(), 'a')
    assert.deepEqual(toggleTarget(a, 'b').targets, ['a', 'b'])
    assert.deepEqual(toggleTarget(a, 'a').targets, [])
  })
  it('addId moves an id out of the opposite list and ignores duplicates', () => {
    let s = addId(state({ heroOut: [5, 6] }), 'heroIn', 5)
    assert.deepEqual([s.heroIn, s.heroOut], [[5], [6]])
    assert.equal(addId(s, 'heroIn', 5), s)
    s = addId(state({ skIn: [9] }), 'skOut', 9)
    assert.deepEqual([s.skIn, s.skOut], [[], [9]])
    assert.deepEqual(removeId(s, 'skOut', 9).skOut, [])
  })
  it('setMaxLimited clamps to 0..5', () => {
    assert.equal(setMaxLimited(state(), -2).maxLimited, 0)
    assert.equal(setMaxLimited(state(), 9).maxLimited, 5)
    assert.equal(setMaxLimited(state(), 2.7).maxLimited, 2)
  })
  it('activeCount counts the advanced-part filters only', () => {
    assert.equal(activeCount(defaultFilterState()), 0)
    assert.equal(activeCount(state({ targets: ['a'], heroIn: [1] })), 0)
    assert.equal(activeCount(state({ tree: false, bloom: false, maxLimited: 3 })), 3)
  })
})

describe('testPayload', () => {
  const t = (p: unknown, s: Partial<FilterState> = {}) => testPayload(p, state(s), roster)

  it('the default state matches everything, even malformed payloads', () => {
    assert.equal(t(team([slot(1)])), true)
    assert.equal(t(null), true)
    assert.equal(t({}), true)
  })
  it('target: any of; a team without a target never matches a target filter', () => {
    const p = team([slot(1)], { target: 'quest-616001' })
    assert.equal(t(p, { targets: ['quest-616001'] }), true)
    assert.equal(t(p, { targets: ['rogue-2609', 'quest-616001'] }), true)
    assert.equal(t(p, { targets: ['rogue-2609'] }), false)
    assert.equal(t(team([slot(1)]), { targets: ['quest-616001'] }), false)
    assert.equal(t(team([slot(1)], { target: null }), { targets: ['quest-616001'] }), false)
    assert.equal(t(team([slot(1)]), { targets: [] }), true)
  })
  it('hero include (every listed) and exclude (none), the support slot included', () => {
    const p = team([slot(1), slot(2), slot(3)], { supportIndex: 2 })
    assert.equal(t(p, { heroIn: [1] }), true)
    assert.equal(t(p, { heroIn: [1, 3] }), true) // 3 is the borrowed support
    assert.equal(t(p, { heroIn: [1, 4] }), false)
    assert.equal(t(p, { heroOut: [4] }), true)
    assert.equal(t(p, { heroOut: [3] }), false) // excluded even when borrowed
    assert.equal(t(p, { heroIn: [1], heroOut: [2] }), false)
  })
  it('active sidekick include and exclude look at active sidekicks only', () => {
    const p = team([slot(1, { active: 10, passives: [30] }), slot(2, { active: 20 })], { supportIndex: 1 })
    assert.equal(t(p, { skIn: [10] }), true)
    assert.equal(t(p, { skIn: [20] }), true) // the support slot counts
    assert.equal(t(p, { skIn: [30] }), false) // passive
    assert.equal(t(p, { skOut: [20] }), false)
    assert.equal(t(p, { skOut: [30] }), true)
    assert.equal(t(team([slot(1)]), { skIn: [10] }), false)
  })
  it('tree=false and bloom=false hide a team if any slot needs it, the support slot included', () => {
    const p = team([slot(1), slot(2, { skillTree: true })], { supportIndex: 1 })
    assert.equal(t(p), true)
    assert.equal(t(p, { tree: false }), false)
    assert.equal(t(p, { bloom: false }), true)
    const b = team([slot(1, { bloom: true }), slot(2)], { supportIndex: 0 })
    assert.equal(t(b, { bloom: false }), false)
    assert.equal(t(b, { tree: false }), true)
    assert.equal(t(team([slot(1), slot(2)]), { tree: false, bloom: false }), true)
  })
  it('maxLimited counts every slot, the support slot included', () => {
    const p = team([slot(1), slot(2), slot(4)], { supportIndex: 1 }) // heroes 1 and 2 are limited
    assert.equal(t(p, { maxLimited: 2 }), true)
    assert.equal(t(p, { maxLimited: 1 }), false)
    assert.equal(t(p, { maxLimited: 0 }), false)
    assert.equal(t(team([slot(4), slot(5)]), { maxLimited: 0 }), true)
    assert.equal(t(p, { maxLimited: 5 }), true)
  })
  it('without a roster nothing is limited', () => {
    assert.equal(testPayload(team([slot(1), slot(2)]), state({ maxLimited: 0 }), null), true)
  })
  it('all filters combine (AND)', () => {
    const p = team([slot(1), slot(4)], { target: 'quest-616001' })
    assert.equal(t(p, { targets: ['quest-616001'], heroIn: [1], maxLimited: 1 }), true)
    assert.equal(t(p, { targets: ['quest-616001'], heroIn: [1], maxLimited: 0 }), false)
  })
})

describe('limitedCount', () => {
  it('counts limited heroes in every slot; unknown ids and sidekicks do not count', () => {
    assert.equal(limitedCount(team([slot(1), slot(2), slot(4), slot(99, { active: 1 })]), roster), 2)
    assert.equal(limitedCount(team([]), roster), 0)
    assert.equal(limitedCount(null, roster), 0)
    assert.equal(limitedCount(team([slot(1)]), null), 0)
  })
})
