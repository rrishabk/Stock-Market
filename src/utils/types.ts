export interface Company {
  ticker: string;
  name: string;
  exchange: string;
}

export interface OHLCV {
  date: string; // ISO YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type PriceSeries = Record<string, OHLCV[]>;
