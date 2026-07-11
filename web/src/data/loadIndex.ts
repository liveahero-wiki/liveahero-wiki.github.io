// Loads the prebuilt skill search index, caching it in LocalStorage and using
// the tiny version-probe file to avoid re-downloading the full index unless the
// masterdata version changed.
//
// Search runs fully in memory over a few hundred entities, so a single
// LocalStorage blob (well under the ~5 MB limit) is sufficient — no IndexedDB.
//
// One index file exists per language (see tools/generate_skill_search_index.py
// --lang); the cache is namespaced per language so switching languages doesn't
// clobber another language's cached copy.

import type { SkillIndex } from '../types'
import type { Lang } from '../lib/lang'

function versionUrl(lang: Lang): string {
  return `/api/skill-index-version.${lang}.json`
}

function indexUrl(lang: Lang): string {
  return `/api/skill-index.${lang}.json`
}

function lsVersionKey(lang: Lang): string {
  return `skillIndexVersion:${lang}`
}

function lsIndexKey(lang: Lang): string {
  return `skillIndex:${lang}`
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return res.json()
}

function readCache(lang: Lang): { version: string; index: SkillIndex } | null {
  try {
    const version = localStorage.getItem(lsVersionKey(lang))
    const raw = localStorage.getItem(lsIndexKey(lang))
    if (version && raw) return { version, index: JSON.parse(raw) as SkillIndex }
  } catch {
    /* corrupt cache — ignore */
  }
  return null
}

function writeCache(lang: Lang, version: string, raw: string): void {
  try {
    localStorage.setItem(lsVersionKey(lang), version)
    localStorage.setItem(lsIndexKey(lang), raw)
  } catch {
    /* quota / private mode — non-fatal, app still works this session */
  }
}

export function clearCache(lang: Lang): void {
  try {
    localStorage.removeItem(lsVersionKey(lang))
    localStorage.removeItem(lsIndexKey(lang))
  } catch { /* quota / private mode */ }
}

/**
 * Returns the parsed index { version, categories, statuses, entities } for `lang`.
 * Flow: probe version -> if it matches cache, use cache -> else download full
 * index and refresh cache. Falls back to cache (then direct download) if the
 * probe fails.
 */
export async function loadIndex(lang: Lang): Promise<SkillIndex> {
  const cache = readCache(lang)

  let remoteVersion: string | null = null
  try {
    const probe = await fetchJson(versionUrl(lang)) as { version?: unknown }
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
  const url = indexUrl(lang)
  try {
    res = await fetch(url, { cache: 'no-cache' })
  } catch (err) {
    if (cache) return cache.index
    throw err
  }
  if (!res.ok) {
    if (cache) return cache.index
    throw new Error(`fetch ${url} -> ${res.status}`)
  }
  const raw = await res.text()
  const index = JSON.parse(raw) as SkillIndex
  writeCache(lang, index.version ?? remoteVersion ?? '', raw)
  return index
}
