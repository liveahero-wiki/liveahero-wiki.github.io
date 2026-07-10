// The query builder: type / category / status-type button rows, the status
// autocomplete, a view-cost range, and the skill-tree / mob toggles.

import type { JSX } from 'preact'
import type { Query, SkillIndex } from '../types'
import type { QueryAction } from '../app'
import { ButtonRow } from './ButtonRow'
import { StatusAutocomplete } from './StatusAutocomplete'

const TYPE_OPTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'sidekick', label: 'Sidekick' },
]

const ROLE_OPTIONS = [
  { key: 'attack',     label: 'Attack' },
  { key: 'defense',    label: 'Defense' },
  { key: 'assistance', label: 'Assistance' },
  { key: 'debuff',     label: 'Debuff' },
  { key: 'speed',      label: 'Speed' },
  { key: 'vp_gain',    label: 'VP Gain' },
  { key: 'heal',       label: 'Heal' },
  { key: 'special',    label: 'Special' },
]

const STATUS_TYPE_OPTIONS = [
  { key: 'buff', label: 'Buff' },
  { key: 'debuff', label: 'Debuff' },
  { key: 'field', label: 'Field' },
]

interface FilterPanelProps {
  index: SkillIndex
  query: Query
  dispatch: (action: QueryAction) => void
  resultCount: number
  showLabels: boolean
  onToggleLabels: () => void
}

export function FilterPanel({ index, query, dispatch, resultCount, showLabels, onToggleLabels }: FilterPanelProps) {
  return (
    <div class="filter-panel">
      <div class="row">
        <span class="row-label">Character</span>
        <div class="row-buttons">
          <input
            type="text"
            class="char-input"
            placeholder="character name…"
            value={query.characterName}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement>) =>
              dispatch({ type: 'setCharacterName', value: e.currentTarget.value })
            }
          />
        </div>
      </div>

      <ButtonRow
        label="Type"
        options={TYPE_OPTIONS}
        selected={query.types}
        relation="or"
        onToggle={(v) => dispatch({ type: 'toggle', field: 'types', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'types' })}
      />

      <ButtonRow
        label="Role"
        options={ROLE_OPTIONS}
        selected={query.roles}
        relation="or"
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
          onToggle={(v) => dispatch({ type: 'toggle', field: 'labels', value: v })}
        />
      ))}

      <ButtonRow
        label="Status type"
        options={STATUS_TYPE_OPTIONS}
        selected={query.statusTypes}
        relation="or"
        onToggle={(v) => dispatch({ type: 'toggle', field: 'statusTypes', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'statusTypes' })}
      />

      <div class="row">
        <span class="row-label">Has status</span>
        <StatusAutocomplete
          statuses={index.statuses}
          selected={query.statusIds}
          onAdd={(id) => dispatch({ type: 'addStatus', value: id })}
          onRemove={(id) => dispatch({ type: 'removeStatus', value: id })}
        />
      </div>

      <div class="row">
        <span class="row-label">View Cost</span>
        <div class="row-buttons">
          <input
            key={`vcMin-${query._vcKey}`}
            type="number"
            class="vp-input"
            placeholder="min"
            onInput={(e: JSX.TargetedEvent<HTMLInputElement>) =>
              dispatch({ type: 'setView', field: 'viewMin', value: e.currentTarget.value })
            }
          />
          <span>–</span>
          <input
            key={`vcMax-${query._vcKey}`}
            type="number"
            class="vp-input"
            placeholder="max"
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
          Enable Hero Skill Tree
        </label>
        <label class="check">
          <input
            type="checkbox"
            checked={query.includeMob}
            onChange={() => dispatch({ type: 'toggleFlag', field: 'includeMob' })}
          />
          Include Mob
        </label>
        <label class="check">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={onToggleLabels}
          />
          Show Debug Info
        </label>
        <button type="button" class="reset" onClick={() => dispatch({ type: 'reset' })}>
          Reset all
        </button>
        <span class="result-count">{resultCount} skills</span>
      </div>
    </div>
  )
}
