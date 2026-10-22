// String lookup for the plugin. The UI language is `ctx.uiLang`; anything missing falls back to English.
// Kept free of CSS / JSX so the i18n tests can import it with node's type stripping.
import type { FieldError } from '../plugin-api.ts'
import type { Lang } from '../i18n.ts'
import { createT, type Params } from '../../shared/i18n.ts'
import { en, type Bundle } from './en.ts'
import { ja } from './ja.ts'
import { zhHans } from './zh-Hans.ts'
import { zhHant } from './zh-Hant.ts'

export type { Params }
export type Key = keyof Bundle
export type T = (key: Key, params?: Params) => string

export const bundles: Record<Lang, Bundle> = { en, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ja }

export const makeT: (lang: Lang) => T = createT(bundles)

/** Name of a Parallel Weapon form by its itemId (60-63). */
export const pwFormLabel = (t: T, itemId: number): string => t(`pwForm${itemId}` as Key)

/** Localized text for a server/validator error; falls back to its English `message`. */
export function errorText(t: T, e: FieldError): string {
  const key = `error_${e.code}` as Key
  if (!(key in en)) return e.message
  const params: Params = { ...e.params }
  // The focus error names the card kind ('hero' | 'sidekick'); show it in the UI language.
  if (typeof params.kind === 'string' && (params.kind === 'hero' || params.kind === 'sidekick')) {
    params.kind = t(params.kind).toLowerCase()
  }
  if (typeof params.slots === 'string') params.slots = params.slots.split(',').join(', ')
  return t(key, params)
}
