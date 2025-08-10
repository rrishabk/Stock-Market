export type DataMode = 'mock' | 'csv' | 'api';

export const DATA_MODE: DataMode = 'mock';

export const DEFAULT_TICKER = 'AAPL';

export const RANGE_OPTIONS = ['1D','1W','1M','6M','1Y','Max'] as const;
export type RangeOption = typeof RANGE_OPTIONS[number];
