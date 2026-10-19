// The text a voice table cell shows for a language: the game's text, unless the game has none or only a copy of the
// Japanese text, then the community's (the sheet's). With neither, the copy of the Japanese text (or nothing).
// Same rule as `effective_text` in tools/translatable.py, which decides what the translation rosters offer.
export const gameOrCommunity = (game, jp, community) => (game && game !== jp ? game : community || game);
