'use client';

import { useState } from 'react';
import { requestPasswordReset } from '@/app/(auth)/actions';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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
    } else if (result.success) {
      setMessage(result.success);
      setStatus('success');
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-sm border border-[#d2d2d7]">
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight text-center">Passwort vergessen</h1>
        
        {status === 'success' ? (
          <div className="text-center mt-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[#f2fcfc] rounded-full flex items-center justify-center mx-auto mb-6 text-[#0071e3]">
              <CheckCircle size={32} />
            </div>
            <p className="text-[#86868b] text-[15px] mb-8 leading-relaxed">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#1d1d1f] hover:bg-black text-white font-medium text-[17px] py-4 rounded-full transition-all"
            >
              Zurück zum Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[#86868b] text-[15px] mb-8 text-center">
              Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>

            {status === 'error' && (
              <div className="mb-6 p-4 bg-[#fff2f4] text-[#d70015] text-[14px] rounded-xl border border-[#ffd1d9]">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                  E-Mail Adresse
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-[#f5f5f7] border-none rounded-xl px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] transition-all"
                  placeholder="name@beispiel.at"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 w-full bg-[#1d1d1f] hover:bg-black disabled:opacity-50 text-white font-medium text-[17px] py-4 rounded-full transition-all mt-4"
              >
                {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Link senden'}
                {!status && <ArrowRight size={20} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-[#0071e3] hover:underline text-[15px]">
                Zurück zum Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
