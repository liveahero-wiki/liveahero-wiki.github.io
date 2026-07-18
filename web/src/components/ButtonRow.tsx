// Reusable toggle-button row. `selected` is a Set; `onToggle(value)` flips one.
// `relation` describes how the row's own chips combine when filtering:
//   - 'or':  any selected chip matches (multi-select semantics) — shows a
//            trailing [All] reset button and gets the `.row-or` styling.
//   - 'and': every selected chip must match — no [All] button.

import type { Label } from '../types'
import type { Lang } from '../lib/lang'
import { t } from '../lib/uiTranslations'
import { SublabelChip } from './SublabelChip'

interface ButtonRowProps {
  label: string | null
  options: Label[]
  selected: Set<string>
  relation: 'or' | 'and'
  lang: Lang
  onToggle: (value: string) => void
  onClear?: () => void
}

export function ButtonRow({ label, options, selected, relation, lang, onToggle, onClear }: ButtonRowProps) {
  return (
    <div class={'row' + (relation === 'or' ? ' row-or' : ' row-and')}>
      {label && <span class="row-label">{label}</span>}
      <div class="row-buttons" focusgroup="toolbar">
        {options.map((opt) =>
          opt.sublabels?.length ? (
            <SublabelChip key={opt.key} opt={opt} selected={selected} lang={lang} onToggle={onToggle} />
          ) : (
            <button
              key={opt.key}
              type="button"
              class={'chip' + (selected.has(opt.key) ? ' chip-on' : '')}
              onClick={() => onToggle(opt.key)}
            >
              {opt.label}
            </button>
          ),
        )}
        {relation === 'or' && (
          <button type="button" class="chip chip-all" onClick={onClear}>
            {t(lang, 'all')}
          </button>
        )}
      </div>
    </div>
  )
}
