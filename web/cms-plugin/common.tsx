// Small pieces shared by the summary, detail and editor.

import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import type { Lang } from './plugin-api.ts'
import { charaUrl, heroIconUrl, loadRoster, localizedName, sidekickIconUrl, type Roster } from './roster.ts'
import type { T } from './i18n/t.ts'

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

export function cardName(roster: Roster | null | undefined, kind: CardKind, stockId: number, lang: Lang): string {
  const e = kind === 'hero' ? roster?.hero(stockId) : roster?.sidekick(stockId)
  return e ? localizedName(e.name, lang) : ''
}

/** Display text for a card: its localized name, else "#stockId". */
export function cardLabel(roster: Roster | null | undefined, kind: CardKind, stockId: number, lang: Lang): string {
  return cardName(roster, kind, stockId, lang) || `#${stockId}`
}

/** A card's name linked to its wiki chara page; plain text when the roster has no page for it. */
export function CardName({ kind, stockId, roster, lang, class: cls }: { kind: CardKind; stockId: number; roster: Roster | null | undefined; lang: Lang; class: string }) {
  const entry = kind === 'hero' ? roster?.hero(stockId) : roster?.sidekick(stockId)
  const href = entry ? charaUrl(kind, entry) : ''
  const label = cardLabel(roster, kind, stockId, lang)
  return href ? (
    <a class={cls} href={href} target="_blank" rel="noopener">
      {label}
    </a>
  ) : (
    <span class={cls}>{label}</span>
  )
}

interface CardIconProps {
  kind: CardKind
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
  const entry = kind === 'hero' ? roster?.hero(stockId) : roster?.sidekick(stockId)
  const src = !entry ? '' : kind === 'hero' ? heroIconUrl(entry.resourceName) : sidekickIconUrl(entry.resourceName)
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
