import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Navbar from '@/components/Navbar';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Mein Konto',
  robots: {
    index: false,
    follow: false,
  },
};

type AccountPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  const params = searchParams ? await searchParams : undefined;
  const requestedTab =
    params?.tab === 'buchungsverlauf' ||
    params?.tab === 'profil' ||
    params?.tab === 'favoriten'
      ? params.tab
      : 'buchungsverlauf';

  const profilePromise = supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .maybeSingle();

  const favoritesPromise =
    requestedTab === 'favoriten'
      ? supabase
          .from('saved_addresses')
          .select('id, name, city, zip, street, house_number')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] });

  const bookingsPromise =
    requestedTab === 'buchungsverlauf'
      ? supabase
          .from('bookings')
          .select(
            'id, booking_reference, pickup_at, pickup, destination, status, price, driver_id, confirm_token, full_name, phone, email, passengers, luggage, vehicle_type, notes',
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] as any[] });

  const [{ data: profile }, { data: favorites }, { data: bookings }] = await Promise.all([
    profilePromise,
    favoritesPromise,
    bookingsPromise,
  ]);

  const bookingRows = (bookings || []) as any[];
  const bookingIds = bookingRows.map((booking) => booking.id).filter(Boolean);
  let bookingsWithReviews = bookingRows;

  if (bookingIds.length > 0) {
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('booking_id, rating, comment, user_id')
      .eq('user_id', user.id)
      .in('booking_id', bookingIds);

    const reviewMap = new Map(
      ((reviews || []) as Array<{ booking_id: string; rating: number; comment: string | null }>).map(
        (review) => [review.booking_id, review],
      ),
    );

    bookingsWithReviews = bookingRows.map((booking) => {
      const review = reviewMap.get(booking.id);
      return {
        ...booking,
        review_rating: review?.rating ?? null,
        review_comment: review?.comment ?? null,
      };
    });
  }

  return (
    <main className="min-h-screen bg-white text-[var(--color-text)]">
      <Navbar />
      <AccountClient
        userEmail={user.email || ''}
        initialName={profile?.full_name || ''}
        initialPhone={profile?.phone || ''}
        initialFavorites={(favorites || []) as any}
        initialBookings={bookingsWithReviews as any}
        initialRequestedTab={requestedTab}
        initialFavoritesLoaded={requestedTab === 'favoriten'}
        initialBookingsLoaded={requestedTab === 'buchungsverlauf'}
      />
    </main>
  );
}
