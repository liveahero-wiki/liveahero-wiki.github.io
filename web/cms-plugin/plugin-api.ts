// Source of truth: wiki-cms/src/shared/plugin-api.ts. Copy this file verbatim into plugin repos.
import type { Lang } from './i18n.ts'

/** `message` is the English fallback; `code` (+ `params`) is what localized clients translate. */
export interface FieldError {
  path: string
  code: string
  message: string
  params?: Record<string, string | number>
}

export interface PluginContext {
  /** Resolved UI language; the plugin owns its string bundles and falls back to 'en'. */
  uiLang: Lang
  /** Informational; plugins should rely on [data-theme] CSS anyway. */
  theme: 'light' | 'dark'
  /** Registry options for the current group. The plugin must not parse `id`. */
  group: { id: string; options: Record<string, unknown> }
}

export interface EditorHandle {
  destroy(): void
  /** Client-side mirror of the server rules (paths are full, e.g. 'payload.heroes.0.stockId', like the server emits; setErrors also accepts them without the 'payload.' prefix). */
  validate(): FieldError[]
  setErrors(errors: FieldError[]): void
}

/** Optional game-specific filtering and sorting for the catalog layout of the list. The core treats the state `S` as opaque. */
export interface ListFilter<P = unknown, S = unknown> {
  /** State from the hash params the plugin owns (the core reserves `q`, `sort`, `lang` and `t.*`). */
  init(params: URLSearchParams, ctx: PluginContext): S
  /** Non-default values only; merged into the hash by the core (an empty result means "no plugin filter is active"). */
  toParams(state: S): Record<string, string>
  /** Awaited once before the first filtering (e.g. to load the roster). */
  prepare?(): Promise<void>
  /**
   * Render the controls of one part into `el` (owned by the core). `update(s)` is called on every state change, including
   * the echo of `onChange` and "Clear filters" (which resets to `init(new URLSearchParams(), ctx)`): keep it idempotent.
   */
  mount(
    el: HTMLElement,
    part: 'basic' | 'advanced',
    state: S,
    onChange: (s: S) => void,
    ctx: PluginContext,
  ): { update(s: S): void; destroy(): void }
  /** Pure and cheap; the payload is the published (server-validated) JSON. */
  test(payload: P, state: S): boolean
  /** Number of active (non-default) filters of the `advanced` part, shown as a badge on the core's "Advanced filters" toggle. */
  activeCount(state: S): number
  /** Extra sort options; ties are broken by newest first. */
  sorts?: { key: string; label(lang: Lang): string; compare(a: P, b: P): number }[]
}

export interface SubmissionPlugin<P = unknown> {
  apiVersion: 1
  /** Must equal data-cms-type / the submission type id. */
  type: string
  defaultPayload(): P
  /** Compact view (icons) + its own full-detail <dialog>. Returns a cleanup function. */
  mountSummary(el: HTMLElement, payload: P, ctx: PluginContext): () => void
  /** Full read-only view (the admin portal uses it inline). Returns a cleanup function. */
  mountDetail(el: HTMLElement, payload: P, ctx: PluginContext): () => void
  mountEditor(
    el: HTMLElement,
    init: { value: P; onChange(p: P): void; errors: FieldError[] },
    ctx: PluginContext,
  ): EditorHandle
  /** Optional: extra filters and sorts for the catalog layout. Without it only the core filters are offered. */
  listFilter?: ListFilter<P>
}
