// "Build & share a team": the plugin's team editor on the page itself (no sign-in, nothing sent to the server). The
// team is kept as a draft in localStorage and, once it validates, turned into a `?team=` link (see share.ts).

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { EditorHandle, PluginContext, SubmissionPlugin } from '../cms-plugin/plugin-api.ts'
import { loadRoster, type Roster } from '../cms-plugin/roster.ts'
import type { TeamPayload } from '../cms-plugin/types.ts'
import { validateTeam } from '../cms-plugin/validate.ts'
import { clearDraft, isBlankTeam, loadDraft, saveDraft } from './draft.ts'
import { shareUrl } from './share.ts'

type TeamPlugin = SubmissionPlugin<TeamPayload>

let pluginPromise: Promise<TeamPlugin> | null = null

/** The editor is the game plugin module (`data-cms-plugin`), imported on first use so that the page does not pay for it. */
function loadPlugin(url: string): Promise<TeamPlugin> {
  if (!pluginPromise) {
    const p = import(/* @vite-ignore */ new URL(url, location.href).href).then((m) => m.default as TeamPlugin)
    pluginPromise = p
    p.catch(() => {
      if (pluginPromise === p) pluginPromise = null
    })
  }
  return pluginPromise
}

function linkOf(team: TeamPayload): string {
  try {
    return shareUrl(location, team)
  } catch {
    return ''
  }
}

export interface BuilderProps {
  ctx: PluginContext
  /** URL of the game plugin module. */
  plugin: string
  open: boolean
  onOpenChange(open: boolean): void
  /** Bumped when the draft was replaced from outside ("Edit a copy"): the editor reloads it. */
  seed: number
}

export function Builder({ ctx, plugin, open, onOpenChange, seed }: BuilderProps) {
  const t = useMemo(() => makeT(ctx.uiLang), [ctx.uiLang])
  const [mod, setMod] = useState<TeamPlugin | 'error' | null>(null)
  const [roster, setRoster] = useState<Roster | null | undefined>(undefined)
  const [team, setTeam] = useState<TeamPayload | null>(null)
  const [resetN, setResetN] = useState(0)
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const handle = useRef<EditorHandle | null>(null)
  const current = useRef<TeamPayload | null>(null)
  const loadedKey = useRef('')
  const linkInput = useRef<HTMLInputElement>(null)

  // Imported the first time the section is opened.
  useEffect(() => {
    if (!open || mod) return
    let dead = false
    loadPlugin(plugin).then(
      (m) => !dead && setMod(m),
      (e) => {
        console.warn('[team-creator] could not load the team editor', e)
        if (!dead) setMod('error')
      },
    )
    loadRoster().then(
      (r) => !dead && setRoster(r),
      (e) => {
        console.warn('[team-creator] roster unavailable', e)
        if (!dead) setRoster(null)
      },
    )
    return () => {
      dead = true
    }
  }, [open, mod, plugin])

  // The editor lives only while the section is open; the team survives in `current` and the draft.
  useEffect(() => {
    if (!open || !host.current || !mod || mod === 'error') return
    const key = `${seed}:${resetN}`
    if (current.current === null || loadedKey.current !== key) {
      current.current = loadDraft() ?? mod.defaultPayload()
      loadedKey.current = key
    }
    setTeam(current.current)
    const h = mod.mountEditor(
      host.current,
      {
        value: current.current,
        onChange: (p) => {
          current.current = p
          setTeam(p)
          saveDraft(p)
        },
        errors: [],
      },
      ctx,
    )
    handle.current = h
    return () => {
      h.destroy()
      handle.current = null
    }
  }, [open, mod, seed, resetN, ctx])

  const errors = team && roster !== undefined ? validateTeam(team, ctx.group.options, roster ?? undefined) : null
  const url = team && errors && errors.length === 0 ? linkOf(team) : ''
  useEffect(() => setCopied(null), [url])

  const copy = async () => {
    if (!url) {
      handle.current?.validate() // show every error, not just the ones the user has already touched
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied('ok')
    } catch {
      const input = linkInput.current
      input?.select()
      try {
        setCopied(input && document.execCommand('copy') ? 'ok' : 'fail')
      } catch {
        setCopied('fail')
      }
    }
  }

  const reset = () => {
    if (!isBlankTeam(current.current) && !confirm(t('tcResetConfirm'))) return
    clearDraft()
    current.current = null
    setResetN((n) => n + 1)
  }

  return (
    <details id="lah-tc-builder" class="lah-tc-builder" open={open} onToggle={(e) => onOpenChange((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>{t('tcBuild')}</summary>
      {open && (
        <div class="lah-tc-builder-body">
          <p class="lah-tc-hint">{t('tcBuildHelp')}</p>
          {mod === null && <p class="lah-tc-hint">{t('tcBuildLoading')}</p>}
          {mod === 'error' && (
            <p class="lah-tc-error" role="alert">
              {t('tcBuildError')}
            </p>
          )}
          <div ref={host} />
          {mod && mod !== 'error' && (
            <div class="lah-tc-share">
              <label class="lah-tc-share-label" for="lah-tc-share-link">
                {t('tcShareLink')}
              </label>
              <div class="lah-tc-share-row">
                <input id="lah-tc-share-link" ref={linkInput} class="lah-tc-input lah-tc-share-input" type="text" readOnly value={url} placeholder={t('tcShareIncomplete')} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" class="lah-tc-btn lah-tc-primary" aria-disabled={!url} onClick={() => void copy()}>
                  {t('tcShareCopy')}
                </button>
                <button type="button" class="lah-tc-btn" onClick={reset}>
                  {t('tcBuildReset')}
                </button>
              </div>
              <p class="lah-tc-hint" role="status">
                {copied === 'ok' ? t('tcShareCopied') : copied === 'fail' ? t('tcShareCopyFailed') : url ? '' : t('tcShareIncomplete')}
              </p>
            </div>
          )}
        </div>
      )}
    </details>
  )
}
