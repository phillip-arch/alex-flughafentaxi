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
    flight?: string;
    when?: string;
    name?: string;
    phone?: string;
    notes?: string;
  }>;
};

const VEHICLE_PARAM_MAP: Record<string, 'Limo' | 'Kombi' | 'Bus'> = {
  limo: 'Limo',
  limousine: 'Limo',
  sedan: 'Limo',
  kombi: 'Kombi',
  wagon: 'Kombi',
  bus: 'Bus',
  van: 'Bus',
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
  const vehicleParam = String(searchParams.vehicle || '').trim().toLowerCase();
  const vehicle = VEHICLE_PARAM_MAP[vehicleParam] ?? null;
  const flightNumber = String(searchParams.flight || '').trim().slice(0, 12);
  const when = String(searchParams.when || '').trim().slice(0, 32);
  const name = String(searchParams.name || '').trim().slice(0, 80);
  const phone = String(searchParams.phone || '').trim().slice(0, 32);
  const extraNotes = String(searchParams.notes || '').trim().slice(0, 500);
  const notes = [`Route request: ${routeLabel}`];

  if (vehicleParam && !vehicle) {
    notes.push(`Preferred vehicle: ${vehicleParam}`);
  }
  if (when) notes.push(`Requested pickup: ${when}`);
  if (name) notes.push(`Name: ${name}`);
  if (phone) notes.push(`Phone: ${phone}`);
  if (extraNotes) notes.push(extraNotes);

  return {
    direction,
    routeLabel,
    pickupLabel: from,
    dropoffLabel: to,
    address: route?.bookingAddress,
    vehicle,
    flightNumber,
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
