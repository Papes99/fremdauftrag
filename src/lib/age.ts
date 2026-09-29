/**
 * Altersgrenze über das Jahr, plus eine Frage nur im Grenzjahr.
 * Das Jahr und die Geburtstagsantwort werden nicht gespeichert.
 */
export type AgeGate = 'allow' | 'refuse' | 'ask';

export function boundaryYear(now = new Date()): number {
  return now.getFullYear() - 16;
}

export function ageGate(birthYear: number, now = new Date()): AgeGate {
  if (!Number.isInteger(birthYear)) return 'refuse';
  const year = now.getFullYear();
  if (birthYear < year - 120 || birthYear > year) return 'refuse';
  if (birthYear < year - 16) return 'allow';
  if (birthYear === year - 16) return 'ask';
  return 'refuse';
}

/** Ja zur Geburtstagsfrage zählt nur im Grenzjahr. Sonst wird die Antwort ignoriert. */
export function isOldEnough(
  birthYear: number,
  hadBirthdayThisYear: boolean | null = null,
  now = new Date(),
): boolean {
  const gate = ageGate(birthYear, now);
  if (gate === 'allow') return true;
  if (gate === 'ask') return hadBirthdayThisYear === true;
  return false;
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
