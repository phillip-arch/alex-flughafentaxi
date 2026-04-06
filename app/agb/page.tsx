import type { Metadata } from 'next';
import { getLegalContent, normalizeLegalLocale } from '@/lib/legal/content';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = normalizeLegalLocale(params?.lang);
  return {
    title: locale === 'en' ? 'Terms and Conditions' : 'AGB',
  };
}

export default async function AgbPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const content = getLegalContent('agb', params?.lang);

  return (
    <main className="app-page">
      <section className="section-shell-tight-top bg-white">
        <div className="app-container">
          <div className="mx-auto max-w-[56rem] rounded-[2rem] border border-[#e7edf5] bg-white px-6 py-8 shadow-[0_16px_38px_rgba(17,17,17,0.06)] md:px-8 md:py-10">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              {content.eyebrow}
            </p>
            <h1 className="mt-3 text-[2rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.5rem]">
              {content.title}
            </h1>
            <p className="mt-6 text-[1rem] leading-[1.8] text-[#5f6975]">{content.intro}</p>

            <div className="mt-8 space-y-6">
              {content.sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[1.5rem] border border-[#e7edf5] bg-[#fbfcff] px-5 py-5"
                >
                  <h2 className="text-[1.2rem] font-bold tracking-[-0.04em] text-[#111111]">
                    {section.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-[0.98rem] leading-[1.75] text-[#5f6975]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
