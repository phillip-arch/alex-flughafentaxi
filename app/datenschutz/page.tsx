import type { Metadata } from 'next';
import LegalDocument from '@/components/legal/LegalDocument';
import { getLegalContent } from '@/lib/legal/content';
import { buildAbsoluteMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return buildAbsoluteMetadata('datenschutz', params?.lang);
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
