// Hero elements (roster `element` 1-5) and their icons. Free of JSX for unit tests.

import { SITE } from './roster.ts'

/** Element id -> icon file stem, as on the wiki (assets/img/icons/icon_element_<name>.webp). */
const ELEMENT_FILE: Record<number, string> = { 1: 'fire', 2: 'water', 3: 'earth', 4: 'light', 5: 'shadow' }

export const ELEMENT_IDS = [1, 2, 3, 4, 5] as const

export const elementIconUrl = (id: number): string => `${SITE}/assets/img/icons/icon_element_${ELEMENT_FILE[id] ?? 'fire'}.webp`
