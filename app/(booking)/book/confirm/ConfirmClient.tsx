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
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,182,41,.35)] bg-[linear-gradient(135deg,rgba(255,182,41,.12)_0%,rgba(255,182,41,.18)_100%)] text-[var(--amber)]">
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
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,182,41,.35)] bg-[linear-gradient(135deg,rgba(255,182,41,.12)_0%,rgba(255,182,41,.18)_100%)] text-[var(--amber)]">
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
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--night)] px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[var(--amber)]">
                <Mail size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Status</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[var(--muted)]">
                {alreadyConfirmed
                  ? 'No further action is required. The ride remains confirmed.'
                  : 'Your confirmation has been saved successfully and shared internally.'}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--night)] px-5 py-5 text-left">
              <div className="flex items-center gap-2 text-[var(--amber)]">
                <ShieldCheck size={18} />
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em]">Reference</p>
              </div>
              <p className="mt-3 text-[0.98rem] leading-7 text-[var(--muted)]">
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
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[var(--amber)] px-7 py-4 text-[1.0625rem] font-medium leading-none text-[var(--night)] no-underline transition-colors hover:bg-[var(--amber-deep)] hover:text-[var(--night)] visited:text-[var(--night)]"
          >
            <span className="text-[var(--night)]">Back to homepage</span>
            <ArrowRight size={17} className="text-[var(--night)]" />
          </Link>
        </div>
      </ConfirmStatusCard>
    );
  }

  if (status === 'error') {
    return (
      <ConfirmStatusCard
        icon={
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(232,106,106,.35)] bg-[rgba(232,106,106,.10)] text-[var(--red)]">
            <XCircle size={38} />
          </div>
        }
        eyebrow="Error"
        eyebrowClassName="text-[var(--red)]"
        title="Confirmation not possible"
        description={message}
      >
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-field)] bg-[var(--amber)] px-7 py-4 text-[1.0625rem] font-medium leading-none text-[var(--night)] no-underline transition-colors hover:bg-[var(--amber-deep)] hover:text-[var(--night)] visited:text-[var(--night)]"
          >
            <span className="text-[var(--night)]">Back to homepage</span>
          </Link>
        </div>
      </ConfirmStatusCard>
    );
  }

  return (
    <ConfirmStatusCard
      icon={
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,182,41,.35)] bg-[linear-gradient(135deg,rgba(255,182,41,.10)_0%,rgba(255,182,41,.14)_100%)] text-[var(--amber)]">
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
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[var(--amber)] px-7 py-4 text-[1.0625rem] font-medium leading-none text-[var(--night)] transition-colors hover:bg-[var(--amber-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="animate-spin text-[var(--night)]" size={17} />
                <span className="text-[var(--night)]">Confirming...</span>
              </>
            ) : (
              <>
                <span className="text-[var(--night)]">Confirm now</span>
                <ArrowRight size={17} className="text-[var(--night)]" />
              </>
            )}
          </button>
      </div>
    </ConfirmStatusCard>
  );
}
