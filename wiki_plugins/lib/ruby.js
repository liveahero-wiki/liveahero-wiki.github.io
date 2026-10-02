// Small helpers for reproducing Ruby semantics that the ported Liquid filters relied on.

/** Ruby string interpolation of a possibly-nil value: `"#{nil}"` is "". */
export const str = (v) => (v === null || v === undefined ? "" : String(v));

/** Ruby's `nil.to_i` / `"12abc".to_i` / `5.9.to_i`. */
export function toI(v) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : Math.trunc(n);
}

/** Jekyll's xml_escape: `String#encode(xml: :attr)` without the quotes, so ' is left alone. */
export function xmlEscape(input) {
  return str(input).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Ruby's `hash.dig(a, b, …)` over plain objects. */
export function dig(obj, ...keys) {
  let cur = obj;
  for (const key of keys) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[key];
  }
  return cur;
}
