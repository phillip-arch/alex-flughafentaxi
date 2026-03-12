'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
}

export default function DatePicker({ isOpen, onClose, onSelect, selectedDate }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedDate) return;

    const [d, m, y] = selectedDate.split('.');
    if (d && m && y) {
      setCurrentDate(new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)));
    }
  }, [selectedDate, isOpen]);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    'Jänner',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  const dayNames = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelect(`${d}.${m}.${year}`);
    onClose();
  };

  const isDateDisabled = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full z-40 mt-3 w-[min(19rem,calc(100vw-3rem))] rounded-[1.375rem] border border-[#e6e1d7] bg-white p-3.5 shadow-[0_16px_34px_rgba(17,17,17,0.14)] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7">
        {dayNames.map((day) => (
          <div key={day} className="py-1.5 text-center text-[10px] font-bold text-[#86868b]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {Array.from({ length: startDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const m = (month + 1).toString().padStart(2, '0');
          const d = day.toString().padStart(2, '0');
          const dateStr = `${d}.${m}.${year}`;
          const isSelected = selectedDate === dateStr;
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const disabled = isDateDisabled(day);

          return (
            <button
              type="button"
              key={day}
              onClick={() => !disabled && handleDayClick(day)}
              disabled={disabled}
              className={`
                mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-all
                ${isSelected ? 'bg-[#0a63ff] text-white shadow-md' : ''}
                ${!isSelected && !disabled ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : ''}
                ${isToday && !isSelected && !disabled ? 'font-bold text-[#0a63ff]' : ''}
                ${disabled ? 'cursor-not-allowed text-[#d2d2d7]' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
