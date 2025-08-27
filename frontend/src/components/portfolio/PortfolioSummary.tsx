import { Portfolio as PortfolioType } from '../../entities/Portfolio';
import { formatCurrency, formatPercentage } from '../../utils/formatUtils';

type PortfolioSummaryProps = {
  portfolio: PortfolioType;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
};

/**
 * Displays summary cards with portfolio metrics at the top of the portfolio page
 */
const PortfolioSummary = ({ portfolio, totalProfitLoss, totalProfitLossPercentage }: PortfolioSummaryProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio.totalValue)}</div>
        <div className={`mt-1 text-sm font-medium ${portfolio.performance.dailyChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(portfolio.performance.dailyChange)} ({formatPercentage(portfolio.performance.dailyChangePercent, true, 2, 2, false)}) Today
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Cash Balance</h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolio.cash)}</div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Return</h3>
        <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatCurrency(totalProfitLoss)}
        </div>
        <div className={`mt-1 text-sm font-medium ${totalProfitLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {formatPercentage(totalProfitLossPercentage, true, 2, 2, false)}
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Performance</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">1W</div>
            <div className={`text-sm font-medium ${portfolio.performance.weeklyChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(portfolio.performance.weeklyChangePercent, true, 2, 2, false)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">1M</div>
            <div className={`text-sm font-medium ${portfolio.performance.monthlyChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(portfolio.performance.monthlyChangePercent, true, 2, 2, false)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">1Y</div>
            <div className={`text-sm font-medium ${portfolio.performance.yearlyChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(portfolio.performance.yearlyChangePercent, true, 2, 2, false)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">All</div>
            <div className={`text-sm font-medium ${portfolio.performance.allTimeChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(portfolio.performance.allTimeChangePercent, true, 2, 2, false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;