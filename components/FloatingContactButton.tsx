'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PHONE_NUMBER = '+436764826069';

export default function FloatingContactButton() {
  const [isVisible, setIsVisible] = useState(false);
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

  if (pathname.startsWith('/dispatch')) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <a
        href={`tel:${PHONE_NUMBER}`}
        className="ui-contact-fab ui-contact-fab-phone ui-contact-fab-anim-fade-lift"
        aria-label="Call now"
      >
        <Phone className="h-[26px] w-[26px] text-white md:h-[18px] md:w-[18px]" />
      </a>
    </div>
  );
}
