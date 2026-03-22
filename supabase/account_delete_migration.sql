alter table public.bookings
  alter column email drop not null,
  alter column phone drop not null;

comment on column public.bookings.email is
  'Nullable so contact data can be removed when a user deletes their account while retaining booking records.';

comment on column public.bookings.phone is
  'Nullable so contact data can be removed when a user deletes their account while retaining booking records.';
