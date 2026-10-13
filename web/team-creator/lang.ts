// UI language of the Team Creator page. Pure (no framework), so `node --test` can import it.
// Same mapping as wiki-cms `src/shared/i18n.ts` (`langFromTag`, `resolveUiLang`).

import type { I18nText, Lang } from '../cms-plugin/api-types.ts'

export type { Lang }

export const LANGS: readonly Lang[] = ['en', 'zh-Hans', 'zh-Hant', 'ja']

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v)
}

/** Map a BCP-47-ish tag (navigator.language, <html lang>) to a supported Lang, or null. */
export function langFromTag(tag: string | null | undefined): Lang | null {
  const t = tag?.trim().toLowerCase()
  if (!t) return null
  if (t === 'ja' || t.startsWith('ja-')) return 'ja'
  if (t === 'en' || t.startsWith('en-')) return 'en'
  if (t.startsWith('zh')) return /hant|-tw|-hk|-mo/.test(t) ? 'zh-Hant' : 'zh-Hans'
  return null
}

/** Pick the text for `lang`, falling back to English. */
export const pickText = (text: I18nText, lang: Lang): string => text[lang] ?? text.en

/** `<html data-skill-lang>` (the wiki's language picker) → `<html lang>` → `navigator.language` → `en`. */
export function initialLang(): Lang {
  const root = document.documentElement
  const skill = root.getAttribute('data-skill-lang')
  if (isLang(skill)) return skill
  return langFromTag(root.lang) ?? langFromTag(navigator.language) ?? 'en'
}

/** Calls `cb` on the wiki's `skilllangchange` event (`detail.lang`). Returns the unsubscribe function. */
export function onLangChange(cb: (lang: Lang) => void): () => void {
  const handler = (e: Event) => {
    const lang = (e as CustomEvent<{ lang?: unknown }>).detail?.lang
    if (isLang(lang)) cb(lang)
  }
  document.addEventListener('skilllangchange', handler)
  return () => document.removeEventListener('skilllangchange', handler)
}
