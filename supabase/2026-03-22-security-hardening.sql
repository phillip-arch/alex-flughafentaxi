-- Security hardening / schema sync
-- Run in Supabase SQL editor against the taxi app database.

begin;

alter table public.bookings
  add column if not exists booking_reference text,
  add column if not exists payment_method text,
  add column if not exists ip_address text,
  add column if not exists confirm_token_used_at timestamptz,
  add column if not exists confirm_token_expires_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_status_check'
      and conrelid = 'public.bookings'::regclass
  ) then
    alter table public.bookings
      add constraint bookings_status_check
      check (status in ('pending', 'assigned', 'confirmed', 'cancelled', 'canceled', 'completed'));
  else
    alter table public.bookings drop constraint bookings_status_check;
    alter table public.bookings
      add constraint bookings_status_check
      check (status in ('pending', 'assigned', 'confirmed', 'cancelled', 'canceled', 'completed'));
  end if;
end $$;

create unique index if not exists bookings_booking_reference_key
  on public.bookings (booking_reference)
  where booking_reference is not null;

create table if not exists public.auth_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_address text,
  email text,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_rate_limits_action_created_at_idx
  on public.auth_rate_limits (action, created_at desc);

create index if not exists auth_rate_limits_ip_action_created_at_idx
  on public.auth_rate_limits (ip_address, action, created_at desc);

create index if not exists auth_rate_limits_email_action_created_at_idx
  on public.auth_rate_limits (email, action, created_at desc);

alter table public.auth_rate_limits enable row level security;

comment on table public.auth_rate_limits is
  'Service-role-only rate limit log for auth and password reset flows.';

comment on column public.bookings.booking_reference is
  'Human-safe booking reference used in emails and customer/account views.';

comment on column public.bookings.payment_method is
  'Optional payment label used by admin flows and emails.';

comment on column public.bookings.ip_address is
  'Rate-limiting support field for booking creation.';

commit;
