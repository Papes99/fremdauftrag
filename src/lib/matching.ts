/** Nächtliches Matching. Niemand bekommt eigene Aufgaben, ein Set nur einmal. */

export type TaskSource = 'user' | 'seed' | 'pack' | 'sponsor';

export type MatchPerson = {
  id: string;
  language: string;
  active: boolean;
  banned: boolean;
  recentAuthorIds: string[];
  recentSeedIds: string[];
  packIds: string[] | null;
  sponsorDue: boolean;
};

export type MatchSet = {
  id: string;
  authorId: string;
  language: string;
  taskIds: [string, string, string];
};

export type PlannedTask = { id: string; source: TaskSource };

export type AssignmentPlan = {
  receiverId: string;
  authorId: string | null;
  setId: string | null;
  tasks: PlannedTask[];
};

export function pickIds(all: string[], recent: string[], count: number, rng: () => number): string[] {
  const recentSet = new Set(recent);
  const unseen = all.filter((id) => !recentSet.has(id));
  const pool = unseen.length >= count ? unseen : [...unseen, ...all.filter((id) => !unseen.includes(id))];
  const shuffled = shuffle(pool, rng);
  const picked: string[] = [];
  for (const id of shuffled) {
    if (picked.includes(id)) continue;
    picked.push(id);
    if (picked.length === count) break;
  }
  return picked;
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function matchUsers(input: {
  people: MatchPerson[];
  sets: MatchSet[];
  seedIds: string[];
  sponsorIds: string[];
  sponsorsEnabled: boolean;
  rng: () => number;
}): { plans: AssignmentPlan[]; leftoverSetIds: string[] } {
  const taken = new Set<string>();
  const plans: AssignmentPlan[] = [];
  const receivers = shuffle(
    input.people.filter((person) => person.active && !person.banned),
    input.rng,
  );

  for (const person of receivers) {
    const set = input.sets.find(
      (candidate) =>
        !taken.has(candidate.id) &&
        candidate.authorId !== person.id &&
        candidate.language === person.language &&
        !person.recentAuthorIds.includes(candidate.authorId),
    );

    if (set) {
      taken.add(set.id);
      const tasks: PlannedTask[] = set.taskIds.map((id) => ({ id, source: 'user' as const }));
      if (person.packIds && person.packIds.length > 0) {
        const packId = pickIds(person.packIds, [], 1, input.rng)[0];
        if (packId) tasks[2] = { id: packId, source: 'pack' };
      }
      plans.push({ receiverId: person.id, authorId: set.authorId, setId: set.id, tasks });
      continue;
    }

    const seedCount = person.packIds && person.packIds.length > 0 ? 2 : 3;
    const seeds = pickIds(input.seedIds, person.recentSeedIds, seedCount, input.rng).map(
      (id): PlannedTask => ({ id, source: 'seed' }),
    );
    const tasks = [...seeds];
    if (person.packIds && person.packIds.length > 0) {
      const packId = pickIds(person.packIds, [], 1, input.rng)[0];
      if (packId) tasks.push({ id: packId, source: 'pack' });
    }
    if (
      input.sponsorsEnabled &&
      person.sponsorDue &&
      input.sponsorIds.length > 0 &&
      tasks.length > 0
    ) {
      const sponsorId = pickIds(input.sponsorIds, [], 1, input.rng)[0];
      if (sponsorId) tasks[tasks.length - 1] = { id: sponsorId, source: 'sponsor' };
    }
    while (tasks.length < 3 && input.seedIds[0]) {
      tasks.push({ id: input.seedIds[tasks.length % input.seedIds.length]!, source: 'seed' });
    }
    plans.push({
      receiverId: person.id,
      authorId: null,
      setId: null,
      tasks: tasks.slice(0, 3),
    });
  }

  return {
    plans,
    leftoverSetIds: input.sets.filter((set) => !taken.has(set.id)).map((set) => set.id),
  };
}
