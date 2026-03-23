import { Archivo, Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import FooterGate from '@/components/FooterGate';
import GlobalChromeClient from '@/components/GlobalChromeClient';
import PwaInstallEvents from '@/components/pwa/PwaInstallEvents';

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
    template: '%s | FlughafenTaxi Wien',
    default: 'FlughafenTaxi Wien | Zuverlässiger Flughafentransfer',
  },
  description: 'Buchen Sie Ihren Flughafentransfer in Wien. Fixpreise, zuverlässiger Service und komfortable Fahrten zum und vom Flughafen Wien.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'FlughafenTaxi Wien',
    description: 'Zuverlässiger Flughafentransfer in Wien.',
    url: 'https://flughafentaxi-wien.at',
    siteName: 'FlughafenTaxi Wien',
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
    title: 'FlughafenTaxi Wien',
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
        <link rel="icon" href="/pwa-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/pwa-icon.svg" />
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
