import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { decodeTeam, encodeTeam, sharedParam, shareUrl } from './share.ts'
import { validateTeam } from '../cms-plugin/validate.ts'
import type { TeamPayload } from '../cms-plugin/types.ts'

const slot = (stockId: number, over: Partial<TeamPayload['heroes'][0]> = {}): TeamPayload['heroes'][0] => ({
  stockId,
  lv: 60,
  plv: 0,
  fans: 0,
  engrave: 0,
  bloom: false,
  skillTree: false,
  active: null,
  passives: [],
  ...over,
})

const full: TeamPayload = {
  v: 1,
  supportIndex: 4,
  target: 'quest-616001',
  heroes: [
    slot(12641, { lv: 55, plv: 100, pwForm: 62, fans: 1000, engrave: 777, bloom: true, skillTree: true, active: 10456, passives: [10001, 61, 10222] }),
    slot(1),
    slot(300, { active: 10002, passives: [5] }),
    slot(4000, { bloom: true, passives: [10003, 10004, 10005] }),
    slot(12641),
  ],
}

const roundTrip = (t: TeamPayload) => {
  const r = decodeTeam(encodeTeam(t))
  assert.ok(r.ok)
  return r.value
}

describe('team share codec', () => {
  it('round-trips a full team', () => {
    assert.deepEqual(roundTrip(full), full)
  })

  it('round-trips a minimal team without support or target', () => {
    const t: TeamPayload = { v: 1, supportIndex: null, heroes: [slot(7)] }
    assert.deepEqual(roundTrip(t), t)
  })

  it('keeps pwForm only with P.Lv > 0', () => {
    const t = roundTrip({ v: 1, supportIndex: null, heroes: [slot(7, { plv: 1, pwForm: 63 }), slot(8)] })
    assert.equal(t.heroes[0].pwForm, 63)
    assert.equal('pwForm' in t.heroes[1], false)
  })

  it('stays URL-safe and short', () => {
    const s = encodeTeam(full)
    assert.match(s, /^[A-Za-z0-9_-]+$/)
    assert.ok(s.length < 200, `${s.length} chars`)
  })

  it('a decoded team that was valid still validates', () => {
    assert.deepEqual(validateTeam(roundTrip(full), { support: 'optional', targets: [{ id: 'quest-616001', label: { en: 'x' } }] }), [])
  })

  it('rejects an unknown version', () => {
    assert.deepEqual(decodeTeam('AgE'), { ok: false, reason: 'version' })
  })

  it('rejects garbage, truncation, trailing bytes and bad characters', () => {
    const good = encodeTeam(full)
    for (const bad of ['', 'A', '!!!!', 'AQ', good.slice(0, 10), good + 'AAAA', good + '=', 'AQ+/']) {
      const r = decodeTeam(bad)
      assert.equal(r.ok, false, bad)
    }
  })

  it('rejects an overlong varint and out-of-range counts', () => {
    // version 1, one slot, stockId = 6 continuation bytes
    const long = btoa(String.fromCharCode(1, 1, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01)).replace(/=+$/, '')
    assert.equal(decodeTeam(long).ok, false)
    const zeroSlots = btoa(String.fromCharCode(1, 0)).replace(/=+$/, '')
    assert.equal(decodeTeam(zeroSlots).ok, false)
    const supportPastEnd = btoa(String.fromCharCode(1, 1 | (3 << 3), 1, 0, 60, 0, 0, 0)).replace(/=+$/, '')
    assert.equal(decodeTeam(supportPastEnd).ok, false)
  })

  it('refuses to encode a team that breaks the format', () => {
    assert.throws(() => encodeTeam({ v: 1, supportIndex: null, heroes: [] }))
    assert.throws(() => encodeTeam({ v: 1, supportIndex: 2, heroes: [slot(1)] }))
    assert.throws(() => encodeTeam({ v: 1, supportIndex: null, heroes: [slot(1, { fans: -1 })] }))
    assert.throws(() => encodeTeam({ v: 1, supportIndex: null, heroes: [slot(1, { passives: [1, 2, 3, 4] })] }))
  })
})

describe('share url', () => {
  it('reads the param and builds a link from the page path only', () => {
    const t: TeamPayload = { v: 1, supportIndex: null, heroes: [slot(7)] }
    const url = shareUrl({ origin: 'https://x.test', pathname: '/team-creator.html' }, t)
    assert.equal(url, `https://x.test/team-creator.html?team=${encodeTeam(t)}`)
    assert.equal(sharedParam(new URL(url).search), encodeTeam(t))
    assert.equal(sharedParam('?other=1'), null)
  })
})
