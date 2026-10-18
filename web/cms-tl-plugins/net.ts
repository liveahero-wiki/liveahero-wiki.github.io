// Network helpers: wiki /api/*.json files (resolved against the module's own URL) and the public GitHub API.
// Uses the global `fetch` at call time, so tests and the dev harness can replace it.

// One definition of the repository, shared with the contributor editor (web/editor/core/config.ts).
import { DEFAULT_BRANCH, DEFAULT_REPO } from '../editor/core/config.ts'

export const REPO = DEFAULT_REPO
export const BRANCH = DEFAULT_BRANCH
const GITHUB_API = 'https://api.github.com'

// ---- wiki files

let baseUrl: string = import.meta.url

/** Where the plugin was loaded from (default: this module). The harness and tests override it. */
export function setBaseUrl(url: string): void {
  baseUrl = url
}

/**
 * Plugin at <origin>/assets/cms/<name>.js -> ../../api/<file> = <origin>/api/<file>.
 * Built from a variable on purpose: a literal `new URL('...', import.meta.url)` is an asset import for Vite.
 */
export const apiUrl = (file: string): string => new URL(`../../api/${file}`, baseUrl).href

/** The wiki origin the plugin came from ('' when it cannot be derived, e.g. under node:test). */
export function wikiOrigin(): string {
  try {
    const o = new URL(baseUrl).origin
    return o === 'null' ? '' : o
  } catch {
    return ''
  }
}

const memo = new Map<string, Promise<unknown>>()

/** Memoizes a promise per key; a failure is forgotten so a later call retries. */
export function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  let p = memo.get(key) as Promise<T> | undefined
  if (!p) {
    p = load()
    memo.set(key, p)
    p.catch(() => {
      if (memo.get(key) === p) memo.delete(key)
    })
  }
  return p
}

export function resetNetCache(): void {
  memo.clear()
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export interface RosterEntry {
  jp?: string
  en?: string
}
export type VoiceRoster = Record<string, Record<string, RosterEntry>>
export type BioRoster = Record<string, RosterEntry>

/** The voice roster's `resources`, or null when it cannot be loaded (the views then show '-'). */
export function loadVoiceRoster(): Promise<VoiceRoster | null> {
  return once('voice-roster', async () => {
    const j = await getJson(apiUrl('voice-roster.json'))
    if (!isObj(j) || !isObj(j.resources)) throw new Error('shape')
    return j.resources as VoiceRoster
  }).catch(() => null)
}

export function loadBioRoster(): Promise<BioRoster | null> {
  return once('bio-roster', async () => {
    const j = await getJson(apiUrl('bio-roster.json'))
    if (!isObj(j) || !isObj(j.bios)) throw new Error('shape')
    return j.bios as BioRoster
  }).catch(() => null)
}

/** Includes contributors may use (guard input); null when the list cannot be loaded. */
export function loadAllowedIncludes(): Promise<string[] | null> {
  return once('contrib-includes', async () => {
    const j = await getJson(apiUrl('contrib-includes.json'))
    if (!isObj(j) || !Array.isArray(j.includes)) throw new Error('shape')
    return j.includes.filter((s): s is string => typeof s === 'string')
  }).catch(() => null)
}

/** The JP text of a voice line / bio from a roster entry, or '' (shown as '-'). */
export const jpOf = (e: RosterEntry | undefined): string => (e && typeof e.jp === 'string' ? e.jp : '')

export function voiceJp(roster: VoiceRoster | null, resourceName: string, key: string): string {
  if (!roster || !Object.hasOwn(roster, resourceName)) return ''
  const r = roster[resourceName]
  return isObj(r) && Object.hasOwn(r, key) ? jpOf(r[key]) : ''
}

export function bioJp(roster: BioRoster | null, key: string): string {
  return roster && Object.hasOwn(roster, key) ? jpOf(roster[key]) : ''
}

// ---- GitHub

export type GithubErrorKind = 'rate_limit' | 'not_found' | 'network' | 'http' | 'shape'

export class GithubError extends Error {
  kind: GithubErrorKind
  constructor(kind: GithubErrorKind, message: string) {
    super(message)
    this.name = 'GithubError'
    this.kind = kind
  }
}

/** Decodes a GitHub contents/blob `content` (base64 with line breaks) as UTF-8. */
export function decodeBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\s+/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

/** Turns a failed GitHub response into a message a moderator can act on. */
export function githubHttpError(status: number, headers: { get(name: string): string | null }, what: string): GithubError {
  const remaining = headers.get('x-ratelimit-remaining')
  if (status === 429 || (status === 403 && remaining === '0')) {
    const reset = Number(headers.get('x-ratelimit-reset'))
    const when = Number.isFinite(reset) && reset > 0 ? ` It resets at ${new Date(reset * 1000).toLocaleTimeString()}.` : ''
    return new GithubError('rate_limit', `GitHub's anonymous API rate limit was reached.${when} Try again later.`)
  }
  if (status === 404) return new GithubError('not_found', `${what} was not found on GitHub.`)
  return new GithubError('http', `GitHub returned HTTP ${status} for ${what}.`)
}

async function githubGet(path: string, what: string): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(`${GITHUB_API}${path}`, { headers: { Accept: 'application/vnd.github+json' } })
  } catch {
    throw new GithubError('network', 'Could not reach GitHub (network error).')
  }
  if (!res.ok) throw githubHttpError(res.status, res.headers, what)
  try {
    return await res.json()
  } catch {
    throw new GithubError('shape', 'GitHub sent an unreadable response.')
  }
}

/** The text of a git blob (immutable, so cached per sha). */
export function fetchBlobText(sha: string): Promise<string> {
  return once(`blob:${sha}`, async () => {
    const j = await githubGet(`/repos/${REPO}/git/blobs/${encodeURIComponent(sha)}`, `The base version ${sha.slice(0, 7)}`)
    if (!isObj(j) || j.encoding !== 'base64' || typeof j.content !== 'string') throw new GithubError('shape', 'GitHub sent an unexpected blob response.')
    return decodeBase64Utf8(j.content)
  })
}

/** The blob sha of `path` on the current master. */
export async function fetchCurrentSha(path: string): Promise<string> {
  const encoded = path.split('/').map(encodeURIComponent).join('/')
  const j = await githubGet(`/repos/${REPO}/contents/${encoded}?ref=${BRANCH}`, `${path} on ${BRANCH}`)
  if (!isObj(j) || j.type !== 'file' || typeof j.sha !== 'string' || !/^[0-9a-f]{40}$/.test(j.sha)) {
    throw new GithubError('shape', 'GitHub sent an unexpected contents response.')
  }
  return j.sha
}

export const githubFileUrl = (path: string): string => `https://github.com/${REPO}/blob/${BRANCH}/${path.split('/').map(encodeURIComponent).join('/')}`
