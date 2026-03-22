import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminEntryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Admin entry profile fetch error:', error);
  }

  redirect(profile?.role === 'admin' ? '/admin/dashboard' : '/admin/dashboard');
}
