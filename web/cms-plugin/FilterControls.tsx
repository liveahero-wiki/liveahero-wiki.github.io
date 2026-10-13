// Controls of the catalog filter's "basic" part:
//   TargetDropdown - a dropdown with one checkbox per target (any of)
//   UnitFilter     - one search box for heroes and sidekicks; every suggestion row has [+] (must use) and [-] (must not use)
// Both are stateless: the state lives in the host (see web/team-creator/Catalog.tsx); every change goes through onChange.
// The suggestion list is a small hand-written WAI-ARIA combobox, like Combo in pickers.tsx.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { CardIcon, cardLabel, type CardKind } from './common.tsx'
import { MAX_IDS, addId, removeId, toggleTarget, type FilterState, type IdListKey } from './filters.ts'
import type { Lang } from './i18n.ts'
import type { T } from './i18n/t.ts'
import { localizedName, searchText, type Roster } from './roster.ts'
import { targetLabel } from './targets.ts'
import type { RosterHero, RosterSidekick, Target } from './types.ts'

const MAX_ITEMS = 50
let seq = 0

interface BaseProps {
  state: FilterState
  lang: Lang
  t: T
  onChange(next: FilterState): void
}

// ---- target dropdown --------------------------------------------------------------------------------

export function TargetDropdown({ state, targets, lang, t, onChange }: BaseProps & { targets: Target[] }) {
  const [uid] = useState(() => `cms-lah-tg-${++seq}`)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  // Click / tap outside closes it (composedPath: the embed may live in a shadow root).
  useEffect(() => {
    if (!open) return
    const onDown = (e: Event) => {
      if (root.current && !e.composedPath().includes(root.current)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const label = (tg: Target) => (tg.retired ? t('targetRetiredOption', { name: targetLabel(tg, lang) }) : targetLabel(tg, lang))
  const picked = targets.filter((tg) => state.targets.includes(tg.id))
  const summary = picked.length === 0 ? t('filterTargetsAll') : picked.length === 1 ? label(picked[0]) : t('filterTargetsN', { count: picked.length })

  return (
    <div
      class="cms-lah-combo cms-lah-filter-targets"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.preventDefault()
          e.stopPropagation()
          setOpen(false)
          button.current?.focus()
        }
      }}
      onFocusOut={(e) => {
        const next = e.relatedTarget as Node | null
        if (next && !root.current?.contains(next)) setOpen(false)
      }}
    >
      <span class="cms-lah-label" id={`${uid}-label`}>
        {t('filterTargets')}
      </span>
      <button
        type="button"
        ref={button}
        class="cms-lah-input cms-lah-dropbtn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${uid}-menu`}
        aria-labelledby={`${uid}-label ${uid}-value`}
        onClick={() => setOpen((x) => !x)}
      >
        <span id={`${uid}-value`} class="cms-lah-dropbtn-text">
          {summary}
        </span>
      </button>
      <div id={`${uid}-menu`} role="group" aria-labelledby={`${uid}-label`} class={'cms-lah-menu' + (open ? ' cms-lah-menu-open' : '')}>
        <label class="cms-lah-option cms-lah-option-check">
          <input type="checkbox" checked={state.targets.length === 0} onChange={() => onChange({ ...state, targets: [] })} />
          <span class="cms-lah-option-name">{t('filterTargetsAll')}</span>
        </label>
        {targets.map((tg) => (
          <label key={tg.id} class="cms-lah-option cms-lah-option-check">
            <input type="checkbox" checked={state.targets.includes(tg.id)} onChange={() => onChange(toggleTarget(state, tg.id))} />
            <span class="cms-lah-option-name">{label(tg)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ---- hero / sidekick include + exclude --------------------------------------------------------------

type Entry = RosterHero | RosterSidekick
interface Unit {
  kind: CardKind
  entry: Entry
  text: string
}

const listKey = (kind: CardKind, mode: 'in' | 'out'): IdListKey => (kind === 'hero' ? (mode === 'in' ? 'heroIn' : 'heroOut') : mode === 'in' ? 'skIn' : 'skOut')

const modeOf = (state: FilterState, kind: CardKind, id: number): 'in' | 'out' | null =>
  state[listKey(kind, 'in')].includes(id) ? 'in' : state[listKey(kind, 'out')].includes(id) ? 'out' : null

/** Adds the unit to the list of `mode`, or takes it off again when it is already there. */
function toggleUnit(state: FilterState, kind: CardKind, id: number, mode: 'in' | 'out'): FilterState {
  const key = listKey(kind, mode)
  return state[key].includes(id) ? removeId(state, key, id) : addId(state, key, id)
}

export function UnitFilter({ state, roster, lang, t, onChange }: BaseProps & { roster: Roster | undefined }) {
  const [uid] = useState(() => `cms-lah-uf-${++seq}`)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [hl, setHl] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const units = useMemo<Unit[]>(() => {
    if (!roster) return []
    const mk = (kind: CardKind, list: Entry[]) => list.map((entry) => ({ kind, entry, text: searchText(entry) }))
    return [...mk('hero', roster.heroes), ...mk('sidekick', roster.sidekicks)]
  }, [roster])
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return units.slice(0, MAX_ITEMS)
    const hits = units.filter((u) => u.text.includes(q))
    // Names starting with the query first, then the rest in roster order.
    const starts = (u: Unit) => localizedName(u.entry.name, lang).toLowerCase().startsWith(q)
    return [...hits.filter(starts), ...hits.filter((u) => !starts(u))].slice(0, MAX_ITEMS)
  }, [units, query, lang])

  useEffect(() => {
    listRef.current?.children[hl]?.scrollIntoView?.({ block: 'nearest' })
  }, [hl, open])

  const close = () => {
    setOpen(false)
    setQuery('')
  }
  const apply = (u: Unit | undefined, mode: 'in' | 'out') => u && onChange(toggleUnit(state, u.kind, u.entry.stockId, mode))
  const full = (kind: CardKind, id: number, mode: 'in' | 'out') => state[listKey(kind, mode)].length >= MAX_IDS && !state[listKey(kind, mode)].includes(id)
  const optionId = (i: number) => `${uid}-o${i}`

  const onKeyDown = (ev: KeyboardEvent) => {
    const last = items.length - 1
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault()
        if (!open) {
          setOpen(true)
          setHl(0)
        } else setHl(Math.min(last, hl + 1))
        break
      case 'ArrowUp':
        ev.preventDefault()
        if (!open) {
          setOpen(true)
          setHl(Math.max(0, last))
        } else setHl(Math.max(0, hl - 1))
        break
      case 'Home':
      case 'End':
        if (open) {
          ev.preventDefault()
          setHl(ev.key === 'Home' ? 0 : Math.max(0, last))
        }
        break
      case 'Enter':
        if (open && items[hl]) {
          ev.preventDefault()
          apply(items[hl], ev.shiftKey ? 'out' : 'in')
        }
        break
      case 'Escape':
        if (open) {
          ev.preventDefault()
          ev.stopPropagation()
          close()
        }
        break
      case 'Tab':
        close()
        break
    }
  }

  // Chosen units: the required ones first, then the excluded ones.
  const chosen = (['in', 'out'] as const).flatMap((mode) => [
    ...state[listKey('hero', mode)].map((id) => ({ kind: 'hero' as const, id, mode })),
    ...state[listKey('sidekick', mode)].map((id) => ({ kind: 'sidekick' as const, id, mode })),
  ])
  const label = t('filterUnits')

  return (
    <div class="cms-lah-unitfilter">
      <label class="cms-lah-label" for={`${uid}-in`}>
        {label}
      </label>
      {chosen.length > 0 && (
        <ul class="cms-lah-chips">
          {chosen.map(({ kind, id, mode }) => {
            const name = cardLabel(roster, kind, id, lang)
            return (
              <li key={`${mode}-${kind}-${id}`} class={`cms-lah-selchip cms-lah-selchip-${mode}`}>
                <CardIcon kind={kind} stockId={id} roster={roster} lang={lang} size="md" />
                <span class="cms-lah-selchip-sign" aria-hidden="true">
                  {mode === 'in' ? '+' : '−'}
                </span>
                <span class="cms-lah-selchip-name">
                  <span class="cms-lah-sr">{mode === 'in' ? t('filterInclude') : t('filterExclude')}: </span>
                  {name}
                </span>
                <button type="button" class="cms-lah-btn cms-lah-btn-icon" aria-label={t('removeItem', { name })} title={t('removeItem', { name })} onClick={() => onChange(removeId(state, listKey(kind, mode), id))}>
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div class="cms-lah-combo">
        <input
          id={`${uid}-in`}
          class="cms-lah-input"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${uid}-list`}
          aria-activedescendant={open && items[hl] ? optionId(hl) : undefined}
          aria-describedby={`${uid}-hint`}
          disabled={!roster}
          placeholder={roster ? t('filterUnitPlaceholder') : t('loading')}
          value={query}
          onInput={(e) => {
            setQuery(e.currentTarget.value)
            setOpen(true)
            setHl(0)
          }}
          onClick={() => roster && setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={close}
        />
        <span id={`${uid}-hint`} class="cms-lah-sr">
          {t('filterUnitHint')}
        </span>
        <ul
          id={`${uid}-list`}
          ref={listRef}
          role="listbox"
          aria-label={label}
          class={'cms-lah-menu' + (open ? ' cms-lah-menu-open' : '')}
          // keep the input focused while pressing a button
          onMouseDown={(e) => e.preventDefault()}
        >
          {open &&
            (items.length ? (
              items.map((u, i) => {
                const id = u.entry.stockId
                const mode = modeOf(state, u.kind, id)
                const name = localizedName(u.entry.name, lang)
                return (
                  <li
                    key={`${u.kind}-${id}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={mode !== null}
                    class={'cms-lah-option' + (i === hl ? ' cms-lah-option-hl' : '')}
                    onMouseMove={() => hl !== i && setHl(i)}
                  >
                    <CardIcon kind={u.kind} stockId={id} roster={roster} lang={lang} size="md" />
                    <span class="cms-lah-option-name">{name}</span>
                    <span class="cms-lah-option-id">
                      {t(u.kind)} #{id}
                    </span>
                    <button
                      type="button"
                      tabIndex={-1}
                      class="cms-lah-btn cms-lah-btn-icon cms-lah-unitbtn cms-lah-unitbtn-in"
                      aria-pressed={mode === 'in'}
                      disabled={full(u.kind, id, 'in')}
                      aria-label={`${t('filterInclude')}: ${name}`}
                      title={t('filterInclude')}
                      onClick={() => apply(u, 'in')}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      class="cms-lah-btn cms-lah-btn-icon cms-lah-unitbtn cms-lah-unitbtn-out"
                      aria-pressed={mode === 'out'}
                      disabled={full(u.kind, id, 'out')}
                      aria-label={`${t('filterExclude')}: ${name}`}
                      title={t('filterExclude')}
                      onClick={() => apply(u, 'out')}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                  </li>
                )
              })
            ) : (
              <li class="cms-lah-option cms-lah-option-empty" role="option" aria-disabled="true" aria-selected="false">
                {t('noResults')}
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
