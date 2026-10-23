// The bridge to the wiki-cms embed (`{api}/embed/v1.js`, see wiki-cms docs/EMBED.md), which owns the contributor
// session and the submit form. Used by the Team Creator page and the contributor editor.

import type { ContribSubmission, ContribUser } from '../../cms-plugin/api-types.ts'

/** What `window.cmsEmbed.contrib` offers (wiki-cms embed/src/loader.ts). */
export interface CmsContrib {
  session(api?: string): { token: string; user: ContribUser } | null
  signIn(api?: string, options?: string | { provider?: string; lang?: string }): Promise<{ token: string; user: ContribUser; needsDisplayName?: true }>
  signOut(api?: string): Promise<void>
  mine(type?: string, api?: string): Promise<ContribSubmission[]>
  withdrawRevision(submissionId: string, api?: string): Promise<void>
}

export interface CmsEmbed {
  openForm?: (options: Record<string, unknown>) => Promise<void>
  contrib?: CmsContrib
}

/** A provider account must be this old to become a contributor (mirrors wiki-cms src/shared/contrib.ts; the Worker enforces it). */
export const MIN_ACCOUNT_AGE_DAYS = 30

// The embed keeps the contributor session in this page origin's localStorage under `cms-contrib:<api>` and fires a
// `cms:contrib` window event ({ detail: { api } }) when it changes. Reading both here lets a page show who is signed
// in WITHOUT loading the embed for visitors who never signed in.
export const SESSION_EVENT = 'cms:contrib'
export const sessionKey = (api: string): string => `cms-contrib:${api}`

/** `window.cmsEmbed` once the embed script has run, else undefined. */
export const cmsEmbed = (): CmsEmbed | undefined => (window as unknown as { cmsEmbed?: CmsEmbed }).cmsEmbed

export function storedUser(api: string): ContribUser | null {
  try {
    const raw = localStorage.getItem(sessionKey(api))
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
  return cmsEmbed()?.contrib ?? null
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
  const c = cmsEmbed()?.contrib
  if (!c) throw new Error('wiki-cms embed has no contrib API')
  return c
}

const embeds = new Map<string, Promise<void>>()

/** Imports `{api}/embed/v1.js` on first use (the same URL returns the same module instance); a failure can be retried. */
export function loadEmbed(api: string): Promise<void> {
  let p = embeds.get(api)
  if (!p) {
    p = import(/* @vite-ignore */ `${api}/embed/v1.js`).then(() => undefined)
    embeds.set(api, p)
    p.catch(() => embeds.delete(api))
  }
  return p
}
