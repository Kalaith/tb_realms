/**
 * Market Overview Component
 * Displays market summary information that can be viewed by all users
 */
import React from 'react';
import { formatPercentage } from '../../utils/formatUtils';

interface MarketData {
  title: string;
  value: string | number;
  change: number;
  description: string;
}

interface MarketOverviewProps {
  marketData: MarketData[];
  lastUpdated: Date;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ 
  marketData,
  lastUpdated
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Market Overview</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {marketData.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.title}</p>
            <div className="flex items-baseline mt-2">
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">
                {typeof item.value === 'number' && item.title.includes('Index') 
                  ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : item.value}
              </p>
              <span className={`ml-2 text-sm ${
                item.change >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPercentage(item.change)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>Disclaimer: All market data is provided for informational purposes only.</p>
      </div>
    </div>
  );
};

export default MarketOverview;
