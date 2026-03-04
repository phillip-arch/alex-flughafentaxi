'use client';

import { useState } from 'react';
import { confirmBooking } from '@/app/(booking)/actions';
import { CheckCircle, XCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
        setReference(result.reference!);
        setStatus('success');
      } else {
        setAlreadyConfirmed(false);
        setMessage(result.error);
        setStatus('error');
      }
    } else {
      setAlreadyConfirmed(false);
      setReference(result.reference!);
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="w-full max-w-[560px] bg-white rounded-[24px] px-7 py-8 sm:px-10 sm:py-10 text-center shadow-sm border border-[#d2d2d7] animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-[#f2fcfc] rounded-full flex items-center justify-center mx-auto mb-5 text-[#0071e3]">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">
          {alreadyConfirmed ? 'Bereits bestätigt' : 'Buchung bestätigt!'}
        </h1>
        <p className="text-[#86868b] text-[15px] mb-2">
          {alreadyConfirmed ? (message || 'Sie haben diese Buchung bereits bestätigt.') : 'Ihre Fahrt wurde erfolgreich bestätigt.'}
        </p>
        {!driverId ? (
          <p className="text-[#1d1d1f] font-medium text-[15px] mb-8">
            Buchungsnummer: {reference}
          </p>
        ) : <div className="mb-8" />}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full h-14 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[17px] rounded-full transition-all"
        >
          Zur Startseite <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-[560px] bg-white rounded-[24px] px-7 py-8 sm:px-10 sm:py-10 text-center shadow-sm border border-[#d2d2d7] animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-[#fff2f4] rounded-full flex items-center justify-center mx-auto mb-5 text-[#d70015]">
          <XCircle size={32} />
        </div>
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">Fehler</h1>
        <p className="text-[#86868b] text-[15px] mb-8">
          {message}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full h-14 bg-[#1d1d1f] hover:bg-black text-white font-medium text-[17px] rounded-full transition-all"
        >
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px] bg-white rounded-[24px] px-7 py-8 sm:px-10 sm:py-10 text-center shadow-sm border border-[#d2d2d7] animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-5 text-[#1d1d1f]">
        <ShieldCheck size={32} />
      </div>
      <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">Buchung bestätigen</h1>
      <p className="text-[#86868b] text-[15px] mb-8">
        Bitte klicken Sie auf den Button unten, um Ihre Fahrt verbindlich zu bestätigen.
      </p>
      <button
        onClick={handleConfirm}
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 w-full h-14 bg-[#1d1d1f] hover:bg-black disabled:opacity-50 text-white font-medium text-[17px] rounded-full transition-all"
      >
        {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Jetzt bestätigen'}
      </button>
    </div>
  );
}
