-- GrowthGrind opportunity-collector foundation.
-- Run once in the Supabase SQL Editor before enabling source-specific collectors.

alter table public.opportunities
  add column if not exists source_key text,
  add column if not exists source_kind text,
  add column if not exists source_checked_at timestamptz,
  add column if not exists source_seen_at timestamptz,
  add column if not exists is_active boolean not null default true,
  add column if not exists missing_refreshes integer not null default 0;

create index if not exists opportunities_source_key_active_idx
  on public.opportunities (source_key, is_active);

create index if not exists opportunities_source_seen_at_idx
  on public.opportunities (source_seen_at desc);

create table if not exists public.opportunity_source_runs (
  id bigint generated always as identity primary key,
  source_key text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'failed')),
  discovered_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  deactivated_count integer not null default 0,
  error_message text
);

create index if not exists opportunity_source_runs_source_started_idx
  on public.opportunity_source_runs (source_key, started_at desc);

alter table public.opportunity_source_runs enable row level security;

drop policy if exists "Anyone can read public opportunity source runs" on public.opportunity_source_runs;
create policy "Anyone can read public opportunity source runs"
  on public.opportunity_source_runs for select using (true);
