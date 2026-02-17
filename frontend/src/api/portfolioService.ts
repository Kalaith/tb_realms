import { BaseApiService } from './baseApiService';
import { Portfolio, Transaction, TransactionType } from '../entities/Portfolio';
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

    const normalizedTransactions: Transaction[] = rawTransactions.map(tx => {
      const timestamp = (tx.timestamp ?? tx.created_at ?? new Date().toISOString()) as string | Date;
      const total = asNumber(tx.total ?? tx.totalAmount ?? tx.total_amount);
      const stockSymbol = String(tx.stockSymbol ?? tx.stock_symbol ?? tx.symbol ?? '');
      return {
        id: String(tx.id ?? ''),
        stockId: String(tx.stockId ?? tx.stock_id ?? ''),
        stockSymbol,
        stockName: String(tx.stockName ?? stockSymbol),
        type: (tx.type as TransactionType) ?? TransactionType.BUY,
        shares: asNumber(tx.shares),
        price: asNumber(tx.price),
        total,
        timestamp: new Date(timestamp),
      };
    });

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
      const response = await apiClient.get<unknown>(`${this.endpoint}/user/${userId}`);
      const portfolioData = unwrapData<unknown>(response);

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
    portfolioId: string,
    stockId: string,
    shares: number,
    price: number
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
      const response = await apiClient.post<
        unknown,
        {
          stockId: string;
          shares: number;
          price: number;
          type: TransactionType;
        }
      >(`${this.endpoint}/${portfolioId}/transaction`, {
        stockId,
        shares,
        price,
        type: TransactionType.BUY,
      });

      const rawTransaction = unwrapData<Transaction & { timestamp: string | Date }>(response);
      const transaction: Transaction = {
        ...rawTransaction,
        timestamp: new Date(rawTransaction.timestamp),
      };

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
    portfolioId: string,
    stockId: string,
    shares: number,
    price: number
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
      const response = await apiClient.post<
        unknown,
        {
          stockId: string;
          shares: number;
          price: number;
          type: TransactionType;
        }
      >(`${this.endpoint}/${portfolioId}/transaction`, {
        stockId,
        shares,
        price,
        type: TransactionType.SELL,
      });

      const rawTransaction = unwrapData<Transaction & { timestamp: string | Date }>(response);
      const transaction: Transaction = {
        ...rawTransaction,
        timestamp: new Date(rawTransaction.timestamp),
      };

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
  async getUserTransactions(portfolioId: string): Promise<ApiResponse<Transaction[]>> {
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
      const response = await apiClient.get<unknown>(`${this.endpoint}/${portfolioId}/transactions`);
      const transactions = unwrapData<unknown[]>(response);

      // Normalize transaction timestamps
      const normalizedTransactions = transactions.map(tx => {
        const raw = tx as Transaction & { timestamp: string | Date };
        return { ...raw, timestamp: new Date(raw.timestamp) } as Transaction;
      });

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
