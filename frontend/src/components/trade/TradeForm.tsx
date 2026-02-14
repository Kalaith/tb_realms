import React, { useCallback, useState } from 'react';
import { TradeFormProps } from '../../entities/Trade';
import { formatCurrency } from '../../utils/formatUtils';
import { TransactionType, Position } from '../../entities/Portfolio';
import { validateTrade, tradeConstraints } from '../../utils/tradeValidation';

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
  loading,
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get position for current stock
  const getCurrentPosition = useCallback(() => {
    if (!stock || !userPortfolio) return null;
    return userPortfolio.positions.find((p: Position) => p.stockId === stock.id);
  }, [stock, userPortfolio]);

  const currentPosition = getCurrentPosition();

  // Validate trade and check if user can afford it
  const validateCurrentTrade = useCallback(() => {
    if (!stock || !userPortfolio)
      return { isValid: false, errors: ['Stock or portfolio data missing'] };

    const validation = validateTrade(
      tradeShares,
      tradeAmount,
      tradeType,
      userPortfolio.cash,
      currentPosition?.shares
    );

    setValidationErrors(validation.errors);
    return validation;
  }, [stock, userPortfolio, tradeShares, tradeAmount, tradeType, currentPosition]);

  // Handle shares input change with validation
  const handleSharesChange = useCallback(
    (value: string) => {
      const numericValue = parseInt(value) || 0;

      // Basic client-side validation
      if (numericValue < 0) return;
      if (numericValue > tradeConstraints.MAX_SHARES_PER_TRADE) return;

      onSharesChange(numericValue);

      // Clear previous validation errors when user starts typing
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    },
    [onSharesChange, validationErrors.length]
  );

  const canAffordTrade = useCallback(() => {
    const validation = validateCurrentTrade();
    return validation.isValid && tradeShares > 0;
  }, [validateCurrentTrade, tradeShares]);

  return (
    <div className="w-full" role="form" aria-labelledby="trade-form-title">
      <h3
        id="trade-form-title"
        className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4"
      >
        Place an Order
      </h3>

      <div
        className="flex mb-4 border border-gray-200 rounded-md overflow-hidden dark:border-gray-700"
        role="radiogroup"
        aria-label="Trade type"
      >
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
          <div
            className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded"
            role="status"
          >
            Shares Owned:{' '}
            <strong className="font-medium text-gray-800 dark:text-gray-200">
              {currentPosition.shares}
            </strong>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="shares"
          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Number of Shares
        </label>
        <input
          type="number"
          id="shares"
          value={tradeShares}
          onChange={e => handleSharesChange(e.target.value)}
          min={tradeConstraints.MIN_SHARES}
          max={tradeConstraints.MAX_SHARES_PER_TRADE}
          step="1"
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
            validationErrors.length > 0
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }`}
          aria-label="Number of shares to trade"
          aria-describedby="shares-error"
          aria-invalid={validationErrors.length > 0}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Market Price
        </label>
        <div
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"
          aria-live="polite"
        >
          {stock ? formatCurrency(stock.currentPrice) : '$0.00'}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Estimated Total
        </label>
        <div
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-gray-200"
          aria-live="polite"
        >
          {formatCurrency(tradeAmount)}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div
          className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200"
          id="shares-error"
          role="alert"
        >
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
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
        {loading
          ? 'Processing...'
          : tradeType === TransactionType.BUY
            ? 'Buy Shares'
            : 'Sell Shares'}
      </button>
    </div>
  );
};

export default TradeForm;
