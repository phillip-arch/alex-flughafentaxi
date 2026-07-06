import { Metadata } from 'next';
import { getBookingByToken } from './actions';
import ManageClient from './ManageClient';

export const metadata: Metadata = {
  title: 'Buchung verwalten',
  description: 'Buchung ansehen oder stornieren.',
  robots: { index: false, follow: false },
};

type ManagePageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function ManageBookingPage({ searchParams }: ManagePageProps) {
  const resolved = searchParams ? await searchParams : {};
  const token = String(resolved.token || '').trim();
  const result = token
    ? await getBookingByToken(token)
    : ({ error: 'Kein Buchungslink angegeben. Bitte verwenden Sie den Link aus Ihrer Bestätigungs-E-Mail.' } as const);

  return (
    <section className="min-h-screen bg-[var(--color-page-bg)]">
      <div className="app-container pt-[100px] pb-16 md:pt-[8rem]">
        <div className="mx-auto w-full max-w-[640px]">
          {'error' in result ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <h1 className="text-xl font-semibold text-red-700">Buchung nicht gefunden</h1>
              <p className="mt-2 text-sm text-red-600">{result.error}</p>
              <p className="mt-4 text-sm text-slate-600">
                Fragen? Rufen Sie uns an:{' '}
                <a href="tel:+436764826069" className="font-semibold text-blue-600">
                  +43 676 482 60 69
                </a>
              </p>
            </div>
          ) : (
            <ManageClient booking={result.booking} token={token} />
          )}
        </div>
      </div>
    </section>
  );
}
