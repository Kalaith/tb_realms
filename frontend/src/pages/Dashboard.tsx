import { useState, useEffect } from 'react';
import { Portfolio } from '../entities/Portfolio';
import { portfolioService } from '../api/portfolioService';
import { stockService } from '../api/stockService';
import { Stock } from '../entities/Stock';
import { LoadingSpinner } from '../components/utility';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user portfolio
        const portfolioResponse = await portfolioService.getUserPortfolio('user1');
        if (portfolioResponse.success && portfolioResponse.data) {
          setPortfolio(portfolioResponse.data);
        }
        
        // Fetch top stocks
        const stocksResponse = await stockService.getAll();
        if (stocksResponse.success && stocksResponse.data) {
          // Sort by performance (change percent)
          const sortedStocks = [...stocksResponse.data].sort(
            (a, b) => b.changePercent - a.changePercent
          );
          setTopStocks(sortedStocks.slice(0, 5));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Use the same container for loading state
  if (loading) return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
  
  if (error) return (
    <div className="space-y-6">
      <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
        {error}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Portfolio Summary */}
      {portfolio && (
        <section className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Portfolio Summary</h2>
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${portfolio.totalValue.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Cash</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${portfolio.cash.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Change</div>
              <div className={`text-2xl font-bold ${portfolio.performance.dailyChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${portfolio.performance.dailyChange.toLocaleString()} 
                ({portfolio.performance.dailyChangePercent >= 0 ? '+' : ''}{portfolio.performance.dailyChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Current Positions ({portfolio.positions.length})</h3>
            {portfolio.positions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No positions yet. Start trading to build your portfolio!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Symbol</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Shares</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Avg. Price</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Current</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Value</th>
                      <th scope="col" className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Return</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {portfolio.positions.map(position => (
                      <tr key={position.stockId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{position.stock.symbol}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap dark:text-gray-300">{position.shares}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap dark:text-gray-300">${position.averageBuyPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap dark:text-gray-300">${position.stock.currentPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap dark:text-gray-300">${position.currentValue.toLocaleString()}</td>
                        <td className={`px-4 py-3 font-medium whitespace-nowrap ${position.totalReturnPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {position.totalReturnPercentage >= 0 ? '+' : ''}
                          {position.totalReturnPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Market Overview */}
      <section className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Market Overview</h2>
        <div>
          <h3 className="mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">Top Performing Stocks</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topStocks.map(stock => (
              <div key={stock.id} className="p-4 transition-shadow bg-gray-50 rounded-lg hover:shadow-md dark:bg-gray-700">
                <div className="flex flex-col w-full">
                  {/* Stock name and description at the top */}
                  <div className="w-full mb-3">
                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{stock.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.name}</div>
                  </div>
                  
                  {/* Performance and price at the bottom */}
                  <div className="flex items-center justify-between w-full mt-auto">
                    <div className={`text-lg font-bold ${stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      ${stock.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent Activity */}
      {portfolio && (
        <section className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Transactions</h2>
          {portfolio.transactionHistory.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {portfolio.transactionHistory
                .slice()
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 5)
                .map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                    <div className="flex items-center">
                      <div className={`px-2 py-1 mr-3 text-xs font-medium rounded-md ${tx.type.toLowerCase() === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {tx.type}
                      </div>
                      <div>
                        <span className="mr-2 font-medium text-gray-900 dark:text-gray-100">{tx.stockSymbol}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{tx.shares} shares @ ${tx.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-base font-medium text-gray-800 dark:text-gray-200">${tx.total.toLocaleString()}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{tx.timestamp.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;