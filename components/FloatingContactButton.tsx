'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Phone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PHONE_NUMBER = '+436764826069';
const WHATSAPP_NUMBER = '436764826069';
const VIBER_NUMBER = encodeURIComponent(PHONE_NUMBER);

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.28-1.64a11.85 11.85 0 0 0 5.77 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.44-8.45ZM12.06 21.8h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.73.98 1-3.63-.23-.37a9.82 9.82 0 0 1-1.51-5.28c0-5.42 4.41-9.83 9.84-9.83 2.62 0 5.08 1.02 6.93 2.87a9.74 9.74 0 0 1 2.88 6.95c0 5.42-4.42 9.83-9.84 9.83Zm5.39-7.37c-.29-.15-1.7-.84-1.97-.93-.26-.1-.45-.15-.64.14-.19.28-.73.93-.9 1.12-.16.19-.33.21-.62.07-.28-.15-1.2-.44-2.28-1.42-.85-.75-1.42-1.68-1.59-1.96-.17-.28-.02-.43.13-.58.13-.13.28-.33.42-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.13-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.28-1 1-.99 2.44 0 1.44 1.04 2.83 1.19 3.02.14.19 2.05 3.13 5.06 4.39.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.58-.09 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

function ViberIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M11.97 0C6.34 0 1.77 4.26 1.77 9.49c0 2.93 1.45 5.56 3.73 7.31L4.49 24l7.34-3.97h.14c5.63 0 10.2-4.26 10.2-9.5C22.17 4.27 17.6 0 11.97 0Zm5.8 14.06c-.24.68-1.41 1.3-1.95 1.36-.5.06-1.15.08-1.86-.15-.43-.13-.97-.3-1.67-.6-2.94-1.28-4.85-4.25-4.99-4.44-.14-.19-1.17-1.56-1.17-2.98s.73-2.11.98-2.4c.25-.29.55-.36.74-.36h.54c.17 0 .39 0 .6.5.23.56.79 1.93.85 2.07.07.14.12.31.02.49-.1.19-.15.31-.29.48-.14.17-.29.38-.41.5-.14.15-.28.31-.12.6.16.29.71 1.22 1.53 1.98 1.04.92 1.92 1.21 2.2 1.35.28.15.45.12.61-.08.17-.19.72-.85.91-1.14.19-.29.38-.24.64-.15.26.1 1.64.79 1.92.94.28.14.47.21.54.34.07.13.07.76-.17 1.44Zm-4.46-7.98c.15 0 .29.06.4.17.11.11.17.25.17.4s-.06.29-.17.4a.56.56 0 0 1-.8 0 .565.565 0 0 1 .4-.97Zm2.53 1.44a.563.563 0 0 1-.4-.96.56.56 0 0 1 .8 0c.11.1.17.24.17.4 0 .15-.06.3-.17.4-.1.11-.25.16-.4.16Zm-5.05-2.88c.15 0 .3.06.4.17.11.1.17.25.17.4 0 .15-.06.29-.17.4a.56.56 0 0 1-.8 0 .565.565 0 0 1 .4-.97Z" />
    </svg>
  );
}

const contactOptions = [
  {
    href: `tel:${PHONE_NUMBER}`,
    className: 'bg-[#1679FF] text-white hover:bg-[#0f6ae8]',
    icon: Phone,
    hoverLabel: PHONE_NUMBER,
  },
  {
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    className: 'bg-[#25D366] text-white hover:bg-[#1fb959]',
    icon: WhatsAppIcon,
    hoverLabel: undefined,
  },
  {
    href: `viber://chat?number=${VIBER_NUMBER}`,
    className: 'bg-[#7360f2] text-white hover:bg-[#6552dc]',
    icon: ViberIcon,
    hoverLabel: undefined,
  },
] as const;

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:gap-2">
      {isOpen ? (
        <div className="flex flex-col items-end gap-3 md:gap-2">
          {contactOptions.map((option) => {
            const Icon = option.icon;

            return (
              <div key={option.href} className="group relative flex items-center justify-end">
                {option.hoverLabel ? (
                  <div className="pointer-events-none absolute right-[calc(100%+0.5rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#111111] px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-[0_12px_30px_rgba(17,17,17,0.18)] transition-opacity duration-150 group-hover:opacity-100 md:block">
                    {option.hoverLabel}
                  </div>
                ) : null}

                <Link
                  href={option.href}
                  className={`inline-flex h-[56px] w-[56px] items-center justify-center rounded-full shadow-[0_16px_38px_rgba(17,17,17,0.22)] transition-colors md:h-[48px] md:w-[48px] ${option.className}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-[24px] w-[24px] text-white md:h-[18px] md:w-[18px]" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#1679FF] text-white shadow-[0_16px_38px_rgba(17,17,17,0.22)] transition-colors hover:bg-[#0f6ae8] md:h-[48px] md:w-[48px]"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
      >
        {isOpen ? <X size={24} className="md:h-[18px] md:w-[18px]" /> : <Phone size={24} className="md:h-[18px] md:w-[18px]" />}
      </button>
    </div>
  );
}
