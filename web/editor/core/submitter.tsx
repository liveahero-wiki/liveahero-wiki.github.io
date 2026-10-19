// Submitting with a bearer token and a Turnstile check. `useSubmitter` owns the widget (loaded lazily when an editor opens,
// site key from `GET {api}/api/v1/types/{type}`, action `submit`, reset after every attempt) and the POST.

import type { VNode } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { getContrib } from '../../team-creator/api.ts'
import type { Lang } from '../../team-creator/lang.ts'
import type { TlLang } from './langs.ts'
import { SubmitError, postSubmission, trimApi, type SubmissionType } from './submit.ts'

interface TurnstileApi {
  render(el: HTMLElement, o: Record<string, unknown>): string
  reset(id?: string): void
  remove(id?: string): void
}
const TS_LANG: Record<Lang, string> = { en: 'en', 'zh-Hans': 'zh-cn', 'zh-Hant': 'zh-tw', ja: 'ja' }
const turnstileApi = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile
let turnstileLoad: Promise<TurnstileApi> | undefined

function loadTurnstile(): Promise<TurnstileApi> {
  turnstileLoad ??= new Promise<TurnstileApi>((resolve, reject) => {
    const ready = turnstileApi()
    if (ready) return resolve(ready)
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => (turnstileApi() ? resolve(turnstileApi()!) : reject(new Error('turnstile missing')))
    s.onerror = () => reject(new Error('turnstile failed to load'))
    document.head.appendChild(s)
  })
  turnstileLoad.catch(() => (turnstileLoad = undefined))
  return turnstileLoad
}

const siteKeys = new Map<string, Promise<string>>()
function siteKeyOf(api: string, type: SubmissionType): Promise<string> {
  const id = `${api}|${type}`
  let p = siteKeys.get(id)
  if (!p) {
    p = fetch(`${trimApi(api)}/api/v1/types/${encodeURIComponent(type)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ turnstileSiteKey?: string }>) : Promise.reject(new Error(`types: HTTP ${r.status}`))))
      .then((c) => c.turnstileSiteKey || Promise.reject(new Error('no turnstileSiteKey')))
    siteKeys.set(id, p)
    p.catch(() => siteKeys.delete(id))
  }
  return p
}

const theme = (): 'light' | 'dark' => {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark' || attr === 'light') return attr
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export interface Submitter {
  /** Put this where the verification widget should appear. */
  widget: VNode
  /** Sends one submission in `lang` (English when omitted). Rejects with a SubmitError (code `verify_missing` / `verify_load` before anything is sent). */
  send(payload: unknown, lang?: TlLang): Promise<{ id: string }>
}

export function useSubmitter(api: string, type: SubmissionType, lang: Lang): Submitter {
  // the widget's element mounts and unmounts with the editor's own states (loading, done): follow it with a callback ref
  const [box, setBox] = useState<HTMLDivElement | null>(null)
  const widgetId = useRef<string | undefined>(undefined)
  const token = useRef('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let dead = false
    Promise.all([siteKeyOf(api, type), loadTurnstile()]).then(
      ([sitekey, ts]) => {
        if (dead || !box) return
        widgetId.current = ts.render(box, {
          sitekey,
          action: 'submit',
          theme: theme(),
          language: TS_LANG[lang],
          callback: (tok: string) => (token.current = tok),
          'expired-callback': () => (token.current = ''),
          'error-callback': () => (token.current = ''),
        })
      },
      () => !dead && setLoadError(true),
    )
    return () => {
      dead = true
      try {
        if (widgetId.current) turnstileApi()?.remove(widgetId.current)
        widgetId.current = undefined
        token.current = ''
      } catch {
        /* ignore */
      }
    }
  }, [api, type, lang, box])

  const reset = () => {
    token.current = ''
    try {
      turnstileApi()?.reset(widgetId.current)
    } catch {
      /* ignore */
    }
  }

  const send = useCallback(
    async (payload: unknown, tlLang?: TlLang) => {
      const session = (await getContrib(api)).session(api)
      if (!session) throw new SubmitError(401, 'unauthenticated')
      // after a reset the widget solves again by itself (several submissions in a row): give it a moment
      for (let waited = 0; !token.current && !loadError && waited < 8000; waited += 100) await new Promise((r) => setTimeout(r, 100))
      if (!token.current) throw new SubmitError(0, loadError ? 'verify_load' : 'verify_missing')
      try {
        return await postSubmission({ api, type, payload, lang: tlLang, token: session.token, turnstileToken: token.current })
      } finally {
        reset() // tokens are single-use
      }
    },
    [api, type, loadError],
  )

  return { widget: <div class="contrib-turnstile" ref={setBox} />, send }
}
