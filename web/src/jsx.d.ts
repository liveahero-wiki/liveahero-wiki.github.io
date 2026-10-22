// Attributes newer than preact's JSX types.
import 'preact'

declare module 'preact' {
  namespace JSX {
    interface HTMLAttributes<RefType extends EventTarget = EventTarget> {
      /** Arrow-key navigation between the focusable children (https://open-ui.org/components/focusgroup.explainer/). */
      focusgroup?: string
    }
  }
}
