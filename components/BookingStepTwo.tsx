'use client';

import { Briefcase, Calendar, ChevronLeft, Clock, ShoppingBag, Users } from 'lucide-react';

type BookingStepTwoProps = {
  formData: any;
  error: string | null;
  flightLookupError: string | null;
  isLookingUpFlight: boolean;
  isDatePickerOpen: boolean;
  isTimePickerOpen: boolean;
  setIsDatePickerOpen: (value: boolean) => void;
  setIsTimePickerOpen: (value: boolean) => void;
  handleDateSelect: (date: string) => void;
  handleTimeSelect: (time: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFlightNumberBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  getInputClassName: (name: any) => string;
  isFieldInvalid: (name: any) => boolean;
  renderInlineSelect: (name: any, label: string, options: number[], value: number | '', Icon?: any) => React.ReactNode;
  prevStep: () => void;
  nextStep: () => void;
  actionRowClass: string;
  primaryActionButtonClass: string;
  secondaryBackButtonClass: string;
  DatePickerComponent: any;
  TimePickerComponent: any;
};

export default function BookingStepTwo({
  formData,
  error,
  flightLookupError,
  isLookingUpFlight,
  isDatePickerOpen,
  isTimePickerOpen,
  setIsDatePickerOpen,
  setIsTimePickerOpen,
  handleDateSelect,
  handleTimeSelect,
  handleChange,
  handleBlur,
  handleFlightNumberBlur,
  getInputClassName,
  isFieldInvalid,
  renderInlineSelect,
  prevStep,
  nextStep,
  actionRowClass,
  primaryActionButtonClass,
  secondaryBackButtonClass,
  DatePickerComponent,
  TimePickerComponent,
}: BookingStepTwoProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-[15px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">Wann?</h2>
        <p className="text-[12px] text-[#6d7075]">Datum und Uhrzeit waehlen.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium uppercase tracking-wide text-[#6d7075] mb-2 ml-1">Datum</label>
          <div className="relative">
            <input
              type="text"
              name="date"
              value={formData.date}
              readOnly
              placeholder="TT.MM.JJJJ"
              onClick={() => setIsDatePickerOpen(true)}
              className={`ui-field-surface h-12 w-full rounded-[var(--radius-field)] border px-3 py-0 text-[17px] text-[#1d1d1f] outline-none transition-all cursor-pointer md:h-[2.4rem] md:px-[0.8rem] ${
                isFieldInvalid('date')
                  ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015] placeholder:text-[#d70015]/60'
                  : 'border-[#d8d4ca] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'
              }`}
            />
            <Calendar
              onClick={() => setIsDatePickerOpen(true)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${isFieldInvalid('date') ? 'text-[#d70015]' : 'text-[#6d7075]'}`}
              size={20}
            />
            <DatePickerComponent
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelect={handleDateSelect}
              selectedDate={formData.date}
            />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium uppercase tracking-wide text-[#6d7075] mb-2 ml-1">
            {formData.direction === 'from_airport' ? 'Landezeit' : 'Zeit'}
          </label>
          <div className="relative">
            <input
              type="text"
              name="time"
              value={formData.time}
              readOnly
              placeholder="--:--"
              onClick={() => setIsTimePickerOpen(true)}
              className={`ui-field-surface h-12 w-full rounded-[var(--radius-field)] border px-3 py-0 text-[17px] text-[#1d1d1f] outline-none transition-all cursor-pointer md:h-[2.4rem] md:px-[0.8rem] ${
                isFieldInvalid('time')
                  ? 'border-[#d70015] focus:border-[#d70015] focus:ring-1 focus:ring-[#d70015] placeholder:text-[#d70015]/60'
                  : 'border-[#d8d4ca] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10'
              }`}
            />
            <Clock
              onClick={() => setIsTimePickerOpen(true)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${isFieldInvalid('time') ? 'text-[#d70015]' : 'text-[#6d7075]'}`}
              size={20}
            />
            <TimePickerComponent
              isOpen={isTimePickerOpen}
              onClose={() => setIsTimePickerOpen(false)}
              onSelect={handleTimeSelect}
              selectedTime={formData.time}
            />
          </div>
        </div>
      </div>

      {formData.direction === 'from_airport' ? (
        <div>
          <p className="mb-3 ml-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#6d7075]">Flugdetails</p>
          <input
            type="text"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            onBlur={handleFlightNumberBlur}
            placeholder="Flugnummer (z.B. OS123)"
            className={getInputClassName('flightNumber')}
          />
          {isLookingUpFlight ? (
            <p className="mt-2 ml-1 text-[12px] text-[#6d7075]">Flugdaten werden geladen...</p>
          ) : null}
          {flightLookupError ? (
            <div className="mt-2 rounded-[var(--radius-field)] border border-[rgba(215,0,21,0.18)] bg-[rgba(215,0,21,0.05)] px-4 py-3 text-[0.95rem] font-medium text-[#d70015]">
              {flightLookupError}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {renderInlineSelect('passengers', 'Personen', [1, 2, 3, 4, 5, 6, 7, 8], formData.passengers, Users)}
        {renderInlineSelect('luggage', 'Koffer', [0, 1, 2, 3, 4, 5, 6, 7, 8], formData.luggage, Briefcase)}
        {renderInlineSelect('handLuggage', 'Handgepaeck', [0, 1, 2, 3, 4, 5, 6, 7, 8], formData.handLuggage, ShoppingBag)}
      </div>

      <div className="flex flex-col gap-4 rounded-[var(--radius-field)] bg-[#f5f5f7] p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[#1d1d1f]">
              <p className="font-medium text-[15px]">Kindersitz benoetigt?</p>
              <p className="text-[13px] text-[#86868b]">Kostenlos inklusive</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="childSeat" checked={formData.childSeat} onChange={handleChange} className="sr-only peer" />
            <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
          </label>
        </div>

        {formData.childSeat ? (
          <div className="grid grid-cols-3 gap-3 border-t border-[#d2d2d7]/30 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {renderInlineSelect('babySeats', 'Babyschale', [0, 1, 2, 3], formData.babySeats)}
            {renderInlineSelect('childSeats', 'Kindersitz', [0, 1, 2, 3], formData.childSeats)}
            {renderInlineSelect('boosterSeats', 'Sitzerhoehung', [0, 1, 2, 3], formData.boosterSeats)}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8]">
          <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
          {error}
        </div>
      ) : null}

      <div className={actionRowClass}>
        <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
          <ChevronLeft size={24} />
        </button>
        <button type="button" onClick={nextStep} className={primaryActionButtonClass}>
          Preise anzeigen
        </button>
      </div>
    </div>
  );
}
