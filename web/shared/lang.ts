// The UI language of every app under web/. The wiki's head script (_includes/js/skill-lang.js) picks it before the page
// paints: it sets `<html data-skill-lang>` from the stored choice or the browser language, and `setSkillLang` changes it
// and fires `skilllangchange`. The apps follow that attribute instead of detecting the language themselves.
// Pure apart from `document` / `navigator` reads inside the functions, so `node --test` can import it.

export type Lang = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja'
export type I18nText = { en: string } & Partial<Record<Lang, string>>

export const LANGS: readonly Lang[] = ['en', 'zh-Hans', 'zh-Hant', 'ja']

/** Each language's name in itself (language pickers). */
export const LANG_LABELS: Record<Lang, string> = { en: 'English', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', ja: '日本語' }

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v)
}

/** Map a BCP-47-ish tag (navigator.language, <html lang>) to a supported Lang, or null. Same mapping as wiki-cms `langFromTag`. */
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

/** `<html data-skill-lang>` (set by the head script on every wiki page) → `<html lang>` → `navigator.language` → `en`. */
export function pageLang(): Lang {
  const root = document.documentElement
  const skill = root.getAttribute('data-skill-lang')
  if (isLang(skill)) return skill
  return langFromTag(root.lang) ?? langFromTag(navigator.language) ?? 'en'
}

/**
 * Change the page language: the head script's `setSkillLang` stores the choice and fires `skilllangchange`. Without it
 * (a bare Vite dev page) the attribute and the event are set here, for this page view only.
 */
export function setPageLang(lang: Lang): void {
  const set = (window as unknown as { setSkillLang?: (lang: Lang) => void }).setSkillLang
  if (set) return set(lang)
  document.documentElement.setAttribute('data-skill-lang', lang)
  document.dispatchEvent(new CustomEvent('skilllangchange', { detail: { lang } }))
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
