-- GrowthGrind Weekly subscriber records.
-- This table is deliberately private: sign-up happens through the server-side
-- API route, and no browser can list or alter another person's email address.

create table if not exists public.weekly_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'website',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.weekly_subscribers enable row level security;

-- No public policies: the service-role API is the only access path.
revoke all on table public.weekly_subscribers from anon, authenticated;
