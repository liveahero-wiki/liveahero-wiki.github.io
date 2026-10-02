// Renders a skill description from the index.
//
// The description is trusted HTML produced by our own generator and may contain
// <br> plus custom tags (<wiki-enhance>, <wiki-passive>, <wiki-auto-action>,
// <wiki-status>). The first three are styled by CSS (see styles.css); the
// browser treats unknown elements as inline spans.
//
// statusDescs: [{name, desc, tp?, fl?, icon?}] — the generator wraps every status
// name it finds in the text as <wiki-status i=N>…</wiki-status>, N being the position
// in this list (tools/skill_text.py Annotator). Those become <span class="status">
// chips (with the icon) that get tippy tooltips. A footer lists every status, so
// ones the text never names are still reachable. When tp is present the tooltip is
// prefixed with a localized [Buff/Stackable]-style label (index `statusLabels`).
//
// Change skills carry their own statusDescs, which their own tags index.

import { createContext } from 'preact'
import { memo, useContext, useEffect, useRef } from 'preact/compat'
import type { ChangeSkill, StatusDesc, StatusLabels } from '../types'
import { statusIcon } from '../lib/urls'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Used when an (older) cached index carries no labels for its language.
export const EN_STATUS_LABELS: StatusLabels = {
  b: 'Buff', d: 'Debuff', o: 'Other', f: 'Field', s: 'System',
  stk: 'Stackable', unstk: 'Unstackable', chg: 'Charge', dot: 'Damage over time',
  fld: 'Field', cnt: 'Count',
}

/** Provided by App with the loaded index's `statusLabels`. */
export const StatusLabelsContext = createContext<StatusLabels>(EN_STATUS_LABELS)

/** `Type/Stackable/Charge/…` — mirrors skill_text.status_label in the generator. */
export function statusLabel(labels: StatusLabels, tp: string, fl: number): string {
  const kind = fl & 8 ? labels.o : (labels[tp] ?? tp)
  const mods = [fl & 1 ? labels.stk : labels.unstk]
  if (fl & 2) mods.push(labels.chg)
  if (fl & 4) mods.push(labels.dot)
  if (fl & 8) mods.push(labels.fld)
  if (fl & 16) mods.push(labels.cnt)
  return [kind, ...mods].join('/')
}

function statusTooltipContent(st: StatusDesc, labels: StatusLabels): string {
  if (!st.tp) return st.desc
  return `<b>[${statusLabel(labels, st.tp, st.fl ?? 0)}]</b><br>${st.desc}`
}

const STATUS_TAG = /<wiki-status i=(\d+)>(.*?)<\/wiki-status>/g

function statusChip(st: StatusDesc | undefined, index: number, shown: string): string {
  const img = st?.icon ? `<img class="status-s" src="${escHtml(statusIcon(st.icon))}">` : ''
  return `<span class="status" data-status-index="${index}">${img} ${shown}</span>`
}

export function processStatusHtml(html: string, statusDescs: StatusDesc[] | undefined): string {
  if (!html) return html
  // `shown` is a slice of the (trusted) description itself, so it is kept as written.
  return html.replace(STATUS_TAG, (_, i: string, shown: string) => statusChip(statusDescs?.[Number(i)], Number(i), shown))
}

interface SkillDescriptionProps {
  html: string
  changeSkills?: ChangeSkill[]
  statusDescs?: StatusDesc[]
}

export const SkillDescription = memo(function SkillDescription({
  html,
  changeSkills,
  statusDescs,
}: SkillDescriptionProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const labels = useContext(StatusLabelsContext)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const instances: TippyInstance[] = []
    el.querySelectorAll<HTMLElement>('[data-status-index]').forEach((node) => {
      // a chip inside a change skill indexes that change skill's own list
      const owner = node.closest<HTMLElement>('details[data-change-skill]')
      const list = owner ? changeSkills?.[Number(owner.dataset.changeSkill)]?.statusDescs : statusDescs
      const st = list?.[Number(node.dataset.statusIndex)]
      if (!st) return
      instances.push(
        window.tippy(node, {
          content: statusTooltipContent(st, labels),
          allowHTML: true,
          interactive: true,
          // Tippy's default appendTo, when interactive, mounts the popup as a
          // sibling inside the reference's own parent (an a11y focus-order
          // affordance). Our rows are virtualized with `transform` + absolute
          // positioning, which makes that parent row a stacking context — the
          // popup's z-index would then only compete within its own row and
          // get painted over by later sibling rows. Force it to document.body
          // instead — except inside the native <dialog> (SkillKitDialog),
          // whose top-layer promotion means a document.body-appended popup
          // renders *behind* it regardless of z-index; there, append inside
          // the dialog so the popup shares its top layer.
          appendTo: () => node.closest('dialog') ?? document.body,
        }),
      )
    })
    return () => instances.forEach((i) => i?.destroy())
  }, [html, statusDescs, changeSkills, labels])

  if (!html && !(changeSkills && changeSkills.length)) return null
  return (
    <span ref={ref}>
      {html && <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(html, statusDescs) }} />}
      {statusDescs?.length ? (
        <>
          <hr class="status-hr" />
          {statusDescs.map((st, i) => [
            i > 0 && ' ',
            <span key={i} class="status" data-status-index={i}>
              {st.icon && <img class="status-s" src={statusIcon(st.icon)} />}
              {' '}{st.name}
            </span>,
          ])}
        </>
      ) : null}
      {changeSkills && changeSkills.map((cs, i) => (
        <details key={i} class="change-skill" data-change-skill={i}>
          <summary>{cs.name}</summary>
          <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(cs.description, cs.statusDescs) }} />
        </details>
      ))}
    </span>
  )
})
