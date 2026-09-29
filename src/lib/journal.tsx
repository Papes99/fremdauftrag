import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SEED_TASKS, SPONSOR_TASKS, THEME_PACKS } from '@/data/catalog';
import { deviceTimeZone } from '@/lib/clock';
import { AI_AVAILABLE, SPONSORS_ENABLED } from '@/lib/flags';
import {
  adminClose,
  adminRemove,
  createJournal,
  exportJournal,
  fileReport,
  marksForMonth,
  project,
  refreshHints,
  setDraftLine,
  setPause,
  setTaskNote,
  setTaskPhoto,
  setTaskStatus,
  submitDraft,
  tasksOn,
  tick,
  updateSettings,
  type Catalogs,
  type JournalState,
  type JournalView,
  type ReportReason,
  type Settings,
  type VisibleTask,
} from '@/lib/journalLogic';
import { useSession } from '@/lib/session';

const STORAGE_KEY = 'fremdauftrag.journal.v1';

const catalogs: Catalogs = {
  seeds: SEED_TASKS,
  packs: THEME_PACKS.map((pack) => ({ id: pack.id, tasks: pack.tasks })),
  sponsors: SPONSOR_TASKS,
  sponsorsEnabled: SPONSORS_ENABLED,
  aiAvailable: AI_AVAILABLE,
};

type JournalContextValue = {
  ready: boolean;
  view: JournalView | null;
  packs: typeof THEME_PACKS;
  setStatus: (taskKey: string, status: 'done' | 'skipped') => void;
  setNote: (taskKey: string, note: string) => void;
  setPhoto: (taskKey: string, photo: string | null) => void;
  report: (taskKey: string, reason: ReportReason) => 'saved' | 'duplicate' | 'replaced';
  removeTask: (taskKey: string) => void;
  closeReport: (reportId: string) => void;
  editLine: (index: number, text: string) => void;
  newHints: () => void;
  submit: () => void;
  patchSettings: (patch: Partial<Settings>) => void;
  pauseFor: (days: number | null) => void;
  tasksFor: (day: string) => VisibleTask[] | null;
  marks: (year: number, month: number) => Record<string, 'done' | 'miss' | 'pause' | 'open'>;
  exportJson: () => string;
  wipe: () => Promise<void>;
};

const JournalContext = createContext<JournalContextValue | null>(null);

function isJournal(value: unknown): value is JournalState {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<JournalState>;
  return row.version === 1 && typeof row.sessionCreatedAt === 'string' && Array.isArray(row.assignments);
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [state, setState] = useState<JournalState | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    if (!session?.onboardingComplete) {
      setState(null);
      setReady(true);
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        const tz = deviceTimeZone();
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        const base =
          isJournal(parsed) && parsed.sessionCreatedAt === session.createdAt
            ? parsed
            : createJournal(new Date(), session.createdAt, tz, catalogs);
        setState(tick(base, new Date(), catalogs, tz));
      })
      .catch(() => {
        if (!alive || !session) return;
        const tz = deviceTimeZone();
        setState(createJournal(new Date(), session.createdAt, tz, catalogs));
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [session]);

  useEffect(() => {
    if (!state) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const tz = deviceTimeZone();
    const ticked = tick(state, now, catalogs, tz);
    if (JSON.stringify(ticked) !== JSON.stringify(state)) setState(ticked);
  }, [now, state]);

  const change = useCallback((fn: (current: JournalState) => JournalState) => {
    setState((current) => {
      if (!current) return current;
      return tick(fn(current), new Date(), catalogs, deviceTimeZone());
    });
  }, []);

  const view = state ? project(state, now, deviceTimeZone()) : null;

  const value = useMemo<JournalContextValue>(() => {
    const tz = deviceTimeZone();
    return {
      ready,
      view,
      packs: THEME_PACKS,
      setStatus: (taskKey, status) => change((current) => setTaskStatus(current, taskKey, status)),
      setNote: (taskKey, note) => change((current) => setTaskNote(current, taskKey, note)),
      setPhoto: (taskKey, photo) => change((current) => setTaskPhoto(current, taskKey, photo)),
      report: (taskKey, reason) => {
        if (!state) return 'duplicate';
        const filed = fileReport(state, taskKey, reason, new Date(), catalogs);
        setState(tick(filed.state, new Date(), catalogs, deviceTimeZone()));
        return filed.result;
      },
      removeTask: (taskKey) => change((current) => adminRemove(current, taskKey, catalogs)),
      closeReport: (reportId) => change((current) => adminClose(current, reportId)),
      editLine: (index, text) => {
        const day = view?.today;
        if (!day) return;
        change((current) => setDraftLine(current, day, index, text));
      },
      newHints: () => {
        const day = view?.today;
        if (!day) return;
        change((current) => refreshHints(current, day, catalogs, String(Date.now())));
      },
      submit: () => change((current) => submitDraft(current, new Date(), catalogs, tz)),
      patchSettings: (patch) => change((current) => updateSettings(current, patch)),
      pauseFor: (days) => change((current) => setPause(current, days, new Date(), tz)),
      tasksFor: (day) => (state ? tasksOn(state, day) : null),
      marks: (year, month) => (state && view ? marksForMonth(state, view.today, year, month) : {}),
      exportJson: () => (state ? JSON.stringify(exportJournal(state, new Date(), tz), null, 2) : '{}'),
      wipe: async () => {
        setState(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    };
  }, [change, ready, state, view]);

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal(): JournalContextValue {
  const value = useContext(JournalContext);
  if (!value) throw new Error('useJournal außerhalb des JournalProvider');
  return value;
}
