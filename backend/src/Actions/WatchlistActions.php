<?php

namespace App\Actions;

use App\External\WatchlistRepository;
use App\External\StockRepository;
use App\External\UserRepository;
use App\Exceptions\ResourceNotFoundException;

/**
 * Watchlist management business logic
 * Following Mytherra Actions pattern
 */
class WatchlistActions
{
    public function __construct(
        private WatchlistRepository $watchlistRepository,
        private StockRepository $stockRepository,
        private UserRepository $userRepository
    ) {}

    /**
     * Get user's watchlist with stock details
     */
    public function getUserWatchlist(string|int $userId): array
    {
        $watchlistItems = $this->watchlistRepository->getWatchlistByUserId((string)$userId);
        
        $watchlist = [];
        foreach ($watchlistItems as $item) {
            $stock = $this->stockRepository->findById($item['stock_id']);
            if ($stock) {
                $watchlist[] = [
                    'id' => $item['id'],
                    'stock_id' => $stock->id,
                    'symbol' => $stock->symbol,
                    'name' => $stock->name,
                    'current_price' => (float) $stock->current_price,
                    'day_change' => (float) $stock->day_change,
                    'day_change_percentage' => (float) $stock->day_change_percentage,
                    'market_cap' => $stock->market_cap,
                    'guild' => $stock->guild,
                    'category' => $stock->category,
                    'added_at' => $item['created_at']
                ];
            }
        }
        
        return [
            'watchlist' => $watchlist,
            'count' => count($watchlist)
        ];
    }

    /**
     * Add stock to user's watchlist
     */
    public function addStockToWatchlist(string|int $userId, ?int $stockId): array
    {
        if (!$stockId) {
            throw new \InvalidArgumentException('Stock ID is required');
        }

        // Verify stock exists
        $stock = $this->stockRepository->findById($stockId);
        if (!$stock) {
            throw new ResourceNotFoundException('Stock not found');
        }

        // Check if already in watchlist
        if ($this->watchlistRepository->isStockInWatchlist((string)$userId, $stockId)) {
            throw new \InvalidArgumentException('Stock is already in watchlist');
        }

        $watchlistItem = $this->watchlistRepository->addToWatchlist((string)$userId, $stockId);
        
        return [
            'message' => 'Stock added to watchlist',
            'watchlist_item' => [
                'id' => $watchlistItem['id'],
                'stock_id' => $stockId,
                'symbol' => $stock->symbol,
                'name' => $stock->name,
                'added_at' => $watchlistItem['created_at']
            ]
        ];
    }

    /**
     * Remove stock from user's watchlist
     */
    public function removeStockFromWatchlist(string|int $userId, ?int $stockId): array
    {
        if (!$stockId) {
            throw new \InvalidArgumentException('Stock ID is required');
        }

        $removed = $this->watchlistRepository->removeFromWatchlist((string)$userId, $stockId);
        
        if (!$removed) {
            throw new ResourceNotFoundException('Stock not found in watchlist');
        }

        return [
            'message' => 'Stock removed from watchlist',
            'stock_id' => $stockId
        ];
    }
}
