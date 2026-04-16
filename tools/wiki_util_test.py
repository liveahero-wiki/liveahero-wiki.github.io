import unittest
from wiki_util import *

class TestTextSanitize(unittest.TestCase):

    def test_one(self):
        s = "ターンの最初に自身が行動した場合、1ターンの間ATK+7.5%。<style=\"オート行動\">自身の行動時にViewPowerが10000以下で、ウェイト状態の味方がいない場合、ウェイトを行う。</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "ターンの最初に自身が行動した場合、1ターンの間ATK+7.5%。<wiki-auto-action>自身の行動時にViewPowerが10000以下で、ウェイト状態の味方がいない場合、ウェイトを行う。</wiki-auto-action>",
            )

    def test_auto_action(self):
        s = "+5% ATK plus another +15% when exposed.<style=\"オート行動\"></style>Prioritize using Skill 3 if buffed."
        self.assertEqual(
            sanitizeSkillDescription(s),
            "+5% ATK plus another +15% when exposed.<wiki-auto-action>Prioritize using Skill 3 if buffed.</wiki-auto-action>",
            )
        s = "+5% ATK plus another +15% when exposed.<style=\"オート行動_en\"></style>Prioritize using Skill 3 if buffed."
        self.assertEqual(
            sanitizeSkillDescription(s),
            "+5% ATK plus another +15% when exposed.<wiki-auto-action>Prioritize using Skill 3 if buffed.</wiki-auto-action>",
            )
        s = "+5% ATK plus another +15% when exposed.<style=\"オート行動\">Prioritize using Skill 3 if buffed.</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "+5% ATK plus another +15% when exposed.<wiki-auto-action>Prioritize using Skill 3 if buffed.</wiki-auto-action>",
            )
        s = "+5% ATK plus another +15% when exposed.<style=\"オート行動_en\">Prioritize using Skill 3 if buffed.</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "+5% ATK plus another +15% when exposed.<wiki-auto-action>Prioritize using Skill 3 if buffed.</wiki-auto-action>",
            )

    def test_skill_enhance(self):
        s = "<style=\"スキル強化\">ATK+10%</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "<wiki-enhance>ATK+10%</wiki-enhance>",
            )
        s = "<style=\"スキル強化_en\">ATK+10%</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "<wiki-enhance>ATK+10%</wiki-enhance>",
            )

    def test_passive_skill(self):
        s = "<style=\"パッシブ領域\">ATK+10%</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "<wiki-passive>ATK+10%</wiki-passive>",
            )
        s = "<style=\"パッシブ領域_en\">ATK+10%</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "<wiki-passive>ATK+10%</wiki-passive>",
            )

if __name__ == '__main__':
    unittest.main()
