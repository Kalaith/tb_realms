/**
 * Data transformation utilities for converting between API responses and frontend models
 * Handles the mapping between snake_case (backend) and camelCase (frontend) conventions
 */

import { Stock } from '../entities/Stock';
import { AuthUser } from '../entities/Auth';
import { Portfolio, Position, Transaction } from '../entities/Portfolio';

// API response interfaces (snake_case)
export interface StockApiResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  previous_close: number;
  day_change: number;
  day_change_percentage: number;
  sector?: string;
  volume: number;
  market_cap: number;
  description?: string;
  year_low?: number;
  year_high?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  beta?: number;
  last_updated?: string;
}

export interface PortfolioApiResponse {
  id: string;
  user_id: string;
  cash: number;
  total_value: number;
  day_change: number;
  day_change_percentage: number;
  positions: PositionApiResponse[];
  updated_at: string;
}

export interface PositionApiResponse {
  id: string;
  stock_id: string;
  symbol: string;
  shares: number;
  average_cost: number;
  current_value: number;
  total_return: number;
  total_return_percentage: number;
}

export interface TransactionApiResponse {
  id: string;
  user_id: string;
  stock_id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_amount: number;
  fee: number;
  created_at: string;
}

export interface UserApiResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transforms stock data from API response to frontend model
 */
export class StockTransformer {
  static fromApi(apiStock: StockApiResponse): Stock {
    return {
      id: apiStock.id,
      symbol: apiStock.symbol,
      name: apiStock.name,
      currentPrice: apiStock.current_price,
      previousClose: apiStock.previous_close,
      change: apiStock.day_change,
      changePercent: apiStock.day_change_percentage,
      sector: apiStock.sector || 'Unknown',
      volume: apiStock.volume,
      marketCap: apiStock.market_cap,
      description: apiStock.description,
      priceHistory: [], // Will be populated separately if needed
      yearLow: apiStock.year_low || 0,
      yearHigh: apiStock.year_high || 0,
      peRatio: apiStock.pe_ratio || 0,
      dividendYield: apiStock.dividend_yield || 0,
      beta: apiStock.beta || 0,
    };
  }

  static fromApiArray(apiStocks: StockApiResponse[]): Stock[] {
    return apiStocks.map(this.fromApi);
  }

  static toApi(stock: Partial<Stock>): Partial<StockApiResponse> {
    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      current_price: stock.currentPrice,
      previous_close: stock.previousClose,
      day_change: stock.change,
      day_change_percentage: stock.changePercent,
      sector: stock.sector,
      volume: stock.volume,
      market_cap: stock.marketCap,
      description: stock.description,
      year_low: stock.yearLow,
      year_high: stock.yearHigh,
      pe_ratio: stock.peRatio,
      dividend_yield: stock.dividendYield,
      beta: stock.beta,
    };
  }
}

/**
 * Transforms portfolio data from API response to frontend model
 */
export class PortfolioTransformer {
  static fromApi(apiPortfolio: PortfolioApiResponse): Portfolio {
    return {
      id: apiPortfolio.id,
      userId: apiPortfolio.user_id,
      cash: apiPortfolio.cash,
      totalValue: apiPortfolio.total_value,
      dayChange: apiPortfolio.day_change,
      dayChangePercentage: apiPortfolio.day_change_percentage,
      positions: apiPortfolio.positions.map(PositionTransformer.fromApi),
      updatedAt: new Date(apiPortfolio.updated_at),
    };
  }

  static toApi(portfolio: Partial<Portfolio>): Partial<PortfolioApiResponse> {
    return {
      id: portfolio.id,
      user_id: portfolio.userId,
      cash: portfolio.cash,
      total_value: portfolio.totalValue,
      day_change: portfolio.dayChange,
      day_change_percentage: portfolio.dayChangePercentage,
      positions: portfolio.positions?.map(PositionTransformer.toApi),
      updated_at: portfolio.updatedAt?.toISOString(),
    };
  }
}

/**
 * Transforms position data from API response to frontend model
 */
export class PositionTransformer {
  static fromApi(apiPosition: PositionApiResponse): Position {
    return {
      id: apiPosition.id,
      stockId: apiPosition.stock_id,
      symbol: apiPosition.symbol,
      shares: apiPosition.shares,
      averageCost: apiPosition.average_cost,
      currentValue: apiPosition.current_value,
      totalReturn: apiPosition.total_return,
      totalReturnPercentage: apiPosition.total_return_percentage,
    };
  }

  static toApi(position: Partial<Position>): Partial<PositionApiResponse> {
    return {
      id: position.id,
      stock_id: position.stockId,
      symbol: position.symbol,
      shares: position.shares,
      average_cost: position.averageCost,
      current_value: position.currentValue,
      total_return: position.totalReturn,
      total_return_percentage: position.totalReturnPercentage,
    };
  }
}

/**
 * Transforms transaction data from API response to frontend model
 */
export class TransactionTransformer {
  static fromApi(apiTransaction: TransactionApiResponse): Transaction {
    return {
      id: apiTransaction.id,
      userId: apiTransaction.user_id,
      stockId: apiTransaction.stock_id,
      symbol: apiTransaction.symbol,
      type: apiTransaction.type,
      shares: apiTransaction.shares,
      price: apiTransaction.price,
      totalAmount: apiTransaction.total_amount,
      fee: apiTransaction.fee,
      createdAt: new Date(apiTransaction.created_at),
    };
  }

  static fromApiArray(apiTransactions: TransactionApiResponse[]): Transaction[] {
    return apiTransactions.map(this.fromApi);
  }

  static toApi(transaction: Partial<Transaction>): Partial<TransactionApiResponse> {
    return {
      id: transaction.id,
      user_id: transaction.userId,
      stock_id: transaction.stockId,
      symbol: transaction.symbol,
      type: transaction.type,
      shares: transaction.shares,
      price: transaction.price,
      total_amount: transaction.totalAmount,
      fee: transaction.fee,
      created_at: transaction.createdAt?.toISOString(),
    };
  }
}

/**
 * Transforms user data from API response to frontend model
 */
export class UserTransformer {
  static fromApi(apiUser: UserApiResponse): AuthUser {
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      displayName: apiUser.display_name || `${apiUser.first_name} ${apiUser.last_name}`,
      avatarUrl: apiUser.avatar_url,
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
      // Note: token will be added separately during authentication
      token: '',
    };
  }

  static toApi(user: Partial<AuthUser>): Partial<UserApiResponse> {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt?.toISOString(),
      updated_at: user.updatedAt?.toISOString(),
    };
  }
}

/**
 * Generic transformer for handling common patterns
 */
export class GenericTransformer {
  /**
   * Converts snake_case keys to camelCase recursively
   */
  static snakeToCamel<T = any>(obj: any): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.snakeToCamel(item)) as T;
    }

    const camelObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = this.snakeToCamel(value);
    }

    return camelObj as T;
  }

  /**
   * Converts camelCase keys to snake_case recursively
   */
  static camelToSnake<T = any>(obj: any): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.camelToSnake(item)) as T;
    }

    const snakeObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = this.camelToSnake(value);
    }

    return snakeObj as T;
  }
}
