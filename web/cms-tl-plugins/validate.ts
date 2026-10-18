// Client mirrors of the server validators (wiki-cms/src/types/lah-{voice-tl,bio-tl,page-edit}/validate.ts).
// Keep them in sync. Error paths carry the `payload.` prefix, like the server emits them, so client and
// server errors merge uniformly (plugin-api.ts: setErrors also accepts them without the prefix).

import type { FieldError } from '../cms-plugin/plugin-api.ts'
import { contribGuard } from './guard.ts'
import { KEY_RE, baseProblem, noteProblem, optionalTextProblem, textProblem, type Problem } from './text-rules.ts'

export const MAX_LINES = 100
export const AFTER_MAX_CHARS = 120_000
export const SUMMARY_MIN = 3
export const SUMMARY_MAX = 120

const err = (path: string, code: string, message: string, params?: FieldError['params']): FieldError => ({
  path,
  code,
  message,
  ...(params ? { params } : {}),
})
const fromProblem = (path: string, p: Problem): FieldError => err(path, p.code, p.message, p.params)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

// ---- lah-voice-tl

export function validateVoice(input: unknown): FieldError[] {
  const errors: FieldError[] = []
  if (!isObj(input)) return [err('payload', 'payload_invalid', 'The suggestion is malformed.')]

  const resourceName = input.resourceName
  const nameOk = typeof resourceName === 'string' && resourceName.length <= 100 && KEY_RE.test(resourceName)
  if (!nameOk) errors.push(err('payload.resourceName', 'resource_invalid', 'Invalid voice resource name.'))

  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > MAX_LINES) {
    errors.push(err('payload.lines', 'lines_length', `Suggest 1 to ${MAX_LINES} lines.`, { min: 1, max: MAX_LINES }))
    return errors
  }

  const prefix = nameOk ? `voice_${resourceName}_` : ''
  const seen = new Set<string>()
  input.lines.forEach((raw: unknown, i: number) => {
    const p = `payload.lines.${i}`
    if (!isObj(raw)) {
      errors.push(err(p, 'payload_invalid', 'The line is malformed.'))
      return
    }
    const key = raw.key
    if (typeof key !== 'string' || key.length > 200 || !KEY_RE.test(key) || (nameOk && !(key.startsWith(prefix) && key.length > prefix.length))) {
      errors.push(err(`${p}.key`, 'key_invalid', 'The line does not belong to this voice resource.'))
    } else if (seen.has(key)) {
      errors.push(err(`${p}.key`, 'key_duplicate', 'This line is listed twice.'))
    } else {
      seen.add(key)
    }
    const b = baseProblem(raw.base)
    if (b) errors.push(fromProblem(`${p}.base`, b))
    // a line without Japanese text may carry the transcription; then the translation is optional
    const jp = optionalTextProblem(raw.jp)
    if (jp) errors.push(fromProblem(`${p}.jp`, jp))
    const hasJp = typeof raw.jp === 'string' && raw.jp.trim() !== ''
    const t = hasJp && (typeof raw.text !== 'string' || raw.text.trim() === '') ? null : textProblem(raw.text, raw.base)
    if (t) errors.push(fromProblem(`${p}.text`, t))
  })

  const n = noteProblem(input.note)
  if (n) errors.push(fromProblem('payload.note', n))
  return errors
}

// ---- lah-bio-tl

export function validateBio(input: unknown): FieldError[] {
  const errors: FieldError[] = []
  if (!isObj(input)) return [err('payload', 'payload_invalid', 'The suggestion is malformed.')]

  const key = input.key
  if (!(typeof key === 'string' && key.length <= 100 && KEY_RE.test(key))) errors.push(err('payload.key', 'key_invalid', 'Invalid bio key.'))

  const b = baseProblem(input.base)
  if (b) errors.push(fromProblem('payload.base', b))
  const t = textProblem(input.text, input.base)
  if (t) errors.push(fromProblem('payload.text', t))
  const n = noteProblem(input.note)
  if (n) errors.push(fromProblem('payload.note', n))
  return errors
}

// ---- lah-page-edit

const SHA_RE = /^[0-9a-f]{40}$/
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001f\u007f\u2028\u2029]/

/** The guard's list (wiki_plugins/lib/contrib-guard.js EDITABLE_PATHS) is the single definition of an editable page. */
export const isEditablePath = (path: string): boolean => contribGuard.isEditablePath(path)
export const isBlobSha = (s: string): boolean => SHA_RE.test(s.toLowerCase())
/** A leading `---` front matter fence line. */
export const startsWithFence = (text: string): boolean => /^---[ \t]*(\r?\n|$)/.test(text)

export function validatePageEdit(input: unknown): FieldError[] {
  if (!isObj(input)) return [err('payload', 'payload_invalid', 'The payload must be an object.')]
  const errors: FieldError[] = []

  if (typeof input.path !== 'string' || !isEditablePath(input.path)) {
    errors.push(err('payload.path', 'path_not_editable', 'This page cannot be edited here.'))
  }

  const baseSha = typeof input.baseSha === 'string' ? input.baseSha.toLowerCase() : ''
  if (!SHA_RE.test(baseSha)) errors.push(err('payload.baseSha', 'base_sha_invalid', 'baseSha must be a 40-character git blob sha.'))

  const after = input.after
  if (typeof after !== 'string') {
    errors.push(err('payload.after', 'after_invalid', 'The new text must be a string.'))
  } else if (after.length > AFTER_MAX_CHARS) {
    errors.push(err('payload.after', 'after_too_long', `The new text must be at most ${AFTER_MAX_CHARS} characters.`, { max: AFTER_MAX_CHARS }))
  } else if (after.includes('\u0000')) {
    errors.push(err('payload.after', 'after_nul', 'The text must not contain NUL characters.'))
  } else if (startsWithFence(after)) {
    errors.push(err('payload.after', 'after_front_matter', 'The text must not start with a front matter fence (---); front matter cannot be edited here.'))
  }

  const raw = input.summary
  const summary = typeof raw === 'string' ? raw.trim() : ''
  if (typeof raw !== 'string' || summary.length < SUMMARY_MIN || summary.length > SUMMARY_MAX) {
    errors.push(err('payload.summary', 'summary_length', `The summary must be ${SUMMARY_MIN}-${SUMMARY_MAX} characters.`, { min: SUMMARY_MIN, max: SUMMARY_MAX }))
  } else if (CONTROL_RE.test(summary)) {
    errors.push(err('payload.summary', 'summary_plain', 'The summary must be a single line of plain text.'))
  }
  return errors
}

/** Errors whose path is exactly `payload.<field>` or below it, with the prefix stripped; also accepts unprefixed paths. */
export function errorsFor(errors: FieldError[], field: string): FieldError[] {
  return errors.filter((e) => {
    const p = e.path.replace(/^payload\.?/, '')
    return p === field || p.startsWith(`${field}.`)
  })
}
