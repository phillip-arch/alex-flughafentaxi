'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Plus, Trash2, Users } from 'lucide-react';

type AdminDriversPanelProps = {
  drivers: any[];
  handleDeleteDriver: (id: string) => void;
  handleAddDriver: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleToggleDriverNotice: (id: string, enabled: boolean) => void | Promise<void>;
  alertEmail: string;
  alertEmailFallback: string;
  handleSaveAlertEmail: (email: string) => void | Promise<void>;
  adminPrimaryButtonClass: string;
};

export default function AdminDriversPanel({
  drivers,
  handleDeleteDriver,
  handleAddDriver,
  handleToggleDriverNotice,
  alertEmail,
  alertEmailFallback,
  handleSaveAlertEmail,
  adminPrimaryButtonClass,
}: AdminDriversPanelProps) {
  const [emailDraft, setEmailDraft] = useState(alertEmail);
  useEffect(() => {
    setEmailDraft(alertEmail);
  }, [alertEmail]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white p-5 rounded-[20px] border border-[#d2d2d7] shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] font-semibold text-lg">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1d1d1f] text-[16px]">{driver.name}</h3>
                    <p className="text-[13px] text-[#86868b]">{driver.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="text-[#86868b] hover:text-[#d70015] p-1.5 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Fahrer löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {driver.phone ? (
                <a
                  href={`tel:${driver.phone}`}
                  className="inline-flex items-center gap-2 text-[14px] text-[#0071e3] hover:underline mt-1 bg-[#f5f5f7] px-3 py-1.5 rounded-lg w-full justify-center hover:bg-[#e8f2ff] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0a63ff] animate-pulse"></span>
                  {driver.phone}
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => handleToggleDriverNotice(driver.id, !(driver.notify_on_cancellation ?? true))}
                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  (driver.notify_on_cancellation ?? true)
                    ? 'bg-[#e8f2ff] text-[#0071e3] hover:bg-[#dcebff]'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#ececee]'
                }`}
                title="Storno-E-Mail an diesen Fahrer senden, wenn eine zugewiesene Fahrt storniert wird"
              >
                {(driver.notify_on_cancellation ?? true) ? <Bell size={14} /> : <BellOff size={14} />}
                {(driver.notify_on_cancellation ?? true) ? 'Storno-Info: an' : 'Storno-Info: aus'}
              </button>
            </div>
          ))}

          {drivers.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-[24px] border border-[#d2d2d7] text-[#86868b]">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Keine Fahrer gefunden. Fügen Sie einen Fahrer hinzu, um zu starten.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-[24px] border border-[#d2d2d7] shadow-sm p-8">
          <h3 className="text-[19px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Bell size={20} className="text-[#0071e3]" /> Benachrichtigungen
          </h3>
          <p className="mt-3 text-[13px] text-[#86868b]">
            An diese Adresse wird eine Info-E-Mail gesendet, wenn ein Fahrgast online storniert.
          </p>
          <div className="mt-4">
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">Storno-Benachrichtigung an</label>
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder={alertEmailFallback || 'office@example.at'}
              className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all"
            />
            {!emailDraft && alertEmailFallback ? (
              <p className="mt-2 text-[12px] text-[#86868b]">Leer = Standardadresse ({alertEmailFallback}) wird verwendet.</p>
            ) : null}
            <button
              type="button"
              onClick={() => handleSaveAlertEmail(emailDraft)}
              className={`mt-4 w-full ${adminPrimaryButtonClass}`}
            >
              Speichern
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#d2d2d7] shadow-sm p-8 sticky top-24">
          <div className="flex flex-col gap-8">
          <h3 className="text-[19px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Plus size={20} className="text-[#0071e3]" /> Neuen Fahrer hinzufügen
          </h3>
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">Vollständiger Name</label>
              <input type="text" name="name" required className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="Max Mustermann" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">E-Mail-Adresse</label>
              <input type="email" name="email" required className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">Telefonnummer</label>
              <input type="tel" name="phone" className="w-full p-3 border border-[#d2d2d7] rounded-[12px] text-[15px] focus:ring-2 focus:ring-[#0071e3] outline-none text-[#1d1d1f] transition-all" placeholder="+43 664 1234567" />
            </div>
            <button type="submit" className={`mt-4 w-full ${adminPrimaryButtonClass}`}>
              Fahrer speichern
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
