import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/dispatch/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile fetch error:', profileError);
    throw new Error('Systemfehler: Admin-Berechtigungen konnten nicht geprueft werden.');
  }

  if (profileError || profile?.role !== 'admin') notFound();

  return <AdminDashboardClient userEmail={user.email || ''} />;
}
