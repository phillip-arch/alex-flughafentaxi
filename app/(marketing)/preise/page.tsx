import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preise - Fixe Flughafentransfer-Tarife',
  description: 'Transparente und fixe Preise für Ihren Transfer zum und vom Flughafen Wien.',
};

export default function PricesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Unsere Preise</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Pricing Cards */}
        <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4">Standard</h2>
          <p className="text-3xl font-black text-indigo-600 mb-4">35 €</p>
          <ul className="space-y-2 text-slate-600">
            <li>Bis zu 3 Personen</li>
            <li>2 Koffer</li>
            <li>Kostenlose Stornierung</li>
          </ul>
        </div>
        <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-slate-50">
          <h2 className="text-2xl font-bold mb-4">Kombi</h2>
          <p className="text-3xl font-black text-indigo-600 mb-4">40 €</p>
          <ul className="space-y-2 text-slate-600">
            <li>Bis zu 4 Personen</li>
            <li>4 Koffer</li>
            <li>Kostenlose Stornierung</li>
          </ul>
        </div>
        <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold mb-4">Van</h2>
          <p className="text-3xl font-black text-indigo-600 mb-4">60 €</p>
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
