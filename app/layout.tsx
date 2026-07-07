import { Archivo, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { Metadata } from 'next';
import { connection } from 'next/server';
import FooterGate from '@/components/FooterGate';
import GlobalChromeClient from '@/components/GlobalChromeClient';
import PwaInstallEvents from '@/components/pwa/PwaInstallEvents';
import { getAppSurface } from '@/lib/routing/surfaces';
import './globals.css';

const APP_PHONE_ICON_URL =
  'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/appphoneicon.jpg';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-sans',
});

const archivo = Archivo({
  subsets: ['latin'],
  display: 'optional',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'optional',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Alex Flughafentaxi Wien',
    default: 'Flughafentaxi Wien — Fixpreis Transfer zum Flughafen Wien (VIE)',
  },
  manifest: '/manifest.webmanifest',
  description:
    'Flughafentaxi Wien zum garantierten Fixpreis. Zuverlässiger Transfer zum und vom Flughafen Wien (VIE), 24/7. Flugüberwachung inklusive, keine versteckten Gebühren.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
  applicationName: 'Alex Flughafentaxi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Alex Flughafentaxi',
  },
  icons: {
    icon: [{ url: APP_PHONE_ICON_URL, type: 'image/jpeg' }],
    apple: [{ url: APP_PHONE_ICON_URL }],
  },
  openGraph: {
    title: 'Alex Flughafentaxi',
    description: 'Zuverlaessiger Flughafentransfer in Wien.',
    url: 'https://flughafentaxi-wien.at',
    siteName: 'Alex Flughafentaxi',
    locale: 'de_AT',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const surface = getAppSurface();

  return (
    <html lang="de" className={`${instrumentSans.variable} ${archivo.variable} ${plexMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0A111F" />
        <link rel="icon" href={APP_PHONE_ICON_URL} type="image/jpeg" />
      </head>
      <body suppressHydrationWarning className="app-shell font-sans antialiased">
        {children}
        <PwaInstallEvents />
        <GlobalChromeClient surface={surface} />
        <FooterGate surface={surface} />
      </body>
    </html>
  );
}
