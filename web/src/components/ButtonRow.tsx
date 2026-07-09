// Reusable toggle-button row. `selected` is a Set; `onToggle(value)` flips one.
// `relation` describes how the row's own chips combine when filtering:
//   - 'or':  any selected chip matches (multi-select semantics) — shows a
//            trailing [All] reset button and gets the `.row-or` styling.
//   - 'and': every selected chip must match — no [All] button.

interface ButtonRowProps {
  label: string | null
  options: Array<{ key: string; label: string }>
  selected: Set<string>
  relation: 'or' | 'and'
  onToggle: (value: string) => void
  onClear?: () => void
}

export function ButtonRow({ label, options, selected, relation, onToggle, onClear }: ButtonRowProps) {
  return (
    <div class={'row' + (relation === 'or' ? ' row-or' : ' row-and')}>
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
        {relation === 'or' && (
          <button type="button" class="chip chip-all" onClick={onClear}>
            All
          </button>
        )}
      </div>
    </div>
  )
}
