import {
  addDays,
  inWindow,
  personalDay,
  weekdayOf,
  zonedDate,
  type Weekday,
} from './clock.ts';
import { pickIds, type TaskSource } from './matching.ts';
import { releaseDecision, type ReasonKey, type Severity } from './moderation.ts';
import { computeStreak, type DayMark } from './streak.ts';

export type Times = { morning: string; eveningStart: string; eveningEnd: string };

export type Settings = Times & {
  overrides: Partial<Record<Weekday, Partial<Times>>>;
  pauseFrom: string | null;
  pauseUntil: string | null;
  notifyMorning: boolean;
  notifyEvening: boolean;
  sponsorMode: 'off' | 'weekly' | 'rare';
  activePackId: string | null;
  timezone: string;
};

export type AssignedTask = {
  key: string;
  catalogId: string;
  text: string;
  source: TaskSource;
  status: 'open' | 'done' | 'skipped' | 'expired';
  note: string;
  photo: string | null;
  replaced: boolean;
  sponsorName: string | null;
  authorKey: string | null;
  reportCount: number;
};

export type VisibleTask = Omit<AssignedTask, 'authorKey'>;

export type Assignment = {
  id: string;
  day: string;
  calendarDate: string;
  timezone: string;
  tasks: AssignedTask[];
};

export type DraftLine = {
  text: string;
  status: 'draft' | 'rejected' | 'pending';
  key: ReasonKey | null;
  schwere: Severity | null;
};

export type Draft = {
  day: string;
  lines: [DraftLine, DraftLine, DraftLine];
  hints: [string, string, string];
  struckTexts: string[];
};

export type ReportReason = 'unangemessen' | 'gefaehrlich' | 'spam' | 'anderes';

export type Report = {
  id: string;
  at: string;
  day: string;
  taskKey: string;
  catalogId: string;
  text: string;
  source: TaskSource;
  reason: ReportReason;
  handled: boolean;
  authorKey: string | null;
};

export type Strike = { at: string; text: string };

export type JournalState = {
  version: 1;
  sessionCreatedAt: string;
  createdDay: string;
  settings: Settings;
  seenSeeds: { id: string; day: string }[];
  assignments: Assignment[];
  pausedDays: string[];
  drafts: Draft[];
  reports: Report[];
  strikes: Strike[];
  banned: boolean;
  writeLockedUntil: string | null;
  blockedAuthorKeys: string[];
};

export type Catalogs = {
  seeds: { id: string; text: string }[];
  packs: { id: string; tasks: { id: string; text: string }[] }[];
  sponsors: { id: string; name: string; text: string }[];
  sponsorsEnabled: boolean;
  aiAvailable: boolean;
};

export type JournalView = {
  today: string;
  times: Times;
  inEvening: boolean;
  paused: boolean;
  assignment: { id: string; day: string; tasks: VisibleTask[] } | null;
  draft: Draft | null;
  yesterdayWaiting: boolean;
  echo: { done: number; total: 3 } | null;
  streak: number;
  best: number;
  totalDone: number;
  strikeCount: number;
  lock: 'none' | 'week' | 'ban';
  writeLockedUntil: string | null;
  settings: Settings;
  reports: Omit<Report, 'authorKey'>[];
  cardReady: boolean;
  wroteToday: boolean;
};

const EMPTY: DraftLine = { text: '', status: 'draft', key: null, schwere: null };

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blankSettings(timezone: string): Settings {
  return {
    morning: '07:00',
    eveningStart: '18:00',
    eveningEnd: '23:59',
    overrides: {},
    pauseFrom: null,
    pauseUntil: null,
    notifyMorning: true,
    notifyEvening: true,
    sponsorMode: 'off',
    activePackId: null,
    timezone,
  };
}

export function morningFor(settings: Settings, now: Date, timeZone: string): string {
  const calendar = zonedDate(now, timeZone);
  return settings.overrides[weekdayOf(calendar)]?.morning ?? settings.morning;
}

export function timesForDay(settings: Settings, day: string): Times {
  const extra = settings.overrides[weekdayOf(day)] ?? {};
  return {
    morning: extra.morning ?? settings.morning,
    eveningStart: extra.eveningStart ?? settings.eveningStart,
    eveningEnd: extra.eveningEnd ?? settings.eveningEnd,
  };
}

export function isPaused(settings: Settings, day: string): boolean {
  if (!settings.pauseFrom || !settings.pauseUntil) return false;
  return day >= settings.pauseFrom && day <= settings.pauseUntil;
}

export function sponsorIsDue(mode: 'off' | 'weekly' | 'rare', lastDay: string | null, today: string): boolean {
  if (mode === 'off') return false;
  if (!lastDay) return true;
  const span = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastDay}T00:00:00Z`)) / 86400000);
  return span >= (mode === 'rare' ? 30 : 7);
}

function lastSponsorDay(state: JournalState): string | null {
  let last: string | null = null;
  for (const assignment of state.assignments) {
    if (assignment.tasks.some((task) => task.source === 'sponsor') && (!last || assignment.day > last)) last = assignment.day;
  }
  return last;
}

function lookup(catalogs: Catalogs, id: string): { text: string; source: TaskSource; sponsorName: string | null } | null {
  const seed = catalogs.seeds.find((item) => item.id === id);
  if (seed) return { text: seed.text, source: 'seed', sponsorName: null };
  for (const pack of catalogs.packs) {
    const task = pack.tasks.find((item) => item.id === id);
    if (task) return { text: task.text, source: 'pack', sponsorName: null };
  }
  const sponsor = catalogs.sponsors.find((item) => item.id === id);
  if (sponsor) return { text: sponsor.text, source: 'sponsor', sponsorName: sponsor.name };
  return null;
}

function makeTask(catalogs: Catalogs, id: string, day: string, index: number, replaced = false): AssignedTask | null {
  const found = lookup(catalogs, id);
  if (!found) return null;
  return {
    key: `${day}-${index}-${id}`,
    catalogId: id,
    text: found.text,
    source: found.source,
    status: 'open',
    note: '',
    photo: null,
    replaced,
    sponsorName: found.sponsorName,
    authorKey: found.source === 'user' ? 'hidden-author' : null,
    reportCount: 0,
  };
}

export function toVisible(tasks: AssignedTask[]): VisibleTask[] {
  return tasks.map((task) => {
    const { authorKey: _hidden, ...visible } = task;
    return visible;
  });
}

function emptyDraft(day: string, catalogs: Catalogs, rng: () => number): Draft {
  const hints = pickIds(
    catalogs.seeds.map((seed) => seed.id),
    [],
    3,
    rng,
  ).map((id) => catalogs.seeds.find((seed) => seed.id === id)?.text ?? '');
  while (hints.length < 3) hints.push('');
  return {
    day,
    lines: [{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }],
    hints: [hints[0] ?? '', hints[1] ?? '', hints[2] ?? ''],
    struckTexts: [],
  };
}

export function createJournal(now: Date, sessionCreatedAt: string, timeZone: string, catalogs: Catalogs): JournalState {
  const morning = '07:00';
  const today = personalDay(now, morning, timeZone);
  const state: JournalState = {
    version: 1,
    sessionCreatedAt,
    createdDay: today,
    settings: blankSettings(timeZone),
    seenSeeds: [],
    assignments: [],
    pausedDays: [],
    drafts: [],
    reports: [],
    strikes: [],
    banned: false,
    writeLockedUntil: null,
    blockedAuthorKeys: [],
  };
  return tick(state, now, catalogs, timeZone);
}

export function tick(state: JournalState, now: Date, catalogs: Catalogs, timeZone: string): JournalState {
  const morning = morningFor(state.settings, now, timeZone);
  const today = personalDay(now, morning, timeZone);
  const calendar = zonedDate(now, timeZone);
  const next: JournalState = {
    ...state,
    settings: { ...state.settings, timezone: timeZone },
    assignments: state.assignments.map((assignment) => {
      if (assignment.day >= today) return assignment;
      return {
        ...assignment,
        tasks: assignment.tasks.map((task) =>
          task.status === 'open' ? { ...task, status: 'expired' } : task,
        ),
      };
    }),
    pausedDays: [...state.pausedDays],
    drafts: [...state.drafts],
    seenSeeds: state.seenSeeds.filter((seen) => seen.day >= addDays(today, -60)),
  };

  const paused = new Set(next.pausedDays);
  for (let day = next.createdDay; day < today; day = addDays(day, 1)) {
    if (isPaused(next.settings, day)) paused.add(day);
  }
  if (isPaused(next.settings, today)) paused.add(today);
  next.pausedDays = [...paused].sort();

  if (!next.drafts.some((draft) => draft.day === today)) {
    next.drafts.push(emptyDraft(today, catalogs, mulberry32(hashString(`${today}:hints:${state.sessionCreatedAt}`))));
  }

  if (isPaused(next.settings, today)) return next;
  if (next.assignments.some((assignment) => assignment.day === today)) return next;

  const latest = next.assignments[next.assignments.length - 1];
  if (latest && latest.timezone !== timeZone && next.assignments.some((assignment) => assignment.calendarDate === calendar)) {
    return next;
  }

  const pack = catalogs.packs.find((item) => item.id === next.settings.activePackId) ?? null;
  const recent = next.seenSeeds.map((seen) => seen.id);
  const seedCount = pack ? 2 : 3;
  const rng = mulberry32(hashString(`${today}:${state.sessionCreatedAt}`));
  const seedIds = pickIds(
    catalogs.seeds.map((seed) => seed.id),
    recent,
    seedCount,
    rng,
  );
  const ids = [...seedIds];
  if (pack) {
    const packId = pickIds(
      pack.tasks.map((task) => task.id),
      [],
      1,
      rng,
    )[0];
    if (packId) ids.push(packId);
  }
  const tasks = ids
    .map((id, index) => makeTask(catalogs, id, today, index))
    .filter((task): task is AssignedTask => task !== null)
    .slice(0, 3);
  if (tasks.length < 3) return next;

  if (catalogs.sponsorsEnabled && catalogs.sponsors.length > 0 && sponsorIsDue(next.settings.sponsorMode, lastSponsorDay(next), today)) {
    const sponsor = catalogs.sponsors[Math.abs(hashString(`${today}:sponsor`)) % catalogs.sponsors.length]!;
    const made = makeTask(catalogs, sponsor.id, today, 9);
    const slot = tasks.findIndex((task) => task.source === 'seed');
    if (made && slot >= 0) tasks[slot] = { ...made, key: `${today}-${slot}-${sponsor.id}` };
  }

  next.assignments = [
    ...next.assignments,
    { id: `day-${today}`, day: today, calendarDate: calendar, timezone: timeZone, tasks },
  ];
  next.seenSeeds = [
    ...next.seenSeeds,
    ...tasks.filter((task) => task.source === 'seed').map((task) => ({ id: task.catalogId, day: today })),
  ];
  return next;
}

function replaceWithSeed(state: JournalState, assignment: Assignment, task: AssignedTask, catalogs: Catalogs): AssignedTask {
  const used = new Set(assignment.tasks.map((item) => item.catalogId));
  const recent = state.seenSeeds.map((seen) => seen.id);
  const [id] = pickIds(
    catalogs.seeds.map((seed) => seed.id).filter((seedId) => !used.has(seedId)),
    recent,
    1,
    mulberry32(hashString(`${task.key}:replace`)),
  );
  const found = id ? lookup(catalogs, id) : null;
  if (!found || !id) return task;
  return {
    ...task,
    catalogId: id,
    text: found.text,
    source: 'seed',
    sponsorName: null,
    authorKey: null,
    status: 'open',
    note: '',
    photo: null,
    replaced: true,
    reportCount: 0,
  };
}

function mapAssignment(state: JournalState, day: string, tasks: AssignedTask[]): JournalState {
  return {
    ...state,
    assignments: state.assignments.map((assignment) =>
      assignment.day === day ? { ...assignment, tasks } : assignment,
    ),
  };
}

export function setTaskStatus(state: JournalState, taskKey: string, status: 'done' | 'skipped'): JournalState {
  return {
    ...state,
    assignments: state.assignments.map((assignment) => ({
      ...assignment,
      tasks: assignment.tasks.map((task) =>
        task.key === taskKey && task.status !== 'expired' ? { ...task, status } : task,
      ),
    })),
  };
}

export function setTaskNote(state: JournalState, taskKey: string, note: string): JournalState {
  const trimmed = note.slice(0, 280);
  return {
    ...state,
    assignments: state.assignments.map((assignment) => ({
      ...assignment,
      tasks: assignment.tasks.map((task) => (task.key === taskKey ? { ...task, note: trimmed } : task)),
    })),
  };
}

export function setTaskPhoto(state: JournalState, taskKey: string, photo: string | null): JournalState {
  return {
    ...state,
    assignments: state.assignments.map((assignment) => ({
      ...assignment,
      tasks: assignment.tasks.map((task) => (task.key === taskKey ? { ...task, photo } : task)),
    })),
  };
}

const LOCAL_PHOTO = 'local:';

/** Die Bilddaten liegen getrennt. Im Verlauf bleibt nur ein Verweis. */
export function detachPhotos(state: JournalState): { state: JournalState; photos: Record<string, string> } {
  const photos: Record<string, string> = {};
  return {
    photos,
    state: {
      ...state,
      assignments: state.assignments.map((assignment) => ({
        ...assignment,
        tasks: assignment.tasks.map((task) => {
          if (!task.photo) return task;
          const id = task.photo.startsWith(LOCAL_PHOTO) ? task.photo.slice(LOCAL_PHOTO.length) : `photo-${task.key}`;
          if (!task.photo.startsWith(LOCAL_PHOTO)) photos[id] = task.photo;
          return { ...task, photo: `${LOCAL_PHOTO}${id}` };
        }),
      })),
    },
  };
}

export function attachPhotos(state: JournalState, photos: Record<string, string>): JournalState {
  return {
    ...state,
    assignments: state.assignments.map((assignment) => ({
      ...assignment,
      tasks: assignment.tasks.map((task) => {
        if (!task.photo?.startsWith(LOCAL_PHOTO)) return task;
        const data = photos[task.photo.slice(LOCAL_PHOTO.length)];
        return { ...task, photo: data ?? null };
      }),
    })),
  };
}

export function fileReport(
  state: JournalState,
  taskKey: string,
  reason: ReportReason,
  now: Date,
  catalogs: Catalogs,
): { state: JournalState; result: 'saved' | 'duplicate' | 'replaced' } {
  let result: 'saved' | 'duplicate' | 'replaced' = 'saved';
  let next = state;
  const assignment = state.assignments.find((item) => item.tasks.some((task) => task.key === taskKey));
  const task = assignment?.tasks.find((item) => item.key === taskKey);
  if (!assignment || !task) return { state, result: 'duplicate' };
  if (state.reports.some((report) => report.taskKey === taskKey)) return { state, result: 'duplicate' };

  const report: Report = {
    id: `report-${taskKey}`,
    at: now.toISOString(),
    day: assignment.day,
    taskKey,
    catalogId: task.catalogId,
    text: task.text,
    source: task.source,
    reason,
    handled: false,
    authorKey: task.authorKey,
  };
  const reportCount = task.reportCount + 1;
  const threshold = task.source === 'user' ? 1 : 2;
  let updated = { ...task, reportCount };
  if (task.authorKey) {
    next = { ...next, blockedAuthorKeys: [...new Set([...next.blockedAuthorKeys, task.authorKey])] };
  }
  if (reportCount >= threshold) {
    updated = replaceWithSeed(next, assignment, updated, catalogs);
    report.handled = true;
    result = 'replaced';
  }
  next = mapAssignment(
    { ...next, reports: [...next.reports, report] },
    assignment.day,
    assignment.tasks.map((item) => (item.key === taskKey ? updated : item)),
  );
  return { state: next, result };
}

export function adminRemove(state: JournalState, taskKey: string, catalogs: Catalogs): JournalState {
  const assignment = state.assignments.find((item) => item.tasks.some((task) => task.key === taskKey));
  const task = assignment?.tasks.find((item) => item.key === taskKey);
  if (!assignment || !task) return state;
  const updated = replaceWithSeed(state, assignment, task, catalogs);
  return mapAssignment(
    {
      ...state,
      reports: state.reports.map((report) => (report.taskKey === taskKey ? { ...report, handled: true } : report)),
    },
    assignment.day,
    assignment.tasks.map((item) => (item.key === taskKey ? updated : item)),
  );
}

export function adminClose(state: JournalState, reportId: string): JournalState {
  return {
    ...state,
    reports: state.reports.map((report) => (report.id === reportId ? { ...report, handled: true } : report)),
  };
}

export function setDraftLine(state: JournalState, day: string, index: number, text: string): JournalState {
  return {
    ...state,
    drafts: state.drafts.map((draft) => {
      if (draft.day !== day) return draft;
      const lines = draft.lines.map((line, lineIndex) =>
        lineIndex === index ? { text: text.slice(0, 140), status: 'draft' as const, key: null, schwere: null } : line,
      ) as Draft['lines'];
      return { ...draft, lines };
    }),
  };
}

export function refreshHints(state: JournalState, day: string, catalogs: Catalogs, salt: string): JournalState {
  return {
    ...state,
    drafts: state.drafts.map((draft) => {
      if (draft.day !== day) return draft;
      const fresh = emptyDraft(day, catalogs, mulberry32(hashString(`${day}:idea:${salt}`)));
      return { ...draft, hints: fresh.hints };
    }),
  };
}

export function submitDraft(
  state: JournalState,
  now: Date,
  catalogs: Catalogs,
  timeZone: string,
): JournalState {
  const morning = morningFor(state.settings, now, timeZone);
  const today = personalDay(now, morning, timeZone);
  if (state.banned) return state;
  if (state.writeLockedUntil && state.writeLockedUntil >= today) return state;
  const draft = state.drafts.find((item) => item.day === today);
  if (!draft) return state;

  const struck = new Set(draft.struckTexts);
  const strikes = [...state.strikes];
  const lines = draft.lines.map((line) => {
    const decision = releaseDecision(line.text, catalogs.aiAvailable);
    if (decision.status === 'approved') {
      return { ...line, status: 'draft' as const, key: null, schwere: null };
    }
    if (decision.status === 'pending') {
      return { ...line, status: 'pending' as const, key: null, schwere: null };
    }
    if (decision.schwere === 'schwer' && line.text.trim() && !struck.has(line.text.trim())) {
      struck.add(line.text.trim());
      strikes.push({ at: now.toISOString(), text: line.text.trim() });
    }
    return { ...line, status: 'rejected' as const, key: decision.key, schwere: decision.schwere };
  }) as Draft['lines'];

  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recent = strikes.filter((strike) => Date.parse(strike.at) >= cutoff).length;
  let banned = false;
  let writeLockedUntil = state.writeLockedUntil;
  if (recent >= 6) banned = true;
  else if (recent >= 3) writeLockedUntil = addDays(today, 7);

  return {
    ...state,
    banned,
    writeLockedUntil,
    strikes,
    drafts: state.drafts.map((item) =>
      item.day === today ? { ...item, lines, struckTexts: [...struck] } : item,
    ),
  };
}

export function updateSettings(state: JournalState, patch: Partial<Settings>): JournalState {
  return { ...state, settings: { ...state.settings, ...patch, overrides: patch.overrides ?? state.settings.overrides } };
}

export function setPause(state: JournalState, days: number | null, now: Date, timeZone: string): JournalState {
  if (days === null) {
    return { ...state, settings: { ...state.settings, pauseFrom: null, pauseUntil: null } };
  }
  const today = personalDay(now, morningFor(state.settings, now, timeZone), timeZone);
  const hasToday = state.assignments.some((assignment) => assignment.day === today);
  const start = hasToday ? addDays(today, 1) : today;
  return {
    ...state,
    settings: {
      ...state.settings,
      pauseFrom: start,
      pauseUntil: addDays(start, days - 1),
    },
  };
}

function strikeCount(state: JournalState, now: Date): number {
  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return state.strikes.filter((strike) => Date.parse(strike.at) >= cutoff).length;
}

/** Nur die Zahl. Kein Aufgabentext, kein Foto, kein Name. */
export function authorEcho(done: number): { done: number; total: 3 } {
  const safe = Number.isFinite(done) ? Math.max(0, Math.min(3, Math.floor(done))) : 0;
  return { done: safe, total: 3 };
}

export function project(state: JournalState, now: Date, timeZone: string): JournalView {
  const morning = morningFor(state.settings, now, timeZone);
  const today = personalDay(now, morning, timeZone);
  const times = timesForDay(state.settings, today);
  const assignment = state.assignments.find((item) => item.day === today) ?? null;
  const draft = state.drafts.find((item) => item.day === today) ?? null;
  const yesterday = addDays(today, -1);
  const yesterdayDraft = state.drafts.find((item) => item.day === yesterday);
  const todayDone = assignment?.tasks.filter((task) => task.status === 'done').length ?? 0;
  const marks: DayMark[] = [
    ...state.pausedDays.map((day) => ({ day, done: 0, paused: true })),
    ...state.assignments.map((item) => ({
      day: item.day,
      done: item.tasks.filter((task) => task.status === 'done').length,
      paused: false,
    })),
  ];
  const counted = computeStreak({
    start: state.createdDay,
    today,
    todayCounts: todayDone >= 1,
    days: marks,
  });
  const lock = state.banned
    ? 'ban'
    : state.writeLockedUntil && state.writeLockedUntil >= today
      ? 'week'
      : 'none';
  return {
    today,
    times,
    inEvening: inWindow(now, times.eveningStart, times.eveningEnd, timeZone),
    paused: isPaused(state.settings, today),
    assignment: assignment
      ? { id: assignment.id, day: assignment.day, tasks: toVisible(assignment.tasks) }
      : null,
    draft,
    yesterdayWaiting: Boolean(yesterdayDraft?.lines.some((line) => line.text.trim().length > 0)),
    echo: null,
    streak: counted.streak,
    best: counted.best,
    totalDone: state.assignments.reduce(
      (sum, item) => sum + item.tasks.filter((task) => task.status === 'done').length,
      0,
    ),
    strikeCount: strikeCount(state, now),
    lock,
    writeLockedUntil: state.writeLockedUntil,
    settings: state.settings,
    reports: state.reports.map((report) => {
      const { authorKey: _hidden, ...visible } = report;
      return visible;
    }),
    cardReady: Boolean(assignment && assignment.tasks.every((task) => task.status !== 'open')),
    wroteToday: Boolean(
      draft &&
        draft.lines.length === 3 &&
        draft.lines.every((line) => line.status === 'pending' && line.text.trim().length >= 10),
    ),
  };
}

export function marksForMonth(state: JournalState, today: string, year: number, month: number): Record<string, 'done' | 'miss' | 'pause' | 'open'> {
  const marks: Record<string, 'done' | 'miss' | 'pause' | 'open'> = {};
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= last; day += 1) {
    const iso = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (iso < state.createdDay || iso > today) continue;
    if (state.pausedDays.includes(iso)) {
      marks[iso] = 'pause';
      continue;
    }
    const assignment = state.assignments.find((item) => item.day === iso);
    const done = assignment?.tasks.filter((task) => task.status === 'done').length ?? 0;
    if (done >= 1) marks[iso] = 'done';
    else if (iso === today) marks[iso] = 'open';
    else if (iso < today) marks[iso] = 'miss';
  }
  return marks;
}

export function tasksOn(state: JournalState, day: string): VisibleTask[] | null {
  const assignment = state.assignments.find((item) => item.day === day);
  return assignment ? toVisible(assignment.tasks) : null;
}

export function exportJournal(state: JournalState, now: Date, timeZone: string) {
  const view = project(state, now, timeZone);
  return {
    hinweis: 'Export nur von diesem Gerät. Fotos bleiben draußen. Keine Autoren.',
    heute: view.today,
    streak: view.streak,
    besteStreak: view.best,
    erledigt: view.totalDone,
    einstellungen: {
      morgen: state.settings.morning,
      abendVon: state.settings.eveningStart,
      abendBis: state.settings.eveningEnd,
      pauseBis: state.settings.pauseUntil,
      sponsor: state.settings.sponsorMode,
    },
    aufgaben: state.assignments.map((assignment) => ({
      tag: assignment.day,
      punkte: assignment.tasks.map((task) => ({
        text: task.text,
        quelle: task.source,
        status: task.status,
        notiz: task.note,
        getauscht: task.replaced,
      })),
    })),
    geschrieben: state.drafts.map((draft) => ({
      tag: draft.day,
      zeilen: draft.lines.map((line) => ({ text: line.text, status: line.status })),
    })),
  };
}
