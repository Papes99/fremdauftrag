import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'fremdauftrag.session.v1';

/**
 * Nur das, was auf dem Gerät bleiben darf.
 * Kein Geburtsjahr, kein Name, keine Aufgaben.
 */
export type LocalSession = {
  onboardingComplete: boolean;
  ageConfirmed: boolean;
  pushAsked: boolean;
  pushGranted: boolean | null;
  serverConnected: boolean;
  createdAt: string;
};

type SessionContextValue = {
  ready: boolean;
  session: LocalSession | null;
  save: (next: LocalSession) => Promise<void>;
  forget: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function isSession(value: unknown): value is LocalSession {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<LocalSession>;
  return (
    typeof row.onboardingComplete === 'boolean' &&
    typeof row.ageConfirmed === 'boolean' &&
    typeof row.pushAsked === 'boolean' &&
    (row.pushGranted === null || typeof row.pushGranted === 'boolean') &&
    typeof row.serverConnected === 'boolean' &&
    typeof row.createdAt === 'string'
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isSession(parsed)) setSession(parsed);
      })
      .catch(() => {
        // Kaputter Speicher zählt wie kein Start. Die Person geht noch einmal durchs Onboarding.
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(async (next: LocalSession) => {
    setSession(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const forget = useCallback(async () => {
    setSession(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ ready, session, save, forget }), [ready, session, save, forget]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession außerhalb des SessionProvider');
  }
  return value;
}
