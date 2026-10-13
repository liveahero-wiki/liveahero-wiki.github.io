// Entry of assets/cms/team-creator.js: draws the Team Creator page into #team-creator (see team-creator.md).
// Built by vite.team-creator.config.ts into one ES module.

import { render } from 'preact'
import { ensureStyles } from '../cms-plugin/style.ts'
import { App, Boundary } from './App.tsx'
import css from './styles.css?inline'

const STYLE_ID = 'lah-team-creator'

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

function start() {
  const el = document.getElementById('team-creator')
  if (!el) return
  const d = el.dataset
  const api = (d.cmsApi || location.origin).replace(/\/+$/, '')
  const group = d.cmsGroup || 'all'
  const plugin = d.cmsPlugin || '/assets/cms/lah-team-formation.js'

  injectStyle()
  ensureStyles() // TeamSummary and FilterPanel are styled by the plugin stylesheet
  el.classList.add('team-creator')
  // The list root and the (empty) host of the submit dialog are siblings: the form never renders into the list's tree.
  const root = document.createElement('div')
  const formHost = document.createElement('div')
  el.replaceChildren(root, formHost)
  render(
    <Boundary>
      <App api={api} group={group} plugin={plugin} formHost={formHost} />
    </Boundary>,
    root,
  )
}

try {
  start()
} catch (e) {
  console.error('[team-creator] failed to start', e)
}
