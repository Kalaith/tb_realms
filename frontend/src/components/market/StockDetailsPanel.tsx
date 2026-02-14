import React, { useState, useEffect } from 'react';
import { Stock } from '../../entities/Stock';
import { MarketEvent } from '../../entities/MarketEvent';
import { formatCurrency, formatPercentage, formatMarketCap } from '../../utils/formatUtils';
import { marketEventService } from '../../api/marketEventService';

interface StockDetailsPanelProps {
  stock: Stock;
  activeTab: 'overview' | 'financials' | 'news';
  setActiveTab: (tab: 'overview' | 'financials' | 'news') => void;
  onClose: () => void;
}

/**
 * Displays detailed information about a selected stock
 * Shows header with price info, tabs for overview/financials/news and related content
 */
const StockDetailsPanel: React.FC<StockDetailsPanelProps> = ({
  stock,
  activeTab,
  setActiveTab,
  onClose,
}) => {
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Fetch market events when stock changes or news tab is active
  useEffect(() => {
    if (activeTab === 'news' && stock) {
      const fetchMarketEvents = async () => {
        setLoadingNews(true);
        try {
          const response = await marketEventService.getByStockId(stock.id);
          if (response.success && response.data) {
            setMarketEvents(response.data);
          } else {
            setMarketEvents([]);
          }
        } catch (error) {
          console.error('Failed to fetch market events:', error);
          setMarketEvents([]);
        } finally {
          setLoadingNews(false);
        }
      };

      fetchMarketEvents();
    }
  }, [stock, activeTab]);
  return (
    <tr className="bg-gray-50 dark:bg-gray-700/50">
      <td colSpan={5} className="p-0">
        <div className="bg-white dark:bg-gray-800 border-t-2 border-blue-500 dark:border-blue-700">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 p-6">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white opacity-80 hover:opacity-100"
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close stock details"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Company Badge */}
            <div className="inline-block bg-white dark:bg-gray-800 p-2 rounded-lg shadow mb-3">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {stock.symbol}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{stock.name}</h2>
            <div className="flex items-center text-sm text-blue-100 font-medium">
              <span className="bg-blue-700 dark:bg-blue-600 px-2 py-1 rounded-full text-xs">
                {stock.sector}
              </span>
            </div>

            {/* Price Information */}
            <div className="mt-4 flex items-baseline">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(stock.currentPrice)}
              </div>
              <div
                className={`ml-2 px-2 py-1 rounded ${stock.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'} flex items-center`}
              >
                <span className="text-white text-sm font-medium">
                  {stock.changePercent >= 0 ? '↑' : '↓'}{' '}
                  {formatPercentage(Math.abs(stock.changePercent), false)}
                </span>
              </div>
            </div>
            <div className="text-sm text-blue-100 mt-1">{formatCurrency(stock.change)} Today</div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              onClick={e => {
                e.stopPropagation();
                setActiveTab('overview');
              }}
            >
              Overview
            </button>
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium ${
                activeTab === 'financials'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              onClick={e => {
                e.stopPropagation();
                setActiveTab('financials');
              }}
            >
              Financials
            </button>
            <button
              className={`flex-1 py-3 px-2 text-sm font-medium ${
                activeTab === 'news'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              onClick={e => {
                e.stopPropagation();
                setActiveTab('news');
              }}
            >
              News
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Previous Close
                    </div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stock.previousClose)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Volume
                    </div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {stock.volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Market Cap
                    </div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {formatMarketCap(stock.marketCap)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      52-Week Range
                    </div>
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stock.yearLow)} - {formatCurrency(stock.yearHigh)}
                    </div>
                  </div>
                </div>

                {/* Stock Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    About {stock.name}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {stock.description ? (
                      <p>{stock.description}</p>
                    ) : (
                      <p className="italic text-gray-500 dark:text-gray-400">
                        No description available for this stock.
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Trend Visualization */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Price Trend
                  </h3>
                  <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${stock.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${(((stock.currentPrice - stock.yearLow) / (stock.yearHigh - stock.yearLow)) * 100).toFixed(2)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>52-Week Low</span>
                    <span>Current</span>
                    <span>52-Week High</span>
                  </div>
                </div>

                {/* Trading Action */}
                <div className="flex space-x-2 pt-4">
                  <button
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    onClick={e => e.stopPropagation()}
                    aria-label={`Buy ${stock.symbol} stock`}
                  >
                    Buy
                  </button>
                  <button
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    onClick={e => e.stopPropagation()}
                    aria-label={`Sell ${stock.symbol} stock`}
                  >
                    Sell
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <h3 className="font-medium mb-2">Financial Highlights</h3>
                  <table className="min-w-full">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="py-2 text-xs text-gray-500 dark:text-gray-400">P/E Ratio</td>
                        <td className="py-2 text-right font-medium">
                          {(stock.peRatio || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                          Dividend Yield
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatPercentage(stock.dividendYield || 0, false)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-xs text-gray-500 dark:text-gray-400">Beta</td>
                        <td className="py-2 text-right font-medium">
                          {(stock.beta || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                          Market Cap
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  Financial data updated quarterly
                </p>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-4">
                {loadingNews ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm">Loading news...</p>
                  </div>
                ) : marketEvents.length > 0 ? (
                  marketEvents.map(event => (
                    <div
                      key={event.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                          {event.title}
                        </h4>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            event.severity === 'critical'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : event.severity === 'high'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : event.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {event.source && `${event.source} • `}
                          {event.date.toLocaleDateString()}
                        </div>
                        {event.affectedStocks.some(affected => affected.stockId === stock.id) && (
                          <div className="flex items-center">
                            {event.affectedStocks
                              .filter(affected => affected.stockId === stock.id)
                              .map((affected, index) => (
                                <span
                                  key={index}
                                  className={`text-xs font-medium px-2 py-1 rounded ${
                                    affected.impactDirection === 'positive'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : affected.impactDirection === 'negative'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}
                                >
                                  {affected.impactDirection === 'positive'
                                    ? '↑'
                                    : affected.impactDirection === 'negative'
                                      ? '↓'
                                      : '~'}
                                  {affected.priceChangePercent
                                    ? ` ${formatPercentage(affected.priceChangePercent)}`
                                    : ''}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto mb-3 opacity-30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M19 20V9m0 0l-5-1m5 1v4m-8-5v4m-2.5-4v4"
                      />
                    </svg>
                    <p className="text-sm">No recent news available for {stock.symbol}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default StockDetailsPanel;
