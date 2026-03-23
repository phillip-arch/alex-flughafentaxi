'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { confirmBooking } from '@/app/(booking)/actions';
import ConfirmStatusCard from '@/components/confirm/ConfirmStatusCard';

export default function DriverConfirmClient({
  token,
  driverId,
  bookingSummary,
}: {
  token: string;
  driverId?: string;
  bookingSummary?: {
    pickup: string;
    destination: string;
    date: string;
    time: string;
    vehicle: string;
  };
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const handleConfirm = async () => {
    setStatus('loading');
    const result = await confirmBooking(token, driverId);

    if (result.error) {
      if (result.code === 'ALREADY_CONFIRMED') {
        setAlreadyConfirmed(true);
        setMessage(result.error);
        setStatus('success');
      } else {
        setAlreadyConfirmed(false);
        setMessage(result.error);
        setStatus('error');
      }
      return;
    }

    setAlreadyConfirmed(false);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <ConfirmStatusCard
        icon={
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
            <CheckCircle2 size={38} />
          </div>
        }
        eyebrow={alreadyConfirmed ? 'Bereits bestaetigt' : 'Buchung bestaetigt'}
        title={alreadyConfirmed ? 'Diese Fahrt ist bereits bestaetigt' : 'Vielen Dank fuer Ihre Bestaetigung'}
        description={
          alreadyConfirmed
            ? message || 'Sie haben diese Buchung bereits bestaetigt.'
            : 'Ihre Fahrt wurde erfolgreich bestaetigt.'
        }
      />
    );
  }

  if (status === 'error') {
    return (
      <ConfirmStatusCard
        icon={
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015]">
            <XCircle size={38} />
          </div>
        }
        eyebrow="Fehler"
        eyebrowClassName="text-[#d70015]"
        title="Bestaetigung nicht moeglich"
        description={message}
      />
    );
  }

  return (
    <ConfirmStatusCard
      icon={null}
      title="Fahrt bestaetigen"
      description="Bitte klicken Sie auf den Button unten, um Ihre Fahrt verbindlich zu bestaetigen."
    >
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleConfirm}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white transition-colors hover:bg-[#232325] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="animate-spin text-white" size={17} />
                <span className="text-white">Wird bestaetigt...</span>
              </>
            ) : (
              <>
                <span className="text-white">Jetzt bestaetigen</span>
                <ArrowRight size={17} className="text-white" />
              </>
            )}
          </button>
      </div>

      {bookingSummary ? (
        <div className="mt-8 w-full rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
          <div className="flex items-center gap-2 text-[#1679FF]">
            <ShieldCheck size={18} />
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">
              Fahrtinformationen
            </p>
          </div>
          <div className="mt-3 space-y-2 text-[0.98rem] leading-7 text-[#42566f]">
            <p><strong className="text-[#111827]">Abholung:</strong> {bookingSummary.pickup}</p>
            <p><strong className="text-[#111827]">Ziel:</strong> {bookingSummary.destination}</p>
            <p><strong className="text-[#111827]">Datum:</strong> {bookingSummary.date}</p>
            <p><strong className="text-[#111827]">Uhrzeit:</strong> {bookingSummary.time}</p>
            <p><strong className="text-[#111827]">Fahrzeug:</strong> {bookingSummary.vehicle}</p>
          </div>
        </div>
      ) : null}
    </ConfirmStatusCard>
  );
}
