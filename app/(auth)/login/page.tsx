import Navbar from '@/components/Navbar';
import LoginPageClient from './LoginPageClient';

type LoginPageProps = {
  searchParams?: Promise<{
    mode?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialIsLogin = params?.mode !== 'signup';

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <LoginPageClient initialIsLogin={initialIsLogin} />
    </main>
  );
}
