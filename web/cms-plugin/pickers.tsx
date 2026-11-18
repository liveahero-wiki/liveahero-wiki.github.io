// Searchable card picker of the catalog filters: a multi-select chip list with a combobox that adds one. The combobox is a small hand-written WAI-ARIA 1.2 "list autocomplete" combobox:
// downshift's useCombobox measured ~+40 KB gzip in this single-file bundle (it does not tree-shake), which
// is not worth it for one control.

import type { ComponentChildren } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Lang } from './i18n.ts'
import { CardIcon, cardLabel, type CardKind, type IconKind } from './common.tsx'
import type { T } from './i18n/t.ts'
import { entryId, localizedName, passiveKind, searchText, type Roster } from './roster.ts'
import type { RosterHero, RosterItem, RosterSidekick } from './types.ts'

type Entry = RosterHero | RosterSidekick | RosterItem

/** Items are the only entries without a stockId; they are drawn with the item icon whatever the picker's kind. */
const iconKindOf = (e: Entry, kind: CardKind): IconKind => ('itemId' in e ? 'item' : kind)

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
        {selected && <CardIcon kind={iconKindOf(selected, kind)} stockId={entryId(selected)} roster={roster} lang={lang} size="md" />}
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
                key={entryId(item)}
                id={optionId(i)}
                role="option"
                aria-selected={i === hl}
                class={'cms-lah-option' + (i === hl ? ' cms-lah-option-hl' : '')}
                onMouseMove={() => hl !== i && setHl(i)}
                onClick={() => choose(item)}
              >
                <CardIcon kind={iconKindOf(item, kind)} stockId={entryId(item)} roster={roster} lang={lang} size="md" />
                <span class="cms-lah-option-name">{localizedName(item.name, lang)}</span>
                <span class="cms-lah-option-id">{'itemId' in item ? t('item') : `#${item.stockId}`}</span>
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

interface CardListPickerProps extends PickerBase {
  kind: CardKind
  values: number[]
  max: number
  /** Cards of this character cannot be added (the slot hero's own character). */
  excludeCharacter?: number | null
  /** Also offer the roster's skill-book items (listed first: they are few and would sit behind the 50-row cap). */
  withItems?: boolean
  onAdd: (id: number) => void
  onRemove: (id: number) => void
}

/** A list of chosen cards (and items) as removable icon chips plus a search box that adds one (up to `max`). */
export function CardListPicker({ kind, roster, values, max, excludeCharacter, withItems, onAdd, onRemove, lang, t, label, placeholder, invalid, describedBy }: CardListPickerProps) {
  const entries = useMemo(() => {
    if (!roster) return []
    const cards = (kind === 'hero' ? roster.heroes : roster.sidekicks).filter((e) => !values.includes(e.stockId) && e.characterId !== excludeCharacter)
    const items = withItems ? roster.items.filter((e) => !values.includes(e.itemId)) : []
    return [...items, ...cards]
  }, [roster, kind, values, excludeCharacter, withItems])
  const full = values.length >= max
  return (
    <div class="cms-lah-passives">
      <div class="cms-lah-label">
        {label}
      </div>
      {values.length > 0 && (
        <ul class="cms-lah-chips">
          {values.map((id) => {
            const idKind = withItems ? passiveKind(roster, id) : kind
            const name = cardLabel(roster, idKind, id, lang)
            return (
              <li key={id} class="cms-lah-selchip">
                <CardIcon kind={idKind} stockId={id} roster={roster} lang={lang} size="md" />
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
          kind={kind}
          roster={roster}
          entries={entries}
          selected={null}
          onSelect={(e) => onAdd(entryId(e))}
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
