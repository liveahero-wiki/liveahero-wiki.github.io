// window.tippy is loaded via <script src="/assets/tippy.js"> in index.html
interface TippyInstance {
  destroy(): void
}

interface Window {
  tippy(target: Element | string, options?: Record<string, unknown>): TippyInstance
}
