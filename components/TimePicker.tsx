'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
}

export default function TimePicker({ isOpen, onClose, onSelect, selectedTime }: TimePickerProps) {
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':');
      if (h && m) {
        setHour(h);
        setMinute(m);
      }
    } else {
      setHour(null);
      setMinute(null);
    }
  }, [selectedTime, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const incrementHour = () => {
    let value = hour ? parseInt(hour, 10) : 12;
    value = (value + 1) % 24;
    setHour(value.toString().padStart(2, '0'));
  };

  const decrementHour = () => {
    let value = hour ? parseInt(hour, 10) : 12;
    value = (value - 1 + 24) % 24;
    setHour(value.toString().padStart(2, '0'));
  };

  const incrementMinute = () => {
    let value = minute ? parseInt(minute, 10) : 0;
    value = (value + 5) % 60;
    setMinute(value.toString().padStart(2, '0'));
  };

  const decrementMinute = () => {
    let value = minute ? parseInt(minute, 10) : 0;
    value = (value - 5 + 60) % 60;
    setMinute(value.toString().padStart(2, '0'));
  };

  const handleConfirm = () => {
    if (!hour || !minute) return;
    onSelect(`${hour}:${minute}`);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-40 mt-3 w-[min(19rem,calc(100vw-3rem))] rounded-[1.375rem] border border-[#e6e1d7] bg-white p-3.5 shadow-[0_16px_34px_rgba(17,17,17,0.14)] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
        Zeit wählen
      </p>

      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={incrementHour}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronUp size={18} />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#f5f5f7]">
            <span className={`text-[24px] font-semibold tracking-[-0.03em] ${hour ? 'text-[#1d1d1f]' : 'text-[#d2d2d7]'}`}>
              {hour || '--'}
            </span>
          </div>

          <button
            type="button"
            onClick={decrementHour}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronDown size={18} />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
            Stunde
          </span>
        </div>

        <div className="pb-6 text-[24px] font-light text-[#c3c6cc]">:</div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={incrementMinute}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronUp size={18} />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[#f5f5f7]">
            <span className={`text-[24px] font-semibold tracking-[-0.03em] ${minute ? 'text-[#1d1d1f]' : 'text-[#d2d2d7]'}`}>
              {minute || '--'}
            </span>
          </div>

          <button
            type="button"
            onClick={decrementMinute}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronDown size={18} />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#86868b]">
            Minute
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!hour || !minute}
        className="w-full rounded-[1rem] bg-[#111111] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#232325] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Fertig
      </button>
    </div>
  );
}
