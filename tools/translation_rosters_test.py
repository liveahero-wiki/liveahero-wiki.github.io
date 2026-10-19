import os
import tempfile
import unittest

import bio_gsheet
import gen_translation_rosters as gen
import translatable
import voice_gsheet

DATA = {
    "jp_serif": {
        "SERIF_ABC_DAILY": "おはよう",         # game EN missing -> translatable
        "SERIF_ABC_HERO": "ヒーロー",          # game EN equal to JP -> translatable
        "SERIF_ABC_RELATION": "仲間",          # translated by the game -> not translatable
        "SERIF_ABC_EVENTA": "イベント",        # translated by the game, community text ignored
        "SERIF_ABC_PLAYER": "プレイヤー",      # no EN, but a hero's own `player` line
        "SERIF_PLAYER1_TRAINED": "キツい",     # player names only offer TRAINED
        "SERIF_PLAYER1_DAILY": "ignored",
    },
    "en_serif": {
        "SERIF_ABC_HERO": "ヒーロー",
        "SERIF_ABC_RELATION": "Friend",
        "SERIF_ABC_EVENTA": "Event",
    },
    "jp_greeting": {
        "voice_abc_h_gachaResult": "よろしく",
        "voice_abc_s_gachaResult": "サイドキック",
    },
    "en_greeting": {"voice_abc_s_gachaResult": "Sidekick"},
    "jp_voice": {"voice_abc_action": "行くぜ", "voice_abc_win": "勝ち"},
    "en_voice": {
        "voice_abc_action": "Let's go!",
        "voice_abc_daily": "Good morning",       # community text for a serif line
        "voice_abc_eventA": "ignored: the game has it",
    },
    # the game's Chinese: RELATION and EVENTA are translated everywhere, HERO only into hans (its EN is just the JP)
    "hans_serif": {"SERIF_ABC_RELATION": "朋友", "SERIF_ABC_EVENTA": "活动", "SERIF_ABC_HERO": "英雄"},
    "hant_serif": {"SERIF_ABC_RELATION": "朋友", "SERIF_ABC_EVENTA": "活動"},
    "hans_greeting": {"voice_abc_s_gachaResult": "副手"},
    "hant_greeting": {"voice_abc_s_gachaResult": "副手"},
    "hans_voice": {"voice_abc_win": "赢了"},        # community text of a manual line
}
ALL = ["en", "hans", "hant"]


class TestTranslatable(unittest.TestCase):
    def test_rule(self):
        self.assertTrue(translatable.is_translatable("jp", ""))
        self.assertTrue(translatable.is_translatable("jp", "jp"))
        self.assertFalse(translatable.is_translatable("jp", "en"))
        self.assertFalse(translatable.is_translatable("", ""))

    def test_voice_lines(self):
        lines = translatable.voice_resource_lines("abc", DATA)
        self.assertEqual(
            lines,
            {
                "voice_abc_h_gachaResult": {"jp": "よろしく", "langs": ALL},
                "voice_abc_daily": {"jp": "おはよう", "en": "Good morning", "langs": ALL},
                "voice_abc_hero": {"jp": "ヒーロー", "hans": "英雄", "langs": ["en", "hant"]},
                "voice_abc_player": {"jp": "プレイヤー", "langs": ALL},
                "voice_abc_action": {"jp": "行くぜ", "en": "Let's go!", "langs": ALL},
                "voice_abc_win": {"jp": "勝ち", "hans": "赢了", "langs": ALL},
            },
        )

    def test_player_names_only_trained(self):
        self.assertEqual(
            translatable.voice_resource_lines("player1", DATA),
            {"voice_player1_trained": {"jp": "キツい", "langs": ALL}},
        )

    def test_manual_line_with_only_en_is_listed(self):
        data = {"en_voice": {"voice_x_attack": "Hah!"}}
        self.assertEqual(translatable.voice_resource_lines("x", data), {"voice_x_attack": {"jp": "", "en": "Hah!", "langs": ALL}})

    def test_voice_master_lines_are_listed_without_jp(self):
        master = {"1": [
            {"cardType": 1, "voiceKind": 15, "voiceFilename": "", "resourceName": "x"},                      # battleStart
            {"cardType": 2, "voiceKind": 22, "voiceFilename": "", "resourceName": "x"},                      # assist
            {"cardType": 1, "voiceKind": 18, "voiceFilename": "voice_x_skillB", "resourceName": "x"},        # filename wins
            {"cardType": 1, "voiceKind": 20, "voiceFilename": "voice_x_smallDamage_simple", "resourceName": "x"},  # not a manual part
            {"cardType": 1, "voiceKind": 3, "voiceFilename": "", "resourceName": "x"},                       # daily: the game's
            {"cardType": 1, "voiceKind": 15, "voiceFilename": "", "resourceName": "y"},
        ]}
        known = translatable.voice_master_keys(master)
        self.assertEqual(known, {"x": {"voice_x_battleStart", "voice_x_assist", "voice_x_skillB"}, "y": {"voice_y_battleStart"}})
        data = {"voice_master_keys": known, "jp_voice": {"voice_x_assist": "助ける"}, "en_voice": {"voice_x_attack": "Hah!"}}
        self.assertEqual(
            translatable.voice_resource_lines("x", data),
            {
                "voice_x_battleStart": {"jp": "", "langs": ALL},
                "voice_x_assist": {"jp": "助ける", "langs": ALL},
                "voice_x_attack": {"jp": "", "en": "Hah!", "langs": ALL},
                "voice_x_skillB": {"jp": "", "langs": ALL},
            },
        )
        self.assertEqual(translatable.voice_resource_lines("z", data), {})

    def test_each_language_is_open_on_its_own(self):
        # the game translated the greeting into EN only: still open for both Chinese scripts
        data = {"jp_greeting": {"voice_abc_h_gachaResult": "よろしく"}, "en_greeting": {"voice_abc_h_gachaResult": "Hello"}}
        self.assertEqual(
            translatable.voice_resource_lines("abc", data),
            {"voice_abc_h_gachaResult": {"jp": "よろしく", "en": "Hello", "langs": ["hans", "hant"]}},
        )
        # a Chinese line equal to the JP text counts as missing
        data["hans_greeting"] = {"voice_abc_h_gachaResult": "よろしく"}
        data["hant_greeting"] = {"voice_abc_h_gachaResult": "你好"}
        self.assertEqual(
            translatable.voice_resource_lines("abc", data),
            {"voice_abc_h_gachaResult": {"jp": "よろしく", "en": "Hello", "hant": "你好", "langs": ["hans"]}},
        )

    def test_community_text_stands_in_until_the_game_ships_one(self):
        data = {
            "jp_serif": {"SERIF_ABC_DAILY": "おはよう"},
            "hant_voice": {"voice_abc_daily": "早安"},
        }
        self.assertEqual(
            translatable.voice_resource_lines("abc", data),
            {"voice_abc_daily": {"jp": "おはよう", "hant": "早安", "langs": ALL}},
        )

    def test_bios(self):
        jp = {"A": "あ", "B": "い", "C": "う"}
        en = {"B": "b", "C": "う"}
        zh = {"hans": {"B": "び", "C": "う"}, "hant": {"B": "び", "C": "う"}}
        self.assertEqual(translatable.bio_translatable(jp, en, zh_bio=zh), {"A": {"jp": "あ", "langs": ALL}, "C": {"jp": "う", "langs": ALL}})
        self.assertEqual(
            translatable.bio_translatable(jp, en, {"A": "a", "B": "ignored"}, zh_bio=zh, zh_community={"hant": {"A": "甲"}}),
            {"A": {"jp": "あ", "en": "a", "hant": "甲", "langs": ALL}, "C": {"jp": "う", "langs": ALL}},
        )

    def test_bios_open_per_language(self):
        jp = {"A": "あ"}
        # the game has EN and hant, not hans: only hans is open; the effective texts are the game's
        self.assertEqual(
            translatable.bio_translatable(jp, {"A": "a"}, zh_bio={"hans": {}, "hant": {"A": "甲"}}),
            {"A": {"jp": "あ", "en": "a", "hant": "甲", "langs": ["hans"]}},
        )
        # translated into every language: not listed at all
        self.assertEqual(translatable.bio_translatable(jp, {"A": "a"}, zh_bio={"hans": {"A": "甲"}, "hant": {"A": "甲"}}), {})

    def test_page_resource_names(self):
        with tempfile.TemporaryDirectory() as d:
            with open(os.path.join(d, "a.md"), "w", encoding="utf-8") as f:
                f.write('x\n{% include voice-table.html resourceName="abc" %}\n'
                        '{% include voice-table.html resourceName="player1,player2"\nDAILY = "x"\n%}\n')
            with open(os.path.join(d, "b.md"), "w", encoding="utf-8") as f:
                f.write('{% include voice-table.html resourceName="abc" %}{% include other.html resourceName="no" %}')
            self.assertEqual(translatable.page_resource_names(d), ["abc", "player1", "player2"])


class TestRosters(unittest.TestCase):
    def test_voice_roster(self):
        roster = gen.build_voice_roster(DATA, ["abc", "empty", "player1"], "1423")
        self.assertEqual(roster["version"], "1423")
        self.assertEqual(sorted(roster["resources"]), ["abc", "player1"])  # resources without lines are left out
        self.assertEqual(roster["resources"]["abc"]["voice_abc_daily"], {"jp": "おはよう", "en": "Good morning", "langs": ALL})

    def test_bio_roster(self):
        data = {
            "jp_bio": {"A": "あ", "B": "い"}, "en_bio": {"B": "b"}, "en_bio_community": {"A": "a"},
            "hans_bio": {"B": "び"}, "hant_bio": {"B": "び"}, "hans_bio_community": {"A": "甲"},
        }
        self.assertEqual(
            gen.build_bio_roster(data, "7"),
            {"version": "7", "bios": {"A": {"jp": "あ", "en": "a", "hans": "甲", "langs": ALL}}},
        )


class TestSheetDownloads(unittest.TestCase):
    def test_voice_rows_are_validated(self):
        rows = [
            {"voiceFilename": "voice_a_action", "jp": "行くぜ", "enApproved": "Let's go!<br>Now"},
            {"voiceFilename": "voice_a_win", "jp": "勝ち", "enApproved": "We <b>win"},
            {"voiceFilename": "voice_a_daily", "jp": "x", "enApproved": "fine"},  # serif: jp comes from the game
        ]
        jp, texts, errors = voice_gsheet.process_voice_rows(rows)
        self.assertEqual(sorted(jp), ["voice_a_action", "voice_a_win"])
        self.assertEqual(texts["en"]["voice_a_win"], "We <b>win")
        self.assertEqual(texts["hans"], {})
        self.assertEqual(len(errors), 1)
        self.assertIn("voice_a_win", errors[0])

    def test_upload_keeps_a_contributors_jp(self):
        rows = [
            {"voiceFilename": "voice_a_win", "jp": "scraped win", "enApproved": "x"},
            {"voiceFilename": "voice_a_lose", "jp": "scraped lose"},
        ]
        current = [
            {"voiceFilename": "voice_a_win", "jp": "contributor win", "jpSource": "wiki-cms #1 (A)"},
            {"voiceFilename": "voice_a_lose", "jp": "", "jpSource": ""},
        ]
        self.assertEqual(
            voice_gsheet.drop_contributor_jp(rows, current),
            [{"voiceFilename": "voice_a_win", "enApproved": "x"}, {"voiceFilename": "voice_a_lose", "jp": "scraped lose"}],
        )

    def test_bio_rows(self):
        rows = [
            {"bioKey": "A", "enApproved": "Line one\n\nLine two", "status": ""},
            {"bioKey": "B", "enApproved": "old", "status": "superseded"},
            {"bioKey": "C", "enApproved": "", "status": ""},
            {"bioKey": "D", "enApproved": "bad <i>tag", "status": ""},
        ]
        community, errors = bio_gsheet.process_bio_rows(rows)
        self.assertEqual(sorted(community["en"]), ["A", "D"])
        self.assertEqual(community["hans"], {})
        self.assertEqual(len(errors), 1)
        self.assertIn("D", errors[0])

    def test_bio_rows_with_chinese_columns(self):
        rows = [
            {"bioKey": "A", "enApproved": "", "zhHansApproved": "简介", "zhHantApproved": "簡介", "status": ""},
            {"bioKey": "B", "zhHansApproved": "旧", "status": "superseded"},
            {"bioKey": "C", "zhHantApproved": "壞 <i>標籤", "status": ""},
        ]
        community, errors = bio_gsheet.process_bio_rows(rows)
        self.assertEqual(community["en"], {})
        self.assertEqual(community["hans"], {"A": "简介"})
        self.assertEqual(community["hant"], {"A": "簡介", "C": "壞 <i>標籤"})
        self.assertEqual(len(errors), 1)
        self.assertIn("zhHantApproved", errors[0])

    def test_voice_rows_with_chinese_columns(self):
        rows = [{"voiceFilename": "voice_a_action", "jp": "行くぜ", "enApproved": "Go", "zhHansApproved": "走<br>吧", "zhHantApproved": "走吧"}]
        jp, texts, errors = voice_gsheet.process_voice_rows(rows)
        self.assertEqual(errors, [])
        self.assertEqual(texts, {"en": {"voice_a_action": "Go"}, "hans": {"voice_a_action": "走<br>吧"}, "hant": {"voice_a_action": "走吧"}})

    def test_bio_upload_rows(self):
        jp = {"A": "あ", "B": "い", "C": "う"}
        en = {"B": "b", "C": "う"}
        zh = {"hans": {"B": "び", "C": "う"}, "hant": {"B": "び", "C": "う"}}
        self.assertEqual(bio_gsheet.generate_bio_rows(jp, en, zh), [{"bioKey": "A", "jp": "あ"}, {"bioKey": "C", "jp": "う"}])
        # B was translated by the game since (in every language): mark it, ignore keys that are not bios at all
        self.assertEqual(
            bio_gsheet.superseded_rows(jp, en, ["A", "B", "ZZZ"], zh),
            [{"bioKey": "B", "status": "superseded"}],
        )
        # still open in Chinese: not superseded, and it keeps a row
        self.assertEqual(bio_gsheet.superseded_rows(jp, en, ["B"]), [])
        self.assertEqual([r["bioKey"] for r in bio_gsheet.generate_bio_rows(jp, en)], ["A", "B", "C"])


if __name__ == "__main__":
    unittest.main()
