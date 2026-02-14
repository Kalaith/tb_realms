import {
  Portfolio,
  Position,
  Transaction,
  TransactionType,
  PerformancePoint,
} from '../entities/Portfolio';
import { Stock } from '../entities/Stock';
import { ApiResponse } from '../entities/api';
import { generateId, createSuccessResponse, createErrorResponse } from './apiUtils';

/**
 * Generates mock performance history for a portfolio
 */
export function generatePerformanceHistory(
  startValue: number,
  days: number = 30
): PerformancePoint[] {
  const performanceHistory: PerformancePoint[] = [];
  let currentValue = startValue;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Random daily change between -2% and +2%
    const dailyChange = Math.random() * 4 - 2;
    currentValue = currentValue * (1 + dailyChange / 100);

    performanceHistory.push({
      timestamp: new Date(date),
      value: parseFloat(currentValue.toFixed(2)),
    });
  }

  return performanceHistory;
}

/**
 * Execute a buy transaction
 */
export function executeBuyTransaction(
  portfolio: Portfolio,
  stock: Stock,
  shares: number,
  price: number
): ApiResponse<Transaction> {
  const total = shares * price;

  // Check if user has enough cash
  if (portfolio.cash < total) {
    return createErrorResponse(
      'INSUFFICIENT_FUNDS',
      'Not enough cash to complete this transaction'
    );
  }

  // Create transaction
  const transaction: Transaction = {
    id: generateId('tx_'),
    stockId: stock.id,
    stockSymbol: stock.symbol,
    stockName: stock.name,
    type: TransactionType.BUY,
    shares,
    price,
    total,
    timestamp: new Date(),
  };

  // Update portfolio cash
  portfolio.cash -= total;

  // Update or create position
  const existingPosition = portfolio.positions.find(p => p.stockId === stock.id);
  if (existingPosition) {
    const totalShares = existingPosition.shares + shares;
    const totalCost = existingPosition.shares * existingPosition.averageBuyPrice + total;

    // Update average buy price
    existingPosition.averageBuyPrice = totalCost / totalShares;
    existingPosition.shares = totalShares;
    existingPosition.currentValue = totalShares * stock.currentPrice;
    existingPosition.totalReturn =
      existingPosition.currentValue - totalShares * existingPosition.averageBuyPrice;
    existingPosition.totalReturnPercentage =
      (stock.currentPrice / existingPosition.averageBuyPrice - 1) * 100;
    existingPosition.stock = stock;
  } else {
    // Create new position
    const newPosition: Position = {
      stockId: stock.id,
      stock: stock,
      shares,
      averageBuyPrice: price,
      currentValue: shares * stock.currentPrice,
      totalReturn: shares * stock.currentPrice - total,
      totalReturnPercentage: (stock.currentPrice / price - 1) * 100,
    };
    portfolio.positions.push(newPosition);
  }

  // Add transaction to history
  portfolio.transactionHistory.push(transaction);

  // Update total portfolio value
  updatePortfolioTotalValue(portfolio);

  return createSuccessResponse(transaction);
}

/**
 * Execute a sell transaction
 */
export function executeSellTransaction(
  portfolio: Portfolio,
  stock: Stock,
  shares: number,
  price: number,
  positionIndex: number
): ApiResponse<Transaction> {
  const position = portfolio.positions[positionIndex];
  if (position.shares < shares) {
    return createErrorResponse(
      'INSUFFICIENT_SHARES',
      'Not enough shares to complete this transaction'
    );
  }

  const total = shares * price;

  // Create transaction
  const transaction: Transaction = {
    id: generateId('tx_'),
    stockId: stock.id,
    stockSymbol: stock.symbol,
    stockName: stock.name,
    type: TransactionType.SELL,
    shares,
    price,
    total,
    timestamp: new Date(),
  };

  // Update portfolio cash
  portfolio.cash += total;

  // Update position
  position.shares -= shares;

  // If no shares left, remove the position
  if (position.shares === 0) {
    portfolio.positions.splice(positionIndex, 1);
  } else {
    // Update position value
    position.currentValue = position.shares * stock.currentPrice;
    position.totalReturn = position.currentValue - position.shares * position.averageBuyPrice;
    position.totalReturnPercentage = (stock.currentPrice / position.averageBuyPrice - 1) * 100;
  }

  // Add transaction to history
  portfolio.transactionHistory.push(transaction);

  // Update total portfolio value
  updatePortfolioTotalValue(portfolio);

  return createSuccessResponse(transaction);
}

/**
 * Update the total portfolio value
 */
export function updatePortfolioTotalValue(portfolio: Portfolio): void {
  portfolio.totalValue =
    portfolio.cash +
    portfolio.positions.reduce((sum, position) => {
      return sum + position.currentValue;
    }, 0);
}
