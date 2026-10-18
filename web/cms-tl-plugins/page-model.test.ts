import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { analyzePage, statsLabel } from './page-model.ts'
// The real guard: the one the plugin bundles (and CI runs).
import { contribGuard as guard } from './guard.ts'

const FM = '---\ntitle: Ryekie\ncharacterId: 4\n---\n'
const BODY = '## Notes\n\nLine one\nLine two\n\n{% include item.html id=1 %}\n'

describe('analyzePage', () => {
  it('diffs the base BODY (front matter split off) against the proposal', () => {
    const a = analyzePage(FM + BODY, BODY.replace('Line two', 'Line 2'), ['item.html'], guard)
    assert.equal(a.frontMatter, FM)
    assert.equal(a.baseBody, BODY)
    assert.deepEqual([a.diff.added, a.diff.removed], [1, 1])
    assert.equal(a.rows.length, 2 + 5) // 1 del + 1 ins + context (3 before, 1+ after... all lines are within 3 lines)
    assert.deepEqual(a.violations, [])
    assert.equal(a.guardNote, null)
  })
  it('an unchanged proposal has no rows and no violations', () => {
    const a = analyzePage(FM + BODY, BODY, [], guard)
    assert.deepEqual([a.diff.added, a.diff.removed], [0, 0])
    assert.deepEqual(a.rows, [])
    assert.deepEqual(a.violations, [])
  })
  it('works for a base without front matter', () => {
    const a = analyzePage(BODY, BODY + 'More\n', [], guard)
    assert.equal(a.frontMatter, '')
    assert.deepEqual([a.diff.added, a.diff.removed], [1, 0])
  })
  it('surfaces guard violations (a changed protected template token)', () => {
    const base = 'Text\n{% for x in y %}{{ x }}{% endfor %}\n'
    const a = analyzePage(base, 'Text\n{% for x in z %}{{ x }}{% endfor %}\n', [], guard)
    assert.ok(a.violations && a.violations.length > 0, JSON.stringify(a.violations))
    for (const v of a.violations!) assert.ok(v.code && v.message)
  })
  it('flags a disallowed include, accepts an allowed one', () => {
    const base = 'Text\n'
    const withAllowed = analyzePage(base, 'Text\n{% include item.html id=1 %}\n', ['item.html'], guard)
    assert.deepEqual(withAllowed.violations, [])
    const denied = analyzePage(base, 'Text\n{% include header.html %}\n', ['item.html'], guard)
    assert.ok(denied.violations && denied.violations.length > 0)
  })
  it('flags a new <script>', () => {
    const a = analyzePage('Hi\n', 'Hi\n<script>alert(1)</script>\n', [], guard)
    assert.ok(a.violations && a.violations.length > 0)
  })
  it('skips the guard (with a notice) when the includes list is unavailable', () => {
    const a = analyzePage(BODY, BODY + 'x\n', null, guard)
    assert.equal(a.violations, null)
    assert.match(a.guardNote!, /include list could not be loaded/)
    assert.equal(a.diff.added, 1) // the diff is still computed
  })
  it('a throwing guard degrades to a notice, not an exception', () => {
    const a = analyzePage(BODY, BODY + 'x\n', [], {
      splitFrontMatter: guard.splitFrontMatter,
      checkEdit: () => {
        throw new Error('boom')
      },
    })
    assert.equal(a.violations, null)
    assert.match(a.guardNote!, /boom/)
  })
  it('collapses unchanged context in a large page', () => {
    const body = Array.from({ length: 200 }, (_, i) => `line ${i + 1}`).join('\n') + '\n'
    const after = body.replace('line 100\n', 'line 100 edited\n')
    const a = analyzePage(FM + body, after, [], guard)
    assert.equal(a.rows.filter((r) => r.kind === 'gap').length, 2)
    assert.equal(a.rows.length, 2 + 6 + 2)
  })
  it('CRLF in the base does not show as a change', () => {
    const a = analyzePage((FM + BODY).replace(/\n/g, '\r\n'), BODY, [], guard)
    assert.deepEqual([a.diff.added, a.diff.removed], [0, 0])
  })
})

describe('statsLabel', () => {
  it('+X −Y lines', () => {
    assert.equal(statsLabel(3, 12), '+3 −12 lines')
  })
})
