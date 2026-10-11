// Searchable card pickers: a single-select combobox (hero / active sidekick) and a multi-select chip list
// (passive sidekicks). The combobox is a small hand-written WAI-ARIA 1.2 "list autocomplete" combobox:
// downshift's useCombobox measured ~+40 KB gzip in this single-file bundle (it does not tree-shake), which
// is not worth it for one control.

import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Lang } from './plugin-api.ts'
import { CardIcon, cardLabel, type CardKind } from './common.tsx'
import type { T } from './i18n/t.ts'
import { localizedName, searchText, type Roster } from './roster.ts'
import type { RosterHero, RosterSidekick } from './types.ts'

type Entry = RosterHero | RosterSidekick

const MAX_ITEMS = 50
let comboSeq = 0

interface ComboProps {
  kind: CardKind
  roster: Roster
  entries: Entry[]
  selected: Entry | null
  onSelect: (e: Entry) => void
  lang: Lang
  t: T
  label: string
  placeholder: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  /** Rendered after the input (e.g. a clear button). */
  trailing?: ComponentChildren
  hideLabel?: boolean
  dataFocus?: string
}

function Combo({ kind, roster, entries, selected, onSelect, lang, t, label, placeholder, disabled, invalid, describedBy, trailing, hideLabel, dataFocus }: ComboProps) {
  const [uid] = useState(() => `cms-lah-cb-${++comboSeq}`)
  const [open, setOpen] = useState(false)
  /** What the user typed; null = show the selected card's name. */
  const [query, setQuery] = useState<string | null>(null)
  const [hl, setHl] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const haystack = useMemo(() => entries.map((e) => ({ e, text: searchText(e) })), [entries])
  const items = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase()
    if (!q) return entries.slice(0, MAX_ITEMS)
    const hits = haystack.filter((h) => h.text.includes(q)).map((h) => h.e)
    // Names starting with the query first, then the rest in roster order.
    const starts = (e: Entry) => localizedName(e.name, lang).toLowerCase().startsWith(q)
    return [...hits.filter(starts), ...hits.filter((e) => !starts(e))].slice(0, MAX_ITEMS)
  }, [entries, haystack, query, lang])

  useEffect(() => {
    listRef.current?.children[hl]?.scrollIntoView?.({ block: 'nearest' })
  }, [hl, open])

  const close = () => {
    setOpen(false)
    setQuery(null)
  }
  const choose = (e: Entry) => {
    onSelect(e)
    close()
  }
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
          choose(items[hl])
        }
        break
      case 'Escape':
        if (open) {
          ev.preventDefault()
          ev.stopPropagation() // do not also close a surrounding dialog
          close()
        }
        break
      case 'Tab':
        close()
        break
    }
  }

  return (
    <div class="cms-lah-combo">
      <label for={`${uid}-in`} class={hideLabel ? 'cms-lah-sr' : 'cms-lah-label'}>
        {label}
      </label>
      <div class="cms-lah-combo-row">
        {selected && <CardIcon kind={kind} stockId={selected.stockId} roster={roster} lang={lang} size="md" />}
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
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          data-focus={dataFocus}
          disabled={disabled}
          placeholder={placeholder}
          value={query ?? (selected ? localizedName(selected.name, lang) : '')}
          onInput={(e) => {
            setQuery(e.currentTarget.value)
            setOpen(true)
            setHl(0)
          }}
          onClick={() => !disabled && setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={close}
        />
        {trailing}
      </div>
      <ul
        id={`${uid}-list`}
        ref={listRef}
        role="listbox"
        aria-label={label}
        class={'cms-lah-menu' + (open ? ' cms-lah-menu-open' : '')}
        // keep the input focused while pressing an option
        onMouseDown={(e) => e.preventDefault()}
      >
        {open &&
          (items.length ? (
            items.map((item, i) => (
              <li
                key={item.stockId}
                id={optionId(i)}
                role="option"
                aria-selected={i === hl}
                class={'cms-lah-option' + (i === hl ? ' cms-lah-option-hl' : '')}
                onMouseMove={() => hl !== i && setHl(i)}
                onClick={() => choose(item)}
              >
                <CardIcon kind={kind} stockId={item.stockId} roster={roster} lang={lang} size="md" />
                <span class="cms-lah-option-name">{localizedName(item.name, lang)}</span>
                <span class="cms-lah-option-id">#{item.stockId}</span>
              </li>
            ))
          ) : (
            <li class="cms-lah-option cms-lah-option-empty" role="option" aria-disabled="true" aria-selected="false">
              {t('noResults')}
            </li>
          ))}
      </ul>
    </div>
  )
}

interface PickerBase {
  roster: Roster | null | undefined
  lang: Lang
  t: T
  label: string
  placeholder: string
  invalid?: boolean
  describedBy?: string
  dataFocus?: string
}

/** Fallback when the roster could not be loaded: plain numeric card id. */
function IdInput({ value, onChange, t, label, invalid, describedBy, dataFocus }: { value: number | null; onChange: (id: number | null) => void } & Pick<PickerBase, 't' | 'label' | 'invalid' | 'describedBy' | 'dataFocus'>) {
  return (
    <div class="cms-lah-combo">
      <label class="cms-lah-label">
        {label} ({t('cardId')})
        <input
          class="cms-lah-input"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={value ?? ''}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          data-focus={dataFocus}
          onInput={(e) => {
            const raw = e.currentTarget.value
            onChange(raw === '' ? null : Number(raw))
          }}
        />
      </label>
    </div>
  )
}

interface CardPickerProps extends PickerBase {
  kind: CardKind
  value: number | null
  onChange: (id: number | null) => void
  /** A card that cannot be chosen (the slot's own hero for the active sidekick). */
  exclude?: number | null
  /** Cards of this character cannot be chosen (the slot hero's own character). */
  excludeCharacter?: number | null
  clearable?: boolean
}

export function CardPicker({ kind, roster, value, onChange, exclude, excludeCharacter, clearable, lang, t, label, placeholder, invalid, describedBy, dataFocus }: CardPickerProps) {
  const list = roster ? (kind === 'hero' ? roster.heroes : roster.sidekicks) : []
  const entries = useMemo(
    () => (exclude || excludeCharacter ? list.filter((e) => e.stockId !== exclude && e.characterId !== excludeCharacter) : list),
    [list, exclude, excludeCharacter],
  )
  if (roster === null) return <IdInput value={value} onChange={onChange} t={t} label={label} invalid={invalid} describedBy={describedBy} dataFocus={dataFocus} />
  if (roster === undefined) {
    return (
      <div class="cms-lah-combo">
        <span class="cms-lah-label">{label}</span>
        <input class="cms-lah-input" disabled value={value ? `#${value}` : t('loading')} aria-label={label} />
      </div>
    )
  }
  const selected = value ? (kind === 'hero' ? roster.hero(value) : roster.sidekick(value)) ?? null : null
  return (
    <Combo
      kind={kind}
      roster={roster}
      entries={entries}
      selected={selected}
      onSelect={(e) => onChange(e.stockId)}
      lang={lang}
      t={t}
      label={label}
      placeholder={value && !selected ? `#${value}` : placeholder}
      invalid={invalid}
      describedBy={describedBy}
      dataFocus={dataFocus}
      trailing={
        clearable && value ? (
          <button type="button" class="cms-lah-btn cms-lah-btn-icon" aria-label={`${t('clear')}: ${label}`} title={t('clear')} onClick={() => onChange(null)}>
            <span aria-hidden="true">×</span>
          </button>
        ) : undefined
      }
    />
  )
}

interface PassivePickerProps extends PickerBase {
  values: number[]
  max: number
  /** Sidekicks of this character cannot be added (the slot hero's own character). */
  excludeCharacter?: number | null
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

export function PassivePicker({ roster, values, max, excludeCharacter, onAdd, onRemove, lang, t, label, placeholder, invalid, describedBy }: PassivePickerProps) {
  const entries = useMemo(
    () => (roster ? roster.sidekicks.filter((e) => !values.includes(e.stockId) && e.characterId !== excludeCharacter) : []),
    [roster, values, excludeCharacter],
  )
  const full = values.length >= max
  return (
    <div class="cms-lah-passives">
      <div class="cms-lah-label">
        {label}
      </div>
      {values.length > 0 && (
        <ul class="cms-lah-chips">
          {values.map((id) => {
            const name = cardLabel(roster, 'sidekick', id, lang)
            return (
              <li key={id} class="cms-lah-selchip">
                <CardIcon kind="sidekick" stockId={id} roster={roster} lang={lang} size="md" />
                <span class="cms-lah-selchip-name">{name}</span>
                <button type="button" class="cms-lah-btn cms-lah-btn-icon" aria-label={t('removeItem', { name })} title={t('removeItem', { name })} onClick={() => onRemove(id)}>
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {roster === null ? (
        <IdAdder onAdd={onAdd} disabled={full} t={t} invalid={invalid} describedBy={describedBy} />
      ) : roster === undefined ? null : (
        <Combo
          kind="sidekick"
          roster={roster}
          entries={entries}
          selected={null}
          onSelect={(e) => onAdd(e.stockId)}
          lang={lang}
          t={t}
          label={label}
          hideLabel
          placeholder={placeholder}
          disabled={full}
          invalid={invalid}
          describedBy={describedBy}
        />
      )}
    </div>
  )
}

/** Roster-less fallback for the passives: type a card id and press Enter / the button. */
function IdAdder({ onAdd, disabled, t, invalid, describedBy }: { onAdd: (id: number) => void; disabled: boolean } & Pick<PickerBase, 't' | 'invalid' | 'describedBy'>) {
  const [raw, setRaw] = useState('')
  const add = () => {
    const n = Number(raw)
    if (raw !== '' && Number.isFinite(n)) {
      onAdd(n)
      setRaw('')
    }
  }
  return (
    <div class="cms-lah-combo-row">
      <input
        class="cms-lah-input"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={raw}
        disabled={disabled}
        aria-label={t('cardId')}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onInput={(e) => setRaw(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
      />
      <button type="button" class="cms-lah-btn" disabled={disabled} onClick={add}>
        +
      </button>
    </div>
  )
}
