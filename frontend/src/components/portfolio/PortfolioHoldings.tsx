import { Position } from '../../entities/Portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';

type PortfolioHoldingsProps = {
  positions: Position[];
  onBuyClick: (position: Position) => void;
  onSellClick: (position: Position) => void;
};

/**
 * Displays the holdings table with stock positions and action buttons
 */
const PortfolioHoldings = ({ positions, onBuyClick, onSellClick }: PortfolioHoldingsProps) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Stock
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Shares
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Average Buy
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Current Price
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Current Value
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Total Return
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {positions.map(position => (
            <tr key={position.stockId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 dark:text-white">
                  {position.stock.symbol}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {position.stock.name}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {position.shares}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatCurrency(position.averageBuyPrice)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatCurrency(position.stock.currentPrice)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatCurrency(position.currentValue)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div
                  className={`font-medium ${position.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {formatCurrency(position.totalReturn)}
                </div>
                <div
                  className={`text-sm ${position.totalReturnPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  ({formatPercentage(position.totalReturnPercentage, true, 2, 2, false)})
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => onBuyClick(position)}
                  >
                    Buy
                  </button>
                  <button
                    className="px-3 py-1 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onSellClick(position)}
                    disabled={position.shares <= 0}
                  >
                    Sell
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {positions.length === 0 && (
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          You don't have any holdings yet. Start by buying some stocks.
        </div>
      )}
    </div>
  );
};

export default PortfolioHoldings;
