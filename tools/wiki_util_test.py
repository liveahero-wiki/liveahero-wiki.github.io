import unittest
from wiki_util import *

class TestTextSanitize(unittest.TestCase):

    def test_one(self):
        s = "ターンの最初に自身が行動した場合、1ターンの間ATK+7.5%。<style=\"オート行動\">自身の行動時にViewPowerが10000以下で、ウェイト状態の味方がいない場合、ウェイトを行う。</style>"
        self.assertEqual(
            sanitizeSkillDescription(s),
            "ターンの最初に自身が行動した場合、1ターンの間ATK+7.5%。<wiki-auto-action>自身の行動時にViewPowerが10000以下で、ウェイト状態の味方がいない場合、ウェイトを行う。</wiki-auto-action>",
            )

if __name__ == '__main__':
    unittest.main()
