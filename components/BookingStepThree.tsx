'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BookingPriceSummaryCard from '@/components/BookingPriceSummaryCard';
import { BOOKING_FIELD_LABEL_CLASS, BOOKING_FIELD_STACK_CLASS } from '@/lib/ui/bookingFormStyles';

type BookingStepThreeProps = {
  formData: any;
  totalPrice: number;
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
  actionButtonGroupClass: string;
  actionTrustLine: React.ReactNode;
  secondaryBackButtonClass: string;
  primaryActionButtonClass: string;
};

export default function BookingStepThree({
  formData,
  totalPrice,
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
  actionButtonGroupClass,
  actionTrustLine,
  secondaryBackButtonClass,
  primaryActionButtonClass,
}: BookingStepThreeProps) {
  const searchParams = useSearchParams();
  const currentLang = searchParams.get('lang')?.toLowerCase() === 'de' ? 'de' : 'en';
  const agbHref = `/agb?lang=${currentLang}`;
  const privacyHref = `/datenschutz?lang=${currentLang}`;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4 md:space-y-3.5">
      <BookingPriceSummaryCard formData={formData} totalPrice={totalPrice} vehicleType={vehicleType} />

      {isLoggedIn ? (
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="text-[15px] font-medium text-[#1d1d1f]">Booking for myself</p>
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
      ) : null}

      <div className="grid gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-3">
        <div className={`relative md:col-span-2 ${BOOKING_FIELD_STACK_CLASS}`}>
          <label htmlFor="fullName" className={BOOKING_FIELD_LABEL_CLASS}>
            Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder=""
            className={getInputClassName('fullName')}
          />
        </div>
        <div className={`relative ${BOOKING_FIELD_STACK_CLASS}`}>
          <label htmlFor="phone" className={BOOKING_FIELD_LABEL_CLASS}>
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder=""
            className={getInputClassName('phone')}
          />
        </div>
        <div className={`relative ${BOOKING_FIELD_STACK_CLASS}`}>
          <label htmlFor="email" className={BOOKING_FIELD_LABEL_CLASS}>
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder=""
            className={getInputClassName('email')}
          />
        </div>
      </div>

      <div className={BOOKING_FIELD_STACK_CLASS}>
        <p className={BOOKING_FIELD_LABEL_CLASS}>
          Payment
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePaymentChange('cash')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.35rem] md:py-[0.55rem] ${
              formData.paymentMethod === 'cash'
                ? 'border-[#7fb3ff] bg-[#f8fbff] text-[#1F7CFF] ring-2 ring-inset ring-[#7fb3ff]'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Cash</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentChange('card')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.35rem] md:py-[0.55rem] ${
              formData.paymentMethod === 'card'
                ? 'border-[#7fb3ff] bg-[#f8fbff] text-[#1F7CFF] ring-2 ring-inset ring-[#7fb3ff]'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[#d70015] bg-[#fff2f4] text-[#d70015]'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Credit card</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#ffd4d8] bg-[#fff2f4] p-3 text-[14px] font-medium text-[#d70015]">
          <span className="block h-1.5 w-1.5 rounded-full bg-[#d70015]" />
          {error}
        </div>
      ) : null}

      <p className="mt-3 text-left text-[12px] leading-[1.5] text-[#5f6975] md:text-[13px]">
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
        <div className={actionButtonGroupClass}>
          <button type="button" onClick={prevStep} className={secondaryBackButtonClass}>
            <ChevronLeft size={24} />
          </button>
          <button type="submit" disabled={loading} className={`${primaryActionButtonClass} disabled:opacity-50`}>
            {loading ? 'Booking...' : 'Secure ride now'}
          </button>
        </div>
        {actionTrustLine}
      </div>
    </div>
  );
}
