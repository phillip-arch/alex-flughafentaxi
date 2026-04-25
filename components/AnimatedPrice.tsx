'use client';

import { useEffect, useRef, useState } from 'react';

type AnimatedPriceProps = {
  value: number;
  className?: string;
  currencyDisplay?: 'code' | 'symbol';
};

export default function AnimatedPrice({
  value,
  className = '',
  currencyDisplay = 'code',
}: AnimatedPriceProps) {
  const previousValueRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousValueRef.current === null) {
      previousValueRef.current = value;
      return;
    }

    if (previousValueRef.current === value) return;

    previousValueRef.current = value;
    setIsAnimating(false);

    const frame = window.requestAnimationFrame(() => setIsAnimating(true));
    const timeout = window.setTimeout(() => setIsAnimating(false), 360);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [value]);

  return (
    <span
      className={`inline-block origin-center tabular-nums will-change-transform ${isAnimating ? 'ui-price-grow' : ''} ${className}`}
    >
      {currencyDisplay === 'symbol' ? `${value} €` : `${value} EUR`}
    </span>
  );
}
