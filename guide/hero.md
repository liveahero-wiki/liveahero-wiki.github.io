---
title: Hero
banner: true
---

* this will be unordered
{:toc}

## About Hero
Hero is a general term for characters that appears in battle.

They can be obtained by "Ether searching" ([Gacha banner](/guide/gacha/)), or by mission rewards.

There are two types of hero:

- **Regular Heroes** have initial star rating from 3 star to 5 star
  - They can be obtained from Permanent Gacha banner, Limited-time Gacha banner, and certain Missions or Shops
  - Each regular hero has two different portraits. Hero with initial rating of 5 star will have 2 portraits unlocked immediately. Other hero need to be first upgraded to 5 star to unlocked the second portrait
- **Mob Heroes** have initial star rating at 1 star
  - They usually can only be obtained by exchanging in Event limited shop
  - Each mob hero only has one portrait, and has no voice actings

Any heroes can be upgraded to 6 star.

## Hero Attribute

Hero has their own attributes.

There are currently 5 types of attribute: Fire, Water, Wood, Light, and Shadow.

Each attribute has their own affinity, advantageous attribute will have decreased incoming damage, along with an increased outgoing damage.

Disadvantageous attribute will have increased incoming damage, along with a decreased outgoing damage. The attribute affinity is listed as follows:

- Fire is advantageous against Wood, and disadvantageous against Water.
- Water is advantageous against Fire, and disadvantageous against Wood.
- Wood is advantageous against water, and disadvantageous against Fire.
- Light is advantageous against Shadow, thus dealing more damage.
- Shadow is advantageous against Light, thus dealing more damage.

Advantageous attribute will deal 50% more damage, while disadvantageous attribute will deal 25% less damage.

{:refdef: style="text-align: center;"}
<img src="/assets/img/ui_tutorial_battle_2_1.png" alt="mainMenu" height=300px loading="lazy">
{: refdef}

## Hero Role

The roles indicates what the hero can do during the battle.

There are 8 roles available: Offense, Defense, Strengthen, Weaken, Speed Operation, View Acquirer, Recovery, and Special.

When choosing a hero for the team formation, the hero's role can be a guide of action.

## Hero Parameter

The hero has the following parameters that is used in battle.

- HP - Shows the hero's physical strength. If the value reaches 0 due to damages, the hero will be unable to continue to battle.
- ATK - Shows the hero's offensive power. The higher the value, the greater the damage dealt towards the enemy.
- SPD - Shows the hero's agility power. The higher the value, the early the hero gets to activate their skills first.
- View - Shows the number of View Power the hero can earn. During the battle, you can get as much View Power while performing an action, excluding the Wait action.

## Hero Level

A value that shows the hero's current enhancement level.

Also can be written as "Lv".

Upon obtaining they will all be level 1, and you can obtain exp through quests, business, and strengthening using exp items.

When the hero gains a level, their parameters will increase, excluding their SPD value.

### Hero Level Table

|Level|Required EXP|Cumulative|
|-|-|-|
| 50 -> 60 | 1014310 | 1262403 |
| 40 -> 50 | 189023 | 248093 |
| 30 -> 40 | 47256 | 59070 |
| 1 -> 30 | 11814 | 11814 |

See full EXP table [^bigtable].

[^bigtable]:
    <table>
    <tr>
      <th>Level</th><th>XP to lv up</th><th>Total XP</th>
    </tr>
    {% for pair in HeroCardExpMaster %}
    <tr>
      <td>{{ pair[1].level }}</td><td>{{ pair[1].nextExp }}</td><td>{{ pair[1].totalExp }}</td>
    </tr>
    {% endfor %}
    </table>

## Hero Rank

A value that shows the hero's current max level limit.

The initial hero rank will be the rarity of the hero being first obtained.

Hero that rank up will have their max level limit increased.

Hero with initial rank of 1 or 2 can rank up to rank 4 while hero with initial rank of 3 or above can rank up to rank 6.

At rank 3 the 3rd skill of the hero will be unlocked and become usable in battle.

At rank 5 the hero will take on a different figure.

Ranking up increases the basic ability value, and while on a specific hero rank, the skill will also be strengthened.

## Hero Skill

Hero's skills can be selected as a command during battle.

Damaging the enemy, or healing the allies, the effect varies among the hero.

A hero can have multiple skills, and some skills can be strengthen via rank up.

Activating a skill requires View Power to do so.

## Checking the Hero's details

By hold tapping on the hero's icon, you will be moved to the hero's details screen.

## Status Screen

You can check the parameter of the hero.

## Skillset Screen

You can check the current skill of this hero.

## Equipped Skills Screen

You can check the currently obtained Equipment Skills.

## Profile Screen

You could browse through this hero's affiliated company, occupation, image artist, cast voice, and side entries.

## Relation Screen

You could browse through this hero's relation with the other obtained sidekicks.

## Illustration Switching Button

By tapping on the "Illustration Switching" button located at the top right corner of the details screen, for any 5 star heroes it will toggle between their basic and their upgraded illustrations.

## Contracting Recollection Button

By tapping on the "Contracting Recollection" button located at the top right corner of the details screen, it will replay the scenario when you obtain the hero via Ether Stones.

## Browsing Mode Button

By tapping on the "Browsing Mode" button located at the top right corner of the details screen, you will be able to browse through the hero's illustrations, along with their voice lines.
