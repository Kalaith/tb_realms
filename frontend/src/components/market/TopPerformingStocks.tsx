/**
 * Top Performing Stocks Component
 * Displays a list of top performing stocks that can be viewed by all users
 * No actions can be performed by unauthenticated users
 */
import React from 'react';
import { Stock } from '../../entities/Stock';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TopPerformingStocksProps {
  stocks: Stock[];
  limit?: number;
}

const TopPerformingStocks: React.FC<TopPerformingStocksProps> = ({ 
  stocks,
  limit = 5
}) => {
  const { isAuthenticated } = useAuth();
  
  // Sort stocks by percentage change (descending)
  const topStocks = [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
    
  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Top Performing Stocks</h2>
        <Link to="/market" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          View All
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Symbol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Change
              </th>
              {isAuthenticated && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {topStocks.map(stock => (
              <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stock.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(stock.currentPrice)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                    stock.changePercent >= 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>{formatPercentage(stock.changePercent)}</span>
                </td>
                {isAuthenticated && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      to={`/market/${stock.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >View</Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!isAuthenticated && (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-700">
          <Link 
            to="/login"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Sign in to trade these stocks
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopPerformingStocks;
