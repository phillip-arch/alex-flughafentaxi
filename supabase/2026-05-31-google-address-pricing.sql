alter table public.bookings
  add column if not exists pickup_formatted_address text,
  add column if not exists pickup_zip text,
  add column if not exists pickup_city text,
  add column if not exists pickup_country text,
  add column if not exists pickup_lat double precision,
  add column if not exists pickup_lng double precision,
  add column if not exists pickup_place_id text,
  add column if not exists dropoff_formatted_address text,
  add column if not exists dropoff_zip text,
  add column if not exists dropoff_city text,
  add column if not exists dropoff_country text,
  add column if not exists dropoff_lat double precision,
  add column if not exists dropoff_lng double precision,
  add column if not exists dropoff_place_id text;

alter table public.zip_prices
  drop constraint if exists zip_prices_zip_key;

create unique index if not exists zip_prices_zip_city_unique_idx
  on public.zip_prices (zip, city);

create index if not exists zip_prices_zip_city_idx
  on public.zip_prices (zip, city);
