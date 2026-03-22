'use client';

import { format } from 'date-fns';
import {
  Briefcase,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  PlaneLanding,
  PlaneTakeoff,
  Send,
  Star,
  Users,
  X,
  XCircle,
} from 'lucide-react';

type AdminRidesPanelProps = {
  loading: boolean;
  bookings: any[];
  viewMode: 'grid' | 'table';
  notesPopup: { open: boolean; text: string };
  setNotesPopup: (value: { open: boolean; text: string }) => void;
  passengerCounts: Record<string, number>;
  drivers: any[];
  adminPrimaryButtonClass: string;
  adminSecondaryButtonClass: string;
  adminDangerButtonClass: string;
  isCancelledBooking: (status?: string) => boolean;
  getFlightNumberFromNotes: (booking: any) => string;
  getBookingPaymentMeta: (booking: any) => { label: string; className: string };
  formatRideLocation: (booking: any, value: string, role: 'pickup' | 'destination') => string;
  formatTableRouteAddress: (booking: any, value: string, role: 'pickup' | 'destination') => string;
  isAirportLocation: (value: string) => boolean;
  getGoogleMapsUrl: (value: string) => string;
  getTelHref: (value: string) => string;
  getMailtoHref: (value: string) => string;
  getSelectedDriverId: (booking: any) => string;
  getDriverSelectTone: (booking: any) => string;
  confirmAndSendToDriver: (bookingId: string, driverId: string) => Promise<void>;
  setDriverSelection: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  openEditBooking: (booking: any) => void;
  handleStatusChange: (bookingId: string, status: string) => Promise<void>;
  formatPriceDisplay: (price: any) => string;
  getBookingDisplayNotes: (booking: any) => string;
  getChildSeatCountsFromNotes: (booking: any) => { baby: number; child: number; booster: number };
  getHandLuggageCountFromNotes: (booking: any) => number;
};

export default function AdminRidesPanel({
  loading,
  bookings,
  viewMode,
  notesPopup,
  setNotesPopup,
  passengerCounts,
  drivers,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminDangerButtonClass,
  isCancelledBooking,
  getFlightNumberFromNotes,
  getBookingPaymentMeta,
  formatRideLocation,
  formatTableRouteAddress,
  isAirportLocation,
  getGoogleMapsUrl,
  getTelHref,
  getMailtoHref,
  getSelectedDriverId,
  getDriverSelectTone,
  confirmAndSendToDriver,
  setDriverSelection,
  openEditBooking,
  handleStatusChange,
  formatPriceDisplay,
  getBookingDisplayNotes,
  getChildSeatCountsFromNotes,
  getHandLuggageCountFromNotes,
}: AdminRidesPanelProps) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="py-12 text-center text-[#86868b]">Fahrten werden geladen...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-[24px] border border-[#d2d2d7] bg-white py-12 text-center text-[#86868b]">
          Keine Fahrten für dieses Datum gefunden.
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'space-y-4' : 'overflow-hidden border border-[#d2d2d7] bg-white'}>
            {viewMode === 'grid' ? (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`relative rounded-[24px] border border-[#d9dde4] bg-[#f8f9fb] p-4 shadow-sm transition-all hover:shadow-md md:p-5 ${
                    isCancelledBooking(booking.status) ? 'border-[#cfd4dc] bg-[#e5e7eb]' : ''
                  }`}
                >
                  <div className={`mb-4 flex flex-nowrap items-center gap-1 sm:gap-2 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                    <span className="inline-flex w-auto items-center justify-center whitespace-nowrap rounded-full bg-[#e7ebf3] px-2.5 py-1 text-[12px] font-semibold text-[#000000] sm:px-4 sm:text-[18px]">
                      {format(new Date(booking.pickup_at), 'HH:mm')}
                    </span>
                    <span className="inline-flex w-auto items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#e7ebf3] px-2.5 py-1 text-[12px] font-semibold tracking-wide text-[#000000] sm:gap-2 sm:px-4 sm:text-[18px]">
                      {booking.destination?.includes('Flughafen') ? <PlaneTakeoff size={14} className="sm:h-5 sm:w-5" /> : <PlaneLanding size={14} className="sm:h-5 sm:w-5" />}
                      {booking.destination?.includes('Flughafen') ? 'ZUM' : 'VOM'}
                    </span>
                    {(() => {
                      const flightNumber = getFlightNumberFromNotes(booking);
                      const isFromAirportRide = /flughafen/i.test(String(booking?.pickup || ''));
                      if (!isFromAirportRide || !flightNumber) return null;
                      return (
                        <span className="inline-flex w-auto items-center justify-center whitespace-nowrap rounded-full bg-[#e7ebf3] px-2.5 py-1 text-[12px] font-semibold text-[#000000] sm:px-4 sm:text-[18px]">
                          {flightNumber}
                        </span>
                      );
                    })()}
                    <span className="inline-flex w-auto items-center justify-center whitespace-nowrap rounded-full bg-[#e7ebf3] px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wide text-[#000000] sm:px-4 sm:text-[16px]">
                      {booking.vehicle_type || 'LIMOUSINE'}
                    </span>
                    {(() => {
                      const payment = getBookingPaymentMeta(booking);
                      return (
                        <span className={`inline-flex w-auto items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase ${payment.className} sm:gap-2 sm:px-4 sm:text-[16px]`}>
                          <CreditCard size={14} className="sm:h-[18px] sm:w-[18px]" /> {payment.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_0.95fr_0.8fr]">
                    <div className={`space-y-2.5 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                      <div className="flex items-stretch gap-2.5">
                        <div className="flex shrink-0 flex-col items-center pt-1 text-[#000000]" aria-hidden="true">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#000000]" />
                          <span className="my-1 w-px flex-1 bg-[#000000]" />
                          <ChevronDown size={14} />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2.5">
                          <div className="flex items-start gap-2">
                            <p className="line-clamp-2 text-[18px] font-semibold leading-snug text-[#081a42] md:text-[19px]">
                              {formatRideLocation(booking, booking.pickup, 'pickup')}
                            </p>
                            {!isAirportLocation(booking.pickup) ? (
                              <a
                                href={getGoogleMapsUrl(formatRideLocation(booking, booking.pickup, 'pickup'))}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open pickup in Google Maps"
                                className="mt-1 shrink-0 text-[#000000] transition-colors hover:text-[#000000]"
                              >
                                <MapPin size={21} />
                              </a>
                            ) : null}
                          </div>
                          <div className="flex items-start gap-2">
                            <p className="line-clamp-2 text-[18px] font-semibold leading-snug text-[#000000] md:text-[19px]">
                              {formatRideLocation(booking, booking.destination, 'destination')}
                            </p>
                            {!isAirportLocation(booking.destination) ? (
                              <a
                                href={getGoogleMapsUrl(formatRideLocation(booking, booking.destination, 'destination'))}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open destination in Google Maps"
                                className="mt-1 shrink-0 text-[#000000] transition-colors hover:text-[#000000]"
                              >
                                <MapPin size={21} />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const displayNotes = getBookingDisplayNotes(booking);
                        return displayNotes ? (
                          <div className="mt-2 max-w-[620px] rounded-[11px] border border-[#d2d2d7] bg-white px-3 py-2">
                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">Anmerkung</p>
                            <p className="line-clamp-3 text-[15px] leading-snug text-[#1d1d1f]">{displayNotes}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className={`space-y-4 lg:-mt-3 lg:pl-8 ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                      <h3 className="flex items-center gap-2 text-[19px] font-semibold text-[#000000]">
                        {booking.full_name}
                        {passengerCounts[booking.email] >= 5 && <Star size={15} className="fill-yellow-400 text-yellow-400" />}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#000000]">
                        <div className="flex min-w-0 items-center gap-2">
                          <a href={getTelHref(booking.phone)} aria-label="Call passenger" className="shrink-0 text-[#000000] transition-colors hover:text-[#0071e3]">
                            <Phone size={18} />
                          </a>
                          <span className="truncate">{booking.phone}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                          <a href={getMailtoHref(booking.email)} aria-label="Email passenger" className="shrink-0 text-[#000000] transition-colors hover:text-[#0071e3]">
                            <Mail size={18} />
                          </a>
                          <span className="truncate">{booking.email}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">
                          <Users size={14} /> {booking.passengers} PERS.
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">
                          <Briefcase size={14} /> {booking.luggage} KOFFER
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">
                          <Briefcase size={14} /> {getHandLuggageCountFromNotes(booking)} HANDG.
                        </span>
                        {(() => {
                          const seats = getChildSeatCountsFromNotes(booking);
                          return (
                            <>
                              {seats.baby > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">{seats.baby} BABYSCHALE</span> : null}
                              {seats.child > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">{seats.child} KINDERSITZ</span> : null}
                              {seats.booster > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7ebf3] px-3 py-1.5 text-[11px] font-semibold text-[#000000]">{seats.booster} Sitzerhöhung</span> : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex h-full flex-col gap-4">
                      <div className={`flex w-full flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}>
                        <button
                          type="button"
                          onClick={() => openEditBooking(booking)}
                          aria-label="Buchung bearbeiten"
                          className="z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#f8fbff] text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#eef5ff] hover:text-[#0a63ff] lg:absolute lg:right-5 lg:top-5"
                        >
                          <Edit size={16} />
                        </button>
                        <div className="text-right text-[30px] font-semibold leading-none text-[#081a42] sm:ml-auto">
                          {formatPriceDisplay(booking.price)}
                        </div>
                      </div>
                      <select
                        className={`w-full rounded-[11px] border px-3 py-2 text-[12px] outline-none focus:border-[#4f46e5] ${isCancelledBooking(booking.status) ? 'opacity-35' : ''} ${getDriverSelectTone(booking)}`}
                        value={getSelectedDriverId(booking)}
                        disabled={isCancelledBooking(booking.status)}
                        onChange={(e) => setDriverSelection((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                      >
                        <option value="">Fahrer zuweisen...</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (isCancelledBooking(booking.status)) return;
                            const driverId = getSelectedDriverId(booking);
                            if (!driverId) return;
                            await confirmAndSendToDriver(booking.id, driverId);
                          }}
                          disabled={!getSelectedDriverId(booking) || isCancelledBooking(booking.status)}
                          className={`w-full px-3 py-2 text-[0.85rem] ${adminPrimaryButtonClass} ${isCancelledBooking(booking.status) ? 'opacity-35' : ''}`}
                        >
                          <Send size={12} />
                          Senden
                        </button>
                        {isCancelledBooking(booking.status) ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Möchten Sie die Bestellung aktivieren?')) {
                                handleStatusChange(booking.id, 'pending');
                              }
                            }}
                            className={`w-full px-3 py-2 text-[0.85rem] shadow-none ${adminSecondaryButtonClass}`}
                          >
                            <CheckCircle size={12} />
                            Aktivieren
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Diese Fahrt jetzt stornieren?')) {
                                handleStatusChange(booking.id, 'cancelled');
                              }
                            }}
                            className={`w-full px-3 py-2 text-[0.85rem] ${adminDangerButtonClass}`}
                          >
                            Stornieren
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[930px] text-left text-[16px]">
                  <thead className="border-b border-[#d2d2d7] bg-[#f5f5f7] text-[10px] uppercase tracking-wide text-[#86868b]">
                    <tr>
                      <th className="px-1.5 py-1.5 text-center font-medium">Zeit / Datum</th>
                      <th className="px-0 py-1.5 text-center font-medium">Zum/Vom</th>
                      <th className="px-0 py-1.5 text-center font-medium">Fahrer</th>
                      <th className="px-0 py-1.5 text-center font-medium">Auto</th>
                      <th className="px-0 py-1.5 text-center font-medium">Route</th>
                      <th className="px-2 py-1.5 text-center font-medium">Fahrgast, Gepäck</th>
                      <th className="px-2 py-1.5 text-center font-medium">Kunde</th>
                      <th className="w-[80px] px-0 py-1.5 text-center font-medium">Zahlung</th>
                      <th className="w-[120px] px-2 py-1.5 text-center font-medium md:w-[56px] md:px-1.5">Notiz</th>
                      <th className="w-[120px] px-2 py-1.5 text-center font-medium md:w-[56px] md:px-1.5">Bearbeiten</th>
                      <th className="w-[120px] px-2 py-1.5 text-center font-medium md:w-[56px] md:px-1.5">X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const payment = getBookingPaymentMeta(booking);
                      const displayNotes = getBookingDisplayNotes(booking);
                      const handLuggage = getHandLuggageCountFromNotes(booking);
                      const seats = getChildSeatCountsFromNotes(booking);
                      const hasAnySeat = seats.baby > 0 || seats.child > 0 || seats.booster > 0;
                      const directionLabel = booking.destination?.includes('Flughafen') ? 'ZUM' : 'VOM';
                      const isCancelled = isCancelledBooking(booking.status);
                      return (
                        <tr key={booking.id} className={`border-b border-[#f0f0f2] transition-all ${isCancelled ? 'bg-[#e5e7eb]' : 'hover:bg-[#f5f5f7]/60'}`}>
                          <td className={`px-1.5 py-1 align-top text-center ${isCancelled ? 'opacity-35' : ''}`}>
                            <div className="flex min-h-[42px] flex-col items-center justify-between">
                              <div className="font-semibold text-[#1d1d1f]">{format(new Date(booking.pickup_at), 'HH:mm')}</div>
                              <div className="text-[16px] text-[#86868b]">{format(new Date(booking.pickup_at), 'dd/MM/yyyy')}</div>
                            </div>
                          </td>
                          <td className={`px-1.5 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                            <span className="inline-flex items-center text-[16px] font-semibold text-[#1d1d1f]">{directionLabel}</span>
                          </td>
                          <td className={`px-0 py-1 align-middle ${isCancelled ? 'opacity-35' : ''}`}>
                            <select
                              className={`w-22 rounded-[8px] border px-1 py-1 text-[16px] outline-none focus:border-[#0071e3] ${getDriverSelectTone(booking)}`}
                              value={getSelectedDriverId(booking)}
                              disabled={isCancelled}
                              onChange={async (e) => {
                                const nextDriverId = e.target.value;
                                setDriverSelection((prev) => ({ ...prev, [booking.id]: nextDriverId }));
                                if (!nextDriverId || isCancelled) return;
                                await confirmAndSendToDriver(booking.id, nextDriverId);
                              }}
                            >
                              <option value="">Nicht zugewiesen</option>
                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={`px-1.5 py-1 align-middle text-center ${isCancelled ? 'opacity-35' : ''}`}>
                            <span className="inline-flex items-center text-[16px] font-semibold uppercase text-[#1d1d1f]">{booking.vehicle_type || 'LIMO'}</span>
                          </td>
                          <td className={`min-w-[145px] px-0 py-1 align-top ${isCancelled ? 'opacity-35' : ''}`}>
                            <div className="flex items-stretch gap-1.5">
                              <div className="flex shrink-0 flex-col items-center pt-1 text-[#000000]" aria-hidden="true">
                                <span className="h-2 w-2 rounded-full bg-[#000000]" />
                                <span className="my-0.5 w-px flex-1 bg-[#000000]" />
                                <ChevronDown size={12} />
                              </div>
                              <div className="flex min-h-[42px] min-w-0 flex-1 flex-col justify-between">
                                <div className="truncate font-medium text-[#1d1d1f]" title={formatTableRouteAddress(booking, booking.pickup, 'pickup')}>
                                  {formatTableRouteAddress(booking, booking.pickup, 'pickup')}
                                </div>
                                <div className="truncate font-medium text-[#1d1d1f]" title={formatTableRouteAddress(booking, booking.destination, 'destination')}>
                                  {formatTableRouteAddress(booking, booking.destination, 'destination')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`min-w-[140px] px-2 py-1 align-top ${isCancelled ? 'opacity-35' : ''}`}>
                            <div className="flex min-h-[42px] flex-col justify-between text-[16px] font-medium leading-tight text-[#1d1d1f]">
                              <div>{Number(booking.passengers || 0)} Pers. • {Number(booking.luggage || 0)} K • {handLuggage} H</div>
                              {hasAnySeat ? (
                                <div className="text-[16px] text-[#6e6e73]">
                                  {seats.baby > 0 ? `${seats.baby} B` : ''}
                                  {seats.baby > 0 && (seats.child > 0 || seats.booster > 0) ? ' • ' : ''}
                                  {seats.child > 0 ? `${seats.child} K` : ''}
                                  {seats.child > 0 && seats.booster > 0 ? ' • ' : ''}
                                  {seats.booster > 0 ? `${seats.booster} S` : ''}
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>
                          </td>
                          <td className={`px-2 py-1 align-top ${isCancelled ? 'opacity-35' : ''}`}>
                            <a href={getTelHref(booking.phone)} className="block h-full transition-colors hover:text-[#0071e3]">
                              <div className="flex min-h-[42px] flex-col justify-between">
                                <div className="flex items-center gap-1.5 font-semibold text-[#1d1d1f]">
                                  <span>{booking.full_name}</span>
                                  {passengerCounts[booking.email] >= 5 && <Star size={13} className="fill-yellow-400 text-yellow-400" />}
                                </div>
                                <div className="text-[16px] text-[#0071e3]">{booking.phone || '-'}</div>
                              </div>
                            </a>
                          </td>
                          <td className={`w-[80px] px-0 py-1 align-top text-center ${isCancelled ? 'opacity-35' : ''}`}>
                            <div className="flex min-h-[42px] flex-col items-center justify-between">
                              <div className="font-semibold text-[#1d1d1f]">{formatPriceDisplay(booking.price)}</div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[16px] font-semibold uppercase ${payment.className}`}>
                                <CreditCard size={11} /> {payment.label}
                              </span>
                            </div>
                          </td>
                          <td className={`px-2 py-1 text-center align-middle md:px-0 ${isCancelled ? 'opacity-35' : ''}`}>
                            {displayNotes ? (
                              <button
                                type="button"
                                onClick={() => setNotesPopup({ open: true, text: displayNotes })}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e7ebf3] text-[#1d1d1f] transition-colors hover:bg-[#dbe3f0]"
                                aria-label="Notiz öffnen"
                                title="Notiz öffnen"
                              >
                                <FileText size={15} />
                              </button>
                            ) : null}
                          </td>
                          <td className={`px-2 py-1 text-center align-middle md:px-0 ${isCancelled ? 'opacity-35' : ''}`}>
                            <button
                              type="button"
                              onClick={() => openEditBooking(booking)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] transition-colors hover:bg-[#e7ebf3]"
                              aria-label="Buchung bearbeiten"
                              title="Buchung bearbeiten"
                            >
                              <Edit size={15} />
                            </button>
                          </td>
                          <td className="px-2 py-1 text-center align-middle md:px-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (isCancelled) {
                                  if (confirm('Möchten Sie die Bestellung aktivieren?')) {
                                    handleStatusChange(booking.id, 'pending');
                                  }
                                  return;
                                }
                                if (confirm('Diese Fahrt jetzt stornieren?')) {
                                  handleStatusChange(booking.id, 'cancelled');
                                }
                              }}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                isCancelled ? 'bg-[#e7f2ff] text-[#0071e3] hover:bg-[#dcecff]' : 'bg-[#f2e9eb] text-[#d70015] hover:bg-[#ecdee1]'
                              }`}
                              aria-label={isCancelled ? 'Fahrt aktivieren' : 'Fahrt stornieren'}
                              title={isCancelled ? 'Fahrt aktivieren' : 'Fahrt stornieren'}
                            >
                              {isCancelled ? <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0a63ff]" /> : <X size={15} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {notesPopup.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]" onClick={() => setNotesPopup({ open: false, text: '' })}>
              <div className="w-full max-w-md rounded-[20px] border border-[#d2d2d7] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-[#1d1d1f]">Anmerkung</h3>
                  <button
                    type="button"
                    onClick={() => setNotesPopup({ open: false, text: '' })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] transition-colors hover:bg-[#e7ebf3]"
                    aria-label="Notiz schließen"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#1d1d1f]">{notesPopup.text}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
