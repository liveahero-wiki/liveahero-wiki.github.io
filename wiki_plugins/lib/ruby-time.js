// A Date that remembers the UTC offset it was written with, and prints like
// Ruby's Time#to_s ("2026-01-22 20:00:00 +0900"). Jekyll front matter timestamps
// are Ruby Times, so templates such as
//   data-expiry="{{ page.event_end_time }}"
// depend on this exact format (assets/main.js parses it client-side).

import * as yaml from "js-yaml";

const pad = (n, width = 2) => String(n).padStart(width, "0");

export class RubyTime extends Date {
  /**
   * @param {number} ms epoch milliseconds
   * @param {number} offsetMinutes offset east of UTC, e.g. 540 for +09:00
   */
  constructor(ms, offsetMinutes = 0) {
    super(ms);
    this.offsetMinutes = offsetMinutes;
  }

  /** Wall-clock fields in this Time's own offset (read with the getUTC* methods). */
  wallClock() {
    return new Date(this.getTime() + this.offsetMinutes * 60000);
  }

  toString() {
    const w = this.wallClock();
    const abs = Math.abs(this.offsetMinutes);
    const sign = this.offsetMinutes < 0 ? "-" : "+";
    return (
      `${pad(w.getUTCFullYear(), 4)}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())} ` +
      `${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}:${pad(w.getUTCSeconds())} ` +
      `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`
    );
  }
}

/** The same instant, expressed in another offset (Jekyll shows `date` in the site timezone). */
export function inOffset(date, offsetMinutes) {
  return date instanceof Date ? new RubyTime(date.getTime(), offsetMinutes) : date;
}

/** The current time, expressed in the site's timezone offset (Asia/Tokyo has no DST). */
export function nowInOffset(offsetMinutes) {
  return new RubyTime(Date.now(), offsetMinutes);
}

const TIMESTAMP_RE =
  /^([0-9]{4})-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\.([0-9]*))?(?:[ \t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$/;
const DATE_RE = /^([0-9]{4})-([0-9][0-9])-([0-9][0-9])$/;

/**
 * Parse a YAML 1.1 timestamp scalar into a RubyTime, keeping the written offset.
 * Timestamps without an offset are taken as UTC, as in YAML.
 */
export function parseTimestamp(str, defaultOffsetMinutes = 0) {
  let m = DATE_RE.exec(str);
  if (m) {
    return new RubyTime(Date.UTC(+m[1], +m[2] - 1, +m[3]), 0);
  }
  m = TIMESTAMP_RE.exec(str);
  if (!m) return null;

  let offset = defaultOffsetMinutes;
  if (m[8] !== undefined) {
    offset = 0;
    if (m[9]) {
      offset = (+m[10] * 60 + (m[11] ? +m[11] : 0)) * (m[9] === "-" ? -1 : 1);
    }
  }
  let ms = 0;
  if (m[7]) ms = Math.round(Number(`0.${m[7]}`) * 1000);
  const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], ms) - offset * 60000;
  return new RubyTime(utc, offset);
}

/** js-yaml type that replaces the built-in timestamp type. */
const rubyTimestampType = new yaml.Type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: (data) => data !== null && (DATE_RE.test(data) || TIMESTAMP_RE.test(data)),
  construct: (data) => parseTimestamp(data),
  instanceOf: Date,
  represent: (d) => d.toISOString(),
});

// Timestamps are *implicit* types (plain scalars), so the replacement must be registered as one.
export const RUBY_YAML_SCHEMA = yaml.DEFAULT_SCHEMA.extend({ implicit: [rubyTimestampType] });

/** Front matter engine for Eleventy's gray-matter: `yaml` language with Ruby-style times. */
export const frontMatterYamlEngine = {
  parse: (str) => yaml.load(str, { schema: RUBY_YAML_SCHEMA }) ?? {},
  stringify: (obj) => yaml.dump(obj),
};
