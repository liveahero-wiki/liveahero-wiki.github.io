// Language selection: browser-detected default, remembered in LocalStorage.

export type Lang = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
]

const LS_LANG = 'skillSearchLang'

function isLang(value: string): value is Lang {
  return LANGS.some((l) => l.code === value)
}

function detectLang(): Lang {
  // Only the primary language matters here — navigator.languages is a full
  // fallback preference chain, and a secondary/tertiary entry (e.g. a second
  // installed keyboard) shouldn't override an actual primary preference of
  // English.
  const tag = navigator.language.toLowerCase()
  if (tag.startsWith('ja')) return 'ja'
  if (tag.startsWith('zh')) {
    if (tag.includes('hant') || tag.includes('-tw') || tag.includes('-hk') || tag.includes('-mo')) {
      return 'zh-Hant'
    }
    return 'zh-Hans'
  }
  return 'en'
}

export function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LS_LANG)
    if (stored && isLang(stored)) return stored
  } catch {
    /* private mode — fall through to detection */
  }
  return detectLang()
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(LS_LANG, lang)
  } catch {
    /* quota / private mode — non-fatal, app still works this session */
  }
}
