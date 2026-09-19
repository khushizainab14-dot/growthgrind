create table if not exists public.experience_intelligence (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id bigint,
  title text not null,
  subjects text[] not null default '{}',
  skills text[] not null default '{}',
  evidence text,
  reflection text,
  outcome text,
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.experience_intelligence enable row level security;
create policy "Students manage their own experience intelligence" on public.experience_intelligence for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
