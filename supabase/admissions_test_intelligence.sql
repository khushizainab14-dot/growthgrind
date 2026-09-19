create table if not exists public.admissions_test_intelligence (
  id bigint generated always as identity primary key,
  test_name text not null,
  course_area text,
  university text,
  registration_deadline date,
  test_date date,
  official_resource_url text not null,
  topics jsonb not null default '[]'::jsonb,
  last_checked_at timestamptz not null default now(),
  unique (test_name, university, course_area)
);
alter table public.admissions_test_intelligence enable row level security;
create policy "Public test intelligence is readable" on public.admissions_test_intelligence for select using (true);
