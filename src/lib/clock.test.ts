import assert from 'node:assert/strict';
import test from 'node:test';
import { personalDay, zonedDate } from './clock.ts';

test('Berlin: vor 7 Uhr gehört der Tag noch zum Vortag', () => {
  const before = new Date('2026-09-29T04:59:00Z');
  const at = new Date('2026-09-29T05:00:00Z');
  assert.equal(personalDay(before, '07:00', 'Europe/Berlin'), '2026-09-28');
  assert.equal(personalDay(at, '07:00', 'Europe/Berlin'), '2026-09-29');
});

test('Lissabon, New York und Tokio nutzen die Morgenzeit vor Ort', () => {
  assert.equal(personalDay(new Date('2026-09-29T05:59:00Z'), '07:00', 'Europe/Lisbon'), '2026-09-28');
  assert.equal(personalDay(new Date('2026-09-29T06:00:00Z'), '07:00', 'Europe/Lisbon'), '2026-09-29');
  assert.equal(personalDay(new Date('2026-09-29T10:59:00Z'), '07:00', 'America/New_York'), '2026-09-28');
  assert.equal(personalDay(new Date('2026-09-29T11:00:00Z'), '07:00', 'America/New_York'), '2026-09-29');
  assert.equal(personalDay(new Date('2026-09-28T21:59:00Z'), '07:00', 'Asia/Tokyo'), '2026-09-28');
  assert.equal(personalDay(new Date('2026-09-28T22:00:00Z'), '07:00', 'Asia/Tokyo'), '2026-09-29');
});

test('Schichtmodus: Morgen um 14 Uhr in Berlin', () => {
  assert.equal(personalDay(new Date('2026-09-29T11:59:00Z'), '14:00', 'Europe/Berlin'), '2026-09-28');
  assert.equal(personalDay(new Date('2026-09-29T12:00:00Z'), '14:00', 'Europe/Berlin'), '2026-09-29');
  assert.equal(zonedDate(new Date('2026-09-29T12:00:00Z'), 'Europe/Berlin'), '2026-09-29');
});
