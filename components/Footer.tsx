import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">FlughafenTaxi Wien</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Reliable airport transfer service in Vienna. Fixed prices, professional drivers, and comfortable vehicles.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/book" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Book a Ride
                </Link>
              </li>
              <li>
                <Link href="/preise" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Prices
                </Link>
              </li>
              <li>
                <Link href="/flotte" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Fleet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} FlughafenTaxi Wien. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
