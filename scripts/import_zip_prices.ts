import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

type SpreadsheetRow = Record<string, unknown>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const filePath = process.argv[2];
const shouldClear = process.argv.includes('--clear');

if (!filePath) {
  console.error('Usage: npx tsx scripts/import_zip_prices.ts <path-to-file.csv|xls|xlsx> [--clear]');
  process.exit(1);
}

const resolvedPath = path.resolve(filePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeText(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizePrice(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeCsvBuffer(buffer: Buffer) {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  const windows1252 = new TextDecoder('windows-1252', { fatal: false }).decode(buffer);

  const score = (value: string) => {
    const mojibakeMatches = value.match(/Ãƒ.|Ã¢.|ï¿½/g) || [];
    const germanMatches = value.match(/[ÄÖÜäöüß]/g) || [];
    return {
      mojibake: mojibakeMatches.length,
      german: germanMatches.length,
    };
  };

  const utf8Score = score(utf8);
  const windowsScore = score(windows1252);

  if (utf8Score.mojibake === 0) return utf8;
  if (windowsScore.mojibake === 0 && windowsScore.german > utf8Score.german) return windows1252;
  if (utf8Score.german >= windowsScore.german) return utf8;
  return windows1252;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function readWorkbook(file: string) {
  const extension = path.extname(file).toLowerCase();
  if (extension === '.csv') {
    const decoded = decodeCsvBuffer(fs.readFileSync(file));
    const lines = decoded
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return [];
    }

    const headers = parseCsvLine(lines[0]);
    return lines.slice(1).map<SpreadsheetRow>((line) => {
      const values = parseCsvLine(line);
      return headers.reduce<SpreadsheetRow>((acc, header, index) => {
        acc[header] = values[index] ?? '';
        return acc;
      }, {});
    });
  }

  return XLSX.readFile(file, { cellDates: false });
}

function detectKeys(row: SpreadsheetRow) {
  const keys = Object.keys(row);
  const lowerMap = new Map(keys.map((key) => [key.toLowerCase(), key]));

  return {
    cityKey: lowerMap.get('ort') || lowerMap.get('city') || keys[0],
    zipKey: lowerMap.get('plz') || lowerMap.get('zip') || keys[1],
    limoKey: lowerMap.get('limo') || keys[2],
    kombiKey: lowerMap.get('kombi') || keys[3],
    vanKey: lowerMap.get('van') || lowerMap.get('bus') || keys[4],
  };
}

async function main() {
  const source = readWorkbook(resolvedPath);
  const rows = Array.isArray(source)
    ? source
    : XLSX.utils.sheet_to_json<SpreadsheetRow>(source.Sheets[source.SheetNames[0]], { defval: '' });

  if (rows.length === 0) {
    console.error('The spreadsheet is empty.');
    process.exit(1);
  }

  const { cityKey, zipKey, limoKey, kombiKey, vanKey } = detectKeys(rows[0]);
  const payload = new Map<
    string,
    {
      zip: string;
      city: string;
      base_price: number;
      limo_price: number;
      kombi_price: number;
      bus_price: number;
    }
  >();

  for (const row of rows) {
    const city = normalizeText(row[cityKey]);
    const zip = normalizeText(row[zipKey]).replace(/\D/g, '');
    const limoPrice = normalizePrice(row[limoKey]);
    const kombiPrice = normalizePrice(row[kombiKey]);
    const busPrice = normalizePrice(row[vanKey]);

    if (!city || !/^\d{4}$/.test(zip) || limoPrice === null || kombiPrice === null || busPrice === null) {
      continue;
    }

    payload.set(`${zip}::${city.toLowerCase()}`, {
      zip,
      city,
      base_price: limoPrice,
      limo_price: limoPrice,
      kombi_price: kombiPrice,
      bus_price: busPrice,
    });
  }

  const rowsToImport = [...payload.values()];

  if (!rowsToImport.length) {
    console.error('No valid rows found. Expected Ort, Plz, Limo, Kombi, Van.');
    process.exit(1);
  }

  if (shouldClear) {
    const { error: clearError } = await supabase.from('zip_prices').delete().not('zip', 'is', null);
    if (clearError) {
      console.error('Failed to clear zip_prices table:', clearError);
      process.exit(1);
    }
  }

  const chunkSize = 500;
  for (let index = 0; index < rowsToImport.length; index += chunkSize) {
    const chunk = rowsToImport.slice(index, index + chunkSize);
    const { error } = await supabase.from('zip_prices').upsert(chunk, {
      onConflict: 'zip,city',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error('Import failed:', error);
      process.exit(1);
    }
  }

  console.log(`Imported ${rowsToImport.length} zip price rows from ${resolvedPath}.`);
}

void main();
