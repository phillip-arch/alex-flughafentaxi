-- Adds columns for the reminder cron and passenger self-cancellation.
-- Run once in the Supabase SQL editor (safe to re-run: IF NOT EXISTS).

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS manage_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Passenger self-service token. Separate from confirm_token, which rotates:
-- confirm_token becomes the driver confirmation token on assignment and is
-- invalidated on unassign. manage_token stays stable for the booking lifetime.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_manage_token_idx
  ON public.bookings (manage_token);

-- Index for the hourly reminder query (status + window + not-yet-sent).
CREATE INDEX IF NOT EXISTS bookings_reminder_lookup_idx
  ON public.bookings (pickup_at)
  WHERE reminder_sent_at IS NULL;
