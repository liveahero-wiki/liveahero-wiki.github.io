// Tiny DOM helpers shared by the three plugins (plain DOM keeps each bundle small), plus the stylesheet injection.

import type { FieldError } from '../cms-plugin/plugin-api.ts'
import css from './styles.css?inline'

type Child = Node | string | number | null | undefined | false | Child[]
type Attrs = Record<string, unknown> | null

/** h('div', { class: 'x', onclick: fn, hidden: true, value: 'v' }, child, 'text') */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Attrs, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener)
      else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'readOnly' || k === 'open') (el as unknown as Record<string, unknown>)[k] = v
      else el.setAttribute(k, v === true ? '' : String(v))
    }
  }
  append(el, ...children)
  return el
}

export function append(el: Element, ...children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue
    if (Array.isArray(c)) append(el, ...c)
    else el.append(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c)
  }
}

export function clear(el: Element): void {
  el.replaceChildren()
}

const STYLE_ID = 'cms-lah-tl-styles'

/** Injects the shared stylesheet once (the three plugin bundles carry the same copy; whichever loads first wins). */
export function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

/** A fresh themed root inside `el`; the returned function removes it again. */
export function mountRoot(el: HTMLElement, cls = ''): { root: HTMLElement; unmount: () => void } {
  ensureStyles()
  const root = h('div', { class: `cms-lah-tl ${cls}`.trim() })
  el.appendChild(root)
  return { root, unmount: () => root.remove() }
}

/** The `lang`-tagged paragraph for Japanese text, or a muted dash when there is none. */
export function textBlock(text: string, opts: { lang?: string; empty?: string } = {}): HTMLElement {
  if (!text) return h('span', { class: 'cms-lah-tl-muted', title: opts.empty ?? 'none' }, '-')
  return h('div', { class: 'cms-lah-tl-text', lang: opts.lang }, text)
}

export function button(label: string, onclick: () => void, cls = ''): HTMLButtonElement {
  // type=button: the admin portal mounts editors inside a <form>.
  return h('button', { type: 'button', class: `cms-lah-tl-btn ${cls}`.trim(), onclick }, label)
}

// ---- field errors

/** `payload.lines.2.text` / `lines.2.text` / `payload` -> `lines.2.text` / `lines.2.text` / ''. */
export const relPath = (path: string): string => path.replace(/^payload\.?/, '')

export function errorsAt(errors: FieldError[], rel: string): FieldError[] {
  return errors.filter((e) => relPath(e.path) === rel)
}

/** Renders messages into `box` (a list) and mirrors the state on the control(s) with aria-invalid / aria-describedby. */
export function showErrors(box: HTMLElement, errs: FieldError[], controls: (HTMLElement | null)[] = []): void {
  clear(box)
  for (const e of errs) box.append(h('li', null, e.message))
  box.hidden = errs.length === 0
  for (const c of controls) {
    if (!c) continue
    if (errs.length) {
      c.setAttribute('aria-invalid', 'true')
      if (box.id) c.setAttribute('aria-describedby', box.id)
    } else {
      c.removeAttribute('aria-invalid')
      c.removeAttribute('aria-describedby')
    }
  }
}

let uid = 0
export const nextId = (prefix: string): string => `${prefix}-${++uid}`

/** An error list element (hidden while empty) with a unique id. */
export function errorBox(): HTMLElement {
  return h('ul', { class: 'cms-lah-tl-errors', id: nextId('cms-lah-tl-err'), role: 'alert', hidden: true })
}

/** Label + control (+ hint) + error box; returns the wrapper and the error box. */
export function field(label: string, control: HTMLElement, hint?: string, errBox: HTMLElement = errorBox()): { wrap: HTMLElement; errs: HTMLElement } {
  if (!control.id) control.id = nextId('cms-lah-tl-f')
  const wrap = h(
    'div',
    { class: 'cms-lah-tl-field' },
    h('label', { class: 'cms-lah-tl-label', for: control.id }, label),
    control,
    hint ? h('p', { class: 'cms-lah-tl-hint' }, hint) : null,
    errBox,
  )
  return { wrap, errs: errBox }
}
