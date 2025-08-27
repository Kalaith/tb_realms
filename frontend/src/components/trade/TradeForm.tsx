import React, { useCallback } from 'react';
import { TradeFormProps } from '../../entities/Trade';
import { formatCurrency } from '../../utils/formatUtils';
import { TransactionType, Position } from '../../entities/Portfolio';

/**
 * TradeForm component - Provides interface for buying and selling stocks
 * Includes trade type selector, share quantity, and estimated total
 */
const TradeForm: React.FC<TradeFormProps> = ({
  stock,
  userPortfolio,
  tradeShares,
  tradeType,
  tradeAmount,
  onTradeTypeChange,
  onSharesChange,
  onConfirmRequest,
  loading
}) => {
  // Get position for current stock
  const getCurrentPosition = useCallback(() => {
    if (!stock || !userPortfolio) return null;
    return userPortfolio.positions.find((p: Position) => p.stockId === stock.id);
  }, [stock, userPortfolio]);
  
  const currentPosition = getCurrentPosition();

  // Check if user can afford trade
  const canAffordTrade = useCallback(() => {
    if (!stock || !userPortfolio || tradeShares <= 0) return false;
    
    if (tradeType === TransactionType.BUY) {
      return userPortfolio.cash >= tradeAmount;
    } else {
      const position = getCurrentPosition();
      return position && position.shares >= tradeShares;
    }
  }, [stock, userPortfolio, tradeType, tradeShares, tradeAmount, getCurrentPosition]);

  return (
    <div className="w-full" role="form" aria-labelledby="trade-form-title">
      <h3 id="trade-form-title" className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Place an Order</h3>
      
      <div className="flex mb-4 border border-gray-200 rounded-md overflow-hidden dark:border-gray-700" role="radiogroup" aria-label="Trade type">
        <button 
          className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
            tradeType === TransactionType.BUY 
              ? 'bg-green-500 text-white dark:bg-green-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => onTradeTypeChange(TransactionType.BUY)}
          aria-pressed={tradeType === TransactionType.BUY}
        >
          Buy
        </button>
        <button 
          className={`flex-1 py-2 px-4 text-center font-medium transition-colors ${
            tradeType === TransactionType.SELL 
              ? 'bg-red-500 text-white dark:bg-red-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          } ${!currentPosition ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onTradeTypeChange(TransactionType.SELL)}
          disabled={!currentPosition}
          aria-pressed={tradeType === TransactionType.SELL}
          aria-disabled={!currentPosition}
        >
          Sell
        </button>
      </div>
      
      {tradeType === TransactionType.SELL && currentPosition && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded" role="status">
            Shares Owned: <strong className="font-medium text-gray-800 dark:text-gray-200">{currentPosition.shares}</strong>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="shares" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Number of Shares</label>
        <input 
          type="number" 
          id="shares" 
          value={tradeShares}
          onChange={(e) => onSharesChange(parseInt(e.target.value) || 0)}
          min="1"
          step="1"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Number of shares to trade"
          aria-describedby="shares-error"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Market Price</label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200" aria-live="polite">
          {stock ? formatCurrency(stock.currentPrice) : '$0.00'}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Total</label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-gray-200" aria-live="polite">
          {formatCurrency(tradeAmount)}
        </div>
      </div>
      
      {tradeType === TransactionType.BUY && 
       userPortfolio && 
       tradeAmount > userPortfolio.cash && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200" id="shares-error" role="alert">
          Insufficient funds. Available: {formatCurrency(userPortfolio.cash)}
        </div>
      )}
      
      {tradeType === TransactionType.SELL && 
       currentPosition && 
       tradeShares > currentPosition.shares && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200" id="shares-error" role="alert">
          Insufficient shares. Available: {currentPosition.shares}
        </div>
      )}
      
      <button 
        className={`w-full py-3 px-4 font-medium rounded-md transition-colors ${
          !canAffordTrade() || loading || tradeShares <= 0 || !stock
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : tradeType === TransactionType.BUY
              ? 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800'
              : 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800'
        }`}
        onClick={onConfirmRequest}
        disabled={!canAffordTrade() || loading || tradeShares <= 0 || !stock}
        aria-disabled={!canAffordTrade() || loading || tradeShares <= 0 || !stock}
      >
        {loading ? 'Processing...' : (tradeType === TransactionType.BUY ? 'Buy Shares' : 'Sell Shares')}
      </button>
    </div>
  );
};

export default TradeForm;