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
}
