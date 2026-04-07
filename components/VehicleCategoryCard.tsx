'use client';

import { useEffect, useId, useRef, useState } from 'react';
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

const mobileVehicleCards = new Map<string, HTMLElement>();
const mobileVehicleSubscribers = new Map<string, (isActive: boolean) => void>();
const mobileVehicleEntries = new Map<string, IntersectionObserverEntry>();
let mobileVehicleListenerCount = 0;
let mobileVehicleObserver: IntersectionObserver | null = null;
let mobileVehicleMediaQuery: MediaQueryList | null = null;
let mobileVehicleMediaQueryCleanup: (() => void) | null = null;

function syncActiveMobileVehicleCard() {
  if (typeof window === 'undefined') return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (!isMobile) {
    mobileVehicleSubscribers.forEach((setActive) => setActive(false));
    return;
  }

  let activeId: string | null = null;
  let bestRatio = 0;

  mobileVehicleEntries.forEach((entry, id) => {
    if (!entry.isIntersecting) return;
    if (entry.intersectionRatio > bestRatio) {
      bestRatio = entry.intersectionRatio;
      activeId = id;
    } else if (entry.intersectionRatio === bestRatio && activeId === null) {
      activeId = id;
    }
  });

  mobileVehicleSubscribers.forEach((setActive, id) => {
    setActive(id === activeId);
  });
}

function ensureMobileVehicleObserver() {
  if (typeof window === 'undefined') return null;
  if (mobileVehicleObserver) return mobileVehicleObserver;

  mobileVehicleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.mobileVehicleId;
        if (!id) return;
        mobileVehicleEntries.set(id, entry);
      });
      syncActiveMobileVehicleCard();
    },
    {
      threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      rootMargin: '-18% 0px -18% 0px',
    },
  );

  return mobileVehicleObserver;
}

function attachMobileVehicleListeners() {
  if (typeof window === 'undefined') return;
  if (mobileVehicleListenerCount === 0) {
    mobileVehicleMediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaChange = () => {
      syncActiveMobileVehicleCard();
    };

    if (typeof mobileVehicleMediaQuery.addEventListener === 'function') {
      mobileVehicleMediaQuery.addEventListener('change', handleMediaChange);
      mobileVehicleMediaQueryCleanup = () =>
        mobileVehicleMediaQuery?.removeEventListener('change', handleMediaChange);
    } else {
      mobileVehicleMediaQuery.addListener(handleMediaChange);
      mobileVehicleMediaQueryCleanup = () => mobileVehicleMediaQuery?.removeListener(handleMediaChange);
    }
  }

  mobileVehicleListenerCount += 1;
}

function detachMobileVehicleListeners() {
  if (typeof window === 'undefined') return;

  mobileVehicleListenerCount = Math.max(0, mobileVehicleListenerCount - 1);
  if (mobileVehicleListenerCount === 0) {
    mobileVehicleMediaQueryCleanup?.();
    mobileVehicleMediaQueryCleanup = null;
    mobileVehicleMediaQuery = null;
    mobileVehicleObserver?.disconnect();
    mobileVehicleObserver = null;
    mobileVehicleEntries.clear();
  }
}

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
  const cardId = useId();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mobileInView, setMobileInView] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === 'undefined') return;

    card.dataset.mobileVehicleId = cardId;
    mobileVehicleCards.set(cardId, card);
    mobileVehicleSubscribers.set(cardId, setMobileInView);
    attachMobileVehicleListeners();
    ensureMobileVehicleObserver()?.observe(card);
    syncActiveMobileVehicleCard();

    return () => {
      mobileVehicleObserver?.unobserve(card);
      mobileVehicleEntries.delete(cardId);
      delete card.dataset.mobileVehicleId;
      mobileVehicleCards.delete(cardId);
      mobileVehicleSubscribers.delete(cardId);
      detachMobileVehicleListeners();
    };
  }, [cardId]);

  return (
    <div
      ref={cardRef}
      className="group overflow-hidden rounded-[2rem] border border-[#e7edf5] bg-white px-5 py-5 text-[#111827] shadow-[0_16px_38px_rgba(17,17,17,0.06)] transition-all duration-300 ease-out md:px-6 md:py-6 md:hover:border-[#7fb3ff] md:hover:bg-[#f0f6ff]"
      style={
        mobileInView
          ? {
              backgroundColor: '#f0f6ff',
              borderColor: '#7fb3ff',
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_minmax(0,0.95fr)_minmax(18rem,0.92fr)] lg:items-center lg:gap-8">
        <div className="relative h-[12rem] overflow-hidden rounded-[1.5rem] border border-[#e9edf3] bg-white md:h-[13rem] lg:h-[14rem]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain p-4 transition-transform duration-500 ease-out md:group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 16rem, 100vw"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-5">
          <div className="ui-text-block-sm gap-1.5">
            <h3 className="text-[1.7rem] font-bold tracking-[-0.05em] text-[#111827] md:text-[1.9rem]">{title}</h3>
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

        <div className="rounded-[1.35rem] border border-[#e8edf3] bg-[#f8fbff] px-4 py-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] md:px-5">
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
