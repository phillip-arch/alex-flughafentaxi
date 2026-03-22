'use client';

import { Calendar, ChevronDown, Clock, PlaneLanding, PlaneTakeoff, X } from 'lucide-react';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import SectionIntro from '@/components/ui/SectionIntro';
import { BOOKING_FORM_CARD_CLASS, BOOKING_FORM_INPUT_CLASS } from '@/lib/ui/bookingFormStyles';

type AdminBookingEditModalProps = {
  editingBooking: any;
  setEditingBooking: (value: any | null) => void;
  handleSaveBookingEdit: (event?: React.FormEvent, sendToDriver?: boolean) => void | Promise<void>;
  adminEditMetaCardClass: string;
  adminEditSectionLabelClass: string;
  adminEditChoiceCardBaseClass: string;
  adminEditSelectClass: string;
  adminEditMetricCardClass: string;
  adminEditMetricSelectClass: string;
  adminIconCloseButtonClass: string;
  editDirection: 'to_airport' | 'from_airport' | null;
  handleEditDirectionChange: (direction: 'to_airport' | 'from_airport') => void;
  editFlightNumber: string;
  setEditFlightNumber: (value: string) => void;
  editAddress: string;
  handleEditAddressChange: (value: string) => void;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  editExtraStop: boolean;
  setEditExtraStop: (value: boolean) => void;
  editExtraStopAddress: string;
  handleExtraStopAddressChange: (value: string) => void;
  isEditDatePickerOpen: boolean;
  setIsEditDatePickerOpen: (value: boolean) => void;
  isEditTimePickerOpen: boolean;
  setIsEditTimePickerOpen: (value: boolean) => void;
  editDate: string;
  setEditDate: (value: string) => void;
  editTime: string;
  setEditTime: (value: string) => void;
  editChildSeat: boolean;
  setEditChildSeat: (value: boolean) => void;
  editBabySeats: number;
  setEditBabySeats: (value: number) => void;
  editChildSeats: number;
  setEditChildSeats: (value: number) => void;
  editBoosterSeats: number;
  setEditBoosterSeats: (value: number) => void;
  editPaymentMethod: 'cash' | 'card' | 'voucher' | 'free' | null;
  setEditPaymentMethod: (value: 'cash' | 'card' | 'voucher' | 'free' | null) => void;
  editHandLuggage: number;
  setEditHandLuggage: (value: number) => void;
  savingEdit: boolean;
  adminSecondaryButtonClass: string;
  adminPrimaryButtonClass: string;
};

export default function AdminBookingEditModal({
  editingBooking,
  setEditingBooking,
  handleSaveBookingEdit,
  adminEditMetaCardClass,
  adminEditSectionLabelClass,
  adminEditChoiceCardBaseClass,
  adminEditSelectClass,
  adminEditMetricCardClass,
  adminEditMetricSelectClass,
  adminIconCloseButtonClass,
  editDirection,
  handleEditDirectionChange,
  editFlightNumber,
  setEditFlightNumber,
  editAddress,
  handleEditAddressChange,
  editForm,
  setEditForm,
  editExtraStop,
  setEditExtraStop,
  editExtraStopAddress,
  handleExtraStopAddressChange,
  isEditDatePickerOpen,
  setIsEditDatePickerOpen,
  isEditTimePickerOpen,
  setIsEditTimePickerOpen,
  editDate,
  setEditDate,
  editTime,
  setEditTime,
  editChildSeat,
  setEditChildSeat,
  editBabySeats,
  setEditBabySeats,
  editChildSeats,
  setEditChildSeats,
  editBoosterSeats,
  setEditBoosterSeats,
  editPaymentMethod,
  setEditPaymentMethod,
  editHandLuggage,
  setEditHandLuggage,
  savingEdit,
  adminSecondaryButtonClass,
  adminPrimaryButtonClass,
}: AdminBookingEditModalProps) {
  if (!editingBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => handleSaveBookingEdit(e, true)}
        className={`relative max-h-[90vh] w-full max-w-[700px] overflow-y-auto ${BOOKING_FORM_CARD_CLASS} overflow-hidden shadow-xl`}
      >
        <div className="space-y-6 rounded-[1.9rem] border border-[#e9edf3] bg-white p-4 shadow-[0_18px_54px_rgba(17,17,17,0.12)] md:p-6">
          <div className="rounded-[1.5rem] border border-[#e9edf3] bg-[#f8fbff] px-4 py-4 md:px-5">
            <div className="flex items-start justify-between gap-4">
              <SectionIntro
                eyebrow="Bearbeiten"
                title="Fahrt bearbeiten"
                description="Bitte pruefen und aktualisieren Sie die Buchungsdaten."
                className="max-w-[28rem] text-left"
              />
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className={`${adminIconCloseButtonClass} shrink-0 self-start`}
                aria-label="Bearbeitungsfenster schliessen"
              >
                <X size={14} strokeWidth={2.25} className="translate-y-[1px]" />
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-between ${adminEditMetaCardClass}`}>
            <div className="text-[#111827]">
              <p className={adminEditSectionLabelClass}>Buchung</p>
              <p className="mt-2 text-[0.98rem] font-semibold">{editForm.id?.slice(0, 8)}</p>
            </div>
            <span className="rounded-full border border-[#dbe7f8] bg-white px-3 py-1 text-[0.82rem] font-semibold text-[#1679ff]">
              Admin
            </span>
          </div>

          <div className="space-y-4">
            <p className={adminEditSectionLabelClass}>Fahrt</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleEditDirectionChange('to_airport')}
                  className={`${adminEditChoiceCardBaseClass} ${
                    editDirection === 'to_airport'
                      ? 'border-[#1679ff] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)]'
                      : 'border-[#e9edf3] text-[#111827] hover:border-[#cfd7e3]'
                  }`}
                >
                  <PlaneTakeoff size={24} className={editDirection === 'to_airport' ? 'text-[#1679ff]' : 'text-[#7b8798]'} />
                  <span className={`text-[0.95rem] font-medium ${editDirection === 'to_airport' ? 'text-[#1679ff]' : 'text-[#111827]'}`}>Zum Flughafen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEditDirectionChange('from_airport')}
                  className={`${adminEditChoiceCardBaseClass} ${
                    editDirection === 'from_airport'
                      ? 'border-[#1679ff] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)]'
                      : 'border-[#e9edf3] text-[#111827] hover:border-[#cfd7e3]'
                  }`}
                >
                  <PlaneLanding size={24} className={editDirection === 'from_airport' ? 'text-[#1679ff]' : 'text-[#7b8798]'} />
                  <span className={`text-[0.95rem] font-medium ${editDirection === 'from_airport' ? 'text-[#1679ff]' : 'text-[#111827]'}`}>Vom Flughafen</span>
                </button>
              </div>
              {editDirection ? (
                <div className="space-y-4">
                  {editDirection === 'from_airport' ? (
                    <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Flugnummer (z.B. OS123)" value={editFlightNumber} onChange={(e) => setEditFlightNumber(e.target.value)} />
                  ) : null}
                  <p className={adminEditSectionLabelClass}>Adresse</p>
                  <input
                    className={BOOKING_FORM_INPUT_CLASS}
                    placeholder="Adresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                    value={editAddress}
                    onChange={(e) => handleEditAddressChange(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Abholung" value={editForm.pickup} onChange={(e) => setEditForm((p: any) => ({ ...p, pickup: e.target.value }))} />
                  <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Ziel" value={editForm.destination} onChange={(e) => setEditForm((p: any) => ({ ...p, destination: e.target.value }))} />
                </>
              )}

              <div className={`flex items-center justify-between ${adminEditMetaCardClass}`}>
                <div className="text-[#111827]">
                  <p className="text-[0.98rem] font-medium">Zusaetzlicher Stopp?</p>
                  <p className="text-[0.85rem] text-[#6a7d96]">+10 EUR Aufpreis</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={editExtraStop} onChange={(e) => setEditExtraStop(e.target.checked)} className="peer sr-only" />
                  <div className="h-[31px] w-[51px] rounded-full bg-[#e9e9ea] peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] peer-checked:after:translate-x-full after:absolute after:left-[2px] after:top-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-['']" />
                </label>
              </div>

              {editExtraStop ? (
                <div className="animate-in slide-in-from-top-2 fade-in space-y-4 duration-300">
                  <p className={adminEditSectionLabelClass}>Adresse Zwischenstopp</p>
                  <input
                    className={BOOKING_FORM_INPUT_CLASS}
                    placeholder="Zusatzadresse eingeben, z.B. Mustergasse 12, 1010 Wien"
                    value={editExtraStopAddress}
                    onChange={(e) => handleExtraStopAddressChange(e.target.value)}
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block ${adminEditSectionLabelClass}`}>Datum</label>
                  <div className="relative" onClick={() => setIsEditDatePickerOpen(true)}>
                    <input type="text" value={editDate} readOnly placeholder="TT.MM.JJJJ" className={`${BOOKING_FORM_INPUT_CLASS} cursor-pointer`} />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                  </div>
                </div>
                <div>
                  <label className={`mb-2 block ${adminEditSectionLabelClass}`}>Zeit</label>
                  <div className="relative" onClick={() => setIsEditTimePickerOpen(true)}>
                    <input type="text" value={editTime} readOnly placeholder="--:--" className={`${BOOKING_FORM_INPUT_CLASS} cursor-pointer`} />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
                  </div>
                </div>
              </div>

              <DatePicker isOpen={isEditDatePickerOpen} onClose={() => setIsEditDatePickerOpen(false)} onSelect={(value) => setEditDate(value)} selectedDate={editDate} />
              <TimePicker isOpen={isEditTimePickerOpen} onClose={() => setIsEditTimePickerOpen(false)} onSelect={(value) => setEditTime(value)} selectedTime={editTime} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select className={adminEditSelectClass} value={editForm.vehicle_type || 'Limo'} onChange={(e) => setEditForm((p: any) => ({ ...p, vehicle_type: e.target.value }))}>
                  <option value="Limo">Limo</option>
                  <option value="Kombi">Kombi</option>
                  <option value="Bus">Bus</option>
                </select>
                <input className={BOOKING_FORM_INPUT_CLASS} type="number" min={0} step="0.01" value={editForm.price} onChange={(e) => setEditForm((p: any) => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Personen</span>
              <select className={adminEditMetricSelectClass} value={editForm.passengers} onChange={(e) => setEditForm((p: any) => ({ ...p, passengers: Number(e.target.value) }))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Koffer</span>
              <select className={adminEditMetricSelectClass} value={editForm.luggage} onChange={(e) => setEditForm((p: any) => ({ ...p, luggage: Number(e.target.value) }))}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className={`${adminEditMetricCardClass} flex flex-col items-center justify-center gap-2`}>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">Handgepaeck</span>
              <select className={adminEditMetricSelectClass} value={editHandLuggage} onChange={(e) => setEditHandLuggage(Number(e.target.value))}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className={`flex flex-col gap-4 ${adminEditMetaCardClass}`}>
            <div className="flex items-center justify-between">
              <div className="text-[#111827]">
                <p className="text-[0.98rem] font-medium">Kindersitz benoetigt?</p>
                <p className="text-[0.85rem] text-[#6a7d96]">Kostenlos inklusive</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={editChildSeat} onChange={(e) => setEditChildSeat(e.target.checked)} className="peer sr-only" />
                <div className="h-[31px] w-[51px] rounded-full bg-[#e9e9ea] peer-checked:bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] peer-checked:after:translate-x-full after:absolute after:left-[2px] after:top-[2px] after:h-[27px] after:w-[27px] after:rounded-full after:border after:border-gray-300 after:bg-white after:shadow-sm after:transition-all after:content-['']" />
              </label>
            </div>

            {editChildSeat ? (
              <div className="animate-in slide-in-from-top-2 fade-in grid grid-cols-3 gap-3 border-t border-[#dbe7f8] pt-3 duration-300">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Babyschale</label>
                  <div className="relative">
                    <select value={editBabySeats} onChange={(e) => setEditBabySeats(Number(e.target.value))} className="ui-input appearance-none py-2 pr-8">
                      {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#86868b]">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Kindersitz</label>
                  <div className="relative">
                    <select value={editChildSeats} onChange={(e) => setEditChildSeats(Number(e.target.value))} className="ui-input appearance-none py-2 pr-8">
                      {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#86868b]">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1679ff]">Sitzerhoehung</label>
                  <div className="relative">
                    <select value={editBoosterSeats} onChange={(e) => setEditBoosterSeats(Number(e.target.value))} className="ui-input appearance-none py-2 pr-8">
                      {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#86868b]">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className={adminEditSectionLabelClass}>Kunde</p>
            <div className="space-y-4">
              <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Vollständiger Name" value={editForm.full_name} onChange={(e) => setEditForm((p: any) => ({ ...p, full_name: e.target.value }))} />
              <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Telefonnummer" value={editForm.phone} onChange={(e) => setEditForm((p: any) => ({ ...p, phone: e.target.value }))} />
              <input className={BOOKING_FORM_INPUT_CLASS} placeholder="E-Mail" type="email" value={editForm.email} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-3">
            <p className={adminEditSectionLabelClass}>Zahlung</p>
            <div className="relative">
              <select
                value={editPaymentMethod || ''}
                onChange={(e) => setEditPaymentMethod(e.target.value ? (e.target.value as 'cash' | 'card' | 'voucher' | 'free') : null)}
                className={adminEditSelectClass}
              >
                <option value="">Zahlungsart waehlen</option>
                <option value="cash">Barzahlung</option>
                <option value="card">Kreditkarte</option>
                <option value="voucher">Lieferschein</option>
                <option value="free">Gratis</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className={adminEditSectionLabelClass}>Notiz</p>
            <textarea className={`${BOOKING_FORM_INPUT_CLASS} min-h-[90px]`} placeholder="Notizen" value={editForm.notes} onChange={(e) => setEditForm((p: any) => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setEditingBooking(null)} className={adminIconCloseButtonClass} aria-label="Bearbeiten schliessen">
              <X size={14} strokeWidth={2.25} className="translate-y-[1px]" />
            </button>
            <button type="button" disabled={savingEdit} onClick={() => handleSaveBookingEdit(undefined, false)} className={`flex-1 ${adminSecondaryButtonClass}`}>
              {savingEdit ? 'Speichern...' : 'Nur speichern'}
            </button>
            <button type="submit" disabled={savingEdit} className={`flex-1 ${adminPrimaryButtonClass}`}>
              {savingEdit ? 'Speichern...' : 'Speichern & senden'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
