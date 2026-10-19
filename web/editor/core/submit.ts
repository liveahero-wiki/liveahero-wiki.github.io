// Talking to the wiki-cms contributor API: one POST per submission and the mapping of every failure to a localized message.
// Pure apart from `fetch` (injectable), so node --test can import it.

import { hasKey, type Key, type T } from '../i18n/t.ts'
import type { TlLang } from './langs.ts'

export const TYPES = ['lah-voice-tl', 'lah-bio-tl', 'lah-page-edit'] as const
export type SubmissionType = (typeof TYPES)[number]

export interface FieldIssue {
  path: string
  code: string
  message?: string
  params?: Record<string, string | number>
}

export class SubmitError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: FieldIssue[]
  constructor(status: number, code: string, message = '', fields: FieldIssue[] = []) {
    super(message || code)
    this.name = 'SubmitError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export const trimApi = (api: string): string => api.replace(/\/+$/, '')

export interface SubmitArgs {
  api: string
  type: SubmissionType
  payload: unknown
  /** The language of the submission (`text` and `base` of the payload are in it); `en` when omitted. */
  lang?: TlLang
  /** The contributor bearer token (`contrib.session(api).token`). */
  token: string
  /** Cloudflare Turnstile token of this attempt (single use). */
  turnstileToken: string
  fetchImpl?: typeof fetch
}

/** `POST {api}/api/contrib/submissions/{type}/all`. Resolves with the new id; rejects with a SubmitError. */
export async function postSubmission({ api, type, payload, lang = 'en', token, turnstileToken, fetchImpl = fetch }: SubmitArgs): Promise<{ id: string }> {
  let res: Response
  try {
    res = await fetchImpl(`${trimApi(api)}/api/contrib/submissions/${encodeURIComponent(type)}/all`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ payload, tags: {}, lang, turnstileToken, website: '' }),
    })
  } catch {
    throw new SubmitError(0, 'network')
  }
  if (res.ok) {
    const body = (await res.json().catch(() => ({}))) as { id?: string }
    return { id: body.id ?? '' }
  }
  let code = res.status === 401 ? 'unauthenticated' : res.status === 413 ? 'too_large' : 'unknown'
  let message = ''
  let fields: FieldIssue[] = []
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string; fields?: FieldIssue[] } }
    if (body.error?.code) code = body.error.code
    message = body.error?.message ?? ''
    if (Array.isArray(body.error?.fields)) fields = body.error.fields
  } catch {
    /* not JSON (a proxy error page): keep the status-based code */
  }
  throw new SubmitError(res.status, code, message, fields)
}

/** True when the failure means the session is gone and the contributor has to sign in again. */
export const needsSignIn = (e: unknown): boolean => e instanceof SubmitError && (e.status === 401 || e.code === 'unauthenticated')

/** The localized message of a failed submission (the field problems themselves are shown next to their inputs). */
export function errorText(t: T, e: unknown): string {
  if (!(e instanceof SubmitError)) return t('errUnknown')
  if (needsSignIn(e)) return t('errExpired')
  switch (e.code) {
    case 'validation_failed':
      return t('errValidation')
    case 'turnstile_failed':
      return t('errTurnstile')
    case 'too_large':
      return t('errTooLarge')
    case 'daily_cap':
      return t('errDailyCap')
    case 'pending_cap':
      return t('errPendingCap')
    case 'rate_limited':
      return t('errRateLimited')
    case 'network':
      return t('errNetwork')
    case 'verify_missing':
      return t('verifyMissing')
    case 'verify_load':
      return t('verifyLoadError')
  }
  if (e.status === 413) return t('errTooLarge')
  if (e.status === 429) return t('errRateLimited')
  if (e.status === 0) return t('errNetwork')
  return t('errUnknown')
}

/** A server field problem in the UI language; unknown codes fall back to the server's English message. */
export function fieldText(t: T, f: FieldIssue): string {
  const key = `fe_${f.code}`
  return hasKey(key) ? t(key as Key, f.params) : f.message || f.code
}

/** The line index of a `payload.lines.<i>.<field>` path, or null. */
export function lineIndexOf(path: string): number | null {
  const m = /^payload\.lines\.(\d+)(?:\.|$)/.exec(path)
  return m ? Number(m[1]) : null
}

/** `payload.lines.2.text` -> 'text', `payload.note` -> 'note'; the last path segment. */
export const fieldName = (path: string): string => path.slice(path.lastIndexOf('.') + 1)

// ---- sign-in errors (rejections of `contrib.signIn`) ----

export const MIN_ACCOUNT_AGE_DAYS = 30

interface SignInLike {
  code?: string
  eligibleAt?: number | null
}

export function signInErrorText(t: T, lang: string, e: unknown): string {
  const code = (e as SignInLike | null)?.code
  if (code === 'popup_blocked') return t('popupBlocked')
  if (code === 'closed') return t('signInClosed')
  if (code === 'account_too_young') {
    const at = (e as SignInLike).eligibleAt
    if (!at) return t('tooYoungNoDate', { days: MIN_ACCOUNT_AGE_DAYS })
    return t('tooYoung', { days: MIN_ACCOUNT_AGE_DAYS, date: new Date(at).toLocaleDateString(lang) })
  }
  return t('signInFailed')
}
