import React from 'react';
import { TradeNotificationProps } from '../../entities/Trade';
import { TransactionType } from '../../entities/Portfolio';

/**
 * TradeNotification component - Shows success or error notifications after trade execution
 * Appears as a toast notification at the bottom right of the screen
 */
const TradeNotification: React.FC<TradeNotificationProps> = ({ tradeResult, visible }) => {
  if (!visible || !tradeResult) return null;

  const success = tradeResult.success;
  const message = success
    ? `Successfully ${tradeResult.transaction?.type === TransactionType.BUY ? 'purchased' : 'sold'} ${tradeResult.transaction?.shares} share(s) of ${tradeResult.transaction?.stockName}`
    : tradeResult.message || 'An unknown error occurred';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs animate-fade-in-up ${
        success
          ? 'bg-green-100 border-l-4 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200 dark:border-green-600'
          : 'bg-red-100 border-l-4 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200 dark:border-red-600'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <h3 className="font-bold mb-1">{success ? 'Trade Completed' : 'Trade Failed'}</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default TradeNotification;
