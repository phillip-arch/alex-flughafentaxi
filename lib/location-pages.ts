export type RouteVehicleOption = {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  passengers: string;
  luggage: string;
  price: string;
};

export type RelatedRoute = {
  from: string;
  to: string;
  href: string;
};

export type LocationRoutePage = {
  slug: string;
  from: string;
  to: string;
  shortTo: string;
  city: string;
  country: string;
  airportCode: string;
  distance: string;
  duration: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: {
    src: string;
    alt: string;
  };
  bookingAddress?: {
    street: string;
    zip: string;
    city: string;
    formattedAddress: string;
    houseNumber: string;
    country: string;
    lat: number;
    lng: number;
    placeId: string;
  };
  vehicles: RouteVehicleOption[];
  highlights: string[];
  steps: {
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  relatedFrom: RelatedRoute[];
  relatedTo: RelatedRoute[];
};

export const locationRoutes: LocationRoutePage[] = [
  {
    slug: 'terminal-1-vienna-airport-to-vienna-hbf',
    from: 'Terminal 1 Vienna Airport',
    to: 'Vienna HBF',
    shortTo: 'Vienna Central Station',
    city: 'Vienna',
    country: 'Austria',
    airportCode: 'VIE',
    distance: '19.4 km',
    duration: '24 min',
    intro:
      'Book a fixed-price airport taxi from Terminal 1 Vienna Airport to Vienna HBF. Your driver tracks your flight, helps with luggage, and takes you directly to Vienna Central Station without train changes or waiting at ticket machines.',
    metaTitle: 'Terminal 1 Vienna Airport to Vienna HBF Taxi | Fixed Price',
    metaDescription:
      'Taxi from Terminal 1 Vienna Airport to Vienna HBF. Fixed prices, 24/7 pickup, flight tracking, child seats, sedans, station wagons and minivans.',
    heroImage: {
      src: '/limo.jpg',
      alt: 'Vienna airport taxi sedan for a transfer from Terminal 1 Vienna Airport to Vienna HBF',
    },
    bookingAddress: {
      street: 'Am Hauptbahnhof 1',
      zip: '1100',
      city: 'Wien',
      formattedAddress: 'Am Hauptbahnhof 1, 1100 Wien, Austria',
      houseNumber: '1',
      country: 'Austria',
      lat: 48.185057,
      lng: 16.376333,
      placeId: 'route-preset-vienna-hbf',
    },
    vehicles: [
      {
        name: 'Sedan',
        description: 'Best for solo travelers or couples with standard luggage.',
        imageSrc: '/limo.jpg',
        imageAlt: 'Sedan airport taxi from Vienna Airport Terminal 1 to Vienna HBF',
        passengers: '1-2',
        luggage: '2 suitcases',
        price: 'Fixed price starting from EUR 42',
      },
      {
        name: 'Station Wagon',
        description: 'Extra luggage space for families, strollers, or business equipment.',
        imageSrc: '/kombi.jpg',
        imageAlt: 'Station wagon airport taxi from Vienna Airport Terminal 1 to Vienna HBF',
        passengers: '1-4',
        luggage: '4 suitcases',
        price: 'Fixed price starting from EUR 48',
      },
      {
        name: 'Minivan',
        description: 'Comfortable airport transfer for groups travelling together.',
        imageSrc: '/bus.jpg',
        imageAlt: 'Minivan airport taxi from Vienna Airport Terminal 1 to Vienna HBF',
        passengers: '1-8',
        luggage: '8 suitcases',
        price: 'Fixed price starting from EUR 72',
      },
    ],
    highlights: [
      'Fixed price before you book',
      'Flight tracking included for airport pickups',
      'Free baby seats, child seats, and boosters on request',
      'Direct support by phone and WhatsApp',
      'No train transfer, no ticket machines, no surge pricing',
      '24/7 transfers between Vienna Airport and Vienna HBF',
    ],
    steps: [
      {
        title: 'Meet your driver at Terminal 1',
        description:
          'After landing at Vienna Airport, collect your luggage and follow the agreed pickup instructions. Add your flight number when booking so we can monitor delays.',
      },
      {
        title: 'Travel directly to Vienna HBF',
        description:
          'The route usually takes about 24 minutes, depending on traffic. You ride directly to Vienna Central Station with space for your bags.',
      },
      {
        title: 'Arrive at the correct entrance',
        description:
          'Tell us your train, hotel, or meeting point near Vienna HBF in the notes and the driver will choose the most practical drop-off point.',
      },
    ],
    faq: [
      {
        question: 'What is the cheapest taxi option from Terminal 1 Vienna Airport to Vienna HBF?',
        answer:
          'The sedan is usually the cheapest option for this route and has a fixed price of EUR 42 for up to 2 passengers with standard luggage.',
      },
      {
        question: 'How far is Vienna HBF from Terminal 1 Vienna Airport?',
        answer:
          'Vienna HBF is approximately 19.4 km from Terminal 1 Vienna Airport. Travel time is usually around 24 minutes, depending on traffic.',
      },
      {
        question: 'Can I book a minivan from Vienna Airport to Vienna HBF?',
        answer:
          'Yes. Minivans are available for groups of up to 8 passengers and are suitable when you have several large suitcases.',
      },
      {
        question: 'Are child seats available for the airport transfer?',
        answer:
          'Yes. Baby seats, child seats, and booster seats are available free of charge when requested during booking.',
      },
      {
        question: 'Do you monitor flight delays at Vienna Airport?',
        answer:
          'Yes. Add your flight number to the booking and we monitor the arrival time so the pickup can be adjusted if your flight is delayed.',
      },
    ],
    relatedFrom: [
      {
        from: 'Terminal 1 Vienna Airport',
        to: 'Wien Westbahnhof',
        href: '/book',
      },
      {
        from: 'Terminal 1 Vienna Airport',
        to: 'Stephansplatz',
        href: '/book',
      },
      {
        from: 'Terminal 1 Vienna Airport',
        to: 'Schoenbrunn Palace',
        href: '/book',
      },
      {
        from: 'Terminal 1 Vienna Airport',
        to: 'Wien Mitte',
        href: '/book',
      },
    ],
    relatedTo: [
      {
        from: 'Vienna HBF',
        to: 'Terminal 3 Vienna Airport',
        href: '/book',
      },
      {
        from: 'Wien Westbahnhof',
        to: 'Terminal 1 Vienna Airport',
        href: '/book',
      },
      {
        from: 'Stephansplatz',
        to: 'Terminal 1 Vienna Airport',
        href: '/book',
      },
      {
        from: 'Wien Mitte',
        to: 'Terminal 1 Vienna Airport',
        href: '/book',
      },
    ],
  },
];

export function getLocationRoute(slug: string) {
  return locationRoutes.find((route) => route.slug === slug);
}
