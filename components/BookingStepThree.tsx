'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BookingPriceSummaryCard from '@/components/BookingPriceSummaryCard';
import { BOOKING_FIELD_LABEL_CLASS, BOOKING_FIELD_STACK_CLASS } from '@/lib/ui/bookingFormStyles';

type BookingStepThreeProps = {
  formData: any;
  totalPrice: number | null;
  vehicleType: string;
  isLoggedIn: boolean;
  error: string | null;
  loading: boolean;
  handleBookingForMyselfToggle: (checked: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
  const contactInputClass = '!min-h-[2.43rem] !py-[0.5rem] md:!min-h-[1.94rem] md:!py-[0.4rem]';

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip flex flex-1 min-h-0 flex-col">
      <div className="space-y-2.5 min-h-0 flex-1 md:overflow-y-auto">
      <BookingPriceSummaryCard formData={formData} totalPrice={totalPrice} vehicleType={vehicleType} />

      {isLoggedIn ? (
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="text-[15px] font-medium text-[var(--paper)]">Booking for myself</p>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={formData.bookingForMyself}
              onChange={(e) => handleBookingForMyselfToggle(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-[22px] w-[36px] rounded-full bg-[rgba(255,255,255,.16)] peer peer-checked:bg-[var(--amber)] peer-focus:outline-none peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-[18px] after:w-[18px] after:rounded-full after:border after:border-gray-300 after:bg-[var(--panel)] after:shadow-sm after:transition-all after:content-['']"></div>
          </label>
        </div>
      ) : null}

      <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 md:gap-y-2.5">
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
            placeholder=""
            className={`${getInputClassName('fullName')} ${contactInputClass}`}
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
            placeholder=""
            className={`${getInputClassName('phone')} ${contactInputClass}`}
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
            placeholder=""
            className={`${getInputClassName('email')} ${contactInputClass}`}
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
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-[0.59rem] transition-all duration-200 md:gap-[0.35rem] md:py-[0.52rem] ${
              formData.paymentMethod === 'cash'
                ? 'border-[var(--amber)] bg-[rgba(255,255,255,.045)] text-[var(--amber)] ring-2 ring-inset ring-[var(--amber)]'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[var(--red)] bg-[rgba(232,106,106,.10)] text-[var(--red)]'
                  : 'border-[var(--line)] bg-[var(--panel)] text-[var(--paper)] hover:border-[var(--muted)]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Cash</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaymentChange('card')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-[0.59rem] transition-all duration-200 md:gap-[0.35rem] md:py-[0.52rem] ${
              formData.paymentMethod === 'card'
                ? 'border-[var(--amber)] bg-[rgba(255,255,255,.045)] text-[var(--amber)] ring-2 ring-inset ring-[var(--amber)]'
                : touched['paymentMethod'] && !formData.paymentMethod
                  ? 'border-[var(--red)] bg-[rgba(232,106,106,.10)] text-[var(--red)]'
                  : 'border-[var(--line)] bg-[var(--panel)] text-[var(--paper)] hover:border-[var(--muted)]'
            }`}
          >
            <span className="text-[14px] font-medium md:text-[12px]">Credit card</span>
          </button>
        </div>
      </div>

      <p className="text-left text-[12px] leading-[1.5] text-[var(--muted)] md:text-[13px]">
        By booking, you accept our{' '}
        <Link href={agbHref} className="font-medium !text-[var(--amber)] underline underline-offset-2 hover:!text-[var(--amber-deep)]">
          Terms and Conditions
        </Link>{' '}
        and{' '}
        <Link
          href={privacyHref}
          className="font-medium !text-[var(--amber)] underline underline-offset-2 hover:!text-[var(--amber-deep)]"
        >
          Privacy Policy
        </Link>
        . Your data is used only to carry out the ride.
      </p>
      </div>

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
