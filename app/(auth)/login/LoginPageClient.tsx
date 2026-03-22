'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { login, signup } from '../actions';

type LoginPageClientProps = {
  accountDeleted: boolean;
  initialIsLogin: boolean;
};

export default function LoginPageClient({ initialIsLogin, accountDeleted }: LoginPageClientProps) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccountDeletedNotice, setShowAccountDeletedNotice] = useState(accountDeleted);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMismatch =
    !isLogin && confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError('Die Passwoerter stimmen nicht ueberein.');
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const action = isLogin ? login : signup;
    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="app-container flex justify-center pb-10 pt-24 lg:pb-14 lg:pt-32">
        <div className="w-full max-w-[34rem]">
          <div className="ui-card-surface-light px-5 py-6 md:px-8 md:py-8">
            <Link
              href="/"
              className="mb-6 inline-flex w-fit items-center gap-2 text-[0.95rem] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ChevronLeft size={18} />
              Zurueck zur Startseite
            </Link>

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

            {isLogin && showAccountDeletedNotice ? (
              <div className="mt-6 rounded-[1rem] border border-[#dbe7f8] bg-[#eef5ff] px-4 py-3 text-[0.92rem] font-medium text-[#0a63ff]">
                Ihr Konto wurde geloescht. Ihre Anmeldedaten und Favoriten wurden entfernt.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <fieldset
                disabled={loading}
                className={`space-y-4 transition-opacity duration-200 ${
                  loading ? 'pointer-events-none opacity-70' : ''
                }`}
              >
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
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="ui-input !pl-[3.2rem]"
                      />
                    </div>
                  </label>

                {!isLogin ? (
                  <label className="block">
                    <span className="mb-2 block text-[0.88rem] font-medium text-[#3a4656]">
                      Passwort bestaetigen
                    </span>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                        <Lock size={15} />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Passwort bestaetigen"
                        required={!isLogin}
                        minLength={6}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className={`ui-input !pl-[3.2rem] ${
                          passwordsMismatch
                            ? '!border-[var(--color-danger)] !bg-[var(--color-danger-soft)]'
                            : ''
                        }`}
                      />
                    </div>
                    {passwordsMismatch ? (
                      <p className="mt-2 text-[0.82rem] font-medium text-[var(--color-danger)]">
                        Die Passwoerter stimmen nicht ueberein.
                      </p>
                    ) : null}
                  </label>
                ) : null}

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
                  aria-busy={loading}
                  className="ui-button-booking-primary mt-2 w-full disabled:cursor-wait disabled:opacity-80"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{isLogin ? 'Anmelden...' : 'Registrieren...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Anmelden' : 'Registrieren'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            {loading ? (
              <p className="mt-3 text-[0.88rem] font-medium text-[#6a7d96]">
                {isLogin
                  ? 'Anmeldung wird verarbeitet...'
                  : 'Registrierung wird verarbeitet...'}
              </p>
            ) : null}

            <div className="mt-6 border-t border-[#edf2f7] pt-5">
              <p className="text-[0.94rem] text-[#6a7d96]">
                {isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setError(null);
                    setShowAccountDeletedNotice(false);
                    setPassword('');
                    setConfirmPassword('');
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
