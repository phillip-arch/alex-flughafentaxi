import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Mein Konto',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Safe one-way claim for guest bookings:
  // Link only records with null user_id to the currently authenticated,
  // email-verified user by exact email match (case-insensitive).
  const userEmail = (user.email || '').trim();
  const isEmailVerified = Boolean((user as any).email_confirmed_at || (user as any).confirmed_at);

  if (userEmail && isEmailVerified) {
    const { error: claimError } = await supabaseAdmin
      .from('bookings')
      .update({ user_id: user.id })
      .is('user_id', null)
      .ilike('email', userEmail);

    if (claimError) {
      // Do not block account page if claim fails.
      console.error('Account booking claim failed:', claimError);
    }
  }

  const [{ data: profile }, { data: favorites }, { data: bookings }] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
    supabase
      .from('saved_addresses')
      .select('id, name, city, zip, street, house_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('id, booking_reference, pickup_at, pickup, destination, status, price')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <AccountClient
      userEmail={user.email || ''}
      initialName={profile?.full_name || ''}
      initialPhone={profile?.phone || ''}
      initialFavorites={(favorites || []) as any}
      initialBookings={(bookings || []) as any}
    />
  );
}
