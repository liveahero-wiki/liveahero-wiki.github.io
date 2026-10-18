import unittest

import yaml

import bio_strip_front_matter as bio
import voice_strip_inline as voice

PAGE = '''intro
{% include voice-table.html resourceName="ryekie"
h_gachaResult = "My name's Ryekie!<br>Hi %} there"
RELATION = "Huckle has \\"always\\" been my friend"
skill = 'single quoted'
%}

{% include voice-table.html resourceName="plain" %}
{% include voice-table.html resourceName="player1,player2"
PLAYER1_TRAINED = "Hard!"
%}
'''


class TestVoiceStrip(unittest.TestCase):
    def test_parse_blocks(self):
        blocks = voice.parse_blocks(PAGE)
        self.assertEqual(len(blocks), 3)
        self.assertEqual([p[0] for p in blocks[0]["params"]], ["resourceName", "h_gachaResult", "RELATION", "skill"])
        # a `%}` inside a quoted value does not end the include
        self.assertEqual(blocks[0]["params"][1][2], "My name's Ryekie!<br>Hi %} there")
        self.assertEqual(blocks[0]["params"][2][2], 'Huckle has "always" been my friend')
        self.assertEqual(voice.collapse(PAGE, blocks[0]), '{% include voice-table.html resourceName="ryekie" %}')
        self.assertEqual(PAGE[blocks[1]["start"]:blocks[1]["end"]], '{% include voice-table.html resourceName="plain" %}')

    def test_unparsable_include_is_reported(self):
        with self.assertRaises(ValueError):
            voice.parse_blocks('{% include voice-table.html resourceName="a" oops %}')

    def test_keys(self):
        self.assertEqual(voice.sheet_key("abc", "EVENTA"), "voice_abc_eventA")
        self.assertEqual(voice.sheet_key("abc", "h_gachaResult"), "voice_abc_h_gachaResult")
        self.assertEqual(voice.sheet_key("abc", "skillA"), "voice_abc_skillA")
        self.assertEqual(voice.serif_key("abc", "EVENTA"), "SERIF_ABC_EVENTA")
        self.assertIsNone(voice.serif_key("abc", "skill"))
        self.assertEqual(voice.resolve("player1,player2", "PLAYER2_TRAINED"), ("player2", "TRAINED"))

    def test_norm(self):
        self.assertEqual(voice.norm("a<br>b  c\n"), "a b c")


FRONT_MATTER = '''title: X
heroes:
- stockId: 1
  BIO_H01: |-
    First line

    second paragraph
  BIO_H02: "one line"
  extra_sprites: a,b
- stockId: 2
  BIO_H01: |-
    Only text
sidekicks:
- stockId: 3
  BIO_S01: |-
    Side

    story
  limited: true
'''


class TestBioStrip(unittest.TestCase):
    def test_strip_keys(self):
        new = bio.strip_keys(FRONT_MATTER)
        self.assertEqual(new, '''title: X
heroes:
- stockId: 1
  extra_sprites: a,b
- stockId: 2
sidekicks:
- stockId: 3
  limited: true
''')
        self.assertEqual(yaml.safe_load(new), bio.drop_keys(yaml.safe_load(FRONT_MATTER)))

    def test_crlf_is_kept(self):
        new = bio.strip_keys(FRONT_MATTER.replace("\n", "\r\n"))
        self.assertNotIn("BIO_", new)
        self.assertEqual(new.count("\n"), new.count("\r\n"))

    def test_texts(self):
        texts = bio.bio_texts(yaml.safe_load(FRONT_MATTER))
        self.assertEqual([(k, s) for k, s, _ in texts], [("H01", 1), ("H02", 1), ("H01", 2), ("S01", 3)])


if __name__ == "__main__":
    unittest.main()
