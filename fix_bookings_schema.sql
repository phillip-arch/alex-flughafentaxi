-- 1. Add missing columns
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_reference TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 2. Backfill booking_reference for existing rows
-- We generate a unique reference for existing rows to satisfy the NOT NULL and UNIQUE constraints
UPDATE public.bookings 
SET booking_reference = 'REF-' || SUBSTRING(md5(id::text || random()::text), 1, 8)
WHERE booking_reference IS NULL;

-- 3. Add constraints
ALTER TABLE public.bookings 
ALTER COLUMN booking_reference SET NOT NULL;

ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_booking_reference_key;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference);
