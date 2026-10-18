// Payload shapes of the three submission types and tolerant readers for them.
// The views receive server-approved payloads but must not crash on an older/newer shape.

export interface VoiceLine {
  /** `voice_<resourceName>_<part>` */
  key: string
  /** The EN text the contributor saw (empty when there was none). */
  base: string
  /** The EN suggestion; empty only when `jp` is given. */
  text: string
  /** The Japanese transcription of a line that has no Japanese text yet. */
  jp?: string
}
export interface VoicePayload {
  resourceName: string
  lines: VoiceLine[]
  note?: string
}
export interface BioPayload {
  key: string
  base: string
  text: string
  note?: string
}
export interface PageEditPayload {
  path: string
  baseSha: string
  after: string
  summary: string
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function readVoice(payload: unknown): VoicePayload {
  const p = isObj(payload) ? payload : {}
  const lines = Array.isArray(p.lines) ? p.lines : []
  const out: VoicePayload = {
    resourceName: str(p.resourceName),
    lines: lines.map((raw) => {
      const l = isObj(raw) ? raw : {}
      const jp = str(l.jp)
      return { key: str(l.key), base: str(l.base), text: str(l.text), ...(jp.trim() ? { jp } : {}) }
    }),
  }
  if (typeof p.note === 'string' && p.note.trim()) out.note = p.note
  return out
}

export function readBio(payload: unknown): BioPayload {
  const p = isObj(payload) ? payload : {}
  const out: BioPayload = { key: str(p.key), base: str(p.base), text: str(p.text) }
  if (typeof p.note === 'string' && p.note.trim()) out.note = p.note
  return out
}

export function readPageEdit(payload: unknown): PageEditPayload {
  const p = isObj(payload) ? payload : {}
  return { path: str(p.path), baseSha: str(p.baseSha), after: str(p.after), summary: str(p.summary) }
}

/** The part name of a voice key (`voice_ryekie_action` -> `action`); the whole key when it does not carry the prefix. */
export function voicePart(resourceName: string, key: string): string {
  const prefix = `voice_${resourceName}_`
  return key.startsWith(prefix) && key.length > prefix.length ? key.slice(prefix.length) : key
}

/** Single-line, at most `max` characters (ellipsis when cut): for compact views. */
export function clip(s: string, max: number): string {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length > max ? `${one.slice(0, max - 1).trimEnd()}…` : one
}

export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`

/** Repo-relative page path -> live wiki path (`_charas/x.md` -> `/charas/x/`), or null for an unknown shape. */
export function livePagePath(path: string): string | null {
  let m = /^_(charas|events|main_quests)\/([^/]+)\.md$/.exec(path)
  if (m) return `/${m[1]}/${m[2]}/`
  m = /^guide\/([^/]+)\.md$/.exec(path)
  if (m) return `/guide/${m[1]}/`
  m = /^(chara_quests|mobs)\.md$/.exec(path)
  return m ? `/${m[1]}/` : null
}
