import assert from 'node:assert/strict'
import test from 'node:test'
import type { RosterHero, RosterSidekick } from '../cms-plugin/types.ts'
import { buildCandidates, DEFAULT_FILTER, filterCandidates } from './candidates.ts'

const hero = (stockId: number, en: string, extra: Partial<RosterHero> = {}): RosterHero => ({
  stockId, characterId: 1, name: { en, ja: en }, resourceName: `r${stockId}`, rarity: 6, element: 1, role: 'attack', hasSkillTree: false, ...extra,
})
const sidekick = (stockId: number, en: string, extra: Partial<RosterSidekick> = {}): RosterSidekick => ({
  stockId, characterId: 1, name: { en, ja: en }, resourceName: `r${stockId}`, rarity: 4, ...extra,
})

const roster = {
  heroes: [hero(10011, 'Akashi'), hero(10012, 'Akashi Summer'), hero(10411, 'Wolfman', { isMob: true, rarity: 1 }), hero(90821, 'Borealis')],
  sidekicks: [sidekick(10011, 'Akashi'), sidekick(10542, 'Guard Variant', { isMob: true })],
}
const keys = (f: Partial<typeof DEFAULT_FILTER>) => filterCandidates(buildCandidates(roster), { ...DEFAULT_FILTER, ...f }).map((c) => c.key)

test('the candidate set matches /charas/: stock ids from 90000 are left out', () => {
  assert.deepEqual(keys({}), ['h10011', 'h10012', 'h10411', 's10011', 's10542'])
})

test('variants are stock ids ending in 2 or above, mobs come from the roster flag', () => {
  const c = buildCandidates(roster)
  assert.deepEqual(c.filter((x) => x.isVariant).map((x) => x.key), ['h10012', 's10542'])
  assert.deepEqual(c.filter((x) => x.isMob).map((x) => x.key), ['h10411', 's10542'])
})

test('hide toggles and type filter', () => {
  assert.deepEqual(keys({ hideVariants: true }), ['h10011', 'h10411', 's10011'])
  assert.deepEqual(keys({ hideMobs: true }), ['h10011', 'h10012', 's10011'])
  assert.deepEqual(keys({ hideVariants: true, hideMobs: true }), ['h10011', 's10011'])
  assert.deepEqual(keys({ type: 'sidekick' }), ['s10011', 's10542'])
})

test('search matches any language name, resource name or id', () => {
  assert.deepEqual(keys({ query: ' summer ' }), ['h10012'])
  assert.deepEqual(keys({ query: 'r10542' }), ['s10542'])
  assert.deepEqual(keys({ query: 'nothing' }), [])
})
