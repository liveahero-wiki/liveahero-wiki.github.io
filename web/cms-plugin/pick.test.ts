import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ELEMENT_IDS, elementIconUrl } from './elements.ts'
import { filterEntries, heroEntries, passiveEntries, searchIndex, sidekickEntries, type PickEntry } from './pick.ts'
import { buildRoster } from './roster.ts'

const roster = buildRoster({
  heroes: [
    { stockId: 10011, characterId: 1, name: { en: 'Akashi', ja: 'アカシ' }, resourceName: 'akashi', rarity: 6, baseRarity: 3, element: 1, role: 'attack', hasSkillTree: true, limited: false, isMob: false },
    { stockId: 10021, characterId: 2, name: { en: 'Kageyama' }, resourceName: 'kageyama', rarity: 5, element: 3, role: 'defense', hasSkillTree: false, limited: false, isMob: false },
    { stockId: 10031, characterId: 3, name: { en: 'Alan' }, resourceName: 'alan', rarity: 6, baseRarity: 5, element: 3, role: 'heal', hasSkillTree: false, limited: true, isMob: false },
  ],
  sidekicks: [
    { stockId: 10011, characterId: 1, name: { en: 'Akashi' }, resourceName: 'akashi', rarity: 4, limited: false, isMob: false },
    { stockId: 10021, characterId: 2, name: { en: 'Kageyama' }, resourceName: 'kageyama', rarity: 1, limited: false, isMob: false },
    { stockId: 10031, characterId: 3, name: { en: 'Alan' }, resourceName: 'alan', rarity: 3, limited: false, isMob: false },
  ],
  items: [{ itemId: 5, name: { en: 'Skill Book' }, resourceName: 'book' }],
})
const none = new Set<number>()
const f = (over: Partial<{ rarities: Set<number>; elements: Set<number>; query: string }> = {}) => ({ rarities: none, elements: none, query: '', ...over })
const idsOf = (list: PickEntry[]) => list.map((e) => e.id)

describe('picker entries', () => {
  it('heroes carry their base rarity (lowest of the stock; the maxed rarity for older rosters) and element', () => {
    const e = heroEntries(roster)
    assert.equal(e.length, 3)
    assert.equal(e[1].rarity, 5)
    assert.deepEqual(e[0], { id: 10011, kind: 'hero', rarity: 3, element: 1, resourceName: 'akashi', name: { en: 'Akashi', ja: 'アカシ' } })
  })
  it('heroes leave out the event-only units (stockId 90000 and up)', () => {
    const r = buildRoster({ heroes: [...roster.heroes, { ...roster.heroes[0], stockId: 90011, name: { en: 'Akashi (+Custom)' } }], sidekicks: [], items: [] })
    assert.deepEqual(idsOf(heroEntries(r)), [10011, 10021, 10031])
    assert.ok(r.hero(90011)) // still resolvable for teams that already hold it
  })
  it('sidekicks leave out the hero own character and the excluded ids', () => {
    assert.deepEqual(idsOf(sidekickEntries(roster, { excludeCharacter: 1 })), [10021, 10031])
    assert.deepEqual(idsOf(sidekickEntries(roster, { exclude: [10031] })), [10011, 10021])
  })
  it('passives are the items then the sidekicks, without the ones already taken', () => {
    const e = passiveEntries(roster, { exclude: [10021, 5] })
    assert.deepEqual(e.map((x) => `${x.kind}:${x.id}`), ['sidekick:10011', 'sidekick:10031'])
    assert.equal(passiveEntries(roster)[0].kind, 'item')
  })
})

describe('filterEntries', () => {
  const heroes = heroEntries(roster)
  it('lists the newest (highest id) first, items ahead', () => {
    assert.deepEqual(idsOf(filterEntries(heroes, f(), 'en')), [10031, 10021, 10011])
    assert.equal(filterEntries(passiveEntries(roster), f(), 'en')[0].kind, 'item')
  })
  it('filters by rarity and element together', () => {
    assert.deepEqual(idsOf(filterEntries(heroes, f({ rarities: new Set([5]) }), 'en')), [10031, 10021])
    assert.deepEqual(idsOf(filterEntries(heroes, f({ rarities: new Set([3]) }), 'en')), [10011])
    assert.deepEqual(idsOf(filterEntries(heroes, f({ rarities: new Set([3, 5]), elements: new Set([3]) }), 'en')), [10031, 10021])
  })
  it('a rarity filter leaves out the items (they have none)', () => {
    const e = filterEntries(passiveEntries(roster), f({ rarities: new Set([1, 3, 4]) }), 'en')
    assert.ok(e.every((x) => x.kind === 'sidekick'))
  })
  it('searches every language, the file name and the id, names starting with the query first', () => {
    assert.deepEqual(idsOf(filterEntries(heroes, f({ query: 'アカ' }), 'en')), [10011])
    assert.deepEqual(idsOf(filterEntries(heroes, f({ query: 'KAGE' }), 'en')), [10021])
    assert.deepEqual(idsOf(filterEntries(heroes, f({ query: '10031' }), 'en')), [10031])
    // "a": Akashi and Alan start with it, Kageyama only contains it
    assert.deepEqual(idsOf(filterEntries(heroes, f({ query: 'a' }), 'en')), [10011, 10031, 10021])
  })
  it('gives the same result with a prebuilt index, and does not mutate the entries', () => {
    const copy = [...heroes]
    const q = f({ query: 'a', rarities: new Set([5]) })
    assert.deepEqual(idsOf(filterEntries(heroes, q, 'en', searchIndex(heroes))), idsOf(filterEntries(heroes, q, 'en')))
    assert.deepEqual(heroes, copy)
  })
})

describe('elements', () => {
  it('has an icon for each of the 5 elements', () => {
    assert.equal(ELEMENT_IDS.length, 5)
    const urls = ELEMENT_IDS.map(elementIconUrl)
    assert.equal(new Set(urls).size, 5)
    assert.ok(urls[0].endsWith('/icon_element_fire.webp'))
    assert.ok(urls[4].endsWith('/icon_element_shadow.webp'))
  })
})
