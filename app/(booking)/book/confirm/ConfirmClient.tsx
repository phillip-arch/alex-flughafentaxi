'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck, XCircle } from 'lucide-react';
import { confirmBooking } from '@/app/(booking)/actions';
import ConfirmStatusCard from '@/components/confirm/ConfirmStatusCard';

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
    if (driverId) {
      return (
        <ConfirmStatusCard
          icon={
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
              <CheckCircle2 size={38} />
            </div>
          }
          eyebrow={alreadyConfirmed ? 'Already confirmed' : 'Booking confirmed'}
          title={alreadyConfirmed ? 'This ride is already confirmed' : 'Thank you for your confirmation'}
          description={
            alreadyConfirmed
              ? message || 'You have already confirmed this booking.'
              : 'Your ride has been confirmed successfully. Our team is now planning the next steps for your transfer.'
          }
        />
      );
    }

    return (
      <ConfirmStatusCard
        icon={
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.12)_0%,rgba(36,144,255,0.18)_100%)] text-[#0a63ff]">
            <CheckCircle2 size={38} />
          </div>
        }
        eyebrow={alreadyConfirmed ? 'Already confirmed' : 'Booking confirmed'}
        title={alreadyConfirmed ? 'This ride is already confirmed' : 'Thank you for your confirmation'}
        description={
          alreadyConfirmed
            ? message || 'You have already confirmed this booking.'
            : 'Your ride has been confirmed successfully. Our team is now planning the next steps for your transfer.'
        }
      >
        <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[#1679FF]">
                <Mail size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Status</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                {alreadyConfirmed
                  ? 'No further action is required. The ride remains confirmed.'
                  : 'Your confirmation has been saved successfully and shared internally.'}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[#1679FF]">
                <ShieldCheck size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Reference</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[#42566f]">
                {driverId
                  ? 'The driver confirmation has been processed for this ride.'
                  : reference
                    ? `Booking number: ${reference}`
                    : 'The confirmation has been assigned to your booking.'}
              </p>
            </div>
          </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
          >
            <span className="text-white">Back to homepage</span>
            <ArrowRight size={17} className="text-white" />
          </Link>
        </div>
      </ConfirmStatusCard>
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
        eyebrow="Error"
        eyebrowClassName="text-[#d70015]"
        title="Confirmation not possible"
        description={message}
      >
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-field)] bg-[#000000] px-7 py-4 text-[1.0625rem] font-medium leading-none text-white no-underline transition-colors hover:bg-[#232325] hover:text-white visited:text-white"
          >
            <span className="text-white">Back to homepage</span>
          </Link>
        </div>
      </ConfirmStatusCard>
    );
  }

  return (
    <ConfirmStatusCard
      icon={
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8fc3ff] bg-[linear-gradient(135deg,rgba(10,99,255,0.10)_0%,rgba(36,144,255,0.14)_100%)] text-[#0a63ff]">
          <ShieldCheck size={38} />
        </div>
      }
      eyebrow="Confirmation"
      title="Confirm ride"
      description="Please click the button below to confirm your ride."
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
                <span className="text-white">Confirming...</span>
              </>
            ) : (
              <>
                <span className="text-white">Confirm now</span>
                <ArrowRight size={17} className="text-white" />
              </>
            )}
          </button>
      </div>
    </ConfirmStatusCard>
  );
}
