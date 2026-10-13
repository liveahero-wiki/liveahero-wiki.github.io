// Compact team row: hero icons in team order (+ sidekick pips), the support slot tinted and labelled,
// small badges; the whole row is one button that opens the full-detail dialog.

import { useRef, useState } from 'preact/hooks'
import type { PluginContext } from './plugin-api.ts'
import { CardIcon, Dialog, TargetChip, cardLabel, useRoster } from './common.tsx'
import { makeT } from './i18n/t.ts'
import { TeamDetail } from './TeamDetail.tsx'
import { parseTargets } from './targets.ts'
import { parseFocus } from './validate.ts'
import { isFocusCard, toViewSlots, toViewTarget } from './view.ts'

interface Props {
  payload: unknown
  ctx: PluginContext
}

export function TeamSummary({ payload, ctx }: Props) {
  const t = makeT(ctx.uiLang)
  const lang = ctx.uiLang
  const roster = useRoster()
  const focus = parseFocus(ctx.group.options)
  const { slots, supportIndex } = toViewSlots(payload)
  const target = toViewTarget(payload)
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)

  const names = slots
    .map((s, i) => cardLabel(roster, 'hero', s.stockId, lang) + (i === supportIndex ? ` (${t('support')})` : ''))
    .join(', ')

  return (
    <div class="cms-lah cms-lah-summary-root">
      {target && <TargetChip id={target} targets={parseTargets(ctx.group.options)} lang={lang} t={t} />}
      <button
        ref={btn}
        type="button"
        class="cms-lah-summary"
        aria-haspopup="dialog"
        aria-label={t('summaryAria', { names })}
        onClick={() => setOpen(true)}
      >
        {slots.map((s, i) => {
          const support = i === supportIndex
          return (
            <span key={i} class={'cms-lah-chip' + (support ? ' cms-lah-support' : '')}>
              <span class="cms-lah-hero">
                <CardIcon kind="hero" stockId={s.stockId} roster={roster} lang={lang} size="lg" named focus={isFocusCard(focus, 'hero', s.stockId)} />
                {s.active ? (
                  <span class="cms-lah-active-sk">
                    <CardIcon kind="sidekick" stockId={s.active} roster={roster} lang={lang} size="sm" focus={isFocusCard(focus, 'sidekick', s.active)} />
                  </span>
                ) : null}
              </span>
              {s.passives.length > 0 && (
                <span class="cms-lah-pips">
                  {s.passives.map((p) => (
                    <CardIcon key={p} kind="sidekick" stockId={p} roster={roster} lang={lang} size="sm" focus={isFocusCard(focus, 'sidekick', p)} />
                  ))}
                </span>
              )}
              <span class="cms-lah-badges">
                {support && <span class="cms-lah-tag">{t('support')}</span>}
                {s.lv < 60 && <span class="cms-lah-badge">{t('lvBadge', { lv: s.lv })}</span>}
                {s.bloom && <span class="cms-lah-badge">{t('badgeBloom')}</span>}
                {s.skillTree && <span class="cms-lah-badge">{t('badgeSkillTree')}</span>}
              </span>
            </span>
          )
        })}
      </button>
      {open && (
        <Dialog title={t('detailTitle')} t={t} onClose={() => setOpen(false)}>
          <TeamDetail payload={payload} ctx={ctx} />
        </Dialog>
      )}
    </div>
  )
}
