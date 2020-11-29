---
title: Sidekick
banner: true
---

* this will be unordered
{:toc}

## About Sidekick

Sidekick is a general term for characters that pairs up with the hero.

During the battle, the sidekick's parameter will be added up along with the hero's parameter.

Sidekick's parameter will increase when the relation level with the hero increases.

### Sidekick Level table

|Level|Required EXP|Cumulative|
|-|-|-|
| 90 -> 100 | 25180 | 95188 |
| 80 -> 90 | 20248 | 70008 |
| 70 -> 80 | 15858 | 49760 |
| 60 -> 70 | 12017 | 33902 |
| 50 -> 60 | 8719 | 21885 |
| 1 -> 50 | 13166 | 13166 |

See full EXP table [^bigtable].

[^bigtable]:
    <table>
    <tr>
      <th>Level</th><th>XP to lv up</th><th>Total XP</th>
    </tr>
    {% for pair in site.data.SidekickCardExpMaster %}
    <tr>
      <td>{{ pair[1].level }}</td><td>{{ pair[1].nextExp }}</td><td>{{ pair[1].totalExp }}</td>
    </tr>
    {% endfor %}
    </table>

## Sidekick Limit Breakthrough

A value that shows the sidekick's max relation limit.
The Sidekick's Mind can be used to further increase the sidekick's relation limit.

## Sidekick skills

The skills that the sidekick has.
During battle, hero can use the sidekick's skill when the sidekick is paired with the hero.

## Hero and Sidekick's Relation

The bond that grows between the hero and the sidekick is called a relation.

Relations are unique among heroes and sidekicks, and their relation combinations are not shared with the others.

Relation are awarded along with the exp when the hero and the sidekick are paired up together in a quest.

Higher relation level will have higher parameter from the sidekick when paired with the hero. Also, having a relation level 50 among the hero and the sidekick will unlock a special skill, known as the equipment skill.

## Equipment Skill

When the relation level is 50 among the hero and the sidekick, the hero will be able to receive the equipment skill from the sidekick.

The equipment skill can be equipped on the card detail screen for the hero, the skill effect is activated under a special timing.

It is available when the relation level with the sidekick is 50, and will further strengthen when it reaches 60, 70, 80, 90, and 100. 

## Checking the Sidekick's details

By hold tapping on the sidekick's icon, you will be moved to the sidekick's details screen.

## Status Screen

You can check the parameter of the sidekick.

## Skillset Screen

You can check the current skill of this sidekick.
Also, you can check on the Equipment Skills obtained by the sidekick while at relation level 50 and higher.

## Profile Screen

You could browse through this sidekick's affiliated company, occupation, image artist, cast voice, and side entries.

## Relation Screen

You could browse through this sidekick's relation with the other obtained heroes.

## Contracting Recollection Button

By tapping on the "Contracting Recollection" button located at the top right corner of the details screen, it will replay the scenario when you obtain the hero via Ether Stones.

## Browsing Mode Button

By tapping on the "Browsing Mode" button located at the top right corner of the details screen, you will be able to browse through the sidekick's illustrations, along with their voice lines.
