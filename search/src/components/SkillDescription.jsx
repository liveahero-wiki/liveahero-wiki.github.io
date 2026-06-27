// Renders a raw Japanese skill description from the index.
//
// MVP: the description is trusted HTML produced by our own generator and may
// contain <br> plus custom tags (<wiki-enhance>, <wiki-status>, <wiki-passive>,
// <wiki-auto-action>). We render it directly and style the known tags via CSS
// (see styles.css). The browser treats unknown elements as inline spans.
//
// FUTURE: swap this for LiquidJS rendering of _includes/skill-description.html
// to get fully resolved status references and translated text.

import { memo } from 'preact/compat'

// Memoized on the (referentially-stable) html string from the index, so rows
// that stay in the virtualized window across a filter/sort change don't re-set
// innerHTML — the dominant cost in the click trace.
export const SkillDescription = memo(function SkillDescription({ html, changeSkills }) {
  if (!html && !(changeSkills && changeSkills.length)) return null
  return (
    <>
      {html && <span class="skill-desc" dangerouslySetInnerHTML={{ __html: html }} />}
      {changeSkills && changeSkills.map((cs, i) => (
        <details key={i} class="change-skill">
          <summary>{cs.name}</summary>
          <span class="skill-desc" dangerouslySetInnerHTML={{ __html: cs.description }} />
        </details>
      ))}
    </>
  )
})
