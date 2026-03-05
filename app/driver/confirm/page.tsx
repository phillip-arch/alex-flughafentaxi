import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function DriverConfirmRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; driver?: string }>;
}) {
  const { token, driver } = await searchParams;
  const target = token
    ? `/book/confirm?token=${encodeURIComponent(token)}${driver ? `&driver=${encodeURIComponent(driver)}` : ''}`
    : '/book/confirm';
  redirect(target);
}
