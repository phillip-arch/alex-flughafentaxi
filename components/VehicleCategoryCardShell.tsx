'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

const mobileVehicleEntries = new Map<string, IntersectionObserverEntry>();
const mobileVehicleSubscribers = new Map<string, (isActive: boolean) => void>();
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

type VehicleCategoryCardShellProps = {
  children: ReactNode;
};

export default function VehicleCategoryCardShell({ children }: VehicleCategoryCardShellProps) {
  const cardId = useId();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mobileInView, setMobileInView] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === 'undefined') return;

    card.dataset.mobileVehicleId = cardId;
    mobileVehicleSubscribers.set(cardId, setMobileInView);
    attachMobileVehicleListeners();
    ensureMobileVehicleObserver()?.observe(card);
    syncActiveMobileVehicleCard();

    return () => {
      mobileVehicleObserver?.unobserve(card);
      mobileVehicleEntries.delete(cardId);
      delete card.dataset.mobileVehicleId;
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
      {children}
    </div>
  );
}
