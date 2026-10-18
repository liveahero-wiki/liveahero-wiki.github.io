// What the page-edit views compute from the base file text and the proposed body. The guard is injected, so
// this stays testable without the guard module (and without the bundler).

import { diffText, toRows, type DiffResult, type Row } from './diff.ts'
import type { Guard, Violation } from './guard.ts'

export interface PageAnalysis {
  /** Body of the base file (front matter split off). */
  baseBody: string
  diff: DiffResult
  rows: Row[]
  /** null: the advisory guard check was skipped (includes list unavailable) or the guard itself failed. */
  violations: Violation[] | null
  /** Why the guard check was skipped, for the notice. */
  guardNote: string | null
  /** Base front matter (never edited here). */
  frontMatter: string
}

type GuardFns = Pick<Guard, 'splitFrontMatter' | 'checkEdit'>

export function analyzePage(baseText: string, after: string, allowedIncludes: string[] | null, guard: GuardFns, context = 3): PageAnalysis {
  const { frontMatter, body } = guard.splitFrontMatter(baseText)
  const diff = diffText(body, after)
  let violations: Violation[] | null = null
  let guardNote: string | null = null
  if (!allowedIncludes) {
    guardNote = 'The contributor include list could not be loaded, so the guard check was skipped. CI will still check the pull request.'
  } else {
    try {
      violations = guard.checkEdit(body, after, { allowedIncludes }).violations
    } catch (e) {
      guardNote = `The guard check failed to run (${e instanceof Error ? e.message : String(e)}). CI will still check the pull request.`
    }
  }
  return { baseBody: body, diff, rows: toRows(diff.ops, context), violations, guardNote, frontMatter }
}

/** "+X −Y lines" */
export const statsLabel = (added: number, removed: number): string => `+${added} −${removed} lines`
