import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Impressum',
};

export default function ImpressumPage() {
  return (
    <main className="app-page">
      <Navbar />
      <section className="bg-white pb-14 pt-28 md:pb-18 md:pt-36">
        <div className="app-container">
          <div className="mx-auto max-w-[58rem] rounded-[2.1rem] border border-[#e7edf5] bg-white shadow-[0_18px_42px_rgba(17,17,17,0.06)]">
            <div className="border-b border-[#edf2f7] px-6 py-8 md:px-8 md:py-10">
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                Rechtliches
              </p>
              <h1 className="mt-3 max-w-[18ch] text-[2rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.6rem]">
                Impressum
              </h1>
            </div>

            <div className="px-4 py-4 md:px-5 md:py-5">
              <section className="rounded-[1.55rem] border border-[#e7edf5] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(17,17,17,0.035)] md:px-6 md:py-6">
                <h2 className="text-[1.18rem] font-bold tracking-[-0.04em] text-[#111111] md:text-[1.24rem]">
                  Alex Flughafentaxi OG
                </h2>
                <div className="mt-4 space-y-4 text-[0.98rem] leading-[1.72] tracking-[-0.01em] text-[#58677e]">
                  <p>Wien, Österreich</p>
                  <p>
                    E-Mail:{' '}
                    <a
                      href="mailto:info@flughafentaxi-wien-alex.at"
                      className="font-medium text-[#1678ff] underline underline-offset-2 hover:text-[#0f5fcc]"
                    >
                      info@flughafentaxi-wien-alex.at
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
