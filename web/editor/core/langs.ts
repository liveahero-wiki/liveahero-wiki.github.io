// The languages a contributor can suggest for a voice line or a bio. A submission has one language (`lang` of the wiki-cms
// submission); `text` and `base` are in it. Pure (no DOM), so node --test can import it.

import type { Key } from '../i18n/t.ts'

export type TlLang = 'en' | 'zh-Hans' | 'zh-Hant'
export const TL_LANGS: readonly TlLang[] = ['en', 'zh-Hans', 'zh-Hant']

/** The short code the pages and the rosters use (`data-lang` cells of a voice table, `langs` of a roster entry). */
export const LANG_CODE: Record<TlLang, 'en' | 'hans' | 'hant'> = { en: 'en', 'zh-Hans': 'hans', 'zh-Hant': 'hant' }

/** Label of the language switch: the same short names as the tabs of a voice table. */
export const LANG_TAB: Record<TlLang, string> = { en: 'EN', 'zh-Hans': '简中', 'zh-Hant': '繁中' }

/** The language's name in the UI language. */
export const LANG_NAME: Record<TlLang, Key> = { en: 'langEn', 'zh-Hans': 'langHans', 'zh-Hant': 'langHant' }

/** The language of a page's short code (`hans` -> 'zh-Hans'); anything unknown is English. */
export function langOfCode(code: string | null | undefined): TlLang {
  return TL_LANGS.find((l) => LANG_CODE[l] === code) ?? 'en'
}

/**
 * The languages a roster entry or a `data-tl-langs` attribute (space separated codes) offers. Nothing given (an older
 * roster without `langs`, an empty attribute) offers every language, like the Worker does.
 */
export function langsOf(codes: readonly unknown[] | string | null | undefined): TlLang[] {
  const list = typeof codes === 'string' ? codes.split(/\s+/) : Array.isArray(codes) ? codes : []
  const known = TL_LANGS.filter((l) => list.includes(LANG_CODE[l]))
  return known.length > 0 ? known : [...TL_LANGS]
}

/** `{ en: f('en'), 'zh-Hans': f('zh-Hans'), 'zh-Hant': f('zh-Hant') }` */
export function perLang<T>(f: (lang: TlLang) => T): Record<TlLang, T> {
  return { en: f('en'), 'zh-Hans': f('zh-Hans'), 'zh-Hant': f('zh-Hant') }
}
