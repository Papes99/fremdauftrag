-- Noch nicht ausgeführt. Es gibt absichtlich noch kein Supabase-Projekt.
-- Zusätzliche Sperrwörter, die später ohne App-Update gepflegt werden können.
-- Normale Nutzer dürfen die Liste nicht lesen.

create table public.moderation_terms (
  id uuid primary key default gen_random_uuid(),
  phrase text not null unique,
  severity text not null check (severity in ('schwer', 'leicht')),
  reason_key text not null,
  active boolean not null default true
);

alter table public.moderation_terms enable row level security;
