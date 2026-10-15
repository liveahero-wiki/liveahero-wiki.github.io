// Small pieces shared by the summary, detail and editor.

import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import type { Lang } from './i18n.ts'
import { charaUrl, heroIconUrl, itemIconUrl, loadRoster, localizedName, pwFormIconUrl, sidekickIconUrl, type Roster } from './roster.ts'
import type { T } from './i18n/t.ts'
import { findTarget, targetHref, targetLabel } from './targets.ts'
import type { Target } from './types.ts'

/** undefined = loading, null = failed to load, otherwise the roster. */
export function useRoster(): Roster | null | undefined {
  const [roster, setRoster] = useState<Roster | null | undefined>(undefined)
  useEffect(() => {
    let live = true
    loadRoster().then(
      (r) => live && setRoster(r),
      () => live && setRoster(null),
    )
    return () => {
      live = false
    }
  }, [])
  return roster
}

export type CardKind = 'hero' | 'sidekick'
/** What an icon / label can show: a card, or a skill-book item sitting in a passive slot (`stockId` is then its itemId). */
export type IconKind = CardKind | 'item'

function rosterEntry(roster: Roster | null | undefined, kind: IconKind, id: number) {
  return kind === 'hero' ? roster?.hero(id) : kind === 'sidekick' ? roster?.sidekick(id) : roster?.item(id)
}

export function cardName(roster: Roster | null | undefined, kind: IconKind, stockId: number, lang: Lang): string {
  const e = rosterEntry(roster, kind, stockId)
  return e ? localizedName(e.name, lang) : ''
}

/** Display text for a card or item: its localized name, else "#id". */
export function cardLabel(roster: Roster | null | undefined, kind: IconKind, stockId: number, lang: Lang): string {
  return cardName(roster, kind, stockId, lang) || `#${stockId}`
}

/** A card's name linked to its wiki chara page; plain text when the roster has no page for it (and for items). */
export function CardName({ kind, stockId, roster, lang, class: cls }: { kind: IconKind; stockId: number; roster: Roster | null | undefined; lang: Lang; class: string }) {
  const entry = rosterEntry(roster, kind, stockId)
  const href = entry && kind !== 'item' && 'stockId' in entry ? charaUrl(kind, entry) : ''
  const label = cardLabel(roster, kind, stockId, lang)
  return href ? (
    <a class={cls} href={href} target="_blank" rel="noopener">
      {label}
    </a>
  ) : (
    <span class={cls}>{label}</span>
  )
}

/** The target a team was built for, linked to the target's page when it has one; an unlisted id shows as is. */
export function TargetChip({ id, targets, lang, t }: { id: string; targets: Target[]; lang: Lang; t: T }) {
  const target = findTarget(targets, id)
  const label = target ? targetLabel(target, lang) : id
  const href = target ? targetHref(target) : ''
  const inner = (
    <>
      <span class="cms-lah-target-for">{t('targetChipLabel')}</span>
      <span class="cms-lah-target-name">{label}</span>
    </>
  )
  return (
    href ? (
      <a class="cms-lah-target-chip" href={href} target="_blank" rel="noopener">
        {inner}
      </a>
    ) : (
      <span class="cms-lah-target-chip">{inner}</span>
    )
  )
}

interface CardIconProps {
  kind: IconKind
  stockId: number
  roster: Roster | null | undefined
  lang: Lang
  size: 'lg' | 'md' | 'sm'
  /** Give the image the card's name as alt text (for icon-only usage). */
  named?: boolean
  focus?: boolean
}

/** Icon when the roster resolves the card; a loading box while loading; the stock id as text otherwise. */
export function CardIcon({ kind, stockId, roster, lang, size, named, focus }: CardIconProps) {
  const [brokenSrc, setBrokenSrc] = useState('')
  const entry = rosterEntry(roster, kind, stockId)
  const src = !entry ? '' : kind === 'hero' ? heroIconUrl(entry.resourceName) : kind === 'sidekick' ? sidekickIconUrl(entry.resourceName) : itemIconUrl(entry.resourceName)
  const cls = `cms-lah-icon cms-lah-icon-${size}${focus ? ' cms-lah-focus' : ''}`
  if (roster === undefined) return <span class={`${cls} cms-lah-icon-loading`} aria-hidden="true" />
  if (!entry || brokenSrc === src) {
    return (
      <span class={`${cls} cms-lah-icon-text`} title={entry ? localizedName(entry.name, lang) : undefined}>
        #{stockId}
      </span>
    )
  }
  const name = localizedName(entry.name, lang)
  return (
    <img
      class={cls}
      src={src}
      alt={named ? name : ''}
      title={name}
      loading="lazy"
      decoding="async"
      onError={() => setBrokenSrc(src)}
    />
  )
}

/** Icon of a Parallel Weapon form (decorative; the form's name is always shown next to it). */
export function PwFormIcon({ itemId, size }: { itemId: number; size: 'md' | 'sm' }) {
  return <img class={`cms-lah-icon cms-lah-icon-${size}`} src={pwFormIconUrl(itemId)} alt="" loading="lazy" decoding="async" onError={(e) => (e.currentTarget.hidden = true)} />
}

interface DialogProps {
  title: string
  t: T
  onClose: () => void
  children: ComponentChildren
}

let dialogSeq = 0

/** Native modal <dialog>: showModal(), close button, Esc, backdrop click; focus returns to the opener. */
export function Dialog({ title, t, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [titleId] = useState(() => `cms-lah-dlg-${++dialogSeq}`)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    let closedByUs = false
    // Esc fires `cancel` synchronously; `close` is the fallback for any other native close.
    const onCancel = (e: Event) => {
      e.preventDefault()
      onCloseRef.current()
    }
    const onNativeClose = () => {
      if (!closedByUs) onCloseRef.current()
    }
    dlg.addEventListener('cancel', onCancel)
    dlg.addEventListener('close', onNativeClose)
    if (!dlg.open) dlg.showModal()
    return () => {
      closedByUs = true
      dlg.removeEventListener('cancel', onCancel)
      dlg.removeEventListener('close', onNativeClose)
      if (dlg.open) dlg.close()
      opener?.focus?.()
    }
  }, [])

  // Backdrop click: the body fills the dialog box, so a click whose target is the <dialog> itself
  // landed on the ::backdrop. Require the press to start there too (text selection drags end anywhere).
  const pressedOnBackdrop = useRef(false)

  return (
    <dialog
      ref={ref}
      class="cms-lah cms-lah-dialog"
      aria-labelledby={titleId}
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === ref.current
      }}
      onClick={(e) => {
        if (e.target === ref.current && pressedOnBackdrop.current) onClose()
      }}
    >
      <div class="cms-lah-dialog-body">
        <header class="cms-lah-dialog-head">
          <h2 id={titleId} class="cms-lah-dialog-title">
            {title}
          </h2>
          <button type="button" autofocus class="cms-lah-btn cms-lah-btn-icon" aria-label={t('close')} title={t('close')} onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
