import { BaseApiService } from './baseApiService';
import { Portfolio, Transaction, TransactionType } from '../entities/Portfolio';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';

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
  private normalizePortfolioData(portfolio: any): Portfolio {
    return {
      ...portfolio,
      createdAt: portfolio.createdAt ? new Date(portfolio.createdAt) : new Date(),
      transactionHistory: portfolio.transactionHistory?.map((tx: any) => ({
        ...tx,
        timestamp: new Date(tx.timestamp)
      })) || [],
      performance: {
        ...portfolio.performance,
        history: portfolio.performance?.history?.map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp)
        })) || []
      }
    };
  }
  
  /**
   * Get user's portfolio
   */
  async getUserPortfolio(userId: string): Promise<ApiResponse<Portfolio>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user/${userId}`);
      const portfolioData = response.data || response;
      
      // Normalize the portfolio data with proper date objects
      const normalizedPortfolio = this.normalizePortfolioData(portfolioData);
      
      return {
        success: true,
        data: normalizedPortfolio
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch user portfolio',
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
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.post(`${this.endpoint}/${portfolioId}/transaction`, {
        stockId,
        shares,
        price,
        type: TransactionType.BUY
      });
      
      const transaction = response.data || response;
      
      // Convert timestamp to Date object
      if (transaction.timestamp) {
        transaction.timestamp = new Date(transaction.timestamp);
      }
      
      return {
        success: true,
        data: transaction
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to process buy transaction',
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
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.post(`${this.endpoint}/${portfolioId}/transaction`, {
        stockId,
        shares,
        price,
        type: TransactionType.SELL
      });
      
      const transaction = response.data || response;
      
      // Convert timestamp to Date object
      if (transaction.timestamp) {
        transaction.timestamp = new Date(transaction.timestamp);
      }
      
      return {
        success: true,
        data: transaction
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to process sell transaction',
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
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/${portfolioId}/transactions`);
      const transactions = response.data || response;
      
      // Normalize transaction timestamps
      const normalizedTransactions = transactions.map((tx: any) => ({
        ...tx,
        timestamp: new Date(tx.timestamp)
      }));
      
      return {
        success: true,
        data: normalizedTransactions
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch transaction history',
        },
      };
    }
  }
}

// Create and export singleton instance
export const portfolioService = new PortfolioService();