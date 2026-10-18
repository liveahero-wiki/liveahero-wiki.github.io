// Network and small helpers of the Team Creator page: the public blob, the demo link, and the bridge to the
// wiki-cms submit form (`window.cmsEmbed.openForm`, see wiki-cms docs/EMBED.md).

import type { ContribContent, ContribSubmission, ContribUser, PublicBlob } from '../cms-plugin/api-types.ts'
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

/** What `window.cmsEmbed.contrib` offers (wiki-cms embed/src/loader.ts). */
export interface CmsContrib {
  session(api?: string): { token: string; user: ContribUser } | null
  signIn(api?: string, provider?: string): Promise<{ token: string; user: ContribUser }>
  signOut(api?: string): Promise<void>
  mine(type?: string, api?: string): Promise<ContribSubmission[]>
  withdrawRevision(submissionId: string, api?: string): Promise<void>
}

interface CmsEmbed {
  openForm?: (options: Record<string, unknown>) => Promise<void>
  contrib?: CmsContrib
}

/** A provider account must be this old to become a contributor (mirrors wiki-cms src/shared/contrib.ts; the Worker enforces it). */
export const MIN_ACCOUNT_AGE_DAYS = 30

// The embed keeps the contributor session in this page origin's localStorage under `cms-contrib:<api>` and fires a
// `cms:contrib` window event ({ detail: { api } }) when it changes. Reading both here lets the page show who is signed
// in WITHOUT loading the embed for visitors who never signed in.
export const SESSION_EVENT = 'cms:contrib'

export function storedUser(api: string): ContribUser | null {
  try {
    const raw = localStorage.getItem(`cms-contrib:${api}`)
    const u = raw ? (JSON.parse(raw) as { user?: Partial<ContribUser> }).user : null
    return u && typeof u.id === 'string' && typeof u.displayName === 'string' ? { id: u.id, displayName: u.displayName, image: u.image ?? null } : null
  } catch {
    return null
  }
}

/** Starts fetching the embed ahead of a click (the sign-in popup must open right inside the click handler). */
export function prefetchEmbed(api: string): void {
  loadEmbed(api).catch(() => undefined)
}

/** The contributor API when the embed is already loaded, else null. Synchronous, so a click handler can open the sign-in popup directly. */
export function loadedContrib(): CmsContrib | null {
  return (window as unknown as { cmsEmbed?: CmsEmbed }).cmsEmbed?.contrib ?? null
}

/**
 * The signed-in contributor. Prefers the embed once it is loaded (it also knows a session kept only in memory when
 * localStorage is blocked); before that, reads the stored session directly so the embed is not loaded just for this.
 */
export function currentUser(api: string): ContribUser | null {
  const c = loadedContrib()
  return c ? (c.session(api)?.user ?? null) : storedUser(api)
}

export async function getContrib(api: string): Promise<CmsContrib> {
  await loadEmbed(api)
  const c = (window as unknown as { cmsEmbed?: CmsEmbed }).cmsEmbed?.contrib
  if (!c) throw new Error('wiki-cms embed has no contrib API')
  return c
}

/** The content a contributor starts an edit from: their pending/rejected edit if there is one, else the stored submission. */
export function editStart(sub: ContribSubmission): { id: string; version: number; initial: ContribContent } {
  const src = sub.revision ?? sub
  return { id: sub.id, version: sub.version, initial: { title: src.title, payload: src.payload, tags: src.tags, lang: src.lang, explanation: src.explanation, demoUrl: src.demoUrl } }
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
  /** Edit one of the signed-in contributor's own submissions. */
  edit?: { id: string; version: number; initial: ContribContent }
  /** Called once the dialog has closed (submitted or not). */
  onClose?: () => void
}

/** Opens the wiki-cms submit form. Rejects when the embed cannot be loaded or the options are rejected. */
export async function openCmsForm({ api, group, plugin, groupOptions, host, lang, edit, onClose }: OpenFormArgs): Promise<void> {
  await loadEmbed(api)
  const embed = (window as unknown as { cmsEmbed?: CmsEmbed }).cmsEmbed
  if (!embed?.openForm) throw new Error('wiki-cms embed has no openForm')
  await embed.openForm({ host, type: TYPE, group, plugin, groupOptions, api, lang, ...(edit ? { edit } : {}), ...(onClose ? { onClose } : {}) })
}
