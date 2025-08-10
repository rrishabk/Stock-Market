import Papa from 'papaparse';
import type { OHLCV } from './types';

function toNumber(val?: string | number | null): number {
  if (val === undefined || val === null) return NaN;
  if (typeof val === 'number') return val;
  return Number(String(val).replace(/[$,\s]/g, ''));
}

function toISO(dateStr: string): string {
  const s = String(dateStr).trim();
  // Already ISO-like
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // US format MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [mm, dd, yyyy] = s.split('/');
    return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
  }
  // Fallback: Date parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
  throw new Error(`Unrecognized date format: ${s}`);
}

function normalizeKey(k: string) {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseRow(raw: Record<string, any>): OHLCV | null {
  // Build normalized lookup
  const map: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k == null) continue;
    map[normalizeKey(k)] = v as string;
  }

  const dateVal = map['date'] ?? map['givdate'];
  if (!dateVal) return null;

  const open = toNumber(map['open']);
  const high = toNumber(map['high']);
  const low = toNumber(map['low']);
  const close = toNumber(map['closelast'] ?? map['close'] ?? map['adjclose'] ?? map['adjustedclose']);
  const volume = toNumber(map['volume']);

  if ([open, high, low, close, volume].some((n) => Number.isNaN(n))) return null;

  return {
    date: toISO(String(dateVal)),
    open, high, low, close, volume,
  };
}

function parseFromRecords(records: Record<string, string>[]): OHLCV[] {
  const rows: OHLCV[] = [];
  for (const row of records) {
    const parsed = parseRow(row);
    if (parsed) rows.push(parsed);
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

export function parseCsvText(text: string): OHLCV[] {
  const { data } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parseFromRecords(data);
}

export function parseCsvFile(file: File): Promise<OHLCV[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          resolve(parseFromRecords(res.data));
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}
