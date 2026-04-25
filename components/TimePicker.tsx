'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus } from 'lucide-react';
import { BOOKING_OVERLAY_BACKDROP_CLASS } from './bookingOverlayStyles';
import {
  formatLeadTimeTimeValue,
  getEarliestAllowedDateTimeForDay,
  hasSufficientLeadTime,
} from '@/lib/booking/leadTime';

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
  selectedDate?: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

function parseSelectedDateTime(date: string, time: string) {
  const [day, month, year] = date.split('.');
  const [hours, minutes] = time.split(':');
  if (!day || !month || !year || !hours || !minutes) return null;

  const selectedDate = new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
    Number.parseInt(day, 10),
    Number.parseInt(hours, 10),
    Number.parseInt(minutes, 10),
  );

  return Number.isNaN(selectedDate.getTime()) ? null : selectedDate;
}

export default function TimePicker({
  isOpen,
  onClose,
  onSelect,
  selectedTime,
  selectedDate,
  anchorRef,
}: TimePickerProps) {
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':');
      if (h && m) {
        setHour(h);
        setMinute(m);
      }
    } else if (selectedDate) {
      const selectedDay = parseSelectedDateTime(selectedDate, '00:00');
      const firstAllowedTime = selectedDay ? getEarliestAllowedDateTimeForDay(selectedDay) : null;
      const formattedFirstAllowedTime = firstAllowedTime ? formatLeadTimeTimeValue(firstAllowedTime) : null;
      const [defaultHour, defaultMinute] = formattedFirstAllowedTime?.split(':') ?? [];
      setHour(defaultHour ?? null);
      setMinute(defaultMinute ?? null);
    } else {
      setHour(null);
      setMinute(null);
    }
  }, [selectedDate, selectedTime, isOpen]);

  useEffect(() => {
    if (!isOpen || !hour || !minute) return;

    const nextValue = `${hour}:${minute}`;
    if (nextValue !== selectedTime) {
      onSelect(nextValue);
    }
  }, [hour, minute, isOpen, onSelect, selectedTime]);

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
      const panelWidth = Math.min(144, window.innerWidth - 32);
      const left = Math.min(Math.max(rect.left, 16), window.innerWidth - panelWidth - 16);

      setPopoverStyle({
        left,
        position: 'fixed',
        top: rect.bottom + 12,
        width: panelWidth,
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

  const canSelectCandidateTime = (nextHour: string, nextMinute: string) => {
    if (!selectedDate) return true;
    const candidateDate = parseSelectedDateTime(selectedDate, `${nextHour}:${nextMinute}`);
    if (!candidateDate) return true;
    return hasSufficientLeadTime(candidateDate);
  };

  const canDecrementHour =
    hour !== null &&
    minute !== null &&
    canSelectCandidateTime(((Number.parseInt(hour, 10) - 1 + 24) % 24).toString().padStart(2, '0'), minute);

  const canDecrementMinute =
    hour !== null &&
    minute !== null &&
    canSelectCandidateTime(hour, ((Number.parseInt(minute, 10) - 5 + 60) % 60).toString().padStart(2, '0'));

  const incrementHour = () => {
    let value = hour ? parseInt(hour, 10) : 12;
    value = (value + 1) % 24;
    setHour(value.toString().padStart(2, '0'));
  };

  const decrementHour = () => {
    if (!canDecrementHour) return;
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
    if (!canDecrementMinute) return;
    let value = minute ? parseInt(minute, 10) : 0;
    value = (value - 5 + 60) % 60;
    setMinute(value.toString().padStart(2, '0'));
  };

  return createPortal(
    <div className={`${BOOKING_OVERLAY_BACKDROP_CLASS} z-[9999] flex items-center justify-center px-4 py-10`}>
      <button
        type="button"
        aria-label="Close time picker"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-[9rem] max-w-[calc(100vw-2rem)] rounded-[0.9rem] border border-[#e6e1d7] bg-white p-[0.7rem] shadow-[0_16px_34px_rgba(17,17,17,0.14)]"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Time picker"
      >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2">
        <div className="flex flex-col items-center justify-between gap-4">
          <button
            type="button"
            onClick={incrementHour}
            className="flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>

          <span className={`text-[1.9rem] font-medium leading-none tracking-[-0.06em] ${hour ? 'text-[#111111]' : 'text-[#d2d2d7]'}`}>
            {hour || '--'}
          </span>

          <button
            type="button"
            onClick={decrementHour}
            disabled={!canDecrementHour}
            className="flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#c4c9d1] disabled:hover:bg-transparent"
          >
            <Minus size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="text-[1.75rem] font-light leading-none text-[#111111]">:</div>

        <div className="flex flex-col items-center justify-between gap-4">
          <button
            type="button"
            onClick={incrementMinute}
            className="flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7]"
          >
            <Plus size={18} strokeWidth={2.4} />
          </button>

          <span className={`text-[1.9rem] font-medium leading-none tracking-[-0.06em] ${minute ? 'text-[#111111]' : 'text-[#d2d2d7]'}`}>
            {minute || '--'}
          </span>

          <button
            type="button"
            onClick={decrementMinute}
            disabled={!canDecrementMinute}
            className="flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full text-[#111111] transition-colors hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#c4c9d1] disabled:hover:bg-transparent"
          >
            <Minus size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
