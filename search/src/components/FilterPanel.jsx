// The query builder: type / category / status-type button rows, the status
// autocomplete, a view-cost range, and the skill-tree / mob toggles.

import { ButtonRow } from './ButtonRow.jsx'
import { StatusAutocomplete } from './StatusAutocomplete.jsx'

const TYPE_OPTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'sidekick', label: 'Sidekick' },
]

const STATUS_TYPE_OPTIONS = [
  { key: 'buff', label: 'Buff' },
  { key: 'debuff', label: 'Debuff' },
  { key: 'field', label: 'Field' },
]

export function FilterPanel({ index, query, dispatch, resultCount }) {
  return (
    <div class="filter-panel">
      <ButtonRow
        label="Type"
        options={TYPE_OPTIONS}
        selected={query.types}
        onToggle={(v) => dispatch({ type: 'toggle', field: 'types', value: v })}
        onClear={() => dispatch({ type: 'clear', field: 'types' })}
      />

      {index.categories.map((cat) => (
        <ButtonRow
          key={cat.key}
          label={cat.label}
          options={cat.labels}
          selected={query.labels}
          onToggle={(v) => dispatch({ type: 'toggle', field: 'labels', value: v })}
          onClear={() =>
            dispatch({
              type: 'clearKeys',
              field: 'labels',
              keys: cat.labels.map((l) => l.key),
            })
          }
        />
      ))}

      <ButtonRow
        label="Status type"
        options={STATUS_TYPE_OPTIONS}
        selected={query.statusTypes}
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
            onInput={(e) =>
              dispatch({ type: 'setView', field: 'viewMin', value: e.target.value })
            }
          />
          <span>–</span>
          <input
            key={`vcMax-${query._vcKey}`}
            type="number"
            class="vp-input"
            placeholder="max"
            onInput={(e) =>
              dispatch({ type: 'setView', field: 'viewMax', value: e.target.value })
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
        <button type="button" class="reset" onClick={() => dispatch({ type: 'reset' })}>
          Reset all
        </button>
        <span class="result-count">{resultCount} skills</span>
      </div>
    </div>
  )
}
