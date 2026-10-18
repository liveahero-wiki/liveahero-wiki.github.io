// The wiki's static JSON endpoints the editor reads (bio roster, editor data, contributor include list), cached per page.
// Their URLs come from this module's own URL: assets/cms/editor.js -> ../../api/<name>.

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
  bios: Record<string, { jp?: string; en?: string }>
}

export interface BioEntry {
  jp: string
  /** The English text to start from ('' when there is none, or when it is only a copy of the Japanese). */
  en: string
}

/** The roster entry of `key`, or null when the key is not translatable (nothing is offered for it). */
export function bioEntry(roster: BioRoster | null | undefined, key: string): BioEntry | null {
  const bios = roster?.bios
  if (!bios || typeof bios !== 'object' || !Object.hasOwn(bios, key)) return null
  const e = bios[key] ?? {}
  const jp = typeof e.jp === 'string' ? e.jp : ''
  const en = typeof e.en === 'string' ? e.en : ''
  return { jp, en: en.trim() === jp.trim() ? '' : en }
}
