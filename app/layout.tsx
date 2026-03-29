import { Archivo, Inter } from 'next/font/google';
import { Metadata } from 'next';
import FooterGate from '@/components/FooterGate';
import GlobalChromeClient from '@/components/GlobalChromeClient';
import PwaInstallEvents from '@/components/pwa/PwaInstallEvents';
import { getAppSurface } from '@/lib/routing/surfaces';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Alex Flughafentaxi',
    default: 'Ihr professioneller Flughafen Taxi Service',
  },
  manifest: '/manifest.webmanifest',
  description:
    'Buchen Sie Ihren Flughafentransfer in Wien. Fixpreise, zuverlaessiger Service und komfortable Fahrten zum und vom Flughafen Wien.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
  applicationName: 'Alex Flughafentaxi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Alex Flughafentaxi',
  },
  icons: {
    icon: [{ url: '/favtaxi.png', type: 'image/png' }],
    apple: [{ url: '/favtaxi.png' }],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const surface = getAppSurface();

  return (
    <html lang="de" className={`${inter.variable} ${archivo.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favtaxi.png" type="image/png" />
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
