import json
import os
import tempfile
import unittest

import gen_skill_text as T
from skill_text import LANGS, StatusResolver

# A miniature game: skill 1 applies status 5 and says so in every language except Chinese, where the
# dump only has the Japanese text; skill 2 is a second skill with the same status; skill 3 has a
# name and no text; skill 4 has nothing at all.
SMA = {"5": {"statusName": "火傷", "description": "HPが減る", "isGoodStatus": 0}}
SEM = {"10": {"skillEffectJson": {"statusId": 5, "filename": "status_burn", "canDuplicate": True, "effects": []}}}


def skill(name, description, effect=True):
    return {"skillName": name, "description": description,
            "effects": [{"skillEffectId": 10, "serialNo": 0, "notDisplayHint": False, "conditionEntityId": 0,
                         "conditionGroupId": 0, "conditionPriority": 0, "triggerJson": [], "receiverTriggerJson": []}]
            if effect else []}


SM = {
    "1": skill("火球", "敵に火傷を付与。"),
    "2": skill("火球2", "火傷を付与。"),
    "3": skill("名前だけ", ""),
    "4": skill("", ""),
}

GAME = {
    "en": {"SKILL_NAME_1": "Fireball", "SKILL_DESCRIPTION_1": "Apply Burn to an enemy.",
           "SKILL_DESCRIPTION_2": "Apply Burn.", "STATUS_NAME_5": "Burn", "STATUS_DESCRIPTION_5": "Lose HP"},
    "zh-Hans": {"SKILL_NAME_1": "火球", "SKILL_DESCRIPTION_1": "敵に火傷を付与。",   # untranslated: Japanese
                "SKILL_DESCRIPTION_2": "附加烧伤。", "STATUS_NAME_5": "烧伤", "STATUS_DESCRIPTION_5": "损失HP"},
    "zh-Hant": {},
    "ja": {},
}


def context(lang):
    m = {"SM": SM, "SEM": SEM, "SMA": SMA, "StatusTrans": {}, "SkillEffectTrans": {}, "SkillTrans": {},
         "SkillCondTrans": {}, "GameTrans": GAME[lang], "CardMaster": {}, "SidekickMaster": {}}
    return m, StatusResolver(SMA, SEM, m["StatusTrans"], m["SkillEffectTrans"], m["GameTrans"])


class TestAssemble(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contexts = {lang: context(lang) for lang in LANGS}
        # the generator needs the annotator the index generator attaches to a resolver
        import generate_skill_search_index as G
        for _, resolver in cls.contexts.values():
            G._annotator(resolver)
        cls.data, cls.stats = T.assemble(cls.contexts, report=True)
        cls.skills = cls.data["skills"]

    def test_a_language_whose_text_is_untranslated_has_no_key(self):
        # the Chinese dump just repeats the Japanese for skill 1, and has nothing for zh-Hant at all
        self.assertEqual(sorted(self.skills["1"]["t"]), ["en", "ja"])
        self.assertEqual(sorted(self.skills["2"]["t"]), ["en", "ja", "zh-Hans"])

    def test_the_text_is_tagged_and_the_tag_indexes_the_status_list(self):
        rec = self.skills["1"]
        self.assertEqual(rec["t"]["en"], "Apply <wiki-status i=0>Burn</wiki-status> to an enemy.")
        status = self.data["statuses"][rec["s"]["en"][0]]
        self.assertEqual((status["n"]["en"], status["n"]["ja"], status["id"], status["icon"]), ("Burn", "火傷", 5, "status_burn"))
        self.assertEqual(self.data["statuses"][rec["s"]["ja"][0]], status)

    def test_names_follow_the_same_availability(self):
        # a name written only in kanji reads the same in Chinese and Japanese, so it counts as both
        self.assertEqual(self.skills["1"]["n"], {"en": "Fireball", "zh-Hans": "火球", "zh-Hant": "火球", "ja": "火球"})

    def test_a_status_used_by_several_skills_is_one_entry(self):
        self.assertEqual(self.skills["1"]["s"]["ja"], self.skills["2"]["s"]["ja"])
        self.assertEqual(len(self.data["statuses"]), 1)

    def test_a_skill_with_a_name_only_has_no_text(self):
        # the kana make the name untranslated Japanese in English and Chinese
        self.assertEqual(self.skills["3"], {"n": {"ja": "名前だけ"}})

    def test_a_skill_with_nothing_is_left_out(self):
        self.assertNotIn("4", self.skills)

    def test_the_tooltip_labels_come_with_the_data(self):
        self.assertEqual(sorted(self.data["labels"]), sorted(LANGS))

    def test_the_document_is_json_and_round_trips_through_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "out", "SkillText.json")
            T.write(self.data, path)
            with open(path, encoding="utf-8") as f:
                self.assertEqual(json.load(f), self.data)


if __name__ == "__main__":
    unittest.main()
