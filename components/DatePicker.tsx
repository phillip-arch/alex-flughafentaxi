'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const PICKER_OVERLAY_CLASS = 'fixed inset-0 bg-transparent';

const MONTH_NAMES = [
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

const DAY_NAMES = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

function parseSelectedDate(value: string) {
  const [day, month, year] = value.split('.');
  if (!day || !month || !year) return null;

  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  return {
    year,
    month,
    daysInMonth,
    startDayIndex,
  };
}

function MonthGrid({
  monthDate,
  selectedDate,
  minDate,
  maxDate,
  onSelect,
}: {
  monthDate: Date;
  selectedDate: string;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: Date) => void;
}) {
  const { year, month, daysInMonth, startDayIndex } = buildMonthDays(monthDate);

  return (
    <div className="min-w-0">
      <div className="mb-3 text-center">
        <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
          {MONTH_NAMES[month]} {year}
        </h2>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-1 text-center text-[10px] font-bold text-[#86868b]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startDayIndex }).map((_, index) => (
          <div key={`empty-${month}-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(year, month, day);
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;
          const isToday = startOfDay(date).getTime() === minDate.getTime();
          const disabled = date < minDate || date > maxDate;

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => !disabled && onSelect(date)}
              disabled={disabled}
              className={`
                mx-auto flex h-[2rem] w-[2rem] items-center justify-center rounded-full text-[13px] font-medium transition-all
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

export default function DatePicker({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  anchorRef,
}: DatePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxSelectableDate = useMemo(() => {
    const next = new Date(today);
    next.setMonth(next.getMonth() + 3);
    return startOfDay(next);
  }, [today]);
  const [currentDate, setCurrentDate] = useState(startOfMonth(today));
  const [isMounted, setIsMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setCurrentDate(startOfMonth(today));
      return;
    }

    const parsed = parseSelectedDate(selectedDate);
    if (!parsed) return;

    const clamped =
      parsed < today ? today : parsed > maxSelectableDate ? maxSelectableDate : parsed;
    const nextMonth = startOfMonth(clamped);

    setCurrentDate((prev) =>
      prev.getFullYear() === nextMonth.getFullYear() && prev.getMonth() === nextMonth.getMonth()
        ? prev
        : nextMonth,
    );
  }, [maxSelectableDate, selectedDate, today]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const updatePopoverPosition = () => {
      const anchor = anchorRef?.current;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;

      if (!anchor || !isDesktop) {
        setPopoverStyle(undefined);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(704, window.innerWidth - 32);
      const left = Math.min(Math.max(rect.left, 16), window.innerWidth - panelWidth - 16);
      const nextStyle: React.CSSProperties = {
        left,
        position: 'fixed',
        top: rect.bottom + 12,
        width: panelWidth,
      };

      setPopoverStyle((currentStyle) => {
        if (
          currentStyle?.left === nextStyle.left &&
          currentStyle?.top === nextStyle.top &&
          currentStyle?.width === nextStyle.width &&
          currentStyle?.position === nextStyle.position
        ) {
          return currentStyle;
        }

        return nextStyle;
      });
    };

    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [anchorRef, isMounted, isOpen]);

  if (!isOpen || !isMounted) return null;

  const primaryMonth = startOfMonth(currentDate);
  const secondaryMonth = addMonths(primaryMonth, 1);
  const minMonth = startOfMonth(today);
  const maxMonth = startOfMonth(maxSelectableDate);

  const canGoPrev =
    primaryMonth.getFullYear() > minMonth.getFullYear() ||
    (primaryMonth.getFullYear() === minMonth.getFullYear() &&
      primaryMonth.getMonth() > minMonth.getMonth());

  const canGoNext =
    secondaryMonth.getFullYear() < maxMonth.getFullYear() ||
    (secondaryMonth.getFullYear() === maxMonth.getFullYear() &&
      secondaryMonth.getMonth() < maxMonth.getMonth());

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setCurrentDate((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleDaySelect = (date: Date) => {
    onSelect(formatDate(date));
    onClose();
  };

  return createPortal(
    <div className={`${PICKER_OVERLAY_CLASS} z-[9999] flex items-center justify-center px-4 py-10`}>
      <button
        type="button"
        aria-label="Close calendar"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-[min(22rem,calc(100vw-2rem))] rounded-[1.375rem] border border-[#e6e1d7] bg-white p-3 shadow-[0_16px_34px_rgba(17,17,17,0.14)] animate-in fade-in slide-in-from-bottom-4 duration-200 md:w-[min(44rem,calc(100vw-2rem))] md:rounded-[1.5rem] md:p-4 md:slide-in-from-top-2"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Calendar"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8798]">
              Select date
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#d2d2d7] disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#d2d2d7] disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <MonthGrid
            monthDate={primaryMonth}
            selectedDate={selectedDate}
            minDate={today}
            maxDate={maxSelectableDate}
            onSelect={handleDaySelect}
          />
          <div className="hidden md:block">
            <MonthGrid
              monthDate={secondaryMonth}
              selectedDate={selectedDate}
              minDate={today}
              maxDate={maxSelectableDate}
              onSelect={handleDaySelect}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] font-medium text-[#7b8798] md:text-[12.5px]">
          Reserve your ride up to 90 days in advance
        </p>
      </div>
    </div>,
    document.body,
  );
}
