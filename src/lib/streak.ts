import { addDays, weekKey } from './clock.ts';

export type DayMark = {
  day: string;
  done: number;
  paused: boolean;
};

/**
 * Mindestens eine erledigte Aufgabe zählt.
 * Ein verpasster Tag pro Woche (Mo–So) ist ein Schonungstag.
 * Pause friert die Streak ein und verbraucht keinen Schonungstag.
 */
export function computeStreak(input: {
  start: string;
  today: string;
  todayCounts: boolean;
  days: DayMark[];
}): { streak: number; best: number } {
  const byDay = new Map(input.days.map((day) => [day.day, day]));
  const end = input.todayCounts ? input.today : addDays(input.today, -1);
  if (end < input.start) return { streak: 0, best: 0 };

  let streak = 0;
  let best = 0;
  let graceWeek = '';
  let graceUsed = false;

  for (let cursor = input.start; cursor <= end; cursor = addDays(cursor, 1)) {
    const week = weekKey(cursor);
    if (week !== graceWeek) {
      graceWeek = week;
      graceUsed = false;
    }
    const mark = byDay.get(cursor);
    if (mark?.paused) continue;
    if ((mark?.done ?? 0) >= 1) {
      streak += 1;
      best = Math.max(best, streak);
      continue;
    }
    if (!graceUsed) {
      graceUsed = true;
      continue;
    }
    streak = 0;
  }

  return { streak, best };
}
