import json
import os
import unittest

from generate_skill_search_index import build_status_descs, maxed_skill_description, maxed_use_view

DATA = os.path.join(os.path.dirname(__file__), "..", "_data")


def load(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


class TestSkillTreeMaxed(unittest.TestCase):
    """Skill-tree maxed-skill assembly, pinned to committed Akashi (stockId
    10011) and Raiki (stockId 10041) master data. We assert on the raw Japanese
    master strings (always present in _data/) and the language-independent View
    cost, and pass English={} so the test is deterministic without zzz/."""

    @classmethod
    def setUpClass(cls):
        cls.SM = load("SkillMaster.json")
        cls.SEM = load("SkillEffectMaster.json")
        cls.SUM = load("SkillUpgradeMaster.json")
        cls.SMA = load("StatusMaster.json")

    def test_akashi_active1_terminal_tier_description(self):
        # 1001105 "燃ゆる白球+": base hit + terminal-tier burn + standalone passive,
        # with the intermediate/superseded burn tiers dropped.
        desc = maxed_skill_description(1001105, self.SM, self.SEM, {}, {}, self.SUM)
        self.assertTrue(desc.startswith("敵単体に70%ダメージ。"), desc)
        self.assertIn("60%の確率で2ターンの間火傷を付与", desc)
        self.assertIn("バトル開始時、自身に闘魂を付与", desc)
        for superseded in ("40%の確率", "45%の確率", "50%の確率", "55%の確率"):
            self.assertNotIn(superseded, desc)

    def test_akashi_active3_terminal_damage_and_view(self):
        # 1001107 "百烈打砲": terminal 160% damage line, intermediate 125% dropped,
        # and View cost 16000 - 500 - 500 - 1000 - 2000 = 12000.
        desc = maxed_skill_description(1001107, self.SM, self.SEM, {}, {}, self.SUM)
        self.assertIn("160%に増加", desc)
        self.assertNotIn("125%に増加", desc)
        self.assertEqual(maxed_use_view(1001107, self.SM, self.SEM), 12000)

    def test_raiki_active2_view_reduction(self):
        # 1004106 "メガボルト・クラッシュ": View cost 10000 - 2000 = 8000.
        self.assertEqual(maxed_use_view(1004106, self.SM, self.SEM), 8000)

    def test_raiki_active3_single_terminal_damage_tier(self):
        # 1004107: the damage line climbs 90->...->110% across tiers that use
        # DIFFERENT skillEffectIds, so the tier-0 base (180% cap) must still be
        # superseded by the terminal (220% cap) and appear exactly once.
        desc = maxed_skill_description(1004107, self.SM, self.SEM, {}, {}, self.SUM)
        self.assertIn("最大220%まで上昇", desc)
        self.assertNotIn("最大180%まで上昇", desc)  # tier-0 base, superseded
        self.assertEqual(desc.count("敵全体に"), 1, desc)  # no duplicated damage line

    def test_no_view_effect_keeps_base(self):
        # A skill with no ChangeSkillBaseView keeps its base useView untouched.
        base_skill = 1001101  # Akashi's pre-bloom active 1
        self.assertEqual(
            maxed_use_view(base_skill, self.SM, self.SEM),
            self.SM["1001101"].get("useView", 0),
        )

    def test_gammei_hero_active1_status_descs_maxed(self):
        # Skill 1006105 "公務執行" (Gammei bloom active 1) has 6 tree-gated VP Cost
        # effects (+100, +250, +400, +550, +750, +1000) with distinct override names,
        # plus DEF Down (1 unconditional base + tree improvement tiers sharing the
        # same name). After maxing, only the terminal VP Cost (+1000) and the base
        # DEF Down should appear; intermediate VP Cost stages must be excluded.
        descs = build_status_descs(
            1006105, self.SM, self.SEM, self.SMA, {}, {}, self.SUM)
        names = [d["name"] for d in descs]
        self.assertIn("DEFダウン", names)
        self.assertIn("View消費量+1000", names)
        for intermediate in ("View消費量+100", "View消費量+250",
                             "View消費量+400", "View消費量+550", "View消費量+750"):
            self.assertNotIn(
                intermediate, names,
                f"intermediate VP Cost {intermediate!r} must not appear after maxing")


if __name__ == "__main__":
    unittest.main()
