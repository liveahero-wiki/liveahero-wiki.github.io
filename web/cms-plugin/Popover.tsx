// A native popover (the HTML Popover API, `popover="auto"`): shown on mount, closed by Esc, a click outside or `close()`.
// It sits in the top layer, so it is not clipped by the host page; the stylesheet centers it, or makes it a bottom sheet on a phone.

import type { ComponentChildren } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

interface Props {
  /** Accessible name. */
  label: string
  /** Called once the popover has closed (Esc, outside click). Unmount the popover in response. */
  onClose: () => void
  /** Extra class for the panel. */
  class?: string
  children: ComponentChildren
}

export function Popover({ label, onClose, class: cls, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === 'closed') onCloseRef.current()
    }
    el.addEventListener('toggle', onToggle)
    try {
      el.showPopover()
    } catch {
      /* not connected / already open */
    }
    return () => {
      el.removeEventListener('toggle', onToggle)
      try {
        if (el.matches(':popover-open')) el.hidePopover()
      } catch {
        /* already gone */
      }
    }
  }, [])

  return (
    <div ref={ref} popover="auto" role="dialog" aria-label={label} class={'cms-lah cms-lah-pop' + (cls ? ` ${cls}` : '')}>
      {children}
    </div>
  )
}

/** Closes the popover that contains `el` (a button inside it). */
export function closePopoverOf(el: Element | null): void {
  try {
    el?.closest<HTMLElement>('[popover]')?.hidePopover()
  } catch {
    /* already closed */
  }
}
