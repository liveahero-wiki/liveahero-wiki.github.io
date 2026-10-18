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
    def __init__(self, rows):
        self.rows = rows
        self.applied = []

    def read(self, kind):
        return dict(self.rows.get(kind, {}))

    def apply(self, writes):
        self.applied.extend(writes)


class TestPlan(unittest.TestCase):
    def test_empty_or_base_is_written(self):
        subs = [voice_sub("1234567890abcdef", [
            {"key": "voice_abc_daily", "base": "", "text": "Good\nmorning"},
            {"key": "voice_abc_action", "base": "Let's go!", "text": "Here we go!"},
        ])]
        plan = ci.plan_updates(subs, {"voice": {"voice_abc_action": "Let's go!<br>"}}, ROSTERS)
        self.assertEqual([(w["key"], w["text"]) for w in plan["writes"]],
                         [("voice_abc_daily", "Good<br>morning"), ("voice_abc_action", "Here we go!")])
        self.assertEqual(plan["writes"][0]["source"], "wiki-cms #12345678 (Rong Jie)")
        self.assertTrue(plan["writes"][0]["new_row"])
        self.assertFalse(plan["writes"][1]["new_row"])
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
        rows = {"voice": {"voice_abc_action": "Go go go!"}}
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
        plan = ci.plan_updates([sub], {"voice": {}}, ROSTERS)
        self.assertEqual(plan["writes"], [])
        ext = plan["results"][0]["external"]
        self.assertEqual(ext["outcome"]["status"], "superseded")
        self.assertEqual(ext["written"], [])

    def test_idempotent_rerun(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "Good\nmorning"}])
        plan = ci.plan_updates([sub], {"voice": {"voice_abc_daily": "Good<br>morning"}}, ROSTERS)
        self.assertEqual(plan["writes"], [])  # already in the sheet: no second write
        self.assertEqual(plan["results"][0]["external"]["written"], ["voice_abc_daily"])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "synced")

    def test_two_submissions_for_one_line(self):
        a = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "First"}])
        b = voice_sub("bbbbbbbb", [{"key": "voice_abc_daily", "base": "", "text": "Second"}])
        plan = ci.plan_updates([a, b], {"voice": {}}, ROSTERS)
        self.assertEqual([w["text"] for w in plan["writes"]], ["First"])  # one write per key
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "synced")
        ext = plan["results"][1]["external"]
        self.assertEqual(ext["outcome"]["status"], "conflict")
        self.assertEqual(ext["conflicts"][0]["current"], "First")

    def test_bio_keeps_newlines(self):
        sub = bio_sub("cccccccc", "DETAIL_ABC_H01", "", "Para one\n\nPara two")
        plan = ci.plan_updates([sub], {"bio": {}}, ROSTERS)
        self.assertEqual(plan["writes"][0]["text"], "Para one\n\nPara two")
        self.assertEqual(plan["writes"][0]["kind"], "bio")
        gone = ci.plan_updates([bio_sub("dddddddd", "DETAIL_ABC_H02", "", "x")], {"bio": {}}, ROSTERS)
        self.assertEqual(gone["results"][0]["external"]["outcome"]["status"], "superseded")

    def test_markup_is_never_written(self):
        sub = voice_sub("aaaaaaaa", [{"key": "voice_abc_daily", "base": "", "text": "<script>x</script>"}])
        plan = ci.plan_updates([sub], {"voice": {}}, ROSTERS)
        self.assertEqual(plan["writes"], [])
        self.assertEqual(plan["results"][0]["external"]["outcome"]["status"], "conflict")


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
        sheet.apply([
            {"kind": "voice", "key": "voice_abc_action", "text": "Here we go!", "source": "wiki-cms #1 (A)", "jp": "", "new_row": False},
            {"kind": "voice", "key": "voice_abc_daily", "text": "Hi", "source": "wiki-cms #1 (A)", "jp": "おはよう", "new_row": True},
        ])
        self.assertEqual(voice.headers[-1], "source")
        self.assertEqual(voice.cells, [(2, 4, "Here we go!"), (2, 5, "wiki-cms #1 (A)")])
        self.assertEqual(voice.appended, [["voice_abc_daily", "おはよう", "", "Hi", "wiki-cms #1 (A)"]])


if __name__ == "__main__":
    unittest.main()
