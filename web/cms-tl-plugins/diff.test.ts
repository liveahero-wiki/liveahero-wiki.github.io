import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { diffLines, diffText, markPair, splitLines, toRows, type Op } from './diff.ts'

const L = (s: string) => s.split(' ').filter(Boolean)
/** Applies the ops: the result must be the new text, and the eq/del lines the old one. */
function replay(ops: Op[]) {
  return {
    old: ops.filter((o) => o.kind !== 'ins').map((o) => o.text),
    neu: ops.filter((o) => o.kind !== 'del').map((o) => o.text),
  }
}
const kinds = (ops: Op[]) => ops.map((o) => (o.kind === 'eq' ? '=' : o.kind === 'del' ? '-' : '+')).join('')

describe('splitLines', () => {
  it('handles empty, trailing newline and CRLF', () => {
    assert.deepEqual(splitLines(''), [])
    assert.deepEqual(splitLines('a'), ['a'])
    assert.deepEqual(splitLines('a\n'), ['a'])
    assert.deepEqual(splitLines('a\n\n'), ['a', ''])
    assert.deepEqual(splitLines('a\r\nb\r\n'), ['a', 'b'])
    assert.deepEqual(splitLines('a\rb'), ['a', 'b'])
  })
})

describe('diffLines', () => {
  it('identical input has no changes', () => {
    const r = diffLines(L('a b c'), L('a b c'))
    assert.equal(r.added, 0)
    assert.equal(r.removed, 0)
    assert.equal(kinds(r.ops), '===')
  })
  it('both empty', () => {
    assert.deepEqual(diffLines([], []).ops, [])
  })
  it('insert', () => {
    const r = diffLines(L('a c'), L('a b c'))
    assert.equal(kinds(r.ops), '=+=')
    assert.deepEqual([r.added, r.removed], [1, 0])
    assert.deepEqual(r.ops[1], { kind: 'ins', text: 'b', a: 0, b: 2 })
  })
  it('delete', () => {
    const r = diffLines(L('a b c'), L('a c'))
    assert.equal(kinds(r.ops), '=-=')
    assert.deepEqual([r.added, r.removed], [0, 1])
    assert.deepEqual(r.ops[1], { kind: 'del', text: 'b', a: 2, b: 0 })
    assert.deepEqual(r.ops[2], { kind: 'eq', text: 'c', a: 3, b: 2 })
  })
  it('replace puts deletes before inserts', () => {
    const r = diffLines(L('a b c d'), L('a x y d'))
    assert.equal(kinds(r.ops), '=--++=')
    assert.deepEqual(replay(r.ops), { old: L('a b c d'), neu: L('a x y d') })
  })
  it('pure insert / delete of everything', () => {
    assert.equal(kinds(diffLines([], L('a b')).ops), '++')
    assert.equal(kinds(diffLines(L('a b'), []).ops), '--')
  })
  it('keeps line numbers consistent on both sides', () => {
    const r = diffLines(L('a b c d e'), L('a c d x e f'))
    let a = 0
    let b = 0
    for (const o of r.ops) {
      if (o.kind !== 'ins') assert.equal(o.a, ++a)
      if (o.kind !== 'del') assert.equal(o.b, ++b)
    }
    assert.equal(a, 5)
    assert.equal(b, 6)
  })
  it('is a minimal edit script (classic ABCABBA / CBABAC)', () => {
    const r = diffLines(L('A B C A B B A'), L('C B A B A C'))
    assert.equal(r.added + r.removed, 5) // D = 5
    assert.deepEqual(replay(r.ops), { old: L('A B C A B B A'), neu: L('C B A B A C') })
  })
  it('randomized: replay reproduces both sides and D is never worse than a trivial script', () => {
    let seed = 12345
    const rnd = (n: number) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n)
    for (let t = 0; t < 200; t++) {
      const a = Array.from({ length: rnd(25) }, () => String(rnd(6)))
      const b = Array.from({ length: rnd(25) }, () => String(rnd(6)))
      const r = diffLines(a, b)
      assert.deepEqual(replay(r.ops), { old: a, neu: b })
      assert.ok(r.added + r.removed <= a.length + b.length)
      assert.equal(r.approximate, false)
    }
  })
  it('falls back to a wholesale replace beyond the edit-distance budget, keeping the common ends', () => {
    const a = ['head', ...Array.from({ length: 50 }, (_, i) => `a${i}`), 'tail']
    const b = ['head', ...Array.from({ length: 50 }, (_, i) => `b${i}`), 'tail']
    const r = diffLines(a, b, 10)
    assert.equal(r.approximate, true)
    assert.equal(r.ops[0].kind, 'eq')
    assert.equal(r.ops[r.ops.length - 1].kind, 'eq')
    assert.deepEqual(replay(r.ops), { old: a, neu: b })
    assert.deepEqual([r.added, r.removed], [50, 50])
  })
})

describe('diffText', () => {
  it('CRLF vs LF is not a change', () => {
    const r = diffText('one\r\ntwo\r\nthree\r\n', 'one\ntwo\nthree\n')
    assert.deepEqual([r.added, r.removed], [0, 0])
  })
  it('detects a changed CRLF line', () => {
    const r = diffText('one\r\ntwo\r\n', 'one\r\nTWO\r\n')
    assert.equal(kinds(r.ops), '=-+')
  })
  it('a missing final newline alone is not a change', () => {
    assert.deepEqual([diffText('a\nb\n', 'a\nb').added, diffText('a\nb\n', 'a\nb').removed], [0, 0])
  })
})

describe('performance', () => {
  const page = (n: number) => Array.from({ length: n }, (_, i) => `line ${i}: ${'lorem ipsum dolor sit amet '.repeat(1 + (i % 3))}`)
  it('35 KB page with scattered edits is fast', () => {
    const a = page(1100)
    assert.ok(a.join('\n').length > 35_000)
    const b = a.slice()
    for (let i = 10; i < b.length; i += 37) b[i] = `${b[i]} (edited)`
    b.splice(500, 0, 'a new paragraph', '', 'and another')
    b.splice(900, 12)
    const t0 = performance.now()
    const r = diffLines(a, b)
    const ms = performance.now() - t0
    assert.deepEqual(replay(r.ops), { old: a, neu: b })
    assert.ok(ms < 500, `took ${ms}ms`)
  })
  it('35 KB page, everything different (the worst case), stays bounded', () => {
    const a = page(1100)
    const b = a.map((l) => `X${l}`)
    const t0 = performance.now()
    const r = diffLines(a, b)
    const ms = performance.now() - t0
    assert.deepEqual(replay(r.ops), { old: a, neu: b })
    assert.ok(ms < 3000, `took ${ms}ms`)
  })
  it('120 KB, totally different, hits the budget and still returns', () => {
    const a = page(4000)
    const b = page(4000).map((l) => `Y${l}`)
    const t0 = performance.now()
    const r = diffLines(a, b)
    const ms = performance.now() - t0
    assert.equal(r.approximate, true)
    assert.deepEqual(replay(r.ops), { old: a, neu: b })
    assert.ok(ms < 5000, `took ${ms}ms`)
  })
})

describe('toRows', () => {
  const lines = (n: number) => Array.from({ length: n }, (_, i) => `l${i + 1}`)
  it('no changes gives no rows', () => {
    assert.deepEqual(toRows(diffLines(lines(5), lines(5)).ops), [])
  })
  it('collapses unchanged context to 3 lines with a gap row', () => {
    const a = lines(30)
    const b = a.slice()
    b[14] = 'changed' // line 15
    const rows = toRows(diffLines(a, b).ops, 3)
    const gaps = rows.filter((r) => r.kind === 'gap')
    assert.equal(gaps.length, 2)
    assert.deepEqual(
      rows.map((r) => (r.kind === 'gap' ? `~${r.hidden}` : `${r.kind}:${r.text}`)),
      ['~11', 'eq:l12', 'eq:l13', 'eq:l14', 'del:l15', 'ins:changed', 'eq:l16', 'eq:l17', 'eq:l18', '~12'],
    )
  })
  it('merges hunks whose context touches', () => {
    const a = lines(20)
    const b = a.slice()
    b[4] = 'x'
    b[11] = 'y' // 6 unchanged lines between: with context 3 on both sides, they touch
    const rows = toRows(diffLines(a, b).ops, 3)
    assert.equal(rows.filter((r) => r.kind === 'gap').length, 1) // only the trailing run (the leading one is a single line, shown)
    assert.ok(rows.some((r) => r.kind === 'eq' && r.text === 'l8'))
    assert.ok(rows.some((r) => r.kind === 'eq' && r.text === 'l1'))
  })
  it('shows a single hidden line instead of a gap row', () => {
    const a = lines(12)
    const b = a.slice()
    b[0] = 'x'
    b[8] = 'y' // changes at lines 1 and 9: lines 5 would be the only hidden line between
    const rows = toRows(diffLines(a, b).ops, 3)
    assert.deepEqual(rows.filter((r) => r.kind === 'gap').length, 0)
    assert.ok(rows.some((r) => r.kind === 'eq' && r.text === 'l5'))
  })
  it('shows changes at the very start and end without gaps next to them', () => {
    const a = lines(10)
    const b = ['new', ...a.slice(1, 9), 'end']
    const rows = toRows(diffLines(a, b).ops, 3)
    assert.equal(rows[0].kind, 'del')
    assert.equal(rows[rows.length - 1].kind, 'ins')
  })
  it('marks the differing middle of paired del/ins rows', () => {
    const rows = toRows(diffLines(['Hello big world'], ['Hello small world']).ops, 3)
    assert.equal(rows.length, 2)
    const [d, i] = rows as { text: string; mark?: { pre: number; post: number } }[]
    assert.deepEqual(d.mark, { pre: 6, post: 6 })
    assert.equal(d.text.slice(d.mark!.pre, d.text.length - d.mark!.post), 'big')
    assert.equal(i.text.slice(i.mark!.pre, i.text.length - i.mark!.post), 'small')
  })
})

describe('markPair', () => {
  it('returns null when nothing is shared', () => {
    assert.equal(markPair('abc', 'xyz'), null)
  })
  it('prefix and suffix never overlap', () => {
    const m = markPair('aaa', 'aaaa')!
    assert.ok(m.old.pre + m.old.post <= 3)
    assert.deepEqual(m.old, { pre: 3, post: 0 })
  })
  it('does not split a surrogate pair', () => {
    const m = markPair('x\u{1F600}y', 'x\u{1F601}y')!
    assert.equal(m.old.pre, 1)
    assert.equal(m.old.post, 1)
  })
})
