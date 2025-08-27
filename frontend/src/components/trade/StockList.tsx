import React, { useRef, useEffect, useMemo } from 'react';
import { StockListProps } from '../../entities/Trade';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';

/**
 * StockList component - Displays a searchable list of stocks
 * Allows users to search and select stocks for trading
 */
const StockList: React.FC<StockListProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  searchQuery,
  onSearchChange
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Filter stocks based on search query
  const filteredStocks = useMemo(() => 
    searchQuery 
      ? stocks.filter(stock => 
          stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      : stocks,
    [stocks, searchQuery]
  );

  // Focus search input when pressing '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Stock selection">
      <div className="mb-4">
        <input 
          ref={searchInputRef}
          type="text"
          placeholder="Search stocks by name or symbol..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          aria-label="Search stocks"
        />
      </div>
      
      <div 
        className="flex-1 overflow-y-auto max-h-[500px] border border-gray-200 rounded-md dark:border-gray-700" 
        role="listbox" 
        aria-label="Available stocks"
        tabIndex={0}
      >
        {filteredStocks.map((stock) => (
          <div 
            key={stock.id} 
            className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              selectedStock?.id === stock.id 
                ? 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400' 
                : 'border-l-4 border-transparent'
            }`}
            onClick={() => onSelectStock(stock)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectStock(stock);
              }
            }}
            role="option"
            aria-selected={selectedStock?.id === stock.id}
            tabIndex={0}
          >
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(stock.currentPrice)}</div>
              <div 
                className={`text-sm ${
                  stock.change >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
                aria-label={`${formatPercentage(stock.changePercent)} ${stock.change > 0 ? 'increase' : 'decrease'}`}
              >
                {formatPercentage(stock.changePercent)}
              </div>
            </div>
          </div>
        ))}
        
        {filteredStocks.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400" role="status">
            No stocks found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;