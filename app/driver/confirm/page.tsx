import { redirect } from 'next/navigation';

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
