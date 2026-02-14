import React, { useState, useMemo, useEffect } from 'react';
import { Position } from '../../entities/Portfolio';
import { formatCurrency } from '../../utils/formatUtils';

type TransactionModalProps = {
  isOpen: boolean;
  type: 'buy' | 'sell';
  position: Position;
  portfolioCash: number;
  onClose: () => void;
  onExecute: (shares: number) => void;
  transactionStatus: 'idle' | 'loading' | 'success' | 'error';
  transactionMessage: string;
};

/**
 * Modal component for buying and selling stocks
 */
const TransactionModal = ({
  isOpen,
  type,
  position,
  portfolioCash,
  onClose,
  onExecute,
  transactionStatus,
  transactionMessage,
}: TransactionModalProps) => {
  const [shares, setShares] = useState<number>(type === 'buy' ? 1 : Math.min(10, position.shares));

  // Reset shares when modal opens/changes position or type
  useEffect(() => {
    setShares(type === 'buy' ? 1 : Math.min(10, position.shares));
  }, [isOpen, position.stockId, type, position.shares]);

  // Handle share input change
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value <= 0) {
      setShares(0);
      return;
    }

    // If selling, can't sell more than owned
    if (type === 'sell') {
      setShares(Math.min(value, position.shares));
    } else {
      setShares(value);
    }
  };

  // Calculate transaction total
  const transactionTotal = useMemo(() => {
    return shares * position.stock.currentPrice;
  }, [position.stock.currentPrice, shares]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {type === 'buy' ? 'Buy' : 'Sell'} {position.stock.symbol}
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">{position.stock.name}</div>
            <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Current Price: {formatCurrency(position.stock.currentPrice)}
            </div>
          </div>

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
              value={shares}
              onChange={handleSharesChange}
              min="1"
              max={type === 'sell' ? position.shares : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {type === 'sell' && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Available: {position.shares} shares
              </div>
            )}
          </div>

          {type === 'buy' && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Cash Available: {formatCurrency(portfolioCash)}
            </div>
          )}

          <div className="p-3 mb-4 bg-gray-50 rounded-md dark:bg-gray-700">
            <div className="flex justify-between">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(transactionTotal)}
              </div>
            </div>
          </div>

          {transactionStatus === 'error' && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
              {transactionMessage}
            </div>
          )}

          {transactionStatus === 'success' && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-200">
              {transactionMessage}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            onClick={onClose}
            disabled={transactionStatus === 'loading'}
          >
            Cancel
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'buy'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => onExecute(shares)}
            disabled={
              shares <= 0 ||
              transactionStatus === 'loading' ||
              (type === 'buy' && transactionTotal > portfolioCash)
            }
          >
            {transactionStatus === 'loading' ? 'Processing...' : type === 'buy' ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
