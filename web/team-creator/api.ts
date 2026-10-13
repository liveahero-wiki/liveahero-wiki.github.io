// Network and small helpers of the Team Creator page: the public blob, the demo link, and the bridge to the
// wiki-cms submit form (`window.cmsEmbed.openForm`, see wiki-cms docs/EMBED.md).

import type { PublicBlob } from '../cms-plugin/api-types.ts'
import type { Lang } from './lang.ts'

/** The wiki-cms submission type this page shows. Deliberately not a `data-cms-type` attribute (v1.js would take the element over). */
export const TYPE = 'lah-team-formation'

const enc = encodeURIComponent

/** `GET {api}/api/v1/submissions/{type}/{group}`: no query string and default HTTP caching (the URL is canonical). */
export async function fetchBlob(api: string, group: string): Promise<PublicBlob> {
  const res = await fetch(`${api}/api/v1/submissions/${enc(TYPE)}/${enc(group)}`)
  if (!res.ok) throw new Error(`submissions: HTTP ${res.status}`)
  return (await res.json()) as PublicBlob
}

export function currentTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// ---- demo link ----

export type DemoPlatform = 'YouTube' | 'X' | 'Bluesky'

/** Mirrors wiki-cms src/core/demo-url.ts `demoPlatform`; returns the display name. */
export function demoPlatform(host: string): DemoPlatform | null {
  const h = host.toLowerCase()
  if (h === 'youtube.com' || h.endsWith('.youtube.com') || h === 'youtu.be') return 'YouTube'
  if (h === 'twitter.com' || h.endsWith('.twitter.com') || h === 'x.com' || h.endsWith('.x.com')) return 'X'
  if (h === 'bsky.app') return 'Bluesky'
  return null
}

export function parseHttps(url: string): URL | null {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' ? u : null
  } catch {
    return null
  }
}

// ---- submit form (wiki-cms) ----

interface CmsEmbed {
  openForm?: (options: Record<string, unknown>) => Promise<void>
}

const embeds = new Map<string, Promise<void>>()

/** Imports `{api}/embed/v1.js` on first use (the same URL returns the same module instance); a failure can be retried. */
function loadEmbed(api: string): Promise<void> {
  let p = embeds.get(api)
  if (!p) {
    p = import(/* @vite-ignore */ `${api}/embed/v1.js`).then(() => undefined)
    embeds.set(api, p)
    p.catch(() => embeds.delete(api))
  }
  return p
}

export interface OpenFormArgs {
  api: string
  group: string
  /** URL of the game plugin module (`data-cms-plugin`). */
  plugin: string
  /** `groupOptions` of the list blob. */
  groupOptions: Record<string, unknown>
  /** Dedicated empty element the dialog is appended to. */
  host: HTMLElement
  lang: Lang
}

/** Opens the wiki-cms submit form. Rejects when the embed cannot be loaded or the options are rejected. */
export async function openCmsForm({ api, group, plugin, groupOptions, host, lang }: OpenFormArgs): Promise<void> {
  await loadEmbed(api)
  const embed = (window as unknown as { cmsEmbed?: CmsEmbed }).cmsEmbed
  if (!embed?.openForm) throw new Error('wiki-cms embed has no openForm')
  await embed.openForm({ host, type: TYPE, group, plugin, groupOptions, api, lang })
}
