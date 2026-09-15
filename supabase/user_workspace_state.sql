-- Account-linked state for GrowthGrind Premium workspaces.
-- Each row stores one small JSON workspace per authenticated student.

create table if not exists public.user_workspace_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_key text not null check (char_length(workspace_key) <= 80),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_key)
);

alter table public.user_workspace_state enable row level security;

drop policy if exists "Students manage their own workspace state" on public.user_workspace_state;
create policy "Students manage their own workspace state"
on public.user_workspace_state
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_workspace_state_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_workspace_state_updated_at on public.user_workspace_state;
create trigger user_workspace_state_updated_at
before update on public.user_workspace_state
for each row execute function public.set_workspace_state_updated_at();
