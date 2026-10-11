// Tiny pointer-events drag-to-reorder for a vertical list (mouse, touch and pen).
// The grip element must have `touch-action: none`. Items are the list's direct children matching
// `[data-cms-slot]`. While dragging, the dragged item follows the pointer via a CSS variable and a
// drop indicator line shows where it will land; nothing in the Preact tree changes until the drop.

export interface DragOptions {
  list: HTMLElement
  item: HTMLElement
  grip: HTMLElement
  onDrop(from: number, to: number): void
}

const EDGE = 64 // px from the viewport edge where auto-scroll kicks in
const SCROLL_STEP = 14

/** Returns a function that aborts the drag (used when the editor is destroyed mid-drag). */
export function startDrag(ev: PointerEvent, { list, item, grip, onDrop }: DragOptions): () => void {
  const items = () => Array.from(list.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute('data-cms-slot'))
  const from = items().indexOf(item)
  if (from < 0) return () => {}

  grip.setPointerCapture(ev.pointerId)
  const startY = ev.clientY
  const startScroll = window.scrollY
  let lastY = startY
  let to = from
  let raf = 0
  let done = false

  const indicator = document.createElement('div')
  indicator.className = 'cms-lah-drop-indicator'
  indicator.setAttribute('aria-hidden', 'true')
  list.appendChild(indicator)
  item.classList.add('cms-lah-dragging')

  const update = () => {
    item.style.setProperty('--cms-lah-drag-y', `${lastY - startY + (window.scrollY - startScroll)}px`)
    const others = items().filter((i) => i !== item)
    to = others.filter((o) => {
      const r = o.getBoundingClientRect()
      return lastY > r.top + r.height / 2
    }).length
    // Indicator sits in the gap before others[to] (or after the last one).
    const listTop = list.getBoundingClientRect().top
    let y: number
    if (others.length === 0) y = 0
    else if (to < others.length) y = others[to].getBoundingClientRect().top - listTop
    else y = others[others.length - 1].getBoundingClientRect().bottom - listTop
    indicator.style.top = `${y}px`
  }

  const tick = () => {
    if (lastY < EDGE) window.scrollBy(0, -SCROLL_STEP)
    else if (lastY > window.innerHeight - EDGE) window.scrollBy(0, SCROLL_STEP)
    update()
    raf = requestAnimationFrame(tick)
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== ev.pointerId) return
    lastY = e.clientY
    update()
  }
  const finish = (commit: boolean) => {
    if (done) return
    done = true
    cancelAnimationFrame(raf)
    grip.removeEventListener('pointermove', onMove)
    grip.removeEventListener('pointerup', onUp)
    grip.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('keydown', onKey, true)
    if (grip.hasPointerCapture(ev.pointerId)) grip.releasePointerCapture(ev.pointerId)
    indicator.remove()
    item.classList.remove('cms-lah-dragging')
    item.style.removeProperty('--cms-lah-drag-y')
    if (commit && to !== from) onDrop(from, to)
  }
  const onUp = (e: PointerEvent) => {
    if (e.pointerId === ev.pointerId) finish(true)
  }
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId === ev.pointerId) finish(false)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      finish(false)
    }
  }

  grip.addEventListener('pointermove', onMove)
  grip.addEventListener('pointerup', onUp)
  grip.addEventListener('pointercancel', onCancel)
  window.addEventListener('keydown', onKey, true)
  update()
  raf = requestAnimationFrame(tick)
  return () => finish(false)
}
