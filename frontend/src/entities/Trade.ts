import { Stock, TimeFrame } from "./Stock";
import { Transaction, TransactionType, Portfolio } from "./Portfolio";

/**
 * Props interface for the StockList component
 */
export interface StockListProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Props interface for the StockDetail component
 */
export interface StockDetailProps {
  stock: Stock;
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

/**
 * Result of a trade operation
 */
export interface TradeResult {
  success: boolean;
  transactionId?: string;
  transaction?: Transaction;
  newCashBalance?: number;
  message?: string;
  errorCode?: string;
}

/**
 * Props interface for the TradeForm component
 */
export interface TradeFormProps {
  stock: Stock | null;
  userPortfolio: Portfolio | null;
  tradeShares: number;
  tradeType: TransactionType;
  tradeAmount: number;
  onTradeTypeChange: (type: TransactionType) => void;
  onSharesChange: (shares: number) => void;
  onConfirmRequest: () => void;
  loading: boolean;
}

/**
 * Props interface for the TransactionList component
 */
export interface TransactionListProps {
  transactions: Transaction[];
}

/**
 * Props interface for the TradeConfirmation component
 */
export interface TradeConfirmationProps {
  stock: Stock;
  tradeType: TransactionType;
  shares: number;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  canAfford: boolean;
}

/**
 * Props interface for the TradeNotification component
 */
export interface TradeNotificationProps {
  tradeResult: TradeResult | null;
  visible: boolean;
}
