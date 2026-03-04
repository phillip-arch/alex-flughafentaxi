-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- DRIVERS (Admin only)
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- BOOKINGS
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- Nullable for guest bookings
  full_name text not null,
  email text not null,
  phone text not null,
  pickup text not null,
  destination text not null,
  flight_number text,
  pickup_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'confirmed', 'cancelled', 'completed')),
  driver_id uuid references public.drivers(id),
  confirm_token uuid, -- Secure random token for driver confirmation
  confirm_token_used_at timestamptz,
  confirm_token_expires_at timestamptz,
  notes text,
  price numeric, -- Added price field
  vehicle_type text, -- Added vehicle type
  passengers int,
  luggage int,
  created_at timestamptz default now()
);

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- SAVED ADDRESSES
create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  created_at timestamptz default now(),
  unique (user_id, label)
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid, -- Who performed the action
  action text not null, -- 'ASSIGN_DRIVER', 'CANCEL_RIDE', etc.
  entity text not null, -- 'bookings', 'drivers'
  entity_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);

-- 3. Triggers & Functions

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Block profile role change (Security Critical)
create or replace function public.block_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if current_user not in ('service_role', 'postgres') then
      raise exception 'Not allowed to change role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_profile_role_change on public.profiles;
create trigger trg_block_profile_role_change
before update on public.profiles
for each row execute function public.block_profile_role_change();

-- 4. Row Level Security (RLS)

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.drivers enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES Policies
create policy "read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Revoke role update permission from everyone except service_role
revoke update (role) on table public.profiles from authenticated;
revoke update (role) on table public.profiles from anon;
grant update (role) on table public.profiles to service_role;

-- BOOKINGS Policies
create policy "user read own bookings"
on public.bookings for select
to authenticated
using (auth.uid() = user_id);

create policy "user insert own bookings"
on public.bookings for insert
to authenticated
with check (auth.uid() = user_id);

-- Note: Updates/Cancellations should be handled via Server Actions/API Routes
-- to enforce the 3h/8h time window rules securely.

-- SAVED ADDRESSES Policies
create policy "user read own addresses"
on public.saved_addresses for select
to authenticated
using (auth.uid() = user_id);

create policy "user write own addresses"
on public.saved_addresses for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user update own addresses"
on public.saved_addresses for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user delete own addresses"
on public.saved_addresses for delete
to authenticated
using (auth.uid() = user_id);

-- DRIVERS & AUDIT LOGS
-- No public/authenticated policies. 
-- These tables are accessible ONLY via the Service Role (Server Actions/API Routes).
