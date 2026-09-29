import assert from 'node:assert/strict';
import test from 'node:test';
import { ageGate, birthYearOptions, boundaryYear, isOldEnough } from './age.ts';

const today = new Date('2026-09-29T12:00:00Z');

test('2026 ist das Grenzjahr 2010', () => {
  assert.equal(boundaryYear(today), 2010);
  assert.equal(ageGate(2010, today), 'ask');
});

test('wer vor dem Grenzjahr geboren ist, ist ohne Nachfrage alt genug', () => {
  assert.equal(ageGate(2009, today), 'allow');
  assert.equal(isOldEnough(2009, null, today), true);
  assert.equal(isOldEnough(2009, false, today), true);
});

test('im Grenzjahr zählt nur ein Ja, und ein Nein führt zur Absage', () => {
  assert.equal(isOldEnough(2010, true, today), true);
  assert.equal(isOldEnough(2010, false, today), false);
  assert.equal(isOldEnough(2010, null, today), false);
});

test('wer nach dem Grenzjahr geboren ist, ist noch unter 16', () => {
  assert.equal(ageGate(2011, today), 'refuse');
  assert.equal(isOldEnough(2011, true, today), false);
});

test('unsinnige Jahre gelten nicht', () => {
  assert.equal(ageGate(1800, today), 'refuse');
  assert.equal(ageGate(2026, today), 'refuse');
  assert.equal(isOldEnough(1990.5, today), false);
});

test('die Liste enthält erlaubte und zu junge Jahre, aber kein Geburtsdatum', () => {
  const years = birthYearOptions(today);
  assert.ok(years.includes(2010));
  assert.ok(years.includes(2011));
  assert.equal(years[0], 2018);
  assert.equal(years.at(-1), 1926);
});
