// Picker popover: a grid of hero / sidekick / item icons with rarity (and, for heroes, element) filters and a name search.
// It only reports the choice; the parent closes (unmounts) it.

import { useMemo, useState } from 'preact/hooks'
import type { Lang } from './i18n.ts'
import { CardIcon } from './common.tsx'
import { ELEMENT_IDS, elementIconUrl } from './elements.ts'
import type { Key, T } from './i18n/t.ts'
import { filterEntries, searchIndex, type PickEntry } from './pick.ts'
import { closePopoverOf, Popover } from './Popover.tsx'
import { localizedName, type Roster } from './roster.ts'

const PAGE = 120
const canHover = () => typeof matchMedia === 'function' && matchMedia('(hover: hover)').matches

function toggled(set: ReadonlySet<number>, n: number): Set<number> {
  const next = new Set(set)
  if (!next.delete(n)) next.add(n)
  return next
}

interface PickerProps {
  roster: Roster
  /** What can be chosen (the caller has already left out what the slot cannot use). */
  entries: PickEntry[]
  /** Rarity chips to offer. */
  rarities: readonly number[]
  /** Offer the element chips (heroes). */
  elements?: boolean
  selectedId: number | null
  lang: Lang
  t: T
  title: string
  onSelect(entry: PickEntry): void
  /** Shows a button that calls this, labelled `clearLabel`. */
  onClear?: () => void
  clearLabel?: string
  onClose(): void
}

export function EntryPickerPopover({ roster, entries, rarities, elements: withElements, selectedId, lang, t, title, onSelect, onClear, clearLabel, onClose }: PickerProps) {
  const [rarity, setRarity] = useState<ReadonlySet<number>>(new Set())
  const [element, setElement] = useState<ReadonlySet<number>>(new Set())
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)
  const index = useMemo(() => searchIndex(entries), [entries])
  const filtered = useMemo(() => filterEntries(entries, { rarities: rarity, elements: element, query }, lang, index), [entries, index, rarity, element, query, lang])
  const refilter = () => setShown(PAGE)

  return (
    <Popover label={title} onClose={onClose}>
      <header class="cms-lah-pop-head">
        <h2 class="cms-lah-dialog-title">{title}</h2>
        <button type="button" class="cms-lah-btn cms-lah-btn-icon" aria-label={t('close')} title={t('close')} onClick={(e) => closePopoverOf(e.currentTarget)}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="cms-lah-pop-filters">
        <div class="cms-lah-pop-chips" role="group" aria-label={t('filterRarity')}>
          {rarities.map((n) => (
            <button
              key={n}
              type="button"
              class="cms-lah-btn cms-lah-chipbtn"
              aria-pressed={rarity.has(n)}
              onClick={() => {
                setRarity(toggled(rarity, n))
                refilter()
              }}
            >
              ☆{n}
            </button>
          ))}
        </div>
        {withElements && (
          <div class="cms-lah-pop-chips" role="group" aria-label={t('filterElement')}>
            {ELEMENT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                class="cms-lah-btn cms-lah-chipbtn cms-lah-elembtn"
                aria-pressed={element.has(id)}
                aria-label={t(`element${id}` as Key)}
                title={t(`element${id}` as Key)}
                onClick={() => {
                  setElement(toggled(element, id))
                  refilter()
                }}
              >
                <img src={elementIconUrl(id)} alt="" width="24" height="24" loading="lazy" />
              </button>
            ))}
          </div>
        )}
        <input
          class="cms-lah-input"
          type="search"
          autocomplete="off"
          autofocus={canHover()}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          value={query}
          onInput={(e) => {
            setQuery(e.currentTarget.value)
            refilter()
          }}
        />
        {onClear && (
          <button type="button" class="cms-lah-btn" onClick={onClear}>
            {clearLabel ?? t('clear')}
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <p class="cms-lah-muted cms-lah-pop-empty">{t('noResults')}</p>
      ) : (
        <ul class="cms-lah-grid">
          {filtered.slice(0, shown).map((e) => (
            <li key={`${e.kind}:${e.id}`}>
              <button type="button" class="cms-lah-grid-item" aria-pressed={e.id === selectedId} aria-label={localizedName(e.name, lang)} onClick={() => onSelect(e)}>
                <CardIcon kind={e.kind} stockId={e.id} roster={roster} lang={lang} size="lg" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > shown && (
        <button type="button" class="cms-lah-btn cms-lah-pop-more" onClick={() => setShown(shown + PAGE)}>
          {t('showMore')} ({shown}/{filtered.length})
        </button>
      )}
    </Popover>
  )
}

interface IdPopoverProps {
  t: T
  title: string
  onSelect(id: number): void
  onClear?: () => void
  clearLabel?: string
  onClose(): void
}

/** Roster-less fallback (the character list could not be loaded): type a card id. */
export function IdPickerPopover({ t, title, onSelect, onClear, clearLabel, onClose }: IdPopoverProps) {
  const [raw, setRaw] = useState('')
  const apply = () => {
    const n = Number(raw)
    if (raw !== '' && Number.isInteger(n) && n > 0) onSelect(n)
  }
  return (
    <Popover label={title} onClose={onClose}>
      <header class="cms-lah-pop-head">
        <h2 class="cms-lah-dialog-title">{title}</h2>
        <button type="button" class="cms-lah-btn cms-lah-btn-icon" aria-label={t('close')} title={t('close')} onClick={(e) => closePopoverOf(e.currentTarget)}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div class="cms-lah-pop-filters">
        <div class="cms-lah-combo-row">
          <input
            class="cms-lah-input"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={raw}
            aria-label={t('cardId')}
            placeholder={t('cardId')}
            onInput={(e) => setRaw(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                apply()
              }
            }}
          />
          <button type="button" class="cms-lah-btn" onClick={apply}>
            OK
          </button>
        </div>
        {onClear && (
          <button type="button" class="cms-lah-btn" onClick={onClear}>
            {clearLabel ?? t('clear')}
          </button>
        )}
      </div>
    </Popover>
  )
}
