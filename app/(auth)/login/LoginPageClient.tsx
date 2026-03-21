'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Car,
  ChevronLeft,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { login, signup } from '../actions';

type LoginPageClientProps = {
  initialIsLogin: boolean;
};

export default function LoginPageClient({ initialIsLogin }: LoginPageClientProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const action = isLogin ? login : signup;
    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="app-container grid gap-8 pb-10 pt-22 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-20 lg:pb-14 lg:pt-28">
        <div className="max-w-[38rem]">
          <div className="ui-text-block-lg mt-5 md:mt-6">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-[0.95rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ChevronLeft size={18} />
              Zurueck zur Startseite
            </Link>

            <div className="ui-text-block-lg">
              <p className="ui-eyebrow w-fit border-none bg-[var(--color-booking-accent-soft)] text-[var(--color-booking-accent)]">
                Kundenkonto
              </p>
              <h1 className="ui-heading-xl max-w-[13ch] !text-[2rem] !leading-[1.02] md:!text-[3.01rem]">
                {isLogin ? 'Willkommen zurueck.' : 'Konto fuer schnellere Buchungen erstellen.'}
              </h1>
              <p className="ui-copy-compact max-w-[34rem]">
                {isLogin
                  ? 'Melden Sie sich an, um Buchungen zu verwalten, Fahrtdetails schneller auszufuellen und Ihren Flughafentransfer sauber an einem Ort zu behalten.'
                  : 'Registrieren Sie sich einmal und nutzen Sie Ihre Daten spaeter fuer schnellere Buchungen, klare Uebersicht und einen einfacheren Ablauf auf allen internen Seiten.'}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
              <span className="ui-icon-badge-accent">
                <Car size={20} strokeWidth={2.2} />
              </span>
              <div className="ui-text-block-sm mt-4">
                <h2 className="ui-heading-sm text-[#111827]">Schneller buchen</h2>
                <p className="ui-copy-sm text-[#6a7d96]">
                  Wiederkehrende Daten lassen sich spaeter einfacher nutzen.
                </p>
              </div>
            </div>

            <div className="ui-card-surface-light px-5 py-5 md:px-6 md:py-6">
              <span className="ui-icon-badge-accent">
                <User size={20} strokeWidth={2.2} />
              </span>
              <div className="ui-text-block-sm mt-4">
                <h2 className="ui-heading-sm text-[#111827]">Alles an einem Ort</h2>
                <p className="ui-copy-sm text-[#6a7d96]">
                  Behalten Sie Konto, Kontaktdaten und spaetere Buchungen zentral im Blick.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:mt-6">
          <div className="ui-card-surface-light px-5 py-6 md:px-8 md:py-8">
            <div className="ui-text-block-sm">
              <h2 className="ui-heading-lg text-[#111827]">
                {isLogin ? 'Anmelden' : 'Registrieren'}
              </h2>
              <p className="ui-copy-compact text-[#6a7d96]">
                {isLogin
                  ? 'Greifen Sie auf Ihr Kundenkonto zu.'
                  : 'Erstellen Sie Ihr Konto fuer kuenftige Buchungen.'}
              </p>
            </div>

            {error ? (
              <div className="mt-6 rounded-[1rem] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-[0.92rem] font-medium text-[var(--color-danger)]">
                {error}
              </div>
            ) : null}

            <form action={handleSubmit} className="mt-6 space-y-4">
              {!isLogin ? (
                <label className="block">
                  <span className="mb-2 block text-[0.88rem] font-medium text-[#3a4656]">
                    Vollstaendiger Name
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Vollstaendiger Name"
                      required={!isLogin}
                      className="ui-input !pl-[3.2rem]"
                    />
                  </div>
                </label>
              ) : null}

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
                    minLength={6}
                    className="ui-input !pl-[3.2rem]"
                  />
                </div>
              </label>

              {isLogin ? (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-[0.88rem] font-medium text-[var(--color-booking-accent)] transition-colors hover:text-[#0f6ae8]"
                  >
                    Passwort vergessen?
                  </Link>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="ui-button-booking-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Anmelden' : 'Registrieren'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-[#edf2f7] pt-5">
              <p className="text-[0.94rem] text-[#6a7d96]">
                {isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setError(null);
                  }}
                  className="ml-2 font-semibold text-[var(--color-booking-accent)] transition-colors hover:text-[#0f6ae8]"
                >
                  {isLogin ? 'Jetzt registrieren' : 'Hier anmelden'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
