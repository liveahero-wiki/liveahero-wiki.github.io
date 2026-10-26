// The Team Creator page: disclaimer, the team builder (share a link, or submit to the list) and the list. The blob comes
// from the wiki-cms Worker; the submit form is wiki-cms' (opened through `window.cmsEmbed.openForm`, with the built team).

import { Component, type ComponentChildren } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { ContribSubmission, PublicBlob } from '../cms-plugin/api-types.ts'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import type { TeamPayload } from '../cms-plugin/types.ts'
import { getContrib, prefetchEmbed } from '../shared/contrib/embed.ts'
import { onLangChange, pageLang, type Lang } from '../shared/lang.ts'
import { useAccount } from './account.ts'
import { currentTheme, editStart, fetchBlob, openCmsForm } from './api.ts'
import { Builder } from './Builder.tsx'
import { Catalog } from './Catalog.tsx'
import { isBlankTeam, loadDraft, saveDraft } from './draft.ts'
import { MySubmissions } from './MySubmissions.tsx'
import { SharedTeam } from './SharedTeam.tsx'
import { sharedParam } from './share.ts'

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
  const [lang, setLang] = useState(pageLang)
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
  const account = useAccount(api, t, uiLang)
  const [showMine, setShowMine] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState(false)
  const sharedTeam = useMemo(() => sharedParam(location.search), [])
  const [builderOpen, setBuilderOpen] = useState(false)
  const [builderSeed, setBuilderSeed] = useState(0)
  const mineById = useMemo(() => new Map((account.mine ?? []).map((m) => [m.id, m])), [account.mine])

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

  /** The wiki-cms form: for a team built on the page (`payload`), or to edit one of the contributor's own submissions. */
  const openForm = async (edit?: ContribSubmission, payload?: TeamPayload) => {
    if (!blob || opening) return
    setOpening(true)
    setFormError(false)
    try {
      // Reload "my submissions" once the dialog is gone (a new team, an edit or a sign-in may have happened in it).
      await openCmsForm({ api, group, plugin, groupOptions: blob.groupOptions, host: formHost, lang: uiLang, ...(edit ? { edit: editStart(edit) } : {}), ...(payload ? { payload } : {}), onClose: () => void account.refresh() })
    } catch (e) {
      console.warn('[team-creator] could not open the form', e)
      setFormError(true)
    } finally {
      setOpening(false)
    }
  }

  const withdraw = async (sub: ContribSubmission) => {
    setBusyId(sub.id)
    setActionError(false)
    try {
      await (await getContrib(api)).withdrawRevision(sub.id, api)
      await account.refresh()
    } catch (e) {
      console.warn('[team-creator] could not withdraw the edit', e)
      setActionError(true)
    } finally {
      setBusyId(null)
    }
  }

  const showBuilder = () => {
    setBuilderOpen(true)
    setTimeout(() => document.getElementById('lah-tc-builder')?.scrollIntoView({ block: 'start' }), 0)
  }

  // The builder's submit step needs the embed.
  useEffect(() => {
    if (builderOpen && !account.user) prefetchEmbed(api)
  }, [builderOpen, api, account.user])

  /** "Edit a copy" of a shared team: it replaces the draft (after asking when there is something in it) and opens the builder. */
  const editCopy = (team: TeamPayload) => {
    if (!isBlankTeam(loadDraft()) && !confirm(t('tcEditCopyConfirm'))) return
    saveDraft(team)
    setBuilderSeed((n) => n + 1)
    showBuilder()
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
    body = <Catalog blob={state.blob} uiLang={uiLang} ctx={ctx} mine={mineById} onEdit={(sub) => void openForm(sub)} />
  }

  return (
    <div class="lah-tc-app">
      {sharedTeam !== null && (blob ? <SharedTeam param={sharedTeam} ctx={ctx} onEditCopy={editCopy} /> : state.s === 'loading' && <p class="lah-tc-hint">{t('tcSharedChecking')}</p>)}
      <p class="lah-tc-disclaimer">{t('tcDisclaimer')}</p>
      <div class="lah-tc-toolbar" onPointerEnter={() => !account.user && prefetchEmbed(api)} onFocusIn={() => !account.user && prefetchEmbed(api)} onTouchStart={() => !account.user && prefetchEmbed(api)}>
        <button type="button" class="lah-tc-btn lah-tc-primary" disabled={!blob} onClick={showBuilder}>
          {t('tcBuildTeam')}
        </button>
        {account.user ? (
          <span class="lah-tc-account">
            <span>{t('signedInAs', { name: account.user.displayName })}</span>
            <button type="button" class="lah-tc-link" aria-expanded={showMine} onClick={() => setShowMine((x) => !x)}>
              {showMine ? t('tcMyHide') : t('tcMySubmissions', { count: account.mine?.length ?? 0 })}
            </button>
            <button type="button" class="lah-tc-link" onClick={() => void account.signOut()}>
              {t('signOut')}
            </button>
          </span>
        ) : (
          <button type="button" class="lah-tc-link" onClick={() => void account.signIn()}>
            {t('signIn')}
          </button>
        )}
        {(formError || actionError) && (
          <span class="lah-tc-error" role="alert">
            {formError ? t('tcFormError') : t('tcActionFailed')}
          </span>
        )}
        {account.signInError && (
          <span class="lah-tc-error" role="alert">
            {account.signInError}
          </span>
        )}
      </div>
      {blob && <Builder ctx={ctx} plugin={plugin} open={builderOpen} onOpenChange={setBuilderOpen} seed={builderSeed} submitting={opening} onSubmit={(team) => void openForm(undefined, team)} />}
      {account.user && showMine && (
        <section class="lah-tc-mine" aria-label={t('tcMySubmissions', { count: account.mine?.length ?? 0 })}>
          {account.mineError && <p class="lah-tc-error">{t('tcMyLoadError')}</p>}
          {account.mine && <MySubmissions items={account.mine} uiLang={uiLang} ctx={ctx} busyId={busyId} onEdit={(sub) => void openForm(sub)} onWithdraw={(sub) => void withdraw(sub)} />}
        </section>
      )}
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
    const t = makeT(pageLang())
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
