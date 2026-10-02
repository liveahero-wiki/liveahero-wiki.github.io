// Exact decimal arithmetic on JS numbers, reproducing Ruby Liquid's arithmetic filters.
//
// Liquid (Ruby) turns every Float operand into BigDecimal(float.to_s), computes in decimal and
// converts the result back with #to_f. So `104.3 | minus: 100` is exactly 4.3, where binary
// doubles give 4.299999999999997. Operands are taken from the shortest decimal representation of
// the double, which is what Float#to_s and String(number) both produce.

const POW10 = (n) => 10n ** BigInt(n);

/** value = int / 10^scale */
function parse(n) {
  const s = String(n);
  const m = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(s);
  if (!m) throw new RangeError(`not a finite number: ${s}`);
  let digits = m[2] + (m[3] ?? "");
  let scale = (m[3]?.length ?? 0) - Number(m[4] ?? 0);
  if (scale < 0) {
    digits += "0".repeat(-scale);
    scale = 0;
  }
  return { int: (m[1] ? -1n : 1n) * BigInt(digits), scale };
}

function toNumber({ int, scale }) {
  const negative = int < 0n;
  let digits = (negative ? -int : int).toString().padStart(scale + 1, "0");
  if (scale > 0) digits = `${digits.slice(0, -scale)}.${digits.slice(-scale)}`;
  return Number((negative ? "-" : "") + digits);
}

function align(a, b) {
  const scale = Math.max(a.scale, b.scale);
  return [a.int * POW10(scale - a.scale), b.int * POW10(scale - b.scale), scale];
}

const finite = (...xs) => xs.every(Number.isFinite);

export function add(x, y) {
  if (!finite(x, y)) return x + y;
  const [a, b, scale] = align(parse(x), parse(y));
  return toNumber({ int: a + b, scale });
}

export function subtract(x, y) {
  if (!finite(x, y)) return x - y;
  const [a, b, scale] = align(parse(x), parse(y));
  return toNumber({ int: a - b, scale });
}

export function multiply(x, y) {
  if (!finite(x, y)) return x * y;
  const a = parse(x);
  const b = parse(y);
  return toNumber({ int: a.int * b.int, scale: a.scale + b.scale });
}

const DIVISION_DIGITS = 40;

export function divide(x, y) {
  if (!finite(x, y) || y === 0) return x / y;
  const a = parse(x);
  const b = parse(y);
  const quotient = (a.int * POW10(b.scale + DIVISION_DIGITS)) / (b.int * POW10(a.scale));
  return toNumber({ int: quotient, scale: DIVISION_DIGITS });
}

/** Ruby's % : the result takes the sign of the divisor. */
export function modulo(x, y) {
  if (!finite(x, y) || y === 0) return Number.NaN;
  const [a, b, scale] = align(parse(x), parse(y));
  return toNumber({ int: ((a % b) + b) % b, scale });
}

/** Round half away from zero to `digits` decimal places (negative digits round to tens, hundreds, …). */
export function round(x, digits = 0) {
  if (!Number.isFinite(x)) return x;
  const d = parse(x);
  if (d.scale <= digits) return x;
  const factor = POW10(d.scale - digits);
  const abs = d.int < 0n ? -d.int : d.int;
  let q = abs / factor;
  if ((abs % factor) * 2n >= factor) q += 1n;
  const int = d.int < 0n ? -q : q;
  return digits >= 0 ? toNumber({ int, scale: digits }) : Number(int * POW10(-digits));
}
