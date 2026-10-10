// Full skill-kit modal. The result table shows only the matching, visible skills
// of a character; this dialog is the escape hatch that shows the *entire* kit —
// every active skill plus the hidden passives (hero passives, sidekick
// append-passives) whose effects are otherwise only described inside the active
// skills' <wiki-passive> blocks.

import { useEffect, useRef } from 'preact/hooks'
import type { Entity, Status } from '../types'
import type { Lang } from '../lib/lang'
import { t, slotLabel, elementLabel } from '../lib/uiTranslations'
import { effectiveSkills } from '../lib/filters'
import { statusIcon, portrait } from '../lib/urls'
import { SkillDescription } from './SkillDescription'

// closedby="any" gives Esc + backdrop light-dismiss declaratively, but Safari
// doesn't support it yet — fall back to a manual backdrop-click handler.
const SUPPORTS_CLOSEDBY = 'closedBy' in HTMLDialogElement.prototype

interface SkillKitDialogProps {
  entity: Entity | null
  skillTree: boolean
  statuses: Record<string, Status>
  lang: Lang
  onClose: () => void
}

export function SkillKitDialog({ entity, skillTree, statuses, lang, onClose }: SkillKitDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  // Set closedby="any" imperatively to avoid JSX type issues with this new attribute.
  useEffect(() => {
    ref.current?.setAttribute('closedby', 'any')
  }, [])

  // Open/close the native modal in sync with the selected entity.
  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (entity && !dlg.open) dlg.showModal()
    else if (!entity && dlg.open) dlg.close()
  }, [entity])

  const onBackdropClick = (e: MouseEvent) => {
    if (SUPPORTS_CLOSEDBY) return // native light-dismiss handles it
    const dlg = ref.current
    if (!dlg || e.target !== dlg) return // click landed on inner content
    const r = dlg.getBoundingClientRect()
    const inside =
      r.top <= e.clientY && e.clientY <= r.top + r.height &&
      r.left <= e.clientX && e.clientX <= r.left + r.width
    if (!inside) dlg.close()
  }

  const skills = entity ? effectiveSkills(entity, skillTree) : []

  return (
    <dialog
      ref={ref}
      class="kit-dialog"
      aria-labelledby="kit-dialog-title"
      onClose={onClose}
      onClick={onBackdropClick}
    >
      {entity && (
        <div class="kit-body">
          <header class="kit-head">
            <img
              class="chara-icon"
              src={portrait(entity)}
              alt=""
              loading="lazy"
              onError={(ev) => {
                ev.currentTarget.style.visibility = 'hidden'
              }}
            />
            <h2 id="kit-dialog-title">{entity.name}</h2>
            <span class="kit-kind">
              {entity.kind === 'hero' ? t(lang, 'kind_hero') : t(lang, 'kind_sidekick')}
              {entity.kind === 'hero' && entity.element != null
                ? ` · ${elementLabel(lang, entity.element)}`
                : ''}
            </span>
            <button
              type="button"
              class="kit-close"
              aria-label={t(lang, 'close')}
              onClick={() => ref.current?.close()}
            >
              ×
            </button>
          </header>
          {entity.stats && (
            <dl class="kit-stats">
              <div><dt>HP</dt><dd>{entity.stats.hp.toLocaleString()}</dd></div>
              <div><dt>ATK</dt><dd>{entity.stats.atk.toLocaleString()}</dd></div>
              <div><dt>SPD</dt><dd>{entity.stats.spd.toLocaleString()}</dd></div>
              <div><dt>View</dt><dd>{entity.stats.view.toLocaleString()}</dd></div>
            </dl>
          )}
          <div class="kit-skills">
            {skills.map((s) => (
              <section key={`${s.slot}-${s.skillId}`} class={'kit-skill' + (s.hidden ? ' is-hidden' : '')}>
                <div class="skill-head">
                  <span class="slot-badge">{slotLabel(lang, s.slot)}</span>
                  <span class="skill-name">{s.name}</span>
                  {s.hidden && <span class="hidden-badge" title={t(lang, 'hidden_title')}>{t(lang, 'hidden_badge')}</span>}
                  <span class="skill-view-cost">View {s.useView.toLocaleString()}</span>
                </div>
                <SkillDescription html={s.description} changeSkills={s.changeSkills} statusDescs={s.statusDescs} />
              </section>
            ))}
          </div>
        </div>
      )}
    </dialog>
  )
}
