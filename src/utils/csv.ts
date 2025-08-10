import Papa from 'papaparse';
import type { OHLCV } from './types';

function toNumber(val: string | number): number {
  if (typeof val === 'number') return val;
  return Number(val.replace(/[$,\s]/g, ''));
}

function toISO(dateStr: string): string {
  // Input format like MM/DD/YYYY
  const [mm, dd, yyyy] = dateStr.split('/');
  return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
}

export function parseCsvText(text: string): OHLCV[] {
  const { data } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: OHLCV[] = [];
  for (const row of data) {
    if (!row.Date) continue;
    try {
      rows.push({
        date: toISO(row.Date),
        open: toNumber(row.Open ?? row['Open ']),
        high: toNumber(row.High ?? row['High ']),
        low: toNumber(row.Low ?? row['Low ']),
        close: toNumber(row['Close/Last'] ?? row.Close ?? row['Close ']),
        volume: toNumber(row.Volume ?? row['Volume ']),
      });
    } catch (_) {
      // ignore malformed rows
    }
  }

  // Sort ascending by date
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

export function parseCsvFile(file: File): Promise<OHLCV[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        try {
          const rows = res.data
            .filter((r) => !!r.Date)
            .map((r) => ({
              date: toISO(r.Date!),
              open: toNumber(r.Open ?? r['Open ']),
              high: toNumber(r.High ?? r['High ']),
              low: toNumber(r.Low ?? r['Low ']),
              close: toNumber(r['Close/Last'] ?? r.Close ?? r['Close ']),
              volume: toNumber(r.Volume ?? r['Volume ']),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}
