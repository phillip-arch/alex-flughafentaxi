import type { Metadata } from 'next';
import LegalDocument from '@/components/legal/LegalDocument';
import { getLegalContent, normalizeLegalLocale } from '@/lib/legal/content';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale = normalizeLegalLocale(params?.lang);
  return {
    title: locale === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung',
  };
}

export default async function DatenschutzPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const content = getLegalContent('datenschutz', params?.lang);

  return <LegalDocument content={content} />;
}
