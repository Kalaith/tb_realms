<?php

namespace App\Actions;

use App\External\PortfolioRepository;
use App\External\TransactionRepository;
use App\External\StockRepository;
use App\External\UserRepository;
use App\Models\Portfolio;
use App\Models\Transaction;
use App\Models\Stock;
use App\Models\User;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\UnauthorizedException;
use Illuminate\Database\Capsule\Manager as Capsule;

/**
 * Portfolio management business logic
 * Following Mytherra Actions pattern with proper decimal handling
 */
class PortfolioActions
{
    public function __construct(
        private PortfolioRepository $portfolioRepository,
        private TransactionRepository $transactionRepository,
        private StockRepository $stockRepository,
        private UserRepository $userRepository
    ) {}

    /**
     * Get user's portfolio with current holdings and performance
     */
    public function getPortfolioData(string|int $userId): array
    {
        $portfolio = $this->portfolioRepository->findByUserId((string)$userId);
        
        if (!$portfolio) {
            // Create portfolio if doesn't exist
            $portfolio = $this->createPortfolioForUser((string)$userId);
        }

        $holdings = $this->calculateCurrentHoldings($portfolio->id);
        $performance = $this->calculatePortfolioPerformance($portfolio, $holdings);
        
        return [
            'id' => $portfolio->id,
            'user_id' => $portfolio->user_id,
            'cash_balance' => (float) $portfolio->cash_balance,
            'total_value' => (float) $performance['total_value'],
            'total_invested' => (float) $portfolio->total_invested,
            'total_profit_loss' => (float) $performance['total_profit_loss'],
            'performance_percentage' => (float) $performance['performance_percentage'],
            'risk_level' => $portfolio->risk_level,
            'holdings' => $holdings,
            'positions' => $holdings, // Alternative name that frontend might expect
            'transactions' => [], // Empty array for recent transactions
            'daily_change' => (float) $performance['daily_change'],
            'daily_change_percentage' => (float) $performance['daily_change_percentage'],
            'created_at' => $portfolio->created_at->toISOString(),
            'updated_at' => $portfolio->updated_at->toISOString()
        ];
    }

    /**
     * Get portfolio data by user identifier (username or ID)
     */
    public function getPortfolioByIdentifier(string $identifier): array
    {
        // Try to find user by username first, then by ID
        $user = $this->userRepository->findByUsername($identifier);
        
        if (!$user) {
            // Try to find by ID if identifier is numeric
            if (is_numeric($identifier)) {
                $user = $this->userRepository->findById((int)$identifier);
            }
        }
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }
        
        return $this->getPortfolioData((string)$user->id);
    }

    /**
     * Reset portfolio to starting balance
     */
    public function resetPortfolio(string $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }

        $portfolio = $this->portfolioRepository->findByUserId($userId);
        if (!$portfolio) {
            throw new ResourceNotFoundException('Portfolio not found');
        }

        // Cancel all pending transactions
        $this->transactionRepository->cancelPendingTransactions($portfolio->id);
        
        // Reset portfolio values
        $resetData = [
            'cash_balance' => $user->starting_balance,
            'total_value' => $user->starting_balance,
            'total_invested' => 0,
            'total_profit_loss' => 0,
            'performance_percentage' => 0
        ];
        
        $portfolio = $this->portfolioRepository->updatePortfolio($portfolio->id, $resetData);
        
        return $this->getPortfolioData($userId);
    }

    /**
     * Get detailed portfolio performance metrics
     */
    public function getPortfolioPerformance(string $userId): array
    {
        $portfolio = $this->portfolioRepository->findByUserId($userId);
        
        if (!$portfolio) {
            throw new ResourceNotFoundException('Portfolio not found');
        }

        $holdings = $this->calculateCurrentHoldings($portfolio->id);
        $performance = $this->calculatePortfolioPerformance($portfolio, $holdings);
        
        // Get transaction history for analysis
        $transactions = $this->transactionRepository->getCompletedTransactions($portfolio->id);
        $performanceHistory = $this->calculatePerformanceHistory($portfolio, $transactions);
        
        return [
            'current_performance' => $performance,
            'performance_history' => $performanceHistory,
            'risk_metrics' => $this->calculateRiskMetrics($holdings),
            'allocation' => $this->calculateAssetAllocation($holdings, $portfolio->cash_balance)
        ];
    }

    /**
     * Get current stock holdings with real-time values
     */
    public function getCurrentHoldings(string $userId): array
    {
        $portfolio = $this->portfolioRepository->findByUserId($userId);
        
        if (!$portfolio) {
            throw new ResourceNotFoundException('Portfolio not found');
        }

        return $this->calculateCurrentHoldings($portfolio->id);
    }

    /**
     * Create portfolio for new user
     */
    private function createPortfolioForUser(string $userId): Portfolio
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }

        $startingBalance = isset($user->starting_balance) && is_numeric($user->starting_balance)
            ? (float) $user->starting_balance
            : 10000.00;

        $columns = array_fill_keys(Capsule::schema()->getColumnListing('portfolios'), true);
        $portfolioData = [];

        if (isset($columns['user_id'])) {
            $portfolioData['user_id'] = $userId;
        }
        if (isset($columns['cash_balance'])) {
            $portfolioData['cash_balance'] = $startingBalance;
        }
        if (isset($columns['total_value'])) {
            $portfolioData['total_value'] = $startingBalance;
        }
        if (isset($columns['total_invested'])) {
            $portfolioData['total_invested'] = 0;
        }
        if (isset($columns['total_profit_loss'])) {
            $portfolioData['total_profit_loss'] = 0;
        }
        if (isset($columns['performance_percentage'])) {
            $portfolioData['performance_percentage'] = 0;
        }
        if (isset($columns['risk_level'])) {
            $portfolioData['risk_level'] = 'moderate';
        }

        return $this->portfolioRepository->createPortfolio($portfolioData);
    }

    /**
     * Calculate current holdings from completed transactions
     */
    private function calculateCurrentHoldings(string $portfolioId): array
    {
        $transactions = $this->transactionRepository->getCompletedTransactions($portfolioId);
        $holdings = [];

        // Group transactions by stock and calculate net position
        foreach ($transactions as $transaction) {
            $stockId = $transaction->stock_id;
            
            if (!isset($holdings[$stockId])) {
                $holdings[$stockId] = [
                    'stock_id' => $stockId,
                    'quantity' => 0,
                    'total_cost' => 0,
                    'transactions' => []
                ];
            }

            $holdings[$stockId]['transactions'][] = $transaction;
            
            if ($transaction->type === 'buy') {
                $holdings[$stockId]['quantity'] += $transaction->quantity;
                $holdings[$stockId]['total_cost'] += (float) $transaction->total_amount;
            } else {
                $holdings[$stockId]['quantity'] -= $transaction->quantity;
                $holdings[$stockId]['total_cost'] -= (float) $transaction->total_amount;
            }
        }

        // Filter out zero positions and add current market data
        $activeHoldings = [];
        foreach ($holdings as $stockId => $holding) {
            if ($holding['quantity'] > 0) {
                $stock = $this->stockRepository->findById($stockId);
                if ($stock) {
                    $currentValue = $holding['quantity'] * (float) $stock->current_price;
                    $avgCostPerShare = $holding['total_cost'] / $holding['quantity'];
                    $profitLoss = $currentValue - $holding['total_cost'];
                    $profitLossPercentage = $holding['total_cost'] > 0 ? 
                        ($profitLoss / $holding['total_cost']) * 100 : 0;

                    $activeHoldings[] = [
                        'stock_id' => $stockId,
                        'stock_symbol' => $stock->symbol,
                        'stock_name' => $stock->name,
                        'quantity' => $holding['quantity'],
                        'avg_cost_per_share' => round($avgCostPerShare, 4),
                        'current_price' => (float) $stock->current_price,
                        'total_cost' => round($holding['total_cost'], 2),
                        'current_value' => round($currentValue, 2),
                        'profit_loss' => round($profitLoss, 2),
                        'profit_loss_percentage' => round($profitLossPercentage, 4),
                        'day_change' => (float) $stock->day_change,
                        'day_change_percentage' => (float) $stock->day_change_percentage
                    ];
                }
            }
        }

        return $activeHoldings;
    }

    /**
     * Calculate portfolio performance metrics
     */
    private function calculatePortfolioPerformance(Portfolio $portfolio, array $holdings): array
    {
        $totalHoldingsValue = array_sum(array_column($holdings, 'current_value'));
        $totalValue = $totalHoldingsValue + (float) $portfolio->cash_balance;
        $totalCost = array_sum(array_column($holdings, 'total_cost'));
        $totalProfitLoss = $totalHoldingsValue - $totalCost;
        
        $performancePercentage = $totalCost > 0 ? ($totalProfitLoss / $totalCost) * 100 : 0;
        
        // Calculate daily change
        $dailyChange = 0;
        foreach ($holdings as $holding) {
            $dailyChange += $holding['quantity'] * (float) $holding['day_change'];
        }
        
        $dailyChangePercentage = $totalValue > 0 ? ($dailyChange / $totalValue) * 100 : 0;

        return [
            'total_value' => round($totalValue, 2),
            'holdings_value' => round($totalHoldingsValue, 2),
            'cash_balance' => (float) $portfolio->cash_balance,
            'total_profit_loss' => round($totalProfitLoss, 2),
            'performance_percentage' => round($performancePercentage, 4),
            'daily_change' => round($dailyChange, 2),
            'daily_change_percentage' => round($dailyChangePercentage, 4)
        ];
    }

    /**
     * Calculate performance history over time
     */
    private function calculatePerformanceHistory(Portfolio $portfolio, array $transactions): array
    {
        // Group transactions by date and calculate portfolio value progression
        $history = [];
        $cumulativeInvestment = 0;
        
        foreach ($transactions as $transaction) {
            $date = $transaction->created_at->toDateString();
            
            if (!isset($history[$date])) {
                $history[$date] = [
                    'date' => $date,
                    'total_invested' => $cumulativeInvestment,
                    'transactions' => 0
                ];
            }
            
            if ($transaction->type === 'buy') {
                $cumulativeInvestment += (float) $transaction->total_amount;
            }
            
            $history[$date]['total_invested'] = $cumulativeInvestment;
            $history[$date]['transactions']++;
        }
        
        return array_values($history);
    }

    /**
     * Calculate risk metrics for portfolio
     */
    private function calculateRiskMetrics(array $holdings): array
    {
        if (empty($holdings)) {
            return [
                'diversification_score' => 0,
                'risk_level' => 'low',
                'sector_concentration' => []
            ];
        }

        $totalValue = array_sum(array_column($holdings, 'current_value'));
        $sectorConcentration = [];
        
        // Group by category for diversification analysis
        foreach ($holdings as $holding) {
            $stock = $this->stockRepository->findById($holding['stock_id']);
            if ($stock && $stock->category) {
                $category = $stock->category;
                if (!isset($sectorConcentration[$category])) {
                    $sectorConcentration[$category] = 0;
                }
                $sectorConcentration[$category] += $holding['current_value'];
            }
        }

        // Calculate concentration percentages
        $concentrationPercentages = [];
        foreach ($sectorConcentration as $sector => $value) {
            $concentrationPercentages[$sector] = ($value / $totalValue) * 100;
        }

        // Determine diversification score (higher = more diversified)
        $numSectors = count($concentrationPercentages);
        $maxConcentration = $numSectors > 0 ? max($concentrationPercentages) : 0;
        $diversificationScore = $numSectors > 0 ? (1 - ($maxConcentration / 100)) * $numSectors : 0;

        return [
            'diversification_score' => round($diversificationScore, 2),
            'risk_level' => $maxConcentration > 50 ? 'high' : ($maxConcentration > 30 ? 'medium' : 'low'),
            'sector_concentration' => $concentrationPercentages
        ];
    }

    /**
     * Calculate asset allocation breakdown
     */
    private function calculateAssetAllocation(array $holdings, float $cashBalance): array
    {
        $totalHoldingsValue = array_sum(array_column($holdings, 'current_value'));
        $totalValue = $totalHoldingsValue + $cashBalance;
        
        if ($totalValue <= 0) {
            return [
                'cash_percentage' => 100,
                'stocks_percentage' => 0,
                'top_holdings' => []
            ];
        }

        $cashPercentage = ($cashBalance / $totalValue) * 100;
        $stocksPercentage = ($totalHoldingsValue / $totalValue) * 100;
        
        // Get top 5 holdings by value
        usort($holdings, fn($a, $b) => $b['current_value'] <=> $a['current_value']);
        $topHoldings = array_slice($holdings, 0, 5);
        
        foreach ($topHoldings as &$holding) {
            $holding['portfolio_percentage'] = ($holding['current_value'] / $totalValue) * 100;
        }

        return [
            'cash_percentage' => round($cashPercentage, 2),
            'stocks_percentage' => round($stocksPercentage, 2),
            'top_holdings' => $topHoldings
        ];
    }
}
