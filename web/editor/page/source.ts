// The page source the editor starts from: fetched from raw.githubusercontent.com, front matter split off (never shown),
// the git blob sha of the WHOLE original file computed in the browser.

import { gitBlobSha, splitFrontMatter } from '../../../wiki_plugins/lib/contrib-guard.js'
import { DEFAULT_BRANCH } from '../core/config.ts'

export interface Source {
  baseSha: string
  /** Body as the textarea holds it (LF only). */
  before: string
  /** The original file used CRLF line breaks: `after` is converted back before sending. */
  crlf: boolean
}

export const rawUrl = (repo: string, path: string): string => `https://raw.githubusercontent.com/${repo}/${DEFAULT_BRANCH}/${path.split('/').map(encodeURIComponent).join('/')}`

/** Splits the text of a page file. `baseSha` hashes the whole original file. */
export async function parseSource(text: string): Promise<Source> {
  const baseSha: string = await gitBlobSha(text)
  const { body } = splitFrontMatter(text)
  return { baseSha, before: body.replace(/\r\n/g, '\n'), crlf: body.includes('\r\n') }
}

/** The text to send: line breaks as the original file had them. */
export const toFileEol = (body: string, crlf: boolean): string => (crlf ? body.replace(/\n/g, '\r\n') : body)

export async function loadSource(repo: string, path: string, fetchImpl: typeof fetch = fetch): Promise<Source> {
  const res = await fetchImpl(rawUrl(repo, path), { cache: 'no-cache' })
  if (!res.ok) throw new Error(`source: HTTP ${res.status}`)
  return parseSource(await res.text())
}
