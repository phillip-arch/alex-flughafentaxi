'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Briefcase, ShoppingBag, Users } from 'lucide-react';

type VehicleSpecIconName = 'users' | 'briefcase' | 'shoppingBag';

type VehicleCategoryCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  specs: { icon: VehicleSpecIconName; value: string }[];
  prices: { district: string; price: string }[];
};

function VehicleSpecIcon({ icon }: { icon: VehicleSpecIconName }) {
  if (icon === 'users') return <Users size={17} className="ui-icon-accent" />;
  if (icon === 'briefcase') return <Briefcase size={17} className="ui-icon-accent" />;
  return <ShoppingBag size={17} className="ui-icon-accent" />;
}

export default function VehicleCategoryCard({
  title,
  description,
  imageSrc,
  specs,
  prices,
}: VehicleCategoryCardProps) {
  const pricePanelRef = useRef<HTMLDivElement | null>(null);
  const [mobileInView, setMobileInView] = useState(false);

  useEffect(() => {
    const panel = pricePanelRef.current;
    if (!panel || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    if (!mediaQuery.matches) {
      setMobileInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileInView(entry.isIntersecting);
      },
      {
        threshold: 0.45,
      },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const mobileActiveClass = mobileInView
    ? 'translate-y-[-0.25rem] border-[#d9e5f3] shadow-[0_24px_52px_rgba(17,17,17,0.09)]'
    : '';
  const imageActiveClass = mobileInView ? 'scale-[1.03]' : '';
  const pricePanelActiveClass = mobileInView
    ? 'border-[#dde7f4] shadow-[0_16px_30px_rgba(17,17,17,0.06)]'
    : '';

  return (
    <div
      className={`group overflow-hidden rounded-[2rem] border border-[#e7edf5] bg-white px-5 py-5 text-[#111827] shadow-[0_16px_38px_rgba(17,17,17,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#d9e5f3] hover:shadow-[0_24px_52px_rgba(17,17,17,0.09)] md:px-6 md:py-6 ${mobileActiveClass}`}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_minmax(0,0.95fr)_minmax(18rem,0.92fr)] lg:items-center lg:gap-8">
        <div className="relative h-[12rem] overflow-hidden rounded-[1.5rem] border border-[#e9edf3] bg-white md:h-[13rem] lg:h-[14rem]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className={`object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.03] ${imageActiveClass}`}
            sizes="(min-width: 1024px) 16rem, 100vw"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-5">
          <div className="ui-text-block-sm gap-1.5">
            <h3 className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[#111827] md:text-[1.9rem]">
              {title}
            </h3>
            <p className="ui-copy-sm max-w-[34rem] text-[#5e6f86]">{description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {specs.map(({ icon, value }) => (
              <div
                key={`${title}-${icon}`}
                className="flex items-center justify-center gap-1.5 rounded-[0.9rem] border border-[#e7edf5] bg-[#f8fbff] px-2 py-2 text-[#111827] sm:gap-2.5 sm:rounded-[1rem] sm:px-3 sm:py-3"
              >
                <VehicleSpecIcon icon={icon} />
                <span className="ui-copy-sm font-semibold text-[#1f2937]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={pricePanelRef}
          className={`rounded-[1.35rem] border border-[#e8edf3] bg-[#f8fbff] px-4 py-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-all duration-300 ease-out group-hover:border-[#dde7f4] group-hover:shadow-[0_16px_30px_rgba(17,17,17,0.06)] md:px-5 ${pricePanelActiveClass}`}
        >
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[#1679FF]">
            Preisliste fuer Wien
          </p>
          <div className="mt-3 space-y-2.5">
            {prices.map(({ district, price }) => (
              <div
                key={district}
                className="flex items-center justify-between gap-4 border-b border-[#e6edf7] pb-2 last:border-b-0 last:pb-0"
              >
                <span className="text-[0.95rem] text-[#4b5563]">{district}</span>
                <span className="text-[1rem] font-semibold text-[#111827]">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
