import Image from 'next/image';
import AccountHeaderLanguageSwitcher from './AccountHeaderLanguageSwitcher';

export default function AccountAppHeader() {
  return (
    <header className="border-b border-white/10 bg-[#050505] text-white">
      <div className="app-container">
        <div className="flex h-[66px] items-center justify-between gap-4 lg:h-[72px]">
          <div className="flex items-center">
            <span className="relative block h-11 w-[120px] overflow-hidden lg:h-12 lg:w-[220px]">
              <Image
                src="/alexlogo.png"
                alt="Alex Flughafentaxi"
                fill
                sizes="(max-width: 1023px) 120px, 220px"
                className="object-contain object-left"
              />
            </span>
          </div>

          <div className="flex items-center gap-5">
            <AccountHeaderLanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
