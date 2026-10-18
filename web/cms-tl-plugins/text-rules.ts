// Client mirror of wiki-cms/src/types/tl-text.ts (the shared text rules of lah-voice-tl / lah-bio-tl).
// Keep both in sync. Free of DOM/CSS imports so `node --test` can run it with type stripping.

export const TEXT_MAX = 2000
export const NOTE_MAX = 500
export const KEY_RE = /^[A-Za-z0-9_]+$/

export interface Problem {
  code: string
  message: string
  params?: Record<string, string | number>
}

/** Line breaks as `\n` (CRLF and lone CR). */
export const normalizeNewlines = (s: string): string => s.replace(/\r\n?/g, '\n')

// Control characters other than \n (tab included), DEL and the C1 range.
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/

/** Why `s` is not plain text, or null. */
export function plainTextProblem(s: string): string | null {
  if (s.includes('<') || s.includes('>')) return 'HTML is not allowed: remove < and >.'
  if (s.includes('{%') || s.includes('{{') || s.includes('{#')) return 'Template syntax is not allowed: remove {%, {{ and {#.'
  if (CONTROL_RE.test(s)) return 'Control characters are not allowed.'
  return null
}

/** True when the suggestion equals the text the contributor saw (ignoring surrounding space and line-break style). */
export const sameAsBase = (text: string, base: string): boolean => text === normalizeNewlines(base).trim()

/**
 * The suggested text: required, trimmed, plain, at most TEXT_MAX; when `base` is a string it must differ from it.
 * Returns the first problem, or null.
 */
export function textProblem(raw: unknown, base?: unknown): Problem | null {
  if (typeof raw !== 'string') return { code: 'text_required', message: 'A translation is required.' }
  const text = normalizeNewlines(raw).trim()
  if (!text) return { code: 'text_required', message: 'A translation is required.' }
  if (text.length > TEXT_MAX) return { code: 'text_too_long', message: `At most ${TEXT_MAX} characters.`, params: { max: TEXT_MAX } }
  const plain = plainTextProblem(text)
  if (plain) return { code: 'text_invalid', message: plain }
  if (typeof base === 'string' && sameAsBase(text, base)) {
    return { code: 'text_same_as_base', message: 'The suggestion is the same as the current text.' }
  }
  return null
}

/** An optional text (the JP transcription of a voice line): absent or blank is fine, else trimmed, plain, at most TEXT_MAX. */
export function optionalTextProblem(raw: unknown): Problem | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'string') return { code: 'text_invalid', message: 'Must be text.' }
  if (!normalizeNewlines(raw).trim()) return null
  const p = textProblem(raw)
  return p
}

/** `base` may be empty; any string up to TEXT_MAX. */
export function baseProblem(v: unknown): Problem | null {
  if (typeof v !== 'string' || v.length > TEXT_MAX) {
    return { code: 'base_invalid', message: `Must be text of at most ${TEXT_MAX} characters.`, params: { max: TEXT_MAX } }
  }
  return null
}

/** Optional moderator note: plain text, at most NOTE_MAX; absent or blank is fine. */
export function noteProblem(v: unknown): Problem | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string') return { code: 'note_invalid', message: 'The note must be text.' }
  const note = normalizeNewlines(v).trim()
  if (!note) return null
  if (note.length > NOTE_MAX) return { code: 'note_too_long', message: `At most ${NOTE_MAX} characters.`, params: { max: NOTE_MAX } }
  const plain = plainTextProblem(note)
  return plain ? { code: 'note_invalid', message: plain } : null
}
