// Port of wiki-cms/src/types/lah-team-formation/validate.test.ts (vitest) to node:test.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateTeamPayload, validateTeam, supportMode, ERROR_CODES, type ValidateResult } from './validate.ts'
import type { TeamSlot } from './types.ts'

const group = (options: Record<string, unknown> = {}) => ({ options })
const slot = (stockId: number, extra: Partial<TeamSlot> = {}) => ({ stockId, ...extra })
const codes = (r: ValidateResult) => (r.ok ? [] : r.errors.map((e) => e.code))

describe('payload basics', () => {
  it('fills defaults and drops unknown keys', () => {
    const r = validateTeamPayload({ v: 1, supportIndex: 0, heroes: [{ stockId: 1, junk: 1 }], extra: 1 }, group())
    assert.deepEqual(r, {
      ok: true,
      value: {
        v: 1,
        supportIndex: 0,
        heroes: [{ stockId: 1, lv: 60, plv: 0, fans: 0, engrave: 0, bloom: false, skillTree: false, active: null, passives: [] }],
      },
    })
  })
  it('rejects bad version, empty and >5 slots', () => {
    assert.ok(codes(validateTeamPayload({ v: 2, heroes: [slot(1)] }, group({ support: false }))).includes('version_invalid'))
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [] }, group())).includes('heroes_length'))
    const six = [1, 2, 3, 4, 5, 6].map((n) => slot(n))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 0, heroes: six }, group())).includes('heroes_length'))
  })
  it('rejects a non-object payload', () => {
    assert.deepEqual(codes(validateTeamPayload(null, group())), ['payload_invalid'])
    assert.deepEqual(codes(validateTeamPayload([], group())), ['payload_invalid'])
  })
  it('range checks numbers (engrave default 0, up to 1000)', () => {
    const ok = validateTeamPayload({ v: 1, heroes: [slot(1, { lv: 60, plv: 100, fans: 1000, engrave: 1000 })] }, group({ support: false }))
    assert.equal(ok.ok, true)
    for (const bad of [{ lv: 0 }, { lv: 61 }, { plv: 101 }, { fans: -1 }, { engrave: 1.5 }, { engrave: 1001 }]) {
      const r = validateTeamPayload({ v: 1, heroes: [slot(1, bad as Partial<TeamSlot>)] }, group({ support: false }))
      assert.ok(codes(r).includes('int_range'), JSON.stringify(bad))
    }
  })
  it('rejects non-positive stock ids and non-boolean flags', () => {
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(0)] }, group({ support: false }))).includes('stock_id_invalid'))
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [{ stockId: 1, bloom: 'yes' }] }, group({ support: false }))).includes('bool_invalid'))
  })
  it('own hero as active sidekick is rejected', () => {
    const r = validateTeamPayload({ v: 1, heroes: [slot(10011, { active: 10011 })] }, group({ support: false }))
    assert.ok(codes(r).includes('active_same_as_hero'))
  })
  it('every error has code, message and a payload-prefixed path', () => {
    const r = validateTeamPayload({ v: 1, heroes: [{ stockId: 'x', lv: 99, passives: [1, 1, 1] }] }, group())
    assert.equal(r.ok, false)
    if (!r.ok) {
      for (const e of r.errors) {
        assert.ok(e.code && e.message && e.path)
        assert.ok(e.path === 'payload' || e.path.startsWith('payload.'), e.path)
        assert.ok((ERROR_CODES as readonly string[]).includes(e.code), e.code)
      }
    }
  })
  it('reports error paths like the server', () => {
    const r = validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(1), slot(2, { passives: [3, 3, 4] })] }, group())
    assert.ok(!r.ok)
    if (!r.ok) {
      assert.deepEqual(r.errors.map((e) => e.path).sort(), ['payload.heroes.1.passives', 'payload.heroes.1.passives'])
      assert.deepEqual(r.errors.map((e) => e.code).sort(), ['passives_duplicate', 'passives_too_many'])
      assert.deepEqual(r.errors.find((e) => e.code === 'passives_too_many')!.params, { max: 2 })
    }
  })
})

describe('passives', () => {
  it('limits by bloom and forbids duplicates within a slot', () => {
    const g = group({ support: false })
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(1, { passives: [2, 3, 4] })] }, g)).includes('passives_too_many'))
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(1, { bloom: true, passives: [2, 3, 4] })] }, g).ok, true)
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(1, { bloom: true, passives: [2, 3, 4, 5] })] }, g)).includes('passives_too_many'))
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(1, { passives: [2, 2] })] }, g)).includes('passives_duplicate'))
  })
  it('allows the same passive across different slots', () => {
    const r = validateTeamPayload({ v: 1, heroes: [slot(1, { passives: [9] }), slot(2, { passives: [9] })] }, group({ support: false }))
    assert.equal(r.ok, true)
  })
})

describe('support rule (group-driven)', () => {
  const dupHero = [slot(1), slot(2), slot(1)]
  it('support=true (default) requires supportIndex', () => {
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(1)] }, group())).includes('support_required'))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)] }, group({ support: true }))).includes('support_required'))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 1, heroes: [slot(1)] }, group())).includes('support_out_of_range'))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: -1, heroes: [slot(1)] }, group())).includes('support_out_of_range'))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 0.5, heroes: [slot(1)] }, group())).includes('support_out_of_range'))
  })
  it('support slot may duplicate a hero and/or active', () => {
    const r = validateTeamPayload({ v: 1, supportIndex: 2, heroes: [slot(1, { active: 5 }), slot(2), slot(1, { active: 5 })] }, group())
    assert.equal(r.ok, true)
  })
  it('duplicates among non-support slots are rejected', () => {
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 1, heroes: dupHero }, group())).includes('duplicate_hero'))
    const act = validateTeamPayload({ v: 1, supportIndex: 2, heroes: [slot(1, { active: 5 }), slot(2, { active: 5 }), slot(3)] }, group())
    assert.ok(codes(act).includes('duplicate_active'))
  })
  it('names the slots (1-based) in duplicate errors', () => {
    const r = validateTeamPayload({ v: 1, supportIndex: 1, heroes: dupHero }, group())
    assert.ok(!r.ok)
    if (!r.ok) {
      const e = r.errors.find((x) => x.code === 'duplicate_hero')!
      assert.equal(e.path, 'payload.heroes')
      assert.deepEqual(e.params, { slots: '1,3' })
    }
  })
  it('two separate duplicate pairs are rejected', () => {
    const r = validateTeamPayload({ v: 1, supportIndex: 4, heroes: [slot(1), slot(1), slot(2), slot(2), slot(3)] }, group())
    assert.equal(codes(r).filter((c) => c === 'duplicate_hero').length, 2)
  })
  it('support=false rejects any non-null supportIndex and any duplicate', () => {
    const g = group({ support: false })
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(1)] }, g)).includes('support_not_allowed'))
    assert.equal(validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)] }, g).ok, true)
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(1)] }, g).ok, true)
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: dupHero }, g)).includes('duplicate_hero'))
    assert.ok(codes(validateTeamPayload({ v: 1, heroes: [slot(1, { active: 5 }), slot(2, { active: 5 })] }, g)).includes('duplicate_active'))
  })
  it('null actives never count as duplicates', () => {
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(1), slot(2)] }, group({ support: false })).ok, true)
  })
})

describe('supportMode', () => {
  it('absent / true -> required, false -> none, "optional" -> optional (anything else is required)', () => {
    assert.equal(supportMode({}), 'required')
    assert.equal(supportMode({ support: true }), 'required')
    assert.equal(supportMode({ support: false }), 'none')
    assert.equal(supportMode({ support: 'optional' }), 'optional')
    assert.equal(supportMode({ support: 'maybe' }), 'required')
  })
})

describe('support=optional', () => {
  const g = group({ support: 'optional' })
  const dupHero = [slot(1), slot(2), slot(1)]
  it('accepts no support (absent or null) and a valid index', () => {
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(1)] }, g).ok, true)
    const none = validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)] }, g)
    assert.deepEqual(none.ok && none.value.supportIndex, null)
    const some = validateTeamPayload({ v: 1, supportIndex: 1, heroes: [slot(1), slot(2)] }, g)
    assert.deepEqual(some.ok && some.value.supportIndex, 1)
  })
  it('still rejects an out-of-range index', () => {
    for (const supportIndex of [1, -1, 0.5, 'a']) {
      assert.ok(codes(validateTeamPayload({ v: 1, supportIndex, heroes: [slot(1)] }, g)).includes('support_out_of_range'), String(supportIndex))
    }
  })
  it('without a support slot duplicates are rejected; with one that slot is exempt', () => {
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: null, heroes: dupHero }, g)).includes('duplicate_hero'))
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 2, heroes: dupHero }, g).ok, true)
  })
})

describe('target rule', () => {
  const targets = [
    { id: 'quest-616001', label: { en: 'Simulator' } },
    { id: 'quest-605001', label: { en: 'Old' }, retired: true },
    { id: 'broken entry', label: { en: 'ignored' } },
  ]
  const g = group({ support: 'optional', targets })
  const withTarget = (target: unknown) => validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)], target }, g)
  const targetValue = (r: ValidateResult) => (r.ok ? r.value.target : 'invalid')

  it('absent or null target is general purpose', () => {
    assert.equal(validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)] }, g).ok, true)
    assert.equal(withTarget(null).ok, true)
    assert.equal('target' in (withTarget(null) as { value: object }).value, false)
  })
  it('a listed id is valid, including a retired one', () => {
    assert.equal(targetValue(withTarget('quest-616001')), 'quest-616001')
    assert.equal(targetValue(withTarget('quest-605001')), 'quest-605001')
  })
  it('anything else is target_unknown at payload.target', () => {
    for (const bad of ['quest-1', '', 'broken entry', 616001, true, {}, []]) {
      const r = withTarget(bad)
      assert.deepEqual(codes(r), ['target_unknown'], JSON.stringify(bad))
      if (!r.ok) assert.equal(r.errors[0].path, 'payload.target')
    }
  })
  it('a group without targets accepts none', () => {
    assert.deepEqual(codes(validateTeamPayload({ v: 1, supportIndex: null, heroes: [slot(1)], target: 'quest-616001' }, group({ support: 'optional' }))), ['target_unknown'])
  })
})

describe('focus rule', () => {
  const heroFocus = group({ support: true, focus: { kind: 'hero', stockId: 10251 } })
  const sideFocus = group({ support: true, focus: { kind: 'sidekick', stockId: 10251 } })
  it('hero focus: satisfied by a normal slot and by the support slot', () => {
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 1, heroes: [slot(10251), slot(2)] }, heroFocus).ok, true)
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 1, heroes: [slot(2), slot(10251)] }, heroFocus).ok, true)
    const miss = validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(2)] }, heroFocus)
    assert.ok(codes(miss).includes('focus_missing'))
    if (!miss.ok) assert.deepEqual(miss.errors.find((e) => e.code === 'focus_missing')!.params, { kind: 'hero', stockId: 10251 })
  })
  it('sidekick focus: satisfied by active or passive; hero id does not satisfy it', () => {
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(1, { active: 10251 })] }, sideFocus).ok, true)
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(1, { passives: [10251] })] }, sideFocus).ok, true)
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(10251)] }, sideFocus)).includes('focus_missing'))
    assert.ok(codes(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(1, { active: 10251 })] }, heroFocus)).includes('focus_missing'))
  })
  it('no focus option means no rule; malformed focus is ignored', () => {
    assert.equal(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(2)] }, group()).ok, true)
    for (const focus of [{ kind: 'x', stockId: 1 }, { kind: 'hero', stockId: 1.5 }, 'hero', 5]) {
      assert.equal(validateTeamPayload({ v: 1, supportIndex: 0, heroes: [slot(2)] }, group({ focus })).ok, true)
    }
  })
})

describe('same-character sidekick', () => {
  const roster = {
    heroes: [{ stockId: 10, characterId: 1 }, { stockId: 11, characterId: 1 }, { stockId: 20, characterId: 2 }],
    sidekicks: [{ stockId: 30, characterId: 1 }, { stockId: 31, characterId: 2 }, { stockId: 32, characterId: 3 }],
  }
  const g = group({ support: false })
  const run = (s: Partial<TeamSlot>) => validateTeamPayload({ v: 1, heroes: [slot(10, s)] }, g, { roster })

  it('rejects an active sidekick of the hero’s own character, at the active path', () => {
    const r = run({ active: 30 })
    assert.ok(!r.ok)
    if (!r.ok) assert.deepEqual(r.errors.map((e) => [e.code, e.path]), [['sidekick_same_character', 'payload.heroes.0.active']])
  })
  it('rejects a passive sidekick of the hero’s own character, at that passive’s path', () => {
    const r = run({ passives: [32, 30] })
    assert.ok(!r.ok)
    if (!r.ok) assert.deepEqual(r.errors.map((e) => [e.code, e.path]), [['sidekick_same_character', 'payload.heroes.0.passives.1']])
  })
  it('allows sidekicks of other characters, and skips the check without a roster', () => {
    assert.equal(run({ active: 31, passives: [32] }).ok, true)
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(10, { active: 30 })] }, g).ok, true)
  })
  it('does not double-report the plain same-card active', () => {
    const r = validateTeamPayload({ v: 1, heroes: [slot(10, { active: 10 })] }, g, { roster: { heroes: roster.heroes, sidekicks: [{ stockId: 10, characterId: 1 }] } })
    assert.deepEqual(codes(r), ['active_same_as_hero'])
  })
})

describe('roster soft check', () => {
  const roster = { heroes: [{ stockId: 1 }, { stockId: 2 }], sidekicks: [{ stockId: 1 }, { stockId: 9 }] }
  const g = group({ support: false })
  it('rejects unknown ids only when a roster is supplied', () => {
    const p = { v: 1, heroes: [slot(3, { active: 4, passives: [9, 8] })] }
    assert.equal(validateTeamPayload(p, g).ok, true)
    const r = validateTeamPayload(p, g, { roster })
    assert.deepEqual(codes(r), ['unknown_hero', 'unknown_sidekick', 'unknown_sidekick'])
    assert.equal(validateTeamPayload({ v: 1, heroes: [slot(2, { active: 9 })] }, g, { roster }).ok, true)
    assert.equal(validateTeamPayload(p, g, { roster: { nonsense: true } }).ok, true)
  })
})

describe('validateTeam helper', () => {
  it('returns [] for a valid payload and the error list otherwise', () => {
    assert.deepEqual(validateTeam({ v: 1, supportIndex: 0, heroes: [slot(1)] }, {}), [])
    assert.deepEqual(validateTeam({ v: 1, supportIndex: null, heroes: [slot(1)] }, {}).map((e) => e.code), ['support_required'])
    assert.deepEqual(validateTeam({ v: 1, supportIndex: null, heroes: [slot(1)] }, { support: false }), [])
  })
})
