// Ruby distinguishes Integer from Float when printing: `200 / 100.0` is `2.0`, not `2`.
// JavaScript cannot, so values that must print as Floats are boxed in RubyFloat.
// `divided_by` always produces one (the only float literals in templates are `divided_by: N.0`
// and `1000000.0 | divided_by:`), and the arithmetic filters below propagate it.
//
// Arithmetic on Floats is exact decimal arithmetic, as in Ruby Liquid (see decimal.js).

import * as decimal from "./decimal.js";

export class RubyFloat {
  /** @param {number} n */
  constructor(n) {
    this.n = n;
  }
  valueOf() {
    return this.n;
  }
  toString() {
    return formatFloat(this.n);
  }
  toJSON() {
    return this.n;
  }
}

/** Ruby's Float#to_s */
export function formatFloat(n) {
  if (Number.isNaN(n)) return "NaN";
  if (!Number.isFinite(n)) return n < 0 ? "-Infinity" : "Infinity";
  if (n === 0) return Object.is(n, -0) ? "-0.0" : "0.0";
  const abs = Math.abs(n);
  if (abs >= 1e16 || abs < 1e-4) {
    // Ruby: 1.0e+16, 1.5e-05
    let [mant, exp] = n.toExponential().split("e");
    if (!mant.includes(".")) mant += ".0";
    const sign = exp[0] === "-" ? "-" : "+";
    const digits = exp.replace(/^[-+]/, "").padStart(2, "0");
    return `${mant}e${sign}${digits}`;
  }
  const s = String(n);
  return s.includes(".") ? s : `${s}.0`;
}

export const isFloat = (v) =>
  v instanceof RubyFloat ||
  (typeof v === "number" && !Number.isInteger(v)) ||
  (typeof v === "string" && /^\s*-?\d+\.\d+\s*$/.test(v));

/** Liquid::Utils.to_number: numbers, RubyFloat, "1.5" -> Float, other strings -> to_i, else 0. */
export function toNumber(v) {
  if (v instanceof RubyFloat) return v.n;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (/^-?\d+\.\d+$/.test(s)) return Number(s);
    const n = Number.parseInt(s, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  if (v && typeof v.valueOf === "function") {
    const p = v.valueOf();
    if (typeof p === "number") return p;
  }
  return 0;
}

const box = (result, floaty) => (floaty ? new RubyFloat(result) : result);

/** Integer operands use exact integer math, anything involving a Float goes through decimals. */
function arithmetic(intOp, decimalOp) {
  return (a, b) => {
    const floaty = isFloat(a) || isFloat(b);
    const x = toNumber(a);
    const y = toNumber(b);
    return box(floaty ? decimalOp(x, y) : intOp(x, y), floaty);
  };
}

export const arithmeticFilters = {
  plus: arithmetic((x, y) => x + y, decimal.add),
  minus: arithmetic((x, y) => x - y, decimal.subtract),
  times: arithmetic((x, y) => x * y, decimal.multiply),
  modulo: arithmetic((x, y) => ((x % y) + y) % y, decimal.modulo),
  // Always float division; see the note at the top of this file.
  divided_by: (a, b) => new RubyFloat(decimal.divide(toNumber(a), toNumber(b))),
  abs: (a) => box(Math.abs(toNumber(a)), isFloat(a)),
  floor: (a) => Math.floor(toNumber(a)),
  ceil: (a) => Math.ceil(toNumber(a)),
  round: (a, digits) => {
    const d = digits === undefined || digits === null ? 0 : toNumber(digits);
    const rounded = decimal.round(toNumber(a), d);
    return d > 0 ? new RubyFloat(rounded) : rounded;
  },
  at_least: (a, b) => box(Math.max(toNumber(a), toNumber(b)), isFloat(a) || isFloat(b)),
  at_most: (a, b) => box(Math.min(toNumber(a), toNumber(b)), isFloat(a) || isFloat(b)),
};
