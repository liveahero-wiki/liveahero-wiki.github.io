// Typed access to the shared contributor guard (wiki_plugins/lib/contrib-guard.js, the single implementation:
// the same code is the authoritative CI gate). Imported by relative path so the bundler inlines it.
// Contract: splitFrontMatter(text) -> { frontMatter, body };
//           checkEdit(before, after, { allowedIncludes }) -> { ok, violations: [{ code, message, token? }] }.
// @ts-ignore untyped JS module (JSDoc only); the shape is declared below
import * as guard from '../../wiki_plugins/lib/contrib-guard.js'

export interface Violation {
  code: string
  message: string
  token?: string
}
export interface GuardResult {
  ok: boolean
  violations: Violation[]
}
export interface Guard {
  splitFrontMatter(text: string): { frontMatter: string; body: string }
  isEditablePath(path: unknown): boolean
  checkEdit(before: string, after: string, opts: { allowedIncludes: string[] }): GuardResult
}

export const contribGuard: Guard = guard as unknown as Guard
