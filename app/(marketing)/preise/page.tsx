import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preise - Fixe Flughafentransfer-Tarife',
  description: 'Transparente und fixe Preise fuer Ihren Transfer zum und vom Flughafen Wien.',
};

export default function PricesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Unsere Preise</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Standard</h2>
          <p className="mb-4 text-3xl font-black text-indigo-600">35 EUR</p>
          <ul className="space-y-2 text-slate-600">
            <li>Bis zu 2 Personen</li>
            <li>2 Koffer</li>
            <li>Kostenlose Stornierung</li>
          </ul>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Kombi</h2>
          <p className="mb-4 text-3xl font-black text-indigo-600">40 EUR</p>
          <ul className="space-y-2 text-slate-600">
            <li>Bis zu 4 Personen</li>
            <li>4 Koffer</li>
            <li>Kostenlose Stornierung</li>
          </ul>
        </div>
        <div className="rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Van</h2>
          <p className="mb-4 text-3xl font-black text-indigo-600">60 EUR</p>
          <ul className="space-y-2 text-slate-600">
            <li>Bis zu 8 Personen</li>
            <li>8 Koffer</li>
            <li>Kostenlose Stornierung</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
