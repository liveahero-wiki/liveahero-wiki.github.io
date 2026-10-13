// Controls of the plugin's `listFilter` in the catalog layout. Two parts, hosted by the core:
//   basic    - target dropdown (any of) and one search box to include / exclude heroes and active sidekicks
//   advanced - skill-tree and blooming toggles, max limited-time heroes
// Stateless: the state lives in the host (see list-filter.ts); every change goes through onChange.

import { useState } from 'preact/hooks'
import type { PluginContext } from './plugin-api.ts'
import { useRoster } from './common.tsx'
import { TargetDropdown, UnitFilter } from './FilterControls.tsx'
import {
  MAX_IDS, MAX_SLOTS, addId, removeId, setMaxLimited, type FilterState, type IdListKey,
} from './filters.ts'
import { makeT } from './i18n/t.ts'
import { CardListPicker } from './pickers.tsx'
import { parseTargets } from './targets.ts'

interface Props {
  part: 'basic' | 'advanced'
  state: FilterState
  onChange(next: FilterState): void
  ctx: PluginContext
}

let panelSeq = 0

export function FilterPanel({ part, state, onChange, ctx }: Props) {
  const t = makeT(ctx.uiLang)
  const lang = ctx.uiLang
  const roster = useRoster()
  const [uid] = useState(() => ++panelSeq)

  if (part === 'advanced') {
    const limitedId = `cms-lah-f${uid}-lim`
    return (
      <div class="cms-lah cms-lah-filter cms-lah-filter-advanced">
        <label class="cms-lah-check">
          <input type="checkbox" checked={state.tree} onChange={(e) => onChange({ ...state, tree: e.currentTarget.checked })} />
          <span>{t('filterTree')}</span>
        </label>
        <label class="cms-lah-check">
          <input type="checkbox" checked={state.bloom} onChange={(e) => onChange({ ...state, bloom: e.currentTarget.checked })} />
          <span>{t('filterBloom')}</span>
        </label>
        <div class="cms-lah-stepper" role="group" aria-labelledby={limitedId}>
          <span class="cms-lah-label" id={limitedId}>
            {t('filterMaxLimited')}
          </span>
          <div class="cms-lah-stepper-row">
            <button type="button" class="cms-lah-btn cms-lah-btn-icon" disabled={state.maxLimited <= 0} aria-label={t('filterDecrease')} title={t('filterDecrease')} onClick={() => onChange(setMaxLimited(state, state.maxLimited - 1))}>
              <span aria-hidden="true">−</span>
            </button>
            <output class="cms-lah-stepper-value" aria-live="polite">
              {state.maxLimited >= MAX_SLOTS ? t('filterLimitedAny') : String(state.maxLimited)}
            </output>
            <button type="button" class="cms-lah-btn cms-lah-btn-icon" disabled={state.maxLimited >= MAX_SLOTS} aria-label={t('filterIncrease')} title={t('filterIncrease')} onClick={() => onChange(setMaxLimited(state, state.maxLimited + 1))}>
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <p class="cms-lah-muted cms-lah-small">{t('filterMaxLimitedHint')}</p>
        </div>
      </div>
    )
  }

  const targets = parseTargets(ctx.group.options)
  // Without a roster (it failed to load) the search box cannot work: plain card-id lists instead.
  const picker = (kind: 'hero' | 'sidekick', key: IdListKey, label: string, placeholder: string) => (
    <CardListPicker
      kind={kind}
      roster={roster}
      values={state[key]}
      max={MAX_IDS}
      onAdd={(id) => onChange(addId(state, key, id))}
      onRemove={(id) => onChange(removeId(state, key, id))}
      lang={lang}
      t={t}
      label={label}
      placeholder={placeholder}
    />
  )

  return (
    <div class="cms-lah cms-lah-filter cms-lah-filter-basic">
      {targets.length > 0 && <TargetDropdown state={state} targets={targets} lang={lang} t={t} onChange={onChange} />}
      {roster === null ? (
        <div class="cms-lah-filter-pickers">
          {picker('hero', 'heroIn', t('filterHeroIn'), t('heroPlaceholder'))}
          {picker('hero', 'heroOut', t('filterHeroOut'), t('heroPlaceholder'))}
          {picker('sidekick', 'skIn', t('filterSkIn'), t('activePlaceholder'))}
          {picker('sidekick', 'skOut', t('filterSkOut'), t('activePlaceholder'))}
        </div>
      ) : (
        <UnitFilter state={state} roster={roster} lang={lang} t={t} onChange={onChange} />
      )}
    </div>
  )
}
