import { test } from "node:test";
import assert from "node:assert/strict";
import { gameOrCommunity } from "./translation.js";

test("the game's text wins", () => {
  assert.equal(gameOrCommunity("game", "jp", "community"), "game");
  assert.equal(gameOrCommunity("game", undefined, undefined), "game");
});

test("a missing or Japanese-copy game text gives way to the community's", () => {
  assert.equal(gameOrCommunity(undefined, "jp", "community"), "community");
  assert.equal(gameOrCommunity("jp", "jp", "community"), "community");
});

test("without community text the copy of the Japanese text stays, else nothing", () => {
  assert.equal(gameOrCommunity("jp", "jp", undefined), "jp");
  assert.equal(gameOrCommunity(undefined, "jp", undefined), undefined);
});
