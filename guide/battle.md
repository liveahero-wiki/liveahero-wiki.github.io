---
title: Battle System
banner: true
---

* this will be unordered
{:toc}

## About Battle

Pair a hero with a sidekick, and fight against monsters and other heroes. Winning the battle gives various rewards, depending on the type of [Quest](/guide/quest/). All quests award [Heroes](/guide/hero/) and [Sidekicks](/guide/sidekick/) with EXP, and the player with [Rank EXP](/guide/user_rank/).

## About Team

A team is made of up of 5 Heroes and 5 sidekicks.

In most battles, you only need to have 4 pairs of your own heroes and sidekicks, then just borrow a friend support for one extra pair of hero and sidekick.

Each hero can also equip some sidekick passives. Hero with <= 5 star rank can equip up to 2 sidekick passives. Hero with 6 star rank can equip up to 3 sidekick passives.

4 heroes can fight at one time, with one of your heroes being sub-heroes. When one of the hero in your team is defeated, it will be swapped out for a sub-hero in its place at the next turn.

### Team Formation UI

<svg class="screenshot" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1926">

<defs>
  <filter x="0" y="0" width="1" height="1" id="solid">
    <feFlood flood-color="#000" result="bg" />
    <feMerge>
      <feMergeNode in="bg"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

<image xlink:href="/assets/img/screenshot/team-formation.jpg" style="width: 1080px;"></image>
<g class="tippy-tp" data-template="support-list-tip">
<rect x="353.84615384615387" y="171.28205128205127" width="259.4871794871795" height="76.92307692307693" class="image-mapper-shape" data-index="1"></rect>
<text filter="url(#solid)" x="430" y="190">
<tspan x="430" dy="1.5rem">Support</tspan>
<tspan x="430" dy="1.5rem">Settings</tspan>
</text>
</g>
<g class="tippy-tp" data-template="enhancement-mode-tip">
<rect x="647.1794871794872" y="176.4102564102564" width="265.64102564102564" height="66.66666666666666" class="image-mapper-shape" data-index="2"></rect>
<text filter="url(#solid)" x="700" y="190">
<tspan x="720" dy="1.5rem">Enhancement</tspan>
<tspan x="720" dy="1.5rem">Mode</tspan>
</text>
</g>
<g>
<rect x="785.6410256410256" y="303.5897435897436" width="197.9487179487179" height="71.79487179487177" class="image-mapper-shape" data-index="3"></rect>
<text filter="url(#solid)" x="820" y="360">Disband</text>
</g>
<g>
<rect x="99.48717948717949" y="390.7692307692308" width="214.35897435897436" height="210.25641025641022" class="image-mapper-shape" data-index="4"></rect>
<text filter="url(#solid)" x="130" y="600">Hero</text>
</g>
<g>
<rect x="323.0769230769231" y="434.87179487179486" width="165.12820512820514" height="162.05128205128204" class="image-mapper-shape" data-index="5"></rect>
<text filter="url(#solid)" x="340" y="600">Sidekick</text>
</g>
<g>
<rect x="743.5897435897435" y="503.5897435897436" width="222.56410256410265" height="92.30769230769232" class="image-mapper-shape" data-index="6"></rect>
<text filter="url(#solid)" x="750" y="600">Sidekick Passives</text>
</g>
</svg>

<div style="display: none">
<div id="support-list-tip" markdown="1">
Setup your support list for other players to borrow

See [Friend Support](/guide/friend_support/)
</div>
<div id="enhancement-mode-tip" markdown="1">
Toggle on to enable directly upgrading current heroes / sidekicks and adjust fan count / engravement level in this UI
</div>
</div>

## Battle Interface

{:refdef: style="text-align: center;"}
<img src="/assets/img/uipage_3_Number.png" alt="Battle Flow" height=500px loading="lazy">
{: refdef}

| Item                  | Description                                                |
|-----------------------|------------------------------------------------------------|
| 1. Battle Flow        | Display unit action order                                  |
| 2. Turn Count         | Display the current number of turn                         |
| 3. Battle Auto Mode   | Tap on this to enable auto battle                          |
| 4. Hero Skills        | Display the hero's available skills                        |
| 5. Wait Button        | Make your selected hero take action at the end of the turn |
| 6. View Power         | Display current view power                                 |
| 7. Combo Indicator    | Display current combo                                      |
| 8. Battle List Button | Display the skills of all of your current team             |
| 9. Battle Menu Button | Tap this to retire from the battle                         |

### Battle Flow

The battle timeline shows each character's order of actions. Order of action is determined by a Hero's speed (SPD). The higher their SPD stat, the sooner their chance to strike. Skills can only be selected and activated during a Hero's turn. After all characters have performed their actions, the turn is over. If desired, a Hero's turn order can be delayed to the end of turn by choosing to wait (purple icon with the hourglass).

### Battle Auto Mode

By tapping on the Auto button located at the top right of the battle screen, auto battle mode will commence.
Certain sidekick passives such as {% chara_link Kalaski|h1 %} or {% chara_link Melide %} will change unit behavior in auto mode.
You can also set the skills to be used in auto by giving [Skill Manual](https://liveahero-wiki.github.io/guide/skill_manual/) to the hero and equipping it.

### View Power

At the bottom of the battle screen is a number that represents the Battle's current View Power. This power granted by viewers is required to activate certain skills. Whenever the character execute an action, the character's View Power increases. Your own heroes and enemy share the same View Power for skills usage. Some skills have an effect on gaining View Powers, e.g. {% chara_link Polaris Mask|h1 %} Mic Performance.

### Combo

Combo counter increase by one for every consecutive actions done by your heroes. Starting from combo 2 any view generated by active hero will be increased by 10% for each combo (maximum view increase from combo is 50%)  i.e.: 1.1x view at combo 2, 1.2x view at combo 3, etc. Combo will be reset to 0 when any enemy unit take action in battle.
>Certain heroes have skills that increase combo count {% chara_link Barrel|h1 %} /{% chara_link Kyoichi|h1 %} or skills that make use of combo count as damage multiplier {% chara_link Barrel|h1 %}/{% chara_link Toshu|h1 %})

### Battle Menu Button

By tapping on the Menu button located at the bottom right of the battle screen, the player can choose to give up on the current battle.

### Battle List Button

By tapping on the List button located at the bottom right of the battle screen, the player can view the skills of their heroes by their order of actions. This includes the skill descriptions as well as their View Power cost.

### Status Modifiers

During the battle, the character can be affected by several statuses. The number of actions left in a status could decrease under various conditions, such as number of actions, or they may last until the end of the turn. In the case of defensive buffs, actions are called attacks. When action counter reaches 0, the status is removed.

Statuses that grant positive effects on the hero are displayed as a yellow icon, also known as "Buffs". Conversely, statuses that afflict the hero with negative effects are displayed as a blue icon, also known as "Debuffs".

Full list of statuses can be found [here](/statuses/).

#### Buffs

| Buff | English Name | Description |
|:----:|:--------------:|:-----------:|
| {{ 1 | status_description }} | ATK Up | Attack is increased by 1.5x. Duration decreases after the Hero performs an action. |
| {{ 2 | status_description }} | Def Up | Damage received is decreased by 0.5x once. Duration decreases after taking damage.|
| {{ 3 | status_description }} | SPD UP | Speed is increased by +10. Duration decreases after the Hero performs an action.|
| {{ 20 | status_description }} | Super SPD Up | Speed is increased by +30. Duration decreases after the Hero performs an action. |
| {{ 4 | status_description }} | Attention | Views gained after an action are increased by 1.5x. Turn decreased based on action. It is non-repeatable. |
| {{ 5 | status_description }} | Provocation | Enemies target the ally until the end of the turn. |
| {{ 6 | status_description }} | Invincible | Damage received from enemies is reduced to 0 once. |
| {{ 7 | status_description }} | Good Luck | Activation rate of skills increased by 20%. Duration decreases after the Hero performs an action. |
| {{ 8 | status_description }} | Awakening | View Power required for skills is halved. Duration decreases after the Hero performs an action. It is non-repeatable. |
| {{ 9 | status_description }} | Resurrection | Restore HP when receiving fatal damage once. |
| {{ 10 | status_description }} | Regen | Restores 10% HP at the end of turn. Duration decreases when the turn ends. |
| {{ 26 | status_description }} | Damage Gathering | All enemy attacks apply to the target ally. Duration decreases when the turn ends. It does not repeat. |

#### Debuffs

| Debuff | English Name | Description |
|:----:|:--------------:|:-----------:|
| {{ 11 | status_description }} | ATK Down | Attack is decreased by 0.5x. Duration decreases after the Hero performs an action. |
| {{ 12 | status_description }} | DEF Down | Damage received is increased by 1.5x once. Duration decreases after taking damage. |
| {{ 13 | status_description }} | SPD down | Speed is decreased by -10. Duration decreases after the Hero performs an action. |
| {{ 29 | status_description }} | Super SPD Down | Speed is decreased by 30. Duration decreases after the Hero performs an action. |
| {{ 14 | status_description }} | Mosaic | View Power gained from actions is decreased by 0.5x. Duration decreases after the Hero performs an action. |
| {{ 16 | status_description }} | Misfortune | Activation rate of skills decreased by 20%. Duration decreases after the Hero performs an action. |
| {{ 22 | status_description }} | Silence | Skill cannot be used. Duration decreases when the turn ends. It does not repeat. |
| {{ 18 | status_description }} | Poison | Takes 5% of HP as damage at end of turn. Duration decreases when the turn ends. |
| {{ 19 | status_description }} | Burn | Takes 10% of HP as damage at end of turn. Duration decreases when the turn ends. |

## Battle acquisition EXP/ Relation

Heroes earn experience points (EXP) in battle. When the Hero's level is already at its limit, the experience will be given in form of {% include item.html id=11 %} instead.

## Drop item

In quests, items may be available as a random drop. For instance, many quests will award additional EXP in the form of {% include item.html id=11 %}, as well as {% include item.html id=35 %}. Additionally, a special clear bonus is given during the first clear of most quests.

## Support

After quest selection, another player's Hero and respective Sidekick can be selected as Support for that battle. Depending on the quest, an NPC support might be locked in place of a player's support. When a Hero is selected as Support, both their operating player and the player receiving support will earn {% include item.html id=42 %} (Friend Points): 100 if they are friends, or 50 if they are not.

If a non-friend Support is chosen, it is possible to request that player to become a friend after the battle has ended. Supports can be set for other users to use under the Support tag via the Options menu > Player Settings. <!-- needs a screenshot -->
