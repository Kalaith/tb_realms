import { useState, useEffect, useMemo } from 'react';
import { portfolioService } from '../api/portfolioService';
import { Portfolio as PortfolioType, Position } from '../entities/Portfolio';
import { useAuth } from '../contexts/AuthContext';
import {
  PortfolioSummary,
  PortfolioHoldings,
  PortfolioTransactions,
  PortfolioPerformance,
  TransactionModal
} from '../components/portfolio';
import { LoadingSpinner } from '../components/utility';

/**
 * Portfolio page component that orchestrates the portfolio view and interactions
 */
const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions' | 'performance'>('holdings');
  
  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [transactionMessage, setTransactionMessage] = useState<string>('');
  // Get current user from auth context
  const { user, isAuthenticated } = useAuth();
  const userId = user?.username || '';
  
  useEffect(() => {
    const fetchPortfolio = async () => {
      // Don't attempt to fetch if user is not authenticated
      if (!isAuthenticated) {
        setLoading(false);
        setError('Please log in to view your portfolio');
        return;
      }
      
      // Also check for userId to be extra safe
      if (!userId) {
        setLoading(false);
        setError('Unable to identify user. Please try logging in again.');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch portfolio data for the current user
        const response = await portfolioService.getUserPortfolio(userId);
        
        if (response.success && response.data) {
          setPortfolio(response.data);
        } else {
          // Show a more informative error message
          setError(response.error?.message || 'Failed to load portfolio data');
        }
      } catch {
        setError('An error occurred while fetching portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId]);
  
  // Calculate total profit/loss
  const totalProfitLoss = useMemo(() => {
    if (!portfolio?.positions) return 0;
    return portfolio.positions.reduce((sum, position) => sum + position.totalReturn, 0);
  }, [portfolio?.positions]);
  
  // Calculate total profit/loss percentage
  const totalProfitLossPercentage = useMemo(() => {
    if (!portfolio?.positions || portfolio.positions.length === 0) return 0;
    
    const totalCost = portfolio.positions.reduce((sum, position) => 
      sum + (position.averageBuyPrice * position.shares), 0);
      
    const totalValue = portfolio.positions.reduce((sum, position) => 
      sum + position.currentValue, 0);
      
    return ((totalValue / totalCost) - 1) * 100;
  }, [portfolio?.positions]);
  
  // Open modal for buy/sell
  const openTransactionModal = (type: 'buy' | 'sell', position: Position) => {
    setModalType(type);
    setSelectedPosition(position);
    setShowModal(true);
    setTransactionStatus('idle');
    setTransactionMessage('');
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPosition(null);
    setTransactionStatus('idle');
    setTransactionMessage('');
  };
  
  // Execute transaction
  const executeTransaction = async (shares: number) => {
    if (!portfolio || !selectedPosition || shares <= 0) return;
    
    try {
      setTransactionStatus('loading');
      
      const stockPrice = selectedPosition.stock.currentPrice;
      let response;
      
      if (modalType === 'buy') {
        response = await portfolioService.buyStock(
          portfolio.id,
          selectedPosition.stockId,
          shares,
          stockPrice
        );
      } else {
        response = await portfolioService.sellStock(
          portfolio.id,
          selectedPosition.stockId,
          shares,
          stockPrice
        );
      }
      
      if (response.success) {
        // Refresh portfolio data
        const updatedPortfolio = await portfolioService.getUserPortfolio(userId);
        if (updatedPortfolio.success && updatedPortfolio.data) {
          setPortfolio(updatedPortfolio.data);
        }
        
        setTransactionStatus('success');
        setTransactionMessage(
          `Successfully ${modalType === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${selectedPosition.stock.symbol}`
        );
        
        // Close modal after a delay
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setTransactionStatus('error');
        setTransactionMessage(response.error?.message || 'Transaction failed');
      }
    } catch {
      setTransactionStatus('error');
      setTransactionMessage('An error occurred during the transaction');
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    );
  }
  
  if (!portfolio) {
    return (
      <div className="space-y-6">
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          Portfolio not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Summary Cards */}
      <PortfolioSummary 
        portfolio={portfolio} 
        totalProfitLoss={totalProfitLoss} 
        totalProfitLossPercentage={totalProfitLossPercentage}
      />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px space-x-8">
          <button 
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'holdings' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('holdings')}
          >
            Holdings
          </button>
          <button 
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'transactions' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'performance' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <PortfolioHoldings 
            positions={portfolio.positions}
            onBuyClick={(position) => openTransactionModal('buy', position)}
            onSellClick={(position) => openTransactionModal('sell', position)}
          />
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <PortfolioTransactions transactions={portfolio.transactionHistory} />
        )}
        
        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <PortfolioPerformance />
        )}
      </div>
      
      {/* Transaction Modal */}
      {showModal && selectedPosition && (
        <TransactionModal
          isOpen={showModal}
          type={modalType}
          position={selectedPosition}
          portfolioCash={portfolio.cash}
          onClose={closeModal}
          onExecute={executeTransaction}
          transactionStatus={transactionStatus}
          transactionMessage={transactionMessage}
        />
      )}
    </div>
  );
};

export default Portfolio;
