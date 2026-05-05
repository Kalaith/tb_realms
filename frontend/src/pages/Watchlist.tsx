import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatUtils';
import { LoadingSpinner } from '../components/utility';
import { watchlistService, WatchlistItem } from '../api/watchlistService';
import { useAuth } from '../hooks/useAuth';

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isAuthenticated, continueAsGuest, requestLogin, loginUrl } = useAuth();

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      if (!isAuthenticated) {
        setWatchlist([]);
        setLoading(false);
        return;
      }

      try {
        const watchlistResponse = await watchlistService.getCurrentUserWatchlist();
        if (watchlistResponse.success && watchlistResponse.data) {
          setWatchlist(watchlistResponse.data);
        } else {
          setWatchlist([]);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchWatchlist();
  }, [isAuthenticated]);

  const filteredWatchlist = watchlist.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.stock.symbol.toLowerCase().includes(query) ||
      item.stock.name.toLowerCase().includes(query)
    );
  });

  const handleRemove = async (itemId: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== itemId));
    try {
      const response = await watchlistService.removeFromWatchlist(itemId);
      if (!response.success) {
        const freshWatchlist = await watchlistService.getCurrentUserWatchlist();
        if (freshWatchlist.success && freshWatchlist.data) {
          setWatchlist(freshWatchlist.data);
        } else {
          setWatchlist([]);
        }
      }
    } catch (err) {
      console.error('Error removing watchlist item:', err);
      const freshWatchlist = await watchlistService.getCurrentUserWatchlist();
      if (freshWatchlist.success && freshWatchlist.data) {
        setWatchlist(freshWatchlist.data);
      } else {
        setWatchlist([]);
      }
    }
  };

  const handleUpdateNotes = async (itemId: string, notes: string) => {
    const originalWatchlist = [...watchlist];
    setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, notes } : item)));
    try {
      const response = await watchlistService.updateWatchlistItem(itemId, { notes });
      if (!response.success) {
        setWatchlist(originalWatchlist);
      }
    } catch (err) {
      setWatchlist(originalWatchlist);
      console.error('Error updating watchlist notes:', err);
    }
  };

  const handleUpdateTargetPrice = async (itemId: string, targetPrice: number | undefined) => {
    const originalWatchlist = [...watchlist];
    setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, targetPrice } : item)));
    try {
      const response = await watchlistService.updateWatchlistItem(itemId, { targetPrice });
      if (!response.success) {
        setWatchlist(originalWatchlist);
      }
    } catch (err) {
      setWatchlist(originalWatchlist);
      console.error('Error updating watchlist target price:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center p-8">
            <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
              Start a Session
            </h3>
            <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
              Use a guest session for quick access or sign in to keep your watchlist linked to your account.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  void continueAsGuest();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Continue as Guest
              </button>
              <a
                href={loginUrl}
                onClick={requestLogin}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-gray-700"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Watchlist</h1>

          <div className="w-64">
            <input
              type="text"
              id="watchlist-search"
              aria-label="Search stocks in your watchlist"
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {filteredWatchlist.length > 0 ? (
          <div className="space-y-4">
            {filteredWatchlist.map(item => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold dark:bg-blue-900 dark:text-blue-200">
                      {item.stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">{item.stock.symbol}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.stock.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.stock.currentPrice)}
                    </div>
                    <div className={`text-sm ${item.stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.stock.changePercent >= 0 ? '+' : ''}
                      {formatPercentage(item.stock.changePercent)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`notes-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      id={`notes-${item.id}`}
                      value={item.notes || ''}
                      onChange={e => handleUpdateNotes(item.id, e.target.value)}
                      placeholder="Add your notes here..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`target-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Price
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id={`target-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.targetPrice || ''}
                        onChange={e => handleUpdateTargetPrice(item.id, e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Set target price"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        aria-label={`Remove ${item.stock.symbol} from watchlist`}
                      >
                        Remove
                      </button>
                    </div>

                    {item.targetPrice && item.stock.currentPrice && (
                      <div className={`text-xs ${item.stock.currentPrice < item.targetPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.stock.currentPrice < item.targetPrice
                          ? `${formatCurrency(item.targetPrice - item.stock.currentPrice)} below target`
                          : `${formatCurrency(item.stock.currentPrice - item.targetPrice)} above target`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Added on {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? (
              <div className="text-center" role="status" aria-live="polite">
                <h2 className="mb-2 text-lg font-medium">No stocks match your search</h2>
                <p className="text-sm">Try adjusting your search criteria or clear the search.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="text-center" role="status" aria-live="polite">
                <h2 className="mb-2 text-lg font-medium">Your watchlist is empty</h2>
                <p className="text-sm mb-4">Add stocks from the market page to track them here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
