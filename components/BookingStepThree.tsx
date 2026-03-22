'use client';

import { Calendar, Car, ChevronLeft, ChevronRight, MapPin, Users, Briefcase } from 'lucide-react';

type BookingStepThreeProps = {
  formData: any;
  totalPrice: number;
  routeSummary: string;
  streetSummary: string;
  dateSummary: string;
  vehicleType: string;
  isLoggedIn: boolean;
  error: string | null;
  loading: boolean;
  handleBookingForMyselfToggle: (checked: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  getInputClassName: (name: any) => string;
  handlePaymentChange: (method: 'cash' | 'card') => void;
  touched: Record<string, boolean>;
  prevStep: () => void;
  actionRowClass: string;
  secondaryBackButtonClass: string;
  primaryActionButtonClass: string;
};

export default function BookingStepThree({
  formData,
  totalPrice,
  routeSummary,
  streetSummary,
  dateSummary,
  vehicleType,
  isLoggedIn,
  error,
  loading,
  handleBookingForMyselfToggle,
  handleChange,
  handleBlur,
  getInputClassName,
  handlePaymentChange,
  touched,
  prevStep,
  actionRowClass,
  secondaryBackButtonClass,
  primaryActionButtonClass,
}: BookingStepThreeProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-4">
        <h2 className="text-[15px] font-semibold text-[#111111] leading-tight mb-2 tracking-[-0.04em]">Uebersicht</h2>
        <p className="text-[12px] text-[#6d7075]">Bitte ueberpruefen Sie Ihre Daten.</p>
      </div>

      <div className="rounded-[22px] border border-[#d8d4ca] bg-[#fbfaf8] p-4 text-left shadow-[0_10px_28px_rgba(17,17,17,0.05)] md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7075]">Gesamtpreis</p>
            <p className="mt-1 text-[46px] font-semibold leading-none tracking-[-0.05em] text-[#0a63ff] md:text-[52px]">{totalPrice} EUR</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#1679FF] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">Fixpreis</span>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d6e5ff] bg-white px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f]">
          <MapPin size={14} className="text-[#0a63ff]" />
          <span>{routeSummary}</span>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#e3dfd5] bg-white px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Calendar size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">Datum</p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">{dateSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">Strasse</p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">{streetSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">Personen</p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">{formData.passengers || 0} Personen</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Car size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">Fahrzeug</p>
                <p className="mt-0.5 text-[14px] font-medium leading-[1.35] text-[#1d1d1f]">
                  {vehicleType} | {formData.luggage || 0} Koffer | {formData.handLuggage || 0} Handgepaeck
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="flex flex-col gap-4 p-5 bg-[#f5f5f7] rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[#1d1d1f]">
                <p className="font-medium text-[15px]">Buchung fuer mich</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.bookingForMyself} onChange={(e) => handleBookingForMyselfToggle(e.target.checked)} className="sr-only peer" />
              <div className="w-[51px] h-[31px] bg-[#e9e9ea] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:shadow-sm after:transition-all peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)]"></div>
            </label>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="relative">
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Name" className={getInputClassName('fullName')} />
        </div>
        <div className="relative">
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder="Telefonnummer" className={getInputClassName('phone')} />
        </div>
        <div className="relative">
          <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="E-Mail" className={getInputClassName('email')} />
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide mb-3 ml-1">Zahlung</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePaymentChange('cash')}
            className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'cash'
                ? 'border-[#1f9d55] bg-[#1f9d55] text-white'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Barzahlung</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentChange('card')}
            className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'card'
                ? 'border-[#1679FF] bg-[#1679FF] text-white'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Kreditkarte</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Anmerkungen (optional)"
          className="ui-field-surface w-full rounded-[var(--radius-field)] border border-[#d2d2d7] p-3 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none resize-none transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] md:p-[0.8rem]"
        />
      </div>

      <div className="hidden rounded-[24px] border border-[#d8d4ca] bg-[linear-gradient(180deg,#faf8f4_0%,#f5f5f7_100%)] p-6 shadow-[0_20px_50px_rgba(17,17,17,0.06)] md:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#86868b] mb-2">Gesamtpreis</p>
        <p className="text-[48px] font-semibold text-[#1d1d1f] leading-none mb-4 tracking-tight">{totalPrice} {'\u20AC'}</p>
        <div className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#1d1d1f] mb-6">
          {formData.direction === 'to_airport' ? (
            <>
              <span>{formData.zip} {formData.city}</span>
              <ChevronRight size={14} className="text-[#86868b]" />
              <span>Flughafen VIE</span>
            </>
          ) : (
            <>
              <span>Flughafen VIE</span>
              <ChevronRight size={14} className="text-[#86868b]" />
              <span>{formData.zip} {formData.city}</span>
            </>
          )}
        </div>
        <div className="bg-white rounded-[16px] p-4 border border-[#d2d2d7]/50 shadow-sm max-w-[320px] mx-auto">
          <div className="flex items-center gap-1.5" title="Handgepaeck">
            <Car size={18} className="text-[#0071e3]" />
            <span>Fahrzeug: {vehicleType}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-[#86868b] font-medium">
            <div className="flex items-center gap-1.5" title="Personen">
              <Users size={16} />
              <span>{formData.passengers || 0}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Koffer">
              <Briefcase size={16} />
              <span>{formData.luggage || 0}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Handgepaeck">
              <Briefcase size={14} className="opacity-70" />
              <span>{formData.handLuggage || 0}</span>
            </div>
          </div>
        </div>
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
        <button type="submit" disabled={loading} className={`${primaryActionButtonClass} disabled:opacity-50`}>
          {loading ? 'Wird gebucht...' : 'Jetzt buchen'}
        </button>
      </div>
    </div>
  );
}
