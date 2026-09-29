import assert from 'node:assert/strict';
import test from 'node:test';
import { birthYearOptions, isOldEnough } from './age.ts';

const today = new Date('2026-09-29T12:00:00Z');

test('wer 2010 geboren ist, gilt 2026 als alt genug', () => {
  assert.equal(isOldEnough(2010, today), true);
});

test('wer 2011 geboren ist, ist 2026 noch unter 16', () => {
  assert.equal(isOldEnough(2011, today), false);
});

test('unsinnige Jahre gelten nicht', () => {
  assert.equal(isOldEnough(1800, today), false);
  assert.equal(isOldEnough(2026, today), false);
  assert.equal(isOldEnough(1990.5, today), false);
});

test('die Liste enthält erlaubte und zu junge Jahre, aber kein Geburtsdatum', () => {
  const years = birthYearOptions(today);
  assert.ok(years.includes(2010));
  assert.ok(years.includes(2011));
  assert.equal(years[0], 2018);
  assert.equal(years.at(-1), 1926);
});
