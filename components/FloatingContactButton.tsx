'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Phone, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ViberIcon, WhatsAppIcon } from '@/components/ui/ContactIcons';

const PHONE_NUMBER = '+436764826069';
const WHATSAPP_NUMBER = '436764826069';
const VIBER_NUMBER = encodeURIComponent(PHONE_NUMBER);

const contactOptions = [
  {
    href: `tel:${PHONE_NUMBER}`,
    className: 'ui-contact-fab ui-contact-fab-phone',
    icon: Phone,
    hoverLabel: PHONE_NUMBER,
  },
  {
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    className: 'ui-contact-fab ui-contact-fab-whatsapp',
    icon: WhatsAppIcon,
    hoverLabel: undefined,
  },
  {
    href: `viber://chat?number=${VIBER_NUMBER}`,
    className: 'ui-contact-fab ui-contact-fab-viber',
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

  if (pathname.startsWith('/dispatch')) {
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
                  className={option.className}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-[26px] w-[26px] text-white md:h-[18px] md:w-[18px]" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ui-contact-fab ui-contact-fab-phone"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
      >
        {isOpen ? <X size={26} className="md:h-[18px] md:w-[18px]" /> : <Phone size={26} className="md:h-[18px] md:w-[18px]" />}
      </button>
    </div>
  );
}
