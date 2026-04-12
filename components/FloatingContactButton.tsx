'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, HelpCircle, MessageCircle, Phone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PHONE_NUMBER = '+436764826069';
const WHATSAPP_NUMBER = '436764826069';

export default function FloatingContactButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let animationFrame = 0;

    const syncVisibility = () => {
      const hero = document.getElementById('hero');
      const footer = document.getElementById('site-footer');
      const isPastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 0;
      const isAtFooter = footer ? footer.getBoundingClientRect().top <= window.innerHeight : false;

      setIsVisible(isPastHero && !isAtFooter);
    };

    const requestSyncVisibility = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        syncVisibility();
      });
    };

    syncVisibility();
    window.addEventListener('scroll', requestSyncVisibility, { passive: true });
    window.addEventListener('resize', requestSyncVisibility);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener('scroll', requestSyncVisibility);
      window.removeEventListener('resize', requestSyncVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isVisible) {
      setIsOpen(false);
    }
  }, [isVisible]);

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
        <div
          className="fixed inset-0 z-[70] bg-[rgba(15,23,42,0.18)] backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {isOpen ? (
        <div className="fixed inset-x-4 bottom-4 z-[80] rounded-[1.35rem] border border-[#dde6f3] bg-white p-3.5 shadow-[0_20px_48px_rgba(17,17,17,0.16)] md:inset-auto md:bottom-6 md:right-6 md:w-[20rem] md:p-4">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[#cfd7e3] md:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex max-w-[15rem] flex-col gap-[10px]">
              <h2 className="text-[1.35rem] font-black tracking-[-0.05em] text-[#1b2436] md:text-[1.45rem]">
                How can we help?
              </h2>
              <p className="text-[0.8rem] leading-[1.5] text-[#67758d] md:text-[0.82rem]">
                We are here if you need help with your ride or booking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close help panel"
              className="flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full border border-[#dde3ec] bg-white text-[#6b768b] shadow-[0_8px_18px_rgba(17,17,17,0.06)] transition-colors hover:text-[#1b2436]"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className="flex items-center gap-3 rounded-[1.3rem] border border-[#dde6f3] bg-white px-3 py-3 shadow-[0_6px_16px_rgba(17,17,17,0.05)] transition-all duration-200 hover:border-[#7fb3ff] hover:bg-[#f0f6ff]"
            >
              <span className="flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-[1rem] border border-[#cfe0ff] bg-[#eff5ff] text-[#1f7cff] shadow-[0_8px_18px_rgba(17,17,17,0.06)]">
                <Phone size={19} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.88rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[0.92rem]">
                  Call us
                </span>
                <span className="mt-0.5 block text-[0.76rem] text-[#6c7a92] md:text-[0.8rem]">
                  Available 24/7
                </span>
              </span>
              <ArrowRight size={22} className="shrink-0 text-[#8b97ab]" strokeWidth={1.9} />
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              className="flex items-center gap-3 rounded-[1.3rem] border border-[#dde6f3] bg-white px-3 py-3 shadow-[0_6px_16px_rgba(17,17,17,0.05)] transition-all duration-200 hover:border-[#7fb3ff] hover:bg-[#f0f6ff]"
            >
              <span className="flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-[1rem] border border-[#cfe0ff] bg-[#eff5ff] text-[#1f7cff] shadow-[0_8px_18px_rgba(17,17,17,0.06)]">
                <MessageCircle size={19} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.88rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[0.92rem]">
                  Contact via WhatsApp
                </span>
                <span className="mt-0.5 block text-[0.76rem] text-[#6c7a92] md:text-[0.8rem]">
                  Quick response
                </span>
              </span>
              <ArrowRight size={22} className="shrink-0 text-[#8b97ab]" strokeWidth={1.9} />
            </a>
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-[#e7edf5] bg-[#f5f8fd] px-4 py-3 text-[0.76rem] text-[#6a7891] md:text-[0.8rem]">
            We usually respond within 2 to 5 minutes.
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-5 right-5 z-[60]">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open help panel"
          className="flex items-center gap-[0.66rem] rounded-full border border-[#cfe0ff] bg-white py-[0.5rem] pl-[0.5rem] pr-[1rem] shadow-[0_16px_38px_rgba(17,17,17,0.14)] transition-all duration-200 hover:border-[#b9d0ff] hover:shadow-[0_18px_42px_rgba(17,17,17,0.18)] md:gap-[0.55rem] md:py-[0.5rem] md:pl-[0.5rem] md:pr-[1rem]"
        >
          <span className="flex h-[2.9rem] w-[2.9rem] items-center justify-center rounded-full border border-[#cfe0ff] bg-white text-[#1f7cff] shadow-[0_8px_20px_rgba(17,17,17,0.12)] md:h-[2.4rem] md:w-[2.4rem]">
            <HelpCircle size={21} strokeWidth={2.1} className="md:h-[17px] md:w-[17px]" />
          </span>
          <span className="text-left">
            <span className="block text-[0.95rem] font-bold tracking-[-0.03em] text-[#1b2436] md:text-[0.82rem]">
              Need help?
            </span>
            <span className="mt-0.5 block text-[0.8rem] text-[#6c7a92] md:text-[0.72rem]">
              Support & Contact
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
