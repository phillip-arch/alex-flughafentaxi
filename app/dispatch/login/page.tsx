'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/app/(auth)/actions';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await adminLogin(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {loading ? (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-[1.1rem] border border-[#dbe7f8] bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(17,17,17,0.12)] backdrop-blur-sm md:inset-x-auto md:right-6 md:top-6 md:bottom-auto md:w-[20rem]">
          <div className="flex items-center gap-3 text-[#111827]">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8fbff] text-[#1679ff]">
              <Loader2 size={18} className="animate-spin" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.95rem] font-semibold">Anmeldung laeuft</p>
              <p className="text-[0.84rem] text-[#6a7d96]">Admin-Zugang wird geprueft...</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="app-container flex min-h-screen justify-center pb-10 pt-24 lg:pb-14 lg:pt-32">
        <div className="w-full max-w-[34rem]">
          <div className="ui-card-surface-light bg-white px-5 py-6 md:px-8 md:py-8">
            <div className="ui-text-block-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679ff]">
                <ShieldCheck size={20} />
              </div>
              <h1 className="ui-heading-lg text-[#111827]">Admin-Portal</h1>
            </div>

            {error ? (
              <div className="mt-6 rounded-[1rem] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-[0.92rem] font-medium text-[var(--color-danger)]">
                {error}
              </div>
            ) : null}

            <form action={handleSubmit} className="mt-6 space-y-4">
              <fieldset
                disabled={loading}
                className={`space-y-4 transition-opacity duration-200 ${
                  loading ? 'pointer-events-none opacity-70' : ''
                }`}
              >
                <label className="block">
                  <span className="mb-2 block text-[0.88rem] font-medium text-[#3a4656]">
                    Admin-E-Mail
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="E-Mail"
                      required
                      className="ui-input !bg-white !pl-[3.2rem] focus:!bg-white"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[0.88rem] font-medium text-[#3a4656]">
                    Passwort
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                      <Lock size={15} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Passwort"
                      required
                      className="ui-input !bg-white !pl-[3.2rem] focus:!bg-white"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="ui-button-booking-primary mt-2 w-full disabled:cursor-wait disabled:opacity-80"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Anmelden...</span>
                    </>
                  ) : (
                    <>
                      <span>Anmelden</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            {loading ? <p className="mt-3 text-[0.88rem] font-medium text-[#6a7d96]">Anmeldung wird verarbeitet...</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
