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
import { statusIcon } from '../lib/urls'

function processStatusHtml(html, statusDescs) {
  if (!html || !statusDescs?.length) return html
  const map = Object.fromEntries(statusDescs.map(s => [s.name, s]))
  return html.replace(/<wiki-status>(.*?)<\/wiki-status>/g, (_, name) => {
    const n = name.trim()
    const st = map[n]
    const img = st?.icon ? `<img class="status-s" src="${statusIcon(st.icon)}">` : ''
    return `<span class="status" data-status-name="${n}">${img} ${n}</span>`
  })
}

export const SkillDescription = memo(function SkillDescription({ html, changeSkills, statusDescs }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !statusDescs?.length) return
    const descMap = Object.fromEntries(statusDescs.map(s => [s.name, s.desc]))
    const instances = []
    el.querySelectorAll('[data-status-name]').forEach(node => {
      const desc = descMap[node.dataset.statusName]
      if (!desc) return
      instances.push(window.tippy(node, { content: desc, allowHTML: true, interactive: true }))
    })
    return () => instances.forEach(i => i?.destroy())
  }, [html, statusDescs])

  if (!html && !(changeSkills && changeSkills.length)) return null
  return (
    <span ref={ref}>
      {html && <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(html, statusDescs) }} />}
      {changeSkills && changeSkills.map((cs, i) => (
        <details key={i} class="change-skill">
          <summary>{cs.name}</summary>
          <span class="skill-desc" dangerouslySetInnerHTML={{ __html: processStatusHtml(cs.description, statusDescs) }} />
        </details>
      ))}
      {statusDescs?.length > 0 && (
        <>
          <hr class="status-hr" />
          {statusDescs.map((st, i) => [
            i > 0 && ' ',
            <span key={i} class="status" data-status-name={st.name}>
              {st.icon && <img class="status-s" src={statusIcon(st.icon)} />}
              {' '}{st.name}
            </span>
          ])}
        </>
      )}
    </span>
  )
})
