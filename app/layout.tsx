import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import FooterGate from '@/components/FooterGate';
import FloatingContactButton from '@/components/FloatingContactButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    template: '%s | FlughafenTaxi Wien',
    default: 'FlughafenTaxi Wien | Zuverlässiger Flughafentransfer',
  },
  description: 'Buchen Sie Ihren Flughafentransfer in Wien. Fixpreise, zuverlässiger Service und komfortable Fahrten zum und vom Flughafen Wien.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${archivo.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com"
          crossOrigin=""
        />
        <link
          rel="dns-prefetch"
          href="https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com"
        />
      </head>
      <body suppressHydrationWarning className="app-shell font-sans antialiased">
        {children}
        <FloatingContactButton />
        <FooterGate />
      </body>
    </html>
  );
}
