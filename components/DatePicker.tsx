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
const DAY_NAMES = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long' });

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
  showHeader = true,
}: {
  monthDate: Date;
  selectedDate: string;
  minDate: Date;
  maxDate: Date;
  onSelect: (date: Date) => void;
  showHeader?: boolean;
}) {
  const { year, month, daysInMonth, startDayIndex } = buildMonthDays(monthDate);

  return (
    <div className="min-w-0">
      {showHeader ? (
        <div className="mb-4 text-center">
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#1d1d1f] md:text-[19px]">
            {MONTH_FORMATTER.format(new Date(year, month, 1))} {year}
          </h2>
        </div>
      ) : null}

      <div className="mb-2 grid grid-cols-7">
        {DAY_NAMES.map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-semibold tracking-[0.02em] text-[#86868b]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
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
              className={`mx-auto flex h-[2.35rem] w-[2.35rem] items-center justify-center rounded-full text-[15px] font-medium transition-all md:h-[2.5rem] md:w-[2.5rem] md:text-[16px] ${
                isSelected ? 'bg-[#0a63ff] text-white shadow-md' : ''
              } ${
                !isSelected && !disabled ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : ''
              } ${
                isToday && !isSelected && !disabled ? 'font-bold text-[#0a63ff]' : ''
              } ${
                disabled ? 'cursor-not-allowed text-[#d2d2d7]' : ''
              }`}
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
    if (!isOpen) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

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
      const panelWidth = Math.min(760, window.innerWidth - 32);
      const left = Math.min(Math.max(rect.left - 8, 16), window.innerWidth - panelWidth - 16);
      const nextStyle: React.CSSProperties = {
        left,
        position: 'fixed',
        top: rect.bottom + 14,
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
        className="relative z-10 w-[min(23rem,calc(100vw-2rem))] rounded-[1.45rem] border border-[#e6e1d7] bg-white p-4 shadow-[0_18px_42px_rgba(17,17,17,0.16)] animate-in fade-in slide-in-from-bottom-4 duration-200 md:w-[min(47.5rem,calc(100vw-2rem))] md:rounded-[1.75rem] md:p-6 md:slide-in-from-top-2"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Calendar"
      >
        <div className="mb-4 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 md:mb-5 md:grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem] md:gap-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="col-start-1 row-start-1 flex h-10 w-10 items-center justify-center self-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#d2d2d7] disabled:hover:bg-transparent"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="col-start-2 row-start-1 justify-self-center text-center">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#1d1d1f] md:text-[19px]">
              {MONTH_FORMATTER.format(primaryMonth)} {primaryMonth.getFullYear()}
            </h2>
          </div>
          <div className="hidden justify-self-center text-center md:block md:col-start-3 md:row-start-1">
            <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#1d1d1f] md:text-[19px]">
              {MONTH_FORMATTER.format(secondaryMonth)} {secondaryMonth.getFullYear()}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="col-start-3 row-start-1 flex h-10 w-10 items-center justify-center self-center justify-self-end rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#d2d2d7] disabled:hover:bg-transparent md:col-start-4"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          <MonthGrid
            showHeader={false}
            monthDate={primaryMonth}
            selectedDate={selectedDate}
            minDate={today}
            maxDate={maxSelectableDate}
            onSelect={handleDaySelect}
          />
          <div className="hidden md:block">
            <MonthGrid
              showHeader={false}
              monthDate={secondaryMonth}
              selectedDate={selectedDate}
              minDate={today}
              maxDate={maxSelectableDate}
              onSelect={handleDaySelect}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-[12px] font-medium text-[#7b8798] md:mt-10 md:text-[13px]">
          Reserve your ride up to 90 days in advance
        </p>
      </div>
    </div>,
    document.body,
  );
}
