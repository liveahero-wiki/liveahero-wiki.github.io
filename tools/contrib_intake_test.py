import unittest

import contrib_intake as ci

ROSTERS = {
    "voice": {"version": "1", "resources": {
        "abc": {
            "voice_abc_action": {"jp": "行くぜ", "en": "Let's go!"},
            "voice_abc_daily": {"jp": "おはよう"},
            "voice_abc_hero": {"jp": "ヒーロー"},
        },
    }},
    "bio": {"version": "1", "bios": {"DETAIL_ABC_H01": {"jp": "あ"}}},
}


def voice_sub(sub_id, lines, name="Rong Jie"):
    return {"kind": "voice", "id": sub_id, "displayName": name, "payload": {"resourceName": "abc", "lines": lines}}


def bio_sub(sub_id, key, base, text):
    return {"kind": "bio", "id": sub_id, "displayName": "Bio Person", "payload": {"key": key, "base": base, "text": text}}


class FakeCms:
    def __init__(self, items):
        self.items = items
        self.posted = []

    def list_submissions(self, type_id, limit=100):
        return self.items.get(type_id, [])

    def post_external(self, type_id, results):
        self.posted.append((type_id, results))
        return {"stored": len(results), "skipped": 0}


class FakeSheet:
    def __init__(self, rows, jp=None):
        self.rows = rows
        self.jp = jp or {}
        self.applied = []

    def read(self, kind, lang="en"):
        return dict(self.rows.get(kind, {}).get(lang, {}))

    def read_jp(self, kind):
        return dict(self.jp.get(kind, {}))

    def apply(self, writes):
        self.applied.extend(writes)


class TestPlan(unittest.TestCase):
    def test_empty_or_base_is_written(self):
        subs = [voice_sub("1234567890abcdef", [
            {"key": "voice_abc_daily", "base": "", "text": "Good\nmorning"},
            {"key": "voice_abc_action", "base": "Let's go!", "text": "Here we go!"},
        ])]
        plan = ci.plan_updates(subs, {"voice": {"en": {"voice_abc_action": "Let's go!<br>"}}}, ROSTERS)
        self.assertEqual([(w["key"], w["text"]) for w in plan["writes"]],
                         [("voice_abc_daily", "Good<br>morning"), ("voice_abc_action", "Here we go!")])
        self.assertEqual(plan["writes"][0]["source"], "wiki-cms #12345678 (Rong Jie)")
        self.assertEqual(plan["writes"][0]["jp"], "おはよう")
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"], {"status": "synced"})
        self.assertEqual(ext["written"], ["voice_abc_daily", "voice_abc_action"])
        self.assertEqual(ext["conflicts"], [])

    def test_conflict_and_partial(self):
        lines = [
            {"key": "voice_abc_action", "base": "Let's go!", "text": "Here we go!"},
            {"key": "voice_abc_daily", "base": "", "text": "Hello"},
        ]
        rows = {"voice": {"en": {"voice_abc_action": "Go go go!"}}}
        plan = ci.plan_updates([voice_sub("aaaaaaaa", lines)], rows, ROSTERS)
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"]["status"], "partial")  # something was written, something conflicted
        self.assertEqual(ext["written"], ["voice_abc_daily"])
        self.assertEqual(ext["conflicts"], [{"key": "voice_abc_action", "base": "Let's go!", "current": "Go go go!"}])

        only = ci.plan_updates([voice_sub("aaaaaaaa", lines[:1])], rows, ROSTERS)
        self.assertEqual(only["writes"], [])
        self.assertEqual(only["results"][0]["external"]["outcome"]["status"], "conflict")

    def test_superseded_when_the_game_has_the_line(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_relation", "base": "", "text": "Friend"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {}}}, ROSTERS)
        self.assertEqual(plan["writes"], [])
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"]["status"], "superseded")
        self.assertEqual(ext["written"], [])

    def test_idempotent_rerun(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "Good\nmorning"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {"voice_abc_daily": "Good<br>morning"}}}, ROSTERS)
        self.assertEqual(plan["writes"], [])  # already in the sheet: no second write
        self.assertEqual(plan["results"][0]["external"]["written"], ["voice_abc_daily"])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "synced")

    def test_two_submissions_for_one_line(self):
        a = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "First"}])
        b = voice_sub("bbbbbbbb", [{"key": "voice_abc_daily", "base": "", "text": "Second"}])
        plan = ci.plan_updates([a, b], {"voice": {"en": {}}}, ROSTERS)
        self.assertEqual([w["text"] for w in plan["writes"]], ["First"])  # one write per key
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "synced")
        ext = plan["results"][1]["external"]
        self.assertEqual(ext["outcome"]["status"], "conflict")
        self.assertEqual(ext["conflicts"][0]["current"], "First")

    def test_bio_keeps_newlines(self):
        sub = bio_sub("cccccccc", "DETAIL_ABC_H01", "", "Para one\n\nPara two")
        plan = ci.plan_updates([sub], {"bio": {"en": {}}}, ROSTERS)
        self.assertEqual(plan["writes"][0]["text"], "Para one\n\nPara two")
        self.assertEqual(plan["writes"][0]["kind"], "bio")
        gone = ci.plan_updates([bio_sub("dddddddd", "DETAIL_ABC_H02", "", "x")], {"bio": {"en": {}}}, ROSTERS)
        self.assertEqual(gone["results"][0]["external"]["outcome"]["status"], "superseded")

    def test_jp_transcription_with_translation(self):
        # a line VoiceMaster knows but nobody transcribed: no JP in the roster, no sheet row
        rosters = {**ROSTERS, "voice": {"version": "1", "resources": {"abc": {"voice_abc_battleStart": {"jp": ""}}}}}
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_battleStart", "base": "", "text": "Let's fight", "jp": "いくぞ\nみんな"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {}}}, rosters, {"voice": {}})
        [w] = plan["writes"]
        self.assertEqual((w["text"], w["jp"], w["set_jp"]), ("Let's fight", "いくぞ<br>みんな", True))
        self.assertEqual(plan["results"][0]["external"]["outcome"], {"status": "synced"})

    def test_jp_only_line(self):
        rosters = {**ROSTERS, "voice": {"version": "1", "resources": {"abc": {"voice_abc_win": {"jp": ""}}}}}
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_win", "base": "", "text": "", "jp": "勝った"}])
        # the sheet already has a row for the line, with an empty jp
        plan = ci.plan_updates([sub], {"voice": {"en": {"voice_abc_win": ""}}}, rosters, {"voice": {"voice_abc_win": ""}})
        [w] = plan["writes"]
        self.assertEqual((w["text"], w["jp"], w["set_jp"]), (None, "勝った", True))

    def test_jp_conflict_writes_nothing_of_the_line(self):
        rosters = {**ROSTERS, "voice": {"version": "1", "resources": {"abc": {"voice_abc_win": {"jp": "勝ち"}}}}}
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_win", "base": "", "text": "We win", "jp": "勝った"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {"voice_abc_win": ""}}}, rosters, {"voice": {"voice_abc_win": "勝ち"}})
        self.assertEqual(plan["writes"], [])
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"]["status"], "conflict")
        self.assertEqual(ext["conflicts"][0]["current"], "勝ち")

    def test_same_jp_counts_as_written_and_en_still_goes(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_action", "base": "Let's go!", "text": "Here we go!", "jp": "行くぜ"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {"voice_abc_action": "Let's go!"}}}, ROSTERS, {"voice": {"voice_abc_action": "行くぜ"}})
        [w] = plan["writes"]
        self.assertEqual((w["text"], w["set_jp"]), ("Here we go!", False))

    def test_line_without_text_and_jp_is_rejected(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "  "}])
        plan = ci.plan_updates([sub], {"voice": {"en": {}}}, ROSTERS)
        self.assertEqual(plan["writes"], [])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "conflict")

    def test_markup_in_jp_is_never_written(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "ok", "jp": "<b>x"}])
        self.assertEqual(ci.plan_updates([sub], {"voice": {"en": {}}}, ROSTERS)["writes"], [])

    def test_markup_is_never_written(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "<script>x</script>"}])
        plan = ci.plan_updates([sub], {"voice": {"en": {}}}, ROSTERS)
        self.assertEqual(plan["writes"], [])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "conflict")


ZH_ROSTERS = {
    "voice": {"version": "1", "resources": {
        "abc": {
            "voice_abc_daily": {"jp": "おはよう", "langs": ["en", "hans", "hant"]},
            "voice_abc_hero": {"jp": "ヒーロー", "langs": ["en"]},       # the game has both Chinese texts
            "voice_abc_relation": {"jp": "仲間", "en": "Friend", "langs": ["hans", "hant"]},
        },
    }},
    "bio": {"version": "1", "bios": {"DETAIL_ABC_H01": {"jp": "あ", "langs": ["hant"]}}},
}


def zh_sub(sub_id, lang, lines, kind="voice"):
    if kind == "bio":
        return {"kind": "bio", "id": sub_id, "lang": lang, "displayName": "Zh Person", "payload": lines}
    return {"kind": "voice", "id": sub_id, "lang": lang, "displayName": "Zh Person", "payload": {"resourceName": "abc", "lines": lines}}


class TestPlanChinese(unittest.TestCase):
    def test_chinese_text_goes_to_its_own_language(self):
        sub = zh_sub("1234567890abcdef", "zh-Hans", [{"key": "voice_abc_daily", "base": "", "text": "早上\n好"}])
        plan = ci.plan_updates([sub], {"voice": {"zh-Hans": {}}}, ZH_ROSTERS)
        [w] = plan["writes"]
        self.assertEqual((w["lang"], w["text"], w["source"], w["set_jp"]), ("zh-Hans", "早上<br>好", "wiki-cms #12345678 (Zh Person)", False))
        self.assertEqual(plan["results"][0]["external"]["outcome"], {"status": "synced"})

    def test_conflict_is_judged_against_the_languages_own_column(self):
        # EN already has text in the sheet; the zh column is empty -> no conflict
        sub = zh_sub("aaaaaaaa", "zh-Hant", [{"key": "voice_abc_daily", "base": "", "text": "早安"}])
        rows = {"voice": {"en": {"voice_abc_daily": "Good morning"}, "zh-Hant": {"voice_abc_daily": ""}}}
        plan = ci.plan_updates([sub], rows, ZH_ROSTERS)
        self.assertEqual([(w["lang"], w["text"]) for w in plan["writes"]], [("zh-Hant", "早安")])
        # a translator changed the zh cell in the meantime
        rows["voice"]["zh-Hant"]["voice_abc_daily"] = "早上好"
        plan = ci.plan_updates([sub], rows, ZH_ROSTERS)
        self.assertEqual(plan["writes"], [])
        self.assertEqual(plan["results"][0]["external"]["conflicts"][0]["current"], "早上好")

    def test_superseded_per_language(self):
        # the game now has the line in Chinese: a zh submission is superseded, an EN one is not
        zh = zh_sub("aaaaaaaa", "zh-Hans", [{"key": "voice_abc_hero", "base": "", "text": "英雄"}])
        en = zh_sub("bbbbbbbb", "en", [{"key": "voice_abc_hero", "base": "", "text": "Hero"}])
        plan = ci.plan_updates([zh, en], {"voice": {"zh-Hans": {}, "en": {}}}, ZH_ROSTERS)
        self.assertEqual([(w["lang"], w["text"]) for w in plan["writes"]], [("en", "Hero")])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "superseded")
        self.assertEqual(plan["results"][1]["external"]["outcome"]["status"], "synced")

    def test_english_closed_chinese_open(self):
        en = zh_sub("aaaaaaaa", "en", [{"key": "voice_abc_relation", "base": "", "text": "Friend!"}])
        zh = zh_sub("bbbbbbbb", "zh-Hant", [{"key": "voice_abc_relation", "base": "", "text": "朋友"}])
        plan = ci.plan_updates([en, zh], {"voice": {"en": {}, "zh-Hant": {}}}, ZH_ROSTERS)
        self.assertEqual([(w["lang"], w["text"]) for w in plan["writes"]], [("zh-Hant", "朋友")])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "superseded")

    def test_bio_in_chinese_keeps_newlines(self):
        sub = zh_sub("cccccccc", "zh-Hant", {"key": "DETAIL_ABC_H01", "base": "", "text": "一\n\n二"}, kind="bio")
        plan = ci.plan_updates([sub], {"bio": {"zh-Hant": {}}}, ZH_ROSTERS)
        self.assertEqual((plan["writes"][0]["lang"], plan["writes"][0]["text"]), ("zh-Hant", "一\n\n二"))
        other = zh_sub("dddddddd", "zh-Hans", {"key": "DETAIL_ABC_H01", "base": "", "text": "一"}, kind="bio")
        self.assertEqual(ci.plan_updates([other], {"bio": {"zh-Hans": {}}}, ZH_ROSTERS)["results"][0]["external"]["outcome"]["status"], "superseded")

    def test_jp_is_ignored_outside_english(self):
        sub = zh_sub("aaaaaaaa", "zh-Hans", [{"key": "voice_abc_daily", "base": "", "text": "早", "jp": "別の"}])
        [w] = ci.plan_updates([sub], {"voice": {"zh-Hans": {}}}, ZH_ROSTERS, {"voice": {}})["writes"]
        self.assertFalse(w["set_jp"])

    def test_one_write_per_line_and_language(self):
        a = zh_sub("aaaaaaaa", "zh-Hans", [{"key": "voice_abc_daily", "base": "", "text": "甲"}])
        b = zh_sub("bbbbbbbb", "zh-Hant", [{"key": "voice_abc_daily", "base": "", "text": "乙"}])
        c = zh_sub("cccccccc", "zh-Hans", [{"key": "voice_abc_daily", "base": "", "text": "丙"}])
        plan = ci.plan_updates([a, b, c], {"voice": {"zh-Hans": {}, "zh-Hant": {}}}, ZH_ROSTERS)
        self.assertEqual([(w["lang"], w["text"]) for w in plan["writes"]], [("zh-Hans", "甲"), ("zh-Hant", "乙")])
        self.assertEqual(plan["results"][2]["external"]["outcome"]["status"], "conflict")

    def test_unknown_language_is_never_written(self):
        sub = zh_sub("aaaaaaaa", "fr", [{"key": "voice_abc_daily", "base": "", "text": "Bonjour"}])
        plan = ci.plan_updates([sub], {}, ZH_ROSTERS)
        self.assertEqual(plan["writes"], [])
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"], {"status": "conflict", "label": ci.UNSUPPORTED_LANG})  # not `superseded`: the game has nothing to do with it
        self.assertEqual([c["key"] for c in ext["conflicts"]], ["voice_abc_daily"])

    def test_chinese_needs_japanese_text(self):
        rosters = {"voice": {"version": "1", "resources": {"abc": {"voice_abc_win": {"jp": "", "langs": ["en", "hans", "hant"]}}}}}
        zh = zh_sub("aaaaaaaa", "zh-Hans", [{"key": "voice_abc_win", "base": "", "text": "赢了"}])
        plan = ci.plan_updates([zh], {"voice": {"zh-Hans": {}}}, rosters, {"voice": {}})
        self.assertEqual(plan["writes"], [])
        self.assertEqual(plan["results"][0]["external"]["conflicts"][0]["current"], ci.NO_JP)
        # a transcription already in the sheet is enough
        plan = ci.plan_updates([zh], {"voice": {"zh-Hans": {}}}, rosters, {"voice": {"voice_abc_win": "勝った"}})
        self.assertEqual([w["text"] for w in plan["writes"]], ["赢了"])


class TestRun(unittest.TestCase):
    def setUp(self):
        self.cms = FakeCms({
            "lah-voice-tl": [{**voice_sub("1111111111", [{"key": "voice_abc_daily", "base": "", "text": "Hi"}]), "approvedAt": 2}],
            "lah-bio-tl": [{**bio_sub("2222222222", "DETAIL_ABC_H01", "", "Bio"), "approvedAt": 1}],
        })
        for items in self.cms.items.values():
            for item in items:
                del item["kind"]

    def test_writes_posts_and_dispatches(self):
        sheet = FakeSheet({"voice": {}, "bio": {}})
        dispatched = []
        ci.run(self.cms, sheet, ROSTERS, dispatch=lambda: dispatched.append(1))
        self.assertEqual([(w["kind"], w["key"]) for w in sheet.applied], [("bio", "DETAIL_ABC_H01"), ("voice", "voice_abc_daily")])
        self.assertEqual({t for t, _ in self.cms.posted}, {"lah-voice-tl", "lah-bio-tl"})
        posted = dict(self.cms.posted)["lah-voice-tl"]
        self.assertEqual(posted[0]["id"], "1111111111")
        self.assertEqual(posted[0]["external"]["outcome"]["status"], "synced")
        self.assertEqual(dispatched, [1])

    def test_dry_run_changes_nothing(self):
        sheet = FakeSheet({})
        dispatched = []
        plan = ci.run(self.cms, sheet, ROSTERS, dry_run=True, dispatch=lambda: dispatched.append(1))
        self.assertEqual(len(plan["writes"]), 2)
        self.assertEqual(sheet.applied, [])
        self.assertEqual(self.cms.posted, [])
        self.assertEqual(dispatched, [])

    def test_nothing_to_do_does_not_touch_the_sheet(self):
        class NoSheet:
            def read(self, kind):
                raise AssertionError("sheet must not be read")
        ci.run(FakeCms({}), NoSheet(), ROSTERS, dispatch=lambda: self.fail("no dispatch"))

    def test_no_dispatch_without_writes(self):
        cms = FakeCms({"lah-voice-tl": [{**voice_sub("3333333333", [{"key": "voice_abc_relation", "base": "", "text": "x"}]), "approvedAt": 1}]})
        del cms.items["lah-voice-tl"][0]["kind"]
        ci.run(cms, FakeSheet({"voice": {}}), ROSTERS, dispatch=lambda: self.fail("no dispatch"))
        self.assertEqual(cms.posted[0][1][0]["external"]["outcome"]["status"], "superseded")


class FakeCell:
    pass


class FakeWorksheet:
    col_count = 4

    def __init__(self, headers, rows):
        self.headers = list(headers)
        self.rows = [list(r) for r in rows]
        self.cells = []
        self.appended = []

    def row_values(self, n):
        return list(self.headers)

    def col_values(self, col):
        return [self.headers[col - 1]] + [r[col - 1] for r in self.rows]

    def update_cell(self, row, col, value):
        self.headers.append(value)

    def add_cols(self, n):
        self.col_count += n

    def update_cells(self, cells):
        self.cells.extend((c.row, c.col, c.value) for c in cells)

    def append_rows(self, rows):
        self.appended.extend(rows)

    def get_all_records(self):
        return [dict(zip(self.headers, r)) for r in self.rows]


class FakeSpreadsheet:
    def __init__(self, tabs):
        self.tabs = tabs

    def worksheet(self, name):
        return self.tabs[name]


class TestGspreadSheet(unittest.TestCase):
    def test_apply_updates_appends_and_adds_source_column(self):
        voice = FakeWorksheet(["voiceFilename", "jp", "enMachineTranslated", "enApproved"],
                              [["voice_abc_action", "行くぜ", "", "Let's go!"]])
        sheet = ci.GspreadSheet(FakeSpreadsheet({"Voice": voice}))
        self.assertEqual(sheet.read("voice"), {"voice_abc_action": "Let's go!"})
        self.assertEqual(sheet.read("voice", "zh-Hans"), {"voice_abc_action": ""})  # no such column yet
        self.assertEqual(sheet.read_jp("voice"), {"voice_abc_action": "行くぜ"})
        sheet.apply([
            {"kind": "voice", "key": "voice_abc_action", "text": "Here we go!", "source": "wiki-cms #1 (A)", "jp": "", "set_jp": False},
            {"kind": "voice", "key": "voice_abc_daily", "text": "Hi", "source": "wiki-cms #1 (A)", "jp": "おはよう", "set_jp": False},
        ])
        self.assertEqual(voice.headers[-1], "source")
        self.assertEqual(voice.cells, [(2, 4, "Here we go!"), (2, 5, "wiki-cms #1 (A)")])
        self.assertEqual(voice.appended, [["voice_abc_daily", "おはよう", "", "Hi", "wiki-cms #1 (A)"]])

    def test_apply_writes_a_submitted_jp(self):
        voice = FakeWorksheet(["voiceFilename", "jp", "enMachineTranslated", "enApproved"], [["voice_abc_win", "", "", ""]])
        sheet = ci.GspreadSheet(FakeSpreadsheet({"Voice": voice}))
        sheet.apply([
            {"kind": "voice", "key": "voice_abc_win", "text": None, "source": "s", "jp": "勝った", "set_jp": True},
            {"kind": "voice", "key": "voice_abc_lose", "text": None, "source": "s", "jp": "負けた", "set_jp": True},
        ])
        self.assertEqual(voice.headers[-2:], ["source", "jpSource"])
        self.assertEqual(voice.cells, [(2, 2, "勝った"), (2, 6, "s"), (2, 5, "s")])  # EN cell untouched
        self.assertEqual(voice.appended, [["voice_abc_lose", "負けた", "", "", "s", "s"]])

    def test_apply_writes_chinese_columns_and_merges_languages_of_a_new_row(self):
        voice = FakeWorksheet(["voiceFilename", "jp", "enMachineTranslated", "enApproved"], [["voice_abc_action", "行くぜ", "", "Let's go!"]])
        sheet = ci.GspreadSheet(FakeSpreadsheet({"Voice": voice}))
        sheet.apply([
            {"kind": "voice", "key": "voice_abc_action", "lang": "zh-Hans", "text": "走吧", "source": "s1", "jp": "", "set_jp": False},
            {"kind": "voice", "key": "voice_abc_daily", "lang": "zh-Hans", "text": "早", "source": "s2", "jp": "おはよう", "set_jp": False},
            {"kind": "voice", "key": "voice_abc_daily", "lang": "zh-Hant", "text": "早安", "source": "s3", "jp": "おはよう", "set_jp": False},
        ])
        self.assertEqual(voice.headers, ["voiceFilename", "jp", "enMachineTranslated", "enApproved",
                                         "zhHansApproved", "zhHansSource", "zhHantApproved", "zhHantSource"])
        self.assertEqual(voice.cells, [(2, 5, "走吧"), (2, 6, "s1")])
        # one new row for the key, both languages in it, the English cells empty
        self.assertEqual(voice.appended, [["voice_abc_daily", "おはよう", "", "", "早", "s2", "早安", "s3"]])

    def test_read_a_chinese_column(self):
        voice = FakeWorksheet(["voiceFilename", "jp", "enMachineTranslated", "enApproved", "zhHantApproved"],
                              [["voice_abc_action", "行くぜ", "", "Let's go!", "走吧"], ["voice_abc_win", "", "", "", ""]])
        sheet = ci.GspreadSheet(FakeSpreadsheet({"Voice": voice}))
        self.assertEqual(sheet.read("voice", "zh-Hant"), {"voice_abc_action": "走吧", "voice_abc_win": ""})


if __name__ == "__main__":
    unittest.main()
