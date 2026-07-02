// Reusable toggle-button row with a trailing [All] reset button.
// `selected` is a Set; `onToggle(value)` flips one; `onClear()` empties the row.

interface ButtonRowProps {
  label: string | null
  options: Array<{ key: string; label: string }>
  selected: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
}

export function ButtonRow({ label, options, selected, onToggle, onClear }: ButtonRowProps) {
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
