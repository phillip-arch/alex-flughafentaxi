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

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    initialName = profile?.full_name || '';
  }

  return <BookingPageClient initialName={initialName} />;
}
