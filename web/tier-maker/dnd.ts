// Mouse drag and drop of character tiles onto tier rows and the pool, on pointer events (native HTML5 drag and drop
// gives no drop position and no touch support). Touch and pen users place characters with tap-to-select instead: a finger
// (or a stylus, which browsers also pan with) must still scroll the page and the pool, and a pan cancels the pointer stream.

import { useEffect, useRef, useState } from 'preact/hooks'

export const POOL_ZONE = 'pool'

/** `zone` is a tier id or POOL_ZONE; `index` is the insertion position among that zone's tiles. */
export interface DropTarget {
  zone: string
  index: number
}

const DRAG_THRESHOLD = 6
const EDGE = 80 // px from the viewport edge where dragging scrolls the page

export function dropTarget(x: number, y: number): DropTarget | null {
  const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-zone]')
  if (!zone?.dataset.zone) return null
  const tiles = [...zone.querySelectorAll<HTMLElement>('[data-key]')]
  let index = tiles.length
  for (let i = 0; i < tiles.length; i++) {
    const r = tiles[i].getBoundingClientRect()
    if (y < r.top || (y <= r.bottom && x < r.left + r.width / 2)) {
      index = i
      break
    }
  }
  return { zone: zone.dataset.zone, index }
}

const sameTarget = (a: DropTarget | null, b: DropTarget | null): boolean => a === b || (!!a && !!b && a.zone === b.zone && a.index === b.index)

/**
 * `drag` is the key being dragged. The ghost follows the pointer through `ghostRef` (a ref callback that moves the element
 * directly), so a pointer move re-renders only when the drop position changes, not on every pixel. `startDrag` is stable
 * so memoized tiles are not re-rendered by it.
 */
export function useDnd(onDrop: (key: string, target: DropTarget) => void) {
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<DropTarget | null>(null)
  const dropRef = useRef(onDrop)
  dropRef.current = onDrop
  const suppressClick = useRef(false)
  const cleanup = useRef<(() => void) | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const ghost = useRef<HTMLElement | null>(null)
  useEffect(() => () => cleanup.current?.(), [])

  const placeGhost = () => {
    if (!ghost.current) return
    ghost.current.style.left = `${pointer.current.x}px`
    ghost.current.style.top = `${pointer.current.y}px`
  }
  const ghostRef = useRef((el: HTMLElement | null) => {
    ghost.current = el
    placeGhost()
  }).current

  /** Pointer-down handler for the tile of `key`. */
  const startDrag = useRef((key: string) => (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType !== 'mouse') return
    const sx = e.clientX
    const sy = e.clientY
    let active = false
    let target: DropTarget | null = null

    const move = (ev: PointerEvent) => {
      if (!active) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < DRAG_THRESHOLD) return
        active = true
        document.body.classList.add('lah-tm-dragging')
      }
      if (ev.clientY < EDGE) window.scrollBy(0, -14)
      else if (ev.clientY > window.innerHeight - EDGE) window.scrollBy(0, 14)
      target = dropTarget(ev.clientX, ev.clientY)
      pointer.current = { x: ev.clientX, y: ev.clientY }
      placeGhost()
      setDrag(key)
      const t = target
      setOver((o) => (sameTarget(o, t) ? o : t))
    }
    const end = (ev: PointerEvent) => {
      stop()
      if (!active) return
      // the click that follows a drag's pointerup must not also select the tile
      suppressClick.current = true
      setTimeout(() => (suppressClick.current = false), 0)
      if (ev.type === 'pointerup' && target) dropRef.current(key, target)
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      document.body.classList.remove('lah-tm-dragging')
      cleanup.current = null
      setDrag(null)
      setOver(null)
    }
    cleanup.current?.()
    cleanup.current = stop
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }).current

  return { drag, over, startDrag, ghostRef, wasDrag: () => suppressClick.current }
}
