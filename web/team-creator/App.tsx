// The Team Creator page: disclaimer, submit button and the list. The blob comes from the wiki-cms Worker; the
// submit form is wiki-cms' (opened through `window.cmsEmbed.openForm`).

import { Component, type ComponentChildren } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { PublicBlob } from '../cms-plugin/api-types.ts'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import { currentTheme, fetchBlob, openCmsForm } from './api.ts'
import { Catalog } from './Catalog.tsx'
import { initialLang, onLangChange, type Lang } from './lang.ts'

export interface AppProps {
  /** Worker origin, no trailing slash. */
  api: string
  group: string
  /** URL of the game plugin module, handed to the submit form. */
  plugin: string
  /** Dedicated empty element (outside the Preact tree) that the submit dialog is appended to. */
  formHost: HTMLElement
}

type BlobState = { s: 'loading' } | { s: 'error' } | { s: 'ok'; blob: PublicBlob }

function useUiLang(): Lang {
  const [lang, setLang] = useState(initialLang)
  useEffect(() => onLangChange(setLang), [])
  return lang
}

export function App({ api, group, plugin, formHost }: AppProps) {
  const uiLang = useUiLang()
  const t = useMemo(() => makeT(uiLang), [uiLang])
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<BlobState>({ s: 'loading' })
  const [opening, setOpening] = useState(false)
  const [formError, setFormError] = useState(false)

  useEffect(() => {
    let dead = false
    setState({ s: 'loading' })
    fetchBlob(api, group).then(
      (blob) => !dead && setState({ s: 'ok', blob }),
      (e) => {
        console.warn('[team-creator] could not load submissions', e)
        if (!dead) setState({ s: 'error' })
      },
    )
    return () => {
      dead = true
    }
  }, [api, group, attempt])

  const blob = state.s === 'ok' ? state.blob : null
  // Memoized so that the team summaries do not remount on every render.
  const ctx = useMemo<PluginContext>(() => ({ uiLang, theme: currentTheme(), group: { id: group, options: blob?.groupOptions ?? {} } }), [uiLang, blob, group])

  const openForm = async () => {
    if (!blob || opening) return
    setOpening(true)
    setFormError(false)
    try {
      await openCmsForm({ api, group, plugin, groupOptions: blob.groupOptions, host: formHost, lang: uiLang })
    } catch (e) {
      console.warn('[team-creator] could not open the form', e)
      setFormError(true)
    } finally {
      setOpening(false)
    }
  }

  let body: ComponentChildren
  if (state.s === 'error') {
    body = (
      <div class="lah-tc-status" role="alert">
        <p>{t('tcLoadError')}</p>
        <button type="button" class="lah-tc-btn" onClick={() => setAttempt((n) => n + 1)}>
          {t('tcRetry')}
        </button>
      </div>
    )
  } else if (state.s === 'loading') {
    body = (
      <div class="lah-tc-skeleton" aria-hidden="true">
        <span /> <span />
      </div>
    )
  } else {
    body = <Catalog blob={state.blob} uiLang={uiLang} ctx={ctx} />
  }

  return (
    <div class="lah-tc-app">
      <p class="lah-tc-disclaimer">{t('tcDisclaimer')}</p>
      <div class="lah-tc-toolbar">
        <button type="button" class="lah-tc-btn lah-tc-primary" disabled={!blob || opening} onClick={openForm}>
          {opening ? t('tcOpening') : t('tcSubmit')}
        </button>
        {formError && (
          <span class="lah-tc-error" role="alert">
            {t('tcFormError')}
          </span>
        )}
      </div>
      {body}
    </div>
  )
}

/** Last line of defence: a render error never breaks the page. */
export class Boundary extends Component<{ children: ComponentChildren }, { error: boolean }> {
  state = { error: false }
  componentDidCatch(e: unknown) {
    console.error('[team-creator] crashed', e)
    this.setState({ error: true })
  }
  render() {
    if (!this.state.error) return this.props.children
    const t = makeT(initialLang())
    return (
      <div class="lah-tc-status" role="alert">
        <p>{t('tcLoadError')}</p>
        <button type="button" class="lah-tc-btn" onClick={() => this.setState({ error: false })}>
          {t('tcRetry')}
        </button>
      </div>
    )
  }
}
