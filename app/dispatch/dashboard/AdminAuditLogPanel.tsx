'use client';

import { useState } from 'react';
import { History, Shield, CalendarClock } from 'lucide-react';

type AuditLogEntry = {
  id: string;
  actor_user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  meta?: Record<string, any> | null;
  created_at: string;
};

type AdminAuditLogPanelProps = {
  loading: boolean;
  logs: AuditLogEntry[];
  timeFilter: 'all' | 'today' | '7' | '30';
  onTimeFilterChange: (value: 'all' | 'today' | '7' | '30') => void;
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_DRIVER: 'Fahrer erstellt',
  DELETE_DRIVER: 'Fahrer geloescht',
  UPDATE_STATUS: 'Status geaendert',
  UPDATE_BOOKING: 'Buchung bearbeitet',
  ASSIGN_DRIVER: 'Fahrer zugewiesen',
  UNASSIGN_DRIVER: 'Fahrer entfernt',
};

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed);
}

function formatEntityLabel(entity: string) {
  if (entity === 'bookings') return 'Buchung';
  if (entity === 'drivers') return 'Fahrer';
  return entity;
}

function summarizeLog(log: AuditLogEntry) {
  const meta = log.meta || {};
  const actorEmail = typeof meta.actorEmail === 'string' ? meta.actorEmail : '';

  if (log.action === 'UPDATE_STATUS') {
    const beforeStatus = meta.before?.status;
    const afterStatus = meta.after?.status || meta.status;
    if (beforeStatus && afterStatus && beforeStatus !== afterStatus) {
      return `Status ${beforeStatus} -> ${afterStatus}`;
    }
  }

  if (log.action === 'ASSIGN_DRIVER') {
    const driverId = meta.after?.driver_id;
    return driverId ? `Fahrer ${driverId} zugewiesen` : 'Fahrer zugewiesen';
  }

  if (log.action === 'UNASSIGN_DRIVER') {
    return 'Fahrerzuweisung entfernt';
  }

  if (log.action === 'CREATE_DRIVER') {
    return meta.after?.email ? `Neuer Fahrer: ${meta.after.email}` : 'Neuer Fahrer erstellt';
  }

  if (log.action === 'DELETE_DRIVER') {
    return meta.before?.email ? `Fahrer geloescht: ${meta.before.email}` : 'Fahrer geloescht';
  }

  if (log.action === 'UPDATE_BOOKING') {
    const changedKeys = new Set<string>();
    const before = meta.before || {};
    const after = meta.after || {};
    Object.keys(after).forEach((key) => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changedKeys.add(key);
      }
    });
    if (changedKeys.size > 0) {
      return `Geaendert: ${Array.from(changedKeys).slice(0, 4).join(', ')}`;
    }
  }

  if (actorEmail) return `Von ${actorEmail}`;
  return ACTION_LABELS[log.action] || log.action;
}

export default function AdminAuditLogPanel({
  loading,
  logs,
  timeFilter,
  onTimeFilterChange,
}: AdminAuditLogPanelProps) {
  const [actionFilter, setActionFilter] = useState<'all' | keyof typeof ACTION_LABELS>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | 'bookings' | 'drivers'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const getBookingReference = (log: AuditLogEntry) => {
    const beforeRef = typeof log.meta?.before?.booking_reference === 'string' ? log.meta.before.booking_reference : '';
    const afterRef = typeof log.meta?.after?.booking_reference === 'string' ? log.meta.after.booking_reference : '';
    return afterRef || beforeRef || '';
  };

  const now = Date.now();
  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entity !== entityFilter) return false;
    if (timeFilter !== 'all') {
      const createdAt = new Date(log.created_at).getTime();
      if (Number.isNaN(createdAt)) return false;
      if (timeFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (createdAt < startOfToday.getTime()) return false;
      } else {
        const days = Number(timeFilter);
        const threshold = now - days * 24 * 60 * 60 * 1000;
        if (createdAt < threshold) return false;
      }
    }
    if (normalizedSearchTerm) {
      const actorEmail =
        typeof log.meta?.actorEmail === 'string' ? log.meta.actorEmail.toLowerCase() : '';
      const bookingReference = getBookingReference(log).toLowerCase();
      const entityId = String(log.entity_id || '').toLowerCase();
      const actionLabel = (ACTION_LABELS[log.action] || log.action).toLowerCase();
      const summary = summarizeLog(log).toLowerCase();

      const haystack = [actorEmail, bookingReference, entityId, actionLabel, summary].join(' ');
      if (!haystack.includes(normalizedSearchTerm)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#d2d2d7] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-[#1679ff]">
            <Shield size={22} />
          </div>
          <div className="min-w-0 flex flex-col gap-4">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-[#1679ff]">Logs</p>
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-[#1d1d1f]">Aenderungsverlauf</h2>
            <p className="max-w-3xl text-[1rem] leading-7 text-[#6b7280]">
              Hier sehen Sie, welcher Dispatch-Admin welche Buchung oder Fahrer-Daten geaendert hat und wann die
              Aenderung passiert ist.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#d2d2d7] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suche nach Buchungsnummer"
            className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-3 py-3 text-[0.95rem] text-[#1d1d1f] outline-none placeholder:text-[#98a2b3] focus:border-[#1679ff]"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as 'all' | keyof typeof ACTION_LABELS)}
            className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-3 py-3 text-[0.95rem] text-[#1d1d1f] outline-none focus:border-[#1679ff]"
          >
            <option value="all">Alle Aktionen</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value as 'all' | 'bookings' | 'drivers')}
            className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-3 py-3 text-[0.95rem] text-[#1d1d1f] outline-none focus:border-[#1679ff]"
          >
            <option value="all">Alle Bereiche</option>
            <option value="bookings">Buchungen</option>
            <option value="drivers">Fahrer</option>
          </select>
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value as 'all' | 'today' | '7' | '30')}
            className="w-full rounded-[14px] border border-[#d2d2d7] bg-white px-3 py-3 text-[0.95rem] text-[#1d1d1f] outline-none focus:border-[#1679ff]"
          >
            <option value="all">Gesamter Zeitraum</option>
            <option value="today">Heute</option>
            <option value="7">Letzte 7 Tage</option>
            <option value="30">Letzte 30 Tage</option>
          </select>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#d2d2d7] bg-white shadow-sm">
        {loading && logs.length === 0 ? (
          <div className="px-6 py-14 text-center text-[#86868b]">
            <History size={40} className="mx-auto mb-4 opacity-30" />
            Logs werden geladen...
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-14 text-center text-[#86868b]">
            <History size={40} className="mx-auto mb-4 opacity-30" />
            Noch keine Aenderungen protokolliert.
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-14 text-center text-[#86868b]">
            <History size={40} className="mx-auto mb-4 opacity-30" />
            Keine Logs fuer die aktuellen Filter gefunden.
          </div>
        ) : (
          <div className="divide-y divide-[#edf2f7]">
            {filteredLogs.map((log) => {
              const actorEmail =
                typeof log.meta?.actorEmail === 'string' && log.meta.actorEmail.trim()
                  ? log.meta.actorEmail.trim()
                  : 'Unbekannt';
              const bookingReference = getBookingReference(log);

              return (
                <div key={log.id} className="px-6 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#eef5ff] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#1679ff]">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#f5f7fa] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#7b8794]">
                          {formatEntityLabel(log.entity)}
                        </span>
                      </div>
                      <p className="mt-3 text-[1rem] font-medium text-[#1d1d1f]">{summarizeLog(log)}</p>
                      <div className="mt-2 flex flex-col gap-1 text-[0.93rem] text-[#6b7280]">
                        <span>Admin: {actorEmail}</span>
                        {bookingReference ? <span>Buchungsnummer: {bookingReference}</span> : null}
                        {log.entity_id ? <span>ID: {log.entity_id}</span> : null}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-[0.9rem] text-[#6b7280] md:shrink-0">
                      <CalendarClock size={16} className="text-[#98a2b3]" />
                      {formatTimestamp(log.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
