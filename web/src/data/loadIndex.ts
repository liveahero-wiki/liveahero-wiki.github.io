// Loads the prebuilt skill search index, caching it in LocalStorage and using
// the tiny version-probe file to avoid re-downloading the full index unless the
// masterdata version changed.
//
// Search runs fully in memory over a few hundred entities, so a single
// LocalStorage blob (well under the ~5 MB limit) is sufficient — no IndexedDB.

import type { SkillIndex } from '../types'

const VERSION_URL = '/api/skill-index-version.json'
const INDEX_URL = '/api/skill-index.json'
const LS_VERSION = 'skillIndexVersion'
const LS_INDEX = 'skillIndex'

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return res.json()
}

function readCache(): { version: string; index: SkillIndex } | null {
  try {
    const version = localStorage.getItem(LS_VERSION)
    const raw = localStorage.getItem(LS_INDEX)
    if (version && raw) return { version, index: JSON.parse(raw) as SkillIndex }
  } catch {
    /* corrupt cache — ignore */
  }
  return null
}

function writeCache(version: string, raw: string): void {
  try {
    localStorage.setItem(LS_VERSION, version)
    localStorage.setItem(LS_INDEX, raw)
  } catch {
    /* quota / private mode — non-fatal, app still works this session */
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(LS_VERSION)
    localStorage.removeItem(LS_INDEX)
  } catch { /* quota / private mode */ }
}

/**
 * Returns the parsed index { version, categories, statuses, entities }.
 * Flow: probe version -> if it matches cache, use cache -> else download full
 * index and refresh cache. Falls back to cache (then direct download) if the
 * probe fails.
 */
export async function loadIndex(): Promise<SkillIndex> {
  const cache = readCache()

  let remoteVersion: string | null = null
  try {
    const probe = await fetchJson(VERSION_URL) as { version?: unknown }
    // Guard: the cast above is not a runtime check. Only accept a non-empty
    // string so a missing/malformed version field doesn't silently defeat the
    // cache by comparing undefined === cached-version-string.
    if (typeof probe.version === 'string' && probe.version) {
      remoteVersion = probe.version
    }
  } catch {
    if (cache) return cache.index
    // No cache and probe failed — try the full index directly.
  }

  if (cache && remoteVersion && cache.version === remoteVersion) {
    return cache.index
  }

  // Download full index. Store the raw text so we cache exactly what we parsed.
  // Wrap in try/catch so a network error after cache expiry falls back to the
  // stale cache rather than surfacing an uncaught promise rejection.
  let res: Response
  try {
    res = await fetch(INDEX_URL, { cache: 'no-cache' })
  } catch (err) {
    if (cache) return cache.index
    throw err
  }
  if (!res.ok) {
    if (cache) return cache.index
    throw new Error(`fetch ${INDEX_URL} -> ${res.status}`)
  }
  const raw = await res.text()
  const index = JSON.parse(raw) as SkillIndex
  writeCache(index.version ?? remoteVersion ?? '', raw)
  return index
}
