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
const cityArg = process.argv[3] || 'Wien';
const shouldClear = process.argv.includes('--clear');

if (!filePath) {
  console.error('Usage: npx tsx scripts/import_streets.ts <path-to-file.csv|xls|xlsx> [city] [--clear]');
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

function decodeCsvBuffer(buffer: Buffer) {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  const windows1252 = new TextDecoder('windows-1252', { fatal: false }).decode(buffer);

  const score = (value: string) => {
    const mojibakeMatches = value.match(/Ã.|â.|�/g) || [];
    const germanMatches = value.match(/[äöüÄÖÜß]/g) || [];
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

function detectKeys(row: SpreadsheetRow) {
  const keys = Object.keys(row);
  const lowerMap = new Map(keys.map((key) => [key.toLowerCase(), key]));

  const zipKey =
    lowerMap.get('zip') ||
    lowerMap.get('plz') ||
    lowerMap.get('postal') ||
    lowerMap.get('postcode') ||
    keys[0];
  const streetKey =
    lowerMap.get('street') ||
    lowerMap.get('strasse') ||
    lowerMap.get('straße') ||
    lowerMap.get('adresse') ||
    keys[1];

  return { zipKey, streetKey };
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

async function main() {
  const source = readWorkbook(resolvedPath);
  const rows = Array.isArray(source)
    ? source
    : XLSX.utils.sheet_to_json<SpreadsheetRow>(source.Sheets[source.SheetNames[0]], { defval: '' });

  if (rows.length === 0) {
    console.error('The spreadsheet is empty.');
    process.exit(1);
  }

  const { zipKey, streetKey } = detectKeys(rows[0]);
  if (!zipKey || !streetKey) {
    console.error('Could not detect ZIP and street columns.');
    process.exit(1);
  }

  const deduped = new Map<string, { zip: string; street: string; city: string }>();

  for (const row of rows) {
    const zip = normalizeText(row[zipKey]).replace(/\D/g, '').slice(0, 4);
    const street = normalizeText(row[streetKey]);
    const city = normalizeText(row.city || row.City || cityArg) || cityArg;

    if (!zip || !street) {
      continue;
    }

    deduped.set(`${zip}::${street.toLowerCase()}::${city.toLowerCase()}`, { zip, street, city });
  }

  const payload = [...deduped.values()];

  if (payload.length === 0) {
    console.error('No valid rows found. Expected ZIP and street values.');
    process.exit(1);
  }

  if (shouldClear) {
    const { error: clearError } = await supabase.from('streets').delete().not('id', 'is', null);
    if (clearError) {
      console.error('Failed to clear streets table:', clearError);
      process.exit(1);
    }
  }

  const chunkSize = 500;
  for (let index = 0; index < payload.length; index += chunkSize) {
    const chunk = payload.slice(index, index + chunkSize);
    const { error } = await supabase.from('streets').upsert(chunk, {
      onConflict: 'zip,street,city',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error('Import failed:', error);
      process.exit(1);
    }
  }

  console.log(`Imported ${payload.length} street rows from ${resolvedPath}.`);
}

void main();
