"""Generate the advanced skill-search index.

Walks the master-data join chain
    CardMaster / SidekickMaster  ->  SkillMaster.effects[].skillEffectId
        ->  SkillEffectMaster.skillEffectJson (effects[].class, statusId)
        ->  StatusMaster (+ _data/translation/Status.json for name/icon)
and emits a prebuilt, browser-fetchable index plus a tiny version probe.

Outputs (plain static JSON, no Jekyll front-matter, so they are copied
verbatim into _site/api/ and can be fetched at /api/skill-index.json):
    api/skill-index.json          - the full index
    api/skill-index-version.json  - { "version": "<masterdata version>" }

Run from the repo root:  python tools/generate_skill_search_index.py

Follows the same plain-json / write-under-repo pattern as tools/skill_evo.py
and tools/generate_status_pages.py. MVP uses the raw Japanese
SkillMaster.description; the schema leaves room to swap in translated /
LiquidJS-rendered text later.
"""

import json
import os
import re
import hashlib
from collections import Counter, OrderedDict, defaultdict

from wiki_util import sanitizeSkillDescription, build_chara_pages

DATA = "_data"
API = "api"
ZZZ = "zzz"
CHARAS = "_charas"

# Bumped whenever the index *generation logic* changes in a way that alters the
# emitted JSON without a masterdata version change. Appended to the cache key so
# clients (search/src/data/loadIndex.js) refetch the index instead of reusing a
# stale cache. r2: skill-tree skills now resolve conditionDescription fallback.
# r3: sidekick passive now resolved from equipmentSkills[-1] (was a dead
# passiveSkillIds field, so sidekicks previously had no passive indexed).
# r4: maxed skill-tree skills now assemble their full description from
# terminal-tier effects[].conditionDescription lines and recompute useView from
# additive ChangeSkillBaseView deltas (see maxed_skill_description / maxed_use_view).
# r5: active skills now carry a changeSkills field listing the in-combat
# ChangeActiveSkill transform targets (name + description), mirroring the wiki's
# _includes/skill-description.html <details> blocks.
# r6: hidden passives (hero passive + sidekick equipmentAppendSkills) are indexed
# but hidden; their labels/statuses are attributed to visible <wiki-passive> carriers.
# r7: skills now carry statusDescs [{name, desc}] for every named status effect,
# mirroring status_description_v2 so the search UI can attach tippy tooltips.
# r8: statusDescs entries gain optional icon field (filename override > Status.json icon)
INDEX_SCHEMA_REV = "r8"


# --- Undocumented game-data enums / magic numbers ---------------------------
# These bare integers come straight from the masterdata and have no symbolic
# names in the source dumps. Centralized here so each meaning is discoverable in
# one place and a future enum change is a single edit.

# SkillMaster.targetFlag: the game's skill-targeting enum, from _plugins/skill.rb
# skill_target. A damage-dealing skill gets an attack-range label from which side
# it hits: enemies -> single/all attack, allies -> "attack allies". 0 (self) and
# 5 (event bonus unit) get no attack-range label. Multi-hit comes from the
# *MultipleAttack classes, not from targetFlag.
TARGET_FLAGS_ENEMY_ALL = {4, 16}                    # all enemies / all except target
TARGET_FLAGS_ENEMY_SINGLE = {2, 7}                  # single / random enemy
TARGET_FLAGS_ALLY = {1, 3, 6, 9, 11, 12, 13, 14}    # any ally-directed damage
TARGET_FLAGS_NO_RANGE = {0, 5}                       # self / event bonus unit

# StatusMaster.statusType -> our status-bucket name. Anything not listed here
# (the `else` branch) is treated as an internal/system status.
STATUS_TYPE_MAP = {0: "debuff", 1: "buff", 3: "field"}
STATUS_TYPE_DEFAULT = "system"

# CardMaster/SidekickMaster.stockId encodes the costume/art variant in its last
# decimal digit (stockId % 10). Variants at or below this threshold use the base
# page title; higher variants get a per-variant title suffix. Mirrors the Liquid
# `stockIdToLink` filter.
STOCK_ID_VARIANT_MODULO = 10
STOCK_ID_BASE_VARIANT = 1   # variant > this -> use the variant-specific title

# CardMaster.rarity value identifying the max-rarity card in a hero stock group;
# that entry is used as the representative for indexing.
HERO_MAX_RARITY = 6

# SidekickMaster.levelZone value identifying the max-level sidekick card in a
# stock group; that entry is used as the representative for indexing.
SIDEKICK_MAX_LEVEL_ZONE = 6


def load(name, sub=None):
    path = os.path.join(DATA, sub, name) if sub else os.path.join(DATA, name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_english():
    """The raw English localization dump. Optional: missing -> {} so that the
    raw-Japanese fallback still works (it is a temp dump under zzz/)."""
    path = os.path.join(ZZZ, "English.json")
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Category taxonomy (drives the query-UI buttons). Each label key is
# "<category>.<label>"; skills carry a flat list of these keys.
# ---------------------------------------------------------------------------
CATEGORIES = [
    {"key": "attack", "label": "Attack", "labels": [
        {"key": "attack.single", "label": "Single-target attack"},
        {"key": "attack.all", "label": "All-range attack"},
        {"key": "attack.special", "label": "Special-range attack"},
        {"key": "attack.multi", "label": "Multiple attacks"},
        {"key": "attack.extra_action", "label": "Additional actions"},
        {"key": "attack.induction", "label": "Pursuit / Induction"},
        {"key": "attack.counter", "label": "Counterattack"},
        {"key": "attack.ally", "label": "Attack allies"},
        {"key": "attack.penetrate", "label": "Penetrating damage"},
    ]},
    {"key": "damage", "label": "Damage", "labels": [
        {"key": "damage.up", "label": "Increase damage"},
        {"key": "damage.down", "label": "Decrease damage"},
        {"key": "damage.dot", "label": "Damage over time"},
    ]},
    {"key": "spd", "label": "SPD", "labels": [
        {"key": "spd.up", "label": "Increase SPD"},
        {"key": "spd.down", "label": "Decrease SPD"},
        {"key": "spd.other", "label": "Other SPD skills"},
    ]},
    {"key": "heal", "label": "Healing", "labels": [
        {"key": "heal.heal", "label": "Heal"},
        {"key": "heal.change", "label": "Change heal amount"},
    ]},
    {"key": "combo", "label": "Combo", "labels": [
        {"key": "combo.up", "label": "Increase Combo"},
    ]},
    {"key": "vp", "label": "VP / View", "labels": [
        {"key": "vp.gain", "label": "VP gain"},
        {"key": "vp.costdown", "label": "View cost change"},
    ]},
    {"key": "interf", "label": "Skill interference", "labels": [
        {"key": "interf.debuff_remove", "label": "Debuff removal"},
        {"key": "interf.buff_remove", "label": "Buff removal"},
        {"key": "interf.debuff_resist", "label": "Debuff resistance"},
        {"key": "interf.extend", "label": "Buff / debuff extension"},
        {"key": "interf.silence", "label": "Silence / skip"},
    ]},
    {"key": "defense", "label": "Defense / Survival", "labels": [
        {"key": "defense.barrier", "label": "Barrier"},
        {"key": "defense.absorb", "label": "Damage absorb"},
        {"key": "defense.cover", "label": "Cover / Taunt"},
        {"key": "defense.stealth", "label": "Stealth"},
        {"key": "defense.revive", "label": "Revive"},
        {"key": "defense.hp", "label": "Max HP up"},
    ]},
    {"key": "skillctl", "label": "Skill control", "labels": [
        {"key": "skillctl.change", "label": "Skill change"},
        {"key": "skillctl.auto", "label": "Auto-action control"},
    ]},
    {"key": "acq", "label": "Increased Acquisition", "labels": [
        {"key": "acq.coin", "label": "Coin / sales boost"},
        {"key": "acq.exp", "label": "EXP boost"},
        {"key": "acq.relation", "label": "Relation boost"},
    ]},
    {"key": "field", "label": "Field", "labels": [
        {"key": "field.field", "label": "Field effect"},
        {"key": "field.remove", "label": "Remove field effect"},
    ]},
]

# Effect classes that deal damage -> the skill counts as an "attack" and gets
# a target-based label (single / all / random) from its targetFlag.
DAMAGE_CLASSES = {
    "Damage", "ComboDamage", "DamageCount", "MultipleAttack", "AllAttack",
    "ComboMultipleAttack", "HealthDamage", "HealthMultipleAttack",
    "HPDependentDamage", "HighestHealthMultipleAttack", "SpdDeferenceDamage",
    "SpdDifferenceMultipleAttack", "StatusNumDamage", "StatusNumberMultipleAttack",
    "RandomTeamAttack", "TeamAttackEnemy", "TeamAttackRandomEnemy",
    "ElementPenetrateDamage", "Penetration", "NowViewDamage",
    "ViewPowerMultipleAttack", "DamageMultipleAdjust",
    "BeforeSkillTriggerMultipleAttack", "HighestBarrierMultipleAttack",
    "OtherParamAddAttack",
}

# Direct effect-class -> label-key(s) mapping. Classes needing value-sign or
# other context (ChangeAgi, ChangeView, target/dot flags) are handled in code.
CLASS_TO_LABELS = {
    # multiple attacks
    "MultipleAttack": ["attack.multi"], "ComboMultipleAttack": ["attack.multi"],
    "HealthMultipleAttack": ["attack.multi"], "HighestHealthMultipleAttack": ["attack.multi"],
    "SpdDifferenceMultipleAttack": ["attack.multi"], "StatusNumberMultipleAttack": ["attack.multi"],
    "ViewPowerMultipleAttack": ["attack.multi"], "BeforeSkillTriggerMultipleAttack": ["attack.multi", "attack.induction"],
    "HighestBarrierMultipleAttack": ["attack.multi"], "DamageCount": ["attack.multi"],
    # penetrate / counter / extra action / pursuit
    "Penetration": ["attack.penetrate"], "ElementPenetrateDamage": ["attack.penetrate"],
    "HidePenetration": ["attack.penetrate"],
    "CounterAttack": ["attack.counter"], "CounterAttackRecalculateTarget": ["attack.counter"],
    "MoreTurn": ["attack.extra_action"], "MoreTurnExecBeforeSkill": ["attack.extra_action"],
    "ReleaseWait": ["attack.extra_action"],
    "Induction": ["attack.induction"],
    # damage modifiers
    "AddMultDamage": ["damage.up"], "DamageMultipleAdjust": ["damage.up"],
    "DamageLimit": ["damage.down"], "MultipleDefence": ["damage.down"],
    # spd
    "TurnBaseChangeAgi": ["spd.other"], "Wait": ["spd.other"],
    # heal
    "Heal": ["heal.heal"], "OneTimeHeal": ["heal.heal"], "HealthHeal": ["heal.heal"],
    "HealCount": ["heal.heal"], "HealMultipleAttack": ["heal.heal"],
    "AddMultHeal": ["heal.change"],
    # combo
    "ComboPlus": ["combo.up"], "AddPlusCombo": ["combo.up"],
    # view
    "ChangeView": ["vp.gain"], "ChangeBaseView": ["vp.gain"], "GetViewDamage": ["vp.gain"],
    "ViewCount": ["vp.gain"], "ViewChangeHp": ["vp.gain"],
    "NeedViewChange": ["vp.costdown"], "NeedViewValueChange": ["vp.costdown"],
    "NotDamageSkillNeedViewChange": ["vp.costdown"], "NotDamageSkillNeedViewValueChange": ["vp.costdown"],
    "FixView": ["vp.costdown"], "ChangeSkillBaseView": ["vp.costdown"],
    "RateChangeView": ["vp.costdown"], "ChangeViewCoefficient": ["vp.costdown"],
    # interference
    "Cure": ["interf.debuff_remove"],
    "RemoveBuff": ["interf.buff_remove"], "RemoveSystemEffect": ["interf.buff_remove"],
    "RegistDebuff": ["interf.debuff_resist"], "RegistDeBuffExecDeBuffed": ["interf.debuff_resist"],
    "SkillTurnExtension": ["interf.extend"], "SkillTurnExtensionByStatus": ["interf.extend"],
    "Silence": ["interf.silence"], "SkillSkip": ["interf.silence"],
    # defense / survival
    "Barrier": ["defense.barrier"], "OtherParamBarrier": ["defense.barrier"],
    "BarrierExtension": ["defense.barrier", "interf.extend"],
    "AbsorbDamage": ["defense.absorb", "damage.down"],
    "Cover": ["defense.cover"], "Provocation": ["defense.cover"],
    "TargetMark": ["defense.cover"], "Aggregation": ["defense.cover"],
    "Hide": ["defense.stealth"],
    "Ressurection": ["defense.revive"], "RessurectOrHeal": ["defense.revive", "heal.heal"],
    # skill control
    "ChangeActiveSkill": ["skillctl.change"],
    "DecideAutoSkill": ["skillctl.auto"], "ForceAuto": ["skillctl.auto"],
    "TargetReversal": ["skillctl.auto"],
    "DecideUniqueByStatusPassiveBattleSkillEffect": ["skillctl.auto"],
    # acquisition
    "SalesBonusCheat": ["acq.coin"], "IncreaseLAH": ["acq.coin"],
    "IncreaseExp": ["acq.exp"], "IncreaseRelation": ["acq.relation"],
    # field
    "RemoveFieldEffect": ["field.remove"], "RemoveGainViewStock": ["field.remove"],
    # stat buffs (max-HP up; survivability)
    "MultipleHp": ["defense.hp"],
}

# Classes we knowingly do not surface as labels (pure mechanics / display).
IGNORED_CLASSES = {
    "ChangeHp", "Critical", "IgnoreElement", "Burst", "Summon", "ItemEffectMark",
    "ParticleStatus", "PassiveBattleSkillEffect", "ForceExecDotDamage",
    "ChangeHpExecBeforeSkill", "Delete Turn",
}

unmapped = Counter()
unmapped_target_flags = Counter()  # damage skills whose targetFlag has no range label
missing_upgrade_nodes = Counter()  # gated node ids absent from SkillUpgradeMaster
liquid_template_statuses = Counter()  # status IDs whose base desc contains Liquid {{ }}


def status_type(status_master_entry):
    t = status_master_entry.get("statusType")
    return STATUS_TYPE_MAP.get(t, STATUS_TYPE_DEFAULT)


def classify(cls, inner):
    """Map a single effect class to label keys.

    Returns (labels:set, deals_damage:bool, recognized:bool). The explicit
    CLASS_TO_LABELS map wins outright; otherwise ordered substring rules cover
    the long tail of mechanical variants (e.g. every *MultipleAttack) so new
    classes auto-map. Anything left unrecognized is reported for review.
    """
    if cls in CLASS_TO_LABELS:
        return set(CLASS_TO_LABELS[cls]), cls in DAMAGE_CLASSES, True
    if cls in DAMAGE_CLASSES:
        return set(), True, True
    if cls in ("ChangeAgi", "OtherParamChangeAgi"):
        v = (inner.get("parameter") or {}).get("value", 0)
        return {"spd.up" if v > 0 else "spd.down" if v < 0 else "spd.other"}, False, True
    if cls.startswith("Aim"):
        return {"skillctl.auto"}, False, True
    if "DecideAutoSkill" in cls:
        return {"skillctl.auto"}, False, True
    # ordered substring rules (specific before generic)
    if "AddPlusCombo" in cls:
        return {"combo.up"}, False, True
    if "TargetMark" in cls:
        return {"defense.cover"}, False, True
    if "TurnExtension" in cls:
        return {"interf.extend"}, False, True
    if "NeedView" in cls:
        return {"vp.costdown"}, False, True
    if "Heal" in cls and "Health" not in cls:
        return {"heal.heal"}, False, True
    if "DamageLimit" in cls:
        return {"damage.down"}, False, True
    if "Defence" in cls:
        return {"damage.down"}, False, True
    if "MultipleAttack" in cls:
        return {"attack.multi"}, True, True
    if "DotDamage" in cls or "ElapseTurnDamage" in cls:
        return {"damage.dot"}, False, True
    if "Damage" in cls:
        return set(), True, True
    if cls.endswith("Attack") or cls.endswith("Atk"):
        return set(), True, True
    if "View" in cls:
        return {"vp.gain"}, False, True
    # knowingly ignored mechanics / placeholders / handled-elsewhere classes
    if (cls in IGNORED_CLASSES or "NoneEffect" in cls or "Critical" in cls
            or cls.startswith("Regist") or "ChangeSkillProb" in cls
            or "ChangeSkillProve" in cls or "CopyBuff" in cls
            or cls.endswith("Status")):
        return set(), False, True
    return set(), False, False


def label_skill(skill_id, SM, SEM, SMA, visited):
    """Return (labels:set, status_ids:set) for a skill, folding in any
    ChangeActiveSkill target skills and granted passive skills (recursively)."""
    labels, status_ids = set(), set()
    sid = str(skill_id)
    if sid in visited:
        return labels, status_ids
    visited.add(sid)
    skill = SM.get(sid)
    if not skill:
        return labels, status_ids

    target_flag = skill.get("targetFlag")
    description = skill.get("description") or ""
    deals_damage = False

    for eff in skill.get("effects", []) or []:
        sem = SEM.get(str(eff.get("skillEffectId")))
        if not sem:
            continue
        sej = sem.get("skillEffectJson", {})
        if sej.get("statusId"):
            status_ids.add(sej["statusId"])
        if sej.get("isDotDamage"):
            labels.add("damage.dot")
        if sej.get("isFieldEffect"):
            labels.add("field.field")
        for inner in sej.get("effects", []):
            cls = inner.get("class", "")
            l, dmg, recognized = classify(cls, inner)
            labels.update(l)
            deals_damage = deals_damage or dmg
            if not recognized:
                unmapped[cls] += 1
            # fold in skill-change targets
            if cls == "ChangeActiveSkill":
                tgt = (inner.get("parameter") or {}).get("skillId")
                if tgt:
                    l2, s2 = label_skill(tgt, SM, SEM, SMA, visited)
                    labels.update(l2)
                    status_ids.update(s2)

    # granted passive skills attached to this skill
    for pid in skill.get("appendPassiveSkillIds") or []:
        l2, s2 = label_skill(pid, SM, SEM, SMA, visited)
        labels.update(l2)
        status_ids.update(s2)

    # target-based attack labels (multi-hit comes from *MultipleAttack classes)
    if deals_damage:
        if target_flag in TARGET_FLAGS_ENEMY_ALL:
            labels.add("attack.all")
        elif target_flag in TARGET_FLAGS_ENEMY_SINGLE:
            labels.add("attack.single")
        elif target_flag in TARGET_FLAGS_ALLY:
            labels.add("attack.ally")
        elif target_flag not in TARGET_FLAGS_NO_RANGE:
            unmapped_target_flags[target_flag] += 1
        if "隣" in description:  # adjacent-target wording
            labels.add("attack.special")

    return labels, status_ids


def skill_name(skill_id, SM, SkillTrans, English):
    """Skill.json translation -> English.json -> raw Japanese master string."""
    sid = str(skill_id)
    return (SkillTrans.get(sid, {}).get("skillName")
            or English.get(f"SKILL_NAME_{sid}")
            or SM.get(sid, {}).get("skillName", ""))


def base_condition_description(skill_id, SM, English):
    """Skill-tree-upgraded skills often have an empty top-level `description`;
    the real text lives in effects[].conditionDescription on the base effect
    (conditionEntityId == 0), mirroring _includes/skill-description.html.
    Prefer the English dump, fall back to raw Japanese master text."""
    sid = str(skill_id)
    for eff in SM.get(sid, {}).get("effects") or []:
        if eff.get("conditionEntityId", 0) != 0:
            continue
        en = English.get(f"SKILL_EFFECT_CONDITION_DESCRIPTION_{sid}_{eff.get('serialNo')}")
        if en:
            return en
        jp = eff.get("conditionDescription")
        if jp:
            return jp
    return ""


def skill_description(skill_id, SM, SkillTrans, English):
    """Skill.json translation -> English.json -> raw Japanese master string ->
    base-effect conditionDescription (for skill-tree-upgraded skills whose
    top-level description is empty), always sanitized for the wiki tag set."""
    sid = str(skill_id)
    d = (SkillTrans.get(sid, {}).get("description")
         or English.get(f"SKILL_DESCRIPTION_{sid}")
         or SM.get(sid, {}).get("description")
         or base_condition_description(skill_id, SM, English))
    return sanitizeSkillDescription(d or "")


# Strips wiki/style tags and whitespace; used to tell a real text-bearing
# condition line apart from a markup-only filler (e.g. a lone "</style>").
_VISIBLE_TEXT_RE = re.compile(r"<[^>]+>|\s")


def _has_visible_text(s):
    return bool(_VISIBLE_TEXT_RE.sub("", s or ""))


def is_terminal_node(eid, SUM):
    """A SkillUpgradeMaster node is terminal (the final tree tier) when it has no
    nextEntryIds. An unconditional effect (eid 0) or a non-tree context (SUM is
    None) is treated as terminal -- it is not a gated tier to be superseded.

    A node id absent from SkillUpgradeMaster is treated as terminal (recall-safe:
    include the line rather than silently drop the final tier) and recorded so
    the run reports it -- this should not happen with consistent masterdata."""
    if not eid or SUM is None:
        return True
    node = SUM.get(str(eid))
    if node is None:
        missing_upgrade_nodes[eid] += 1
        return True
    return not node.get("nextEntryIds")


def maxed_skill_description(skill_id, SM, SEM, SkillTrans, English, SUM):
    """Full fully-bloomed description of a skill-tree (bloom) skill.

    A bloom skill keeps the same skillId through its whole SkillUpgradeMaster
    tree; its text is the top-level `description` plus selected
    effects[].conditionDescription lines. Each effect's `conditionEntityId`
    references a SkillUpgradeMaster node (0 == unconditional).

    Tiered variants of one line replace each other as the tree is climbed, but
    they do not necessarily share a skillEffectId (e.g. a damage line whose
    %-value rises uses a fresh skillEffectId per tier). We therefore group
    condition lines by their effect *signature* (inner effect classes + the
    applied statusId). A line is kept when it is either (a) unconditional and
    its signature has NO tree-gated tier (so standalone passives survive while
    the tier-0 base of a progression is dropped), or (b) gated by a *terminal*
    node (nextEntryIds == null) -- the final value of a tiered line, since
    maxing unlocks the whole tree. Lines are emitted in serialNo order; English
    dump preferred, raw Japanese master fallback; result sanitized."""
    sid = str(skill_id)
    skill = SM.get(sid, {})

    def sig(eff):
        sej = SEM.get(str(eff.get("skillEffectId")), {}).get("skillEffectJson", {})
        return (tuple(i.get("class") for i in sej.get("effects", [])),
                sej.get("statusId"))

    cond_effects = [e for e in (skill.get("effects") or [])
                    if (e.get("conditionDescription") or "")]
    # signatures that have at least one tree-gated tier -> their tier-0
    # (conditionEntityId == 0) line is just the un-enhanced base, so skip it.
    # Markup-only filler effects (e.g. a lone "</style>") share the empty
    # signature but are not real tiers, so they must not gate a standalone line.
    gated_sigs = {sig(e) for e in cond_effects
                  if e.get("conditionEntityId", 0) != 0
                  and _has_visible_text(e.get("conditionDescription"))}

    base = (English.get(f"SKILL_DESCRIPTION_{sid}")
            or SkillTrans.get(sid, {}).get("description")
            or skill.get("description") or "")

    kept = []
    for eff in cond_effects:
        cei = eff.get("conditionEntityId", 0)
        if cei == 0:
            if sig(eff) not in gated_sigs:
                kept.append(eff)
        elif is_terminal_node(cei, SUM):
            kept.append(eff)
    kept.sort(key=lambda e: e.get("serialNo", 0))

    parts = [base]
    for eff in kept:
        sn = eff.get("serialNo")
        parts.append(English.get(f"SKILL_EFFECT_CONDITION_DESCRIPTION_{sid}_{sn}")
                     or eff.get("conditionDescription") or "")
    return sanitizeSkillDescription("".join(parts))


def maxed_use_view(skill_id, SM, SEM):
    """Maxed View cost: base useView plus every ChangeSkillBaseView delta.

    Skill-tree view-cost reductions are ChangeSkillBaseView effects (negative
    parameter.value) gated by tree nodes, and they are *additive* across the
    chain (unlike the replacement-style damage/burn tiers), so maxing sums them
    all. Multiplier-style view classes (ChangeViewCoefficient/FixView/...) are
    not modeled and leave the cost at base."""
    skill = SM.get(str(skill_id), {})
    total = skill.get("useView", 0)
    for eff in skill.get("effects") or []:
        sej = SEM.get(str(eff.get("skillEffectId")), {}).get("skillEffectJson", {})
        for inner in sej.get("effects", []):
            if inner.get("class") == "ChangeSkillBaseView":
                total += (inner.get("parameter") or {}).get("value", 0)
    return total


def collect_change_skills(skill_ids, SM, SEM):
    """Bucket in-combat ChangeActiveSkill transform targets by the active slot
    they replace, mirroring _plugins/skill.rb `collect_change_skills`. Returns
    {slotIndex: [target skillId, ...]} where slotIndex == parameter.index + 1."""
    by_slot = defaultdict(list)
    for skill_id in skill_ids:
        skill = SM.get(str(skill_id))
        if not skill:
            continue
        for eff in skill.get("effects") or []:
            sej = SEM.get(str(eff.get("skillEffectId")), {}).get("skillEffectJson", {})
            for inner in sej.get("effects", []):
                if inner.get("class") == "ChangeActiveSkill":
                    p = inner.get("parameter") or {}
                    if p.get("skillId"):
                        by_slot[p.get("index", 0) + 1].append(p["skillId"])
    return by_slot


def change_skills(change_ids, skill_id, SM, SkillTrans, English):
    """Resolve change-skill target IDs to [{name, description}], applying the
    two guards from _includes/skill-description.html: skip the skill itself and
    skip targets whose master skillName matches the current skill's."""
    own_name = SM.get(str(skill_id), {}).get("skillName")
    out = []
    for cid in change_ids:
        if cid == skill_id:
            continue
        if SM.get(str(cid), {}).get("skillName") == own_name:
            continue
        out.append({
            "name": skill_name(cid, SM, SkillTrans, English),
            "description": skill_description(cid, SM, SkillTrans, English),
        })
    return out


def build_status_descs(skill_id, SM, SEM, SMA, StatusTrans, SkillEffectTrans, SUM=None):
    """[{name, desc}] per distinct named status granted by this skill's direct effects.

    Mirrors status_description_v2 priority:
      SkillEffect.json override > raw skillEffectJson override
        > Status.json (skip if contains {{ Liquid template) > StatusMaster raw.
    Deduped by resolved name. Effects with statusId==0 are skipped.

    When SUM (SkillUpgradeMaster) is provided, tree-gated effects
    (conditionEntityId != 0) are only included if their node is terminal
    (nextEntryIds is absent/null), mirroring maxed_skill_description. This
    prevents intermediate tree-stage status entries (e.g. View消費量+100 … +750
    for a progression that ends at +1000) from appearing alongside the final one."""
    skill = SM.get(str(skill_id), {})
    results, seen_names = [], set()
    for eff in skill.get("effects", []) or []:
        if not is_terminal_node(eff.get("conditionEntityId", 0), SUM):
            continue
        seid = str(eff.get("skillEffectId", ""))
        sej = SEM.get(seid, {}).get("skillEffectJson", {})
        status_id = sej.get("statusId")
        if not status_id:
            continue
        se_trans = SkillEffectTrans.get(seid, {})
        sid = str(status_id)

        name = (se_trans.get("overrideStatusName")
                or sej.get("overrideStatusName")
                or StatusTrans.get(sid, {}).get("name")
                or SMA.get(sid, {}).get("statusName", ""))
        if not name or name in seen_names:
            continue
        seen_names.add(name)

        desc = (se_trans.get("overrideStatusDescription")
                or sej.get("overrideStatusDescription", ""))
        if not desc:
            base = StatusTrans.get(sid, {}).get("description", "")
            if "{{" in base:
                liquid_template_statuses[sid] += 1
                base = ""
            desc = base or SMA.get(sid, {}).get("description", "")

        icon = sej.get("filename") or StatusTrans.get(sid, {}).get("icon") or ""
        entry = {"name": name, "desc": desc or ""}
        if icon:
            entry["icon"] = icon
        results.append(entry)
    return results


def skill_obj(slot, skill_id, SM, SEM, SMA, SkillTrans, English, SkillEffectTrans, StatusTrans, change_ids=(), hidden=False, SUM=None):
    labels, status_ids = label_skill(skill_id, SM, SEM, SMA, set())
    skill = SM.get(str(skill_id), {})
    return {
        "slot": slot,
        "skillId": skill_id,
        # Hidden passives (hero passive skills, sidekick append-passives) are never
        # shown as their own row in-game; their effects are described inside the
        # visible skills' <wiki-passive> blocks. They are kept in the index (for the
        # full-kit dialog) but the UI hides their rows and attributes their labels.
        "hidden": hidden,
        "name": skill_name(skill_id, SM, SkillTrans, English),
        "description": skill_description(skill_id, SM, SkillTrans, English),
        "useView": skill.get("useView", 0),
        "labels": sorted(labels),
        "statusIds": sorted(status_ids),
        # match* default to own labels/statuses; attribute_passives() folds hidden
        # passives' passive-only labels into the visible <wiki-passive> carrier(s).
        "matchLabels": sorted(labels),
        "matchStatusIds": sorted(status_ids),
        "changeSkills": change_skills(change_ids, skill_id, SM, SkillTrans, English),
        "statusDescs": build_status_descs(skill_id, SM, SEM, SMA, StatusTrans, SkillEffectTrans, SUM),
    }


def attribute_passives(skills):
    """Fold the hidden passives' passive-only labels/statuses into the visible
    skill(s) whose description carries a <wiki-passive> block (the in-game carrier
    of that passive text), mutating each skill's matchLabels/matchStatusIds.

    Keyed on the `hidden` flag (not slot) so it serves heroes (hidden = passive
    skills) and sidekicks (hidden = append-passive) identically. Recall is
    preserved: union(visible matchLabels) == union(all own labels) == entity
    labels, because passive-only labels are redistributed onto visible skills."""
    visible = [s for s in skills if not s["hidden"]]
    hidden = [s for s in skills if s["hidden"]]
    if not visible or not hidden:
        return
    vis_l = set().union(*(s["labels"] for s in visible))
    vis_s = set().union(*(s["statusIds"] for s in visible))
    hid_l = set().union(*(s["labels"] for s in hidden))
    hid_s = set().union(*(s["statusIds"] for s in hidden))
    only_l, only_s = hid_l - vis_l, hid_s - vis_s
    if not only_l and not only_s:
        return  # nothing the visible skills don't already carry (e.g. sidekicks)
    carriers = [s for s in visible if "<wiki-passive>" in (s["description"] or "")]
    targets = carriers or visible  # orphan fallback: no carrier -> all visible skills
    for s in targets:
        s["matchLabels"] = sorted(set(s["matchLabels"]) | only_l)
        s["matchStatusIds"] = sorted(set(s["matchStatusIds"]) | only_s)


def aggregate(skills, key):
    out = set()
    for s in skills:
        out.update(s[key])
    return sorted(out)


def chara_name_and_page(rep, suffix, chara_pages):
    """Resolve the English page title (variant-aware) and page url for an
    entity, mirroring the Liquid `stockIdToLink` filter. Falls back to the raw
    Japanese cardName + the chara index when the page is missing/unreleased."""
    stock_id = rep.get("stockId") or 0
    variant = stock_id % STOCK_ID_VARIANT_MODULO
    page = chara_pages.get(rep.get("characterId"))
    if page:
        if variant > STOCK_ID_BASE_VARIANT:
            title = (page["data"].get(f"{suffix}{variant}") or {}).get("title") or page["title"]
        else:
            title = page["title"]
        return title, page["url"]
    return rep.get("cardName", ""), "/charas/"


def build_hero(stock_entries, SM, SEM, SMA, SUM, SkillTrans, English, SkillEffectTrans, StatusTrans, chara_pages):
    """stock_entries: list of CardMaster entries sharing a stockId."""
    rarities = [e.get("rarity") for e in stock_entries if e.get("rarity") is not None]
    rep = next((e for e in stock_entries if e.get("rarity") == HERO_MAX_RARITY), None)
    if rep is None:
        rep = max(stock_entries, key=lambda e: e.get("rarity", 0))

    provider = rep.get("skillProvider") or {}
    actives = provider.get("activeSkills") or []
    passives = provider.get("passiveSkills") or []
    base_actives = sorted((a for a in actives if a.get("skillUpgrade", 0) == 0),
                          key=lambda a: a.get("skillLearnNo", 0))
    bloom_actives = sorted((a for a in actives if a.get("skillUpgrade", 0) >= 1),
                           key=lambda a: a.get("skillLearnNo", 0))
    base_passives = [p for p in passives if p.get("skillUpgrade", 0) == 0]

    # authoritative before->after blooming map
    change_map = {}
    for q in rep.get("skillUpgradeQuestInfos") or []:
        for c in q.get("changeSkills") or []:
            change_map[c.get("beforeSkillId")] = c.get("afterSkillId")

    # in-combat ChangeActiveSkill transforms, bucketed by the active slot they
    # replace (entity-wide, over base skills), mirroring the wiki infobox.
    change_by_slot = collect_change_skills(
        [a["skillId"] for a in base_actives] + [p["skillId"] for p in base_passives],
        SM, SEM)

    base_skills = [skill_obj(f"active{i+1}", a["skillId"], SM, SEM, SMA, SkillTrans, English,
                             SkillEffectTrans, StatusTrans,
                             change_ids=change_by_slot.get(i + 1, ()))
                   for i, a in enumerate(base_actives)]
    base_skills += [skill_obj("passive", p["skillId"], SM, SEM, SMA, SkillTrans, English,
                              SkillEffectTrans, StatusTrans, hidden=True)
                    for p in base_passives]
    attribute_passives(base_skills)

    name, page = chara_name_and_page(rep, "h", chara_pages)
    has_tree = bool(rep.get("hasSkillUpgrade")) and (bool(change_map) or bool(bloom_actives))
    entity = {
        "stockId": rep.get("stockId"),
        "kind": "hero",
        "name": name,
        "page": page,
        "resourceName": rep.get("resourceName", ""),
        "rarity": rep.get("rarity"),
        "isMob": min(rarities) == 1 if rarities else False,
        "characterId": rep.get("characterId"),
        "hasSkillTree": has_tree,
        "skills": base_skills,
        "labels": aggregate(base_skills, "labels"),
        "statusIds": aggregate(base_skills, "statusIds"),
    }

    if has_tree:
        # resolve the maxed active skillId per slot (explicit change map, else
        # positional bloom pairing, else unchanged base)
        maxed_active_ids = []
        for i, a in enumerate(base_actives):
            bid = a["skillId"]
            mid = change_map.get(bid)
            if mid is None and i < len(bloom_actives):
                mid = bloom_actives[i]["skillId"]
            if mid is None:
                mid = bid
            maxed_active_ids.append(mid)
        # recompute the in-combat transforms over the maxed set: bloom skills can
        # introduce ChangeActiveSkill targets the base set did not have.
        maxed_change_by_slot = collect_change_skills(
            maxed_active_ids + [p["skillId"] for p in passives], SM, SEM)

        maxed = []
        for i, mid in enumerate(maxed_active_ids):
            so = skill_obj(f"active{i+1}", mid, SM, SEM, SMA, SkillTrans, English,
                           SkillEffectTrans, StatusTrans,
                           change_ids=maxed_change_by_slot.get(i + 1, ()), SUM=SUM)
            so["description"] = maxed_skill_description(mid, SM, SEM, SkillTrans, English, SUM)
            so["useView"] = maxed_use_view(mid, SM, SEM)
            maxed.append(so)
        # all passives (skill-tree unlocks included)
        for p in passives:
            pid = p["skillId"]
            so = skill_obj("passive", pid, SM, SEM, SMA, SkillTrans, English,
                           SkillEffectTrans, StatusTrans, hidden=True, SUM=SUM)
            so["description"] = maxed_skill_description(pid, SM, SEM, SkillTrans, English, SUM)
            so["useView"] = maxed_use_view(pid, SM, SEM)
            maxed.append(so)
        attribute_passives(maxed)
        entity["skillsMaxed"] = maxed
        entity["labelsMaxed"] = aggregate(maxed, "labels")
        entity["statusIdsMaxed"] = aggregate(maxed, "statusIds")

    return entity


def build_sidekick(stock_entries, SM, SEM, SMA, SkillTrans, English, SkillEffectTrans, StatusTrans, chara_pages):
    rarities = [e.get("rarity") for e in stock_entries if e.get("rarity") is not None]
    rep = next((e for e in stock_entries if e.get("levelZone") == SIDEKICK_MAX_LEVEL_ZONE), None)
    if rep is None:
        rep = max(stock_entries, key=lambda e: e.get("levelZone", 0))

    skills = []
    for sid in rep.get("skillIds") or []:
        skills.append(skill_obj("sidekick_active", sid, SM, SEM, SMA, SkillTrans, English,
                                SkillEffectTrans, StatusTrans))
    # Sidekick passive: equipmentSkills holds ascending tiers; the last entry of
    # the highest-level card is the maxed passive (mirrors generate_status_pages).
    equip = rep.get("equipmentSkills") or []
    if equip:
        skills.append(skill_obj("sidekick_passive", equip[-1], SM, SEM, SMA, SkillTrans, English,
                                SkillEffectTrans, StatusTrans))
    # Sidekick append-passive: a hidden passive (8xxxxxx id family) granted on top of
    # the equipment skill, never shown as its own row in-game. equipmentAppendSkills
    # holds ascending tiers like equipmentSkills; the last entry is the maxed append.
    append = rep.get("equipmentAppendSkills") or []
    if append:
        skills.append(skill_obj("sidekick_append", append[-1], SM, SEM, SMA, SkillTrans,
                                English, SkillEffectTrans, StatusTrans, hidden=True))
    attribute_passives(skills)

    name, page = chara_name_and_page(rep, "s", chara_pages)
    return {
        "stockId": rep.get("stockId"),
        "kind": "sidekick",
        "name": name,
        "page": page,
        "resourceName": rep.get("resourceName", ""),
        "rarity": rep.get("rarity"),
        "isMob": min(rarities) == 1 if rarities else False,
        "characterId": rep.get("characterId"),
        "hasSkillTree": False,
        "skills": skills,
        "labels": aggregate(skills, "labels"),
        "statusIds": aggregate(skills, "statusIds"),
    }


def group_by_stock(master):
    groups = OrderedDict()
    for entry in master.values():
        groups.setdefault(entry.get("stockId"), []).append(entry)
    return groups


def get_version():
    path = os.path.join("tools", "masterdata_ver.txt")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            v = f.read().strip()
        if v:
            return v
    # fall back to a hash over the input master files
    h = hashlib.sha1()
    for name in ("CardMaster.json", "SidekickMaster.json", "SkillMaster.json",
                 "SkillEffectMaster.json", "StatusMaster.json"):
        with open(os.path.join(DATA, name), "rb") as f:
            h.update(f.read())
    return h.hexdigest()[:12]


def finalize_entities(entities, named):
    """Drop unnamed (system/particle) status ids, remove fully-empty skill
    rows, and recompute per-entity label/status aggregates."""
    for e in entities:
        for key in ("skills", "skillsMaxed"):
            if key not in e:
                continue
            kept = []
            for s in e[key]:
                s["statusIds"] = [x for x in s["statusIds"] if str(x) in named]
                s["matchStatusIds"] = [x for x in s["matchStatusIds"] if str(x) in named]
                if s["name"] or s["description"] or s["labels"] or s["statusIds"]:
                    kept.append(s)
            e[key] = kept
        e["labels"] = aggregate(e["skills"], "labels")
        e["statusIds"] = aggregate(e["skills"], "statusIds")
        if "skillsMaxed" in e:
            e["labelsMaxed"] = aggregate(e["skillsMaxed"], "labels")
            e["statusIdsMaxed"] = aggregate(e["skillsMaxed"], "statusIds")


def main():
    CardMaster = load("CardMaster.json")
    SidekickMaster = load("SidekickMaster.json")
    SM = load("SkillMaster.json")
    SEM = load("SkillEffectMaster.json")
    SMA = load("StatusMaster.json")
    SUM = load("SkillUpgradeMaster.json")
    StatusTrans = load("Status.json", sub="translation")
    SkillEffectTrans = load("SkillEffect.json", sub="translation")
    SkillTrans = load("Skill.json", sub="translation")
    English = load_english()
    chara_pages = build_chara_pages(CHARAS)

    entities = []
    hero_groups = group_by_stock(CardMaster)
    for stock_id, group in hero_groups.items():
        entities.append(build_hero(group, SM, SEM, SMA, SUM, SkillTrans, English,
                                   SkillEffectTrans, StatusTrans, chara_pages))
    side_groups = group_by_stock(SidekickMaster)
    for stock_id, group in side_groups.items():
        entities.append(build_sidekick(group, SM, SEM, SMA, SkillTrans, English,
                                       SkillEffectTrans, StatusTrans, chara_pages))

    # Many StatusMaster entries are internal system/particle placeholders with
    # empty names. They are useless for the "Has status" autocomplete and only
    # bloat the index, so keep only statuses that resolve to a non-empty name.
    def status_name(sid):
        return (StatusTrans.get(str(sid), {}).get("name")
                or SMA.get(str(sid), {}).get("statusName", "")).strip()
    named = {str(sid) for sid in SMA if status_name(sid)}
    finalize_entities(entities, named)

    # status dictionary for autocomplete / "Has status" filter, restricted to
    # named statuses actually referenced by an indexed skill.
    referenced = set()
    for e in entities:
        referenced.update(e.get("statusIds", []))
        referenced.update(e.get("statusIdsMaxed", []))
    statuses = {}
    for sid in sorted(referenced):
        master = SMA.get(str(sid), {})
        statuses[str(sid)] = {
            "name": status_name(sid),
            "icon": StatusTrans.get(str(sid), {}).get("icon", ""),
            "type": status_type(master),
        }

    version = f"{get_version()}-{INDEX_SCHEMA_REV}"
    index = {
        "version": version,
        "categories": CATEGORIES,
        "statuses": statuses,
        "entities": entities,
    }

    os.makedirs(API, exist_ok=True)
    with open(os.path.join(API, "skill-index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(API, "skill-index-version.json"), "w", encoding="utf-8") as f:
        json.dump({"version": version}, f, ensure_ascii=False)

    # ----- report -----
    heroes = [e for e in entities if e["kind"] == "hero"]
    sidekicks = [e for e in entities if e["kind"] == "sidekick"]
    print(f"version: {version}")
    print(f"entities: {len(entities)} "
          f"(heroes {len(heroes)}, sidekicks {len(sidekicks)})")
    print(f"  hero mobs: {sum(1 for e in heroes if e['isMob'])}, "
          f"sidekick mobs: {sum(1 for e in sidekicks if e['isMob'])}")
    print(f"  heroes with skill tree: {sum(1 for e in heroes if e['hasSkillTree'])}")
    print(f"statuses referenced: {len(statuses)}")
    if unmapped:
        print(f"\nUNMAPPED CLASSES ({len(unmapped)}):")
        for cls, n in unmapped.most_common():
            print(f"  {cls}: {n}")
    else:
        print("\nno unmapped effect classes")
    if unmapped_target_flags:
        print(f"\nUNMAPPED TARGET FLAGS ({len(unmapped_target_flags)}) -- "
              f"damage skills with no attack-range label, add to TARGET_FLAGS_*:")
        for tf, n in unmapped_target_flags.most_common():
            print(f"  targetFlag {tf}: {n} skill effect(s)")
    if missing_upgrade_nodes:
        print(f"\nMISSING SKILL-UPGRADE NODES ({len(missing_upgrade_nodes)}) -- "
              f"gated effects kept as terminal (recall-safe); check masterdata:")
        for eid, n in missing_upgrade_nodes.most_common():
            print(f"  node {eid}: {n} effect(s)")
    if liquid_template_statuses:
        print(f"\nSTATUS IDs WITH LIQUID TEMPLATES (desc skipped, {len(liquid_template_statuses)} status IDs):")
        for sid, n in liquid_template_statuses.most_common():
            sname = StatusTrans.get(sid, {}).get("name") or SMA.get(sid, {}).get("statusName", "?")
            print(f"  {sid} ({sname}): {n} effect(s)")


if __name__ == "__main__":
    main()
