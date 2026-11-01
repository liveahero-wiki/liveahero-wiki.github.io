// Entry of assets/cms/tier-maker.js: draws the Tier Maker page into #tier-maker (see tier_maker.md).
// Built by vite.config.ts into one ES module.

import { render } from 'preact'
import { App, Boundary } from './App.tsx'
import css from './styles.css?inline'

const STYLE_ID = 'lah-tier-maker'

function start() {
  const el = document.getElementById('tier-maker')
  if (!el) return
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = css
    document.head.appendChild(style)
  }
  const root = document.createElement('div')
  el.replaceChildren(root)
  render(
    <Boundary>
      <App />
    </Boundary>,
    root,
  )
}

try {
  start()
} catch (e) {
  console.error('[tier-maker] failed to start', e)
}
