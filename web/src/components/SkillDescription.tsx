// Renders a raw Japanese skill description from the index.
//
// MVP: the description is trusted HTML produced by our own generator and may
// contain <br> plus custom tags (<wiki-enhance>, <wiki-status>, <wiki-passive>,
// <wiki-auto-action>). We render it directly and style the known tags via CSS
// (see styles.css). The browser treats unknown elements as inline spans.
//
// statusDescs: [{name, desc, icon?}] — when provided, <wiki-status> elements in
// the rendered HTML are replaced with <span class="status"> (with optional icon)
// and get tippy tooltips. A status footer is always shown at the bottom.

import { memo, useEffect, useRef } from 'preact/compat'
import type { ChangeSkill, StatusDesc } from '../types'
import { statusIcon } from '../lib/urls'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function processStatusHtml(html: string, statusDescs: StatusDesc[] | undefined): string {
  if (!html || !statusDescs?.length) return html
  const map = Object.fromEntries(statusDescs.map((s) => [s.name, s]))
  return html.replace(/<wiki-status>(.*?)<\/wiki-status>/g, (_, name: string) => {
    const n = name.trim()
    const st = map[n] as StatusDesc | undefined
    const img = st?.icon ? `<img class="status-s" src="${escHtml(statusIcon(st.icon))}">` : ''
    return `<span class="status" data-status-name="${escHtml(n)}">${img} ${escHtml(n)}</span>`
  })
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

  useEffect(() => {
    const el = ref.current
    if (!el || !statusDescs?.length) return
    const descMap = Object.fromEntries(statusDescs.map((s) => [s.name, s.desc]))
    const instances: TippyInstance[] = []
    el.querySelectorAll('[data-status-name]').forEach((node) => {
      const desc = descMap[(node as HTMLElement).dataset.statusName ?? '']
      if (!desc) return
      instances.push(window.tippy(node, { content: desc, allowHTML: true, interactive: true }))
    })
    return () => instances.forEach((i) => i?.destroy())
  }, [html, statusDescs])

  if (!html && !(changeSkills && changeSkills.length)) return null
  return (
    <span ref={ref}>
      {html && <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(html, statusDescs) }} />}
      {statusDescs?.length ? (
        <>
          <hr class="status-hr" />
          {statusDescs.map((st, i) => [
            i > 0 && ' ',
            <span key={i} class="status" data-status-name={st.name}>
              {st.icon && <img class="status-s" src={statusIcon(st.icon)} />}
              {' '}{st.name}
            </span>,
          ])}
        </>
      ) : null}
      {changeSkills && changeSkills.map((cs, i) => (
        <details key={i} class="change-skill">
          <summary>{cs.name}</summary>
          <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(cs.description, statusDescs) }} />
        </details>
      ))}
    </span>
  )
})
