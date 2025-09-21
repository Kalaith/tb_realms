import { useState, useEffect, useMemo } from 'react';
import { stockService } from '../api/stockService';
import { Stock } from '../entities/Stock';
import { StockFilters } from '../entities/api';
import { MarketFilters, StocksTable } from '../components/market';
import StockDetailsPanel from '../components/market/StockDetailsPanel';
import { LoadingSpinner } from '../components/utility';

/**
 * Market page displays a list of all available stocks with filtering and sorting options
 * Users can click on stocks to view detailed information and perform buy/sell actions
 */
const Market = () => {
  // State management
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'volume' | 'marketCap'>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'news'>('overview');

  // Stock sectors for filtering
  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(stocks.map(stock => stock.sector))];
    return uniqueSectors.sort();
  }, [stocks]);

  // Fetch stocks on mount and when filters/sort options change
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare filter parameters
        const filters: StockFilters = {
          sector: selectedSector || undefined,
          sortBy,
          sortDirection
        };

        // Fetch stocks with filters
        const response = await stockService.getByFilters(filters);
        
        if (response.success && response.data) {
          setStocks(response.data);
        } else {
          setError('Failed to load stock data');
        }
      } catch (err) {
        setError('An error occurred while fetching stocks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [selectedSector, sortBy, sortDirection]);

  // Filter stocks by search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stocks;
    
    const query = searchQuery.toLowerCase();
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query) || 
      stock.name.toLowerCase().includes(query)
    );
  }, [stocks, searchQuery]);

  // Sorting handler
  const handleSort = (newSortBy: 'name' | 'price' | 'change' | 'volume' | 'marketCap') => {
    if (sortBy === newSortBy) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new column, except for name which is ascending
      setSortBy(newSortBy);
      setSortDirection(newSortBy === 'name' ? 'asc' : 'desc');
    }
  };

  // Filter by sector handler
  const handleSectorFilter = (sector: string | null) => {
    setSelectedSector(sector);
  };

  // Stock selection handler
  const handleStockSelect = (stock: Stock | null) => {
    setSelectedStock(stock);
    // Reset to overview tab when selecting a new stock
    if (stock && (!selectedStock || selectedStock.id !== stock.id)) {
      setActiveTab('overview');
    }
  };

  // Loading state
  if (loading && stocks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      
      {/* Search and filters */}
      <MarketFilters 
        searchQuery={searchQuery}
        selectedSector={selectedSector}
        sectors={sectors}
        onSearchChange={setSearchQuery}
        onSectorChange={handleSectorFilter}
      />

      {/* Stocks table */}
      <StocksTable
        stocks={filteredStocks}
        selectedStock={selectedStock}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onStockSelect={handleStockSelect}
        onSort={handleSort}
      />

      {/* Stock details panel - shown when a stock is selected */}
      {selectedStock && (
        <StockDetailsPanel
          stock={selectedStock}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default Market;