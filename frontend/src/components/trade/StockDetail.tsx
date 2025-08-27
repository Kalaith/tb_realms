import React from 'react';
import { StockDetailProps } from '../../entities/Trade';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';
import { TimeFrame } from '../../entities/Stock';

/**
 * StockDetail component - Displays detailed information about a selected stock
 * Includes price chart, statistics, and company description
 */
const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  timeFrame,
  onTimeFrameChange
}) => {
  return (
    <div className="flex flex-col h-full" role="region" aria-label="Stock details">
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 id="stock-name-header" className="text-xl font-bold text-gray-900 dark:text-white">{stock.name} ({stock.symbol})</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white" aria-label={`Current price ${formatCurrency(stock.currentPrice)}`}>
            {formatCurrency(stock.currentPrice)}
          </div>
          <div 
            className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            aria-label={`Price change ${formatCurrency(stock.change)}, ${formatPercentage(stock.changePercent)}`}
          >
            {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
          </div>
        </div>
      </div>
      
      <div className="flex-1 mb-4">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-[200px] flex items-center justify-center mb-3" aria-label={`Price chart for ${stock.symbol} over ${timeFrame} period`}>
          <div className="text-gray-500 dark:text-gray-400 text-center">Price chart would appear here</div>
        </div>
        <div className="flex justify-center space-x-2" role="radiogroup" aria-label="Chart time frame selector">
          {Object.values(TimeFrame).map((tf) => (
            <button 
              key={tf} 
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                tf === timeFrame 
                  ? 'bg-blue-600 text-white dark:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
              }`}
              onClick={() => onTimeFrameChange(tf)}
              aria-pressed={tf === timeFrame}
              aria-label={`${tf} time frame`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4" role="group" aria-label="Stock statistics">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Previous Close</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white" aria-label={`Previous close ${formatCurrency(stock.previousClose)}`}>
            {formatCurrency(stock.previousClose)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Volume</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white" aria-label={`Volume ${stock.volume.toLocaleString()}`}>
            {stock.volume.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Market Cap</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white" aria-label={`Market capitalization ${formatCurrency(stock.marketCap)}`}>
            {formatCurrency(stock.marketCap)}
          </div>
        </div>
      </div>
      
      {stock.description && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">About {stock.name}</h3>
          <p>{stock.description}</p>
        </div>
      )}
    </div>
  );
};

export default StockDetail;