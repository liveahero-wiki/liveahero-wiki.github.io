// The query builder: type / category / status-type button rows, the status
// autocomplete, a view-cost range, and the skill-tree / mob toggles.

import type { JSX } from 'preact'
import type { Query, SkillIndex } from '../types'
import type { Lang } from '../lib/lang'
import type { QueryAction } from '../app'
import { t } from '../lib/uiTranslations'
import { ButtonRow } from './ButtonRow'
import { StatusAutocomplete } from './StatusAutocomplete'

interface FilterPanelProps {
  index: SkillIndex
  query: Query
  dispatch: (action: QueryAction) => void
  resultCount: number
  showLabels: boolean
  onToggleLabels: () => void
  lang: Lang
}

export function FilterPanel({ index, query, dispatch, resultCount, showLabels, onToggleLabels, lang }: FilterPanelProps) {
  const TYPE_OPTIONS = [
    { key: 'hero',     label: t(lang, 'hero') },
    { key: 'sidekick', label: t(lang, 'sidekick') },
  ]

  const ROLE_OPTIONS = [
    { key: 'attack',     label: t(lang, 'attack') },
    { key: 'defense',    label: t(lang, 'defense') },
    { key: 'assistance', label: t(lang, 'assistance') },
    { key: 'debuff',     label: t(lang, 'debuff') },
    { key: 'speed',      label: t(lang, 'speed') },
    { key: 'vp_gain',    label: t(lang, 'vp_gain') },
    { key: 'heal',       label: t(lang, 'heal') },
    { key: 'special',    label: t(lang, 'special') },
  ]

  const STATUS_TYPE_OPTIONS = [
    { key: 'buff',   label: t(lang, 'buff') },
    { key: 'debuff', label: t(lang, 'debuff') },
  ]

  return (
    <div class="filter-panel">
      <div class="row">
        <span class="row-label">{t(lang, 'character')}</span>
        <div class="row-buttons" focusgroup="toolbar">
          <input
            type="text"
            class="char-input"
            placeholder={t(lang, 'char_placeholder')}
            value={query.characterName}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement>) =>
              dispatch({ type: 'setCharacterName', value: e.currentTarget.value })
            }
          />
        </div>
      </div>

      <ButtonRow
        label={t(lang, 'type')}
        options={TYPE_OPTIONS}
        selected={query.types}
        relation="or"
        lang={lang}
        onToggle={(v) => dispatch({ type: 'toggle', field: 'types', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'types' })}
      />

      <ButtonRow
        label={t(lang, 'role')}
        options={ROLE_OPTIONS}
        selected={query.roles}
        relation="or"
        lang={lang}
        onToggle={(v) => dispatch({ type: 'toggle', field: 'roles', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'roles' })}
      />

      {index.categories.map((cat) => (
        <ButtonRow
          key={cat.key}
          label={cat.label}
          options={cat.labels}
          selected={query.labels}
          relation="and"
          lang={lang}
          onToggle={(v) => dispatch({ type: 'toggle', field: 'labels', value: v })}
        />
      ))}

      <ButtonRow
        label={t(lang, 'status_type')}
        options={STATUS_TYPE_OPTIONS}
        selected={query.statusTypes}
        relation="or"
        lang={lang}
        onToggle={(v) => dispatch({ type: 'toggle', field: 'statusTypes', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'statusTypes' })}
      />

      <div class="row">
        <span class="row-label">{t(lang, 'has_status')}</span>
        <StatusAutocomplete
          statuses={index.statuses}
          selected={query.statusIds}
          lang={lang}
          onAdd={(id) => dispatch({ type: 'addStatus', value: id })}
          onRemove={(id) => dispatch({ type: 'removeStatus', value: id })}
        />
      </div>

      <div class="row">
        <span class="row-label">{t(lang, 'view_cost')}</span>
        <div class="row-buttons" focusgroup="toolbar">
          <input
            key={`vcMin-${query._vcKey}`}
            type="number"
            class="vp-input"
            placeholder={t(lang, 'view_min')}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement>) =>
              dispatch({ type: 'setView', field: 'viewMin', value: e.currentTarget.value })
            }
          />
          <span>–</span>
          <input
            key={`vcMax-${query._vcKey}`}
            type="number"
            class="vp-input"
            placeholder={t(lang, 'view_max')}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement>) =>
              dispatch({ type: 'setView', field: 'viewMax', value: e.currentTarget.value })
            }
          />
        </div>
      </div>

      <div class="row">
        <label class="check">
          <input
            type="checkbox"
            checked={query.skillTree}
            onChange={() => dispatch({ type: 'toggleFlag', field: 'skillTree' })}
          />
          {t(lang, 'enable_skill_tree')}
        </label>
        <label class="check">
          <input
            type="checkbox"
            checked={query.includeMob}
            onChange={() => dispatch({ type: 'toggleFlag', field: 'includeMob' })}
          />
          {t(lang, 'include_mob')}
        </label>
        <label class="check">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={onToggleLabels}
          />
          {t(lang, 'show_debug_info')}
        </label>
        <button type="button" class="reset" onClick={() => dispatch({ type: 'reset' })}>
          {t(lang, 'reset_all')}
        </button>
        <span class="result-count">{resultCount}{t(lang, 'skills_suffix')}</span>
      </div>
    </div>
  )
}
