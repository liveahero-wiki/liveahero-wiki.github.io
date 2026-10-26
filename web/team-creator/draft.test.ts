import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { clearDraft, isBlankTeam, loadDraft, saveDraft } from './draft.ts'
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
