import { Archivo, Inter } from 'next/font/google';
import { Metadata } from 'next';
import FooterGate from '@/components/FooterGate';
import GlobalChromeClient from '@/components/GlobalChromeClient';
import PwaInstallEvents from '@/components/pwa/PwaInstallEvents';
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
  description:
    'Buchen Sie Ihren Flughafentransfer in Wien. Fixpreise, zuverlaessiger Service und komfortable Fahrten zum und vom Flughafen Wien.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
  manifest: '/manifest.json',
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Alex Flughafentaxi',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${archivo.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favtaxi.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favtaxi.png" />
      </head>
      <body suppressHydrationWarning className="app-shell font-sans antialiased">
        {children}
        <PwaInstallEvents />
        <GlobalChromeClient />
        <FooterGate />
      </body>
    </html>
  );
}
