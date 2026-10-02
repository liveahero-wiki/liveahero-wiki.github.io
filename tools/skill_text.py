"""Shared building blocks for skill text: status rows, status annotation, availability.

Used by generate_skill_search_index.py (the web/ search index), gen_skill_upgrade_model.py (the
bloom skill-tree model) and gen_skill_text.py (_data/processed/SkillText.json, which Eleventy
renders into every skill description on the wiki). Everything here is pure: it takes the master
dicts as arguments and never reads files, so it can be unit-tested with small fixtures.

Why status annotation exists: the community sheet marks statuses by hand as
`<wiki-status>Name</wiki-status>` (English only, and only where someone bothered). `annotate`
finds them without that help: it searches the description for the names of the statuses the
skill can apply, longest name first, and writes `<wiki-status i=N>matched text</wiki-status>`
where N indexes the skill's status list. A hand-written tag is still honoured as a hint.
"""
from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

from wiki_util import sanitizeSkillDescriptionForDisplay

LANGS = ("en", "zh-Hans", "zh-Hant", "ja")

# tp: display type of a status. 'b' buff, 'd' debuff, 'o' other, 'f' field, 's' system.
_TP_BY_GOOD = {0: "d", 1: "b", 2: "o", 3: "f"}

# fl: flag bitmask on a status row.
FL_STACKABLE, FL_CHARGE, FL_DOT, FL_FIELD, FL_COUNT = 1, 2, 4, 8, 16

# Words of the tooltip header `[Type/Stackable/Charge/...]`, per language. Emitted into the search
# index (`statusLabels`) and into SkillText.json (`labels`), so the wiki and web/ agree.
STATUS_LABELS = {
    "en": {"b": "Buff", "d": "Debuff", "o": "Other", "f": "Field", "s": "System",
           "stk": "Stackable", "unstk": "Unstackable", "chg": "Charge", "dot": "Damage over time",
           "fld": "Field", "cnt": "Count"},
    "ja": {"b": "バフ", "d": "デバフ", "o": "その他", "f": "フィールド", "s": "システム",
           "stk": "重複可", "unstk": "重複不可", "chg": "チャージ", "dot": "継続ダメージ",
           "fld": "フィールド", "cnt": "カウント"},
    "zh-Hans": {"b": "增益", "d": "减益", "o": "其他", "f": "场地", "s": "系统",
                "stk": "可叠加", "unstk": "不可叠加", "chg": "蓄力", "dot": "持续伤害",
                "fld": "场地", "cnt": "计数"},
    "zh-Hant": {"b": "增益", "d": "減益", "o": "其他", "f": "場地", "s": "系統",
                "stk": "可疊加", "unstk": "不可疊加", "chg": "蓄力", "dot": "持續傷害",
                "fld": "場地", "cnt": "計數"},
}


def status_label(labels: dict, tp: str, fl: int) -> str:
    """`Type/Stackable/Charge/...` for a tooltip header. A field effect is typed "Other" and
    carries a Field modifier (that is how the in-game status list shows it)."""
    kind = labels["o"] if fl & FL_FIELD else labels.get(tp, tp)
    mods = [labels["stk"] if fl & FL_STACKABLE else labels["unstk"]]
    for bit, key in ((FL_CHARGE, "chg"), (FL_DOT, "dot"), (FL_FIELD, "fld"), (FL_COUNT, "cnt")):
        if fl & bit:
            mods.append(labels[key])
    return "/".join([kind] + mods)


# ---------------------------------------------------------------------------
# Status rows
# ---------------------------------------------------------------------------
@dataclass(eq=False)
class StatusRow:
    """One status as a skill applies it. Override names/descriptions are per effect row, so a
    status id alone is not an identity: "ATK Up" and "ATK Up+" are both status 1."""
    status_id: int
    se_id: int | None          # the skillEffect row it comes from (None: only the status id is known)
    name: str                  # canonical display name (the tooltip header)
    desc: str
    tp: str
    fl: int
    icon: str
    aliases: tuple             # strings that name it in running text (includes `name`)

    @property
    def ident(self):
        return (self.status_id, self.se_id)


_TEMPLATE = re.compile(r"\{\{\s*(.*?)\s*\}\}")


def _fmt_number(v) -> str:
    if isinstance(v, float) and v == int(v):
        v = int(v)
    return str(v)


class StatusResolver:
    """Resolves status names/descriptions/rows for one language, with the same priority the
    wiki always used:
        override (only when the effect's isOverride* flag is set):
            community SkillEffect.json > zzz OVERRIDE_STATUS_* > raw skillEffectJson
        otherwise: community Status.json > zzz STATUS_* > raw StatusMaster
    Community dicts are English-only (empty for the other languages); zzz is the game's own
    localization dump for the language.
    """

    def __init__(self, SMA, SEM, StatusTrans, SkillEffectTrans, GameTrans):
        self.SMA, self.SEM = SMA, SEM
        self.StatusTrans, self.SkillEffectTrans = StatusTrans, SkillEffectTrans
        self.GameTrans = GameTrans or {}
        self._effect_rows: dict = {}
        self._status_rows: dict = {}
        self._first_plain_effect: dict | None = None
        self._catalog: AliasCatalog | None = None
        self.template_missing = Counter()   # (status id, path) templates that hit a missing value

    # -- names ---------------------------------------------------------------
    def status_name(self, sid) -> str:
        sid = str(sid)
        return (self.StatusTrans.get(sid, {}).get("name")
                or self.GameTrans.get(f"STATUS_NAME_{sid}")
                or self.SMA.get(sid, {}).get("statusName", "")).strip()

    def status_aliases(self, sid) -> list:
        sid = str(sid)
        return _uniq([self.StatusTrans.get(sid, {}).get("name"),
                      self.GameTrans.get(f"STATUS_NAME_{sid}"),
                      self.SMA.get(sid, {}).get("statusName")])

    # -- Liquid subset used by 13 community status descriptions ---------------
    def render_template(self, tpl: str, sej: dict, ctx: str = "") -> str:
        """Evaluate `{{ effects.<Class>.parameter.<key> [| abs | minus: N | status_description] }}`.
        `effects` is the row's skillEffectJson.effects keyed by class. A path that does not exist
        renders empty (like Liquid) and is counted in template_missing; any other syntax raises,
        so a new template shape fails the build instead of printing garbage."""
        effects = {e.get("class"): e for e in sej.get("effects", [])}

        def sub(m):
            parts = [p.strip() for p in m.group(1).split("|")]
            path = parts[0].split(".")
            if path[0] != "effects" or len(path) < 2:
                raise ValueError(f"unsupported status template expression {m.group(0)!r} ({ctx})")
            val = effects.get(path[1])
            for key in path[2:]:
                val = val.get(key) if isinstance(val, dict) else None
            if val is None:
                self.template_missing[(ctx, parts[0])] += 1
                return ""
            for f in parts[1:]:
                fname, _, arg = f.partition(":")
                fname, arg = fname.strip(), arg.strip()
                if fname == "abs":
                    val = abs(val)
                elif fname == "minus":
                    val = val - (float(arg) if "." in arg else int(arg))
                elif fname == "status_description":
                    val = self.status_name(val)
                else:
                    raise ValueError(f"unsupported status template filter {f!r} ({ctx})")
            return _fmt_number(val)

        return _TEMPLATE.sub(sub, tpl)

    # -- rows ----------------------------------------------------------------
    def effect_row(self, se_id) -> StatusRow | None:
        """The status a skillEffect row applies, or None if it applies none / has no name."""
        key = str(se_id)
        if key not in self._effect_rows:
            self._effect_rows[key] = self._build_effect_row(key)
        return self._effect_rows[key]

    def _build_effect_row(self, seid: str) -> StatusRow | None:
        sej = self.SEM.get(seid, {}).get("skillEffectJson", {})
        status_id = sej.get("statusId")
        if not status_id:
            return None
        sid = str(status_id)
        se_trans = self.SkillEffectTrans.get(seid, {})

        ov_names = _uniq([se_trans.get("overrideStatusName"),
                          self.GameTrans.get(f"OVERRIDE_STATUS_NAME_{seid}"),
                          sej.get("overrideStatusName")]) if sej.get("isOverrideStatusName") else []
        # unflagged override strings are developer placeholders: ignored, so a status with no
        # name of its own is dropped
        name = ov_names[0] if ov_names else self.status_name(sid)
        if not name:
            return None
        aliases = ov_names or self.status_aliases(sid)

        desc = ""
        if sej.get("isOverrideStatusDescription"):
            desc = (se_trans.get("overrideStatusDescription")
                    or self.GameTrans.get(f"OVERRIDE_STATUS_DESCRIPTION_{seid}")
                    or sej.get("overrideStatusDescription") or "")
        if not desc:
            desc = (self.StatusTrans.get(sid, {}).get("description")
                    or self.GameTrans.get(f"STATUS_DESCRIPTION_{sid}") or "")
            if "{{" in desc:
                desc = self.render_template(desc, sej, ctx=f"status {sid}")
            desc = desc or self.SMA.get(sid, {}).get("description", "") or ""
            if "{{" in desc:
                desc = self.render_template(desc, sej, ctx=f"status {sid}")
        desc = sanitizeSkillDescriptionForDisplay(desc)

        is_field = bool(sej.get("isFieldEffect"))
        ig = self.SMA.get(sid, {}).get("isGoodStatus", 1)
        fl = 0
        if sej.get("canDuplicate"):    fl |= FL_STACKABLE
        if sej.get("isCharageEffect"): fl |= FL_CHARGE   # sic: typo in the game data
        if sej.get("isDotDamage"):     fl |= FL_DOT
        if is_field:                   fl |= FL_FIELD
        if sej.get("isCountEffect"):   fl |= FL_COUNT
        return StatusRow(
            status_id=status_id, se_id=int(seid), name=name, desc=desc,
            tp="o" if is_field else _TP_BY_GOOD.get(ig, "s"), fl=fl,
            icon=sej.get("filename") or self.StatusTrans.get(sid, {}).get("icon") or "",
            aliases=tuple(aliases))

    def status_row(self, status_id) -> StatusRow | None:
        """A status known only by id (named in a trigger or another effect's parameter). It takes
        its flags/icon from the first effect that applies it without an override, if any."""
        key = str(status_id)
        if key not in self._status_rows:
            self._status_rows[key] = self._build_status_row(key)
        return self._status_rows[key]

    def _build_status_row(self, sid: str) -> StatusRow | None:
        if self._first_plain_effect is None:
            first = {}
            for seid, se in self.SEM.items():
                sej = se.get("skillEffectJson", {})
                s = str(sej.get("statusId") or "")
                if s and not sej.get("isOverrideStatusName") and s not in first:
                    first[s] = seid
            self._first_plain_effect = first
        seid = self._first_plain_effect.get(sid)
        if seid is not None:
            return self.effect_row(seid)
        name = self.status_name(sid)
        if not name:
            return None
        desc = (self.StatusTrans.get(sid, {}).get("description")
                or self.GameTrans.get(f"STATUS_DESCRIPTION_{sid}")
                or self.SMA.get(sid, {}).get("description", "") or "")
        if "{{" in desc:
            desc = ""
        desc = sanitizeSkillDescriptionForDisplay(desc)
        ig = self.SMA.get(sid, {}).get("isGoodStatus", 1)
        return StatusRow(status_id=int(sid), se_id=None, name=name, desc=desc,
                         tp=_TP_BY_GOOD.get(ig, "s"), fl=0,
                         icon=self.StatusTrans.get(sid, {}).get("icon") or "",
                         aliases=tuple(self.status_aliases(sid)))

    def catalog(self) -> "AliasCatalog":
        """Every named status / flagged override name in the game, for hint lookup and blockers."""
        if self._catalog is None:
            cat = AliasCatalog()
            for sid in self.SMA:
                row = self.status_row(sid)
                if row is not None and str(row.status_id) == sid:
                    cat.add(row)
            for seid, se in self.SEM.items():
                if se.get("skillEffectJson", {}).get("isOverrideStatusName"):
                    row = self.effect_row(seid)
                    if row is not None:
                        cat.add(row)
            self._catalog = cat
        return self._catalog


def _uniq(strings) -> list:
    """Stripped, non-empty, order-preserving unique strings."""
    out = []
    for s in strings:
        s = (s or "").strip()
        if s and s not in out:
            out.append(s)
    return out


# ---------------------------------------------------------------------------
# Walking a skill's statuses
# ---------------------------------------------------------------------------
_STATUS_KEYS = {"statusId", "statusIds", "linkStatusId", "targetStatusId"}
# effect classes whose parameter.skillId is another skill the effect brings in
_SKILL_REF_CLASSES = {"ChangeActiveSkill", "PassiveBattleSkillEffect",
                      "DecideUniqueByStatusPassiveBattleSkillEffect", "CounterAttack"}
# effect classes whose parameter.target is a status id (for the rest it is a target enum)
_TARGET_IS_STATUS_CLASSES = {"RemoveSystemEffect"}


def _collect_status_ids(node, out: list):
    """Every status id mentioned anywhere in a JSON fragment (triggers, parameters, ...)."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in _STATUS_KEYS:
                if isinstance(v, int) and v:
                    out.append(v)
                elif isinstance(v, list):
                    out.extend(x for x in v if isinstance(x, int) and x)
            else:
                _collect_status_ids(v, out)
    elif isinstance(node, list):
        for v in node:
            _collect_status_ids(v, out)


def walk_skill_statuses(skill_id, SM, SEM, resolver: StatusResolver, memo: dict | None = None) -> list:
    """Every status row a skill can name, in a stable order: its own effect rows (shown or not,
    every condition tier), the statuses its triggers and parameters mention, then everything
    reachable through appended passives and effects that bring in another skill. Deduplicated by
    row identity."""
    memo = {} if memo is None else memo
    return list(_walk(skill_id, SM, SEM, resolver, memo, frozenset())[0].values())


def _walk(skill_id, SM, SEM, resolver, memo, visiting) -> tuple:
    """(rows, cut): `cut` is the set of skills still being walked above this one that the walk ran
    back into (a skill that changes into another one that changes back). While any are open, this
    skill's rows are incomplete -- they lack what only those skills would add -- so they are not
    memoized; otherwise the answer for a skill would depend on which skill was walked first."""
    key = str(skill_id)
    if key in memo:
        return memo[key], frozenset()
    if key in visiting:
        return {}, frozenset({key})
    visiting = visiting | {key}
    rows: dict = {}
    cut: set = set()

    def add(row):
        if row is not None and row.ident not in rows:
            rows[row.ident] = row

    skill = SM.get(key)
    if skill:
        status_ids: list = []
        _collect_status_ids(skill.get("timingEntity"), status_ids)
        child_skills: list = list(skill.get("appendPassiveSkillIds") or [])
        for eff in skill.get("effects") or []:
            add(resolver.effect_row(eff.get("skillEffectId")))
            _collect_status_ids(eff.get("triggerJson"), status_ids)
            _collect_status_ids(eff.get("receiverTriggerJson"), status_ids)
            sej = SEM.get(str(eff.get("skillEffectId")), {}).get("skillEffectJson", {})
            for inner in sej.get("effects", []):
                param = inner.get("parameter")
                if not isinstance(param, dict):
                    continue
                _collect_status_ids(param, status_ids)
                cls = inner.get("class")
                if cls in _TARGET_IS_STATUS_CLASSES and isinstance(param.get("target"), int):
                    status_ids.append(param["target"])
                if cls in _SKILL_REF_CLASSES and param.get("skillId"):
                    child_skills.append(param["skillId"])
        for sid in status_ids:
            add(resolver.status_row(sid))
        for child in child_skills:
            child_rows, child_cut = _walk(child, SM, SEM, resolver, memo, visiting)
            cut |= child_cut
            for ident, row in child_rows.items():
                rows.setdefault(ident, row)
    cut.discard(key)
    if not cut:
        memo[key] = rows
    return rows, frozenset(cut)


# ---------------------------------------------------------------------------
# Annotation
# ---------------------------------------------------------------------------
_LATIN = "A-Za-z0-9À-ɏ"
_LETTER = ("A-Za-zÀ-ɏ぀-ヿ㐀-䶿一-鿿豈-﫿"
           "ｦ-ﾟＡ-Ｚａ-ｚ")
_HAS_LETTER = re.compile(f"[{_LETTER}]")
_LATIN_LETTERS = re.compile(r"[A-Za-zÀ-ɏ]")
_CAPS_TOKEN = re.compile(r"\b[A-Z]{2,}\b")
_EDGE = re.compile(f"[{_LATIN}]")

# <wiki-status ...>hint</wiki-status> | any other tag or comment. A `<` that is not followed by a
# letter (e.g. "<5000") is text, not a tag.
_TOKEN = re.compile(r"<wiki-status(?:\s[^>]*)?>(?P<hint>.*?)</wiki-status>"
                    r"|(?P<tag></?[A-Za-z][^<>]*>|<!--.*?-->)", re.DOTALL)

_BLOCK = object()   # alias that must be consumed but never become a chip


def alias_usable(alias: str) -> bool:
    """Reject aliases that would match all over ordinary text: nothing but digits/symbols
    ("100%", "???"), or a Latin name shorter than three letters."""
    if not _HAS_LETTER.search(alias):
        return False
    has_cjk = re.search("[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]", alias)
    return bool(has_cjk) or len(_LATIN_LETTERS.findall(alias)) >= 3


class AliasCatalog:
    """Every named status in the game for one language: hint lookup and substring blockers."""

    def __init__(self):
        self.by_alias: dict = {}
        self.ambiguous: Counter = Counter()
        self._super_cache: dict = {}
        self._frozen: list | None = None

    def add(self, row: StatusRow):
        for a in row.aliases:
            if alias_usable(a):
                self.by_alias.setdefault(a, [])
                if all(r.ident != row.ident for r in self.by_alias[a]):
                    self.by_alias[a].append(row)
        self._frozen = None

    def lookup(self, text: str):
        """The row a hand-written tag names: the first status with that name (status-level rows
        come before per-effect override rows). Several statuses can share a name with different
        tooltips; that is counted in `ambiguous` rather than refused, because a person did mean
        some status by it."""
        for cand in (text, text.strip()):
            rows = self.by_alias.get(cand)
            if rows is None:
                continue
            if len({(r.name, r.desc, r.tp, r.fl, r.icon) for r in rows}) > 1:
                self.ambiguous[cand] += 1
            return rows[0]
        return None

    def superstrings(self, alias: str) -> list:
        """Other names that contain `alias` ("ATK Up (Unstackable)" for "ATK Up")."""
        if alias not in self._super_cache:
            if self._frozen is None:
                self._frozen = list(self.by_alias)
            self._super_cache[alias] = [n for n in self._frozen if n != alias and alias in n]
        return self._super_cache[alias]


@dataclass
class AnnotateReport:
    """What `annotate` could not place; summarised by gen_skill_text.py --report."""
    hints: int = 0
    hints_local: int = 0
    hints_global: int = 0
    hints_unresolved: list = field(default_factory=list)   # (context, name)
    matches: int = 0
    shared_alias: Counter = field(default_factory=Counter)


class Annotator:
    def __init__(self, catalog: AliasCatalog, report: AnnotateReport | None = None):
        self.catalog = catalog
        self.report = report if report is not None else AnnotateReport()

    def annotate(self, text: str, footer: list, others: list | None = None, ctx: str = "") -> tuple:
        """Wrap the statuses named in `text` and return `(tagged_text, footer_rows)`.

        footer  -- the skill's displayed status rows, in display order (name-deduplicated). They
                   are the start of the returned list, so `i` of a tag indexes it.
        others  -- further rows the text may name, best candidates first: statuses the skill
                   mentions without applying (hidden rows, triggers, nested/appended skills, the
                   rest of the character's kit). A matched one is appended to the footer.

        Names are found by one alternation sorted longest-first, so "ATK Up+" wins over "ATK Up"
        and a replaced span is never scanned again. Only text outside tags is searched."""
        others = others or []
        if not text:
            return text, list(footer)
        rows = list(footer) + list(others)
        out_footer = list(footer)
        index_by_name = {r.name: i for i, r in enumerate(out_footer)}
        index_by_ident = {r.ident: i for i, r in enumerate(out_footer)}

        # alias -> best row (earlier in `rows` wins); blockers map to _BLOCK
        exact: dict = {}
        folded: dict = {}
        ci: set = set()
        for row in rows:
            for alias in row.aliases:
                if not alias_usable(alias):
                    continue
                if alias in exact and exact[alias] is not row:
                    if (exact[alias].name, exact[alias].desc) != (row.name, row.desc):
                        self.report.shared_alias[alias] += 1
                    continue
                exact[alias] = row
                if _CAPS_TOKEN.search(alias):
                    ci.add(alias)
                    folded.setdefault(alias.casefold(), row)
        for alias in list(exact):
            for sup in self.catalog.superstrings(alias):
                if sup not in exact and alias_usable(sup):
                    exact[sup] = _BLOCK

        def place(row: StatusRow, shown: str) -> str:
            i = index_by_ident.get(row.ident)
            if i is None:
                i = index_by_name.get(row.name)
                if i is None:
                    i = len(out_footer)
                    out_footer.append(row)
                    index_by_name[row.name] = i
                index_by_ident[row.ident] = i
            return f"<wiki-status i={i}>{shown}</wiki-status>"

        pattern = self._pattern(exact, ci)

        def scan(seg: str) -> str:
            if not seg or pattern is None:
                return seg

            def repl(m):
                s = m.group(0)
                row = exact.get(s)
                if row is None:
                    row = folded.get(s.casefold())
                if row is None or row is _BLOCK:
                    return s
                self.report.matches += 1
                return place(row, s)
            return pattern.sub(repl, seg)

        def resolve_hint(inner: str) -> str:
            self.report.hints += 1
            name = inner.strip()
            row = exact.get(name)
            if row is None:
                row = folded.get(name.casefold())
            if row is not None and row is not _BLOCK:
                self.report.hints_local += 1
                return place(row, inner)
            row = self.catalog.lookup(name)
            if row is not None:
                self.report.hints_global += 1
                return place(row, inner)
            self.report.hints_unresolved.append((ctx, name))
            return scan(inner)

        parts, pos = [], 0
        for m in _TOKEN.finditer(text):
            parts.append(scan(text[pos:m.start()]))
            parts.append(resolve_hint(m.group("hint")) if m.group("hint") is not None else m.group(0))
            pos = m.end()
        parts.append(scan(text[pos:]))
        return "".join(parts), out_footer

    @staticmethod
    def _pattern(exact: dict, ci: set):
        if not exact:
            return None
        alts = []
        for alias in sorted(exact, key=lambda a: (-len(a), a)):
            body = re.escape(alias)
            if alias in ci:
                body = f"(?i:{body})"
            left = f"(?<![{_LATIN}])" if _EDGE.fullmatch(alias[0]) else ""
            right = f"(?![{_LATIN}])" if _EDGE.fullmatch(alias[-1]) else ""
            alts.append(f"{left}{body}{right}")
        return re.compile("|".join(alts))


# ---------------------------------------------------------------------------
# Availability
# ---------------------------------------------------------------------------
_TAG_ANY = re.compile(r"<[^>]*>")
_KANA = re.compile("[぀-ゟ゠-ヿｦ-ﾟ]")
_HAN = re.compile("[㐀-䶿一-鿿豈-﫿]")


def plain_text(text: str) -> str:
    return _TAG_ANY.sub("", text or "")


def is_available(lang: str, text: str) -> bool:
    """Whether `text` is really in `lang`, rather than untranslated Japanese the game fell back
    to. Judged on the visible text: official English still carries game markup until it is
    sanitized, and `・` / `ー` appear in Chinese names too, so neither counts as kana."""
    plain = plain_text(text)
    if not plain.strip():
        return False
    if lang == "ja":
        return True
    kana = len(_KANA.findall(plain.replace("・", "").replace("ー", "")))
    han = len(_HAN.findall(plain))
    if lang == "en":
        latin = len(_LATIN_LETTERS.findall(plain))
        return kana + han <= 0.2 * (kana + han + latin)
    return kana <= 0.1 * (kana + han)
