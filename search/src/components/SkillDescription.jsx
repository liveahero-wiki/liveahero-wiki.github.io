// Renders a raw Japanese skill description from the index.
//
// MVP: the description is trusted HTML produced by our own generator and may
// contain <br> plus custom tags (<wiki-enhance>, <wiki-status>, <wiki-passive>,
// <wiki-auto-action>). We render it directly and style the known tags via CSS
// (see styles.css). The browser treats unknown elements as inline spans.
//
// statusDescs: [{name, desc}] — when provided, wiki-status elements in the
// rendered HTML get tippy tooltips whose content is the matching desc.

import { memo, useEffect, useRef } from 'preact/compat'

export const SkillDescription = memo(function SkillDescription({ html, changeSkills, statusDescs }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !statusDescs?.length) return
    const descMap = Object.fromEntries(statusDescs.map(s => [s.name, s.desc]))
    const instances = []
    el.querySelectorAll('wiki-status').forEach(node => {
      const desc = descMap[node.textContent.trim()]
      if (!desc) return
      instances.push(window.tippy(node, { content: desc, allowHTML: true, interactive: true }))
    })
    return () => instances.forEach(i => i?.destroy())
  }, [html, statusDescs])

  if (!html && !(changeSkills && changeSkills.length)) return null
  return (
    <span ref={ref}>
      {html && <span class="skill-desc" dangerouslySetInnerHTML={{ __html: html }} />}
      {changeSkills && changeSkills.map((cs, i) => (
        <details key={i} class="change-skill">
          <summary>{cs.name}</summary>
          <span class="skill-desc" dangerouslySetInnerHTML={{ __html: cs.description }} />
        </details>
      ))}
    </span>
  )
})
