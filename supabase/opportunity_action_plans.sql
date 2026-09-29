-- Premium opportunity action plans. Run once in Supabase SQL Editor.
create table if not exists public.opportunity_action_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id text not null,
  opportunity_title text not null,
  steps jsonb not null default '[]'::jsonb,
  reflection text not null default '',
  reminder_enabled boolean not null default false,
  reminder_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

alter table public.opportunity_action_plans enable row level security;

create policy "Users manage their own action plans"
  on public.opportunity_action_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
