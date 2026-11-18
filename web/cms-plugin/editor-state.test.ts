import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { defaultTeamPayload } from './default-team.ts'
import { battleSlots, clearSlot, initState, moveSlot, patchSlot, payloadRows, relPath, selectTarget, sortErrors, sortedJson, setSupportOn, setSupportRow, toPayload, type State } from './editor-state.ts'
import { validateTeam } from './validate.ts'

const OPT = { support: 'optional' }
const ids = (s: State) => s.slots.map((x) => x.stockId)
const supportId = (s: State) => {
  const p = toPayload(s, true)
  return p.supportIndex === null ? null : p.heroes[p.supportIndex].stockId
}
/** Heroes 1..4 in rows 1-4, row 4 is the support. */
const four = (options: Record<string, unknown> = OPT): State =>
  initState({ v: 1, supportIndex: 3, heroes: [1, 2, 3, 4].map((stockId) => ({ stockId })) }, options)

describe('default team', () => {
  it('has 5 rows: Akashi in row 1 at Lv 60, the others empty, the support role on row 4', () => {
    const s = initState(undefined, OPT)
    assert.deepEqual(ids(s), [10011, 0, 0, 0, 0])
    assert.equal(s.slots[0].lv, 60)
    assert.equal(s.supportOn, true)
    assert.equal(s.supportKey, s.slots[3].key)
  })
  it('emits just Akashi, and no support (an empty support row is none)', () => {
    const p = toPayload(initState(undefined, OPT), true)
    assert.equal(p.heroes.length, 1)
    assert.equal(p.supportIndex, null)
  })
  it('is the same team as defaultTeamPayload()', () => {
    assert.equal(sortedJson(toPayload(initState(undefined, OPT), true)), sortedJson(defaultTeamPayload()))
  })
  it('replaces a blank team (no hero in any slot) with the default team', () => {
    const s = initState({ v: 1, supportIndex: null, heroes: [{ stockId: 0 }] }, OPT)
    assert.deepEqual(ids(s), [10011, 0, 0, 0, 0])
  })
  it('has no support role in mode none', () => {
    const s = initState(undefined, { support: false })
    assert.equal(s.supportKey, null)
    assert.equal(s.supportOn, false)
  })
  it('hero focus puts that hero in row 1 of a blank editor only', () => {
    const opts = { ...OPT, focus: { kind: 'hero', stockId: 10251 } }
    assert.deepEqual(ids(initState(undefined, opts)), [10251, 0, 0, 0, 0])
    assert.deepEqual(ids(initState({ v: 1, supportIndex: null, heroes: [{ stockId: 7 }] }, opts)), [7, 0, 0, 0, 0])
  })
  it('sidekick focus changes nothing', () => {
    assert.deepEqual(ids(initState(undefined, { ...OPT, focus: { kind: 'sidekick', stockId: 10251 } })), [10011, 0, 0, 0, 0])
  })
})

describe('initState', () => {
  it('loads the heroes into the first rows and pads to 5', () => {
    const s = four()
    assert.deepEqual(ids(s), [1, 2, 3, 4, 0])
  })
  it('keeps an incoming support on its row, and none when there is none', () => {
    assert.equal(supportId(four()), 4)
    const none = initState({ v: 1, supportIndex: null, heroes: [1, 2, 3, 4].map((stockId) => ({ stockId })) }, OPT)
    assert.equal(none.supportOn, false)
    assert.equal(none.supportKey, none.slots[3].key) // remembered for when the switch goes on
    assert.equal(toPayload(none, true).supportIndex, null)
  })
  it('mode required is always on, with no row chosen for an incoming team without support', () => {
    const s = initState({ v: 1, supportIndex: null, heroes: [1, 2].map((stockId) => ({ stockId })) }, { support: true })
    assert.equal(s.supportOn, true)
    assert.equal(s.supportKey, null)
  })
  it('caps at 5 rows', () => {
    const s = initState({ v: 1, supportIndex: 0, heroes: [1, 2, 3, 4, 5, 6, 7].map((stockId) => ({ stockId })) }, OPT)
    assert.equal(s.slots.length, 5)
  })
  it('no support in mode none, even if the value had one', () => {
    const s = initState({ v: 1, supportIndex: 1, heroes: [{ stockId: 1 }, { stockId: 2 }] }, { support: false })
    assert.equal(toPayload(s, false).supportIndex, null)
  })
})

describe('compaction', () => {
  it('skips the empty rows: heroes in rows 1, 2, 5 and the support in row 4 become battle slots 1, 2, 3', () => {
    const s = initState({ v: 1, supportIndex: 3, heroes: [{ stockId: 1 }, { stockId: 2 }, { stockId: 0 }, { stockId: 4 }, { stockId: 5 }] }, OPT)
    assert.deepEqual(payloadRows(s), [0, 1, 3, 4])
    assert.deepEqual(battleSlots(s), [1, 2, null, 3, 4])
    const p = toPayload(s, true)
    assert.deepEqual(p.heroes.map((h) => h.stockId), [1, 2, 4, 5])
    assert.equal(p.supportIndex, 2)
  })
  it('an empty support row means no support', () => {
    const s = four()
    const emptied: State = { ...s, slots: s.slots.map((x, i) => (i === 3 ? { ...x, stockId: 0 } : x)) }
    assert.equal(emptied.supportKey, s.slots[3].key)
    assert.equal(toPayload(emptied, true).supportIndex, null)
    assert.deepEqual(toPayload(emptied, true).heroes.map((h) => h.stockId), [1, 2, 3])
  })
  it('a team without a hero emits one empty row, so the validator still asks for a hero', () => {
    const base = initState(undefined, OPT)
    const empty: State = { ...base, slots: base.slots.map((x) => ({ ...x, stockId: 0 })) }
    const p = toPayload(empty, true)
    assert.equal(p.heroes.length, 1)
    assert.equal(p.heroes[0].stockId, 0)
    assert.ok(validateTeam(p, OPT).some((e) => e.code === 'stock_id_invalid'))
  })
  it('allows the support in the first battle slot (the validator has no such rule)', () => {
    const s = initState({ v: 1, supportIndex: 0, heroes: [{ stockId: 1 }, { stockId: 2 }] }, OPT)
    assert.equal(toPayload(s, true).supportIndex, 0)
    assert.deepEqual(validateTeam(toPayload(s, true), OPT), [])
  })
})

describe('support follows its row', () => {
  it('reorders keep the role on the same row', () => {
    let s = four()
    s = moveSlot(s, 3, 0)
    assert.deepEqual(ids(s), [4, 1, 2, 3, 0])
    assert.equal(toPayload(s, true).supportIndex, 0)
    s = moveSlot(s, 0, 2)
    assert.deepEqual(ids(s), [1, 2, 4, 3, 0])
    assert.equal(supportId(s), 4)
    s = moveSlot(s, 0, 3)
    assert.deepEqual(ids(s), [2, 4, 3, 1, 0])
    assert.equal(toPayload(s, true).supportIndex, 1)
  })
  it('moving a row onto an empty row moves the empty one aside', () => {
    const s = moveSlot(four(), 0, 4)
    assert.deepEqual(ids(s), [2, 3, 4, 0, 1])
    assert.deepEqual(battleSlots(s), [1, 2, 3, null, 4])
  })
  it('ignores out-of-range / no-op moves', () => {
    const s = four()
    assert.equal(moveSlot(s, 1, 1), s)
    assert.equal(moveSlot(s, 0, 5), s)
    assert.equal(moveSlot(s, -1, 0), s)
  })
  it('setSupportRow gives the role to a row and switches the support on', () => {
    let s = setSupportOn(four(), false)
    s = setSupportRow(s, s.slots[1].key)
    assert.equal(s.supportOn, true)
    assert.equal(supportId(s), 2)
    assert.equal(setSupportRow(s, -1), s)
  })
  it('setSupportOn(false) means no support but remembers the row; on restores it', () => {
    let s = four()
    s = setSupportRow(s, s.slots[1].key)
    s = setSupportOn(s, false)
    assert.equal(toPayload(s, true).supportIndex, null)
    s = setSupportOn(s, true)
    assert.equal(supportId(s), 2)
    assert.equal(setSupportOn(s, true), s)
  })
  it('switching on without a remembered row picks row 4', () => {
    const s = setSupportOn({ ...four(), supportOn: false, supportKey: null }, true)
    assert.equal(s.supportKey, s.slots[3].key)
  })
  it('the support row is not emitted when allowsSupport is false', () => {
    assert.equal(toPayload(four(), false).supportIndex, null)
  })
})

describe('clearSlot', () => {
  it('empties the row but keeps its key and the support role', () => {
    const s = four()
    const sup = s.slots[3]
    const next = clearSlot(patchSlot(s, sup.key, { fans: 500, passives: [9] }), sup.key)
    assert.equal(next.slots[3].key, sup.key)
    assert.equal(next.slots[3].stockId, 0)
    assert.equal(next.slots[3].fans, 0)
    assert.deepEqual(next.slots[3].passives, [])
    assert.equal(next.supportKey, sup.key)
  })
  it('does nothing for an unknown key', () => {
    const s = four()
    assert.equal(clearSlot(s, -1), s)
    assert.equal(patchSlot(s, -1, { lv: 1 }), s)
  })
})

describe('validation of emitted payloads', () => {
  it('a team with heroes and no support is valid under optional (and asks for one under required)', () => {
    const s = initState(undefined, OPT)
    assert.deepEqual(validateTeam(toPayload(s, true), OPT), [])
    assert.deepEqual(validateTeam(toPayload(s, true), {}).map((e) => e.code), ['support_required'])
  })
})

describe('target', () => {
  it('is read from the incoming payload and emitted only when set', () => {
    const s = initState({ v: 1, supportIndex: 0, heroes: [{ stockId: 1 }], target: 'quest-616001' }, OPT)
    assert.equal(s.target, 'quest-616001')
    assert.equal(toPayload(s, true).target, 'quest-616001')
    const cleared = selectTarget(s, null)
    assert.equal('target' in toPayload(cleared, true), false)
    assert.equal(selectTarget(cleared, '').target, null)
    assert.equal(initState({ v: 1, heroes: [{ stockId: 1 }], target: 5 }, OPT).target, null)
  })
  it('survives row changes', () => {
    let s = selectTarget(initState(undefined, OPT), 'rogue-2609')
    s = moveSlot(s, 0, 2)
    s = clearSlot(s, s.slots[0].key)
    assert.equal(s.target, 'rogue-2609')
  })
  it('sortErrors puts payload.target errors in their own bucket', () => {
    const r = sortErrors([{ path: 'payload.target', code: 'target_unknown', message: 'x' }], [0])
    assert.equal(r.target.length, 1)
    assert.equal(r.team.length, 0)
  })
})

describe('error helpers', () => {
  it('relPath accepts both forms', () => {
    assert.equal(relPath('payload.heroes.1.lv'), 'heroes.1.lv')
    assert.equal(relPath('heroes.1.lv'), 'heroes.1.lv')
    assert.equal(relPath('payload'), '')
    assert.equal(relPath('payload.supportIndex'), 'supportIndex')
  })
  it('sortErrors buckets by team / support / slot field and maps payload heroes to editor rows', () => {
    const e = (path: string, code = 'x') => ({ path, code, message: code })
    const rows = [0, 1, 3, 4] // payload hero 2 is the editor's row 4
    const r = sortErrors(
      [e('payload.heroes'), e('payload'), e('payload.v'), e('payload.supportIndex'), e('payload.heroes.2.lv'), e('heroes.2.passives.1'), e('payload.heroes.2.passives'), e('payload.heroes.0'), e('payload.heroes.9.lv')],
      rows,
    )
    assert.equal(r.team.length, 3)
    assert.equal(r.support.length, 1)
    assert.equal(r.slots.get(3)!.get('lv')!.length, 1)
    assert.equal(r.slots.get(3)!.get('passives')!.length, 2)
    assert.equal(r.slots.get(0)!.get('')!.length, 1)
    assert.equal(r.slots.size, 2, 'an index past the payload is dropped')
  })
  it('puts the errors of a team without heroes on row 1', () => {
    const r = sortErrors([{ path: 'payload.heroes.0.stockId', code: 'stock_id_invalid', message: 'x' }], [])
    assert.equal(r.slots.get(0)!.get('stockId')!.length, 1)
  })
  it('sortedJson ignores key order', () => {
    assert.equal(sortedJson({ a: 1, b: { d: 1, c: [{ z: 1, y: 2 }] } }), sortedJson({ b: { c: [{ y: 2, z: 1 }], d: 1 }, a: 1 }))
  })
})

describe('derived bloom', () => {
  const bloomOf = (extra: Record<string, unknown>) =>
    toPayload(initState({ v: 1, heroes: [{ stockId: 1, ...extra }] }, { support: 'none' }), false).heroes[0].bloom
  it('is false with up to 2 passives and no skill tree', () => {
    assert.equal(bloomOf({ passives: [] }), false)
    assert.equal(bloomOf({ passives: [2, 3] }), false)
  })
  it('is true with 3 passives, and a stale bloom flag is overwritten', () => {
    assert.equal(bloomOf({ passives: [2, 3, 4] }), true)
    assert.equal(bloomOf({ bloom: true, passives: [2] }), false)
  })
  it('is always true when the skill tree is needed', () => {
    assert.equal(bloomOf({ skillTree: true, passives: [] }), true)
  })
  it('produces a payload the validator accepts with 3 passives', () => {
    const p = toPayload(initState({ v: 1, heroes: [{ stockId: 1, passives: [2, 3, 4] }] }, { support: 'none' }), false)
    assert.deepEqual(validateTeam(p, { support: 'none' }).filter((e) => e.code === 'passives_too_many'), [])
  })
})
