<?php

namespace App\External;

use App\Models\Portfolio;
use App\Exceptions\ResourceNotFoundException;

/**
 * Portfolio repository for database operations
 * Following Mytherra External/ pattern
 */
class PortfolioRepository
{
    /**
     * Find portfolio by user ID
     */
    public function findByUserId(string $userId): ?Portfolio
    {
        return Portfolio::where('user_id', $userId)->first();
    }

    /**
     * Find portfolio by ID
     */
    public function findById(string $id): ?Portfolio
    {
        return Portfolio::find($id);
    }

    /**
     * Create a new portfolio
     */
    public function createPortfolio(array $data): Portfolio
    {
        return Portfolio::create($data);
    }

    /**
     * Update portfolio values
     */
    public function updatePortfolio(string $portfolioId, array $updates): Portfolio
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            throw new ResourceNotFoundException("Portfolio with ID {$portfolioId} not found");
        }

        $portfolio->update($updates);
        return $portfolio->fresh();
    }

    /**
     * Get all portfolios (admin function)
     */
    public function getAllPortfolios(array $filters = []): array
    {
        $query = Portfolio::query();

        if (isset($filters['risk_level'])) {
            $query->where('risk_level', $filters['risk_level']);
        }

        if (isset($filters['min_value'])) {
            $query->where('total_value', '>=', $filters['min_value']);
        }

        if (isset($filters['max_value'])) {
            $query->where('total_value', '<=', $filters['max_value']);
        }

        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        return $query->orderBy('total_value', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Get portfolio rankings by performance
     */
    public function getPortfolioRankings(int $limit = 100): array
    {
        return Portfolio::orderBy('performance_percentage', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Update cash balance
     */
    public function updateCashBalance(string $portfolioId, float $amount): Portfolio
    {
        return $this->updatePortfolio($portfolioId, ['cash_balance' => $amount]);
    }

    /**
     * Increment total invested amount
     */
    public function incrementTotalInvested(string $portfolioId, float $amount): Portfolio
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            throw new ResourceNotFoundException("Portfolio with ID {$portfolioId} not found");
        }

        $newTotal = (float) $portfolio->total_invested + $amount;
        return $this->updatePortfolio($portfolioId, ['total_invested' => $newTotal]);
    }

    /**
     * Recalculate and update portfolio metrics
     */
    public function recalculatePortfolioMetrics(string $portfolioId, array $holdings): Portfolio
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            throw new ResourceNotFoundException("Portfolio with ID {$portfolioId} not found");
        }

        $holdingsValue = array_sum(array_column($holdings, 'current_value'));
        $totalValue = $holdingsValue + (float) $portfolio->cash_balance;
        $totalCost = array_sum(array_column($holdings, 'total_cost'));
        $profitLoss = $holdingsValue - $totalCost;
        $performancePercentage = $totalCost > 0 ? ($profitLoss / $totalCost) * 100 : 0;

        return $this->updatePortfolio($portfolioId, [
            'total_value' => $totalValue,
            'total_profit_loss' => $profitLoss,
            'performance_percentage' => $performancePercentage
        ]);
    }

    /**
     * Get portfolio statistics
     */
    public function getPortfolioStats(string $portfolioId): array
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            throw new ResourceNotFoundException("Portfolio with ID {$portfolioId} not found");
        }

        return [
            'cash_balance' => (float) $portfolio->cash_balance,
            'total_value' => (float) $portfolio->total_value,
            'total_invested' => (float) $portfolio->total_invested,
            'total_profit_loss' => (float) $portfolio->total_profit_loss,
            'performance_percentage' => (float) $portfolio->performance_percentage,
            'risk_level' => $portfolio->risk_level,
            'created_at' => $portfolio->created_at,
            'updated_at' => $portfolio->updated_at
        ];
    }

    /**
     * Get top performing portfolios
     */
    public function getTopPerformers(int $limit = 10): array
    {
        return Portfolio::where('total_invested', '>', 0)
            ->orderBy('performance_percentage', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get portfolios by risk level
     */
    public function getByRiskLevel(string $riskLevel): array
    {
        return Portfolio::where('risk_level', $riskLevel)
            ->orderBy('total_value', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get portfolio performance distribution
     */
    public function getPerformanceDistribution(): array
    {
        $results = Portfolio::selectRaw('
            COUNT(*) as total_portfolios,
            AVG(performance_percentage) as avg_performance,
            MIN(performance_percentage) as min_performance,
            MAX(performance_percentage) as max_performance,
            SUM(CASE WHEN performance_percentage > 0 THEN 1 ELSE 0 END) as profitable_portfolios,
            SUM(CASE WHEN performance_percentage < 0 THEN 1 ELSE 0 END) as loss_portfolios
        ')->first();

        return $results ? $results->toArray() : [];
    }

    /**
     * Reset portfolio to starting values
     */
    public function resetPortfolio(string $portfolioId, float $startingBalance): Portfolio
    {
        return $this->updatePortfolio($portfolioId, [
            'cash_balance' => $startingBalance,
            'total_value' => $startingBalance,
            'total_invested' => 0,
            'total_profit_loss' => 0,
            'performance_percentage' => 0
        ]);
    }

    /**
     * Delete portfolio (admin function)
     */
    public function deletePortfolio(string $portfolioId): bool
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            return false;
        }

        return $portfolio->delete();
    }

    /**
     * Get portfolios with low cash balance
     */
    public function getPortfoliosWithLowCash(float $threshold = 100): array
    {
        return Portfolio::where('cash_balance', '<', $threshold)
            ->orderBy('cash_balance', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Get portfolio value history (placeholder for future implementation)
     */
    public function getValueHistory(string $portfolioId, int $days = 30): array
    {
        // This would require a portfolio_history table in a real implementation
        // For now, return empty array
        return [];
    }
}
