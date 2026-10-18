// String lookup of the editor. Anything missing falls back to English. Pure (no JSX, no DOM), so node --test can import it.
import type { Lang } from '../../team-creator/lang.ts'
import { en, type Bundle } from './en.ts'
import { ja } from './ja.ts'
import { zhHans } from './zh-Hans.ts'
import { zhHant } from './zh-Hant.ts'

export type Key = keyof Bundle
export type Params = Record<string, string | number>
export type T = (key: Key, params?: Params) => string

export const bundles: Record<Lang, Bundle> = { en, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ja }

function fill(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}

export function makeT(lang: Lang): T {
  const bundle = bundles[Object.hasOwn(bundles, lang) ? lang : 'en']
  return (key, params) => fill(bundle[key] ?? en[key] ?? key, params)
}

export const hasKey = (key: string): key is Key => Object.hasOwn(en, key)
