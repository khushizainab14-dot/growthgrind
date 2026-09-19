create table if not exists public.admissions_intelligence (
  id bigint generated always as identity primary key,
  university text not null,
  course text not null,
  a_level_offer text,
  required_subjects text,
  gcse_requirements text,
  admissions_tests text,
  contextual_offer text,
  application_deadline date,
  official_source_url text not null,
  last_checked_at timestamptz not null default now(),
  unique (university, course)
);
alter table public.admissions_intelligence enable row level security;
create policy "Public admissions intelligence is readable" on public.admissions_intelligence for select using (true);
