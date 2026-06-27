// Loads the prebuilt skill search index, caching it in LocalStorage and using
// the tiny version-probe file to avoid re-downloading the full index unless the
// masterdata version changed.
//
// Search runs fully in memory over a few hundred entities, so a single
// LocalStorage blob (well under the ~5 MB limit) is sufficient — no IndexedDB.

const VERSION_URL = '/api/skill-index-version.json'
const INDEX_URL = '/api/skill-index.json'
const LS_VERSION = 'skillIndexVersion'
const LS_INDEX = 'skillIndex'

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return res.json()
}

function readCache() {
  try {
    const version = localStorage.getItem(LS_VERSION)
    const raw = localStorage.getItem(LS_INDEX)
    if (version && raw) return { version, index: JSON.parse(raw) }
  } catch {
    /* corrupt cache — ignore */
  }
  return null
}

function writeCache(version, raw) {
  try {
    localStorage.setItem(LS_VERSION, version)
    localStorage.setItem(LS_INDEX, raw)
  } catch {
    /* quota / private mode — non-fatal, app still works this session */
  }
}

/**
 * Returns the parsed index { version, categories, statuses, entities }.
 * Flow: probe version -> if it matches cache, use cache -> else download full
 * index and refresh cache. Falls back to cache (then direct download) if the
 * probe fails.
 */
export async function loadIndex() {
  const cache = readCache()

  let remoteVersion = null
  try {
    const probe = await fetchJson(VERSION_URL)
    remoteVersion = probe.version
  } catch {
    if (cache) return cache.index
    // No cache and probe failed — try the full index directly.
  }

  if (cache && remoteVersion && cache.version === remoteVersion) {
    return cache.index
  }

  // Download full index. Store the raw text so we cache exactly what we parsed.
  const res = await fetch(INDEX_URL, { cache: 'no-cache' })
  if (!res.ok) {
    if (cache) return cache.index
    throw new Error(`fetch ${INDEX_URL} -> ${res.status}`)
  }
  const raw = await res.text()
  const index = JSON.parse(raw)
  writeCache(index.version ?? remoteVersion ?? '', raw)
  return index
}
