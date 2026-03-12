'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

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
    if (!isOpen || !hour || !minute) return;

    const nextValue = `${hour}:${minute}`;
    if (nextValue !== selectedTime) {
      onSelect(nextValue);
    }
  }, [hour, minute, isOpen, onSelect, selectedTime]);

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

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full z-40 mt-3 w-[min(11.25rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[1.125rem] border border-[#e6e1d7] bg-white p-3.5 shadow-[0_16px_34px_rgba(17,17,17,0.14)] animate-in fade-in slide-in-from-top-2 duration-200 sm:left-0 sm:right-auto sm:w-[11.25rem] sm:max-w-none"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2.5">
        <div className="flex flex-col items-center justify-between gap-5">
          <button
            type="button"
            onClick={incrementHour}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>

          <span className={`text-[2.35rem] font-medium leading-none tracking-[-0.06em] ${hour ? 'text-[#111111]' : 'text-[#d2d2d7]'}`}>
            {hour || '--'}
          </span>

          <button
            type="button"
            onClick={decrementHour}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Minus size={22} strokeWidth={2.4} />
          </button>
        </div>

        <div className="text-[2.2rem] font-light leading-none text-[#111111]">:</div>

        <div className="flex flex-col items-center justify-between gap-5">
          <button
            type="button"
            onClick={incrementMinute}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>

          <span className={`text-[2.35rem] font-medium leading-none tracking-[-0.06em] ${minute ? 'text-[#111111]' : 'text-[#d2d2d7]'}`}>
            {minute || '--'}
          </span>

          <button
            type="button"
            onClick={decrementMinute}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Minus size={22} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
