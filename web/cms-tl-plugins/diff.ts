// Small line diff (Myers O(ND), common prefix/suffix trimmed first) plus a unified-style row model.
// Pure and dependency free so `node --test` can run it with type stripping.

export type OpKind = 'eq' | 'del' | 'ins'

export interface Op {
  kind: OpKind
  text: string
  /** 1-based line number in the old text (eq and del), else 0. */
  a: number
  /** 1-based line number in the new text (eq and ins), else 0. */
  b: number
}

export interface DiffResult {
  ops: Op[]
  added: number
  removed: number
  /** True when the input was too different for Myers within the budget: the changed middle is one delete block + one insert block. */
  approximate: boolean
}

/** Upper bound for the edit distance searched; beyond it the changed middle is shown as replaced wholesale. */
export const MAX_EDIT_DISTANCE = 3000

/** Lines of a text: CRLF/CR normalized, one trailing line break ignored, '' has no lines. */
export function splitLines(text: string): string[] {
  if (!text) return []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

type Step = 0 | 1 | 2 // 0 = equal, 1 = delete (from a), 2 = insert (from b)

/** Myers on two int arrays; steps in order, or null when the edit distance exceeds `maxD`. */
function myers(a: Int32Array, b: Int32Array, maxD: number): Step[] | null {
  const n = a.length
  const m = b.length
  const max = Math.min(n + m, maxD)
  const off = max + 1
  const v = new Int32Array(2 * max + 3)
  const trace: Int32Array[] = []
  let found = -1

  outer: for (let d = 0; d <= max; d++) {
    // Snapshot of the endpoints before round d, k in [-d-1, d+1]: all backtracking needs.
    trace.push(v.slice(off - d - 1, off + d + 2))
    for (let k = -d; k <= d; k += 2) {
      let x: number
      if (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) x = v[off + k + 1]
      else x = v[off + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[off + k] = x
      if (x >= n && y >= m) {
        found = d
        break outer
      }
    }
  }
  if (found < 0) return null

  const steps: Step[] = []
  let x = n
  let y = m
  for (let d = found; d >= 0; d--) {
    const t = trace[d]
    const at = (k: number) => t[k + d + 1]
    const k = x - y
    const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1
    const prevX = at(prevK)
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      steps.push(0)
      x--
      y--
    }
    if (d > 0) {
      if (x === prevX) steps.push(2)
      else steps.push(1)
    }
    x = prevX
    y = prevY
  }
  return steps.reverse()
}

/** Line diff of two line arrays. */
export function diffLines(oldLines: string[], newLines: string[], maxD = MAX_EDIT_DISTANCE): DiffResult {
  let start = 0
  const lo = oldLines.length
  const ln = newLines.length
  while (start < lo && start < ln && oldLines[start] === newLines[start]) start++
  let endO = lo
  let endN = ln
  while (endO > start && endN > start && oldLines[endO - 1] === newLines[endN - 1]) {
    endO--
    endN--
  }

  const midA = oldLines.slice(start, endO)
  const midB = newLines.slice(start, endN)

  // Intern lines to ints so the inner loop compares numbers.
  const ids = new Map<string, number>()
  const intern = (s: string): number => {
    let id = ids.get(s)
    if (id === undefined) ids.set(s, (id = ids.size))
    return id
  }
  const ia = Int32Array.from(midA, intern)
  const ib = Int32Array.from(midB, intern)

  let approximate = false
  let steps: Step[] | null
  if (midA.length === 0) steps = midB.map((): Step => 2)
  else if (midB.length === 0) steps = midA.map((): Step => 1)
  else steps = myers(ia, ib, maxD)
  if (!steps) {
    approximate = true
    steps = [...midA.map((): Step => 1), ...midB.map((): Step => 2)]
  }

  const ops: Op[] = []
  let removed = 0
  let added = 0
  for (let i = 0; i < start; i++) ops.push({ kind: 'eq', text: oldLines[i], a: i + 1, b: i + 1 })
  let x = start
  let y = start
  // Within a run of changes, all deletes come before all inserts (Myers may interleave them).
  let dels: Op[] = []
  let inss: Op[] = []
  const flush = () => {
    if (dels.length || inss.length) ops.push(...dels, ...inss)
    dels = []
    inss = []
  }
  for (const s of steps) {
    if (s === 0) {
      flush()
      ops.push({ kind: 'eq', text: oldLines[x], a: x + 1, b: y + 1 })
      x++
      y++
    } else if (s === 1) {
      dels.push({ kind: 'del', text: oldLines[x], a: x + 1, b: 0 })
      x++
      removed++
    } else {
      inss.push({ kind: 'ins', text: newLines[y], a: 0, b: y + 1 })
      y++
      added++
    }
  }
  flush()
  for (let i = endO; i < lo; i++) ops.push({ kind: 'eq', text: oldLines[i], a: i + 1, b: i - endO + endN + 1 })
  return { ops, added, removed, approximate }
}

/** Diff of two texts (line endings normalized first). */
export const diffText = (before: string, after: string, maxD?: number): DiffResult => diffLines(splitLines(before), splitLines(after), maxD)

// ---- rows for rendering

export type Row =
  | { kind: OpKind; text: string; a: number; b: number; /** word-level split, only on paired del/ins rows */ mark?: Mark }
  | { kind: 'gap'; hidden: number; /** the first hidden old line, for the label */ a: number; b: number }

/** Intra-line highlight: `text` = pre + mid + post; the middle is what differs. */
export interface Mark {
  pre: number
  post: number
}

/**
 * Collapses runs of unchanged lines to `context` lines around changes (a gap row replaces the rest).
 * No changes at all gives an empty list.
 */
export function toRows(ops: Op[], context = 3): Row[] {
  const changed: boolean[] = ops.map((o) => o.kind !== 'eq')
  if (!changed.includes(true)) return []
  // Mark every op within `context` of a change as visible.
  const keep = new Array<boolean>(ops.length).fill(false)
  let lastChange = -Infinity
  for (let i = 0; i < ops.length; i++) {
    if (changed[i]) {
      lastChange = i
      for (let j = Math.max(0, i - context); j <= i; j++) keep[j] = true
    } else if (i - lastChange <= context) keep[i] = true
  }
  const rows: Row[] = []
  for (let i = 0; i < ops.length; i++) {
    if (keep[i]) {
      rows.push({ ...ops[i] })
      continue
    }
    let j = i
    while (j < ops.length && !keep[j]) j++
    if (j - i === 1) {
      rows.push({ ...ops[i] }) // a gap row for a single line would not save anything
      continue
    }
    rows.push({ kind: 'gap', hidden: j - i, a: ops[i].a, b: ops[i].b })
    i = j - 1
  }
  pairMarks(rows)
  return rows
}

/** Common prefix/suffix of two lines (by UTF-16 units, kept off the middle of a surrogate pair). */
export function markPair(oldText: string, newText: string): { old: Mark; neu: Mark } | null {
  const max = Math.min(oldText.length, newText.length)
  let pre = 0
  while (pre < max && oldText.charCodeAt(pre) === newText.charCodeAt(pre)) pre++
  if (pre > 0 && isHigh(oldText.charCodeAt(pre - 1))) pre--
  let post = 0
  while (post < max - pre && oldText.charCodeAt(oldText.length - 1 - post) === newText.charCodeAt(newText.length - 1 - post)) post++
  if (post > 0 && isLow(oldText.charCodeAt(oldText.length - post))) post--
  // Nothing shared: the whole line is the change, so marking adds nothing.
  if (pre === 0 && post === 0) return null
  return { old: { pre, post }, neu: { pre, post } }
}
const isHigh = (c: number) => c >= 0xd800 && c <= 0xdbff
const isLow = (c: number) => c >= 0xdc00 && c <= 0xdfff

/** In every block of deletes directly followed by inserts, pairs line i with line i and highlights what differs. */
function pairMarks(rows: Row[]): void {
  let i = 0
  while (i < rows.length) {
    if (rows[i].kind !== 'del') {
      i++
      continue
    }
    let d = i
    while (d < rows.length && rows[d].kind === 'del') d++
    let n = d
    while (n < rows.length && rows[n].kind === 'ins') n++
    const pairs = Math.min(d - i, n - d)
    for (let p = 0; p < pairs; p++) {
      const o = rows[i + p] as Extract<Row, { text: string }>
      const w = rows[d + p] as Extract<Row, { text: string }>
      const m = markPair(o.text, w.text)
      if (m) {
        o.mark = m.old
        w.mark = m.neu
      }
    }
    i = Math.max(n, d)
  }
}
