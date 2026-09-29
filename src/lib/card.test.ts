import assert from 'node:assert/strict';
import test from 'node:test';
import { cardLines, streakLine } from './card.ts';

test('ein einzelner Tag bleibt im Singular', () => {
  assert.equal(streakLine(1), '1 Tag');
  assert.equal(streakLine(2), '2 Tage');
});

test('die Tageskarte nennt keine Aufgabe', () => {
  const lines = cardLines({
    done: 3,
    streak: 4,
    wrote: true,
    quote: 'Klein ist genug.',
  });
  const raw = lines.join('\n');
  assert.equal(raw.includes('Fremdauftrag'), true);
  assert.equal(raw.includes('Du hast heute auch geschrieben.'), true);
  assert.equal(raw.includes('Sag einem Baum'), false);
});
