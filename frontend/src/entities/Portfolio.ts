import { Stock } from "./Stock";

export interface Portfolio {
  id: string;
  userId: string;
  cash: number;
  totalValue: number;
  positions: Position[];
  transactionHistory: Transaction[];
  createdAt: Date;
  performance: PortfolioPerformance;
}

export interface Position {
  stockId: string;
  stock: Stock;
  shares: number;
  averageBuyPrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
}

export interface Transaction {
  id: string;
  stockId: string;
  stockSymbol: string;
  stockName: string;
  type: TransactionType;
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

export enum TransactionType {
  BUY = "buy",
  SELL = "sell",
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
