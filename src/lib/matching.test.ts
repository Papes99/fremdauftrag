import assert from 'node:assert/strict';
import test from 'node:test';
import { matchUsers, type MatchPerson, type MatchSet } from './matching.ts';

function rng(seed = 1): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function person(id: string, extra: Partial<MatchPerson> = {}): MatchPerson {
  return {
    id,
    language: 'de',
    active: true,
    banned: false,
    recentAuthorIds: [],
    recentSeedIds: [],
    packIds: null,
    sponsorDue: false,
    ...extra,
  };
}

const seeds = Array.from({ length: 300 }, (_, index) => `s${index}`);

function assertFair(plans: { receiverId: string; authorId: string | null; tasks: { id: string; source: string }[] }[], people: MatchPerson[]) {
  const active = people.filter((item) => item.active && !item.banned);
  assert.equal(plans.length, active.length);
  for (const plan of plans) {
    assert.equal(plan.tasks.length, 3);
    assert.equal(new Set(plan.tasks.map((task) => task.id)).size, 3);
    const person = people.find((item) => item.id === plan.receiverId)!;
    if (plan.authorId) {
      assert.notEqual(plan.authorId, plan.receiverId);
      assert.equal(person.recentAuthorIds.includes(plan.authorId), false);
    }
    for (const task of plan.tasks) {
      if (task.source === 'user') assert.equal(task.id.startsWith(`${plan.receiverId}-`), false);
    }
  }
}

test('eine Person bekommt drei Startpool-Aufgaben und bleibt nicht leer', () => {
  const people = [person('a')];
  const result = matchUsers({ people, sets: [], seedIds: seeds, sponsorIds: [], sponsorsEnabled: false, rng: rng() });
  assertFair(result.plans, people);
  assert.equal(result.plans[0]!.authorId, null);
});

test('zwei Personen: niemand bekommt das eigene Set', () => {
  const people = [person('a'), person('b')];
  const sets: MatchSet[] = [{ id: 'set-a', authorId: 'a', language: 'de', taskIds: ['a-1', 'a-2', 'a-3'] }];
  const result = matchUsers({ people, sets, seedIds: seeds, sponsorIds: [], sponsorsEnabled: false, rng: rng(2) });
  assertFair(result.plans, people);
  const forB = result.plans.find((plan) => plan.receiverId === 'b')!;
  const forA = result.plans.find((plan) => plan.receiverId === 'a')!;
  assert.equal(forB.authorId, 'a');
  assert.equal(forA.authorId, null);
  assert.equal(result.leftoverSetIds.length, 0);
});

test('zehn und tausend Personen bleiben ohne Doppelvergabe', () => {
  for (const count of [10, 1000]) {
    const people = Array.from({ length: count }, (_, index) => person(`p${index}`));
    const sets: MatchSet[] = Array.from({ length: Math.floor(count / 3) }, (_, index) => ({
      id: `set-${index}`,
      authorId: `p${index}`,
      language: 'de',
      taskIds: [`p${index}-1`, `p${index}-2`, `p${index}-3`] as [string, string, string],
    }));
    const result = matchUsers({ people, sets, seedIds: seeds, sponsorIds: ['sp1'], sponsorsEnabled: false, rng: rng(count) });
    assertFair(result.plans, people);
    const used = result.plans.map((plan) => plan.setId).filter(Boolean);
    assert.equal(new Set(used).size, used.length);
  }
});

test('derselbe Autor innerhalb der Sperrliste wird nicht noch einmal genommen', () => {
  const people = [person('b', { recentAuthorIds: ['a'] })];
  const sets: MatchSet[] = [{ id: 'set-a', authorId: 'a', language: 'de', taskIds: ['a-1', 'a-2', 'a-3'] }];
  const result = matchUsers({ people, sets, seedIds: seeds, sponsorIds: [], sponsorsEnabled: false, rng: rng(4) });
  assert.equal(result.plans[0]!.setId, null);
  assert.deepEqual(result.leftoverSetIds, ['set-a']);
});

test('inaktive und gesperrte Personen bekommen nichts', () => {
  const people = [person('a', { active: false }), person('b', { banned: true }), person('c')];
  const result = matchUsers({ people, sets: [], seedIds: seeds, sponsorIds: [], sponsorsEnabled: false, rng: rng(5) });
  assert.deepEqual(result.plans.map((plan) => plan.receiverId), ['c']);
});

test('ein Paket ersetzt genau eine von drei Aufgaben', () => {
  const people = [person('b', { packIds: ['pack-1', 'pack-2'] })];
  const sets: MatchSet[] = [{ id: 'set-a', authorId: 'a', language: 'de', taskIds: ['a-1', 'a-2', 'a-3'] }];
  const result = matchUsers({ people, sets, seedIds: seeds, sponsorIds: [], sponsorsEnabled: false, rng: rng(6) });
  const tasks = result.plans[0]!.tasks;
  assert.equal(tasks.filter((task) => task.source === 'user').length, 2);
  assert.equal(tasks.filter((task) => task.source === 'pack').length, 1);
});

test('ohne Set kann ein fälliger Sponsor genau eine Aufgabe sein', () => {
  const people = [person('a', { sponsorDue: true })];
  const result = matchUsers({
    people,
    sets: [],
    seedIds: seeds,
    sponsorIds: ['coffee'],
    sponsorsEnabled: true,
    rng: rng(7),
  });
  assert.equal(result.plans[0]!.tasks.filter((task) => task.source === 'sponsor').length, 1);
  assert.equal(result.plans[0]!.tasks.filter((task) => task.source === 'seed').length, 2);
});
