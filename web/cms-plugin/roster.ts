// Roster (api/team-roster.json): names + icons for the pickers and the read-only views.
// Free of JSX/CSS imports so it can be unit-tested with node's type stripping.

import type { Lang, LocalizedName, RosterFile, RosterHero, RosterSidekick } from './types.ts'

// Same origin as web/src/lib/urls.ts: icons live on the live wiki's CDN path. Absolute so the plugin
// also works on the admin origin.
export const SITE = 'https://liveahero-wiki.github.io'
const SPRITE = `${SITE}/cdn/Sprite`

export const heroIconUrl = (resourceName: string) => `${SPRITE}/icon_${resourceName}_h01.png`
export const sidekickIconUrl = (resourceName: string) => `${SPRITE}/icon_${resourceName}_s01.png`

/** Absolute chara page URL for a roster entry (anchored to its hero/sidekick card), or '' without a page. */
export function charaUrl(kind: 'hero' | 'sidekick', e: RosterHero | RosterSidekick): string {
  return e.page ? `${SITE}${e.page}#${kind === 'hero' ? 'h' : 's'}${e.stockId}` : ''
}

export interface Roster {
  version: string
  heroes: RosterHero[]
  sidekicks: RosterSidekick[]
  hero(stockId: number): RosterHero | undefined
  sidekick(stockId: number): RosterSidekick | undefined
}

export function buildRoster(file: Partial<RosterFile>): Roster {
  const heroes = Array.isArray(file.heroes) ? file.heroes : []
  const sidekicks = Array.isArray(file.sidekicks) ? file.sidekicks : []
  const h = new Map(heroes.map((e) => [e.stockId, e]))
  const s = new Map(sidekicks.map((e) => [e.stockId, e]))
  return {
    version: String(file.version ?? ''),
    heroes,
    sidekicks,
    hero: (id) => h.get(id),
    sidekick: (id) => s.get(id),
  }
}

/** Localized name with the fallback chain lang -> ja -> en -> any available -> ''. */
export function localizedName(name: LocalizedName | undefined, lang: Lang): string {
  if (!name) return ''
  return name[lang] || name.ja || name.en || Object.values(name).find(Boolean) || ''
}

/** Lower-cased haystack of every language's name + resourceName + stockId, for the pickers' search. */
export function searchText(e: RosterHero | RosterSidekick): string {
  return [...Object.values(e.name), e.resourceName, String(e.stockId)].join('\n').toLowerCase()
}

// ---- loading

let source: string | URL | RosterFile | null = null
let memo: Promise<Roster> | null = null

// Plugin at /assets/cms/lah-team-formation.js -> ../../api/team-roster.json = /api/team-roster.json.
// Kept in a variable on purpose: a literal `new URL('...', import.meta.url)` is treated by Vite as an
// asset import and would inline the whole roster file into the bundle.
const ROSTER_REL_PATH = '../../api/team-roster.json'

function defaultUrl(): URL {
  return new URL(ROSTER_REL_PATH, import.meta.url)
}

/** Override where the roster comes from (a URL or inline data). Used by the dev harness and tests. */
export function setRosterSource(src: string | URL | RosterFile | null): void {
  source = src
  memo = null
}

/** Memoized; rejects on failure (and forgets the failure so a later call retries). */
export function loadRoster(): Promise<Roster> {
  if (!memo) {
    const p = (async () => {
      if (source && typeof source === 'object' && !(source instanceof URL)) return buildRoster(source)
      const res = await fetch(source ?? defaultUrl())
      if (!res.ok) throw new Error(`roster: HTTP ${res.status}`)
      return buildRoster((await res.json()) as RosterFile)
    })()
    memo = p
    p.catch(() => {
      if (memo === p) memo = null
    })
  }
  return memo
}
