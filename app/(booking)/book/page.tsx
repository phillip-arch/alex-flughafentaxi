import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import BookingPageClient from './BookingPageClient';

export const metadata: Metadata = {
  title: 'Fahrt buchen',
  description: 'Buchen Sie Ihren Flughafentransfer in Wien in nur wenigen Schritten.',
};

export default async function BookingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialName = '';
  let initialPhone = '';
  let initialEmail = '';
  let initialFavorites: Array<{
    id: string;
    name: string;
    city: string;
    zip: string;
    street: string;
    house_number: string;
  }> = [];

  if (user) {
    const [{ data: profile }, { data: favorites }] = await Promise.all([
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
      supabase
        .from('saved_addresses')
        .select('id, name, city, zip, street, house_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ]);

    initialName = profile?.full_name || '';
    initialPhone = profile?.phone || '';
    initialEmail = user.email || '';
    initialFavorites = (favorites || []) as typeof initialFavorites;
  }

  return (
    <BookingPageClient
      initialName={initialName}
      initialPhone={initialPhone}
      initialEmail={initialEmail}
      initialFavorites={initialFavorites}
      initialIsLoggedIn={Boolean(user)}
    />
  );
}
