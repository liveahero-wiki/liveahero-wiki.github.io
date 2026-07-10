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

import { useRef } from 'preact/hooks'
import type { Label } from '../types'

interface SublabelChipProps {
  opt: Label
  selected: Set<string>
  onToggle: (value: string) => void
}

export function SublabelChip({ opt, selected, onToggle }: SublabelChipProps) {
  const popRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLButtonElement>(null)
  const sublabels = opt.sublabels ?? []
  const parentOn = selected.has(opt.key)
  const nSel = sublabels.reduce((n, s) => n + (selected.has(s.key) ? 1 : 0), 0)
  const stateClass = parentOn ? ' chip-on' : nSel ? ' chip-part' : ''
  const popId = `subpop-${opt.key}`

  // Manual anchoring: CSS anchor positioning has no cross-browser support yet,
  // so place the top-layer popover next to the caret on open, clamped to the
  // viewport and flipped above when it would overflow the bottom.
  const position = (e: Event) => {
    if ((e as ToggleEvent).newState !== 'open') return
    const pop = popRef.current
    const caret = caretRef.current
    if (!pop || !caret) return
    const a = caret.getBoundingClientRect()
    const p = pop.getBoundingClientRect()
    let top = a.bottom + 4
    if (top + p.height > window.innerHeight - 8) top = Math.max(8, a.top - p.height - 4)
    const left = Math.min(Math.max(8, a.left), Math.max(8, window.innerWidth - p.width - 8))
    pop.style.top = `${top}px`
    pop.style.left = `${left}px`
  }

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
        ref={caretRef}
        type="button"
        class={'chip chip-caret' + stateClass}
        popovertarget={popId}
        aria-label={`${opt.label}: sub-filters`}
      >
        ▾{nSel > 0 && <span class="chip-count">{nSel}</span>}
      </button>
      <div id={popId} ref={popRef} popover="auto" class="sub-pop" onToggle={position}>
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
