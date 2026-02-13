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
  Day = '1D',
  Week = '1W',
  Month = '1M',
  ThreeMonths = '3M',
  SixMonths = '6M',
  Year = '1Y',
  FiveYears = '5Y',
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
