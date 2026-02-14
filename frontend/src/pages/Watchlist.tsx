import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../utils/formatUtils';
import { LoadingSpinner } from '../components/utility';
import { watchlistService, WatchlistItem } from '../api/watchlistService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Watchlist page component - Displays and manages user's watched stocks
 */
const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get current user from auth context
  const { isAuthenticated } = useAuth();

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
          // Handles API errors or empty data by setting an empty watchlist
          setWatchlist([]);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
        setWatchlist([]); // Set empty array on any fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [isAuthenticated]);

  // Filter watchlist based on search query
  const filteredWatchlist = watchlist.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.stock.symbol.toLowerCase().includes(query) ||
      item.stock.name.toLowerCase().includes(query)
    );
  });

  // Handle removing item from watchlist
  const handleRemove = async (itemId: string) => {
    // Optimistically update UI
    setWatchlist(prev => prev.filter(item => item.id !== itemId));
    try {
      const response = await watchlistService.removeFromWatchlist(itemId);
      if (!response.success) {
        // Revert UI if API call fails and fetch fresh data
        const freshWatchlist = await watchlistService.getCurrentUserWatchlist();
        if (freshWatchlist.success && freshWatchlist.data) {
          setWatchlist(freshWatchlist.data);
        } else {
          setWatchlist([]); // Or handle error more specifically
        }
        console.error('Failed to remove item:', response.error);
      }
    } catch (err) {
      console.error('Error removing watchlist item:', err);
      // Fetch fresh data to ensure UI consistency
      const freshWatchlist = await watchlistService.getCurrentUserWatchlist();
      if (freshWatchlist.success && freshWatchlist.data) {
        setWatchlist(freshWatchlist.data);
      } else {
        setWatchlist([]);
      }
    }
  };

  // Handle updating notes
  const handleUpdateNotes = async (itemId: string, notes: string) => {
    const originalWatchlist = [...watchlist];
    // Optimistically update UI
    setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, notes } : item)));
    try {
      const response = await watchlistService.updateWatchlistItem(itemId, {
        notes,
      });
      if (!response.success) {
        setWatchlist(originalWatchlist); // Revert on failure
        console.error('Failed to update notes:', response.error);
      }
    } catch (err) {
      setWatchlist(originalWatchlist); // Revert on error
      console.error('Error updating watchlist notes:', err);
    }
  };

  // Handle updating target price
  const handleUpdateTargetPrice = async (itemId: string, targetPrice: number | undefined) => {
    const originalWatchlist = [...watchlist];
    // Optimistically update UI
    setWatchlist(prev => prev.map(item => (item.id === itemId ? { ...item, targetPrice } : item)));
    try {
      const response = await watchlistService.updateWatchlistItem(itemId, {
        targetPrice,
      });
      if (!response.success) {
        setWatchlist(originalWatchlist); // Revert on failure
        console.error('Failed to update target price:', response.error);
      }
    } catch (err) {
      setWatchlist(originalWatchlist); // Revert on error
      console.error('Error updating target price:', err);
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

  // Condition 1: User is not logged in
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center p-8">
            <svg
              className="w-16 h-16 mb-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
            <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
              Please Log In
            </h3>
            <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
              You need to be logged in to view your watchlist.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in, proceed to display watchlist or empty/search states
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

        {/* Condition 2: User is logged in and has watchlist data */}
        {filteredWatchlist.length > 0 ? (
          <div className="space-y-4">
            {filteredWatchlist.map(item => (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                {/* Stock item details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold dark:bg-blue-900 dark:text-blue-200">
                      {item.stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.stock.symbol}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.stock.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.stock.currentPrice)}
                    </div>
                    <div
                      className={`text-sm ${
                        item.stock.changePercent >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.stock.changePercent >= 0 ? '+' : ''}
                      {formatPercentage(item.stock.changePercent)}
                    </div>
                  </div>
                </div>

                {/* Notes and Target Price */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={`notes-${item.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
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
                    <label
                      htmlFor={`target-${item.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Target Price
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id={`target-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.targetPrice || ''}
                        onChange={e =>
                          handleUpdateTargetPrice(
                            item.id,
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
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
                      <div
                        className={`text-xs ${
                          item.stock.currentPrice < item.targetPrice
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
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
          // Condition 3: User is logged in but has no watchlist data (or no search results)
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <svg
              className="w-16 h-16 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>

            {searchQuery ? (
              // No search results
              <div className="text-center" role="status" aria-live="polite">
                <h2 className="mb-2 text-lg font-medium">No stocks match your search</h2>
                <p className="text-sm">Try adjusting your search criteria or clear the search.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Clear search and show all watchlist items"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              // Watchlist is empty
              <div className="text-center" role="status" aria-live="polite">
                <h2 className="mb-2 text-lg font-medium">Your watchlist is empty</h2>
                <p className="text-sm mb-4">Add stocks from the market page to track them here.</p>
                <Link
                  to="/market"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Browse market to add stocks to your watchlist"
                >
                  Browse Market
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
