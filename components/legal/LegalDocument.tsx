import Navbar from '@/components/Navbar';
import type { LegalBlock, LegalPageContent } from '@/lib/legal/content';

function renderBlock(block: LegalBlock, key: string) {
  if (block.type === 'paragraph') {
    return (
      <p key={key} className="text-[0.98rem] leading-[1.72] tracking-[-0.01em] text-[#58677e]">
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul
        key={key}
        className="list-disc space-y-2.5 pl-6 text-[0.98rem] leading-[1.68] tracking-[-0.01em] text-[#58677e] marker:text-[#1678ff]"
      >
        {block.items.map((item, index) => (
          <li key={`${key}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'subheading') {
    return (
      <h3
        key={key}
        className="pt-2 text-[1.02rem] font-semibold tracking-[-0.03em] text-[#111111]"
      >
        {block.text}
      </h3>
    );
  }

  return (
    <div
      key={key}
      className="rounded-[1.2rem] border border-[#e6edf7] bg-[#fbfcff] px-5 py-5 shadow-[0_10px_24px_rgba(17,17,17,0.04)]"
    >
      <p className="text-[1rem] font-semibold tracking-[-0.03em] text-[#111111]">{block.name}</p>
      <p className="mt-2 text-[0.98rem] leading-[1.72] text-[#58677e]">{block.location}</p>
      <a
        href={`mailto:${block.email}`}
        className="mt-2 inline-block text-[0.98rem] font-medium text-[#1678ff] underline underline-offset-2 hover:text-[#0f5fcc]"
      >
        {block.email}
      </a>
    </div>
  );
}

export default function LegalDocument({ content }: { content: LegalPageContent }) {
  return (
    <main className="app-page">
      <Navbar />
      <section className="bg-white pb-14 pt-28 md:pb-18 md:pt-36">
        <div className="app-container">
          <div className="mx-auto max-w-[58rem] rounded-[2.1rem] border border-[#e7edf5] bg-white shadow-[0_18px_42px_rgba(17,17,17,0.06)]">
            <div className="border-b border-[#edf2f7] px-6 py-8 md:px-8 md:py-10">
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
                {content.eyebrow}
              </p>
              <h1 className="mt-3 max-w-[18ch] text-[2rem] font-black tracking-[-0.05em] text-[#111111] md:text-[2.6rem]">
                {content.title}
              </h1>

              {content.intro ? (
                <p className="mt-5 max-w-[48rem] text-[1rem] leading-[1.8] text-[#5f6975]">
                  {content.intro}
                </p>
              ) : null}
            </div>

            <div className="px-4 py-4 md:px-5 md:py-5">
              <div className="space-y-4">
                {content.sections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-[1.55rem] border border-[#e7edf5] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(17,17,17,0.035)] md:px-6 md:py-6"
                  >
                    <h2 className="text-[1.18rem] font-bold tracking-[-0.04em] text-[#111111] md:text-[1.24rem]">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.blocks.map((block, index) =>
                        renderBlock(block, `${section.title}-${index}`),
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
