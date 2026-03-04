import Image from 'next/image';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* SECTION 1: "iPhone" Style (White Background) */}
      <section className="pt-[100px] pb-16 text-center bg-white">
        <div className="max-w-[980px] mx-auto px-4 flex flex-col items-center">
          
          {/* Headline */}
          <h1 className="text-[48px] md:text-[56px] leading-[1.07143] font-semibold tracking-[-.005em] text-[#1d1d1f] mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            FlughafenTaxi
          </h1>
          
          {/* Subheadline */}
          <p className="text-[24px] md:text-[28px] leading-[1.10722] font-normal tracking-[.004em] text-[#1d1d1f] mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Say hello to the most reliable transfer in Vienna.
          </p>
          
          {/* Pill Buttons */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link 
              href="/preise" 
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-6 py-2 text-[17px] font-normal transition-colors min-w-[120px]"
            >
              Preise
            </Link>
            <Link 
              href="/book" 
              className="bg-transparent text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white rounded-full px-6 py-2 text-[17px] font-normal transition-all min-w-[120px]"
            >
              Buchen
            </Link>
          </div>

          {/* Product Image */}
          <div className="relative w-full h-[300px] md:h-[500px] animate-in fade-in zoom-in duration-1000 delay-300">
            <Image
              src="https://web-site.website/images/taxi.jpg"
              alt="Mercedes E-Class Front"
              fill
              sizes="(max-width: 768px) 100vw, 980px"
              className="object-contain"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: "iPad Air" Style (Light Blue Background) */}
      <section className="py-24 bg-[#f2fcfc] text-center overflow-hidden">
        <div className="max-w-[980px] mx-auto px-4 flex flex-col items-center">
          
          {/* Headline with Logo style */}
          <div className="flex items-center justify-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight">
              Business <span className="font-light italic text-[#0071e3]">Class</span>
            </h2>
          </div>

          {/* Subheadline */}
          <p className="text-[21px] font-normal text-[#1d1d1f] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Now supercharged by Mercedes-Benz.
          </p>

          {/* Pill Buttons */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link 
              href="/flotte" 
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-6 py-2 text-[17px] font-normal transition-colors min-w-[120px]"
            >
              Learn more
            </Link>
            <Link 
              href="/book" 
              className="bg-transparent text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white rounded-full px-6 py-2 text-[17px] font-normal transition-all min-w-[120px]"
            >
              Buy
            </Link>
          </div>

          {/* Product Image */}
          <div className="relative w-full h-[300px] md:h-[400px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <Image
              src="https://web-site.website/images/airport.jpeg"
              alt="Airport transfer"
              fill
              sizes="(max-width: 768px) 100vw, 980px"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </section>

      {/* Booking Section (Clean) */}
      <section className="py-24 bg-white" id="book">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="text-center mb-16">
            <div className="relative w-full h-[220px] md:h-[280px] mb-8 rounded-2xl overflow-hidden">
              <Image
                src="https://web-site.website/images/airplanes.jpg"
                alt="Airplanes"
                fill
                sizes="(max-width: 768px) 100vw, 980px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-[40px] font-semibold text-[#1d1d1f] mb-4">
              Book your ride.
            </h2>
            <p className="text-[21px] text-[#86868b]">
              Simple. Fast. Reliable.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <BookingForm />
          </div>
        </div>
      </section>
    </main>
  );
}
