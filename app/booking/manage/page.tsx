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
    <section className="servus-page min-h-screen">
      <div className="app-container pt-[100px] pb-16 md:pt-[8rem]">
        <div className="mx-auto w-full max-w-[640px]">
          {'error' in result ? (
            <div className="servus-card p-6 text-center">
              <h1 className="text-xl font-semibold text-[var(--red)]">Buchung nicht gefunden</h1>
              <p className="mt-2 text-sm text-[var(--red)]">{result.error}</p>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Fragen? Rufen Sie uns an:{' '}
                <a href="tel:+436764826069" className="font-semibold text-[var(--amber)]">
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
