create table if not exists public.streets (
  id uuid primary key default gen_random_uuid(),
  zip text not null,
  street text not null,
  city text not null default 'Wien',
  created_at timestamptz default now(),
  unique (zip, street, city)
);

create index if not exists streets_zip_idx on public.streets (zip);
create index if not exists streets_street_idx on public.streets (street);

alter table public.streets enable row level security;

drop policy if exists "public read streets" on public.streets;
create policy "public read streets"
on public.streets for select
to anon, authenticated
using (true);

alter table public.saved_addresses
add column if not exists label text check (label in ('home', 'office', 'extra'));

with ranked as (
  select
    id,
    row_number() over (partition by user_id order by created_at asc, id asc) as rn
  from public.saved_addresses
  where label is null
)
update public.saved_addresses as target
set label = case
  when ranked.rn = 1 then 'home'
  when ranked.rn = 2 then 'office'
  when ranked.rn = 3 then 'extra'
  else null
end
from ranked
where ranked.id = target.id;

create unique index if not exists saved_addresses_user_label_unique
  on public.saved_addresses (user_id, label)
  where label is not null;
