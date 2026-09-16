-- Shared, account-linked student intelligence profile for Premium tools.
create table if not exists public.student_intelligence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_intelligence enable row level security;

create policy "Students manage their own intelligence profile"
on public.student_intelligence for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
