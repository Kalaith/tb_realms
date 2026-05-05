import { BaseApiService } from './baseApiService';
import { TransactionType } from '../entities/Portfolio';
import type { Portfolio, Transaction } from '../entities/Portfolio';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';
import { toApiError } from './apiErrorUtils';
import { unwrapData } from './apiResponseUtils';

/**
 * Service for managing portfolio data
 */
export class PortfolioService extends BaseApiService<Portfolio> {
  constructor() {
    super('portfolios');
  }

  /**
   * Convert portfolio timestamps to proper Date objects
   */
  private normalizePortfolioData(portfolio: unknown): Portfolio {
    const p = portfolio as Portfolio & {
      user_id?: string | number;
      cash_balance?: number;
      total_value?: number;
      daily_change?: number;
      daily_change_percentage?: number;
      positions?: Array<
        {
          stock_id?: string | number;
          stock_symbol?: string;
          stock_name?: string;
          quantity?: number;
          avg_cost_per_share?: number;
          current_price?: number;
          current_value?: number;
          profit_loss?: number;
          profit_loss_percentage?: number;
        } & Record<string, unknown>
      >;
      holdings?: Array<
        {
          stock_id?: string | number;
          stock_symbol?: string;
          stock_name?: string;
          quantity?: number;
          avg_cost_per_share?: number;
          current_price?: number;
          current_value?: number;
          profit_loss?: number;
          profit_loss_percentage?: number;
        } & Record<string, unknown>
      >;
      createdAt?: string | Date;
      created_at?: string | Date;
      updated_at?: string | Date;
      transactionHistory?: Array<Transaction & { timestamp: string | Date }>;
      transactions?: Array<
        Partial<Transaction> & {
          created_at?: string | Date;
          total_amount?: number;
          stock_symbol?: string;
        }
      >;
      performance?: {
        daily_change?: number;
        daily_change_percentage?: number;
        history?: Array<{ timestamp: string | Date; value: number }>;
      };
    };

    const asNumber = (value: unknown, fallback = 0): number =>
      typeof value === 'number' && Number.isFinite(value) ? value : fallback;

    const rawPositions = ((p as unknown as Record<string, unknown>).positions ??
      (p as unknown as Record<string, unknown>).holdings ??
      []) as Array<Record<string, unknown>>;

    const normalizedPositions = rawPositions.map(position => {
      const stockId = String(position.stock_id ?? position.stockId ?? '');
      const symbol = String(position.stock_symbol ?? position.symbol ?? '');
      const stockName = String(position.stock_name ?? symbol);
      const stockObj = position.stock as Record<string, unknown> | undefined;
      const currentPrice = asNumber(position.current_price ?? stockObj?.currentPrice);
      const quantity = asNumber(position.quantity ?? position.shares);
      const avgCost = asNumber(position.avg_cost_per_share ?? position.averageBuyPrice);
      const currentValue = asNumber(position.current_value ?? position.currentValue);
      const totalReturn = asNumber(position.profit_loss ?? position.totalReturn);
      const totalReturnPercentage = asNumber(
        position.profit_loss_percentage ?? position.totalReturnPercentage
      );

      return {
        stockId,
        symbol,
        stock: {
          id: stockId,
          symbol,
          name: stockName,
          currentPrice,
          previousClose: currentPrice,
          change: 0,
          changePercent: 0,
          sector: 'Unknown',
          volume: 0,
          marketCap: 0,
          priceHistory: [],
          yearLow: 0,
          yearHigh: 0,
          peRatio: 0,
          dividendYield: 0,
          beta: 0,
        },
        shares: quantity,
        averageBuyPrice: avgCost,
        currentValue,
        totalReturn,
        totalReturnPercentage,
      };
    });

    const rawTransactions = ((p as unknown as Record<string, unknown>).transactionHistory ??
      (p as unknown as Record<string, unknown>).transactions ??
      []) as Array<Record<string, unknown>>;

    const normalizedTransactions: Transaction[] = rawTransactions.map(tx =>
      this.normalizeTransaction(tx)
    );

    const dailyChange =
      asNumber(p.performance?.dailyChange) || asNumber(p.performance?.daily_change) || asNumber(p.daily_change);
    const dailyChangePercent =
      asNumber(p.performance?.dailyChangePercent) ||
      asNumber(p.performance?.daily_change_percentage) ||
      asNumber(p.daily_change_percentage);

    return {
      ...p,
      userId: String(p.userId ?? p.user_id ?? ''),
      cash: asNumber(p.cash ?? p.cash_balance),
      totalValue: asNumber(p.totalValue ?? p.total_value),
      positions: normalizedPositions,
      transactionHistory: normalizedTransactions,
      createdAt: p.createdAt
        ? new Date(p.createdAt)
        : p.created_at
          ? new Date(p.created_at)
          : new Date(),
      updatedAt: p.updatedAt
        ? new Date(p.updatedAt)
        : p.updated_at
          ? new Date(p.updated_at)
          : new Date(),
      performance: {
        dailyChange,
        dailyChangePercent,
        weeklyChange: p.performance?.weeklyChange ?? 0,
        weeklyChangePercent: p.performance?.weeklyChangePercent ?? 0,
        monthlyChange: p.performance?.monthlyChange ?? 0,
        monthlyChangePercent: p.performance?.monthlyChangePercent ?? 0,
        yearlyChange: p.performance?.yearlyChange ?? 0,
        yearlyChangePercent: p.performance?.yearlyChangePercent ?? 0,
        allTimeChange: p.performance?.allTimeChange ?? 0,
        allTimeChangePercent: p.performance?.allTimeChangePercent ?? 0,
        history: (p.performance?.history ?? []).map(point => ({
          ...point,
          timestamp: new Date(point.timestamp),
        })),
      },
    };
  }

  private normalizeTransaction(transaction: unknown): Transaction {
    const tx = transaction as Record<string, unknown>;
    const stock = tx.stock as Record<string, unknown> | undefined;
    const timestamp = (tx.timestamp ?? tx.created_at ?? new Date().toISOString()) as string | Date;
    const stockSymbol = String(tx.stockSymbol ?? tx.stock_symbol ?? tx.symbol ?? stock?.symbol ?? '');
    const type = String(tx.type ?? TransactionType.BUY).toUpperCase() as TransactionType;
    const asNumber = (value: unknown, fallback = 0): number =>
      typeof value === 'number' && Number.isFinite(value) ? value : fallback;

    return {
      id: String(tx.id ?? ''),
      stockId: String(tx.stockId ?? tx.stock_id ?? stock?.id ?? ''),
      stockSymbol,
      stockName: String(tx.stockName ?? tx.stock_name ?? stock?.name ?? stockSymbol),
      type,
      shares: asNumber(tx.shares ?? tx.quantity),
      price: asNumber(tx.price ?? tx.price_per_share),
      total: asNumber(tx.total ?? tx.totalAmount ?? tx.total_amount),
      timestamp: new Date(timestamp),
    };
  }

  /**
   * Get user's portfolio
   */
  async getUserPortfolio(userId: string): Promise<ApiResponse<Portfolio>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const path = userId === 'me' ? 'portfolio' : `${this.endpoint}/user/${encodeURIComponent(userId)}`;
      const response = await apiClient.get<unknown>(path);
      const portfolioData = unwrapData<unknown>(response.data);

      // Normalize the portfolio data with proper date objects
      const normalizedPortfolio = this.normalizePortfolioData(portfolioData);

      return {
        success: true,
        data: normalizedPortfolio,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to fetch user portfolio');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Execute a buy transaction
   */
  async buyStock(
    _portfolioId: string,
    stockId: string,
    shares: number,
    _price: number
  ): Promise<ApiResponse<Transaction>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.post<unknown>('transactions/buy', {
        stock_id: stockId,
        quantity: shares,
      });

      const payload = unwrapData<{ transaction?: unknown }>(response.data);
      const transaction = this.normalizeTransaction(payload.transaction ?? payload);

      return {
        success: true,
        data: transaction,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to process buy transaction');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Execute a sell transaction
   */
  async sellStock(
    _portfolioId: string,
    stockId: string,
    shares: number,
    _price: number
  ): Promise<ApiResponse<Transaction>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.post<unknown>('transactions/sell', {
        stock_id: stockId,
        quantity: shares,
      });

      const payload = unwrapData<{ transaction?: unknown }>(response.data);
      const transaction = this.normalizeTransaction(payload.transaction ?? payload);

      return {
        success: true,
        data: transaction,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to process sell transaction');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Fetches the transaction history for a user's portfolio
   * @param portfolioId The ID of the portfolio
   * @returns Promise with transaction history data
   */
  async getUserTransactions(_portfolioId: string): Promise<ApiResponse<Transaction[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>('transactions');
      const payload = unwrapData<unknown>(response.data);
      const transactionData =
        payload && typeof payload === 'object' && 'transactions' in payload
          ? (payload as { transactions?: unknown[] }).transactions
          : payload;
      const normalizedTransactions = Array.isArray(transactionData)
        ? transactionData.map(tx => this.normalizeTransaction(tx))
        : [];

      return {
        success: true,
        data: normalizedTransactions,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to fetch transaction history');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }
}

// Create and export singleton instance
export const portfolioService = new PortfolioService();
