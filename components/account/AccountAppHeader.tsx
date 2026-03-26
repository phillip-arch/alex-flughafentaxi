import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

export default function AccountAppHeader() {
  return (
    <header className="border-b border-white/10 bg-[#050505] text-white">
      <div className="app-container">
        <div className="flex h-[66px] items-center justify-between gap-4 lg:h-[72px]">
          <div className="flex items-center gap-3">
            <span className="relative block h-10 w-[76px] overflow-hidden">
              <Image
                src="https://web-site.website/images/aflogo.jpg"
                alt="Alex Flughafentaxi"
                fill
                sizes="76px"
                className="object-contain object-left"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#5ea2ff]">
                Kundenkonto
              </p>
              <p className="text-[1rem] font-semibold tracking-[-0.03em] text-white">App</p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-2 text-[0.95rem] font-medium text-white transition-colors hover:bg-white/10"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
