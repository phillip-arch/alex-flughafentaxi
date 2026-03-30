'use client';

import { ArrowUpDown, Briefcase, Calendar, Check, ChevronDown, Clock, MapPin, PlaneLanding, ShoppingBag, Users, X } from 'lucide-react';
import StreetAutocomplete from '@/components/address/StreetAutocomplete';
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
  editStreetInput: string;
  handleEditStreetInputChange: (value: string) => void;
  handleEditStreetSelect: (option: { street: string; zip: string; city: string }) => void;
  editZip: string;
  editCity: string;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  editExtraStop: boolean;
  setEditExtraStop: (value: boolean) => void;
  editExtraStopStreetInput: string;
  handleExtraStopStreetInputChange: (value: string) => void;
  handleExtraStopStreetSelect: (option: { street: string; zip: string; city: string }) => void;
  editExtraStopZip: string;
  editExtraStopCity: string;
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
  editStreetInput,
  handleEditStreetInputChange,
  handleEditStreetSelect,
  editZip,
  editCity,
  editForm,
  setEditForm,
  editExtraStop,
  setEditExtraStop,
  editExtraStopStreetInput,
  handleExtraStopStreetInputChange,
  handleExtraStopStreetSelect,
  editExtraStopZip,
  editExtraStopCity,
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
              <div className="-ml-2 rounded-[2rem] bg-transparent py-2 pl-2 pr-0 md:-mr-2 md:pr-0">
                <div className="flex gap-3 md:gap-4">
                  <div className="hidden w-[2.1rem] shrink-0 flex-col items-center pt-[1.25rem] md:flex">
                    <div className="flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-full bg-[#111111] text-white">
                      {editDirection === 'from_airport' ? <PlaneLanding size={13} /> : <MapPin size={13} />}
                    </div>
                    <div className="h-[3.4rem] w-px bg-[#111111]" />
                    <div className="-mt-0.5 flex h-[2.1rem] w-[2.1rem] items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a63ff_0%,#2490ff_100%)] text-white">
                      <Check size={13} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="min-h-[4.5rem]">
                      <p className="text-[11px] font-medium text-[#5f6975]">Abholung</p>
                      {editDirection === 'from_airport' ? (
                        <div className="mt-1 flex min-h-[3.25rem] items-start pt-[0.35rem]">
                          <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">
                            Flughafen Wien (VIE)
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1 min-h-[3.25rem] space-y-2">
                          <StreetAutocomplete
                            className={BOOKING_FORM_INPUT_CLASS}
                            placeholder="Strasse auswaehlen"
                            value={editStreetInput}
                            onChange={handleEditStreetInputChange}
                            onSelect={handleEditStreetSelect}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 min-h-[4.5rem]">
                      <p className="text-[11px] font-medium text-[#5f6975]">Ziel</p>
                      {editDirection === 'from_airport' ? (
                        <div className="mt-1 min-h-[3.25rem] space-y-2">
                          <StreetAutocomplete
                            className={BOOKING_FORM_INPUT_CLASS}
                            placeholder="Strasse auswaehlen"
                            value={editStreetInput}
                            onChange={handleEditStreetInputChange}
                            onSelect={handleEditStreetSelect}
                          />
                        </div>
                      ) : (
                        <div className="mt-1 flex min-h-[3.25rem] items-start pt-[0.35rem]">
                          <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#111111]">
                            Flughafen Wien (VIE)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="-mr-1 flex shrink-0 flex-col justify-start pt-[3.75rem] md:-mr-2">
                    <button
                      type="button"
                      onClick={() => handleEditDirectionChange(editDirection === 'from_airport' ? 'to_airport' : 'from_airport')}
                      className="inline-flex h-10 w-10 items-center justify-center text-[#111111] transition-opacity hover:opacity-60 md:h-8 md:w-8"
                      aria-label="Abholung und Ziel tauschen"
                    >
                      <ArrowUpDown size={16} className="-translate-x-[2px]" />
                    </button>
                  </div>
                </div>
              </div>

              {editDirection === 'from_airport' ? (
                <input className={BOOKING_FORM_INPUT_CLASS} placeholder="Flugnummer (z.B. OS123)" value={editFlightNumber} onChange={(e) => setEditFlightNumber(e.target.value)} />
              ) : null}

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
                  <StreetAutocomplete
                    className={BOOKING_FORM_INPUT_CLASS}
                    placeholder="Strasse auswaehlen"
                    value={editExtraStopStreetInput}
                    onChange={handleExtraStopStreetInputChange}
                    onSelect={handleExtraStopStreetSelect}
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className={adminEditSectionLabelClass}>Personen</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <Users size={18} />
                </span>
                <select
                  className={`${BOOKING_FORM_INPUT_CLASS} appearance-none !pl-[3.35rem] !pr-12`}
                  value={editForm.passengers}
                  onChange={(e) => setEditForm((p: any) => ({ ...p, passengers: Number(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <ChevronDown size={18} />
                </span>
              </div>
            </label>
            <label className="space-y-2">
              <span className={adminEditSectionLabelClass}>Koffer</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <Briefcase size={18} />
                </span>
                <select
                  className={`${BOOKING_FORM_INPUT_CLASS} appearance-none !pl-[3.35rem] !pr-12`}
                  value={editForm.luggage}
                  onChange={(e) => setEditForm((p: any) => ({ ...p, luggage: Number(e.target.value) }))}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <ChevronDown size={18} />
                </span>
              </div>
            </label>
            <label className="space-y-2">
              <span className={adminEditSectionLabelClass}>Handgepaeck</span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <ShoppingBag size={18} />
                </span>
                <select
                  className={`${BOOKING_FORM_INPUT_CLASS} appearance-none !pl-[3.35rem] !pr-12`}
                  value={editHandLuggage}
                  onChange={(e) => setEditHandLuggage(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8a94a3]">
                  <ChevronDown size={18} />
                </span>
              </div>
            </label>
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

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setEditingBooking(null)}
              className={`w-full whitespace-nowrap ${adminSecondaryButtonClass}`}
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={savingEdit}
              onClick={() => handleSaveBookingEdit(undefined, false)}
              className={`w-full min-h-[58px] whitespace-nowrap px-6 text-center ${adminSecondaryButtonClass}`}
            >
              {savingEdit ? 'Speichern...' : 'Nur speichern'}
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className={`w-full min-h-[58px] whitespace-nowrap px-6 text-center ${adminPrimaryButtonClass}`}
            >
              {savingEdit ? 'Speichern...' : 'Speichern & senden'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
