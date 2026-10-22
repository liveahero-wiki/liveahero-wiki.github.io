// String lookup shared by the apps' i18n bundles: `{name}` placeholders, and anything missing falls back to English.
// Pure, so node --test can import it.
import type { Lang } from './lang.ts'

export type Params = Record<string, string | number>

export function fill(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}

/** `makeT` for a set of bundles: `makeT(lang)(key, params)`. An unknown `lang` (e.g. from a host page) is English. */
export function createT<B extends Record<string, string>>(bundles: Record<Lang, B>) {
  return (lang: Lang) => {
    const bundle = bundles[Object.hasOwn(bundles, lang) ? lang : 'en']
    return (key: keyof B & string, params?: Params): string => fill(bundle[key] ?? bundles.en[key] ?? key, params)
  }
}
