create table if not exists public.zip_prices (
  id uuid primary key default gen_random_uuid(),
  zip text not null unique,
  city text not null,
  base_price numeric not null,
  limo_price numeric not null,
  kombi_price numeric not null,
  bus_price numeric not null,
  created_at timestamptz default now()
);

create index if not exists zip_prices_zip_idx on public.zip_prices (zip);

alter table public.zip_prices enable row level security;

drop policy if exists "public read zip prices" on public.zip_prices;
create policy "public read zip prices"
on public.zip_prices for select
to anon, authenticated
using (true);
