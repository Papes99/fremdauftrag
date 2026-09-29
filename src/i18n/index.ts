import de from './de.json';

/** Alle sichtbaren Texte. Später kann hier eine zweite Sprache dazukommen. */
export const copy = de;

export function fill(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
