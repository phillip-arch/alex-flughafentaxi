alter table public.saved_addresses
drop constraint if exists saved_addresses_user_id_city_zip_street_house_number_key;

drop index if exists public.saved_addresses_user_id_city_zip_street_house_number_key;

alter table public.saved_addresses
drop column if exists house_number;

alter table public.saved_addresses
add constraint saved_addresses_user_id_city_zip_street_key
unique (user_id, city, zip, street);
