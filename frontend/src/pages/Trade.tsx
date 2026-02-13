
import React, { useState, useEffect, useCallback } from "react";
import { stockService } from "../api/stockService";
import { portfolioService } from "../api/portfolioService";
import { Stock, TimeFrame } from "../entities/Stock";
import { Transaction, TransactionType, Position } from "../entities/Portfolio";
import type { Portfolio } from "../entities/Portfolio";
import type { TradeResult } from "../entities/Trade";
import type { ApiResponse } from "../entities/api";
import { formatCurrency } from "../utils/formatUtils";
import {
  StockList,
  StockDetail,
  TradeForm,
  TransactionList,
  TradeConfirmation,
  TradeNotification,
} from "../components/trade";
import { LoadingSpinner } from "../components/utility";

/**
 * Trade page - Main component for stock trading functionality
 * Allows users to view stock details, and buy/sell shares
 */
const Trade: React.FC = () => {
  // State variables
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.Day);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTrade, setLoadingTrade] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(0);
  const [tradeShares, setTradeShares] = useState<number>(1);
  const [tradeType, setTradeType] = useState<TransactionType>(
    TransactionType.BUY,
  );
  const [userPortfolio, setUserPortfolio] = useState<Portfolio | null>(null);
  const [confirmTrade, setConfirmTrade] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tradeComplete, setTradeComplete] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user1";

  // Load stocks and user portfolio on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all stocks
        const stocksResponse = await stockService.getAll();
        if (stocksResponse.success && stocksResponse.data) {
          setStocks(stocksResponse.data);
          if (stocksResponse.data.length > 0 && !selectedStock) {
            setSelectedStock(stocksResponse.data[0]);
          }
        } else {
          throw new Error(
            stocksResponse.error?.message || "Failed to fetch stocks",
          );
        }

        // Fetch user portfolio
        const portfolioResponse =
          await portfolioService.getUserPortfolio(userId);
        if (portfolioResponse.success && portfolioResponse.data) {
          setUserPortfolio(portfolioResponse.data);

          // Get recent transactions
          if (portfolioResponse.data.transactionHistory) {
            const sortedTransactions = [
              ...portfolioResponse.data.transactionHistory,
            ]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime(),
              )
              .slice(0, 5); // Get 5 most recent transactions
            setRecentTransactions(sortedTransactions);
          }
        } else {
          throw new Error(
            portfolioResponse.error?.message || "Failed to fetch portfolio",
          );
        }

        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(
          `Failed to load data: ${errorMessage}. Please try refreshing the page.`,
        );
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [tradeComplete]);

  // Update trade amount when shares or selected stock changes
  useEffect(() => {
    if (selectedStock && tradeShares > 0) {
      setTradeAmount(selectedStock.currentPrice * tradeShares);
    } else {
      setTradeAmount(0);
    }
  }, [selectedStock, tradeShares]);

  // Handle stock selection
  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    setTradeShares(1);
  };

  // Handle share quantity change
  const handleSharesChange = (shares: number) => {
    setTradeShares(shares > 0 ? shares : 0);
  };

  // Check if user can afford to buy
  const canAffordTrade = useCallback(() => {
    if (!selectedStock || !userPortfolio) return false;

    if (tradeType === TransactionType.BUY) {
      return userPortfolio.cash >= tradeAmount;
    } else {
      // Check if user has enough shares to sell
      const position = userPortfolio.positions.find(
        (p: Position) => p.stockId === selectedStock.id,
      );
      return !!position && position.shares >= tradeShares;
    }
  }, [selectedStock, userPortfolio, tradeType, tradeAmount, tradeShares]);

  // Handle trade submission
  const handleTrade = async () => {
    if (!selectedStock || !userPortfolio) return;

    try {
      setLoadingTrade(true);
      setError(null);

      let response: ApiResponse<Transaction>;

      if (tradeType === TransactionType.BUY) {
        response = await portfolioService.buyStock(
          userPortfolio.id,
          selectedStock.id,
          tradeShares,
          selectedStock.currentPrice,
        );
      } else {
        response = await portfolioService.sellStock(
          userPortfolio.id,
          selectedStock.id,
          tradeShares,
          selectedStock.currentPrice,
        );
      }

      if (!response.success) {
        throw new Error(response.error?.message || "Transaction failed");
      }

      const tx = response.data;
      setTradeResult({
        success: true,
        transactionId: tx?.id,
        transaction: tx,
      });
      setTradeComplete(true);
      setConfirmTrade(false);

      // Reset after trade
      setTimeout(() => {
        setTradeComplete(false);
        setTradeResult(null);
      }, 5000);

      setLoadingTrade(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to execute trade: ${errorMessage}. Please try again.`);
      setTradeResult({
        success: false,
        message: errorMessage,
        errorCode: "TRADE_ERROR",
      });
      setTradeComplete(true);
      setLoadingTrade(false);
      setConfirmTrade(false);

      // Reset error notification
      setTimeout(() => {
        setTradeComplete(false);
        setTradeResult(null);
        setError(null);
      }, 5000);

      console.error("Error executing trade:", err);
    }
  };

  // Loading state
  if (loading && !selectedStock) {
    return (
      <div className="container mx-auto px-4 py-6" role="main">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Trade
        </h1>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedStock) {
    return (
      <div className="container mx-auto px-4 py-6" role="main">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Trade
        </h1>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
            aria-label="Retry loading data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6" role="main">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Stock selection */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <StockList
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={handleSelectStock}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Middle column: Stock details and chart */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {selectedStock ? (
            <StockDetail
              stock={selectedStock}
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 dark:text-gray-400">
                Select a stock to view details
              </span>
            </div>
          )}
        </div>

        {/* Right column: Trade form and transactions */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {userPortfolio && (
            <div
              className="mb-6 border-b border-gray-200 pb-4"
              role="region"
              aria-label="Account information"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Available Cash
                </div>
                <div
                  className="font-bold text-gray-800 dark:text-gray-200"
                  aria-live="polite"
                >
                  {formatCurrency(userPortfolio.cash)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Portfolio Value
                </div>
                <div
                  className="font-bold text-gray-800 dark:text-gray-200"
                  aria-live="polite"
                >
                  {formatCurrency(userPortfolio.totalValue)}
                </div>
              </div>
            </div>
          )}

          {/* Trade form */}
          {selectedStock && (
            <div className="mb-6">
              <TradeForm
                stock={selectedStock}
                userPortfolio={userPortfolio}
                tradeShares={tradeShares}
                tradeType={tradeType}
                tradeAmount={tradeAmount}
                onTradeTypeChange={setTradeType}
                onSharesChange={handleSharesChange}
                onConfirmRequest={() => setConfirmTrade(true)}
                loading={loadingTrade}
              />
            </div>
          )}

          {/* Recent transactions */}
          <TransactionList transactions={recentTransactions} />
        </div>
      </div>

      {/* Trade confirmation dialog */}
      {confirmTrade && selectedStock && (
        <TradeConfirmation
          stock={selectedStock}
          tradeType={tradeType}
          shares={tradeShares}
          amount={tradeAmount}
          onConfirm={handleTrade}
          onCancel={() => setConfirmTrade(false)}
          loading={loadingTrade}
          canAfford={canAffordTrade()}
        />
      )}

      {/* Trade notification */}
      <TradeNotification tradeResult={tradeResult} visible={tradeComplete} />
    </div>
  );
};

export default Trade;
