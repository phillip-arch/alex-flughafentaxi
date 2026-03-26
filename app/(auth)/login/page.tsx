import { getPublicWebUrl } from '@/lib/routing/surfaces';
import LoginPageClient from './LoginPageClient';

type LoginPageProps = {
  searchParams?: Promise<{
    account_deleted?: string;
    mode?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialIsLogin = params?.mode !== 'signup';
  const accountDeleted = params?.account_deleted === '1';
  const websiteHref = getPublicWebUrl();

  return (
    <main className="min-h-screen bg-white text-[var(--color-text)]">
      <LoginPageClient
        initialIsLogin={initialIsLogin}
        accountDeleted={accountDeleted}
        websiteHref={websiteHref}
      />
    </main>
  );
}
