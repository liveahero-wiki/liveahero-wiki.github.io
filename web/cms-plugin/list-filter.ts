// The plugin's `listFilter` for the catalog layout of the wiki-cms embed (plugin-api.ts).
// Preact is rendered into the element the core hands to `mount`, one root per part.

import { h, render } from 'preact'
import { FilterPanel } from './FilterPanel.tsx'
import { activeCount, limitedCount, parseParams, testPayload, toParams, type FilterState } from './filters.ts'
import { makeT } from './i18n/t.ts'
import type { ListFilter } from './plugin-api.ts'
import { loadRoster, type Roster } from './roster.ts'
import { ensureStyles } from './style.ts'
import type { TeamPayload } from './types.ts'

/** Set by `prepare()`; null until then and when the roster could not be loaded (nothing counts as limited). */
let roster: Roster | null = null

export const listFilter: ListFilter<TeamPayload, FilterState> = {
  init: (params) => parseParams(params),

  toParams,

  async prepare() {
    try {
      roster = await loadRoster()
    } catch {
      roster = null
    }
  },

  mount(el, part, state, onChange, ctx) {
    ensureStyles()
    let current = state
    const draw = () =>
      render(
        h(FilterPanel, {
          part,
          state: current,
          ctx,
          // Redraw at once, so the controls do not wait for the host to call update().
          onChange: (next: FilterState) => {
            current = next
            draw()
            onChange(next)
          },
        }),
        el,
      )
    draw()
    return {
      update(next) {
        current = next
        draw()
      },
      destroy: () => render(null, el),
    }
  },

  test: (payload, state) => testPayload(payload, state, roster),

  activeCount,

  sorts: [
    {
      key: 'limited',
      label: (lang) => makeT(lang)('sortLimited'),
      compare: (a, b) => limitedCount(a, roster) - limitedCount(b, roster),
    },
  ],
}
