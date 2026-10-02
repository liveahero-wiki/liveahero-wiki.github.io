import assert from "node:assert/strict";
import test from "node:test";

import * as decimal from "./decimal.js";
import { arithmeticFilters as f, formatFloat, RubyFloat } from "./ruby-numeric.js";

const s = (v) => String(v);

test("float arithmetic is exact decimal arithmetic, like Ruby Liquid's BigDecimal", () => {
  assert.equal(s(f.minus(104.3, 100)), "4.3"); // binary doubles give 4.299999999999997
  assert.equal(s(f.plus(0.1, 0.2)), "0.3");
  assert.equal(s(f.times(f.times(f.divided_by(18, 1000), 1), 2)), "0.036");
  assert.equal(s(f.times(f.divided_by(90, 50), 1)), "1.8");
});

test("divided_by always yields a float, printed with .0 when whole", () => {
  assert.equal(s(f.divided_by(200, 100)), "2.0");
  assert.equal(s(f.divided_by(150, 100)), "1.5");
  assert.ok(f.divided_by(1, 3) instanceof RubyFloat);
});

test("integer arithmetic stays integer", () => {
  assert.equal(f.plus(2, 3), 5);
  assert.equal(f.times("12", 2), 24);
  assert.equal(f.minus("5", 1), 4);
  assert.equal(f.modulo(-7, 3), 2); // Ruby's % takes the sign of the divisor
});

test("round: half away from zero, on the decimal representation", () => {
  assert.equal(f.round(2.5), 3);
  assert.equal(s(f.round(2.675, 2)), "2.68"); // 2.675 is 2.67499999… as a double
  assert.equal(f.round(f.divided_by(1000000, 7)), 142857);
});

test("string operands follow Liquid::Utils.to_number", () => {
  assert.equal(s(f.plus("1.5", "2.5")), "4.0");
  assert.equal(f.plus("12abc", 1), 13);
  assert.equal(f.plus("abc", 1), 1);
});

test("formatFloat matches Float#to_s", () => {
  assert.equal(formatFloat(2), "2.0");
  assert.equal(formatFloat(0.00001), "1.0e-05");
  assert.equal(formatFloat(1e16), "1.0e+16");
  assert.equal(formatFloat(-0.5), "-0.5");
});

test("decimal helpers", () => {
  assert.equal(decimal.add(1e-7, 2e-7), 3e-7);
  assert.equal(decimal.multiply(1.1, 1.1), 1.21);
  assert.equal(decimal.divide(1, 8), 0.125);
});
