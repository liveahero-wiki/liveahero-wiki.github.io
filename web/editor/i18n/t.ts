// String lookup of the editor. Anything missing falls back to English. Pure (no JSX, no DOM), so node --test can import it.
import type { Lang } from '../../shared/lang.ts'
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

export const hasKey = (key: string): key is Key => Object.hasOwn(en, key)
