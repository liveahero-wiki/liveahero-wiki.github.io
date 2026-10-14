import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildRoster, entryId, heroIconUrl, itemIconUrl, loadRoster, localizedName, passiveKind, searchText, setRosterSource, sidekickIconUrl } from './roster.ts'
import type { RosterFile } from './types.ts'

const file: RosterFile = {
  version: 't',
  heroes: [{ stockId: 10011, characterId: 1, name: { en: 'Akashi', ja: 'アカシ', 'zh-Hans': '赤司' }, resourceName: 'akashi', rarity: 6, element: 1, role: 'attack', hasSkillTree: true }],
  sidekicks: [{ stockId: 10011, characterId: 1, name: { ja: 'アカシ' }, resourceName: 'akashi', rarity: 4 }],
  items: [{ itemId: 65, name: { en: 'Second Attack Manual', ja: 'セカンド・アタックの技術書' }, resourceName: 'equipskill_auto_2ndAttack' }],
}

describe('roster', () => {
  it('builds lookups by stockId, separately for heroes and sidekicks', () => {
    const r = buildRoster(file)
    assert.equal(r.hero(10011)?.resourceName, 'akashi')
    assert.equal(r.sidekick(10011)?.rarity, 4)
    assert.equal(r.hero(1), undefined)
  })
  it('looks items up by itemId and tolerates a roster without items', () => {
    const r = buildRoster(file)
    assert.equal(r.item(65)?.resourceName, 'equipskill_auto_2ndAttack')
    assert.equal(r.item(10011), undefined)
    assert.deepEqual(buildRoster({ ...file, items: undefined }).items, [])
  })
  it('classifies a passive id: roster first, then by id range', () => {
    const r = buildRoster(file)
    assert.equal(passiveKind(r, 65), 'item')
    assert.equal(passiveKind(r, 10011), 'sidekick')
    assert.equal(passiveKind(null, 80), 'item') // no roster: items have small ids
    assert.equal(passiveKind(undefined, 10431), 'sidekick')
  })
  it('localizes names with the fallback chain lang -> ja -> en', () => {
    const n = file.heroes[0].name
    assert.equal(localizedName(n, 'zh-Hans'), '赤司')
    assert.equal(localizedName(n, 'zh-Hant'), 'アカシ') // missing -> ja
    assert.equal(localizedName(file.sidekicks[0].name, 'en'), 'アカシ')
    assert.equal(localizedName({ en: 'X' }, 'ja'), 'X')
    assert.equal(localizedName(undefined, 'en'), '')
  })
  it('items search by name, resourceName and itemId', () => {
    const item = file.items![0]
    assert.equal(entryId(item), 65)
    const t = searchText(item)
    for (const needle of ['second attack manual', 'セカンド', 'equipskill_auto_2ndattack', '65']) assert.ok(t.includes(needle), needle)
  })
  it('search text covers every language, resourceName and stockId', () => {
    const t = searchText(file.heroes[0])
    for (const needle of ['akashi', 'アカシ', '赤司', '10011']) assert.ok(t.includes(needle.toLowerCase()), needle)
  })
  it('icon urls are absolute wiki CDN urls', () => {
    assert.equal(heroIconUrl('akashi'), 'https://liveahero-wiki.github.io/cdn/Sprite/icon_akashi_h01.png')
    assert.equal(sidekickIconUrl('akashi'), 'https://liveahero-wiki.github.io/cdn/Sprite/icon_akashi_s01.png')
    assert.equal(itemIconUrl('equipskill_exp'), 'https://liveahero-wiki.github.io/cdn/Sprite/item_equipskill_exp.png')
  })
  it('loadRoster is memoized and can be overridden', async () => {
    setRosterSource(file)
    const a = loadRoster()
    assert.equal(a, loadRoster())
    assert.equal((await a).heroes.length, 1)
    setRosterSource(null)
  })
  it('the default URL resolves from the module URL to /api/team-roster.json', () => {
    // plugin lives at /assets/cms/lah-team-formation.js
    assert.equal(new URL('../../api/team-roster.json', 'https://x.example/assets/cms/lah-team-formation.js').pathname, '/api/team-roster.json')
  })
})
