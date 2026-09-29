import assert from 'node:assert/strict';
import test from 'node:test';
import { computeStreak } from './streak.ts';

test('eine erledigte Aufgabe zählt, ein Fehltag pro Woche nicht', () => {
  const result = computeStreak({
    start: '2026-09-28',
    today: '2026-10-01',
    todayCounts: false,
    days: [
      { day: '2026-09-28', done: 1, paused: false },
      { day: '2026-09-29', done: 1, paused: false },
      { day: '2026-09-30', done: 0, paused: false },
    ],
  });
  assert.equal(result.streak, 2);
});

test('der zweite Fehltag in der Woche bricht die Streak', () => {
  const result = computeStreak({
    start: '2026-09-28',
    today: '2026-10-01',
    todayCounts: true,
    days: [
      { day: '2026-09-28', done: 1, paused: false },
      { day: '2026-09-29', done: 0, paused: false },
      { day: '2026-09-30', done: 0, paused: false },
      { day: '2026-10-01', done: 1, paused: false },
    ],
  });
  assert.equal(result.streak, 1);
});

test('Pause friert ein und verbraucht keinen Schonungstag', () => {
  const result = computeStreak({
    start: '2026-09-28',
    today: '2026-10-01',
    todayCounts: false,
    days: [
      { day: '2026-09-28', done: 1, paused: false },
      { day: '2026-09-29', done: 0, paused: true },
      { day: '2026-09-30', done: 0, paused: true },
    ],
  });
  assert.equal(result.streak, 1);
  assert.equal(result.best, 1);
});

test('ein neuer Schonungstag gilt ab Montag', () => {
  const result = computeStreak({
    start: '2026-09-26',
    today: '2026-09-29',
    todayCounts: false,
    days: [
      { day: '2026-09-26', done: 1, paused: false },
      { day: '2026-09-27', done: 0, paused: false },
      { day: '2026-09-28', done: 0, paused: false },
    ],
  });
  assert.equal(result.streak, 1);
});
