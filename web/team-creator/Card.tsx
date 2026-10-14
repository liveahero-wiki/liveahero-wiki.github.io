// One team card of the list. Ported from wiki-cms `embed/src/cards.tsx`; the team summary is the plugin component.

import type { ComponentChildren } from 'preact'
import { useMemo, useState } from 'preact/hooks'
import type { PublicBlob, PublicItem, TagDefDto } from '../cms-plugin/api-types.ts'
import { makeT } from '../cms-plugin/i18n/t.ts'
import type { PluginContext } from '../cms-plugin/plugin-api.ts'
import { TargetChip } from '../cms-plugin/common.tsx'
import { parseTargets } from '../cms-plugin/targets.ts'
import { TeamSummary } from '../cms-plugin/TeamSummary.tsx'
import { toViewTarget } from '../cms-plugin/view.ts'
import { demoPlatform, parseHttps } from './api.ts'
import { pickText, type Lang } from './lang.ts'

export function Chip({ active, onClick, children }: { active: boolean; onClick(): void; children: ComponentChildren }) {
  return (
    <button type="button" class={`lah-tc-chip lah-tc-chip-btn${active ? ' lah-tc-active' : ''}`} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  )
}

export function Card({ item, blob, uiLang, ctx }: { item: PublicItem; blob: PublicBlob; uiLang: Lang; ctx: PluginContext }) {
  const t = useMemo(() => makeT(uiLang), [uiLang])
  const tagChips = blob.meta.tags.flatMap((def: TagDefDto) => {
    const v = item.tags[def.key]
    const opt = v === undefined ? undefined : def.options.find((o) => o.value === v)
    return opt ? [`${pickText(def.label, uiLang)}: ${pickText(opt.label, uiLang)}`] : []
  })
  const langLabel = blob.meta.langs.find((l) => l.value === item.lang)?.label ?? item.lang
  const date = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(uiLang, { dateStyle: 'medium' }).format(item.createdAt)
    } catch {
      return new Date(item.createdAt).toISOString().slice(0, 10)
    }
  }, [uiLang, item.createdAt])
  const target = toViewTarget(item.payload)
  const demo = parseHttps(item.demoUrl)
  const platform = demo ? demoPlatform(demo.hostname) : null

  return (
    <>
      {blob.meta.title && (
        // User text, rendered as text only.
        <h3 class={`lah-tc-card-title${item.title ? '' : ' lah-tc-untitled'}`} lang={item.title ? item.lang : undefined}>
          {item.title || t('tcUntitled')}
        </h3>
      )}
      <div class="lah-tc-summary">
        <TeamSummary payload={item.payload} ctx={ctx} hideTarget />
      </div>
      <div class="lah-tc-meta">
        {target && (
          // `cms-lah` scopes the plugin's theme variables that the chip's styles read.
          <span class="cms-lah">
            <TargetChip id={target} targets={parseTargets(ctx.group.options)} lang={uiLang} t={t} />
          </span>
        )}
        {tagChips.map((c) => (
          <span key={c} class="lah-tc-chip">
            {c}
          </span>
        ))}
        <span class="lah-tc-chip" lang={item.lang}>
          {langLabel}
        </span>
        <span class="lah-tc-date">{t('tcSubmitted', { date })}</span>
        {demo && (
          <a class="lah-tc-btn lah-tc-demo" href={demo.href} target="_blank" rel="noopener noreferrer nofollow ugc">
            {platform ? t('tcDemo', { platform }) : t('tcDemoGeneric')}
          </a>
        )}
      </div>
      <Explanation html={item.explanationHtml} lang={item.lang} uiLang={uiLang} />
    </>
  )
}

let explSeq = 0

/** Collapsed by default: the HTML is not rendered until the toggle is opened. */
function Explanation({ html, lang, uiLang }: { html: string; lang: Lang; uiLang: Lang }) {
  const t = useMemo(() => makeT(uiLang), [uiLang])
  const [open, setOpen] = useState(false)
  const id = useMemo(() => `lah-tc-x-${++explSeq}`, [])
  return (
    <div class="lah-tc-expl-wrap">
      <button type="button" class="lah-tc-link" aria-expanded={open} aria-controls={id} onClick={() => setOpen((x) => !x)}>
        {open ? t('tcHideExplanation') : t('tcShowExplanation')}
      </button>
      <div id={id} class="lah-tc-expl" lang={lang} hidden={!open}>
        {/* Server-rendered with HTML disabled; only validated https links become <a class="cms-ext"> (wiki-cms src/shared/markdown-policy.ts). */}
        {open && <div dangerouslySetInnerHTML={{ __html: html }} />}
        {open && html.includes('class="cms-ext"') && <p class="lah-tc-ext-note">{t('tcExtLinksNote')}</p>}
      </div>
    </div>
  )
}
