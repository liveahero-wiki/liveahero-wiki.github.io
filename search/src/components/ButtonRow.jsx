// Reusable toggle-button row with a trailing [All] reset button.
// `selected` is a Set; `onToggle(value)` flips one; `onClear()` empties the row.

export function ButtonRow({ label, options, selected, onToggle, onClear }) {
  return (
    <div class="row">
      {label && <span class="row-label">{label}</span>}
      <div class="row-buttons">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            class={'chip' + (selected.has(opt.key) ? ' chip-on' : '')}
            onClick={() => onToggle(opt.key)}
          >
            {opt.label}
          </button>
        ))}
        <button type="button" class="chip chip-all" onClick={onClear}>
          All
        </button>
      </div>
    </div>
  )
}
