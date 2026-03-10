import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  // Double check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile fetch error:', profileError);
    throw new Error('Systemfehler: Admin-Berechtigungen konnten nicht geprüft werden.');
  }

  if (profileError || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#d2d2d7] max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
          <h1 className="text-[24px] font-semibold text-[#1d1d1f] mb-2 tracking-tight">Zugriff verweigert</h1>
          <p className="text-[#86868b] mb-6 text-[15px]">
            Sie sind angemeldet als <span className="font-medium text-[#1d1d1f]">{user.email}</span>,
            aber dieses Konto hat keine Administratorrechte.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 text-left mb-6">
            <p className="text-[11px] text-amber-800 font-mono leading-relaxed">
              <strong>Hinweis für Entwickler:</strong><br/>
              Führen Sie dieses SQL im Supabase SQL Editor aus, um diesen Benutzer hochzustufen:
              <br/><br/>
              UPDATE public.profiles<br/>
              SET role = 'admin'<br/>
              WHERE id = '{user.id}';
            </p>
          </div>
          <form action="/auth/logout" method="post">
            <button className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium py-3 rounded-full transition-colors text-[15px]">
              Abmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboardClient userEmail={user.email || ''} />;
}
