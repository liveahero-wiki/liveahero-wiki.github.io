import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { addSlot, clearSupport, initState, moveSlot, relPath, removeSlot, selectSupport, selectTarget, sortErrors, sortedJson, toPayload, type Slot, type State } from './editor-state.ts'
import { validateTeam } from './validate.ts'

const ids = (s: State) => s.slots.map((x) => x.stockId)
const supportId = (s: State, allows = true) => {
  const p = toPayload(s, allows)
  return p.supportIndex === null ? null : p.heroes[p.supportIndex].stockId
}
const four = (options: Record<string, unknown> = {}): State =>
  initState({ v: 1, supportIndex: 3, heroes: [1, 2, 3, 4].map((stockId) => ({ stockId })) }, options)

describe('initState', () => {
  it('starts an empty editor with one empty slot, auto-selecting it as support', () => {
    const s = initState(undefined, {})
    assert.equal(s.slots.length, 1)
    assert.equal(s.slots[0].stockId, 0)
    assert.deepEqual(toPayload(s, true).supportIndex, 0)
    assert.equal(s.supportAuto, true)
  })
  it('hero focus prefills slot 1 only for an empty editor', () => {
    const opts = { focus: { kind: 'hero', stockId: 10251 } }
    assert.deepEqual(ids(initState(undefined, opts)), [10251])
    assert.deepEqual(ids(initState({ v: 1, supportIndex: 0, heroes: [{ stockId: 7 }] }, opts)), [7])
  })
  it('sidekick focus prefills nothing', () => {
    assert.deepEqual(ids(initState(undefined, { focus: { kind: 'sidekick', stockId: 10251 } })), [0])
  })
  it('no support: supportIndex is always null in the payload, even if the value had one', () => {
    const s = initState({ v: 1, supportIndex: 1, heroes: [{ stockId: 1 }, { stockId: 2 }] }, { support: false })
    assert.equal(toPayload(s, false).supportIndex, null)
  })
  it('keeps a valid incoming supportIndex', () => {
    const s = four()
    assert.equal(supportId(s), 4)
    assert.equal(s.supportAuto, false)
  })
  it('caps at 5 slots', () => {
    const s = initState({ v: 1, supportIndex: 0, heroes: [1, 2, 3, 4, 5, 6, 7].map((stockId) => ({ stockId })) }, {})
    assert.equal(s.slots.length, 5)
  })
})

describe('support follows its slot', () => {
  it('reorders (drag or buttons) keep supportIndex on the same slot', () => {
    let s = four()
    s = moveSlot(s, 3, 0)
    assert.deepEqual(ids(s), [4, 1, 2, 3])
    assert.equal(toPayload(s, true).supportIndex, 0)
    s = moveSlot(s, 0, 2)
    assert.deepEqual(ids(s), [1, 2, 4, 3])
    assert.equal(toPayload(s, true).supportIndex, 2)
    assert.equal(supportId(s), 4)
    // moving a different slot across the support shifts the index
    s = moveSlot(s, 0, 3)
    assert.deepEqual(ids(s), [2, 4, 3, 1])
    assert.equal(toPayload(s, true).supportIndex, 1)
  })
  it('ignores out-of-range / no-op moves', () => {
    const s = four()
    assert.equal(moveSlot(s, 1, 1), s)
    assert.equal(moveSlot(s, 0, 4), s)
    assert.equal(moveSlot(s, -1, 0), s)
  })
  it('removing the support slot clears the selection; removing another keeps it', () => {
    const s = four()
    const sup = s.slots[3].key
    const other = removeSlot(s, s.slots[0].key)
    assert.equal(supportId(other), 4)
    assert.equal(toPayload(other, true).supportIndex, 2)
    const cleared = removeSlot(s, sup)
    assert.equal(cleared.supportKey, null)
    assert.equal(toPayload(cleared, true).supportIndex, null)
  })
  it('never removes the last slot', () => {
    const s = initState(undefined, {})
    assert.equal(removeSlot(s, s.slots[0].key), s)
  })
  it('an auto-selected support follows the newest slot, an explicit one stays', () => {
    let s = initState(undefined, {})
    s = addSlot(s, true)
    s = addSlot(s, true)
    assert.equal(toPayload(s, true).supportIndex, 2)
    s = selectSupport(s, s.slots[0].key)
    s = addSlot(s, true)
    assert.equal(toPayload(s, true).supportIndex, 0)
    assert.equal(s.slots.length, 4)
  })
  it('after the support slot was removed, the next add selects the new last slot', () => {
    const s0 = four()
    const cleared = removeSlot(s0, s0.slots[3].key)
    const s = addSlot(cleared, true)
    assert.equal(toPayload(s, true).supportIndex, s.slots.length - 1)
  })
  it('add is capped at 5 and returns the same state', () => {
    let s = initState(undefined, {})
    for (let i = 0; i < 6; i++) s = addSlot(s, true)
    assert.equal(s.slots.length, 5)
    assert.equal(addSlot(s, true), s)
  })
  it('without support nothing is selected on add', () => {
    let s = initState(undefined, { support: false })
    s = addSlot(s, false)
    assert.equal(s.supportKey, null)
    assert.equal(toPayload(s, false).supportIndex, null)
  })
  it('emitted payloads satisfy the support rule once heroes are filled in', () => {
    let s = initState(undefined, {})
    s = addSlot(s, true)
    const filled: State = { ...s, slots: s.slots.map((x, i): Slot => ({ ...x, stockId: 100 + i })) }
    assert.deepEqual(validateTeam(toPayload(filled, true), {}), [])
  })
})

describe('support mode optional', () => {
  const opt = { support: 'optional' }
  it('a new editor has no support selected and adding slots never selects one', () => {
    let s = initState(undefined, opt)
    assert.equal(s.supportKey, null)
    s = addSlot(s, false)
    s = addSlot(s, false)
    assert.equal(s.supportKey, null)
    assert.equal(toPayload(s, true).supportIndex, null)
  })
  it('keeps an incoming support, which follows its slot', () => {
    let s = initState({ v: 1, supportIndex: 1, heroes: [{ stockId: 1 }, { stockId: 2 }] }, opt)
    assert.equal(supportId(s), 2)
    assert.equal(s.supportAuto, false)
    s = moveSlot(s, 1, 0)
    assert.equal(toPayload(s, true).supportIndex, 0)
  })
  it('"No borrowed support" clears the selection and stays cleared', () => {
    let s = initState({ v: 1, supportIndex: 0, heroes: [{ stockId: 1 }] }, opt)
    s = clearSupport(s)
    s = addSlot(s, false)
    assert.equal(toPayload(s, true).supportIndex, null)
    s = selectSupport(s, s.slots[1].key)
    assert.equal(toPayload(s, true).supportIndex, 1)
  })
  it('removing the support slot leaves none selected', () => {
    const s0 = initState({ v: 1, supportIndex: 1, heroes: [{ stockId: 1 }, { stockId: 2 }] }, opt)
    const s = addSlot(removeSlot(s0, s0.slots[1].key), false)
    assert.equal(s.supportKey, null)
  })
  it('an emitted payload without support is valid under optional (and not under required)', () => {
    let s = initState(undefined, opt)
    s = { ...s, slots: [{ ...s.slots[0], stockId: 7 }] }
    assert.deepEqual(validateTeam(toPayload(s, true), opt), [])
    assert.deepEqual(validateTeam(toPayload(s, true), {}).map((e) => e.code), ['support_required'])
  })
})

describe('target', () => {
  it('is read from the incoming payload and emitted only when set', () => {
    const s = initState({ v: 1, supportIndex: 0, heroes: [{ stockId: 1 }], target: 'quest-616001' }, {})
    assert.equal(s.target, 'quest-616001')
    assert.equal(toPayload(s, true).target, 'quest-616001')
    const cleared = selectTarget(s, null)
    assert.equal('target' in toPayload(cleared, true), false)
    assert.equal(selectTarget(cleared, '').target, null)
    assert.equal(initState({ v: 1, heroes: [{ stockId: 1 }], target: 5 }, {}).target, null)
  })
  it('survives slot changes', () => {
    let s = selectTarget(initState(undefined, {}), 'rogue-2609')
    s = addSlot(s, true)
    s = removeSlot(s, s.slots[0].key)
    assert.equal(s.target, 'rogue-2609')
  })
  it('sortErrors puts payload.target errors in their own bucket', () => {
    const r = sortErrors([{ path: 'payload.target', code: 'target_unknown', message: 'x' }])
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
  it('sortErrors buckets by team / support / slot field', () => {
    const e = (path: string, code = 'x') => ({ path, code, message: code })
    const r = sortErrors([
      e('payload.heroes'),
      e('payload'),
      e('payload.v'),
      e('payload.supportIndex'),
      e('payload.heroes.2.lv'),
      e('heroes.2.passives.1'),
      e('payload.heroes.2.passives'),
      e('payload.heroes.0'),
    ])
    assert.equal(r.team.length, 3)
    assert.equal(r.support.length, 1)
    assert.equal(r.slots.get(2)!.get('lv')!.length, 1)
    assert.equal(r.slots.get(2)!.get('passives')!.length, 2)
    assert.equal(r.slots.get(0)!.get('')!.length, 1)
  })
  it('sortedJson ignores key order', () => {
    assert.equal(sortedJson({ a: 1, b: { d: 1, c: [{ z: 1, y: 2 }] } }), sortedJson({ b: { c: [{ y: 2, z: 1 }], d: 1 }, a: 1 }))
  })
})
