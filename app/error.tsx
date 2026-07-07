'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="servus-page flex min-h-screen items-center justify-center px-6">
      <div className="servus-card w-full max-w-md p-8 text-center">
        <p className="servus-eyebrow justify-center text-xs">Fehler</p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--paper)]">Etwas ist schiefgelaufen</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Bitte versuchen Sie es erneut. Wenn das Problem bestehen bleibt, erreichen Sie uns jederzeit
          telefonisch oder per WhatsApp.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[var(--amber)] px-5 py-2.5 text-sm font-semibold text-[var(--night)]"
          >
            Erneut versuchen
          </button>
          <a
            href="tel:+436764826069"
            className="rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)]"
          >
            Anrufen
          </a>
        </div>
      </div>
    </section>
  );
}
