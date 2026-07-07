'use client';

import { useState, useTransition } from 'react';
import { cancelBookingByToken, type ManagedBooking } from './actions';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Wartet auf Bestätigung', className: 'servus-status-warning' },
  'Wartet auf Bestätigung': { label: 'Wartet auf Bestätigung', className: 'servus-status-warning' },
  assigned: { label: 'Fahrer zugewiesen', className: 'bg-[rgba(111,165,232,.12)] text-[var(--blue)]' },
  confirmed: { label: 'Bestätigt', className: 'servus-status-success' },
  cancelled: { label: 'Storniert', className: 'bg-[rgba(147,160,181,.14)] text-[var(--muted)]' },
  completed: { label: 'Abgeschlossen', className: 'bg-[rgba(147,160,181,.14)] text-[var(--muted)]' },
};

function formatPickup(pickupAt: string) {
  const d = new Date(pickupAt);
  if (Number.isNaN(d.getTime())) return pickupAt;
  return d.toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ManageClient({ booking, token }: { booking: ManagedBooking; token: string }) {
  const [status, setStatus] = useState(booking.status);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusInfo = STATUS_LABELS[status] || { label: status, className: 'bg-[rgba(147,160,181,.14)] text-[var(--muted)]' };
  const isCancelled = status === 'cancelled';
  const deadlineHours = Math.round(booking.cancellationDeadlineMinutes / 60);

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelBookingByToken(token);
      if ('error' in result) {
        setMessage({ kind: 'error', text: result.error });
      } else {
        setStatus('cancelled');
        setMessage({
          kind: 'ok',
          text: 'Ihre Buchung wurde storniert. Eine Bestätigung wurde per E-Mail versendet.',
        });
      }
      setConfirmOpen(false);
    });
  };

  return (
    <div className="servus-card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="servus-eyebrow text-xs">Ihre Buchung</p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--paper)]">Nr. {booking.reference}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-[var(--muted)]">Abholung</dt>
          <dd className="mt-0.5 text-[var(--paper)]">{booking.pickup}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--muted)]">Ziel</dt>
          <dd className="mt-0.5 text-[var(--paper)]">{booking.destination}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--muted)]">Datum &amp; Uhrzeit</dt>
          <dd className="mt-0.5 text-[var(--paper)]">{formatPickup(booking.pickupAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--muted)]">Fahrzeug &amp; Personen</dt>
          <dd className="mt-0.5 text-[var(--paper)]">
            {booking.vehicleType} · {booking.passengers} Pers.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--muted)]">Fixpreis</dt>
          <dd className="servus-mono mt-0.5 text-lg font-bold text-[var(--amber)]">€{booking.price}</dd>
        </div>
      </dl>

      {message ? (
        <div
          className={`mt-6 rounded-xl border p-4 text-sm ${
            message.kind === 'ok'
              ? 'border-[rgba(62,207,142,.35)] bg-[rgba(62,207,142,.12)] text-[var(--green)]'
              : 'border-[rgba(232,106,106,.35)] bg-[rgba(232,106,106,.10)] text-[var(--red)]'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {!isCancelled ? (
        <div className="mt-8 border-t border-[var(--line)] pt-6">
          {!confirmOpen ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!booking.cancellable || isPending}
                className="w-full rounded-xl border border-[rgba(232,106,106,.35)] bg-[rgba(232,106,106,.10)] px-5 py-3 text-sm font-semibold text-[var(--red)] transition hover:border-[var(--red)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buchung stornieren
              </button>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                {booking.cancellable
                  ? `Kostenlose Stornierung bis ${deadlineHours} Stunden vor Abholung.`
                  : `Online-Stornierung ist bis ${deadlineHours} Stunden vor Abholung möglich. Für kurzfristige Änderungen rufen Sie uns bitte an: +43 676 482 60 69.`}
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-[rgba(232,106,106,.35)] bg-[rgba(232,106,106,.10)] p-4 text-center">
              <p className="text-sm font-semibold text-[var(--red)]">Buchung wirklich stornieren?</p>
              <p className="mt-1 text-xs text-[var(--red)]">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isPending}
                  className="rounded-lg border border-[var(--line)] bg-[rgba(255,255,255,.05)] px-4 py-2 text-sm font-semibold text-[var(--paper)]"
                >
                  Behalten
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-lg bg-[var(--red)] px-4 py-2 text-sm font-semibold text-[var(--night)] disabled:opacity-60"
                >
                  {isPending ? 'Wird storniert…' : 'Ja, stornieren'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Fragen zur Fahrt?{' '}
        <a href="tel:+436764826069" className="font-semibold text-[var(--amber)]">
          Anrufen
        </a>{' '}
        ·{' '}
        <a href="https://wa.me/436764826069" className="font-semibold text-[var(--green)]">
          WhatsApp
        </a>
      </p>
    </div>
  );
}
