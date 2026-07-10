// Split chip for labels that have sublabels (target range / scaling source):
// the body toggles the whole label exactly like a plain chip; the ▾ caret opens
// a native popover of sublabel toggles. Sublabels of one label OR together and
// their composite keys live in the same selected Set as plain label keys.
//
// Not an ARIA menu (no role="menu"/aria-haspopup): it's a button group revealed
// in a popover, so plain toggle buttons with aria-pressed are the right
// semantics. popover="auto" gives top-layer rendering, Esc + light dismiss, and
// wires aria-expanded on the invoker natively. Clicks inside don't light-
// dismiss, so several sublabels can be toggled in one open.

import type { Label } from '../types'

interface SublabelChipProps {
  opt: Label
  selected: Set<string>
  onToggle: (value: string) => void
}

export function SublabelChip({ opt, selected, onToggle }: SublabelChipProps) {
  const sublabels = opt.sublabels ?? []
  const parentOn = selected.has(opt.key)
  const nSel = sublabels.reduce((n, s) => n + (selected.has(s.key) ? 1 : 0), 0)
  const stateClass = parentOn ? ' chip-on' : nSel ? ' chip-part' : ''
  const popId = `subpop-${opt.key}`
  const anchorName = `--subpop-${opt.key.replace(/[^a-zA-Z0-9_-]/g, '-')}`

  return (
    <span class="chip-split">
      <button
        type="button"
        class={'chip chip-main' + stateClass}
        aria-pressed={parentOn}
        onClick={() => onToggle(opt.key)}
      >
        {opt.label}
      </button>
      <button
        type="button"
        class={'chip chip-caret' + stateClass}
        popovertarget={popId}
        aria-label={`${opt.label}: sub-filters`}
        style={{ anchorName } as JSX.CSSProperties}
      >
        ▾{nSel > 0 && <span class="chip-count">{nSel}</span>}
      </button>
      <div id={popId} popover="auto" class="sub-pop" style={{ positionAnchor: anchorName } as JSX.CSSProperties}>
        {sublabels.map((s) => (
          <button
            key={s.key}
            type="button"
            class={'chip' + (selected.has(s.key) ? ' chip-on' : '')}
            aria-pressed={selected.has(s.key)}
            onClick={() => onToggle(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </span>
  )
}
