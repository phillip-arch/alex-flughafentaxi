'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight - 20 && rect.bottom > 0;
    if (alreadyVisible) return;

    el.classList.add('sr-hidden');

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        if (delay > 0) {
          timer = setTimeout(() => {
            el.classList.remove('sr-hidden');
            el.classList.add('sr-visible');
          }, delay);
        } else {
          el.classList.remove('sr-hidden');
          el.classList.add('sr-visible');
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
