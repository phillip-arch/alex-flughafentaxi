import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppSurface } from '@/lib/routing/surfaces';
import { getLocationRoute } from '@/lib/location-pages';
import BookingPageClient from './BookingPageClient';

export const metadata: Metadata = {
  title: 'Book a ride',
  description: 'Book your Vienna airport transfer in just a few steps.',
};

type BookingPageProps = {
  searchParams?: Promise<{
    route?: string;
    from?: string;
    to?: string;
    vehicle?: string;
  }>;
};

function buildRoutePreset(searchParams: Awaited<NonNullable<BookingPageProps['searchParams']>>) {
  const routeSlug = String(searchParams.route || '').trim();
  const route = routeSlug ? getLocationRoute(routeSlug) : null;
  const from = route?.from || String(searchParams.from || '').trim();
  const to = route?.to || String(searchParams.to || '').trim();

  if (!from || !to) return null;

  const fromAirport = /airport|flughafen|vie|terminal/i.test(from);
  const toAirport = /airport|flughafen|vie|terminal/i.test(to);
  const direction: 'to_airport' | 'from_airport' = fromAirport && !toAirport ? 'from_airport' : 'to_airport';
  const routeLabel = route ? `${route.from} to ${route.to}` : `${from} to ${to}`;
  const vehicle = String(searchParams.vehicle || '').trim();
  const notes = [`Route request: ${routeLabel}`];

  if (vehicle) {
    notes.push(`Preferred vehicle: ${vehicle}`);
  }

  return {
    direction,
    routeLabel,
    pickupLabel: from,
    dropoffLabel: to,
    address: route?.bookingAddress,
    notes: notes.join('\n'),
  };
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  if (getAppSurface() === 'app') {
    redirect('/account?tab=start');
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const routePreset = buildRoutePreset(resolvedSearchParams);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialName = '';
  let initialPhone = '';
  let initialEmail = '';
  let initialFavorites: Array<{
    id: string;
    city: string;
    zip: string;
    street: string;
    label: 'home' | 'office' | 'extra' | null;
  }> = [];

  if (user) {
    const [{ data: profile }, { data: favorites }] = await Promise.all([
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
      supabase
        .from('saved_addresses')
        .select('id, city, zip, street, label')
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
      routePreset={routePreset}
    />
  );
}
