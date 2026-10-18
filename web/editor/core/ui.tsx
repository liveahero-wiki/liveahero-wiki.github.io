// Small UI pieces shared by the three editors: the native <dialog> wrapper and the message boxes.

import type { ComponentChildren } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import type { T } from '../i18n/t.ts'

let dialogSeq = 0

/** A modal native <dialog>. Esc and the close button call `onRequestClose` (which decides whether to really close). */
export function Modal({ title, t, onRequestClose, wide, children, className }: { title: string; t: T; onRequestClose: () => void; wide?: boolean; children: ComponentChildren; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const idRef = useRef(`contrib-dlg-${++dialogSeq}`)
  const closeRef = useRef(onRequestClose)
  closeRef.current = onRequestClose

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onCancel = (e: Event) => {
      e.preventDefault() // never let the browser drop an editor with unsent text; the owner decides
      closeRef.current()
    }
    d.addEventListener('cancel', onCancel)
    if (!d.open) d.showModal()
    return () => {
      d.removeEventListener('cancel', onCancel)
      if (d.open) d.close()
    }
  }, [])

  return (
    <dialog ref={ref} class={`contrib-dlg${wide ? ' contrib-dlg--wide' : ''}${className ? ` ${className}` : ''}`} aria-labelledby={idRef.current}>
      <div class="contrib-dlg__head">
        <h2 id={idRef.current}>{title}</h2>
        <button type="button" class="contrib-dlg__x" aria-label={t('close')} onClick={() => closeRef.current()}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="contrib-dlg__body">{children}</div>
    </dialog>
  )
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'error' | 'success' | 'warn'; children: ComponentChildren }) {
  return (
    <p class={`contrib-notice contrib-notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
