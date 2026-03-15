import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">FlughafenTaxi Wien</h3>
            <p className="max-w-xs text-sm text-slate-500">
              Zuverlaessiger Flughafentransfer in Wien. Fixpreise, professionelle Fahrer und
              komfortable Fahrzeuge.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Service
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/book" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  Fahrt buchen
                </Link>
              </li>
              <li>
                <Link href="/preise" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/flotte" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  Flotte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Unternehmen
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-sm text-slate-500 transition-colors hover:text-indigo-600">
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-slate-500 transition-colors hover:text-indigo-600"
                >
                  Admin-Anmeldung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} FlughafenTaxi Wien. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 transition-colors hover:text-slate-600">
              Datenschutz
            </Link>
            <Link href="/terms" className="text-xs text-slate-400 transition-colors hover:text-slate-600">
              Nutzungsbedingungen
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
