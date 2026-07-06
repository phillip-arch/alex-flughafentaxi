'use client';

import { useState, useTransition } from 'react';
import { cancelBookingByToken, type ManagedBooking } from './actions';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Wartet auf Bestätigung', className: 'bg-amber-100 text-amber-800' },
  'Wartet auf Bestätigung': { label: 'Wartet auf Bestätigung', className: 'bg-amber-100 text-amber-800' },
  assigned: { label: 'Fahrer zugewiesen', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Bestätigt', className: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Storniert', className: 'bg-slate-200 text-slate-600' },
  completed: { label: 'Abgeschlossen', className: 'bg-slate-200 text-slate-600' },
};

function formatPickup(pickupAt: string) {
  const d = new Date(pickupAt);
  if (Number.isNaN(d.getTime())) return pickupAt;
  return d.toLocaleString('de-AT', {
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

  const statusInfo = STATUS_LABELS[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Ihre Buchung</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Nr. {booking.reference}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-500">Abholung</dt>
          <dd className="mt-0.5 text-slate-900">{booking.pickup}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Ziel</dt>
          <dd className="mt-0.5 text-slate-900">{booking.destination}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Datum &amp; Uhrzeit</dt>
          <dd className="mt-0.5 text-slate-900">{formatPickup(booking.pickupAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Fahrzeug &amp; Personen</dt>
          <dd className="mt-0.5 text-slate-900">
            {booking.vehicleType} · {booking.passengers} Pers.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Fixpreis</dt>
          <dd className="mt-0.5 text-lg font-bold text-slate-900">€{booking.price}</dd>
        </div>
      </dl>

      {message ? (
        <div
          className={`mt-6 rounded-xl border p-4 text-sm ${
            message.kind === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {!isCancelled ? (
        <div className="mt-8 border-t border-slate-100 pt-6">
          {!confirmOpen ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!booking.cancellable || isPending}
                className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buchung stornieren
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                {booking.cancellable
                  ? `Kostenlose Stornierung bis ${deadlineHours} Stunden vor Abholung.`
                  : `Online-Stornierung ist bis ${deadlineHours} Stunden vor Abholung möglich. Für kurzfristige Änderungen rufen Sie uns bitte an: +43 676 482 60 69.`}
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm font-semibold text-red-800">Buchung wirklich stornieren?</p>
              <p className="mt-1 text-xs text-red-600">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Behalten
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isPending ? 'Wird storniert…' : 'Ja, stornieren'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-500">
        Fragen zur Fahrt?{' '}
        <a href="tel:+436764826069" className="font-semibold text-blue-600">
          Anrufen
        </a>{' '}
        ·{' '}
        <a href="https://wa.me/436764826069" className="font-semibold text-emerald-600">
          WhatsApp
        </a>
      </p>
    </div>
  );
}
