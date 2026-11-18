import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { clearDraft, isBlankTeam, loadDraft, remixTeam, saveDraft } from './draft.ts'
import { defaultTeamPayload } from '../cms-plugin/default-team.ts'
import { initState, toPayload } from '../cms-plugin/editor-state.ts'
import { buildRoster } from '../cms-plugin/roster.ts'
import type { TeamPayload } from '../cms-plugin/types.ts'

const blankSlot = { stockId: 0, lv: 60, plv: 0, fans: 0, engrave: 0, bloom: false, skillTree: false, active: null, passives: [] }
const team = (over: Partial<TeamPayload> = {}): TeamPayload => ({ v: 1, supportIndex: null, heroes: [blankSlot], ...over })

describe('isBlankTeam', () => {
  it('treats nothing and a default single slot as blank', () => {
    assert.ok(isBlankTeam(null))
    assert.ok(isBlankTeam(team()))
  })
  it('keeps anything the user entered', () => {
    assert.equal(isBlankTeam(team({ heroes: [{ ...blankSlot, stockId: 5 }] })), false)
    assert.equal(isBlankTeam(team({ heroes: [{ ...blankSlot, fans: 1 }] })), false)
    assert.equal(isBlankTeam(team({ heroes: [blankSlot, blankSlot] })), false)
    assert.equal(isBlankTeam(team({ target: 'quest-1' })), false)
    assert.equal(isBlankTeam(team({ supportIndex: 0 })), false)
  })
})

describe('default team', () => {
  it('is blank (nothing worth a confirmation), until it is edited', () => {
    assert.ok(isBlankTeam(defaultTeamPayload()))
    const edited = defaultTeamPayload()
    edited.heroes[0].fans = 10
    assert.equal(isBlankTeam(edited), false)
    assert.equal(isBlankTeam({ ...defaultTeamPayload(), target: 'quest-1' }), false)
  })
  it('is what a fresh editor emits', () => {
    assert.deepEqual(toPayload(initState(undefined, { support: 'optional' }), true), defaultTeamPayload())
  })
})

describe('remixTeam', () => {
  const roster = buildRoster({
    heroes: [{ stockId: 10011, characterId: 1, name: { en: 'Akashi' }, resourceName: 'akashi', rarity: 6, element: 1, role: 'attack', hasSkillTree: true, limited: false, isMob: false }],
    sidekicks: [],
    items: [],
  })
  const opts = { support: 'optional' }
  const published = { v: 1, supportIndex: null, heroes: [{ ...blankSlot, stockId: 10011, fans: 5 }] }
  it('returns a validated copy that shares nothing with the list', () => {
    const copy = remixTeam(published, opts, roster)!
    assert.equal(copy.heroes[0].stockId, 10011)
    assert.equal(copy.heroes[0].fans, 5)
    assert.notEqual(copy, published)
    assert.notEqual(copy.heroes[0], published.heroes[0])
  })
  it('rejects what no longer validates', () => {
    assert.equal(remixTeam(null, opts, roster), null)
    assert.equal(remixTeam('x', opts, roster), null)
    assert.equal(remixTeam({ ...published, v: 2 }, opts, roster), null)
    assert.equal(remixTeam({ ...published, heroes: [] }, opts, roster), null)
    assert.equal(remixTeam({ ...published, heroes: [{ ...blankSlot, stockId: 99999 }] }, opts, roster), null)
  })
})

describe('draft storage', () => {
  it('survives a missing or throwing localStorage', () => {
    assert.equal(loadDraft(), null) // node has no localStorage
    assert.doesNotThrow(() => saveDraft(team()))
    assert.doesNotThrow(() => clearDraft())
  })
  it('keeps the draft in memory when storage fails', () => {
    const t = team({ heroes: [{ ...blankSlot, stockId: 7 }] })
    saveDraft(t) // node has no localStorage
    assert.deepEqual(loadDraft(), t)
    clearDraft()
    assert.equal(loadDraft(), null)
  })
  it('round-trips and ignores junk', () => {
    const data = new Map<string, string>()
    Object.assign(globalThis, {
      localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) },
    })
    try {
      const t = team({ heroes: [{ ...blankSlot, stockId: 9 }] })
      saveDraft(t)
      assert.deepEqual(loadDraft(), t)
      data.set('lah-tc-draft', '{"v":2}')
      assert.equal(loadDraft(), null)
      data.set('lah-tc-draft', 'not json')
      assert.equal(loadDraft(), null)
      for (const bad of [{ v: 1, heroes: [] }, { v: 1, heroes: [null] }, { v: 1, heroes: [{ stockId: 1 }] }]) {
        data.set('lah-tc-draft', JSON.stringify(bad))
        assert.equal(loadDraft(), null)
      }
      saveDraft(t)
      clearDraft()
      assert.equal(loadDraft(), null)
    } finally {
      Reflect.deleteProperty(globalThis, 'localStorage')
    }
  })
})
