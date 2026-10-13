// Injects the plugin stylesheet once (the same module may be loaded by several embeds on a page).
import css from './styles.css?inline'

const STYLE_ID = 'cms-plugin-lah-team-formation'

export function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}
