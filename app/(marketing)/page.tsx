import { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Home - Best Airport Transfer in Vienna',
  description: 'Book your reliable airport taxi in Vienna now. Fixed prices starting from 35 €.',
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'FlughafenTaxi Wien',
          image: 'https://flughafentaxi-wien.at/logo.png',
          telephone: '+43 1 234 5678',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Musterstraße 1',
            addressLocality: 'Wien',
            postalCode: '1010',
            addressCountry: 'AT',
          },
          priceRange: '€€',
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        }}
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900/80 z-0" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Reliable Airport Transfer <br />
              <span className="text-indigo-400">in Vienna</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Fixed prices, professional drivers, and comfortable vehicles. 
              Start your journey stress-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/book" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Book Now
              </Link>
              <Link 
                href="/preise" 
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-2xl backdrop-blur-sm transition-all"
              >
                View Prices
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-xl font-bold mb-4">Fixed Prices</h3>
                <p className="text-slate-600">No hidden costs. The price you see is the price you pay.</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-xl font-bold mb-4">Reliable Service</h3>
                <p className="text-slate-600">Our drivers are punctual, professional, and know the best routes.</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                <h3 className="text-xl font-bold mb-4">24/7 Availability</h3>
                <p className="text-slate-600">We are available around the clock for your airport transfer needs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
