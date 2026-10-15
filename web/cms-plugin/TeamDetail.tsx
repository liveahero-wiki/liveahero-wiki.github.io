// Full read-only view of a team (inline in the admin portal; inside <Dialog> from the summary).

import type { ComponentChildren } from 'preact'
import type { PluginContext } from './plugin-api.ts'
import type { TeamSlot } from './types.ts'
import { CardIcon, CardName, PwFormIcon, TargetChip, useRoster, type IconKind } from './common.tsx'
import { makeT, pwFormLabel, type T } from './i18n/t.ts'
import { passiveKind } from './roster.ts'
import { parseTargets } from './targets.ts'
import { parseFocus } from './validate.ts'
import { isFocusCard, toViewSlots, toViewTarget } from './view.ts'

interface Props {
  payload: unknown
  ctx: PluginContext
}

export function TeamDetail({ payload, ctx }: Props) {
  const t = makeT(ctx.uiLang)
  const roster = useRoster()
  const focus = parseFocus(ctx.group.options)
  const { slots, supportIndex } = toViewSlots(payload)
  const target = toViewTarget(payload)

  return (
    <div class="cms-lah cms-lah-detail">
      {target && <TargetChip id={target} targets={parseTargets(ctx.group.options)} lang={ctx.uiLang} t={t} />}
      <ol class="cms-lah-cards" aria-label={t('detailHint')}>
        {slots.map((s, i) => (
          <SlotCard key={i} slot={s} index={i} support={i === supportIndex} t={t} ctx={ctx} roster={roster} focus={focus} />
        ))}
      </ol>
    </div>
  )
}

interface CardProps {
  slot: TeamSlot
  index: number
  support: boolean
  t: T
  ctx: PluginContext
  roster: ReturnType<typeof useRoster>
  focus: ReturnType<typeof parseFocus>
}

function SlotCard({ slot, index, support, t, ctx, roster, focus }: CardProps) {
  const lang = ctx.uiLang
  const stat = (label: string, value: ComponentChildren, warn = false) => (
    <div class={'cms-lah-stat' + (warn ? ' cms-lah-stat-on' : '')}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
  const sidekickRow = (id: number, kind: IconKind = 'sidekick') => (
    <li class="cms-lah-sk" key={id}>
      <CardIcon kind={kind} stockId={id} roster={roster} lang={lang} size="md" focus={kind === 'sidekick' && isFocusCard(focus, 'sidekick', id)} />
      <CardName kind={kind} stockId={id} roster={roster} lang={lang} class="cms-lah-sk-name" />
    </li>
  )

  return (
    <li class={'cms-lah-card' + (support ? ' cms-lah-support' : '')}>
      <div class="cms-lah-card-head">
        <span class="cms-lah-slot-no">{t('slotN', { n: index + 1 })}</span>
        {support && (
          <span class="cms-lah-tag" title={t('supportTitle')}>
            {t('support')}
          </span>
        )}
      </div>
      <div class="cms-lah-hero">
        <CardIcon kind="hero" stockId={slot.stockId} roster={roster} lang={lang} size="lg" focus={isFocusCard(focus, 'hero', slot.stockId)} />
        {slot.stockId ? (
          <CardName kind="hero" stockId={slot.stockId} roster={roster} lang={lang} class="cms-lah-hero-name" />
        ) : (
          <span class="cms-lah-hero-name">{t('none')}</span>
        )}
      </div>
      <dl class="cms-lah-stats">
        {stat(t('lv'), String(slot.lv))}
        {stat(
          t('plv'),
          slot.pwForm !== undefined ? (
            <span class="cms-lah-pwform-value">
              {slot.plv} <PwFormIcon itemId={slot.pwForm} size="sm" title={pwFormLabel(t, slot.pwForm)} />
            </span>
          ) : (
            String(slot.plv)
          ),
        )}
        {stat(t('fans'), String(slot.fans))}
        {stat(t('engrave'), String(slot.engrave))}
        {stat(t('bloom'), slot.bloom ? t('yes') : t('no'), slot.bloom)}
        {stat(t('skillTree'), slot.skillTree ? t('skillTreeNeeded') : t('no'), slot.skillTree)}
      </dl>
      <div class="cms-lah-sks">
        <h3 class="cms-lah-sub">{t('activeSidekick')}</h3>
        {slot.active ? <ul class="cms-lah-sk-list">{sidekickRow(slot.active)}</ul> : <p class="cms-lah-muted">{t('none')}</p>}
        <h3 class="cms-lah-sub">{t('passiveSidekicks')}</h3>
        {slot.passives.length ? <ul class="cms-lah-sk-list">{slot.passives.map((id) => sidekickRow(id, passiveKind(roster, id)))}</ul> : <p class="cms-lah-muted">{t('none')}</p>}
      </div>
    </li>
  )
}
