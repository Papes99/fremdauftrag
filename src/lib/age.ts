/**
 * Altersgrenze nur über das Jahr.
 * Alt genug ist, wer im laufenden Kalenderjahr mindestens 16 wird.
 * Den Monat fragen wir nicht, weil das Geburtsdatum nicht gespeichert wird.
 */
export function isOldEnough(birthYear: number, now = new Date()): boolean {
  if (!Number.isInteger(birthYear)) return false;
  const year = now.getFullYear();
  return birthYear <= year - 16 && birthYear >= year - 120;
}

/** Jahre für die Auswahl, inklusive einiger Jahre unter 16, damit die Absage erreichbar ist. */
export function birthYearOptions(now = new Date()): number[] {
  const year = now.getFullYear();
  const years: number[] = [];
  for (let value = year - 8; value >= year - 100; value -= 1) {
    years.push(value);
  }
  return years;
}
