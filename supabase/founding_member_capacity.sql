-- Run once in the Supabase SQL Editor before enabling the 30-place founding
-- membership offer. Reservations make the advertised limit safe even when
-- several students open Stripe Checkout at the same time.

create table if not exists public.founding_member_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'reserved' check (status in ('reserved', 'claimed')),
  stripe_checkout_session_id text unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.founding_member_reservations enable row level security;

create index if not exists founding_member_reservations_status_expiry_idx
  on public.founding_member_reservations (status, expires_at);

create or replace function public.reserve_founding_spot(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_id uuid;
begin
  -- Serialize availability checks so the 30th and 31st requests cannot both
  -- reserve the final place.
  perform pg_advisory_xact_lock(82640231);
  delete from public.founding_member_reservations
    where status = 'reserved' and expires_at <= now();

  if exists (
    select 1 from public.premium_memberships
      where user_id = p_user_id and plan = 'founding' and status = 'active'
  ) then
    return null;
  end if;

  select id into reservation_id from public.founding_member_reservations
    where user_id = p_user_id and status = 'reserved' and expires_at > now();
  if reservation_id is not null then
    return reservation_id;
  end if;

  if (
    (select count(*) from public.premium_memberships where plan = 'founding' and status = 'active') +
    (select count(*) from public.founding_member_reservations where status = 'reserved' and expires_at > now())
  ) >= 30 then
    return null;
  end if;

  insert into public.founding_member_reservations (user_id, expires_at)
    values (p_user_id, now() + interval '35 minutes')
  on conflict (user_id) do update
    set status = 'reserved', expires_at = excluded.expires_at, stripe_checkout_session_id = null
    where public.founding_member_reservations.status = 'reserved'
  returning id into reservation_id;

  return reservation_id;
end;
$$;

create or replace function public.claim_founding_reservation(
  p_reservation_id uuid,
  p_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean := false;
begin
  -- Stripe retries events. A previous attempt may have claimed the reservation
  -- just before a temporary network failure, so treat the same session as a
  -- successful idempotent claim.
  if exists (
    select 1 from public.founding_member_reservations
      where id = p_reservation_id
        and status = 'claimed'
        and stripe_checkout_session_id = p_session_id
  ) then
    return true;
  end if;

  update public.founding_member_reservations
    set status = 'claimed', stripe_checkout_session_id = p_session_id
    where id = p_reservation_id
      and status = 'reserved'
      and expires_at > now()
  returning true into claimed;
  return claimed;
end;
$$;

revoke all on function public.reserve_founding_spot(uuid) from public;
revoke all on function public.claim_founding_reservation(uuid, text) from public;
grant execute on function public.reserve_founding_spot(uuid) to service_role;
grant execute on function public.claim_founding_reservation(uuid, text) to service_role;
