import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { claimGuestBookingsForUser } from '@/lib/bookings/claimGuestBookings';
import Navbar from '@/components/Navbar';
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

  await claimGuestBookingsForUser({
    userId: user.id,
    email: user.email,
    emailConfirmedAt: (user as any).email_confirmed_at,
    confirmedAt: (user as any).confirmed_at,
  });

  const [{ data: profile }, { data: favorites }, { data: bookings }] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
    supabase
      .from('saved_addresses')
      .select('id, name, city, zip, street, house_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select(
        'id, booking_reference, pickup_at, pickup, destination, status, price, driver_id, confirm_token, full_name, phone, email, passengers, luggage, vehicle_type, notes',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <AccountClient
        userEmail={user.email || ''}
        initialName={profile?.full_name || ''}
        initialPhone={profile?.phone || ''}
        initialFavorites={(favorites || []) as any}
        initialBookings={(bookings || []) as any}
      />
    </main>
  );
}
