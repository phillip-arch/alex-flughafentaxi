'use client';

import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';

type StatsPaymentFilter = 'all' | 'cash' | 'card';

type AdminStatsPanelProps = {
  statsData: any[];
  statsRange: string;
  statsPaymentFilter: StatsPaymentFilter;
  statsDriverFilter: string;
  setStatsRange: (value: string) => void;
  setStatsPaymentFilter: (value: StatsPaymentFilter) => void;
  setStatsDriverFilter: (value: string) => void;
};

const getBookingPaymentLabel = (booking: any) => {
  const direct = String(booking?.payment_method || '').toLowerCase();
  const notes = String(booking?.notes || '').toLowerCase();
  const notesPayment = notes.match(/\(zahlung:\s*([^)]+)\)/i)?.[1]?.toLowerCase() || '';
  const source = `${direct} ${notesPayment}`.trim();

  if (source.includes('kredit') || source.includes('card') || source.includes('karte')) return 'KARTE';
  if (source.includes('bar') || source.includes('cash')) return 'BAR';
  if (source.includes('lieferschein') || source.includes('voucher')) return 'LIEFERSCHEIN';
  if (source.includes('gratis') || source.includes('free')) return 'GRATIS';
  return 'BAR';
};

const formatPriceDisplay = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.00 EUR';
  return `${new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} EUR`;
};

export default function AdminStatsPanel({
  statsData,
  statsRange,
  statsPaymentFilter,
  statsDriverFilter,
  setStatsRange,
  setStatsPaymentFilter,
  setStatsDriverFilter,
}: AdminStatsPanelProps) {
  const filteredByDriver = statsData.filter((b) =>
    statsDriverFilter === 'all' ? true : (b.driver?.name || 'Nicht zugewiesen') === statsDriverFilter
  );

  const filteredForRevenue = filteredByDriver.filter((b) => {
    if (statsPaymentFilter === 'all') return true;
    const paymentLabel = getBookingPaymentLabel(b);
    if (statsPaymentFilter === 'cash') return paymentLabel === 'BAR';
    return paymentLabel === 'KARTE';
  });

  const totalRevenue = filteredForRevenue.reduce((sum, b) => sum + Number(b.price), 0);
  const totalRevenueForDriver = filteredByDriver.reduce((sum, b) => sum + Number(b.price), 0);
  const totalRides = filteredByDriver.length;
  const avgValue = totalRides > 0 ? totalRevenueForDriver / totalRides : 0;

  const revenueByDate = filteredForRevenue.reduce((acc, b) => {
    const date = format(new Date(b.pickup_at), 'MMM dd');
    acc[date] = (acc[date] || 0) + Number(b.price);
    return acc;
  }, {} as Record<string, number>);
  const areaChartData = Object.keys(revenueByDate).map((date) => ({ date, revenue: revenueByDate[date] }));

  const revenueByDriver = filteredForRevenue.reduce((acc, b) => {
    const driverName = b.driver?.name || 'Nicht zugewiesen';
    if (!acc[driverName]) {
      acc[driverName] = { revenue: 0, rides: 0 };
    }
    acc[driverName].revenue += Number(b.price) || 0;
    acc[driverName].rides += 1;
    return acc;
  }, {} as Record<string, { revenue: number; rides: number }>);
  const barChartData = Object.keys(revenueByDriver).map((name) => ({
    name,
    nameWithRides: `${name} (${revenueByDriver[name].rides})`,
    revenue: revenueByDriver[name].revenue,
    rides: revenueByDriver[name].rides,
  }));

  const ridesByDate = filteredByDriver.reduce((acc, b) => {
    const dateKey = format(new Date(b.pickup_at), 'MMM dd');
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const ridesByDateData = Object.keys(ridesByDate).map((date) => ({ date, rides: ridesByDate[date] }));
  const availableDriverNames = Array.from(
    new Set(statsData.map((b) => b.driver?.name || 'Nicht zugewiesen'))
  ).sort((a, b) => a.localeCompare(b, 'de'));

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-[18px] border border-[#d2d2d7] shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-semibold text-[#1d1d1f] text-[17px]">Leistungsübersicht</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
            <select
              value={statsDriverFilter}
              onChange={(e) => setStatsDriverFilter(e.target.value)}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3]"
            >
              <option value="all">Alle Fahrer</option>
              {availableDriverNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={statsPaymentFilter}
              onChange={(e) => setStatsPaymentFilter(e.target.value as StatsPaymentFilter)}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3]"
            >
              <option value="all">Alle Zahlungen</option>
              <option value="cash">Nur Bar</option>
              <option value="card">Nur Karte</option>
            </select>
            <select
              value={statsRange}
              onChange={(e) => setStatsRange(e.target.value)}
              className="w-full border border-[#d2d2d7] rounded-[12px] px-3 py-2 text-[13px] bg-white outline-none focus:border-[#0071e3] sm:col-span-2 lg:col-span-1"
            >
              <option value="today">Heute</option>
              <option value="7">Letzte 7 Tage</option>
              <option value="30">Letzte 30 Tage</option>
              <option value="90">Letzte 90 Tage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Gesamtumsatz</h3>
          <p className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight">{formatPriceDisplay(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Gesamtfahrten</h3>
          <p className="text-[32px] font-semibold text-[#0071e3] tracking-tight">{totalRides}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <h3 className="text-[#86868b] text-[11px] font-medium uppercase tracking-wide mb-2">Durchschnittswert Buchung</h3>
          <p className="text-[32px] font-semibold text-[#0a63ff] tracking-tight">{formatPriceDisplay(avgValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <div className="flex flex-col gap-8">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Umsatzverlauf</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f7" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#86868b' }}
                  tickFormatter={(value) => `${value} EUR`}
                />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0071e3" fill="#e0f2ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
          <div className="flex flex-col gap-8">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Umsatz/Fahrten pro Fahrer</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f7" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
                <YAxis
                  dataKey="nameWithRides"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#86868b' }}
                  width={140}
                />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="revenue" fill="#0071e3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[24px] border border-[#d2d2d7] shadow-sm">
        <div className="flex flex-col gap-8">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
          Fahrten pro Tag ({statsDriverFilter === 'all' ? 'Alle Fahrer' : statsDriverFilter})
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ridesByDateData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f7" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#86868b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="rides" stroke="#0071e3" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </div>
      </div>
    </div>
  );
}
