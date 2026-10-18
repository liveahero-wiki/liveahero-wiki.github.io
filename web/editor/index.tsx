// Entry of assets/cms/editor.js (built by vite.editor.config.ts). assets/main.js imports it only when a reader clicks an
// element with `data-contrib` and calls `open(kind, element)`:
//   page-edit      toolbar button, `data-path` (Track B: edit the page body)
//   voice-suggest  button of a voice table, `data-resource-name` (Track A)
//   bio-suggest    link under a bio infobox, `data-bio-key` (Track A)
// The wiki-cms address (`data-cms-api`) comes from the page, see core/config.ts.

import { Component, render, type ComponentChildren } from 'preact'
import { BioView } from './bio/BioView.tsx'
import { readConfig, type EditorConfig } from './core/config.ts'
import { Shell } from './core/Shell.tsx'
import { Modal, Notice } from './core/ui.tsx'
import { makeT } from './i18n/t.ts'
import { PageEditor } from './page/PageEditor.tsx'
import { initialLang, type Lang } from '../team-creator/lang.ts'
import { collectRows, findTable, resourceNames } from './voice/collect.ts'
import { VoiceView } from './voice/VoiceView.tsx'

export type Kind = 'page-edit' | 'voice-suggest' | 'bio-suggest'

const HOST_CLASS = 'contrib-host'

class Boundary extends Component<{ lang: Lang; onClose: () => void; children?: ComponentChildren }, { failed: boolean }> {
  state = { failed: false }
  componentDidCatch(e: unknown) {
    console.error('[editor] crashed', e)
    this.setState({ failed: true })
  }
  render() {
    if (!this.state.failed) return this.props.children
    const t = makeT(this.props.lang)
    return (
      <Modal title={t('pageTitle')} t={t} onRequestClose={this.props.onClose}>
        <Notice kind="error">{t('loadFailed')}</Notice>
      </Modal>
    )
  }
}

function Root({ kind, el, cfg, lang, onClose }: { kind: string; el: HTMLElement; cfg: EditorConfig; lang: Lang; onClose: () => void }) {
  if (!cfg.api) {
    const t = makeT(lang)
    return (
      <Modal title={t('signInTitle')} t={t} onRequestClose={onClose}>
        <Notice kind="error">{t('loadFailed')}</Notice>
      </Modal>
    )
  }
  switch (kind as Kind) {
    case 'voice-suggest': {
      const resourceName = el.dataset.resourceName ?? ''
      const table = findTable(el, resourceName)
      const rows = table ? collectRows(table, resourceNames(resourceName)) : []
      return (
        <Shell api={cfg.api} lang={lang} title={(t) => t('voiceTitle')} wide onClose={onClose}>
          {(ctx) => <VoiceView ctx={ctx} rows={rows} />}
        </Shell>
      )
    }
    case 'bio-suggest': {
      const key = el.dataset.bioKey ?? ''
      return (
        <Shell api={cfg.api} lang={lang} title={(t) => t('bioTitle')} onClose={onClose}>
          {(ctx) => <BioView ctx={ctx} bioKey={key} />}
        </Shell>
      )
    }
    case 'page-edit': {
      const path = el.dataset.path ?? ''
      return (
        <Shell api={cfg.api} lang={lang} title={(t) => t('pageTitle')} wide onClose={onClose}>
          {(ctx) => <PageEditor ctx={ctx} path={path} repo={cfg.repo} />}
        </Shell>
      )
    }
    default:
      return null
  }
}

/** Opens the editor of `kind` for the clicked element. Does nothing when one is already open or the kind is unknown. */
export function open(kind: string, element: Element): void {
  if (document.querySelector(`.${HOST_CLASS}`)) return
  if (kind !== 'page-edit' && kind !== 'voice-suggest' && kind !== 'bio-suggest') return
  const host = document.createElement('div')
  host.className = HOST_CLASS
  document.body.appendChild(host)
  const lang = initialLang()
  const onClose = () => {
    render(null, host)
    host.remove()
  }
  render(
    <Boundary lang={lang} onClose={onClose}>
      <Root kind={kind} el={element as HTMLElement} cfg={readConfig(element, document)} lang={lang} onClose={onClose} />
    </Boundary>,
    host,
  )
}
