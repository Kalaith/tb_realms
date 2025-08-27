export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  sector: string;
  volume: number;
  marketCap: number;
  description?: string;
  priceHistory: PricePoint[];
  yearLow: number;
  yearHigh: number;
  peRatio: number;
  dividendYield: number;
  beta: number;
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

export enum TimeFrame {
  DAY = '1D',
  WEEK = '1W',
  MONTH = '1M',
  THREE_MONTHS = '3M',
  SIX_MONTHS = '6M',
  YEAR = '1Y',
  FIVE_YEARS = '5Y',
}

export type StockSector = 
  | 'Technology'
  | 'Healthcare'
  | 'Financial'
  | 'Consumer Cyclical'
  | 'Energy'
  | 'Utilities'
  | 'Materials'
  | 'Real Estate'
  | 'Communication Services'
  | 'Industrial'
  | 'Consumer Defensive';