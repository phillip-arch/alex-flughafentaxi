create table if not exists public.distance_pricing_settings (
  id text primary key default 'default',
  enabled boolean not null default true,
  airport_lat double precision not null default 48.110278,
  airport_lng double precision not null default 16.569722,
  base_fee numeric not null default 18,
  limo_per_km numeric not null default 1.70,
  kombi_per_km numeric not null default 1.90,
  bus_per_km numeric not null default 2.40,
  minimum_limo_price numeric not null default 45,
  minimum_kombi_price numeric not null default 50,
  minimum_bus_price numeric not null default 65,
  round_to numeric not null default 1,
  updated_at timestamptz default now()
);

insert into public.distance_pricing_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.distance_pricing_settings enable row level security;

drop policy if exists "public read distance pricing settings" on public.distance_pricing_settings;
create policy "public read distance pricing settings"
on public.distance_pricing_settings for select
to anon, authenticated
using (true);

alter table public.bookings
  add column if not exists pricing_source text,
  add column if not exists pricing_distance_km numeric,
  add column if not exists pricing_duration_minutes integer;
