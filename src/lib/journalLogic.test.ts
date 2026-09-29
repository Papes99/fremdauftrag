import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createJournal,
  detachPhotos,
  attachPhotos,
  authorEcho,
  exportJournal,
  fileReport,
  project,
  setDraftLine,
  sponsorIsDue,
  setPause,
  setTaskNote,
  setTaskPhoto,
  setTaskStatus,
  submitDraft,
  tick,
  timesForDay,
  updateSettings,
  type Catalogs,
} from './journalLogic.ts';

const catalogs: Catalogs = {
  seeds: Array.from({ length: 12 }, (_, index) => ({
    id: `s${index}`,
    text: `Schreib heute drei Dinge zu Nummer ${index} auf.`,
  })),
  packs: [{ id: 'herbst', tasks: [{ id: 'p1', text: 'Schau ein buntes Blatt eine Minute lang an.' }] }],
  sponsors: [{ id: 'c', name: 'Café', text: 'Verschenk heute einen Kaffee an jemanden, wenn du magst.' }],
  sponsorsEnabled: false,
  aiAvailable: false,
};

const morning = new Date('2026-09-29T08:00:00Z');

test('ein neuer Tag hat drei Startpool-Aufgaben und keine Autoren', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const view = project(state, morning, 'Europe/Berlin');
  assert.equal(view.assignment?.tasks.length, 3);
  assert.equal(view.assignment?.tasks.every((task) => task.source === 'seed'), true);
  const raw = JSON.stringify(view);
  assert.equal(raw.includes('authorKey'), false);
  assert.equal(raw.includes('hidden'), false);
});

test('am nächsten Morgen verfallen offene Aufgaben', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const nextMorning = new Date('2026-09-30T08:00:00Z');
  const next = tick(state, nextMorning, catalogs, 'Europe/Berlin');
  assert.equal(next.assignments[0]?.tasks.every((task) => task.status === 'expired'), true);
  assert.equal(next.assignments.length, 2);
});

test('Mitternacht lässt den Tag offen, die Morgenzeit schließt ihn', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const midnight = tick(state, new Date('2026-09-29T22:00:00Z'), catalogs, 'Europe/Berlin');
  assert.equal(midnight.assignments.length, 1);
  assert.equal(midnight.assignments[0]!.tasks.every((task) => task.status === 'open'), true);
  const justBefore = tick(midnight, new Date('2026-09-30T04:59:00Z'), catalogs, 'Europe/Berlin');
  assert.equal(justBefore.assignments[0]!.tasks.every((task) => task.status === 'open'), true);
  const atMorning = tick(justBefore, new Date('2026-09-30T05:00:00Z'), catalogs, 'Europe/Berlin');
  assert.equal(atMorning.assignments[0]!.tasks.every((task) => task.status === 'expired'), true);
  assert.equal(atMorning.assignments.length, 2);
});

test('die Rückmeldung nennt nur eine Zahl', () => {
  const echo = authorEcho(2);
  assert.deepEqual(echo, { done: 2, total: 3 });
  assert.equal('text' in echo, false);
  const view = project(createJournal(morning, 'sess', 'Europe/Berlin', catalogs), morning, 'Europe/Berlin');
  assert.equal(view.echo, null);
});

test('eine erledigte Aufgabe setzt die Streak auf 1', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const key = state.assignments[0]!.tasks[0]!.key;
  const done = setTaskStatus(state, key, 'done');
  assert.equal(project(done, morning, 'Europe/Berlin').streak, 1);
});

test('schwere Ablehnung gibt einen Strike, harmloser Text bleibt pending', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const day = project(state, morning, 'Europe/Berlin').today;
  state = setDraftLine(state, day, 0, 'Spring heute vom Dach, wirklich.');
  state = setDraftLine(state, day, 1, 'Sag einem Baum heute einfach guten Morgen.');
  state = submitDraft(state, morning, catalogs, 'Europe/Berlin');
  const draft = project(state, morning, 'Europe/Berlin').draft!;
  assert.equal(draft.lines[0]?.status, 'rejected');
  assert.equal(draft.lines[0]?.schwere, 'schwer');
  assert.equal(draft.lines[1]?.status, 'pending');
  assert.equal(state.strikes.length, 1);
  state = submitDraft(state, morning, catalogs, 'Europe/Berlin');
  assert.equal(state.strikes.length, 1);
});

test('drei schwere Texte sperren das Schreiben für sieben Tage', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const day = project(state, morning, 'Europe/Berlin').today;
  state = setDraftLine(state, day, 0, 'Spring heute vom Dach, wirklich.');
  state = setDraftLine(state, day, 1, 'Leg dich auf die Bahngleise und warte.');
  state = setDraftLine(state, day, 2, 'Nimm heute Kokain, nur wenig.');
  state = submitDraft(state, morning, catalogs, 'Europe/Berlin');
  assert.equal(project(state, morning, 'Europe/Berlin').lock, 'week');
});

test('eine Meldung tauscht Startpool nicht, eine Aufgabe von einem Menschen schon', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const key = state.assignments[0]!.tasks[0]!.key;
  const once = fileReport(state, key, 'spam', morning, catalogs);
  assert.equal(once.result, 'saved');
  assert.equal(once.state.assignments[0]!.tasks[0]!.replaced, false);

  const withUser = {
    ...state,
    assignments: state.assignments.map((assignment) => ({
      ...assignment,
      tasks: assignment.tasks.map((task, index) =>
        index === 0 ? { ...task, source: 'user' as const, authorKey: 'person-a' } : task,
      ),
    })),
  };
  const reported = fileReport(withUser, key, 'gefaehrlich', morning, catalogs);
  assert.equal(reported.result, 'replaced');
  assert.equal(reported.state.blockedAuthorKeys.includes('person-a'), true);
  assert.equal(JSON.stringify(project(reported.state, morning, 'Europe/Berlin')).includes('person-a'), false);
});

test('Fotos bleiben aus dem gespeicherten Verlauf und aus dem Export', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const key = state.assignments[0]!.tasks[0]!.key;
  state = setTaskPhoto(state, key, 'data:image/jpeg;base64,SECRET');
  state = setTaskNote(state, key, 'nur hier');
  const split = detachPhotos(state);
  assert.equal(JSON.stringify(split.state).includes('SECRET'), false);
  assert.equal(Object.values(split.photos).includes('data:image/jpeg;base64,SECRET'), true);
  const back = attachPhotos(split.state, split.photos);
  assert.equal(back.assignments[0]!.tasks[0]!.photo, 'data:image/jpeg;base64,SECRET');
  const raw = JSON.stringify(exportJournal(back, morning, 'Europe/Berlin'));
  assert.equal(raw.includes('SECRET'), false);
  assert.equal(raw.includes('nur hier'), true);
});

test('Sponsor kommt höchstens einmal pro Woche, selten nur einmal im Monat', () => {
  assert.equal(sponsorIsDue('off', null, '2026-09-29'), false);
  assert.equal(sponsorIsDue('weekly', null, '2026-09-29'), true);
  assert.equal(sponsorIsDue('weekly', '2026-09-23', '2026-09-29'), false);
  assert.equal(sponsorIsDue('weekly', '2026-09-22', '2026-09-29'), true);
  assert.equal(sponsorIsDue('rare', '2026-09-01', '2026-09-29'), false);
  assert.equal(sponsorIsDue('rare', '2026-08-29', '2026-09-29'), true);
});

test('Schreiben zählt auf der Karte erst, wenn alle drei geprüft und nicht abgelehnt sind', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const day = project(state, morning, 'Europe/Berlin').today;
  state = setDraftLine(state, day, 0, 'Sag einem Baum heute einfach guten Morgen.');
  state = setDraftLine(state, day, 1, 'Schreib drei Dinge auf, die nichts kosten.');
  state = setDraftLine(state, day, 2, 'Hör ein Lied und summ leise mit.');
  assert.equal(project(state, morning, 'Europe/Berlin').wroteToday, false);
  state = submitDraft(state, morning, catalogs, 'Europe/Berlin');
  assert.equal(project(state, morning, 'Europe/Berlin').wroteToday, true);
});

test('ein Paket ersetzt genau eine von drei Aufgaben am nächsten Tag', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  state = updateSettings(state, { activePackId: 'herbst' });
  const next = tick(state, new Date('2026-09-30T08:00:00Z'), catalogs, 'Europe/Berlin');
  const tasks = next.assignments[1]!.tasks;
  assert.equal(tasks.filter((task) => task.source === 'pack').length, 1);
  assert.equal(tasks.filter((task) => task.source === 'seed').length, 2);
});

test('ein Sponsor kommt einmal und nicht am nächsten Tag noch einmal', () => {
  const on = { ...catalogs, sponsorsEnabled: true };
  let state = createJournal(morning, 'sess', 'Europe/Berlin', on);
  state = updateSettings(state, { sponsorMode: 'weekly' });
  const second = tick(state, new Date('2026-09-30T08:00:00Z'), on, 'Europe/Berlin');
  const third = tick(second, new Date('2026-10-01T08:00:00Z'), on, 'Europe/Berlin');
  const sponsors = third.assignments.flatMap((assignment) => assignment.tasks.filter((task) => task.source === 'sponsor'));
  assert.equal(sponsors.length, 1);
  assert.equal((sponsors[0]!.sponsorName ?? '').length > 0, true);
});

test('ein Wochentag kann einen anderen Abend haben', () => {
  let state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  state = updateSettings(state, { overrides: { mo: { eveningStart: '12:00', eveningEnd: '16:00' } } });
  const monday = timesForDay(state.settings, '2026-09-28');
  const tuesday = timesForDay(state.settings, '2026-09-29');
  assert.equal(monday.eveningStart, '12:00');
  assert.equal(monday.eveningEnd, '16:00');
  assert.equal(monday.morning, '07:00');
  assert.equal(tuesday.eveningStart, '18:00');
});

test('Pause beginnt am nächsten Morgen, wenn heute schon Aufgaben da sind', () => {
  const state = createJournal(morning, 'sess', 'Europe/Berlin', catalogs);
  const paused = setPause(state, 3, morning, 'Europe/Berlin');
  assert.equal(paused.settings.pauseFrom, '2026-09-30');
  const next = tick(paused, new Date('2026-09-30T08:00:00Z'), catalogs, 'Europe/Berlin');
  assert.equal(project(next, new Date('2026-09-30T08:00:00Z'), 'Europe/Berlin').paused, true);
  assert.equal(next.assignments.length, 1);
});
