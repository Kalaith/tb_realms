import React, { Fragment } from 'react';
import { Stock } from '../../entities/Stock';
import { formatCurrency, formatPercentage, formatMarketCap } from '../../utils/formatUtils';

interface StocksTableProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  sortBy: 'name' | 'price' | 'change' | 'volume' | 'marketCap';
  sortDirection: 'asc' | 'desc';
  onStockSelect: (stock: Stock | null) => void;
  onSort: (sortBy: 'name' | 'price' | 'change' | 'volume' | 'marketCap') => void;
}

// Table column configuration
const tableColumns = [
  { key: 'name', label: 'Symbol / Name' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: 'Change' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'volume', label: 'Volume' },
] as const;

/**
 * Displays a table of stocks with sortable columns and expandable details
 */
const StocksTable: React.FC<StocksTableProps> = ({
  stocks,
  selectedStock,
  sortBy,
  sortDirection,
  onStockSelect,
  onSort
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
                  role="button"
                  aria-label={`${stock.symbol} - ${stock.name}, current price ${formatCurrency(stock.currentPrice)}, ${stock.changePercent >= 0 ? 'up' : 'down'} ${formatPercentage(stock.changePercent, true, 2, 2, false)}`}
                  aria-expanded={selectedStock?.id === stock.id}
                  aria-describedby={`stock-summary-${stock.id}`}
                  aria-pressed={selectedStock?.id === stock.id}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedStock?.id === stock.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                    <div id={`stock-summary-${stock.id}`} className="sr-only">
                      Stock: {stock.symbol} ({stock.name}).
                      Current price: {formatCurrency(stock.currentPrice)}.
                      Change: {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent, true, 2, 2, false)}).
                      Market cap: {formatMarketCap(stock.marketCap)}.
                      Volume: {stock.volume.toLocaleString()} shares.
                      {selectedStock?.id === stock.id ? ' Details panel is open.' : ' Click to view details.'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <span aria-label={`Current price ${formatCurrency(stock.currentPrice)}`}>
                      {formatCurrency(stock.currentPrice)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium ${stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div aria-label={`Price change ${formatCurrency(stock.change)}`}>
                      {formatCurrency(stock.change)}
                    </div>
                    <div className="text-sm" aria-label={`Percentage change ${formatPercentage(stock.changePercent, true, 2, 2, false)}`}>
                      {formatPercentage(stock.changePercent, true, 2, 2, false)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    <span aria-label={`Market cap ${formatMarketCap(stock.marketCap)}`}>
                      {formatMarketCap(stock.marketCap)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    <span aria-label={`Volume ${stock.volume.toLocaleString()} shares`}>
                      {stock.volume.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </Fragment>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan={tableColumns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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