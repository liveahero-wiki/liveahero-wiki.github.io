// "My contributions": one row per own submission of the three types. Pure.

import type { ContribSubmission as BaseSubmission } from '../../cms-plugin/api-types.ts'
import { hasKey, type Key, type T } from '../i18n/t.ts'
import { TYPES } from './submit.ts'

/** The wiki-cms row; `outcome` (what happened after approval) is newer than the copy of the types in web/cms-plugin. */
export type ContribSubmission = BaseSubmission & { outcome?: { status: string; url?: string; label?: string } | null }

export interface MineRow {
  id: string
  createdAt: number
  title: string
  status: string
  url: string | null
}

const obj = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {})

export function describeSubmission(t: T, s: Pick<ContribSubmission, 'type' | 'payload'>): string {
  const p = obj(s.payload)
  switch (s.type) {
    case 'lah-voice-tl':
      return t('mineVoice', { name: String(p.resourceName ?? ''), n: Array.isArray(p.lines) ? p.lines.length : 0 })
    case 'lah-bio-tl':
      return t('mineBio', { key: String(p.key ?? '') })
    case 'lah-page-edit':
      return t('minePage', { path: String(p.path ?? '') })
    default:
      return s.type
  }
}

/** Only an https link is shown (the Worker promises it, this keeps a bad row from becoming a `javascript:` link). */
export const safeUrl = (u: unknown): string | null => (typeof u === 'string' && /^https:\/\//i.test(u) ? u : null)

/** Pending / approved, refined by the type's own outcome (sheet sync, pull request) once there is one. */
export function statusText(t: T, s: Pick<ContribSubmission, 'state' | 'outcome'>): string {
  const o = s.outcome
  if (o) {
    const key = `outcome_${o.status}`
    if (hasKey(key)) return t(key as Key)
    if (o.label) return o.label
  }
  return t(s.state === 'approved' ? 'stateApproved' : 'statePending')
}

export function rowsOf(t: T, lists: ContribSubmission[][]): MineRow[] {
  const known = new Set<string>(TYPES)
  return lists
    .flat()
    .filter((s) => known.has(s.type))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((s) => ({ id: s.id, createdAt: s.createdAt, title: describeSubmission(t, s), status: statusText(t, s), url: safeUrl(s.outcome?.url) }))
}
