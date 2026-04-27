'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  formatLeadTimeTimeValue,
  getEarliestAllowedDateTimeForDay,
  hasSufficientLeadTime,
  roundUpToNextFiveMinutes,
} from '@/lib/booking/leadTime';

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
  selectedDate?: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const PICKER_OVERLAY_CLASS = 'fixed inset-0 bg-transparent';

function parseSelectedDate(value?: string) {
  if (!value) return null;

  const [day, month, year] = value.split('.');
  if (!day || !month || !year) return null;

  const parsed = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTimeHour(value: string) {
  const [hours] = value.split(':');
  return Number(hours);
}

type TimeOption = {
  value: string;
  isAvailable: boolean;
};

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildTimeOptions(selectedDate?: string, now = new Date()) {
  const parsedDate = parseSelectedDate(selectedDate);
  const baseDate = parsedDate ?? now;
  const isToday = parsedDate ? isSameCalendarDay(parsedDate, now) : false;
  const roundedNow = roundUpToNextFiveMinutes(now);
  const startOfList = isToday
    ? new Date(roundedNow)
    : new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    23,
    55,
    0,
    0,
  );

  const firstAllowed = parsedDate ? getEarliestAllowedDateTimeForDay(parsedDate, now) : null;

  if (!firstAllowed && isToday) {
    return [];
  }

  const values: TimeOption[] = [];
  let cursor = new Date(startOfList);

  while (cursor.getTime() <= endOfDay.getTime()) {
    values.push({
      value: formatLeadTimeTimeValue(cursor),
      isAvailable: parsedDate
        ? hasSufficientLeadTime(cursor, now)
        : true,
    });
    cursor = new Date(cursor.getTime() + 5 * 60 * 1000);
  }

  return values;
}

export default function TimePicker({
  isOpen,
  onClose,
  onSelect,
  selectedTime,
  selectedDate,
  anchorRef,
}: TimePickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined);
  const [showUnavailableNotice, setShowUnavailableNotice] = useState(false);
  const [unavailableNoticePosition, setUnavailableNoticePosition] = useState<'top' | 'bottom'>('top');
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timeOptions = useMemo(() => buildTimeOptions(selectedDate), [selectedDate]);
  const parsedDate = useMemo(() => parseSelectedDate(selectedDate), [selectedDate]);
  const isTodaySelection = parsedDate ? isSameCalendarDay(parsedDate, new Date()) : false;
  const hasUnavailableTimes = timeOptions.some((option) => !option.isAvailable);
  const firstAvailableValue = timeOptions.find((option) => option.isAvailable)?.value ?? null;
  const isInlineAnchored = Boolean(anchorRef);
  const todayStartValue = useMemo(() => {
    if (!isTodaySelection) return null;
    return formatLeadTimeTimeValue(roundUpToNextFiveMinutes(new Date()));
  }, [isTodaySelection]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (!parsedDate) return;

    const nextDefault = timeOptions.find((option) => option.isAvailable)?.value;
    if (!nextDefault) return;

    if (!selectedTime || !timeOptions.some((option) => option.value === selectedTime && option.isAvailable)) {
      onSelect(nextDefault);
    }
  }, [isOpen, onSelect, parsedDate, selectedTime, timeOptions]);

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
    if (!isOpen || !isInlineAnchored) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (anchorRef?.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [anchorRef, isInlineAnchored, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isMounted || isInlineAnchored) return;

    const updatePopoverPosition = () => {
      const anchor = anchorRef?.current;

      if (!anchor) {
        setPopoverStyle((current) => (current === undefined ? current : undefined));
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(rect.width, window.innerWidth - 32);
      const viewportLeft = Math.min(Math.max(rect.left, 16), window.innerWidth - panelWidth - 16);
      const topAbsolute = Math.max(rect.top + window.scrollY, window.scrollY + 16);
      const maxHeight = window.innerHeight - (topAbsolute - window.scrollY) - 16;
      const nextStyle: React.CSSProperties = {
        left: viewportLeft + window.scrollX,
        maxHeight,
        overflowY: 'auto',
        position: 'absolute',
        top: topAbsolute,
        width: panelWidth,
      };

      setPopoverStyle((current) => {
        if (
          current?.left === nextStyle.left &&
          current?.top === nextStyle.top &&
          current?.width === nextStyle.width &&
          current?.position === nextStyle.position &&
          current?.maxHeight === nextStyle.maxHeight
        ) {
          return current;
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
  }, [anchorRef, isInlineAnchored, isMounted, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const list = listRef.current;
    if (!list) return;

    const activeValue = isTodaySelection
      ? todayStartValue
      : '12:00';

    if (!activeValue) {
      list.scrollTop = 0;
      setShowUnavailableNotice(false);
      setUnavailableNoticePosition('top');
      return;
    }

    const activeOption = list.querySelector<HTMLElement>(`[data-time-option="${activeValue}"]`);
    if (!activeOption) return;

    const targetTop = Math.max(0, activeOption.offsetTop);

    list.scrollTop = targetTop;
    setShowUnavailableNotice(false);
    setUnavailableNoticePosition('top');
  }, [isOpen, isTodaySelection, timeOptions, todayStartValue]);

  useEffect(() => {
    if (!isOpen) return;

    const list = listRef.current;
    if (!list || !hasUnavailableTimes) {
      setShowUnavailableNotice(false);
      setUnavailableNoticePosition('top');
      return;
    }

    const updateUnavailableNotice = () => {
      const viewportTop = list.scrollTop;
      const viewportBottom = viewportTop + list.clientHeight;
      const unavailableOptions = Array.from(
        list.querySelectorAll<HTMLElement>('[data-time-unavailable="true"]'),
      );
      const visibleUnavailableOptions = unavailableOptions.filter((option) => {
        const optionTop = option.offsetTop;
        const optionBottom = optionTop + option.offsetHeight;

        return optionBottom > viewportTop && optionTop < viewportBottom;
      });

      if (visibleUnavailableOptions.length === 0) {
        setShowUnavailableNotice(false);
        return;
      }

      const firstVisibleUnavailableHour = getTimeHour(
        visibleUnavailableOptions[0].dataset.timeOption ?? '',
      );

      setUnavailableNoticePosition(firstVisibleUnavailableHour >= 22 ? 'bottom' : 'top');
      setShowUnavailableNotice(true);
    };

    updateUnavailableNotice();
    list.addEventListener('scroll', updateUnavailableNotice, { passive: true });

    return () => {
      list.removeEventListener('scroll', updateUnavailableNotice);
    };
  }, [hasUnavailableTimes, isOpen]);

  if (!isOpen || !isMounted) return null;

  const panel = (
    <div
      ref={panelRef}
      className={`overflow-hidden rounded-[1.1rem] border border-[#e6e1d7] bg-white shadow-[0_16px_34px_rgba(17,17,17,0.14)] animate-in fade-in slide-in-from-bottom-4 duration-200 md:slide-in-from-top-2 ${
        isInlineAnchored
          ? 'absolute left-0 top-[calc(100%+6px)] z-[70] w-full'
          : 'relative z-10 w-[min(22rem,calc(100vw-2rem))]'
      }`}
      style={isInlineAnchored ? undefined : popoverStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Time picker"
    >
      {showUnavailableNotice ? (
        <div
          className={`pointer-events-none absolute inset-x-3 z-20 ${
            unavailableNoticePosition === 'bottom' ? 'bottom-3' : 'top-3'
          }`}
        >
          <div className="rounded-[0.85rem] border border-[#edf1f6] bg-white/96 px-3 py-2 text-[0.8rem] font-medium leading-[1.35] text-[#6b7280] shadow-[0_8px_20px_rgba(17,17,17,0.06)] backdrop-blur-[1px]">
            Unavailable time due to the minimum booking notice.
          </div>
        </div>
      ) : null}
      <div ref={listRef} className="relative max-h-[18.5rem] overflow-y-auto py-1">
        {timeOptions.length > 0 ? (
          timeOptions.map(({ value, isAvailable }) => {
            const isSelected = value === selectedTime;

            return (
              <button
                type="button"
                key={value}
                onClick={() => {
                  if (!isAvailable) return;
                  onSelect(value);
                  onClose();
                }}
                disabled={!isAvailable}
                data-time-option={value}
                data-time-unavailable={isAvailable ? undefined : 'true'}
                className={`flex w-full items-center px-4 py-3 text-left text-[1.05rem] font-medium tracking-[-0.03em] transition-colors ${
                  isSelected
                    ? 'text-[#111827]'
                    : isAvailable
                      ? 'text-[#1f2937] hover:bg-[#f8fafc]'
                      : 'cursor-not-allowed text-[#c7cfdb]'
                }`}
              >
                <span>{value}</span>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-4 text-[0.95rem] font-medium text-[#7b8798]">
            No times available for the selected date.
          </div>
        )}
      </div>
    </div>
  );

  if (isInlineAnchored) {
    return panel;
  }

  return createPortal(
    <div className={`${PICKER_OVERLAY_CLASS} z-[9999]`}>
      <button
        type="button"
        aria-label="Close time picker"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      {panel}
    </div>,
    document.body,
  );
}
