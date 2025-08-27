<?php

namespace App\External;

use App\Models\Watchlist;

/**
 * Watchlist repository for database operations
 * Following Mytherra External/ pattern
 */
class WatchlistRepository
{
    /**
     * Get user's watchlist
     */
    public function getWatchlistByUserId(string $userId): array
    {
        return Watchlist::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Add stock to watchlist
     */
    public function addToWatchlist(string $userId, int $stockId): array
    {
        $watchlistItem = Watchlist::create([
            'user_id' => $userId,
            'stock_id' => $stockId
        ]);

        return $watchlistItem->toArray();
    }

    /**
     * Remove stock from watchlist
     */
    public function removeFromWatchlist(string $userId, int $stockId): bool
    {
        $deleted = Watchlist::where('user_id', $userId)
            ->where('stock_id', $stockId)
            ->delete();

        return $deleted > 0;
    }

    /**
     * Check if stock is in user's watchlist
     */
    public function isStockInWatchlist(string $userId, int $stockId): bool
    {
        return Watchlist::where('user_id', $userId)
            ->where('stock_id', $stockId)
            ->exists();
    }

    /**
     * Get watchlist count for user
     */
    public function getWatchlistCount(string $userId): int
    {
        return Watchlist::where('user_id', $userId)->count();
    }

    /**
     * Clear user's entire watchlist
     */
    public function clearWatchlist(string $userId): bool
    {
        $deleted = Watchlist::where('user_id', $userId)->delete();
        return $deleted >= 0;
    }
}
