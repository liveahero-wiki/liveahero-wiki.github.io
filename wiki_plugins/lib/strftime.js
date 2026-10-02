// Ruby-flavoured strftime for the formats the wiki uses (%-d %b %Y %R %s %m/%d %Y%m%d …).
// LiquidJS's built-in lacks %R and ignores the Time's own UTC offset.

import { RubyTime } from "./ruby-time.js";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n, width, ch = "0") => String(n).padStart(width, ch);

function dayOfYear(w) {
  const start = Date.UTC(w.getUTCFullYear(), 0, 0);
  return Math.floor((w.getTime() - start) / 86400000);
}

function zoneName(offsetMinutes) {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  return `${sign}${pad(Math.floor(abs / 60), 2)}${pad(abs % 60, 2)}`;
}

/**
 * @param {Date} date a RubyTime (own offset) or plain Date (rendered at defaultOffset)
 * @param {string} format
 * @param {number} defaultOffset minutes east of UTC used for plain Dates
 */
export function strftime(date, format, defaultOffset = 540) {
  const offset = date instanceof RubyTime ? date.offsetMinutes : defaultOffset;
  const w = new Date(date.getTime() + offset * 60000); // read with getUTC*

  const hour12 = w.getUTCHours() % 12 || 12;

  return format.replace(/%([-_0^#:]*)(\d*)([a-zA-Z%+])/g, (match, flags, width, conv) => {
    let value;
    let padDefault = "0";
    let padWidth = 0;
    switch (conv) {
      case "Y": value = w.getUTCFullYear(); padWidth = 0; break;
      case "C": value = Math.floor(w.getUTCFullYear() / 100); padWidth = 2; break;
      case "y": value = w.getUTCFullYear() % 100; padWidth = 2; break;
      case "m": value = w.getUTCMonth() + 1; padWidth = 2; break;
      case "d": value = w.getUTCDate(); padWidth = 2; break;
      case "e": value = w.getUTCDate(); padWidth = 2; padDefault = " "; break;
      case "j": value = dayOfYear(w); padWidth = 3; break;
      case "H": value = w.getUTCHours(); padWidth = 2; break;
      case "k": value = w.getUTCHours(); padWidth = 2; padDefault = " "; break;
      case "I": value = hour12; padWidth = 2; break;
      case "l": value = hour12; padWidth = 2; padDefault = " "; break;
      case "M": value = w.getUTCMinutes(); padWidth = 2; break;
      case "S": value = w.getUTCSeconds(); padWidth = 2; break;
      case "L": value = w.getUTCMilliseconds(); padWidth = 3; break;
      case "N": value = w.getUTCMilliseconds() * 1000000; padWidth = 9; break;
      case "u": value = w.getUTCDay() || 7; break;
      case "w": value = w.getUTCDay(); break;
      case "s": value = Math.floor(date.getTime() / 1000); break;
      case "p": value = w.getUTCHours() < 12 ? "AM" : "PM"; break;
      case "P": value = w.getUTCHours() < 12 ? "am" : "pm"; break;
      case "A": value = DAYS[w.getUTCDay()]; break;
      case "a": value = DAYS[w.getUTCDay()].slice(0, 3); break;
      case "B": value = MONTHS[w.getUTCMonth()]; break;
      case "b": case "h": value = MONTHS[w.getUTCMonth()].slice(0, 3); break;
      case "z": value = zoneName(offset); break;
      case "Z": value = offset === 0 ? "UTC" : zoneName(offset); break;
      case "%": return "%";
      case "n": return "\n";
      case "t": return "\t";
      // composites
      case "R": return strftime(date, "%H:%M", defaultOffset);
      case "T": case "X": return strftime(date, "%H:%M:%S", defaultOffset);
      case "D": case "x": return strftime(date, "%m/%d/%y", defaultOffset);
      case "F": return strftime(date, "%Y-%m-%d", defaultOffset);
      case "c": return strftime(date, "%a %b %e %H:%M:%S %Y", defaultOffset);
      default: return match;
    }

    let out = String(value);
    if (typeof value === "number") {
      let ch = padDefault;
      if (flags.includes("-")) padWidth = 0;
      if (flags.includes("_")) ch = " ";
      if (flags.includes("0")) ch = "0";
      if (width) padWidth = Number(width);
      out = out.padStart(padWidth, ch);
    } else {
      if (flags.includes("^")) out = out.toUpperCase();
      if (flags.includes("#")) out = out === out.toUpperCase() ? out.toLowerCase() : out.toUpperCase();
      if (width) out = out.padStart(Number(width), " ");
    }
    return out;
  });
}
