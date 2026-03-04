'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/(auth)/actions';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      setMessage(result.error);
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-sm border border-[#d2d2d7]">
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight text-center">Neues Passwort</h1>
        <p className="text-[#86868b] text-[15px] mb-8 text-center">
          Bitte geben Sie Ihr neues Passwort ein.
        </p>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-[#fff2f4] text-[#d70015] text-[14px] rounded-xl border border-[#ffd1d9]">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              Neues Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="w-full bg-[#f5f5f7] border-none rounded-xl px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full bg-[#f5f5f7] border-none rounded-xl px-4 py-3.5 text-[15px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1d1d1f] hover:bg-black disabled:opacity-50 text-white font-medium text-[17px] py-4 rounded-full transition-all mt-4"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Passwort speichern'}
            {!status && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
