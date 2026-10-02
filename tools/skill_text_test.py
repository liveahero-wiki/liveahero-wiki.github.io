import unittest

from skill_text import (
    AliasCatalog, Annotator, StatusResolver, StatusRow, STATUS_LABELS, alias_usable, is_available,
    status_label, walk_skill_statuses,
)


def row(name, status_id=1, se_id=None, aliases=(), desc="", tp="b", fl=0, icon=""):
    return StatusRow(status_id=status_id, se_id=se_id if se_id is not None else status_id * 10, name=name,
                     desc=desc, tp=tp, fl=fl, icon=icon, aliases=tuple(aliases) or (name,))


def annotate(text, footer, others=(), catalog_rows=()):
    cat = AliasCatalog()
    for r in list(footer) + list(others) + list(catalog_rows):
        cat.add(r)
    a = Annotator(cat)
    out = a.annotate(text, list(footer), list(others), ctx="test")
    return out, a.report


class TestAnnotate(unittest.TestCase):
    def test_longest_name_wins(self):
        atk, atk_plus = row("ATK Up", 1, 88), row("ATK Up+", 1, 3037)
        (text, footer), _ = annotate("Grant ATK Up. With 6 stacks, ATK Up+ instead.", [atk, atk_plus])
        self.assertEqual(text, "Grant <wiki-status i=0>ATK Up</wiki-status>. "
                               "With 6 stacks, <wiki-status i=1>ATK Up+</wiki-status> instead.")
        self.assertEqual([r.name for r in footer], ["ATK Up", "ATK Up+"])

    def test_longest_name_wins_in_japanese(self):
        a, b = row("ATKアップ", 1, 88), row("ATKアップ+", 1, 3037)
        (text, _), _ = annotate("ATKアップの代わりにATKアップ+を付与する。", [a, b])
        self.assertEqual(text, "<wiki-status i=0>ATKアップ</wiki-status>の代わりに"
                               "<wiki-status i=1>ATKアップ+</wiki-status>を付与する。")

    def test_replaced_span_is_not_scanned_again(self):
        # "ATK Up+" contains the shorter name; one pass must give exactly one tag
        (text, _), _ = annotate("ATK Up+", [row("ATK Up", 1, 88), row("ATK Up+", 1, 3037)])
        self.assertEqual(text, "<wiki-status i=1>ATK Up+</wiki-status>")

    def test_blocker_swallows_longer_names_that_are_not_candidates(self):
        short = row("ATK Up", 1, 88)
        longer = row("ATK Up (Unstackable)", 79, 790)
        (text, footer), _ = annotate("Gain ATK Up (Unstackable) now. Gain ATK Up too.", [short],
                                     catalog_rows=[longer])
        self.assertEqual(text, "Gain ATK Up (Unstackable) now. Gain <wiki-status i=0>ATK Up</wiki-status> too.")
        self.assertEqual(len(footer), 1)

    def test_latin_names_respect_word_boundaries(self):
        (text, _), _ = annotate("Burning ground. Burn for 2 turns. Heartburn.", [row("Burn", 5)])
        self.assertEqual(text, "Burning ground. <wiki-status i=0>Burn</wiki-status> for 2 turns. Heartburn.")

    def test_cjk_names_need_no_boundary(self):
        (text, _), _ = annotate("敵全体に火傷を付与。", [row("火傷", 5)])
        self.assertEqual(text, "敵全体に<wiki-status i=0>火傷</wiki-status>を付与。")

    def test_unusable_aliases_never_match(self):
        self.assertFalse(alias_usable("100%"))
        self.assertFalse(alias_usable("???"))
        self.assertFalse(alias_usable(""))
        self.assertFalse(alias_usable("HP"))
        self.assertTrue(alias_usable("ATK+20%"))
        self.assertTrue(alias_usable("-1000 VP Cost"))
        self.assertTrue(alias_usable("解放"))
        (text, _), _ = annotate("Deal 100% damage.", [row("100%", 5)])
        self.assertEqual(text, "Deal 100% damage.")

    def test_tags_and_attributes_are_not_touched(self):
        src = '<span data-x="Burn" title="Burn">Burn</span> and <wiki-passive>Burn</wiki-passive>'
        (text, _), _ = annotate(src, [row("Burn", 5)])
        self.assertEqual(text, '<span data-x="Burn" title="Burn"><wiki-status i=0>Burn</wiki-status></span> and '
                               '<wiki-passive><wiki-status i=0>Burn</wiki-status></wiki-passive>')

    def test_bare_less_than_is_text_not_a_tag(self):
        (text, _), _ = annotate("While VP <5000, apply Burn.", [row("Burn", 5)])
        self.assertEqual(text, "While VP <5000, apply <wiki-status i=0>Burn</wiki-status>.")

    def test_all_caps_names_match_case_insensitively_others_do_not(self):
        (text, _), _ = annotate("Remove DEF down. Then burn.", [row("DEF Down", 3), row("Burn", 5)])
        self.assertEqual(text, "Remove <wiki-status i=0>DEF down</wiki-status>. Then burn.")

    def test_others_are_appended_to_the_footer_in_order_of_use(self):
        a, b = row("Burn", 5), row("Freeze", 6)
        (text, footer), _ = annotate("Freeze, then Burn.", [a], [b])
        self.assertEqual(text, "<wiki-status i=1>Freeze</wiki-status>, then <wiki-status i=0>Burn</wiki-status>.")
        self.assertEqual([r.name for r in footer], ["Burn", "Freeze"])

    def test_unused_others_stay_out_of_the_footer(self):
        (_, footer), _ = annotate("Nothing here.", [row("Burn", 5)], [row("Freeze", 6)])
        self.assertEqual([r.name for r in footer], ["Burn"])

    def test_better_candidate_wins_a_shared_alias(self):
        first, second = row("Immunity", 48, 480, desc="a"), row("Immunity", 59, 590, desc="b")
        (text, footer), report = annotate("Gain Immunity.", [first], [second])
        self.assertEqual(text, "Gain <wiki-status i=0>Immunity</wiki-status>.")
        self.assertEqual(len(footer), 1)
        self.assertEqual(report.shared_alias["Immunity"], 1)

    def test_same_named_rows_share_a_footer_entry(self):
        a, b = row("Burn", 5, 50), row("Burn", 5, 51)
        (text, footer), _ = annotate("Burn", [a], [b])
        self.assertEqual(len(footer), 1)

    def test_alias_names_the_canonical_row(self):
        # official English says "Guide of the Stars", the community calls it "Astéria Odigós"
        r = row("Astéria Odigós", 305, 4608, aliases=["Astéria Odigós", "Guide of the Stars"])
        (text, footer), _ = annotate("Gain Guide of the Stars.", [r])
        self.assertEqual(text, "Gain <wiki-status i=0>Guide of the Stars</wiki-status>.")
        self.assertEqual(footer[0].name, "Astéria Odigós")

    def test_existing_tag_is_rewritten_to_the_index_form(self):
        (text, _), report = annotate("Apply <wiki-status>Burn</wiki-status> and Burn.", [row("Burn", 5)])
        self.assertEqual(text, "Apply <wiki-status i=0>Burn</wiki-status> and <wiki-status i=0>Burn</wiki-status>.")
        self.assertEqual((report.hints, report.hints_local), (1, 1))

    def test_hint_for_a_status_the_skill_does_not_apply_resolves_globally(self):
        wait = row("Wait", 9)
        (text, footer), report = annotate("Do <wiki-status>Wait</wiki-status>.", [row("Burn", 5)],
                                          catalog_rows=[wait])
        self.assertEqual(text, "Do <wiki-status i=1>Wait</wiki-status>.")
        self.assertEqual([r.name for r in footer], ["Burn", "Wait"])
        self.assertEqual(report.hints_global, 1)

    def test_unknown_hint_is_dropped_and_reported(self):
        (text, _), report = annotate("Do <wiki-status>Restrain</wiki-status>.", [row("Burn", 5)])
        self.assertEqual(text, "Do Restrain.")
        self.assertEqual(report.hints_unresolved, [("test", "Restrain")])

    def test_ambiguous_global_hint_takes_the_first_status_and_is_counted(self):
        a, b = row("Resist", 21, desc="x"), row("Resist", 59, desc="y")
        cat = AliasCatalog()
        for r in (row("Burn", 5), a, b):
            cat.add(r)
        annotator = Annotator(cat)
        text, footer = annotator.annotate("<wiki-status>Resist</wiki-status>", [row("Burn", 5)])
        self.assertEqual(text, "<wiki-status i=1>Resist</wiki-status>")
        self.assertEqual(footer[1].status_id, 21)
        self.assertEqual(cat.ambiguous["Resist"], 1)

    def test_text_without_statuses_is_unchanged(self):
        src = "Deal 70% damage."
        (text, footer), _ = annotate(src, [])
        self.assertEqual((text, footer), (src, []))

    def test_regex_metacharacters_in_names(self):
        (text, _), _ = annotate("Gain +20% ATK (max).", [row("+20% ATK (max)", 7)])
        self.assertEqual(text, "Gain <wiki-status i=0>+20% ATK (max)</wiki-status>.")


class TestLabels(unittest.TestCase):
    def test_label(self):
        en = STATUS_LABELS["en"]
        self.assertEqual(status_label(en, "b", 1), "Buff/Stackable")
        self.assertEqual(status_label(en, "d", 0), "Debuff/Unstackable")
        self.assertEqual(status_label(en, "f", 8), "Other/Unstackable/Field")
        self.assertEqual(status_label(en, "b", 1 | 2 | 4 | 16), "Buff/Stackable/Charge/Damage over time/Count")

    def test_every_language_has_every_key(self):
        keys = set(STATUS_LABELS["en"])
        for lang, labels in STATUS_LABELS.items():
            self.assertEqual(set(labels), keys, lang)


class TestAvailable(unittest.TestCase):
    def test_english(self):
        self.assertTrue(is_available("en", "Deal 70% damage to <wiki-passive>1 enemy</wiki-passive>."))
        self.assertFalse(is_available("en", "敵全体に70%ダメージ。"))
        self.assertFalse(is_available("en", ""))
        self.assertFalse(is_available("en", "<br>"))
        # a stray Japanese word in an English sentence is still English
        self.assertTrue(is_available("en", "Deal damage to all enemies and apply ヴェルタ's mark for 2 turns."))

    def test_chinese(self):
        self.assertTrue(is_available("zh-Hans", "对敌方全体造成70%伤害。"))
        self.assertTrue(is_available("zh-Hant", "對敵方全體造成70%傷害。リ"))   # one stray kana in many characters
        self.assertTrue(is_available("zh-Hans", "获得 View・Power 的加成"))      # the middle dot is not kana
        self.assertFalse(is_available("zh-Hans", "敵全体に70%ダメージ。"))     # untranslated Japanese
        self.assertTrue(is_available("zh-Hans", "+10%"))

    def test_japanese(self):
        self.assertTrue(is_available("ja", "敵全体に70%ダメージ。"))
        self.assertFalse(is_available("ja", "  "))


class FakeData:
    """A miniature master: skill 1 applies status 10 ("Burn", flagged override on effect 101),
    triggers on status 20, appends passive skill 2 (statuses 30), and changes into skill 3."""
    SMA = {
        "10": {"statusName": "火傷", "description": "HPが減る", "isGoodStatus": 0},
        "20": {"statusName": "ウェイト", "description": "", "isGoodStatus": 2},
        "30": {"statusName": "ATKアップ", "description": "ATKが上がる", "isGoodStatus": 1},
        "40": {"statusName": "", "description": "", "isGoodStatus": 2},
    }
    SEM = {
        "100": {"skillEffectJson": {"statusId": 10, "filename": "status_burn", "canDuplicate": True,
                                    "isOverrideStatusName": False, "effects": []}},
        "101": {"skillEffectJson": {"statusId": 10, "isOverrideStatusName": True, "overrideStatusName": "強火傷",
                                    "isOverrideStatusDescription": True,
                                    "overrideStatusDescription": "とても減る", "effects": []}},
        "102": {"skillEffectJson": {"statusId": 0, "effects": [
            {"class": "ChangeActiveSkill", "parameter": {"skillId": 3}}]}},
        "103": {"skillEffectJson": {"statusId": 30, "effects": []}},
        "104": {"skillEffectJson": {"statusId": 0, "effects": [
            {"class": "RemoveSystemEffect", "parameter": {"target": 40}}]}},
    }
    SM = {
        "1": {"timingEntity": {"trigger": {"statusId": 20}},
              "effects": [{"skillEffectId": 100, "triggerJson": [], "receiverTriggerJson": []},
                          {"skillEffectId": 101, "triggerJson": [{"statusId": 30}], "receiverTriggerJson": []},
                          {"skillEffectId": 102, "triggerJson": [], "receiverTriggerJson": []}],
              "appendPassiveSkillIds": [2]},
        "2": {"effects": [{"skillEffectId": 103, "triggerJson": [], "receiverTriggerJson": []}]},
        "3": {"effects": [{"skillEffectId": 104, "triggerJson": [], "receiverTriggerJson": []}]},
    }

    @classmethod
    def resolver(cls, trans=None, game=None, se_trans=None):
        return StatusResolver(cls.SMA, cls.SEM, trans or {}, se_trans or {}, game or {})


class TestResolver(unittest.TestCase):
    def test_priority_community_then_game_then_master(self):
        r = FakeData.resolver({"10": {"name": "Burn"}})
        self.assertEqual(r.effect_row(100).name, "Burn")
        r = FakeData.resolver(game={"STATUS_NAME_10": "Scorch"})
        self.assertEqual(r.effect_row(100).name, "Scorch")
        self.assertEqual(FakeData.resolver().effect_row(100).name, "火傷")

    def test_override_name_uses_the_game_dump_for_other_languages(self):
        r = FakeData.resolver(game={"OVERRIDE_STATUS_NAME_101": "强火伤",
                                    "OVERRIDE_STATUS_DESCRIPTION_101": "减很多"})
        got = r.effect_row(101)
        self.assertEqual((got.name, got.desc), ("强火伤", "减很多"))
        self.assertIn("强火伤", got.aliases)
        self.assertIn("強火傷", got.aliases)   # raw Japanese stays an alias: fallback text is Japanese

    def test_flag_and_icon(self):
        got = FakeData.resolver().effect_row(100)
        self.assertEqual((got.tp, got.fl, got.icon), ("d", 1, "status_burn"))

    def test_nameless_status_is_dropped(self):
        self.assertIsNone(FakeData.resolver().status_row(40))

    def test_templates(self):
        r = FakeData.resolver()
        sej = {"effects": [{"class": "NeedViewValueChange", "parameter": {"value": -1000}},
                           {"class": "MultipleAttack", "parameter": {"value": 150}},
                           {"class": "RegistDebuff", "parameter": {"statusId": 10, "value": -30}}]}
        self.assertEqual(r.render_template("Cost {{ effects.NeedViewValueChange.parameter.value | abs }}", sej), "Cost 1000")
        self.assertEqual(r.render_template("ATK +{{ effects.MultipleAttack.parameter.value | minus: 100 }} %", sej),
                         "ATK +50 %")
        self.assertEqual(r.render_template(
            "Resist {{ effects.RegistDebuff.parameter.statusId | status_description }}", sej), "Resist 火傷")

    def test_template_missing_value_renders_empty_and_is_counted(self):
        r = FakeData.resolver()
        self.assertEqual(r.render_template("x{{ effects.Nope.parameter.value }}y", {"effects": []}), "xy")
        self.assertEqual(sum(r.template_missing.values()), 1)

    def test_unknown_template_syntax_fails_loudly(self):
        r = FakeData.resolver()
        with self.assertRaises(ValueError):
            r.render_template("{{ skillEffectJson.turn }}", {"effects": []})
        with self.assertRaises(ValueError):
            r.render_template("{{ effects.A.parameter.v | times: 2 }}", {"effects": [{"class": "A", "parameter": {"v": 1}}]})


class TestResolverDescriptions(unittest.TestCase):
    def test_description_is_the_wiki_tag_set_not_raw_game_markup(self):
        sma = {"7": {"statusName": "バリア", "description": "a<br><color=#505050>b</color><style=\"改行\"></style>c", "isGoodStatus": 1}}
        sem = {"70": {"skillEffectJson": {"statusId": 7, "effects": []}}}
        resolver = StatusResolver(sma, sem, {}, {}, {})
        self.assertEqual(resolver.effect_row(70).desc, "a<br>b<br>c")
        self.assertEqual(resolver.status_row(7).desc, "a<br>b<br>c")


class TestWalk(unittest.TestCase):
    def test_walk_collects_own_triggered_appended_and_changed(self):
        r = FakeData.resolver()
        names = [row_.name for row_ in walk_skill_statuses(1, FakeData.SM, FakeData.SEM, r)]
        # own rows (火傷, 強火傷), then trigger-mentioned statuses (ウェイト, ATKアップ), then the
        # appended passive's and the change skill's: ATKアップ again (deduplicated); status 40 has no name
        self.assertEqual(names[:2], ["火傷", "強火傷"])
        self.assertEqual(set(names), {"火傷", "強火傷", "ウェイト", "ATKアップ"})
        self.assertEqual(len(names), len(set(names)))

    def test_walk_is_the_same_whichever_skill_is_walked_first(self):
        # skill 1 changes into skill 2 and skill 2 changes back: each can name both statuses
        sma = {"10": {"statusName": "A-status", "isGoodStatus": 1}, "20": {"statusName": "B-status", "isGoodStatus": 1}}
        sem = {"1": {"skillEffectJson": {"statusId": 10, "effects": [{"class": "ChangeActiveSkill", "parameter": {"skillId": 2}}]}},
               "2": {"skillEffectJson": {"statusId": 20, "effects": [{"class": "ChangeActiveSkill", "parameter": {"skillId": 1}}]}}}
        sm = {"1": {"effects": [{"skillEffectId": 1}]}, "2": {"effects": [{"skillEffectId": 2}]}}

        def names(order):
            resolver, memo = StatusResolver(sma, sem, {}, {}, {}), {}
            return {sid: sorted(r.name for r in walk_skill_statuses(sid, sm, sem, resolver, memo)) for sid in order}

        both = ["A-status", "B-status"]
        self.assertEqual(names([1, 2]), {1: both, 2: both})
        self.assertEqual(names([2, 1]), {1: both, 2: both})

    def test_walk_survives_cycles(self):
        SM = {"1": {"effects": [], "appendPassiveSkillIds": [2]}, "2": {"effects": [], "appendPassiveSkillIds": [1]}}
        self.assertEqual(walk_skill_statuses(1, SM, {}, FakeData.resolver()), [])


if __name__ == "__main__":
    unittest.main()
