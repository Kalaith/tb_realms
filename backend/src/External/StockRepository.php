<?php

namespace App\External;

use App\Models\Stock;
use Illuminate\Database\Capsule\Manager as DB;

/**
 * Stock repository for database operations
 * Following Mytherra External/ pattern
 */
class StockRepository
{
    /**
     * Find stock by ID
     */
    public function findById(string $id): ?Stock
    {
        return Stock::find($id);
    }

    /**
     * Get all active stocks
     */
    public function getAllActiveStocks(): array
    {
        return Stock::where('is_active', true)
            ->orderBy('symbol')
            ->get()
            ->all();
    }

    /**
     * Search stocks by symbol or name
     */
    public function searchStocks(string $searchTerm): array
    {
        return Stock::where('is_active', true)
            ->where(function ($query) use ($searchTerm) {
                $query->where('symbol', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('name', 'LIKE', "%{$searchTerm}%");
            })
            ->orderBy('symbol')
            ->get()
            ->all();
    }

    /**
     * Get stocks by category
     */
    public function getByCategory(string $category): array
    {
        return Stock::where('is_active', true)
            ->where('category', $category)
            ->orderBy('symbol')
            ->get()
            ->all();
    }

    /**
     * Get stocks by guild
     */
    public function getByGuild(string $guild): array
    {
        return Stock::where('is_active', true)
            ->where('guild', $guild)
            ->orderBy('symbol')
            ->get()
            ->all();
    }

    /**
     * Update stock data
     */
    public function updateStock(string $id, array $data): ?Stock
    {
        $stock = Stock::find($id);
        if ($stock) {
            $stock->update($data);
            return $stock->fresh();
        }
        return null;
    }

    /**
     * Get total number of active stocks
     */
    public function getTotalActiveStocks(): int
    {
        return Stock::where('is_active', true)->count();
    }

    /**
     * Get top gainers by day change percentage
     */
    public function getTopGainers(int $limit = 5): array
    {
        return Stock::where('is_active', true)
            ->where('day_change_percentage', '>', 0)
            ->orderBy('day_change_percentage', 'desc')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Get top losers by day change percentage
     */
    public function getTopLosers(int $limit = 5): array
    {
        return Stock::where('is_active', true)
            ->where('day_change_percentage', '<', 0)
            ->orderBy('day_change_percentage', 'asc')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Get most active stocks by volume
     */
    public function getMostActiveByVolume(int $limit = 5): array
    {
        return Stock::where('is_active', true)
            ->orderBy('volume', 'desc')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Create a new stock
     */
    public function createStock(array $data): Stock
    {
        return Stock::create($data);
    }

    /**
     * Bulk update stock prices
     */
    public function bulkUpdatePrices(array $updates): int
    {
        $updated = 0;
        
        foreach ($updates as $update) {
            $stock = $this->updateStock($update['id'], $update['data']);
            if ($stock) {
                $updated++;
            }
        }
        
        return $updated;
    }

    /**
     * Get stocks with price alerts
     */
    public function getStocksWithAlerts(): array
    {
        // For future implementation of price alerts
        return Stock::where('is_active', true)
            ->whereNotNull('alert_threshold')
            ->get()
            ->all();
    }

    /**
     * Get stocks by multiple IDs
     */
    public function getByIds(array $ids): array
    {
        return Stock::whereIn('id', $ids)
            ->where('is_active', true)
            ->get()
            ->all();
    }

    /**
     * Get market capitalization leaders
     */
    public function getMarketCapLeaders(int $limit = 10): array
    {
        return Stock::where('is_active', true)
            ->whereNotNull('market_cap')
            ->orderBy('market_cap', 'desc')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Get stocks with dividend yield
     */
    public function getDividendStocks(int $limit = 20): array
    {
        return Stock::where('is_active', true)
            ->whereNotNull('dividend_yield')
            ->where('dividend_yield', '>', 0)
            ->orderBy('dividend_yield', 'desc')
            ->limit($limit)
            ->get()
            ->all();
    }

    /**
     * Get all available categories
     */
    public function getAllCategories(): array
    {
        return Stock::where('is_active', true)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Get all available guilds
     */
    public function getAllGuilds(): array
    {
        return Stock::where('is_active', true)
            ->whereNotNull('guild')
            ->distinct()
            ->pluck('guild')
            ->toArray();
    }
}
