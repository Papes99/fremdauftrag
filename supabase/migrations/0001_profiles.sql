-- Noch nicht ausgeführt. Es gibt absichtlich noch kein Supabase-Projekt.
-- Anonyme Anmeldung muss später im Projekt eingeschaltet werden (Region Frankfurt).
-- Gespeichert wird nur "mindestens 16", nicht das Geburtsjahr.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  language text not null default 'de',
  timezone text,
  age_confirmed boolean not null default false,
  morning_time time not null default '07:00',
  evening_start time not null default '18:00',
  evening_end time not null default '23:59',
  schedule_overrides jsonb,
  paused_until date,
  streak int not null default 0,
  best_streak int not null default 0,
  last_active_at timestamptz,
  strike_count int not null default 0,
  is_banned boolean not null default false,
  push_token text
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;

-- Die App darf Strikes, Sperre und Push-Token nicht selbst ändern.
grant select (
  id,
  created_at,
  language,
  timezone,
  age_confirmed,
  morning_time,
  evening_start,
  evening_end,
  schedule_overrides,
  paused_until,
  streak,
  best_streak,
  last_active_at
) on table public.profiles to authenticated;

grant insert (
  id,
  language,
  timezone,
  age_confirmed,
  morning_time,
  evening_start,
  evening_end
) on table public.profiles to authenticated;

grant update (
  language,
  timezone,
  age_confirmed,
  morning_time,
  evening_start,
  evening_end,
  schedule_overrides,
  paused_until,
  last_active_at
) on table public.profiles to authenticated;

create policy "eigenes profil lesen"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "eigenes profil anlegen"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "eigenes profil ändern"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
