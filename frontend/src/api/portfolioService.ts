import { BaseApiService } from "./baseApiService";
import { Portfolio, Transaction, TransactionType } from "../entities/Portfolio";
import { ApiResponse } from "../entities/api";
import apiClient from "./apiClient";
import { toApiError } from "./apiErrorUtils";
import { unwrapData } from "./apiResponseUtils";

/**
 * Service for managing portfolio data
 */
export class PortfolioService extends BaseApiService<Portfolio> {
  constructor() {
    super("portfolios");
  }

  /**
   * Convert portfolio timestamps to proper Date objects
   */
  private normalizePortfolioData(portfolio: unknown): Portfolio {
    const p = portfolio as Portfolio & {
      createdAt?: string | Date;
      transactionHistory?: Array<Transaction & { timestamp: string | Date }>;
      performance?: {
        history?: Array<{ timestamp: string | Date; value: number }>;
      };
    };

    return {
      ...p,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      transactionHistory: (p.transactionHistory ?? []).map((tx) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
      })),
      performance: {
        dailyChange: p.performance?.dailyChange ?? 0,
        dailyChangePercent: p.performance?.dailyChangePercent ?? 0,
        weeklyChange: p.performance?.weeklyChange ?? 0,
        weeklyChangePercent: p.performance?.weeklyChangePercent ?? 0,
        monthlyChange: p.performance?.monthlyChange ?? 0,
        monthlyChangePercent: p.performance?.monthlyChangePercent ?? 0,
        yearlyChange: p.performance?.yearlyChange ?? 0,
        yearlyChangePercent: p.performance?.yearlyChangePercent ?? 0,
        allTimeChange: p.performance?.allTimeChange ?? 0,
        allTimeChangePercent: p.performance?.allTimeChangePercent ?? 0,
        history: (p.performance?.history ?? []).map((point) => ({
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
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/user/${userId}`,
      );
      const portfolioData = unwrapData<unknown>(response);

      // Normalize the portfolio data with proper date objects
      const normalizedPortfolio = this.normalizePortfolioData(portfolioData);

      return {
        success: true,
        data: normalizedPortfolio,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch user portfolio");
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
    price: number,
  ): Promise<ApiResponse<Transaction>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
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

      const rawTransaction = unwrapData<
        Transaction & { timestamp: string | Date }
      >(response);
      const transaction: Transaction = {
        ...rawTransaction,
        timestamp: new Date(rawTransaction.timestamp),
      };

      return {
        success: true,
        data: transaction,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to process buy transaction");
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
    price: number,
  ): Promise<ApiResponse<Transaction>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
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

      const rawTransaction = unwrapData<
        Transaction & { timestamp: string | Date }
      >(response);
      const transaction: Transaction = {
        ...rawTransaction,
        timestamp: new Date(rawTransaction.timestamp),
      };

      return {
        success: true,
        data: transaction,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to process sell transaction");
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
  async getUserTransactions(
    portfolioId: string,
  ): Promise<ApiResponse<Transaction[]>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return {
        success: false,
        error: {
          code: "NOT_IMPLEMENTED",
          message: "Mock implementation not used",
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(
        `${this.endpoint}/${portfolioId}/transactions`,
      );
      const transactions = unwrapData<unknown[]>(response);

      // Normalize transaction timestamps
      const normalizedTransactions = transactions.map((tx) => {
        const raw = tx as Transaction & { timestamp: string | Date };
        return { ...raw, timestamp: new Date(raw.timestamp) } as Transaction;
      });

      return {
        success: true,
        data: normalizedTransactions,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch transaction history");
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
