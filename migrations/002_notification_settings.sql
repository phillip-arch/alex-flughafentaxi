-- Cancellation notification controls, editable in the dispatch dashboard.
-- Safe to re-run.

-- Key/value settings store (service-role access only; RLS with no policies).
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Default: operator alert email falls back to env until set in the dashboard.
INSERT INTO public.app_settings (key, value)
VALUES ('cancellation_alert_email', '{"email": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Per-driver toggle: send cancellation email when an assigned ride is cancelled.
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS notify_on_cancellation BOOLEAN NOT NULL DEFAULT true;
