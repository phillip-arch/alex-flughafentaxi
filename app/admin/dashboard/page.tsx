import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile fetch error:', profileError);
    throw new Error('Systemfehler: Admin-Berechtigungen konnten nicht geprueft werden.');
  }

  if (profileError || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="ui-card-surface-light max-w-md w-full text-center animate-in fade-in zoom-in duration-500 px-6 py-7 md:px-8">
          <h1 className="ui-heading-lg text-[#111827]">Zugriff verweigert</h1>
          <p className="mt-3 text-[0.98rem] leading-7 text-[#6a7d96]">
            Dieses Konto hat keine Administratorrechte.
          </p>
          <p className="mt-2 text-[0.92rem] leading-6 text-[#8a96a3]">
            Wenn Sie glauben, dass das ein Fehler ist, kontaktieren Sie bitte den Systemadministrator.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/account" className="ui-button-booking-primary w-full">
              Zurueck zu Mein Konto
            </Link>
            <form action="/auth/logout" method="post">
              <button className="w-full rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-6 py-4 text-[1.0625rem] font-medium text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboardClient userEmail={user.email || ''} />;
}
