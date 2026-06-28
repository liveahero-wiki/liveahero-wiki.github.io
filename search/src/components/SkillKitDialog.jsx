// Full skill-kit modal. The result table shows only the matching, visible skills
// of a character; this dialog is the escape hatch that shows the *entire* kit —
// every active skill plus the hidden passives (hero passives, sidekick
// append-passives) whose effects are otherwise only described inside the active
// skills' <wiki-passive> blocks.

import { useEffect, useRef } from 'preact/hooks'
import { effectiveSkills } from '../lib/filters.js'
import { statusIcon, portrait } from '../lib/urls.js'
import { SkillDescription } from './SkillDescription.jsx'
import { dedupByName } from './ResultTable.jsx'

const SLOT_LABEL = {
  active1: 'Active 1',
  active2: 'Active 2',
  active3: 'Active 3',
  passive: 'Passive',
  sidekick_active: 'SK Active',
  sidekick_passive: 'SK Passive',
  sidekick_append: 'SK Append',
}

// closedby="any" gives Esc + backdrop light-dismiss declaratively, but Safari
// doesn't support it yet — fall back to a manual backdrop-click handler.
const SUPPORTS_CLOSEDBY = 'closedBy' in HTMLDialogElement.prototype

export function SkillKitDialog({ entity, skillTree, statuses, onClose }) {
  const ref = useRef(null)

  // Open/close the native modal in sync with the selected entity.
  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (entity && !dlg.open) dlg.showModal()
    else if (!entity && dlg.open) dlg.close()
  }, [entity])

  const onBackdropClick = (e) => {
    if (SUPPORTS_CLOSEDBY) return // native light-dismiss handles it
    const dlg = ref.current
    if (e.target !== dlg) return // click landed on inner content
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
      closedby="any"
      aria-labelledby="kit-dialog-title"
      onClose={onClose}
      onClick={onBackdropClick}
    >
      {entity && (
        <div class="kit-body">
          <header class="kit-head">
            <img class="chara-icon" src={portrait(entity)} alt="" loading="lazy"
              onError={(ev) => { ev.target.style.visibility = 'hidden' }} />
            <h2 id="kit-dialog-title">{entity.name}</h2>
            <span class="kit-kind">{entity.kind === 'hero' ? 'Hero' : 'Sidekick'}</span>
            <button
              type="button"
              class="kit-close"
              aria-label="Close"
              onClick={() => ref.current?.close()}
            >
              ×
            </button>
          </header>
          <div class="kit-skills">
            {skills.map((s) => (
              <section key={`${s.slot}-${s.skillId}`} class={'kit-skill' + (s.hidden ? ' is-hidden' : '')}>
                <div class="skill-head">
                  <span class="slot-badge">{SLOT_LABEL[s.slot] ?? s.slot}</span>
                  <span class="skill-name">{s.name}</span>
                  {s.hidden && <span class="hidden-badge" title="Not shown in-game">hidden</span>}
                  {dedupByName(s.statusIds, statuses).map((id) => {
                    const st = statuses[id]
                    return st ? (
                      <img key={id} class="inline-status" src={statusIcon(st.icon)}
                        title={st.name} alt={st.name} loading="lazy" />
                    ) : null
                  })}
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
