/**
 * Displays the portfolio performance metrics and chart
 */
const PortfolioPerformance = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">
        Portfolio Value Over Time
      </h3>
      <div className="flex items-center justify-center h-64 p-4 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-700 dark:border-gray-600">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Chart will be implemented here</p>
          <p className="text-sm">
            This would display the portfolio value changes over time using the performance.history
            data
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformance;
