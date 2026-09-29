/** Texte der Tageskarte. Nie ein Aufgabentext. */
export function cardLines(input: { done: number; streak: number; wrote: boolean; quote: string }): string[] {
  const lines = [
    'Fremdauftrag',
    `${input.done}/3 erledigt`,
    `${input.streak} Tage`,
    input.quote,
    'Fremdauftrag – Aufgaben von Fremden',
  ];
  if (input.wrote) lines.push('Du hast heute auch geschrieben.');
  return lines;
}
