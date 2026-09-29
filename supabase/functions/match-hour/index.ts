// Noch nicht veröffentlicht. Es gibt noch kein Supabase-Projekt.
// Gedacht als stündlicher Job. Er teilt nur zu, wessen Morgenzeit in 1 bis 3 Stunden liegt.
// Die Empfänger-Sicht enthält kein author_id.

import { planHour, type DuePerson, type MatchSet } from '../../../src/lib/matching.ts';

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    return Response.json({ ok: false, reason: 'not_connected', plans: 0 });
  }

  return Response.json({
    ok: false,
    reason: 'not_connected',
    plans: 0,
    note: 'Die Zuteilung planHour ist fertig und getestet. Der Datenbankzugriff kommt erst mit dem Supabase-Projekt.',
  });
});

export type { DuePerson, MatchSet };
void planHour;
