'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck, XCircle } from 'lucide-react';
import { confirmBooking } from '@/app/(booking)/actions';

export default function ConfirmClient({ token, driverId }: { token: string; driverId?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const handleConfirm = async () => {
    setStatus('loading');
    const result = await confirmBooking(token, driverId);

    if (result.error) {
      if (result.code === 'ALREADY_CONFIRMED') {
        setAlreadyConfirmed(true);
        setMessage(result.error);
        setReference(result.reference || '');
        setStatus('success');
      } else {
        setAlreadyConfirmed(false);
        setMessage(result.error);
        setStatus('error');
      }
      return;
    }

    setAlreadyConfirmed(false);
    setReference(result.reference || '');
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
            <CheckCircle2 size={38} />
          </div>

          <div className="mt-14 flex flex-col items-center gap-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              {alreadyConfirmed ? 'Bereits bestaetigt' : 'Buchung bestaetigt'}
            </p>
            <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
              {alreadyConfirmed ? 'Diese Fahrt ist bereits bestaetigt' : 'Vielen Dank fuer Ihre Bestaetigung'}
            </h1>
            <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
              {alreadyConfirmed
                ? message || 'Sie haben diese Buchung bereits bestaetigt.'
                : 'Ihre Fahrt wurde erfolgreich bestaetigt. Unser Team plant nun die weiteren Schritte fuer Ihren Transfer.'}
            </p>
          </div>

          <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[#1679FF]">
                <Mail size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Status</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                {alreadyConfirmed
                  ? 'Es ist keine weitere Aktion erforderlich. Die Fahrt bleibt bestaetigt.'
                  : 'Ihre Bestaetigung wurde erfolgreich gespeichert und intern weitergegeben.'}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[#1679FF]">
                <ShieldCheck size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Referenz</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                {driverId
                  ? 'Die Fahrerbestaetigung wurde fuer diese Fahrt verarbeitet.'
                  : reference
                    ? `Buchungsnummer: ${reference}`
                    : 'Die Bestaetigung wurde Ihrer Buchung zugeordnet.'}
              </p>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
            >
              <span className="text-white">Zur Startseite</span>
              <ArrowRight size={17} className="text-white" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
        <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#f1d1d6] bg-[#fff4f6] text-[#d70015]">
            <XCircle size={38} />
          </div>

          <div className="mt-14 flex flex-col items-center gap-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d70015]">
              Fehler
            </p>
            <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
              Bestaetigung nicht moeglich
            </h1>
            <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
              {message}
            </p>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
            >
              <span className="text-white">Zur Startseite</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card-surface-light px-6 py-8 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-[42rem] flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.10)_0%,rgba(36,144,255,0.14)_100%)] text-[#0a63ff]">
          <ShieldCheck size={38} />
        </div>

        <div className="mt-14 flex flex-col items-center gap-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
            Bestaetigung
          </p>
          <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[2.6rem]">
            Fahrt bestaetigen
          </h1>
          <p className="max-w-[34rem] text-[1rem] leading-8 text-[#5d6b7c] md:text-[1.06rem]">
            Bitte klicken Sie auf den Button unten, um Ihre Fahrt verbindlich zu bestaetigen.
          </p>
        </div>

        <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
          <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left md:col-span-2">
            <div className="flex items-center gap-2 text-[#1679FF]">
              <ShieldCheck size={18} />
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Hinweis</p>
            </div>
            <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
              Mit Ihrer Bestaetigung wird die Fahrt verbindlich fuer die weitere Planung freigegeben.
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
