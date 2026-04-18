'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Briefcase, ChevronLeft, ShoppingBag, Users } from 'lucide-react';
import { formatVehicleTypeLabel } from '@/lib/pricing';

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
  const currentLang = searchParams.get('lang')?.toLowerCase() === 'de' ? 'de' : 'en';
  const agbHref = `/agb?lang=${currentLang}`;
  const privacyHref = `/datenschutz?lang=${currentLang}`;
  const cityLabel = formData.city?.trim() || formData.zip?.trim() || 'Pickup';
  const compactRoute =
    formData.direction === 'to_airport' ? `${cityLabel} \u2192 VIE` : `VIE \u2192 ${cityLabel}`;
  const vehicleLabel = formatVehicleTypeLabel(vehicleType);
  const vehicleImage =
    vehicleType === 'Bus'
      ? {
          src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/bus.jpg',
          alt: 'Airport taxi minivan',
        }
      : vehicleType === 'Kombi'
        ? {
            src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/kombi.jpg',
            alt: 'Airport taxi station wagon',
          }
        : {
            src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/limo.jpg',
            alt: 'Airport taxi sedan',
          };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid min-h-[7rem] grid-cols-[30%_70%] overflow-hidden rounded-[1.05rem] border border-[#dbe7f8] bg-[#f8fbff] shadow-[0_12px_28px_rgba(17,17,17,0.05)]">
        <div className="relative flex items-center justify-center bg-transparent px-2 py-3">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[0.9rem] border border-[#dbe7f8] bg-white shadow-[0_10px_24px_rgba(17,17,17,0.06)] md:h-24 md:w-36">
            <Image
              src={vehicleImage.src}
              alt={vehicleImage.alt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 144px, 112px"
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-2 px-4 py-4 text-left md:px-5">
          <p className="truncate text-[1.05rem] font-semibold leading-tight tracking-[-0.03em] text-[#111827] md:text-[1.18rem]">
            {compactRoute}
          </p>
          <p className="text-[0.95rem] font-semibold leading-none tracking-[-0.03em] text-[#1F7CFF] md:text-[1.02rem]">
            {vehicleLabel}
          </p>
          <p className="text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-[#111827] md:text-[2rem]">
            {totalPrice} EUR
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.86rem] font-medium text-[#5f6975]">
            <span className="inline-flex items-center gap-1" title="Passengers">
              <Users size={15} className="text-[#1F7CFF]" />
              {formData.passengers || 0}
            </span>
            <span className="text-[#b7bec8]">|</span>
            <span className="inline-flex items-center gap-1" title="Suitcases">
              <Briefcase size={15} className="text-[#1F7CFF]" />
              {formData.luggage || 0}
            </span>
            <span className="text-[#b7bec8]">|</span>
            <span className="inline-flex items-center gap-1" title="Hand luggage">
              <ShoppingBag size={15} className="text-[#1F7CFF]" />
              {formData.handLuggage || 0}
            </span>
          </div>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="flex flex-col gap-4 rounded-xl border border-[#d2d2d7] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[#1d1d1f]">
                <p className="text-[15px] font-medium">Booking for myself</p>
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
            placeholder="Phone number"
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
          Payment
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePaymentChange('cash')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'cash'
                ? 'border-[#1F7CFF] bg-[#1F7CFF] text-white'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Cash payment</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentChange('card')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'card'
                ? 'border-[#1F7CFF] bg-[#1F7CFF] text-white'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Credit card</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Notes (optional)"
          className="ui-field-surface w-full resize-none rounded-[var(--radius-field)] border border-[#d2d2d7] p-3 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#7fb3ff] focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)] md:p-[0.8rem]"
        />
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ffd4d8] bg-[#fff2f4] p-3 text-[14px] font-medium text-[#d70015]">
          <span className="block h-1.5 w-1.5 rounded-full bg-[#d70015]" />
          {error}
        </div>
      ) : null}

      <p className="mt-4 text-left text-[12px] leading-[1.5] text-[#5f6975] md:text-[13px]">
        By booking, you accept our{' '}
        <Link href={agbHref} className="font-medium !text-[#1678ff] underline underline-offset-2 hover:!text-[#0f5fcc]">
          Terms and Conditions
        </Link>{' '}
        and{' '}
        <Link
          href={privacyHref}
          className="font-medium !text-[#1678ff] underline underline-offset-2 hover:!text-[#0f5fcc]"
        >
          Privacy Policy
        </Link>
        . Your data is used only to carry out the ride.
      </p>

      <div className={actionRowClass}>
        <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
          <ChevronLeft size={24} />
        </button>
        <button type="submit" disabled={loading} className={`${primaryActionButtonClass} disabled:opacity-50`}>
          {loading ? 'Booking...' : 'Secure ride now'}
        </button>
      </div>
    </div>
  );
}
