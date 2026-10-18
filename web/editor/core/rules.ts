// Client-side mirror of the wiki-cms submission rules for the three contributor types (wiki-cms src/types/tl-text.ts,
// lah-voice-tl, lah-bio-tl, lah-page-edit). The Worker stays authoritative; these checks only save a round trip.
// Pure (no DOM), so node --test can import it.

export const TEXT_MAX = 2000
export const NOTE_MAX = 500
export const MAX_LINES = 100
export const AFTER_MAX_CHARS = 120_000
export const SUMMARY_MIN = 3
export const SUMMARY_MAX = 120

export type TextProblem = 'empty' | 'angle' | 'template' | 'control' | 'tooLong' | 'same'

/** Line breaks as `\n` (CRLF and lone CR). */
export const normalizeNewlines = (s: string): string => s.replace(/\r\n?/g, '\n')

// Control characters other than \n (tab included), DEL and the C1 range.
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/

/** Why `s` is not plain text, or null. */
export function plainTextProblem(s: string): 'angle' | 'template' | 'control' | null {
  if (s.includes('<') || s.includes('>')) return 'angle'
  if (s.includes('{%') || s.includes('{{') || s.includes('{#')) return 'template'
  if (CONTROL_RE.test(s)) return 'control'
  return null
}

/** The first problem of a suggested text against the text the contributor saw, or null. The value is normalized and trimmed like the server does. */
export function checkText(raw: string, base: string): TextProblem | null {
  const text = normalizeNewlines(raw).trim()
  if (!text) return 'empty'
  if (text.length > TEXT_MAX) return 'tooLong'
  const plain = plainTextProblem(text)
  if (plain) return plain
  if (text === normalizeNewlines(base).trim()) return 'same'
  return null
}

/** Problem of the optional moderator note, or null (blank is fine). */
export function checkNote(raw: string): TextProblem | null {
  const note = normalizeNewlines(raw).trim()
  if (!note) return null
  if (note.length > NOTE_MAX) return 'tooLong'
  return plainTextProblem(note)
}

export interface LineState {
  key: string
  /** The EN text shown to the contributor ('' for none). */
  base: string
  /** What the textarea holds now. */
  value: string
  /** What the Japanese textarea holds now; only set for a line the game has no Japanese text for (and that has not been sent yet). */
  jp?: string
}

export interface VoiceLine {
  key: string
  base: string
  /** Empty only when `jp` is given. */
  text: string
  /** The Japanese transcription; sent only when written. */
  jp?: string
}

const trimmed = (s: string | undefined): string => normalizeNewlines(s ?? '').trim()

/** A line counts as changed once its trimmed text differs from the trimmed text it started from, or a Japanese transcription was written. Untouched lines are never sent. */
export function isChanged(l: LineState): boolean {
  return trimmed(l.value) !== trimmed(l.base) || trimmed(l.jp) !== ''
}

export interface LineProblems {
  text: TextProblem | null
  jp: TextProblem | null
}

/** The problems of one changed line. A written Japanese transcription makes the English text optional. */
export function checkLine(l: LineState): LineProblems {
  const jpText = trimmed(l.jp)
  let jp: TextProblem | null = null
  if (jpText) {
    if (jpText.length > TEXT_MAX) jp = 'tooLong'
    else jp = plainTextProblem(jpText)
  }
  const text = trimmed(l.value) === '' && jpText ? null : checkText(l.value, l.base)
  return { text, jp }
}

/** `{ key, base, text }` (plus `jp` when written) of a changed line, trimmed and normalized. */
export function toVoiceLine(l: LineState): VoiceLine {
  const jp = trimmed(l.jp)
  return { key: l.key, base: l.base, text: trimmed(l.value), ...(jp ? { jp } : {}) }
}

export function changedLines(lines: LineState[]): LineState[] {
  return lines.filter(isChanged)
}

/** The first `max` changed lines in `{ key, base, text }` form, plus how many changed lines do not fit. */
export function batchOf(lines: LineState[], max = MAX_LINES): { send: VoiceLine[]; overflow: number } {
  const changed = changedLines(lines)
  return {
    send: changed.slice(0, max).map(toVoiceLine),
    overflow: Math.max(0, changed.length - max),
  }
}

export const isPlaceholder = (text: string): boolean => text.trim() === '-'

/** `voice_<resourceName>_<part>`: only keys of the table's own resource are offered. */
export function keyBelongs(key: string, resourceName: string): boolean {
  const prefix = `voice_${resourceName}_`
  return /^[A-Za-z0-9_]+$/.test(key) && key.startsWith(prefix) && key.length > prefix.length
}

export type SummaryProblem = 'length' | 'plain' | null
// eslint-disable-next-line no-control-regex
const SUMMARY_CONTROL = /[\u0000-\u001f\u007f\u2028\u2029]/

export function checkSummary(raw: string): SummaryProblem {
  const s = raw.trim()
  if (s.length < SUMMARY_MIN || s.length > SUMMARY_MAX) return 'length'
  return SUMMARY_CONTROL.test(s) ? 'plain' : null
}

/** Structural rules of `after` the Worker enforces (the Liquid/HTML guard is separate): size, NUL and a leading front matter fence. */
export type AfterProblem = 'tooLong' | 'nul' | 'fence' | null
export function checkAfter(after: string): AfterProblem {
  if (after.length > AFTER_MAX_CHARS) return 'tooLong'
  if (after.includes('\u0000')) return 'nul'
  if (/^---[ \t]*(\r?\n|$)/.test(after)) return 'fence'
  return null
}

export interface ResourceBatch {
  resource: string
  lines: VoiceLine[]
}

/** Changed lines grouped per resource, in first-seen order, at most `max` lines per group (one lah-voice-tl submission each). */
export function batchesOf(lines: Array<LineState & { resource: string }>, max = MAX_LINES): { groups: ResourceBatch[]; overflow: number } {
  const order: string[] = []
  const byResource = new Map<string, Array<LineState & { resource: string }>>()
  for (const l of lines) {
    if (!isChanged(l)) continue
    if (!byResource.has(l.resource)) {
      byResource.set(l.resource, [])
      order.push(l.resource)
    }
    byResource.get(l.resource)!.push(l)
  }
  let overflow = 0
  const groups = order.map((resource) => {
    const all = byResource.get(resource)!
    overflow += Math.max(0, all.length - max)
    return { resource, lines: all.slice(0, max).map(toVoiceLine) }
  })
  return { groups, overflow }
}
