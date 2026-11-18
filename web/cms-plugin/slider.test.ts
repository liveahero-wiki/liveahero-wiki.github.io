import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { choiceTicks, indexOfChoice, pctOf, tickValues } from './slider.ts'

describe('slider helpers', () => {
  it('grades a range at every N, with both ends', () => {
    assert.deepEqual(tickValues(0, 20, 5), [0, 5, 10, 15, 20])
    assert.deepEqual(tickValues(0, 10, 5), [0, 5, 10])
    assert.deepEqual(tickValues(0, 2000, 1000), [0, 1000, 2000])
    assert.deepEqual(tickValues(1, 70, 10), [1, 10, 20, 30, 40, 50, 60, 70])
    assert.deepEqual(tickValues(1, 100, 10), [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    assert.deepEqual(tickValues(0, 10, 7), [0, 7, 10])
    assert.deepEqual(tickValues(5, 5, 5), [5])
  })

  it('positions a value on the track', () => {
    assert.equal(pctOf(0, 0, 20), 0)
    assert.equal(pctOf(5, 0, 20), 25)
    assert.equal(pctOf(20, 0, 20), 100)
    assert.equal(pctOf(3, 3, 3), 0)
  })

  it('finds the choice at or below a value', () => {
    const c = [1, 21, 41, 61, 81, 100]
    assert.equal(indexOfChoice(c, 1), 0)
    assert.equal(indexOfChoice(c, 22), 1)
    assert.equal(indexOfChoice(c, 100), 5)
    assert.equal(indexOfChoice(c, 0), 0)
  })

  it('marks few choices all, many choices every 20 plus the max', () => {
    assert.deepEqual(choiceTicks([1, 21, 41, 61, 81, 100]), [1, 21, 41, 61, 81, 100])
    assert.deepEqual(choiceTicks(Array.from({ length: 21 }, (_, i) => 1 + i * 5)), [1, 21, 41, 61, 81, 101])
  })
})
