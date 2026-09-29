-- Noch nicht ausgeführt. Es gibt absichtlich noch kein Supabase-Projekt.
-- author_id steht nur in tasks und task_sets, nie in der Sicht für Empfänger.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  source text not null check (source in ('user', 'seed', 'pack', 'sponsor')),
  text text not null,
  language text not null default 'de',
  status text not null check (status in ('pending', 'approved', 'rejected', 'removed')),
  moderation_reason text,
  severity text check (severity in ('schwer', 'leicht')),
  report_count int not null default 0,
  theme_pack_id uuid,
  sponsor_id uuid,
  created_at timestamptz not null default now()
);

create table public.task_sets (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  task_ids uuid[] not null,
  assigned boolean not null default false
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  task_ids uuid[] not null,
  task_set_id uuid references public.task_sets (id)
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  task_id uuid not null references public.tasks (id),
  status text not null check (status in ('done', 'skipped', 'expired')),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

create table public.theme_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  product_id text,
  is_active boolean not null default true
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active_from date,
  active_to date,
  weekly_limit int not null default 1,
  enabled boolean not null default false
);

create or replace view public.my_assignment_tasks
with (security_invoker = false) as
select
  a.receiver_id,
  a.day,
  t.id as task_id,
  t.text,
  t.source
from public.assignments a
join public.tasks t on t.id = any (a.task_ids)
where a.receiver_id = auth.uid();

alter table public.tasks enable row level security;
alter table public.task_sets enable row level security;
alter table public.assignments enable row level security;
alter table public.completions enable row level security;
alter table public.reports enable row level security;
alter table public.theme_packs enable row level security;
alter table public.sponsors enable row level security;

revoke all on table public.tasks, public.task_sets, public.assignments, public.completions, public.reports, public.theme_packs, public.sponsors from public, anon, authenticated;
revoke all on table public.my_assignment_tasks from public, anon, authenticated;
grant select on table public.my_assignment_tasks to authenticated;
