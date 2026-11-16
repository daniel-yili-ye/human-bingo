const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A calendar day (YYYY-MM-DD) as a local Date. Built from parts because
 * `new Date(string)` reads it as UTC midnight, which is the previous day
 * west of Greenwich.
 */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const isRealDay =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDay ? date : null;
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "2026-11-16" -> "Nov 16, 2026". */
export function formatIsoDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;
  return date.toLocaleDateString("en", { dateStyle: "medium" });
}

/** Whether `value` is a time zone name this runtime knows, such as "America/Toronto". */
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** How far `timeZone` is ahead of UTC at the given instant, in milliseconds. */
function zoneOffset(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(instant);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wallClock = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wallClock - Math.floor(instant / 1000) * 1000;
}

/**
 * The instant a calendar day (YYYY-MM-DD) begins in `timeZone`, shifted by
 * `addDays`. Returns null when the day is not a valid date.
 */
export function startOfDayInZone(value: string, timeZone: string, addDays = 0): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match || !parseIsoDate(value)) return null;
  const midnight = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + addDays);
  // The offset is looked up twice because it can differ either side of a
  // daylight saving change.
  const guess = midnight - zoneOffset(midnight, timeZone);
  return new Date(midnight - zoneOffset(guess, timeZone));
}
