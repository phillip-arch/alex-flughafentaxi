import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/dispatch/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Admin entry profile fetch error:', error);
  }

  if (profile?.role !== 'admin') {
    notFound();
  }

  redirect('/dispatch/dashboard');
}
