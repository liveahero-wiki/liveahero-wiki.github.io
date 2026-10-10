// One-click presets for common queries. Applying one replaces the filter state
// (see the 'applyShortcut' reducer branch in app.tsx); the usual chips/inputs
// then show the result and stay editable.

import type { UIKey } from './uiTranslations'

export interface Shortcut {
  key: string
  labelKey: UIKey
  types?: string[]
  labels?: string[]
  viewMin?: string
  viewMax?: string
}

export const SHORTCUTS: Shortcut[] = [
  {
    key: 'sidekick_auto_passive',
    labelKey: 'shortcut_sidekick_auto_passive',
    types: ['sidekick'],
    labels: ['skillctl.auto'],
    viewMin: '0',
    viewMax: '0',
  },
]
