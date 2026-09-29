---
layout: default
title: Skill Search
wide_content: true
additional_styles: ["/assets/skill-search.css"]
---

<details>
<summary>More Info</summary>

<div style="padding: 10px" markdown="1">

The skill effect implementation of this game is extremely complex and messy.
We are still improving the labeling, but there are some known issues and limitations that are not very possible to solve.

#### Known issues / limitations

##### False-positive search hit

Heroes that have counter-based mechanism, skill-change, extra activation and extra action often have many hidden passive skills.
The game data does not tell us which Hero active skill actually describe each of the passive skill's skill effects.

Due to this, when you search for an effect that matches a Hero's passive skill, the search result might hit more than one active skills of that Hero.

Examples:

1. In {% chara_link Marfik|h1 %}'s max skill tree form, his S3 has an extra activation of S2, and his S2 grants {{ 5 | status_description }} and {{ 275 | status_description }}.
  So when you search for "Provoke" or "Barrier", the search UI will show both his S2 and S3.
1. When filtering with "Scaling damage (Combo)", all 3 Hero skills of {% chara_link Rastaban|h1 %} will be
  shown, even though only Skill 3 grants "Battle Cry" that scale damage by Combo.

##### Conditional "Increase Damage" are not grouped in "Scaling Damage"

Currently the search index does not consider skill timing and trigger condition, and likely never will, otherwise the UI will be insane.
Due to this, some conditional skill effects are still grouped with those that are non-conditional.

For example, {% chara_link Galvo|h1 %}'s S1 has a passive skill effect of "When HP recovers to 50% or more after being in a pinch, Galvo's gains +10% ATK permanently (Up to a maximum of 50%)".
This skill is still grouped in "Increase Damage" instead of "Scaling Damage".

##### "Skill Change" label hits skills that do not visibly change skill based on its skill description

Blame LW for reusing `ChangeActiveSkill` skill effect for many mechanisms. I keep the label there for my debugging purpose.

We welcome bug report and feedback. If you want to dive deep into the implementation details, feel free to check these files:

- [Skill effects audit](/api/skill-effects-audit.html)
- [Skill index generation script](https://github.com/liveahero-wiki/liveahero-wiki.github.io/blob/master/tools/generate_skill_search_index.py)

</div>
</details>

<div id="app"></div>
<script type="module" src="/assets/skill-search.js"></script>
