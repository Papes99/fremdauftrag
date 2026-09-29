import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

/**
 * Solange kein Supabase-Projekt existiert, bleiben die Werte leer.
 * Die App tut dann nicht so, als gäbe es ein Konto in der Cloud.
 */
export const supabaseConfigured = url.length > 0 && anonKey.length > 0;

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export async function signInAnonymously(): Promise<{ connected: boolean }> {
  if (!supabase) return { connected: false };
  const { error } = await supabase.auth.signInAnonymously();
  return { connected: !error };
}
