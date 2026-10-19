// The wiki's static JSON endpoints the editor reads (bio roster, editor data, contributor include list), cached per page.
// Their URLs come from this module's own URL: assets/cms/editor.js -> ../../api/<name>.

import { langsOf, type TlLang } from './langs.ts'

const cache = new Map<string, Promise<unknown>>()

export function dataUrl(name: string, base: string | URL = import.meta.url): string {
  return new URL(`../../api/${name}`, base).href
}

export function fetchData<T>(name: string): Promise<T> {
  let p = cache.get(name)
  if (!p) {
    p = fetch(dataUrl(name)).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${name}: HTTP ${r.status}`))))
    cache.set(name, p)
    p.catch(() => cache.delete(name))
  }
  return p as Promise<T>
}

export interface BioRoster {
  version?: string
  bios: Record<string, { jp?: string; en?: string; hans?: string; hant?: string; langs?: string[] }>
}

export interface BioEntry {
  jp: string
  /** The text to start from, per language ('' when there is none, or when it is only a copy of the Japanese). */
  bases: Record<TlLang, string>
  /** The languages still open for this bio; a Chinese text is translated from the Japanese, so those need one. */
  langs: TlLang[]
}

/** The roster entry of `key`, or null when the key is not translatable (nothing is offered for it). */
export function bioEntry(roster: BioRoster | null | undefined, key: string): BioEntry | null {
  const bios = roster?.bios
  if (!bios || typeof bios !== 'object' || !Object.hasOwn(bios, key)) return null
  const e = bios[key] ?? {}
  const jp = typeof e.jp === 'string' ? e.jp : ''
  const text = (v: unknown): string => (typeof v === 'string' && v.trim() !== jp.trim() ? v : '')
  const langs = langsOf(e.langs).filter((l) => l === 'en' || jp !== '')
  if (langs.length === 0) return null // only Chinese is open and there is no Japanese text to translate from
  return { jp, bases: { en: text(e.en), 'zh-Hans': text(e.hans), 'zh-Hant': text(e.hant) }, langs }
}
