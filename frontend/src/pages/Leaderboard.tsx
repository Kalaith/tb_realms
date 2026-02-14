import { useState, useEffect } from 'react';
import { LeaderboardUser, fetchLeaderboardData } from '../api/leaderboardService';
import { formatCurrency, formatPercentage, formatDate } from '../utils/leaderboardUtils';
import { LoadingSpinner } from '../components/utility';

/**
 * Leaderboard component displays a table of top traders ranked by portfolio value
 * Shows rank, trader info, badges, portfolio value, growth, win streak, and best trade
 */
function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboardData();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data. Please try again later.');
        console.error('Error loading leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboardData();
  }, []);

  const getRankStyles = (rank: number) => {
    if (rank === 1)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold';
    if (rank === 2)
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-bold';
    if (rank === 3)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold';
    return '';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">{/* Add filters in the future if needed */}</div>
        </div>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">{/* Add filters in the future if needed */}</div>
          </div>
        </div>
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">{/* Add filters in the future if needed */}</div>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          No leaderboard data available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">{/* Add filters in the future if needed */}</div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Trader
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Badges
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Portfolio Value
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Growth
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Win Streak
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
              >
                Best Trade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${getRankStyles(user.rank)}`}
                  >
                    {user.rank}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={user.avatarUrl || 'https://via.placeholder.com/40'}
                      alt={`${user.displayName}'s avatar`}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Level {user.level}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.badges.map((badge, index) => (
                      <span
                        key={`${user.id}-badge-${index}`}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {formatCurrency(user.portfolioValue)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`font-medium ${user.portfolioGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {formatPercentage(user.portfolioGrowth)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {user.winStreak}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.bestTrade.stockName}
                    </div>
                    <div className="flex items-center text-sm">
                      <span
                        className={`mr-1 ${user.bestTrade.percentageGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {formatPercentage(user.bestTrade.percentageGain)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDate(user.bestTrade.date)}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Export the component as default explicitly
export default Leaderboard;
