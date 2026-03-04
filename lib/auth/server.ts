import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function verifyAdmin() {
  const supabase = await createClient();

  // 1. Check if user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // 2. Check if user has 'admin' role in profiles table
  // We use supabaseAdmin (Service Role) here to ensure we can read the role
  // even if RLS policies were to change (though RLS allows reading own profile).
  // Using Service Role is safer for authorization checks.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { authorized: false, error: 'Forbidden' };
  }

  return { authorized: true, user };
}
