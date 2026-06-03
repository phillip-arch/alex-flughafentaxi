'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Plus, Save, Settings, Trash2 } from 'lucide-react';

type DistancePricingSettings = {
  id?: string;
  enabled?: boolean;
  airport_lat?: number | string;
  airport_lng?: number | string;
  base_fee?: number | string;
  limo_per_km?: number | string;
  kombi_per_km?: number | string;
  bus_per_km?: number | string;
  minimum_limo_price?: number | string;
  minimum_kombi_price?: number | string;
  minimum_bus_price?: number | string;
  round_to?: number | string;
};

type ZipPrice = {
  zip: string;
  city: string;
  base_price: number;
  limo_price: number;
  kombi_price: number;
  bus_price: number;
};

type AdminPricingPanelProps = {
  loading: boolean;
  settings: DistancePricingSettings | null;
  zipPrices: ZipPrice[];
  onSaveSettings: (payload: DistancePricingSettings) => Promise<void>;
  onSaveZipPrice: (payload: Partial<ZipPrice> & { original_zip?: string; original_city?: string }) => Promise<void>;
  onDeleteZipPrice: (input: { zip: string; city: string }) => Promise<void>;
};

const inputClass =
  'w-full rounded-[12px] border border-[#d2d2d7] bg-white px-3 py-2.5 text-[14px] text-[#1d1d1f] outline-none transition-colors focus:border-[#0071e3] focus:ring-2 focus:ring-[#d8eaff]';
const compactInputClass =
  'w-full rounded-[10px] border border-[#d2d2d7] bg-white px-2.5 py-2 text-[13px] text-[#1d1d1f] outline-none transition-colors focus:border-[#0071e3] focus:ring-2 focus:ring-[#d8eaff]';

const defaultSettings: DistancePricingSettings = {
  enabled: true,
  airport_lat: 48.110278,
  airport_lng: 16.569722,
  base_fee: 18,
  limo_per_km: 1.7,
  kombi_per_km: 1.9,
  bus_per_km: 2.4,
  minimum_limo_price: 45,
  minimum_kombi_price: 50,
  minimum_bus_price: 65,
  round_to: 1,
};

function normalizeFormValue(value: unknown) {
  return value === null || value === undefined ? '' : String(value);
}

function formatMoney(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return '0.00';
  return new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

function getZipPriceKey(price: Pick<ZipPrice, 'zip' | 'city'>) {
  return `${price.zip}::${price.city}`.toLowerCase();
}

export default function AdminPricingPanel({
  loading,
  settings,
  zipPrices,
  onSaveSettings,
  onSaveZipPrice,
  onDeleteZipPrice,
}: AdminPricingPanelProps) {
  const [settingsForm, setSettingsForm] = useState<DistancePricingSettings>(defaultSettings);
  const [rowForms, setRowForms] = useState<Record<string, Partial<ZipPrice>>>({});
  const [newRow, setNewRow] = useState<Partial<ZipPrice>>({
    zip: '',
    city: '',
    limo_price: 0,
    kombi_price: 0,
    bus_price: 0,
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<'50' | '100' | '200' | 'all'>('50');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'zip' | 'city'>('zip');

  useEffect(() => {
    setSettingsForm({ ...defaultSettings, ...(settings || {}) });
  }, [settings]);

  useEffect(() => {
    setRowForms(
      zipPrices.reduce<Record<string, Partial<ZipPrice>>>((acc, price) => {
        acc[getZipPriceKey(price)] = {
          zip: price.zip,
          city: price.city,
          limo_price: price.limo_price,
          kombi_price: price.kombi_price,
          bus_price: price.bus_price,
        };
        return acc;
      }, {}),
    );
  }, [zipPrices]);

  const filteredZipPrices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return [...zipPrices]
      .filter((price) => {
        if (!normalizedSearch) return true;
        return `${price.zip} ${price.city}`.toLowerCase().includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sortBy === 'city') {
          const cityCompare = String(left.city).localeCompare(String(right.city), 'de-AT');
          if (cityCompare !== 0) return cityCompare;
          return String(left.zip).localeCompare(String(right.zip), 'de-AT');
        }

        const zipCompare = String(left.zip).localeCompare(String(right.zip), 'de-AT');
        if (zipCompare !== 0) return zipCompare;
        return String(left.city).localeCompare(String(right.city), 'de-AT');
      });
  }, [searchTerm, sortBy, zipPrices]);

  const pageSize = rowsPerPage === 'all' ? filteredZipPrices.length || 1 : Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredZipPrices.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleZipPrices =
    rowsPerPage === 'all'
      ? filteredZipPrices
      : filteredZipPrices.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchTerm]);

  const updateSetting = (key: keyof DistancePricingSettings, value: string | boolean) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRow = (rowKey: string, key: keyof ZipPrice, value: string) => {
    setRowForms((prev) => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setSavingKey('settings');
    try {
      await onSaveSettings(settingsForm);
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveRow = async (price: ZipPrice) => {
    const rowKey = getZipPriceKey(price);
    setSavingKey(rowKey);
    try {
      await onSaveZipPrice({
        ...rowForms[rowKey],
        original_zip: price.zip,
        original_city: price.city,
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddRow = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingKey('new');
    try {
      await onSaveZipPrice(newRow);
      setNewRow({ zip: '', city: '', limo_price: 0, kombi_price: 0, bus_price: 0 });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <form onSubmit={handleAddRow} className="rounded-[20px] border border-[#d2d2d7] bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-[#1d1d1f]">
            <Plus size={18} className="text-[#0071e3]" />
            Add fixed price
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[7rem_minmax(0,1fr)_repeat(3,7rem)_auto] md:items-end">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">ZIP</span>
              <input
                value={normalizeFormValue(newRow.zip)}
                onChange={(event) => setNewRow((prev) => ({ ...prev, zip: event.target.value }))}
                className={inputClass}
                required
                inputMode="numeric"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">City</span>
              <input
                value={normalizeFormValue(newRow.city)}
                onChange={(event) => setNewRow((prev) => ({ ...prev, city: event.target.value }))}
                className={inputClass}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Sedan</span>
              <input
                value={normalizeFormValue(newRow.limo_price)}
                onChange={(event) => setNewRow((prev) => ({ ...prev, limo_price: Number(event.target.value) }))}
                className={inputClass}
                required
                inputMode="decimal"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">St. wagon</span>
              <input
                value={normalizeFormValue(newRow.kombi_price)}
                onChange={(event) => setNewRow((prev) => ({ ...prev, kombi_price: Number(event.target.value) }))}
                className={inputClass}
                required
                inputMode="decimal"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Minivan</span>
              <input
                value={normalizeFormValue(newRow.bus_price)}
                onChange={(event) => setNewRow((prev) => ({ ...prev, bus_price: Number(event.target.value) }))}
                className={inputClass}
                required
                inputMode="decimal"
              />
            </label>
            <button
              type="submit"
              disabled={savingKey === 'new'}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] bg-[#000000] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#232325] disabled:opacity-50"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        </form>

        <div className="rounded-[20px] border border-[#d2d2d7] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#eef2f7] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-[#1d1d1f]">
                <Calculator size={18} className="text-[#0071e3]" />
                Fixed ZIP prices
              </h2>
              <p className="mt-1 text-[13px] text-[#5f6f85]">
                These rows override distance pricing when ZIP and city match the Google address.
              </p>
            </div>
            <div className="rounded-full bg-[#f5f8fc] px-3 py-1.5 text-[12px] font-medium text-[#536274]">
              {zipPrices.length} rows
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-[#eef2f7] px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search ZIP or city"
              className={inputClass}
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'zip' | 'city')}
              className="rounded-[12px] border border-[#d2d2d7] bg-white px-3 py-2.5 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#d8eaff]"
            >
              <option value="zip">Sort by ZIP</option>
              <option value="city">Sort by city</option>
            </select>
            <select
              value={rowsPerPage}
              onChange={(event) => setRowsPerPage(event.target.value as '50' | '100' | '200' | 'all')}
              className="rounded-[12px] border border-[#d2d2d7] bg-white px-3 py-2.5 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#d8eaff]"
            >
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="200">200 rows</option>
              <option value="all">All rows</option>
            </select>
            <div className="text-[13px] text-[#687384] md:text-right">
              {filteredZipPrices.length} shown
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[12px] font-semibold text-[#687384]">
                  <th className="px-5 py-3">ZIP</th>
                  <th className="px-3 py-3">City</th>
                  <th className="px-3 py-3">Sedan</th>
                  <th className="px-3 py-3">St. wagon</th>
                  <th className="px-3 py-3">Minivan</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && visibleZipPrices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-[#687384]">
                      Pricing data is loading...
                    </td>
                  </tr>
                ) : null}
                {!loading && visibleZipPrices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-[#687384]">
                      {searchTerm.trim()
                        ? 'No fixed prices match your search.'
                        : 'No fixed prices yet. Add common routes here and let distance pricing handle the rest.'}
                    </td>
                  </tr>
                ) : null}
                {visibleZipPrices.map((price) => {
                  const rowKey = getZipPriceKey(price);
                  const row = rowForms[rowKey] || price;
                  return (
                    <tr key={rowKey} className="border-t border-[#eef2f7]">
                      <td className="border-t border-[#eef2f7] px-5 py-3">
                        <input
                          value={normalizeFormValue(row.zip)}
                          onChange={(event) => updateRow(rowKey, 'zip', event.target.value)}
                          className={compactInputClass}
                          inputMode="numeric"
                        />
                      </td>
                      <td className="border-t border-[#eef2f7] px-3 py-3">
                        <input
                          value={normalizeFormValue(row.city)}
                          onChange={(event) => updateRow(rowKey, 'city', event.target.value)}
                          className={compactInputClass}
                        />
                      </td>
                      <td className="border-t border-[#eef2f7] px-3 py-3">
                        <input
                          value={normalizeFormValue(row.limo_price)}
                          onChange={(event) => updateRow(rowKey, 'limo_price', event.target.value)}
                          className={compactInputClass}
                          inputMode="decimal"
                        />
                      </td>
                      <td className="border-t border-[#eef2f7] px-3 py-3">
                        <input
                          value={normalizeFormValue(row.kombi_price)}
                          onChange={(event) => updateRow(rowKey, 'kombi_price', event.target.value)}
                          className={compactInputClass}
                          inputMode="decimal"
                        />
                      </td>
                      <td className="border-t border-[#eef2f7] px-3 py-3">
                        <input
                          value={normalizeFormValue(row.bus_price)}
                          onChange={(event) => updateRow(rowKey, 'bus_price', event.target.value)}
                          className={compactInputClass}
                          inputMode="decimal"
                        />
                      </td>
                      <td className="border-t border-[#eef2f7] px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveRow(price)}
                            disabled={savingKey === rowKey}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#0071e3] text-white transition-colors hover:bg-[#005ec4] disabled:opacity-50"
                            aria-label={`Save ${price.zip} ${price.city}`}
                            title="Save price"
                          >
                            <Save size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteZipPrice({ zip: price.zip, city: price.city })}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#f1d1d6] bg-white text-[#d70015] transition-colors hover:bg-[#fff4f6]"
                            aria-label={`Delete ${price.zip} ${price.city}`}
                            title="Delete price"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rowsPerPage !== 'all' && filteredZipPrices.length > pageSize ? (
            <div className="flex flex-col gap-3 border-t border-[#eef2f7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-[#687384]">
                Page {safeCurrentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="rounded-[12px] border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f8fbff] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="rounded-[12px] border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f8fbff] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>

      </div>

      <aside className="space-y-4">
        <div className="rounded-[20px] border border-[#d2d2d7] bg-white p-5 shadow-sm xl:sticky xl:top-24">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-[#1d1d1f]">
                <Settings size={18} className="text-[#0071e3]" />
                Distance fallback
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#5f6f85]">
                Used when no fixed ZIP price exists.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f]">
              <input
                type="checkbox"
                checked={settingsForm.enabled !== false}
                onChange={(event) => updateSetting('enabled', event.target.checked)}
                className="h-4 w-4 accent-[#0071e3]"
              />
              Enabled
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Airport lat</span>
                <input
                  value={normalizeFormValue(settingsForm.airport_lat)}
                  onChange={(event) => updateSetting('airport_lat', event.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Airport lng</span>
                <input
                  value={normalizeFormValue(settingsForm.airport_lng)}
                  onChange={(event) => updateSetting('airport_lng', event.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Base fee</span>
                <input
                  value={normalizeFormValue(settingsForm.base_fee)}
                  onChange={(event) => updateSetting('base_fee', event.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[12px] font-medium text-[#536274]">Round to</span>
                <input
                  value={normalizeFormValue(settingsForm.round_to)}
                  onChange={(event) => updateSetting('round_to', event.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                />
              </label>
            </div>

            <div className="rounded-[16px] bg-[#f8fbff] p-4">
              <p className="mb-3 text-[13px] font-semibold text-[#1d1d1f]">Per km rates</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['limo_per_km', 'Sedan'],
                  ['kombi_per_km', 'St. wagon'],
                  ['bus_per_km', 'Minivan'],
                ].map(([key, label]) => (
                  <label key={key}>
                    <span className="mb-1.5 block text-[11px] font-medium text-[#536274]">{label}</span>
                    <input
                      value={normalizeFormValue(settingsForm[key as keyof DistancePricingSettings])}
                      onChange={(event) => updateSetting(key as keyof DistancePricingSettings, event.target.value)}
                      className={compactInputClass}
                      inputMode="decimal"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] bg-[#f8fbff] p-4">
              <p className="mb-3 text-[13px] font-semibold text-[#1d1d1f]">Minimum prices</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['minimum_limo_price', 'Sedan'],
                  ['minimum_kombi_price', 'St. wagon'],
                  ['minimum_bus_price', 'Minivan'],
                ].map(([key, label]) => (
                  <label key={key}>
                    <span className="mb-1.5 block text-[11px] font-medium text-[#536274]">{label}</span>
                    <input
                      value={normalizeFormValue(settingsForm[key as keyof DistancePricingSettings])}
                      onChange={(event) => updateSetting(key as keyof DistancePricingSettings, event.target.value)}
                      className={compactInputClass}
                      inputMode="decimal"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e3edf8] bg-white px-4 py-3 text-[12px] leading-5 text-[#536274]">
              Example: sedan minimum {formatMoney(settingsForm.minimum_limo_price)} EUR, then base fee plus km rate after
              Google returns route distance.
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingKey === 'settings'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#000000] px-4 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#232325] disabled:opacity-50"
            >
              <Save size={15} />
              Save distance settings
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
