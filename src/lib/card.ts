/** Ein Tag, sonst Tage. */
export function streakLine(count: number): string {
  return count === 1 ? '1 Tag' : `${count} Tage`;
}

/** Texte der Tageskarte. Nie ein Aufgabentext. */
export function cardLines(input: { done: number; streak: number; wrote: boolean; quote: string }): string[] {
  const lines = [
    'Fremdauftrag',
    `${input.done}/3 erledigt`,
    streakLine(input.streak),
    input.quote,
    'Fremdauftrag – Aufgaben von Fremden',
  ];
  if (input.wrote) lines.push('Du hast heute auch geschrieben.');
  return lines;
}
