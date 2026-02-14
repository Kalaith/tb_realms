import React from 'react';
import { TransactionListProps } from '../../entities/Trade';
import { formatCurrency, formatDateTime } from '../../utils/formatUtils';
import { TransactionType } from '../../entities/Portfolio';

/**
 * TransactionList component - Displays a user's recent stock transactions
 * Shows transaction type, stock info, shares, price and date
 */
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="w-full" role="region" aria-labelledby="recent-transactions-title">
      <h3
        id="recent-transactions-title"
        className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4"
      >
        Recent Transactions
      </h3>

      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              role="listitem"
              aria-label={`${transaction.type === TransactionType.BUY ? 'Bought' : 'Sold'} ${transaction.shares} shares of ${transaction.stockSymbol} at ${formatCurrency(transaction.price)} per share, total ${formatCurrency(transaction.total)} on ${formatDateTime(transaction.timestamp)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-md mr-3 ${
                      transaction.type === TransactionType.BUY
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {transaction.type === TransactionType.BUY ? 'BUY' : 'SELL'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {transaction.stockSymbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.shares} share(s) @ {formatCurrency(transaction.price)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(transaction.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(transaction.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg"
          role="status"
        >
          No recent transactions
        </div>
      )}
    </div>
  );
};

export default TransactionList;
