import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Baby,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Luggage,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import Navbar from '@/components/Navbar';
import { getLocationRoute, locationRoutes, type LocationRoutePage } from '@/lib/location-pages';

type RoutePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return locationRoutes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getLocationRoute(slug);

  if (!route) return {};

  const path = `/routes/${route.slug}`;

  return {
    title: {
      absolute: route.metaTitle,
    },
    description: route.metaDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: route.metaTitle,
      description: route.metaDescription,
      url: path,
      type: 'website',
      images: [
        {
          url: route.heroImage.src,
          alt: route.heroImage.alt,
        },
      ],
    },
  };
}

function SectionEyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  const color = onDark ? 'text-[#1679FF] [&>span]:bg-[#1679FF]' : 'text-[#1166d4] [&>span]:bg-[#1166d4]';

  return (
    <span className={`inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.2em] ${color}`}>
      <span className="h-1 w-4 rounded-full" />
      {children}
    </span>
  );
}

function SectionHeading({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2
      className={`mt-3 text-[2.1rem] font-black leading-[1.0] tracking-[-0.05em] [text-shadow:0.012em_0_currentColor] md:text-[2.6rem] ${
        light ? '!text-white' : 'text-[#0c111e]'
      }`}
    >
      {children}
    </h2>
  );
}

function buildBookingHref(route: Pick<LocationRoutePage, 'slug' | 'from' | 'to'>, vehicle?: string) {
  const params = new URLSearchParams({
    route: route.slug,
    from: route.from,
    to: route.to,
  });

  if (vehicle) {
    params.set('vehicle', vehicle);
  }

  return `/book?${params.toString()}`;
}

function buildRoutePairBookingHref(route: { from: string; to: string }) {
  const params = new URLSearchParams({
    from: route.from,
    to: route.to,
  });

  return `/book?${params.toString()}`;
}

function BookingCta({
  href = '/book',
  label = 'Book this route',
  className = '',
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`ui-button-booking-primary ${className}`}>
      {label}
    </Link>
  );
}

function RouteChip({ label, value }: { label: string; value: string }) {
  const displayLabel = label === 'Price' ? 'FIXED PRICE' : label;
  const displayValue =
    label === 'Price' && value.startsWith('Fixed price starting from ')
      ? value.replace('Fixed price starting', 'Starting')
      : value;

  return (
    <div className="rounded-[1.1rem] border border-[#dfe9f7] bg-white px-4 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#8a9bb0]">{displayLabel}</p>
      <p className="mt-1 text-[0.95rem] font-bold tracking-[-0.03em] text-[#0c111e]">{displayValue}</p>
    </div>
  );
}

function RouteEndpointPanel({ route, bookingHref }: { route: LocationRoutePage; bookingHref: string }) {
  return (
    <div className="route-search-panel rounded-[1.65rem] border border-[#dfe9f7] bg-white p-4 shadow-[0_18px_45px_rgba(17,17,17,0.055)] md:p-5">
      <div className="grid gap-3">
        <div className="rounded-[1.05rem] border border-[#e6edf7] bg-[#f8fbff] px-4 py-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7d8da3]">From</p>
          <p className="mt-1 text-[1rem] font-bold tracking-[-0.03em] text-[#0c111e]">{route.from}</p>
        </div>
        <div className="rounded-[1.05rem] border border-[#e6edf7] bg-[#f8fbff] px-4 py-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7d8da3]">To</p>
          <p className="mt-1 text-[1rem] font-bold tracking-[-0.03em] text-[#0c111e]">{route.to}</p>
        </div>
        <BookingCta href={bookingHref} label="Book ride" className="!min-h-[3.4rem] !py-3" />
      </div>
      <p className="mt-4 text-[0.9rem] leading-[1.65] text-[#5e718a]">
        Fixed price, direct pickup, and the right vehicle size confirmed before you book.
      </p>
    </div>
  );
}

function VehicleCard({
  vehicle,
  route,
  bookingHref,
}: {
  vehicle: LocationRoutePage['vehicles'][number];
  route: LocationRoutePage;
  bookingHref: string;
}) {
  return (
    <article className="route-vehicle-card overflow-hidden rounded-[1.5rem] border border-[#e0eaf6] bg-white shadow-[0_14px_34px_rgba(17,17,17,0.045)]">
      <div className="grid gap-0 md:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="relative h-[10rem] border-b border-[#edf2f8] bg-[#f8fbff] md:h-auto md:min-h-[14rem] md:border-b-0 md:border-r">
        <Image src={vehicle.imageSrc} alt={vehicle.imageAlt} fill className="object-contain p-5 mix-blend-multiply" sizes="(min-width: 768px) 224px, 100vw" />
      </div>
      <div className="px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-[1.35rem] font-black tracking-[-0.05em] text-[#0c111e]">{vehicle.name}</h3>
            <p className="mt-2 text-[0.88rem] leading-[1.6] text-[#5e718a]">{vehicle.description}</p>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-[#eef5ff] px-3 py-1.5 text-[0.8rem] font-bold text-[#1166d4]">
            {vehicle.price}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded-[1rem] border border-[#e6edf7] bg-[#f8fbff] px-3 py-3">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#7d8da3]">
              <Clock3 size={14} className="text-[#1166d4]" />
              Time
            </div>
            <p className="mt-1 text-[0.95rem] font-semibold text-[#0c111e]">{route.duration}</p>
          </div>
          <div className="rounded-[1rem] border border-[#e6edf7] bg-[#f8fbff] px-3 py-3">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#7d8da3]">
              <Route size={14} className="text-[#1166d4]" />
              Distance
            </div>
            <p className="mt-1 text-[0.95rem] font-semibold text-[#0c111e]">{route.distance}</p>
          </div>
          <div className="rounded-[1rem] border border-[#e6edf7] bg-[#f8fbff] px-3 py-3">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#7d8da3]">
              <Users size={14} className="text-[#1166d4]" />
              Passengers
            </div>
            <p className="mt-1 text-[0.95rem] font-semibold text-[#0c111e]">{vehicle.passengers}</p>
          </div>
          <div className="rounded-[1rem] border border-[#e6edf7] bg-[#f8fbff] px-3 py-3">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#7d8da3]">
              <Luggage size={14} className="text-[#1166d4]" />
              Luggage
            </div>
            <p className="mt-1 text-[0.95rem] font-semibold text-[#0c111e]">{vehicle.luggage}</p>
          </div>
        </div>
        <BookingCta href={`${bookingHref}&vehicle=${encodeURIComponent(vehicle.name)}`} label={`Book ${vehicle.name}`} className="mt-5 !min-h-0 !py-3 !text-[0.95rem]" />
      </div>
      </div>
    </article>
  );
}

function RelatedRouteCard({ route }: { route: { from: string; to: string; href: string } }) {
  const href = route.href === '/book' ? buildRoutePairBookingHref(route) : route.href;

  return (
    <Link
      href={href}
      className="route-related-link group flex items-center justify-between gap-4 border-b border-[#e6edf7] py-4 text-[#2d3f58] transition-colors last:border-b-0 hover:text-[#1166d4]"
    >
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#8a9bb0]">From</span>
        <span className="mt-1 block text-[0.9rem] font-semibold leading-[1.25]">{route.from}</span>
        <span className="mt-2 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#8a9bb0]">To</span>
        <span className="mt-1 block text-[0.9rem] font-semibold leading-[1.25]">{route.to}</span>
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6edf7] text-[#2d3f58] transition-colors group-hover:bg-[#1679FF] group-hover:text-white">
        <ChevronRight size={14} />
      </span>
    </Link>
  );
}

function buildJsonLd(route: LocationRoutePage) {
  const url = `https://flughafentaxi-wien.at/routes/${route.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: route.metaTitle,
        description: route.metaDescription,
        isPartOf: {
          '@id': 'https://flughafentaxi-wien.at/#website',
        },
      },
      {
        '@type': 'TaxiService',
        '@id': 'https://flughafentaxi-wien.at/#business',
        name: 'Alex Flughafentaxi Wien',
        url: 'https://flughafentaxi-wien.at',
        telephone: '+436764826069',
        areaServed: [
          {
            '@type': 'City',
            name: route.city,
          },
          {
            '@type': 'Airport',
            name: 'Vienna International Airport',
            iataCode: route.airportCode,
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${route.from} to ${route.to} airport taxi`,
          itemListElement: route.vehicles.map((vehicle) => ({
            '@type': 'Offer',
            name: `${vehicle.name} transfer from ${route.from} to ${route.to}`,
            description: vehicle.description,
            priceCurrency: 'EUR',
            seller: {
              '@id': 'https://flughafentaxi-wien.at/#business',
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: route.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export default async function LocationRoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = getLocationRoute(slug);

  if (!route) notFound();

  const bookingHref = buildBookingHref(route);

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-[#111111]">
      <JsonLd data={buildJsonLd(route)} />
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-[#f3f7fc]">
          <div className="app-container pb-12 pt-[calc(72px+2.5rem)] md:pb-14 md:pt-[calc(72px+3rem)] lg:pb-16 lg:pt-[calc(72px+3.5rem)]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.52fr)] lg:items-start lg:gap-10">
              <div className="route-reveal route-reveal-1">
                <SectionEyebrow>
                  {route.city}, {route.country} - {route.airportCode}
                </SectionEyebrow>
                <h1 className="mt-5 max-w-[58rem] text-[2.85rem] font-black leading-[0.95] tracking-[-0.055em] text-[#0c111e] sm:text-[3.6rem] md:text-[4.35rem] lg:text-[4.85rem]">
                  How to get from {route.from} to {route.to}
                </h1>
                <p className="mt-6 max-w-[45rem] text-[1rem] leading-[1.75] text-[#5e718a] md:text-[1.05rem]">
                  {route.intro}
                </p>

                <div className="route-reveal route-reveal-3 mt-8 grid gap-3 sm:grid-cols-3">
                  <RouteChip label="Travel time" value={route.duration} />
                  <RouteChip label="Distance" value={route.distance} />
                  <RouteChip label="Price" value={route.vehicles[0]?.price ?? 'Fixed'} />
                </div>
              </div>

              <div className="route-reveal route-reveal-2">
                <RouteEndpointPanel route={route} bookingHref={bookingHref} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-16">
          <div className="app-container">
            <div className="mx-auto max-w-[86rem]">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <SectionEyebrow>Ride options</SectionEyebrow>
                  <SectionHeading>Choose your airport taxi.</SectionHeading>
                </div>
                <p className="max-w-[28rem] text-[0.93rem] leading-[1.7] text-[#5e718a]">
                  Select a sedan, station wagon, or minivan depending on passengers and luggage. Final prices are confirmed before booking.
                </p>
              </div>

              <div className="grid gap-5">
                {route.vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.name} vehicle={vehicle} route={route} bookingHref={bookingHref} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fc] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto grid max-w-[108rem] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(22rem,0.55fr)] lg:items-start">
              <div>
                <SectionEyebrow>Route details</SectionEyebrow>
                <SectionHeading>
                  Taxi from {route.from} to {route.shortTo}.
                </SectionHeading>
                <div className="mt-6 space-y-4 text-[0.95rem] leading-[1.75] text-[#5e718a]">
                  <p>
                    A private airport taxi is the most direct way to travel from {route.from} to {route.to}. The trip covers about {route.distance} and usually takes {route.duration} in normal traffic.
                  </p>
                  <p>
                    This route is useful if you arrive with luggage, travel with children, or need to continue by train from Vienna Central Station. Your driver can drop you near the station entrance that fits your onward journey.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 border-l border-[#cdd9f0] pl-5 md:grid-cols-3 md:border-l-0 md:pl-0">
                  {route.steps.map((step, index) => (
                    <div key={step.title} className="route-step-card relative rounded-[1.4rem] border border-[#dfe9f7] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(17,17,17,0.035)]">
                      <span className="absolute -left-[2.05rem] top-5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-[#f3f7fc] bg-[#1166d4] md:hidden" />
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.14em] text-[#1166d4]">
                        Transfer step {index + 1}
                      </span>
                      <h3 className="mt-3 text-[1.05rem] font-black tracking-[-0.04em] text-[#0c111e]">{step.title}</h3>
                      <p className="mt-2 text-[0.86rem] leading-[1.65] text-[#5e718a]">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.75rem] border border-[#e0eaf6] bg-[#f8fbff] px-6 py-6">
                <h3 className="text-[1.35rem] font-black tracking-[-0.05em] text-[#0c111e]">Included with this transfer</h3>
                <div className="mt-5 space-y-3">
                  {route.highlights.map((highlight) => (
                    <div key={highlight} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1679FF]">
                        <Check size={12} strokeWidth={3} className="text-white" />
                      </span>
                      <span className="text-[0.9rem] leading-[1.6] text-[#4a5d76]">{highlight}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-[#080e1c] py-16 text-white md:py-20">
          <div className="app-container">
            <div className="mx-auto grid max-w-[108rem] gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.8fr)] lg:items-start">
              <div>
                <SectionEyebrow onDark>Book online</SectionEyebrow>
                <SectionHeading light>Reserve your airport transfer.</SectionHeading>
                <p className="mt-4 max-w-[34rem] text-[0.95rem] leading-[1.72] text-white">
                  Open the booking page with this route already selected. Choose the exact pickup time, passengers, luggage, child seats, and payment method there.
                </p>
                <div className="mt-7 max-w-[20rem]">
                  <BookingCta href={bookingHref} label="Book this transfer" className="!min-h-0 !py-3 !text-[0.95rem]" />
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <Plane size={36} className="text-[#1679FF]" />
                    <p className="mt-3 text-[0.85rem] font-semibold text-white">Flight tracking</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <Baby size={36} className="text-[#1679FF]" />
                    <p className="mt-3 text-[0.85rem] font-semibold text-white">Child seats</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <ShieldCheck size={36} className="text-[#1679FF]" />
                    <p className="mt-3 text-[0.85rem] font-semibold text-white">Fixed price</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-[1.75rem] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
                <Image
                  src="https://images.pexels.com/photos/9641136/pexels-photo-9641136.jpeg"
                  alt="Wien Hauptbahnhof station entrance for Vienna airport transfers"
                  fill
                  className="scale-[1.015] object-cover object-center"
                  sizes="(min-width: 1024px) 520px, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[76rem]">
              <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div>
                  <SectionEyebrow>FAQ</SectionEyebrow>
                  <SectionHeading>Frequently asked questions.</SectionHeading>
                  <p className="mt-4 text-[0.93rem] leading-[1.7] text-[#5e718a]">
                    Answers about travel time, distance, prices, luggage, and airport pickup for this route.
                  </p>
                </div>

                <div className="space-y-3">
                  {route.faq.map((item) => (
                    <details
                      key={item.question}
                      className="route-faq-item group rounded-[1.35rem] border border-[#e6edf7] bg-[#f8fbff] px-5 py-4 open:border-[#cdd9f0] open:bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                        <span className="text-[0.96rem] font-semibold tracking-[-0.02em] text-[#0c111e]">
                          {item.question}
                        </span>
                        <ChevronDown size={16} className="shrink-0 text-[#9ab0c8] transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 pr-6 text-[0.88rem] leading-[1.7] text-[#5e718a]">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f7fc] py-16 md:py-20">
          <div className="app-container">
            <div className="mx-auto max-w-[108rem]">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-white px-6 py-6 md:px-8 md:py-8">
                  <SectionEyebrow>Routes from {route.from}</SectionEyebrow>
                  <h2 className="mt-3 text-[1.8rem] font-black leading-[1.05] tracking-[-0.05em] text-[#0c111e]">
                    Popular trips from the airport.
                  </h2>
                  <div className="mt-5">
                    {route.relatedFrom.map((item) => (
                      <RelatedRouteCard key={`${item.from}-${item.to}`} route={item} />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#e6edf7] bg-white px-6 py-6 md:px-8 md:py-8">
                  <SectionEyebrow>Routes to {route.from}</SectionEyebrow>
                  <h2 className="mt-3 text-[1.8rem] font-black leading-[1.05] tracking-[-0.05em] text-[#0c111e]">
                    Airport transfers in the other direction.
                  </h2>
                  <div className="mt-5">
                    {route.relatedTo.map((item) => (
                      <RelatedRouteCard key={`${item.from}-${item.to}`} route={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="app-container">
            <div className="route-final-cta mx-auto max-w-[76rem] rounded-[1.75rem] border border-[#e0eaf6] bg-[#f8fbff] px-7 py-8 md:px-10 md:py-10">
              <SectionEyebrow>Airport taxi Vienna</SectionEyebrow>
              <h2 className="mt-3 text-[1.85rem] font-black leading-[1.04] tracking-[-0.05em] text-[#0c111e] md:text-[2.1rem]">
                Private transfer from {route.from} to {route.to}
              </h2>
              <div className="mt-5 space-y-3 text-[0.93rem] leading-[1.72] text-[#5e718a]">
                <p>
                  Alex Flughafentaxi Wien provides fixed-price taxi transfers between Vienna International Airport and key transport hubs across the city. This page is designed for passengers looking for a reliable taxi from {route.from} to {route.shortTo}.
                </p>
                <p>
                  Book online in advance to secure the right vehicle size, request child seats, and avoid price uncertainty after a long flight.
                </p>
              </div>
              <div className="mt-8">
                <BookingCta href={bookingHref} label="Reserve this transfer" className="md:!w-auto md:!flex-none" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
