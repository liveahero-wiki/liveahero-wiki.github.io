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
# stale cache.
INDEX_SCHEMA_REV = "r12"


# --- Undocumented game-data enums / magic numbers ---------------------------
# These bare integers come straight from the masterdata and have no symbolic
# names in the source dumps. Centralized here so each meaning is discoverable in
# one place and a future enum change is a single edit.

# SkillMaster.targetFlag: the game's skill-targeting enum, from _plugins/skill.rb
# skill_target. A damage-dealing skill gets an attack-range label from which side
# it hits: enemies -> single/all attack, allies -> "attack allies". 0 (self) and
# 5 (event bonus unit) get no attack-range label. Multi-hit is structural, not
# class-based: it comes from a skill having more than one distinct
# sequenceGroupId among its damage-dealing SkillMaster.effects[] rows (see
# label_skill). The *MultipleAttack classes are single-instance damage-scaling
# effects (-> damage.scaling), not repeated hits.
TARGET_FLAGS_ENEMY_ALL = {4, 16, 27}                # all enemies / all except target
TARGET_FLAGS_ENEMY_SINGLE = {2, 7, 29}              # single / random enemy
TARGET_FLAGS_ALLY = {1, 3, 6, 9, 11, 12, 13, 14}    # any ally-directed damage
TARGET_FLAGS_NO_RANGE = {0, 5}                       # self / event bonus unit

# effectTarget -> target-sublabel suffix for the labels in
# TARGET_SUBLABEL_PARENTS. A None suffix means "deliberately no sublabel" (not
# reported as unmapped); values absent from this map are counted in
# unmapped_sublabel_targets and reported at the end of a run. Verified beyond
# _plugins/skill.rb's enum from JP descriptions: 21 = enemies adjacent to
# target, 22 = allies adjacent to target, 24 = allies adjacent to self,
# 29 = single enemy.
TARGET_TO_SUBLABEL = {
    0: "self",
    1: "ally-single",
    2: "enemy-single",
    3: "ally-all",
    4: "enemy-all",
    5: None,  # event bonus unit
    6: "ally-other",    # random ally
    7: "enemy-other",   # random enemy
    9: "ally-other",    # random ally
    11: "ally-other",   # lowest-HP ally
    12: "ally-other",   # each ally
    13: "ally-other",   # highest-ATK ally
    14: "ally-other",   # all allies except self
    16: "enemy-other",  # all enemies except target
    21: "enemy-adjacent",
    22: "ally-adjacent",
    24: "ally-adjacent",
    29: "enemy-single",
}

# Labels that get a "/<target-sublabel>" composite key in matchLabels so users
# can filter e.g. "extra action to self" or "damage up to all allies".
TARGET_SUBLABEL_PARENTS = {
    "skillctl.extra_action",
    "skillctl.extra_activation",
    "damage.up",
    "damage.down",
    "defense.up",
    "defense.down",
    "vp.gain",
    "vp.loss",
    "vp.costdown",
    "vp.costup",
    "heal.heal",
    "spd.up",
    "spd.down",
}

# Classes whose inner parameter.target is a target enum for the non-damage side
# of the effect (e.g. AbsorbDamage heals parameter.target while the damage goes
# to the row's effectTarget). For other classes parameter.target can be a
# skillId, so it must never be read generically.
PARAM_TARGET_CLASSES = {"AbsorbDamage"}

# damage.scaling classes -> what the damage scales by. Classes here get a
# "damage.scaling/<suffix>" composite key.
SCALING_CLASS_TO_SUBLABEL = {
    "HealthAttack": "hp",
    "HealthMultipleAttack": "hp",
    "HighestHealthMultipleAttack": "hp",
    "ComboMultipleAttack": "combo",
    "HighestComboMultipleAttack": "combo",
    "NowViewDamage": "view",
    "ViewPowerMultipleAttack": "view",
    "HighestViewPowerMultipleAttack": "view",
    "TimingFixHighestViewPowerMultipleAttack": "view",
    "SpdDifferenceMultipleAttack": "spd",
    "StatusNumberMultipleAttack": "status-count",
    "StatusTurnDamage": "status-turns",
    "StatusTurnMultipleAttack": "status-turns",
}

# damage.scaling classes whose scaling stat is selected by parameter.paramType.
# The paramType enum (observed 0-3) is still undocumented, so every occurrence
# is reported via unmapped_scaling_sources until the map below is filled in.
SCALING_PARAMTYPE_CLASSES = {
    "DamageMultipleAdjust",
    "OtherParamMultipleAttack",
    "OtherParamAddAttack",
    "HighestOtherParamAddAttack",
}
SCALING_PARAMTYPE_TO_SUBLABEL = {}

# damage.scaling classes knowingly left without a scaling sublabel (so they
# don't spam the unmapped report).
SCALING_NO_SUBLABEL = {
    "HighestBarrierMultipleAttack"  # scales by barrier
}

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

# CardMaster/SidekickMaster.role -> filter key. Role 0 (no role) maps to None
# and is omitted from the entity record. Mirrors the map in _plugins/skill.rb.
ROLE_MAP = {
    1: "attack",
    2: "defense",
    3: "assistance",
    4: "debuff",
    5: "speed",
    6: "vp_gain",
    7: "heal",
    99: "special",
}


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
        {"key": "attack.counter", "label": "Counterattack"},
        {"key": "attack.ally", "label": "Attack allies"},
        {"key": "attack.penetrate", "label": "Penetrating damage"},
    ]},
    {"key": "damage", "label": "Damage", "labels": [
        {"key": "damage.up", "label": "Increase damage"},
        {"key": "damage.down", "label": "Decrease damage"},
        {"key": "damage.scaling", "label": "Scaling damage"},
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
        {"key": "vp.loss", "label": "Reduce VP gain"},
        {"key": "vp.costdown", "label": "View cost down"},
        {"key": "vp.costup", "label": "View cost up"},
    ]},
    {"key": "interf", "label": "Skill interference", "labels": [
        {"key": "interf.debuff_remove", "label": "Debuff removal"},
        {"key": "interf.buff_remove", "label": "Buff removal"},
        {"key": "interf.debuff_resist", "label": "Debuff resistance"},
        {"key": "interf.extend", "label": "Buff / debuff extension"},
        {"key": "interf.silence", "label": "Skill lock"},
    ]},
    {"key": "defense", "label": "Defense / Survival", "labels": [
        {"key": "defense.up", "label": "Increase defense"},
        {"key": "defense.down", "label": "Decrease defense"},
        {"key": "defense.barrier", "label": "Barrier"},
        {"key": "defense.provoke", "label": "Provoke"},
        {"key": "defense.aggregation", "label": "Damage aggregation"},
        {"key": "defense.target", "label": "Attack focus"},
        {"key": "defense.stealth", "label": "Stealth"},
        {"key": "defense.hp", "label": "Max HP up"},
        {"key": "defense.dodge", "label": "Evasion / Dodge"},
    ]},
    {"key": "skillctl", "label": "Skill control", "labels": [
        {"key": "skillctl.change", "label": "Skill change"},
        {"key": "skillctl.extra_action", "label": "Additional actions"},
        {"key": "skillctl.extra_activation", "label": "Additional activation"},
        {"key": "skillctl.auto", "label": "Auto-action control"},
        {"key": "skillctl.ratechange", "label": "Skill rate change"},
    ]},
    {"key": "acq", "label": "Increased Acquisition", "labels": [
        {"key": "acq.coin", "label": "Coin boost"},
        {"key": "acq.exp", "label": "EXP boost"},
        {"key": "acq.relation", "label": "Relation boost"},
    ]}
]

# Sublabel display definitions, attached below to every label that supports
# them. The UI receives fully-formed composite keys ("<parent>/<suffix>") so it
# never concatenates strings itself.
TARGET_SUBLABEL_DEFS = [
    ("self", "Self"),
    ("enemy-single", "Single enemy"),
    ("enemy-adjacent", "Adjacent enemies"),
    ("enemy-all", "All enemies"),
    ("enemy-other", "Other enemy range"),
    ("ally-single", "Single ally"),
    ("ally-adjacent", "Adjacent allies"),
    ("ally-all", "All allies"),
    ("ally-other", "Other ally range"),
]
SCALING_SUBLABEL_DEFS = [
    ("hp", "HP"),
    ("combo", "Combo"),
    ("view", "View"),
    ("spd", "SPD"),
    ("status-count", "# status"),
    ("status-turns", "# status turn"),
]

for _cat in CATEGORIES:
    for _lab in _cat["labels"]:
        if _lab["key"] in TARGET_SUBLABEL_PARENTS:
            _defs = TARGET_SUBLABEL_DEFS
        elif _lab["key"] == "damage.scaling":
            _defs = SCALING_SUBLABEL_DEFS
        else:
            continue
        _lab["sublabels"] = [
            {"key": f'{_lab["key"]}/{suffix}', "label": name}
            for suffix, name in _defs
        ]

# Effect classes that deal damage -> the skill counts as an "attack" and gets
# a target-based label (single / all / random) from its targetFlag.
DAMAGE_CLASSES = {
    "Damage",
    "CountDamage",
    "ComboDamage",
    "HealthDamage",
    "HPDependentDamage",
    "SpdDeferenceDamage",
    "StatusNumDamage",
    "ElementPenetrateDamage",
    "Penetration",
    "NowViewDamage",
    "DamageMultipleAdjust",
    "StatusTurnDamage",
    "AbsorbDamage", # Damage then heal the damage amount
    "AddMultDamage",
}

# Direct effect-class -> label-key(s) mapping. Classes needing value-sign or
# other context (ChangeAgi, ChangeView, target/dot flags) are handled in code.
CLASS_TO_LABELS = {
    # penetrate / counter / extra action / pursuit
    "Penetration": ["attack.penetrate"],
    "ElementPenetrateDamage": ["attack.penetrate"],
    "HidePenetration": ["attack.penetrate"],
    "CounterAttack": ["attack.counter"],
    "CounterAttackRecalculateTarget": [],
    "MoreTurn": ["skillctl.extra_action"],
    "MoreTurnExecBeforeSkill": ["skillctl.extra_action"],
    "ReleaseWait": [],
    "OwnAttack": ["skillctl.extra_activation"],
    "RandomTeamAttack": ["skillctl.extra_activation"],
    "TeamAttackEnemy": ["skillctl.extra_activation"],
    "TeamAttackRandomEnemy": ["skillctl.extra_activation"],

    # Damage cap
    "DamageLimit": [],
    "NowHPDependDamageLimit": [], # cap damage to percentage of HP

    "DamageCount": [],

    # Damage scaling
    "AddMultDamage": ["damage.up"],
    "DamageMultipleAdjust": ["damage.scaling"],
    "NowViewDamage": ["damage.scaling"],
    "HealthAttack": ["damage.scaling"],
    "HealthMultipleAttack": ["damage.scaling"],
    "HighestHealthMultipleAttack": ["damage.scaling"],
    "ComboMultipleAttack": ["damage.scaling"],
    "HighestComboMultipleAttack": ["damage.scaling"],
    "SpdDifferenceMultipleAttack": ["damage.scaling"],
    "StatusNumberMultipleAttack": ["damage.scaling"],
    "ViewPowerMultipleAttack": ["damage.scaling"],
    "HighestBarrierMultipleAttack": ["damage.scaling"],
    "TimingFixHighestViewPowerMultipleAttack": ["damage.scaling"],
    "HighestViewPowerMultipleAttack": ["damage.scaling"],
    "StatusTurnDamage": ["damage.scaling"],
    "StatusTurnMultipleAttack": ["damage.scaling"],
    "OtherParamMultipleAttack": ["damage.scaling"],
    "OtherParamAddAttack": ["damage.scaling"],
    "HighestOtherParamAddAttack": ["damage.scaling"], # look at parameter.paramType to determine it scales based on what param

    # DoT spread / amplification
    "SpreadDotDamage": ["damage.dot"],
    "MultipleDotDamageDefence": ["damage.dot"],

    # spd
    "TurnBaseChangeAgi": ["spd.other"], 
    "Wait": ["spd.other"],

    # heal
    "Heal": ["heal.heal"], 
    "OneTimeHeal": ["heal.heal"], 
    "HealthHeal": ["heal.heal"],
    "HealCount": ["heal.heal"], 
    "HealMultipleAttack": ["heal.change"],
    "HealExecAllCharacterActionEnd": ["heal.heal"],
    "HealExecDefenced": ["heal.heal"],
    "AddMultHeal": ["heal.change"],
    "HealMultipleDefence": ["heal.change"],

    # combo
    "ComboPlus": ["combo.up"], 
    "AddPlusCombo": ["combo.up"],

    # view
    # ChangeView flips on parameter.value -> VALUE_SIGN_RULES
    "SpdDeferenceChangeView": ["vp.gain"],
    "ChangeBaseView": ["vp.gain"],
    "GetViewDamage": ["vp.gain"],
    "RemoveGainViewStock": ["vp.gain"],
    # MultipleBaseView flips on parameter.value -> VALUE_SIGN_RULES
    "ViewCount": [], 
    "ViewChangeHp": ["vp.gain"],
    # NeedViewValueChange flips on parameter.value -> VALUE_SIGN_RULES

    "FixView": ["vp.costdown"], 
    "ChangeSkillBaseView": ["vp.costdown"],
    "ChangeViewCoefficient": ["vp.costdown"],

    # interference
    "Cure": ["interf.debuff_remove"],
    "RemoveBuff": ["interf.buff_remove"], 
    "RemoveSystemEffect": [],
    "RegistDebuff": ["interf.debuff_resist"], 
    "RegistDeBuffExecDeBuffed": ["interf.debuff_resist"],
    "SkillTurnExtension": ["interf.extend"],
    "SkillTurnExtensionByStatus": ["interf.extend"],
    "DamageDependentParamDifferenceTurnExtension": ["interf.extend"],
    "Silence": ["interf.silence"], 
    "SkillSkip": ["interf.silence"],

    # defense / survival
    "Barrier": ["defense.barrier"], 
    "OtherParamBarrier": ["defense.barrier"],
    "BarrierExtension": ["defense.barrier", "interf.extend"],
    "AbsorbDamage": ["heal.heal"],
    "Cover": ["defense.provoke"], 
    "Provocation": ["defense.provoke"],
    "Induction": ["defense.target"],
    "TargetMark": ["defense.target"],
    "LowestAgilityTargetMark": ["defense.target"],
    "Aggregation": ["defense.aggregation"],
    "Hide": ["defense.stealth"],
    #"Ressurection": ["defense.revive"], 
    #"RessurectOrHeal": ["defense.revive", "heal.heal"],

    # skill control
    "ChangeActiveSkill": ["skillctl.change"],
    "DecideAutoSkill": ["skillctl.auto"], 
    "ForceAuto": ["skillctl.auto"],
    "TargetReversal": ["skillctl.auto"],
    "DecideUniqueByStatusPassiveBattleSkillEffect": ["skillctl.auto"],
    "ChangeSkillProve": ["skillctl.ratechange"],
    "HighestChangeSkillProb": ["skillctl.ratechange"],

    # acquisition
    "SalesBonusCheat": ["acq.coin"], 
    "IncreaseLAH": ["acq.coin"],
    "IncreaseExp": ["acq.exp"], 
    "IncreaseRelation": ["acq.relation"],
    
    # field
    "RemoveFieldEffect": [], 
    
    # stat buffs (max-HP up; survivability)
    "MultipleHp": ["defense.hp"],
    # evasion / dodge
    "SpdRateEmitDefence": ["defense.dodge"],
}

# Classes we knowingly do not surface as labels (pure mechanics / display).
IGNORED_CLASSES = {
    "ChangeHp", "Critical", "IgnoreElement", "Burst", "Summon", "ItemEffectMark",
    "ParticleStatus", "PassiveBattleSkillEffect", "ForceExecDotDamage",
    "ChangeHpExecBeforeSkill",
    "NowViewTurn",       # Victom's internal VP-threshold turn counter (system status)
    "UseInvokerBaseAtk", # internal damage-calc flag for Akashi's Armament
}

unmapped = Counter()
unmapped_target_flags = Counter()  # damage skills whose targetFlag has no range label
unmapped_sublabel_targets = Counter()  # effectTarget with no target-sublabel mapping
unmapped_scaling_sources = Counter()  # (class, paramType) scaling with no sublabel
missing_upgrade_nodes = Counter()  # gated node ids absent from SkillUpgradeMaster
suspicious_view_costs = []  # (skillId, total) where summed maxed View cost < 0
liquid_template_statuses = Counter()  # status IDs whose base desc contains Liquid {{ }}


def status_type(status_master_entry):
    t = status_master_entry.get("statusType")
    return STATUS_TYPE_MAP.get(t, STATUS_TYPE_DEFAULT)


def resolve_status_name(sid, StatusTrans, SMA):
    """A status's display name: Status.json translation -> raw StatusMaster."""
    return (StatusTrans.get(str(sid), {}).get("name")
            or SMA.get(str(sid), {}).get("statusName", ""))


# Ordered substring fallback for class-name variants not in CLASS_TO_LABELS.
# FIRST MATCH WINS, so specific patterns must precede generic ones (e.g.
# Heal-not-Health and DamageLimit before the bare "Damage" rule). Each entry is
# (predicate(class_name) -> bool, labels, deals_damage). CLASS_TO_LABELS and
# DAMAGE_CLASSES (checked before this table in classify) still take precedence.
SUBSTRING_RULES = [
    #(lambda c: "AddPlusCombo" in c, {"combo.up"}, False),
    #(lambda c: "TargetMark" in c, {"defense.provoke"}, False),
    #(lambda c: "TurnExtension" in c, {"interf.extend"}, False),
    #(lambda c: "NeedView" in c, {"vp.costdown"}, False),
    #(lambda c: "Heal" in c and "Health" not in c, {"heal.heal"}, False),
    #(lambda c: "DamageLimit" in c, {"damage.down"}, False),
    #(lambda c: "Defence" in c, {"damage.down"}, False),
    #(lambda c: "DotDamage" in c or "ElapseTurnDamage" in c, {"damage.dot"}, False),
    #(lambda c: "Damage" in c, set(), True),
    #(lambda c: c.endswith("Attack") or c.endswith("Atk"), set(), True),
    #(lambda c: "View" in c, {"vp.gain"}, False),
]


# Classes whose label depends on the sign of parameter.value (a percentage
# multiplier for the *Multiple* families: value/100 x, so 100 is a no-op). Each
# entry is (label if value > threshold, label if value < threshold, label if
# value == threshold, threshold); a None label means "no label" (a value at the
# boundary is a no-op / marker, e.g. a x1.0 multiplier or a Provoke status). The
# Japanese descriptions confirm the direction: MultipleDefence value>100 is
# "DEFダウン" (target takes MORE damage -> damage.up), value<100 is "DEFアップ"
# (defensive -> damage.down). Checked before CLASS_TO_LABELS in classify.
VALUE_SIGN_RULES = {
    "ChangeAgi":               ("spd.up", "spd.down", "spd.other", 0),
    "OtherParamChangeAgi":     ("spd.up", "spd.down", "spd.other", 0),

    "MultipleAttack":          ("damage.up", "damage.down", None, 100),
    "HighestMultipleAttack":   ("damage.up", "damage.down", None, 100),
    "TurnBaseMultipleAttack":  ("damage.up", "damage.down", None, 100),
    "PersistenceIconChangeMultipleAttack": ("damage.up", "damage.down", None, 100),
    "BeforeSkillTriggerMultipleAttack": ("damage.up", "damage.down", None, 0),

    "MultipleBaseView":        ("vp.gain", "vp.loss", None, 100),
    "ChangeView":              ("vp.gain", "vp.loss", None, 0),
    "RateChangeView":          ("vp.gain", "vp.loss", None, 0),
    "NeedViewValueChange":     ("vp.costup", "vp.costdown", None, 0),
    "NeedViewChange":          ("vp.costup", "vp.costdown", None, 100),
    "HighestNeedViewChange":   ("vp.costup", "vp.costdown", None, 100),
    "NotDamageSkillNeedViewChange": ("vp.costup", "vp.costdown", None, 100),
    "NotDamageSkillNeedViewValueChange": ("vp.costup", "vp.costdown", None, 100),

    "MultipleDefence":         ("defense.down", "defense.up", None, 100),
    "TurnBaseMultipleDefence": ("defense.down", "defense.up", None, 100),
    "HighestMultipleDefence": ("defense.down", "defense.up", None, 100),
    "PersistenceIconChangeMultipleDefence": ("defense.down", "defense.up", None, 100),
}

MAXMULT_SIGN_RULES = {
    "ComboMultipleDefence": ("defense.down", "defense.up", None, 100),
    "HighestMultipleDefence": ("defense.down", "defense.up", None, 100),
    "HighestViewPowerMultipleDefence": ("defense.down", "defense.up", None, 100),
}

STATUSMULT_SIGN_RULES = {
    "HighestStatusNumberMultipleDefence": ("defense.down", "defense.up", None, 0),
}

def _is_ignored_class(cls):
    """Knowingly ignored mechanics / placeholders / handled-elsewhere classes."""
    return (cls in IGNORED_CLASSES or "NoneEffect" in cls or "Critical" in cls
            or cls.startswith("Regist")
            or "CopyBuff" in cls
            or cls.endswith("Status"))


def _value_sign_classifer(cls, inner, rules, key):
    gt, lt, eq, thr = rules[cls]
    v = (inner.get("parameter") or {}).get(key, thr)
    label = gt if v > thr else lt if v < thr else eq
    return ({label} if label else set()), cls in DAMAGE_CLASSES, True

def classify(cls, inner):
    """Map a single effect class to label keys.

    Returns (labels:set, deals_damage:bool, recognized:bool). Precedence, in
    order: the value-sign table (classes whose label flips on parameter.value);
    then the explicit CLASS_TO_LABELS map and DAMAGE_CLASSES set; then the
    name-based special cases; then the ordered SUBSTRING_RULES table (first match
    wins) which covers the long tail of mechanical variants so new classes
    auto-map; finally the ignored set. Anything left is reported.
    """
    if cls in VALUE_SIGN_RULES:
        return _value_sign_classifer(cls, inner, VALUE_SIGN_RULES, "value")
    if cls in MAXMULT_SIGN_RULES:
        return _value_sign_classifer(cls, inner, MAXMULT_SIGN_RULES, "maxMult")
    if cls in STATUSMULT_SIGN_RULES:
        return _value_sign_classifer(cls, inner, STATUSMULT_SIGN_RULES, "statusMult")

    if cls in CLASS_TO_LABELS:
        return set(CLASS_TO_LABELS[cls]), cls in DAMAGE_CLASSES, True
    if cls in DAMAGE_CLASSES:
        return set(), True, True
    if cls.startswith("Aim") or "DecideAutoSkill" in cls:
        return {"skillctl.auto"}, False, True
    for predicate, labels, deals_damage in SUBSTRING_RULES:
        if predicate(cls):
            return set(labels), deals_damage, True
    if _is_ignored_class(cls):
        return set(), False, True
    return set(), False, False


def sublabels_for(labels, cls, inner, effect_target):
    """Composite "<parent>/<suffix>" keys for one inner effect's labels.

    Target sublabels come from the row's effectTarget, except for
    PARAM_TARGET_CLASSES where the non-damage side targets parameter.target
    (never fall back to effectTarget there -- that is the damage side).
    damage.scaling sublabels come from the class name (SCALING_CLASS_TO_SUBLABEL)
    or, for the OtherParam* family, parameter.paramType. Unknown targets and
    scaling sources yield no sublabel (the parent label still applies) and are
    counted for the end-of-run report.
    """
    out = set()
    tgt = effect_target
    if cls in PARAM_TARGET_CLASSES:
        tgt = (inner.get("parameter") or {}).get("target")
    for lab in labels & TARGET_SUBLABEL_PARENTS:
        if tgt in TARGET_TO_SUBLABEL:
            suffix = TARGET_TO_SUBLABEL[tgt]
            if suffix:
                out.add(f"{lab}/{suffix}")
        else:
            unmapped_sublabel_targets[tgt] += 1
    if "damage.scaling" in labels:
        if cls in SCALING_CLASS_TO_SUBLABEL:
            out.add(f"damage.scaling/{SCALING_CLASS_TO_SUBLABEL[cls]}")
        elif cls in SCALING_PARAMTYPE_CLASSES:
            pt = (inner.get("parameter") or {}).get("paramType")
            if pt in SCALING_PARAMTYPE_TO_SUBLABEL:
                out.add(f"damage.scaling/{SCALING_PARAMTYPE_TO_SUBLABEL[pt]}")
            else:
                unmapped_scaling_sources[(cls, pt)] += 1
        elif cls not in SCALING_NO_SUBLABEL:
            unmapped_scaling_sources[(cls, None)] += 1
    return out


def label_skill(skill_id, SM, SEM, SMA, visited):
    """Return (labels:set, match_extras:set, status_ids:set) for a skill,
    folding in any ChangeActiveSkill target skills and granted passive skills
    (recursively). match_extras holds only composite "<parent>/<sublabel>"
    keys; they are merged into matchLabels (filtering) but kept out of the
    display labels."""
    labels, match_extras, status_ids = set(), set(), set()
    sid = str(skill_id)
    if sid in visited:
        return labels, match_extras, status_ids
    visited.add(sid)
    skill = SM.get(sid)
    if not skill:
        return labels, match_extras, status_ids

    description = skill.get("description") or ""
    damage_group_ids = set()

    for eff in skill.get("effects", []) or []:
        sem = SEM.get(str(eff.get("skillEffectId")))
        effectTarget = eff.get("effectTarget")
        if not sem:
            continue
        sej = sem.get("skillEffectJson", {})
        if sej.get("statusId"):
            status_ids.add(sej["statusId"])
        if sej.get("isDotDamage"):
            labels.add("damage.dot")
        if sej.get("isFieldEffect"):
            labels.add("field.field")
        row_deals_damage = False
        for inner in sej.get("effects", []):
            cls = inner.get("class", "")
            l, deals_damage, recognized = classify(cls, inner)
            labels.update(l)
            # Use this inner effect's labels `l`, not the accumulated set, so a
            # later row's target can't re-qualify an earlier row's label.
            match_extras.update(sublabels_for(l, cls, inner, effectTarget))

            if deals_damage:
                row_deals_damage = True
                if effectTarget in TARGET_FLAGS_ENEMY_ALL:
                    labels.add("attack.all")
                elif effectTarget in TARGET_FLAGS_ENEMY_SINGLE:
                    labels.add("attack.single")
                elif effectTarget in TARGET_FLAGS_ALLY:
                    labels.add("attack.ally")
                elif effectTarget not in TARGET_FLAGS_NO_RANGE:
                    unmapped_target_flags[effectTarget] += 1
                if "隣" in description:  # adjacent-target wording
                    labels.add("attack.special")

            if not recognized:
                unmapped[cls] += 1
            # fold in skill-change targets
            if cls == "ChangeActiveSkill":
                tgt = (inner.get("parameter") or {}).get("skillId")
                if tgt:
                    l2, m2, s2 = label_skill(tgt, SM, SEM, SMA, visited)
                    labels.update(l2)
                    match_extras.update(m2)
                    status_ids.update(s2)
        if row_deals_damage:
            # Rows sharing a sequenceGroupId are alternate power tiers of the
            # same hit (mutually exclusive); rows missing it collapse into one
            # shared bucket (dict key None). Distinct groups are concurrent
            # hits within a single skill use -> multi-hit.
            damage_group_ids.add(eff.get("sequenceGroupId"))

    if len(damage_group_ids) > 1:
        labels.add("attack.multi")

    # granted passive skills attached to this skill
    for pid in skill.get("appendPassiveSkillIds") or []:
        l2, m2, s2 = label_skill(pid, SM, SEM, SMA, visited)
        labels.update(l2)
        match_extras.update(m2)
        status_ids.update(s2)

    return labels, match_extras, status_ids


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
    not modeled and leave the cost at base.

    The additive assumption can't be proven statically; a total that goes
    negative means a replacement-style tier was almost certainly double-counted,
    so such skills are recorded for the run report rather than emitted silently."""
    skill = SM.get(str(skill_id), {})
    total = skill.get("useView", 0)
    for eff in skill.get("effects") or []:
        sej = SEM.get(str(eff.get("skillEffectId")), {}).get("skillEffectJson", {})
        for inner in sej.get("effects", []):
            if inner.get("class") == "ChangeSkillBaseView":
                total += (inner.get("parameter") or {}).get("value", 0)
    if total < 0:
        suspicious_view_costs.append((skill_id, total))
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
                or resolve_status_name(sid, StatusTrans, SMA))
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


def skill_obj(slot, skill_id, SM, SEM, SMA, SkillTrans, English, SkillEffectTrans, StatusTrans, change_ids=(), hidden=False, SUM=None, maxed=False):
    labels, match_extras, status_ids = label_skill(skill_id, SM, SEM, SMA, set())
    skill = SM.get(str(skill_id), {})
    # maxed (skill-tree fully bloomed) rows assemble their description from the
    # terminal-tier condition lines and sum the View-cost deltas; base rows use
    # the top-level description and raw useView.
    if maxed:
        description = maxed_skill_description(skill_id, SM, SEM, SkillTrans, English, SUM)
        use_view = maxed_use_view(skill_id, SM, SEM)
    else:
        description = skill_description(skill_id, SM, SkillTrans, English)
        use_view = skill.get("useView", 0)
    return {
        "slot": slot,
        "skillId": skill_id,
        # Hidden passives (hero passive skills, sidekick append-passives) are never
        # shown as their own row in-game; their effects are described inside the
        # visible skills' <wiki-passive> blocks. They are kept in the index (for the
        # full-kit dialog) but the UI hides their rows and attributes their labels.
        "hidden": hidden,
        "name": skill_name(skill_id, SM, SkillTrans, English),
        "description": description,
        "useView": use_view,
        "labels": sorted(labels),
        "statusIds": sorted(status_ids),
        # match* default to own labels/statuses (plus composite sublabel keys,
        # which are filter-only); attribute_passives() folds hidden passives'
        # passive-only labels into the visible <wiki-passive> carrier(s).
        "matchLabels": sorted(labels | match_extras),
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
    # Union matchLabels (== labels + own composite sublabel keys at this point),
    # not labels, so hidden passives' sublabels flow to the carriers too.
    vis_l = set().union(*(s["matchLabels"] for s in visible))
    vis_s = set().union(*(s["matchStatusIds"] for s in visible))
    hid_l = set().union(*(s["matchLabels"] for s in hidden))
    hid_s = set().union(*(s["matchStatusIds"] for s in hidden))
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


def make_entity(rep, stock_entries, kind, suffix, skills, chara_pages, has_tree=False):
    """Assemble the entity record shared by heroes and sidekicks. isMob is true
    when the stock group includes a rarity-1 card. labels/statusIds aggregate the
    given (base) skills; callers add the *Maxed variants afterwards."""
    rarities = [e.get("rarity") for e in stock_entries if e.get("rarity") is not None]
    name, page = chara_name_and_page(rep, suffix, chara_pages)
    return {
        "stockId": rep.get("stockId"),
        "kind": kind,
        "name": name,
        "page": page,
        "resourceName": rep.get("resourceName", ""),
        "rarity": rep.get("rarity"),
        "isMob": min(rarities) == 1 if rarities else False,
        "characterId": rep.get("characterId"),
        "hasSkillTree": has_tree,
        "role": ROLE_MAP.get(rep.get("role")),
        "skills": skills,
        "labels": aggregate(skills, "labels"),
        "statusIds": aggregate(skills, "statusIds"),
    }


def build_hero(stock_entries, SM, SEM, SMA, SUM, SkillTrans, English, SkillEffectTrans, StatusTrans, chara_pages):
    """stock_entries: list of CardMaster entries sharing a stockId."""
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

    has_tree = bool(rep.get("hasSkillUpgrade")) and (bool(change_map) or bool(bloom_actives))
    entity = make_entity(rep, stock_entries, "hero", "h", base_skills, chara_pages, has_tree)

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
            maxed.append(skill_obj(f"active{i+1}", mid, SM, SEM, SMA, SkillTrans, English,
                                   SkillEffectTrans, StatusTrans,
                                   change_ids=maxed_change_by_slot.get(i + 1, ()),
                                   SUM=SUM, maxed=True))
        # all passives (skill-tree unlocks included)
        for p in passives:
            maxed.append(skill_obj("passive", p["skillId"], SM, SEM, SMA, SkillTrans, English,
                                   SkillEffectTrans, StatusTrans, hidden=True,
                                   SUM=SUM, maxed=True))
        attribute_passives(maxed)
        entity["skillsMaxed"] = maxed
        entity["labelsMaxed"] = aggregate(maxed, "labels")
        entity["statusIdsMaxed"] = aggregate(maxed, "statusIds")

    return entity


def build_sidekick(stock_entries, SM, SEM, SMA, SkillTrans, English, SkillEffectTrans, StatusTrans, chara_pages):
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

    return make_entity(rep, stock_entries, "sidekick", "s", skills, chara_pages)


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


def load_all():
    """Load every master/translation file the index needs into one dict, keyed
    by the short names the build_* helpers use. Shared with tools/audit_skill_effects.py
    so the auditor walks the exact same masterdata the index is built from."""
    return {
        "CardMaster": load("CardMaster.json"),
        "SidekickMaster": load("SidekickMaster.json"),
        "SM": load("SkillMaster.json"),
        "SEM": load("SkillEffectMaster.json"),
        "SMA": load("StatusMaster.json"),
        "SUM": load("SkillUpgradeMaster.json"),
        "StatusTrans": load("Status.json", sub="translation"),
        "SkillEffectTrans": load("SkillEffect.json", sub="translation"),
        "SkillTrans": load("Skill.json", sub="translation"),
        "English": load_english(),
        "chara_pages": build_chara_pages(CHARAS),
    }


def build_entities(m):
    """Walk CardMaster/SidekickMaster into the reachable hero/sidekick entity
    records (before status pruning). `m` is a load_all() dict. Returns the list."""
    entities = []
    for stock_id, group in group_by_stock(m["CardMaster"]).items():
        entities.append(build_hero(group, m["SM"], m["SEM"], m["SMA"], m["SUM"],
                                   m["SkillTrans"], m["English"], m["SkillEffectTrans"],
                                   m["StatusTrans"], m["chara_pages"]))
    for stock_id, group in group_by_stock(m["SidekickMaster"]).items():
        entities.append(build_sidekick(group, m["SM"], m["SEM"], m["SMA"],
                                       m["SkillTrans"], m["English"], m["SkillEffectTrans"],
                                       m["StatusTrans"], m["chara_pages"]))
    return entities


def main():
    m = load_all()
    SMA = m["SMA"]
    StatusTrans = m["StatusTrans"]
    entities = build_entities(m)

    # Many StatusMaster entries are internal system/particle placeholders with
    # empty names. They are useless for the "Has status" autocomplete and only
    # bloat the index, so keep only statuses that resolve to a non-empty name.
    def status_name(sid):
        return resolve_status_name(sid, StatusTrans, SMA).strip()
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
    if unmapped_sublabel_targets:
        print(f"\nUNMAPPED SUBLABEL TARGETS ({len(unmapped_sublabel_targets)}) -- "
              f"no target sublabel (parent label still applied), add to TARGET_TO_SUBLABEL:")
        for tf, n in unmapped_sublabel_targets.most_common():
            print(f"  effectTarget {tf}: {n} skill effect(s)")
    if unmapped_scaling_sources:
        print(f"\nUNMAPPED SCALING SOURCES ({len(unmapped_scaling_sources)}) -- "
              f"damage.scaling with no source sublabel, add to SCALING_* maps:")
        for (cls, pt), n in unmapped_scaling_sources.most_common():
            print(f"  {cls} paramType={pt}: {n} skill effect(s)")
    if missing_upgrade_nodes:
        print(f"\nMISSING SKILL-UPGRADE NODES ({len(missing_upgrade_nodes)}) -- "
              f"gated effects kept as terminal (recall-safe); check masterdata:")
        for eid, n in missing_upgrade_nodes.most_common():
            print(f"  node {eid}: {n} effect(s)")
    if suspicious_view_costs:
        print(f"\nSUSPICIOUS MAXED VIEW COSTS ({len(suspicious_view_costs)}) -- "
              f"summed below 0, additive assumption likely broken:")
        for skill_id, total in suspicious_view_costs:
            print(f"  skill {skill_id}: {total}")
    if liquid_template_statuses:
        print(f"\nSTATUS IDs WITH LIQUID TEMPLATES (desc skipped, {len(liquid_template_statuses)} status IDs):")
        for sid, n in liquid_template_statuses.most_common():
            sname = StatusTrans.get(sid, {}).get("name") or SMA.get(sid, {}).get("statusName", "?")
            print(f"  {sid} ({sname}): {n} effect(s)")


if __name__ == "__main__":
    main()
