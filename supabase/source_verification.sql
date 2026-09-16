create table if not exists public.source_verifications (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id text not null,
  source_url text not null,
  source_name text,
  verified_at timestamptz not null default now(),
  unique (entity_type, entity_id, source_url)
);

alter table public.source_verifications enable row level security;
create policy "Anyone can read verified public sources" on public.source_verifications for select using (true);
