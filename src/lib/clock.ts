/** Zeiten der Person, nicht Mitternacht. Die Woche beginnt montags. */

export type Weekday = 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so';

const WEEKDAYS: Weekday[] = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'];

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: Weekday;
};

export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
  } catch {
    return 'Europe/Berlin';
  }
}

export function zonedParts(now: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== 'literal') bag[part.type] = part.value;
  }
  const weekdayMap: Record<string, Weekday> = {
    Sun: 'so',
    Mon: 'mo',
    Tue: 'di',
    Wed: 'mi',
    Thu: 'do',
    Fri: 'fr',
    Sat: 'sa',
  };
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
    weekday: weekdayMap[bag.weekday] ?? 'mo',
  };
}

export function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function zonedDate(now: Date, timeZone: string): string {
  const p = zonedParts(now, timeZone);
  return isoDate(p.year, p.month, p.day);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): Weekday {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Montag der Woche, als Datum. */
export function weekKey(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const offset = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function shiftMinutes(hhmm: string, delta: number): string {
  const total = (toMinutes(hhmm) + delta + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Minuten bis zur nächsten persönlichen Morgenzeit, in der Zeitzone der Person. */
export function minutesUntilMorning(now: Date, morning: string, timeZone: string): number {
  const p = zonedParts(now, timeZone);
  const delta = toMinutes(morning) - (p.hour * 60 + p.minute);
  return delta > 0 ? delta : delta + 24 * 60;
}

export function personalDay(now: Date, morning: string, timeZone: string): string {
  const p = zonedParts(now, timeZone);
  let date = isoDate(p.year, p.month, p.day);
  if (p.hour * 60 + p.minute < toMinutes(morning)) date = addDays(date, -1);
  return date;
}

export function inWindow(now: Date, start: string, end: string, timeZone: string): boolean {
  const p = zonedParts(now, timeZone);
  const cur = p.hour * 60 + p.minute;
  const a = toMinutes(start);
  const b = toMinutes(end);
  if (a <= b) return cur >= a && cur <= b;
  return cur >= a || cur <= b;
}

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
