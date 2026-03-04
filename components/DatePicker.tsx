'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
}

export default function DatePicker({ isOpen, onClose, onSelect, selectedDate }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Initialize with selected date if valid, otherwise today
  useEffect(() => {
    if (selectedDate) {
      // Parse DD.MM.YYYY to Date object
      const [d, m, y] = selectedDate.split('.');
      if (d && m && y) {
        setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
      }
    }
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  // Adjust for Monday start (German standard)
  // 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
  const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Jänner", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const dayNames = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    // Format: DD.MM.YYYY
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onSelect(`${d}.${m}.${year}`);
    onClose();
  };

  // Helper to check if a date is in the past
  const isDateDisabled = (d: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, d);
    return checkDate < today;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 pb-2">
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-[0.15em] mb-4">
            DATUM WÄHLEN
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-4">
              <button type="button" onClick={handlePrevMonth} className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button type="button" onClick={handleNextMonth} className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[11px] font-bold text-[#86868b] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-2 mb-4">
            {/* Empty slots for start of month */}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              // Format for comparison: DD.MM.YYYY
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
                    h-10 w-10 mx-auto rounded-full flex items-center justify-center text-[15px] font-medium transition-all
                    ${isSelected ? 'bg-[#0071e3] text-white shadow-md' : ''}
                    ${!isSelected && !disabled ? 'text-[#1d1d1f] hover:bg-[#f5f5f7]' : ''}
                    ${isToday && !isSelected && !disabled ? 'text-[#0071e3] font-bold' : ''}
                    ${disabled ? 'text-[#d2d2d7] cursor-not-allowed' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#f5f5f7] flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="text-[13px] font-bold text-[#86868b] hover:text-[#1d1d1f] uppercase tracking-wider px-4 py-2 transition-colors"
          >
            Abbruch
          </button>
        </div>
      </div>
    </div>
  );
}
