'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle, ChevronLeft, Loader2, Mail } from 'lucide-react';
import { requestPasswordReset } from '@/app/(auth)/actions';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result.error) {
      setMessage(result.error);
      setStatus('error');
      return;
    }

    if (result.success) {
      setMessage(result.success);
      setStatus('success');
    }
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="app-container flex justify-center pb-10 pt-24 lg:pb-14 lg:pt-32">
        <div className="w-full max-w-[34rem]">
          <div className="ui-card-surface-light px-5 py-6 md:px-8 md:py-8">
            <Link
              href="/login"
              className="mb-6 inline-flex w-fit items-center gap-2 text-[0.95rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ChevronLeft size={18} />
              Zurueck zum Login
            </Link>

            <div className="ui-text-block-sm">
              <h1 className="ui-heading-lg text-[#111827]">Passwort vergessen</h1>
              <p className="ui-copy-compact text-[#6a7d96]">
                Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zuruecksetzen Ihres Passworts.
              </p>
            </div>

            {status === 'error' ? (
              <div className="mt-6 rounded-[1rem] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-[0.92rem] font-medium text-[var(--color-danger)]">
                {message}
              </div>
            ) : null}

            {status === 'success' ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-[1rem] border border-[#dbe7f8] bg-[#eef5ff] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1679ff]">
                      <CheckCircle size={20} />
                    </span>
                    <p className="text-[0.95rem] leading-6 text-[#0a63ff]">{message}</p>
                  </div>
                </div>

                <Link href="/login" className="ui-button-booking-primary w-full">
                  Zurueck zum Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <fieldset
                  disabled={status === 'loading'}
                  className={`space-y-4 transition-opacity duration-200 ${
                    status === 'loading' ? 'pointer-events-none opacity-70' : ''
                  }`}
                >
                  <label className="block">
                    <span className="mb-2 block text-[0.88rem] font-medium text-[#3a4656]">
                      E-Mail
                    </span>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                        <Mail size={15} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        placeholder="E-Mail Adresse"
                        required
                        className="ui-input !pl-[3.2rem]"
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    aria-busy={status === 'loading'}
                    className="ui-button-booking-primary mt-2 w-full disabled:cursor-wait disabled:opacity-80"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Link wird gesendet...</span>
                      </>
                    ) : (
                      <>
                        <span>Link senden</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
