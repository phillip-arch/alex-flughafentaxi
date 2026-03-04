'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
}

export default function TimePicker({ isOpen, onClose, onSelect, selectedTime }: TimePickerProps) {
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':');
      if (h && m) {
        setHour(h);
        setMinute(m);
      }
    } else {
      // Reset to null when opening without a selected time
      setHour(null);
      setMinute(null);
    }
  }, [selectedTime, isOpen]);

  if (!isOpen) return null;

  const incrementHour = () => {
    let h = hour ? parseInt(hour) : 12; // Default start at 12
    h = (h + 1) % 24;
    setHour(h.toString().padStart(2, '0'));
  };

  const decrementHour = () => {
    let h = hour ? parseInt(hour) : 12;
    h = (h - 1 + 24) % 24;
    setHour(h.toString().padStart(2, '0'));
  };

  const incrementMinute = () => {
    let m = minute ? parseInt(minute) : 0; // Default start at 00
    m = (m + 5) % 60; // 5 minute steps
    setMinute(m.toString().padStart(2, '0'));
  };

  const decrementMinute = () => {
    let m = minute ? parseInt(minute) : 0;
    m = (m - 5 + 60) % 60; // 5 minute steps
    setMinute(m.toString().padStart(2, '0'));
  };

  const handleConfirm = () => {
    if (hour && minute) {
      onSelect(`${hour}:${minute}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 pb-4">
          <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-[0.15em] mb-8 text-center">
            ZEIT WÄHLEN
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Hour Column */}
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={incrementHour} className="text-[#86868b] hover:text-[#0071e3] transition-colors p-2">
                <ChevronUp size={24} />
              </button>
              
              <div className="w-[80px] h-[80px] bg-[#f5f5f7] rounded-[20px] flex items-center justify-center">
                <span className={`text-[36px] font-semibold tracking-tight ${hour ? 'text-[#1d1d1f]' : 'text-[#d2d2d7]'}`}>
                  {hour || '--'}
                </span>
              </div>

              <button type="button" onClick={decrementHour} className="text-[#86868b] hover:text-[#0071e3] transition-colors p-2">
                <ChevronDown size={24} />
              </button>
              
              <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mt-1">
                STUNDE
              </span>
            </div>

            <div className="text-[36px] font-light text-[#d2d2d7] pb-8">:</div>

            {/* Minute Column */}
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={incrementMinute} className="text-[#86868b] hover:text-[#0071e3] transition-colors p-2">
                <ChevronUp size={24} />
              </button>
              
              <div className="w-[80px] h-[80px] bg-[#f5f5f7] rounded-[20px] flex items-center justify-center">
                <span className={`text-[36px] font-semibold tracking-tight ${minute ? 'text-[#1d1d1f]' : 'text-[#d2d2d7]'}`}>
                  {minute || '--'}
                </span>
              </div>

              <button type="button" onClick={decrementMinute} className="text-[#86868b] hover:text-[#0071e3] transition-colors p-2">
                <ChevronDown size={24} />
              </button>

              <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mt-1">
                MINUTE
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 text-[13px] font-bold text-[#86868b] hover:text-[#1d1d1f] uppercase tracking-wider py-4 transition-colors"
          >
            Abbruch
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={!hour || !minute}
            className="flex-1 bg-[#1d1d1f] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold uppercase tracking-wider py-4 rounded-[16px] transition-all shadow-lg shadow-black/10"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}
