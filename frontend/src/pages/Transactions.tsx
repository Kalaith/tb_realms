import React, { useState, useEffect } from "react";
import { Transaction } from "../entities/Portfolio";
import { portfolioService } from "../api/portfolioService";
import { formatCurrency, formatDateTime } from "../utils/formatUtils";
import { LoadingSpinner } from "../components/utility";

/**
 * Transactions page - Shows a detailed history of user transactions
 * Allows filtering by type, date range, and search by stock symbol/name
 */
const Transactions: React.FC = () => {
  // State variables
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock user ID - should be replaced with context/auth in a real implementation
  const userId = "elf782";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch transaction data from the API
        const response = await portfolioService.getUserTransactions(userId);

        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          setError("Failed to load transaction data");
        }
      } catch (err) {
        setError("An error occurred while fetching transaction data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Filter transactions based on selected filter and search query
  const filteredTransactions = transactions.filter((transaction) => {
    // Apply type filter
    if (filter !== "all" && transaction.type.toLowerCase() !== filter) {
      return false;
    }

    // Apply search filter
    if (
      searchQuery &&
      !transaction.stockSymbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !transaction.stockName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "buy" | "sell") => {
    setFilter(newFilter);
  };

  // Loading state
  if (loading) {
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

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Transaction History
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "buy"
                  ? "bg-green-600 text-white dark:bg-green-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleFilterChange("buy")}
            >
              Buy
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "sell"
                  ? "bg-red-600 text-white dark:bg-red-700"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleFilterChange("sell")}
            >
              Sell
            </button>
          </div>

          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by stock symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Transactions table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Shares
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(transaction.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type.toLowerCase() === "buy"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.stockSymbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.stockName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(transaction.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(transaction.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
              {transactions.length === 0
                ? "No transactions found. Start trading to see your history."
                : "No transactions match the selected filters."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
