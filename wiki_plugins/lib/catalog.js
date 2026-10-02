// Port of _plugins/catalog.rb: staff names (illustrators, voice actors) and grouping of cards by them.

const STAFF_SPLIT = /,|\+|＋/;

/** `processVoiceActor`: "A,B＋C" -> ["A", "B", "C"]; "？？？" stands for the five main voice actors. */
export function processVoiceActor(name) {
  if (name === "？？？") name = "後藤ヒロキ,岩永悠平,天野ユウ,戸板優衣,樹元オリエ";
  if (name === null || name === undefined) return [];
  // Ruby's String#split drops trailing empty fields
  const parts = String(name).split(STAFF_SPLIT);
  while (parts.length && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/**
 * `processCharaGroup`: group cards by each staff name in `card[key]`, in first-seen order, with the
 * English name from `maps[name].en`.
 */
export function processCharaGroup(cards, key, maps) {
  const group = new Map();
  for (const card of cards) {
    for (const n of processVoiceActor(card[key])) {
      if (!group.has(n)) group.set(n, []);
      group.get(n).push(card);
    }
  }
  return [...group].map(([name, items]) => ({ name, en: maps?.[name]?.en, items }));
}
