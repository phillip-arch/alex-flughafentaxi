import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Haeufige Fragen',
  description: 'Antworten auf haeufige Fragen zu unserem Flughafentransfer in Wien.',
};

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Haeufige Fragen</h1>
      <div className="space-y-6">
        <div className="rounded-2xl border p-6">
          <h2 className="mb-2 text-xl font-bold">Wie finde ich meinen Fahrer?</h2>
          <p className="text-slate-600">
            Ihr Fahrer wartet in der Ankunftshalle mit einem Namensschild auf Sie.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="mb-2 text-xl font-bold">Kann ich mit Karte bezahlen?</h2>
          <p className="text-slate-600">
            Ja, wir akzeptieren gaengige Kreditkarten sowie Apple Pay.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="mb-2 text-xl font-bold">Was passiert bei Flugverspaetungen?</h2>
          <p className="text-slate-600">
            Wir verfolgen Ihren Flug und passen die Abholzeit automatisch an.
          </p>
        </div>
      </div>
    </div>
  );
}
