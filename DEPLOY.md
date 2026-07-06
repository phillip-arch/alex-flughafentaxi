# Deployment: one codebase, three Vercel projects

This repo runs all three surfaces. `proxy.ts` reads `APP_SURFACE` and redirects
cross-surface paths, so each deployment only serves its own routes.

| Project    | APP_SURFACE | Domain example              | Serves                                  |
|------------|-------------|-----------------------------|-----------------------------------------|
| website    | www         | flughafentaxi-wien.at       | marketing, /book/*, /booking/manage     |
| user app   | app         | app.flughafentaxi-wien.at   | /login, /account, /book/*, auth callbacks |
| dispatch   | dispatch    | dispatch.flughafentaxi-wien.at | /dispatch/* (noindexed, auth-gated)  |

## 1. Supabase (shared by all three)
1. Create the project (EU / Frankfurt) or reuse the existing one.
2. SQL editor, run in order:
   - `supabase_schema.sql` (skip if reusing existing DB)
   - `fix_bookings_schema.sql` (skip if already applied)
   - `migrations/001_reminders_and_cancellation.sql` (REQUIRED, additive, safe to re-run)
   - `migrations/002_notification_settings.sql` (REQUIRED, additive, safe to re-run)
3. `npm run import:zip-prices` (and `import:streets` if used).
4. Auth > URL Configuration: Site URL = app domain; add redirect URLs for
   `https://app.<domain>/auth/callback` and `/auth/callback/recovery`.

## 2. Three Vercel projects, same repo
Create three projects, all importing this repo. Environment variables:

**Identical on all three** (from `.env.example`):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BOOKING_ALERT_EMAIL`, `ADMIN_LOGIN_ALERT_EMAIL`,
`GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `AERODATABOX_API_KEY`,
`PUBLIC_WEB_URL=https://<website-domain>`,
`PUBLIC_APP_URL=https://app.<domain>`,
`PUBLIC_DISPATCH_URL=https://dispatch.<domain>`

**Per project:**
- website: `APP_SURFACE=www`, `APP_URL=https://<website-domain>`,
  `NEXT_PUBLIC_APP_URL=https://<website-domain>`, `CRON_SECRET=<long random>`
- user app: `APP_SURFACE=app`, `APP_URL=https://app.<domain>`,
  `NEXT_PUBLIC_APP_URL=https://app.<domain>`
- dispatch: `APP_SURFACE=dispatch`, `APP_URL=https://dispatch.<domain>`,
  `NEXT_PUBLIC_APP_URL=https://dispatch.<domain>`

Notes:
- `vercel.json` ships the reminder cron to all three projects; the route itself
  only executes on `APP_SURFACE=www`, so set `CRON_SECRET` on the website project
  (setting it on the others is harmless).
- Booking confirmation links (`/book/confirm`) use `APP_URL`; manage/cancel links
  (`/booking/manage`) always use `PUBLIC_WEB_URL`.

## 3. Resend
Verify the sending domain (SPF + DKIM), set `RESEND_FROM_EMAIL` on that domain.
Until verified, mail falls back to `onboarding@resend.dev` (works, poor deliverability).

## 4. Verify after deploy
- `https://<website-domain>/api/health` returns `{"ok":true}`
- `https://<website-domain>/book/` loads; `https://app.<domain>/` redirects to /account
- `https://dispatch.<domain>/` redirects to /dispatch/login
- Make a test booking: confirmation email arrives with .ics attachment and a
  working "Buchung online ansehen oder stornieren" button

## 5. Static marketing site handoff (Hostinger)
The static site sends users to `/book/` with URL params:
`/book/?from=...&to=...&vehicle=limo|kombi|bus&flight=...&when=...&name=...&phone=...&notes=...&lang=de|en`
Point its `APP_URL` constant at the **website** domain (proxy keeps /book there).

## What's new in this version
- `/booking/manage?token=` - guest self-service: view + cancel (3h day / 8h night
  policy, mirrors lead-time rules); passenger + operator emails on cancel
- Confirmation email: manage/cancel button + `.ics` calendar attachment (2h alarm)
- `/api/cron/reminders` + `vercel.json` - one reminder ~24h before pickup,
  idempotent (`reminder_sent_at`), www-surface-gated
- `/api/health`, `app/error.tsx`
- `/book/` richer presets: vehicle preselect, flight, when, name, phone, notes
- Cancellation notifications: operator alert address editable in dispatch
  (Fahrer tab > Benachrichtigungen; empty = env fallback); per-driver toggle
  "Storno-Info" controls whether an assigned driver gets a cancellation email
- `migrations/001_reminders_and_cancellation.sql`, `migrations/002_notification_settings.sql`
