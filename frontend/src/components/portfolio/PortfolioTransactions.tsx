import { Transaction } from "../../entities/Portfolio";
import { formatCurrency, formatDateTime } from "../../utils/formatUtils";

type PortfolioTransactionsProps = {
  transactions: Transaction[];
};

/**
 * Displays the transaction history table
 */
const PortfolioTransactions = ({
  transactions,
}: PortfolioTransactionsProps) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Type
            </th>
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
              Price
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {formatDateTime(transaction.timestamp)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.type.toLowerCase() === "buy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 dark:text-white">
                  {transaction.stockSymbol}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.stockName}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {transaction.shares}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                {formatCurrency(transaction.price)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(transaction.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          No transactions yet. Start trading to see your history.
        </div>
      )}
    </div>
  );
};

export default PortfolioTransactions;
