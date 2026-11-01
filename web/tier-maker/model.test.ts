import assert from 'node:assert/strict'
import test from 'node:test'
import { addTier, defaultList, isPristine, itemKey, MAX_TIERS, moveTier, parseKey, placedKeys, placeItem, removeItem, removeTier, sanitize, updateTier } from './model.ts'

const items = (l: ReturnType<typeof defaultList>, id: string) => l.tiers.find((t) => t.id === id)!.items

test('removeTier keeps the last tier', () => {
  let l = defaultList()
  for (const t of l.tiers.slice(1)) l = removeTier(l, t.id)
  assert.equal(l.tiers.length, 1)
  assert.equal(removeTier(l, l.tiers[0].id), l)
})

test('isPristine is false after any edit', () => {
  const l = defaultList()
  assert.equal(isPristine(l), true)
  assert.equal(isPristine(placeItem(l, 'h1', 't1')), false)
  assert.equal(isPristine(updateTier(l, 't1', { name: 'X' })), false)
  assert.equal(isPristine(updateTier(l, 't1', { color: '#123456' })), false)
  assert.equal(isPristine(addTier(l)), false)
})

test('keys round trip', () => {
  assert.equal(itemKey('hero', 10011), 'h10011')
  assert.deepEqual(parseKey('s10012'), { kind: 'sidekick', stockId: 10012 })
  assert.equal(parseKey('x1'), null)
  assert.equal(parseKey('h'), null)
})

test('placeItem moves a character between tiers and reorders within one', () => {
  let l = defaultList()
  l = placeItem(l, 'h1', 't1')
  l = placeItem(l, 'h2', 't1')
  l = placeItem(l, 'h3', 't1', 0)
  assert.deepEqual(items(l, 't1'), ['h3', 'h1', 'h2'])
  l = placeItem(l, 'h3', 't1', 3) // before position 3 = the end, after removing it from the front
  assert.deepEqual(items(l, 't1'), ['h1', 'h2', 'h3'])
  l = placeItem(l, 'h1', 't1', 2) // between h2 and h3
  assert.deepEqual(items(l, 't1'), ['h2', 'h1', 'h3'])
  l = placeItem(l, 'h2', 't2')
  assert.deepEqual(items(l, 't1'), ['h1', 'h3'])
  assert.deepEqual(items(l, 't2'), ['h2'])
  assert.equal(placeItem(l, 'h1', 'nope'), l)
})

test('removeItem and removeTier send characters back to the pool', () => {
  let l = placeItem(placeItem(defaultList(), 'h1', 't1'), 'h2', 't2')
  l = removeItem(l, 'h1')
  assert.deepEqual([...placedKeys(l)], ['h2'])
  l = removeTier(l, 't2')
  assert.equal(placedKeys(l).size, 0)
})

test('tier edits', () => {
  let l = updateTier(defaultList(), 't1', { name: 'x'.repeat(100), color: '#123456' })
  assert.equal(l.tiers[0].name.length, 40)
  assert.equal(l.tiers[0].color, '#123456')
  l = moveTier(l, 't1', 1)
  assert.deepEqual(l.tiers.slice(0, 2).map((t) => t.id), ['t2', 't1'])
  assert.equal(moveTier(l, 't2', -1), l)
  for (let i = 0; i < 30; i++) l = addTier(l)
  assert.equal(l.tiers.length, MAX_TIERS)
  assert.equal(new Set(l.tiers.map((t) => t.id)).size, MAX_TIERS)
})

test('sanitize drops unknown and duplicate characters and fixes bad fields', () => {
  const valid = new Set(['h1', 'h2', 's1'])
  const r = sanitize(
    { v: 1, title: 5, tiers: [{ id: 't1', name: 'S', color: 'red', items: ['h1', 'h1', 'zzz', 7] }, { id: 't1', name: 'A', color: '#ABCDEF', items: ['h1', 's1'] }, 'junk'] },
    valid,
  )
  assert.ok(r)
  assert.equal(r.skipped, 4) // duplicate h1, zzz, 7 in the first tier; h1 again in the second
  assert.equal(r.list.title, '')
  assert.equal(r.list.tiers[0].color, '#c8c8c8')
  assert.deepEqual(r.list.tiers[0].items, ['h1'])
  assert.equal(r.list.tiers[1].color, '#abcdef')
  assert.deepEqual(r.list.tiers[1].items, ['s1'])
  assert.notEqual(r.list.tiers[0].id, r.list.tiers[1].id)
})

test('sanitize rejects things that are not a tier list', () => {
  const valid = new Set<string>()
  assert.equal(sanitize(null, valid), null)
  assert.equal(sanitize({ v: 2, tiers: [] }, valid), null)
  assert.equal(sanitize({ v: 1, tiers: 'x' }, valid), null)
  assert.equal(sanitize({ v: 1, tiers: [] }, valid), null)
})
