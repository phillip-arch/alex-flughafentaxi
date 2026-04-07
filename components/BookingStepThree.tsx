'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const currentLang = searchParams.get('lang')?.toLowerCase() === 'en' ? 'en' : 'de';
  const agbHref = `/agb?lang=${currentLang}`;
  const privacyHref = `/datenschutz?lang=${currentLang}`;
  const termsLabel = currentLang === 'en' ? 'Terms and Conditions' : 'AGB';
  const privacyLabel = currentLang === 'en' ? 'Privacy Policy' : 'Datenschutzerklärung';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-4 text-center">
        <h2 className="mb-2 text-[15px] font-semibold leading-tight tracking-[-0.04em] text-[#111111]">
          Uebersicht
        </h2>
        <p className="text-[12px] text-[#6d7075]">Bitte ueberpruefen Sie Ihre Daten.</p>
      </div>

      <div className="rounded-[22px] border border-[#d8d4ca] bg-[#fbfaf8] p-4 text-left shadow-[0_10px_28px_rgba(17,17,17,0.05)] md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7075]">
              Gesamtpreis
            </p>
            <p className="mt-1 text-[46px] font-semibold leading-none tracking-[-0.05em] text-[#0a63ff] md:text-[52px]">
              {totalPrice} EUR
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#1679FF] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Fixpreis
          </span>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
                  Datum
                </p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">{dateSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
                  Strasse
                </p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">{streetSummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
                  Personen
                </p>
                <p className="mt-0.5 text-[14px] font-medium text-[#1d1d1f]">
                  {formData.passengers || 0} Personen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Car size={15} className="mt-0.5 text-[#0a63ff]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b]">
                  Fahrzeug
                </p>
                <p className="mt-0.5 text-[14px] font-medium leading-[1.35] text-[#1d1d1f]">
                  {vehicleType} | {formData.luggage || 0} Koffer | {formData.handLuggage || 0}{' '}
                  Handgepaeck
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="flex flex-col gap-4 rounded-xl bg-[#f5f5f7] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[#1d1d1f]">
                <p className="text-[15px] font-medium">Buchung fuer mich</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.bookingForMyself}
                onChange={(e) => handleBookingForMyselfToggle(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-[31px] w-[51px] rounded-full bg-[#e9e9ea] peer peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] peer-focus:outline-none peer-checked:after:translate-x-[20px] peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-['']"></div>
            </label>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Name"
            className={getInputClassName('fullName')}
          />
        </div>
        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Telefonnummer"
            className={getInputClassName('phone')}
          />
        </div>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="E-Mail"
            className={getInputClassName('email')}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 ml-1 text-[12px] font-medium uppercase tracking-wide text-[#86868b]">
          Zahlung
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePaymentChange('cash')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
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
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
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
          className="ui-field-surface w-full resize-none rounded-[var(--radius-field)] border border-[#d2d2d7] p-3 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] md:p-[0.8rem]"
        />
      </div>

      <div className="hidden rounded-[24px] border border-[#d8d4ca] bg-[linear-gradient(180deg,#faf8f4_0%,#f5f5f7_100%)] p-6 shadow-[0_20px_50px_rgba(17,17,17,0.06)] md:p-8">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#86868b]">
          Gesamtpreis
        </p>
        <p className="mb-4 text-[48px] font-semibold leading-none tracking-tight text-[#1d1d1f]">
          {totalPrice} {'\u20AC'}
        </p>
        <div className="mb-6 flex items-center justify-center gap-2 text-[14px] font-medium text-[#1d1d1f]">
          {formData.direction === 'to_airport' ? (
            <>
              <span>
                {formData.zip} {formData.city}
              </span>
              <ChevronRight size={14} className="text-[#86868b]" />
              <span>Flughafen VIE</span>
            </>
          ) : (
            <>
              <span>Flughafen VIE</span>
              <ChevronRight size={14} className="text-[#86868b]" />
              <span>
                {formData.zip} {formData.city}
              </span>
            </>
          )}
        </div>
        <div className="mx-auto max-w-[320px] rounded-[16px] border border-[#d2d2d7]/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5" title="Handgepaeck">
            <Car size={18} className="text-[#0071e3]" />
            <span>Fahrzeug: {vehicleType}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-medium text-[#86868b]">
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
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ffd4d8] bg-[#fff2f4] p-3 text-[14px] font-medium text-[#d70015]">
          <span className="block h-1.5 w-1.5 rounded-full bg-[#d70015]" />
          {error}
        </div>
      ) : null}

      <div className={actionRowClass}>
        <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
          <ChevronLeft size={24} />
        </button>
        <button type="submit" disabled={loading} className={`${primaryActionButtonClass} disabled:opacity-50`}>
          {loading ? 'Wird gebucht...' : 'Jetzt Fahrt sichern'}
        </button>
      </div>

      <p className="mt-4 text-left text-[12px] leading-[1.5] text-[#5f6975] md:text-[13px]">
        Mit der Buchung akzeptieren Sie unsere{' '}
        <Link href={agbHref} className="font-medium !text-[#1678ff] underline underline-offset-2 hover:!text-[#0f5fcc]">
          {termsLabel}
        </Link>{' '}
        und{' '}
        <Link
          href={privacyHref}
          className="font-medium !text-[#1678ff] underline underline-offset-2 hover:!text-[#0f5fcc]"
        >
          {privacyLabel}
        </Link>
        . Ihre Daten werden ausschließlich zur Durchführung der Fahrt verwendet.
      </p>
    </div>
  );
}
