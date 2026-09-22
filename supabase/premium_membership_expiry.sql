-- Run once in the Supabase SQL Editor before releasing timed Premium passes.
-- Existing memberships remain unchanged: only new annual/two-year purchases
-- receive an expiry date from the Stripe webhook.

alter table public.premium_memberships
  add column if not exists expires_at timestamptz;

create index if not exists premium_memberships_active_expiry_idx
  on public.premium_memberships (user_id, status, expires_at);
