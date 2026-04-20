'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, NotebookPen, X } from 'lucide-react';
import BookingPriceSummaryCard from '@/components/BookingPriceSummaryCard';
import { BOOKING_OVERLAY_BACKDROP_CLASS } from './bookingOverlayStyles';

type BookingStepThreeProps = {
  formData: any;
  totalPrice: number;
  vehicleType: string;
  isLoggedIn: boolean;
  error: string | null;
  loading: boolean;
  handleBookingForMyselfToggle: (checked: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNotesChange: (notes: string) => void;
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

const STEP_THREE_FIELD_LABEL_CLASS =
  'ml-1 block text-[12px] font-medium uppercase tracking-wide text-[#6d7075]';

export default function BookingStepThree({
  formData,
  totalPrice,
  vehicleType,
  isLoggedIn,
  error,
  loading,
  handleBookingForMyselfToggle,
  handleChange,
  handleNotesChange,
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
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [draftNotes, setDraftNotes] = useState(formData.notes || '');
  const hasDriverNote = Boolean(formData.notes?.trim());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isNoteModalOpen) {
      setDraftNotes(formData.notes || '');
    }
  }, [isNoteModalOpen, formData.notes]);

  useEffect(() => {
    if (!isNoteModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNoteModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNoteModalOpen]);

  const saveDriverNote = () => {
    handleNotesChange(draftNotes);
    setIsNoteModalOpen(false);
  };

  const noteModal =
    isNoteModalOpen && isMounted
      ? createPortal(
          <div
            className={`${BOOKING_OVERLAY_BACKDROP_CLASS} z-[10000] flex items-end px-0 md:items-center md:justify-center md:px-4`}
            role="dialog"
            aria-modal="true"
            aria-label="Driver note"
          >
            <button
              type="button"
              aria-label="Close driver note"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setIsNoteModalOpen(false)}
            />
            <div className="relative w-full animate-in slide-in-from-bottom-8 duration-200 rounded-t-[1.5rem] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_60px_rgba(17,17,17,0.2)] md:max-w-[32rem] md:rounded-[1.5rem] md:px-6 md:py-6 md:shadow-[0_24px_80px_rgba(17,17,17,0.22)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9dee7] md:hidden" />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[#111827]">
                    Note for the driver
                  </h3>
                  <p className="mt-1 text-[0.92rem] text-[#6d7075]">
                    Add pickup details, luggage notes, or anything the driver should know.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e4e8ef] bg-white text-[#111827]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <textarea
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
                rows={5}
                placeholder="Add your note here"
                className="ui-field-surface w-full resize-none rounded-[var(--radius-field)] border border-[#d2d2d7] p-3 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#7fb3ff] focus:bg-white focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)]"
              />
              <button
                type="button"
                onClick={saveDriverNote}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-[var(--radius-field)] bg-[#1F7CFF] text-[1rem] font-semibold text-white transition-colors hover:bg-[#176be0]"
              >
                Save
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
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

      <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
        <div className="relative flex flex-col gap-2 md:col-span-2">
          <label htmlFor="fullName" className={STEP_THREE_FIELD_LABEL_CLASS}>
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
        <div className="relative flex flex-col gap-2">
          <label htmlFor="phone" className={STEP_THREE_FIELD_LABEL_CLASS}>
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
        <div className="relative flex flex-col gap-2">
          <label htmlFor="email" className={STEP_THREE_FIELD_LABEL_CLASS}>
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

      <div className="flex flex-col gap-2">
        <p className={STEP_THREE_FIELD_LABEL_CLASS}>
          Payment
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePaymentChange('cash')}
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'cash'
                ? 'border-[#7fb3ff] bg-[#f8fbff] text-[#1F7CFF] ring-2 ring-inset ring-[#7fb3ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)]'
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
            className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-field)] border py-3 transition-all duration-200 md:gap-[0.4rem] md:py-[0.6rem] ${
              formData.paymentMethod === 'card'
                ? 'border-[#7fb3ff] bg-[#f8fbff] text-[#1F7CFF] ring-2 ring-inset ring-[#7fb3ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_2px_rgba(127,179,255,0.12)]'
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

      <button
        type="button"
        onClick={() => setIsNoteModalOpen(true)}
        className="inline-flex items-center gap-2 text-left text-[14px] font-medium text-[#1F7CFF] transition-colors hover:text-[#176be0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb3ff] focus-visible:ring-offset-2"
      >
        <NotebookPen size={17} strokeWidth={2.2} />
        {hasDriverNote ? 'Edit note for the driver' : 'Add a note for the driver (optional)'}
      </button>

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

      {noteModal}
    </div>
  );
}
