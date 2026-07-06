'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--color-page-bg)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Fehler</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Etwas ist schiefgelaufen</h1>
        <p className="mt-3 text-sm text-slate-600">
          Bitte versuchen Sie es erneut. Wenn das Problem bestehen bleibt, erreichen Sie uns jederzeit
          telefonisch oder per WhatsApp.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Erneut versuchen
          </button>
          <a
            href="tel:+436764826069"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Anrufen
          </a>
        </div>
      </div>
    </section>
  );
}
