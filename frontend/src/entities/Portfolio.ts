import { Stock } from './Stock';

export interface Portfolio {
  id: string;
  userId: string;
  cash: number;
  totalValue: number;
  dayChange?: number;
  dayChangePercentage?: number;
  positions: Position[];
  transactionHistory: Transaction[];
  updatedAt?: Date;
  createdAt?: Date;
  performance: PortfolioPerformance;
}

export interface Position {
  id?: string;
  stockId: string;
  symbol?: string;
  stock: Stock;
  shares: number;
  averageCost?: number;
  averageBuyPrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  stockId: string;
  symbol?: string;
  stockSymbol: string;
  stockName: string;
  type: TransactionType;
  shares: number;
  price: number;
  totalAmount?: number;
  fee?: number;
  total: number;
  createdAt?: Date;
  timestamp: Date;
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface PortfolioPerformance {
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  yearlyChange: number;
  yearlyChangePercent: number;
  allTimeChange: number;
  allTimeChangePercent: number;
  history: PerformancePoint[];
}

export interface PerformancePoint {
  timestamp: Date;
  value: number;
}
