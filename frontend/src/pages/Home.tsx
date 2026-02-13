/**
 * Home Page
 * Landing page for all users with market overview and top performing stocks
 * Acts as the primary entry point for both authenticated and unauthenticated users
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { stockService } from "../api/stockService";
import { Stock } from "../entities/Stock";
import { TopPerformingStocks, MarketOverview } from "../components/market";
import { LoadingSpinner } from "../components/utility";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Sample market data
  const marketData = [
    {
      title: "Market Index",
      value: 4826.32,
      change: 1.12,
      description: "Overall market performance",
    },
    {
      title: "Trading Volume",
      value: "2.3B",
      change: 0.78,
      description: "Total shares traded today",
    },
    {
      title: "Technology Sector",
      value: 1532.68,
      change: 1.56,
      description: "Technology sector performance",
    },
    {
      title: "Financial Sector",
      value: 876.32,
      change: -0.32,
      description: "Financial sector performance",
    },
    {
      title: "Energy Sector",
      value: 542.11,
      change: 2.45,
      description: "Energy sector performance",
    },
    {
      title: "Healthcare Sector",
      value: 1243.78,
      change: 0.18,
      description: "Healthcare sector performance",
    },
  ];

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch stocks
        const response = await stockService.getByFilters({
          sortBy: "change", // Use 'change' instead of 'changePercentage'
          sortDirection: "desc",
        });

        if (response.success && response.data) {
          setStocks(response.data);
        } else {
          setError("Failed to load stock data");
        }
      } catch (err) {
        setError("An error occurred while fetching stocks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border border-red-200 rounded-md dark:bg-red-900 dark:border-red-700">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Market Dashboard
        </h1>
        {isAuthenticated ? (
          <div className="inline-block px-4 py-2 text-sm text-blue-600 bg-blue-100 rounded-md dark:bg-blue-900 dark:text-blue-300">
            Welcome back! Your portfolio is ready for review.
          </div>
        ) : (
          <div className="inline-block px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-300">
            Sign in to start trading and track your portfolio
          </div>
        )}
      </div>

      {/* Market Overview Section */}
      <MarketOverview marketData={marketData} lastUpdated={new Date()} />

      {/* Top Performing Stocks Section */}
      <TopPerformingStocks stocks={stocks} limit={10} />

      {/* Additional information for non-authenticated users */}
      {!isAuthenticated && (
        <div className="p-6 bg-blue-50 rounded-lg shadow dark:bg-gray-800 dark:border dark:border-blue-900">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Welcome to Tradeborn Realms
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Track stocks, build your portfolio, and compete on the leaderboard
            in our simulated trading environment. Sign up to get started!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 dark:text-blue-400 dark:bg-gray-700 dark:border-blue-400 dark:hover:bg-gray-600"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
