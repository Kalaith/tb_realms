import React, { Fragment } from 'react';
import { Stock } from '../../entities/Stock';
import { formatCurrency, formatPercentage, formatMarketCap } from '../../utils/formatUtils';
import StockDetailsPanel from './StockDetailsPanel';

interface StocksTableProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  sortBy: 'name' | 'price' | 'change' | 'volume' | 'marketCap';
  sortDirection: 'asc' | 'desc';
  activeTab: 'overview' | 'financials' | 'news';
  onStockSelect: (stock: Stock | null) => void;
  onSort: (sortBy: 'name' | 'price' | 'change' | 'volume' | 'marketCap') => void;
  onTabChange: (tab: 'overview' | 'financials' | 'news') => void;
}

/**
 * Displays a table of stocks with sortable columns and expandable details
 */
const StocksTable: React.FC<StocksTableProps> = ({
  stocks,
  selectedStock,
  sortBy,
  sortDirection,
  activeTab,
  onStockSelect,
  onSort,
  onTabChange
}) => {
  /**
   * Handle keyboard navigation for stock selection
   * Allows users to select stocks using keyboard for better accessibility
   */
  const handleStockKeyDown = (e: React.KeyboardEvent, stock: Stock) => {
    // Select stock on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStockSelect(selectedStock?.id === stock.id ? null : stock);
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" aria-label="Stocks table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('name')}
                aria-sort={sortBy === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  Symbol / Name
                  {sortBy === 'name' && (
                    <span className="ml-1" aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('price')}
                aria-sort={sortBy === 'price' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  Price
                  {sortBy === 'price' && (
                    <span className="ml-1" aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('change')}
                aria-sort={sortBy === 'change' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  Change
                  {sortBy === 'change' && (
                    <span className="ml-1" aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('marketCap')}
                aria-sort={sortBy === 'marketCap' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  Market Cap
                  {sortBy === 'marketCap' && (
                    <span className="ml-1" aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('volume')}
                aria-sort={sortBy === 'volume' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center">
                  Volume
                  {sortBy === 'volume' && (
                    <span className="ml-1" aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {stocks.map(stock => (
              <Fragment key={stock.id}>
                <tr 
                  onClick={() => onStockSelect(selectedStock?.id === stock.id ? null : stock)}
                  onKeyDown={(e) => handleStockKeyDown(e, stock)}
                  tabIndex={0}
                  aria-selected={selectedStock?.id === stock.id}
                  role="row"
                  aria-expanded={selectedStock?.id === stock.id}
                  aria-controls={`stock-details-${stock.id}`}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedStock?.id === stock.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {formatCurrency(stock.currentPrice)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium ${stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div>{formatCurrency(stock.change)}</div>
                    <div className="text-sm">
                      {formatPercentage(stock.changePercent, true, 2, 2, false)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {stock.volume.toLocaleString()}
                  </td>
                </tr>
                {selectedStock?.id === stock.id && (
                  <StockDetailsPanel 
                    stock={stock} 
                    activeTab={activeTab} 
                    setActiveTab={onTabChange}
                    onClose={() => onStockSelect(null)}
                  />
                )}
              </Fragment>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No stocks found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StocksTable;