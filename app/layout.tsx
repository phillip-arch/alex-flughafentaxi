import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import FooterGate from '@/components/FooterGate';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    template: '%s | FlughafenTaxi Wien',
    default: 'FlughafenTaxi Wien | Reliable Airport Transfer',
  },
  description: 'Book your airport transfer in Vienna. Fixed prices, reliable service, and comfortable rides to and from Vienna International Airport.',
  metadataBase: new URL('https://flughafentaxi-wien.at'),
  openGraph: {
    title: 'FlughafenTaxi Wien',
    description: 'Reliable airport transfer in Vienna.',
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
    <html lang="de" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        {children}
        <FooterGate />
      </body>
    </html>
  );
}
