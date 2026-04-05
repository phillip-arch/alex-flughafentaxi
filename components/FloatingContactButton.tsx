'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Phone, HelpCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PHONE_NUMBER = '+436764826069';
const WHATSAPP_NUMBER = '436764826069';

export default function FloatingContactButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const syncVisibility = () => {
      setIsVisible(window.scrollY > 0);
    };

    syncVisibility();
    window.addEventListener('scroll', syncVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (pathname.startsWith('/dispatch')) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-[70] bg-[rgba(15,23,42,0.18)] backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
      ) : null}

      {isOpen ? (
        <div className="fixed inset-x-3 bottom-3 z-[80] rounded-[2rem] border border-[#dde6f3] bg-white p-5 shadow-[0_24px_60px_rgba(17,17,17,0.18)] md:inset-auto md:bottom-6 md:right-6 md:w-[34rem] md:p-6">
          <div className="mx-auto mb-4 h-2 w-24 rounded-full bg-[#cfd7e3] md:hidden" />

          <div className="flex items-start justify-between gap-4">
            <div className="max-w-[30rem]">
              <h2 className="text-[2rem] font-black tracking-[-0.05em] text-[#1b2436] md:text-[2.2rem]">
                How can we help?
              </h2>
              <p className="mt-3 text-[1rem] leading-[1.55] text-[#67758d] md:text-[1.02rem]">
                We’re here if you need assistance with your ride or booking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close help panel"
              className="flex h-[4.2rem] w-[4.2rem] shrink-0 items-center justify-center rounded-full border border-[#dde3ec] bg-white text-[#6b768b] shadow-[0_10px_24px_rgba(17,17,17,0.06)] transition-colors hover:text-[#1b2436]"
            >
              <X size={30} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-4 rounded-[1.9rem] border border-[#dde6f3] bg-white px-4 py-5 shadow-[0_8px_22px_rgba(17,17,17,0.05)] transition-colors hover:border-[#c9d7eb]"
            >
              <span className="flex h-[5.8rem] w-[5.8rem] shrink-0 items-center justify-center rounded-[1.6rem] border border-[#cfe0ff] bg-[#eff5ff] text-[#1f7cff] shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
                <Phone size={31} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.1rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[1.2rem]">
                  Call us
                </span>
                <span className="mt-1 block text-[0.98rem] text-[#6c7a92] md:text-[1.02rem]">
                  Available 24/7
                </span>
              </span>
              <ArrowRight size={34} className="shrink-0 text-[#8b97ab]" strokeWidth={1.9} />
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              className="flex items-center gap-4 rounded-[1.9rem] border border-[#dde6f3] bg-white px-4 py-5 shadow-[0_8px_22px_rgba(17,17,17,0.05)] transition-colors hover:border-[#c9d7eb]"
            >
              <span className="flex h-[5.8rem] w-[5.8rem] shrink-0 items-center justify-center rounded-[1.6rem] border border-[#cfe0ff] bg-[#eff5ff] text-[#1f7cff] shadow-[0_10px_24px_rgba(17,17,17,0.06)]">
                <MessageCircle size={31} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.1rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[1.2rem]">
                  Contact via WhatsApp
                </span>
                <span className="mt-1 block text-[0.98rem] text-[#6c7a92] md:text-[1.02rem]">
                  Quick response
                </span>
              </span>
              <ArrowRight size={34} className="shrink-0 text-[#8b97ab]" strokeWidth={1.9} />
            </a>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-[#e7edf5] bg-[#f5f8fd] px-6 py-5 text-[0.98rem] text-[#6a7891] md:text-[1rem]">
            We usually respond within 2–5 minutes.
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-5 right-5 z-[60]">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open help panel"
          className="flex items-center gap-4 rounded-full border border-[#cfe0ff] bg-white py-3 pl-3 pr-6 shadow-[0_18px_45px_rgba(17,17,17,0.14)] transition-all duration-200 hover:border-[#b9d0ff] hover:shadow-[0_20px_48px_rgba(17,17,17,0.18)]"
        >
          <span className="flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full border border-[#cfe0ff] bg-white text-[#1f7cff] shadow-[0_12px_28px_rgba(17,17,17,0.12)]">
            <HelpCircle size={30} strokeWidth={2.1} />
          </span>
          <span className="text-left">
            <span className="block text-[1rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[1.05rem]">
              Need help?
            </span>
            <span className="mt-0.5 block text-[0.9rem] text-[#6c7a92] md:text-[0.95rem]">
              Support & Kontakt
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
