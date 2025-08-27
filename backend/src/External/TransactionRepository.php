<?php

namespace App\External;

use App\Models\Transaction;
use Illuminate\Database\Capsule\Manager as DB;

/**
 * Transaction repository for database operations
 * Following Mytherra External/ pattern
 */
class TransactionRepository
{
    /**
     * Find transaction by ID
     */
    public function findById(string $id): ?Transaction
    {
        return Transaction::find($id);
    }

    /**
     * Create a new transaction
     */
    public function createTransaction(array $data): Transaction
    {
        return Transaction::create($data);
    }

    /**
     * Update transaction
     */
    public function updateTransaction(string $id, array $data): ?Transaction
    {
        $transaction = Transaction::find($id);
        if ($transaction) {
            $transaction->update($data);
            return $transaction->fresh();
        }
        return null;
    }

    /**
     * Get completed transactions for a portfolio
     */
    public function getCompletedTransactions(string $portfolioId): array
    {
        return Transaction::where('portfolio_id', $portfolioId)
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get transaction history with filters
     */
    public function getTransactionHistory(string $portfolioId, array $filters = []): array
    {
        $query = Transaction::where('portfolio_id', $portfolioId);

        // Apply filters
        if (isset($filters['type']) && in_array($filters['type'], ['buy', 'sell'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status']) && in_array($filters['status'], ['pending', 'completed', 'cancelled'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['stock_id'])) {
            $query->where('stock_id', $filters['stock_id']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        // Pagination
        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        return $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Get user's transactions across all portfolios
     */
    public function getUserTransactions(string $userId, array $filters = []): array
    {
        $query = Transaction::where('user_id', $userId);

        // Apply same filters as portfolio transactions
        if (isset($filters['type']) && in_array($filters['type'], ['buy', 'sell'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status']) && in_array($filters['status'], ['pending', 'completed', 'cancelled'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['stock_id'])) {
            $query->where('stock_id', $filters['stock_id']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        $limit = $filters['limit'] ?? 50;
        $offset = $filters['offset'] ?? 0;

        return $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->toArray();
    }

    /**
     * Cancel pending transactions for a portfolio
     */
    public function cancelPendingTransactions(string $portfolioId): int
    {
        return Transaction::where('portfolio_id', $portfolioId)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }

    /**
     * Get pending transactions for a portfolio
     */
    public function getPendingTransactions(string $portfolioId): array
    {
        return Transaction::where('portfolio_id', $portfolioId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get transactions for a specific stock
     */
    public function getStockTransactions(string $stockId, array $filters = []): array
    {
        $query = Transaction::where('stock_id', $stockId)
            ->where('status', 'completed');

        if (isset($filters['type']) && in_array($filters['type'], ['buy', 'sell'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['from_date'])) {
            $query->where('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('created_at', '<=', $filters['to_date']);
        }

        $limit = $filters['limit'] ?? 100;

        return $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get transaction statistics for a portfolio
     */
    public function getPortfolioTransactionStats(string $portfolioId): array
    {
        $stats = Transaction::where('portfolio_id', $portfolioId)
            ->where('status', 'completed')
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(CASE WHEN type = "buy" THEN 1 ELSE 0 END) as total_buys,
                SUM(CASE WHEN type = "sell" THEN 1 ELSE 0 END) as total_sells,
                SUM(CASE WHEN type = "buy" THEN total_amount ELSE 0 END) as total_buy_amount,
                SUM(CASE WHEN type = "sell" THEN total_amount ELSE 0 END) as total_sell_amount,
                SUM(fees) as total_fees,
                AVG(total_amount) as avg_transaction_amount
            ')
            ->first();

        return $stats ? $stats->toArray() : [];
    }

    /**
     * Get recent transactions for a user
     */
    public function getRecentTransactions(string $userId, int $limit = 10): array
    {
        return Transaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get largest transactions by amount
     */
    public function getLargestTransactions(string $portfolioId, int $limit = 5): array
    {
        return Transaction::where('portfolio_id', $portfolioId)
            ->where('status', 'completed')
            ->orderBy('total_amount', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get transaction volume for a date range
     */
    public function getTransactionVolume(string $fromDate, string $toDate): array
    {
        return Transaction::where('status', 'completed')
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as transaction_count,
                SUM(total_amount) as total_volume,
                SUM(CASE WHEN type = "buy" THEN quantity ELSE 0 END) as buy_volume,
                SUM(CASE WHEN type = "sell" THEN quantity ELSE 0 END) as sell_volume
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get holdings for a portfolio based on transactions
     */
    public function getPortfolioHoldings(string $portfolioId): array
    {
        $transactions = $this->getCompletedTransactions($portfolioId);
        $holdings = [];

        foreach ($transactions as $transaction) {
            $stockId = $transaction['stock_id'];
            
            if (!isset($holdings[$stockId])) {
                $holdings[$stockId] = [
                    'stock_id' => $stockId,
                    'quantity' => 0,
                    'total_cost' => 0
                ];
            }

            if ($transaction['type'] === 'buy') {
                $holdings[$stockId]['quantity'] += $transaction['quantity'];
                $holdings[$stockId]['total_cost'] += $transaction['total_amount'];
            } else {
                $holdings[$stockId]['quantity'] -= $transaction['quantity'];
                $holdings[$stockId]['total_cost'] -= $transaction['total_amount'];
            }
        }

        // Filter out zero or negative positions
        return array_filter($holdings, fn($holding) => $holding['quantity'] > 0);
    }

    /**
     * Delete old cancelled transactions (cleanup)
     */
    public function cleanupOldCancelledTransactions(int $daysOld = 30): int
    {
        $cutoffDate = date('Y-m-d H:i:s', strtotime("-{$daysOld} days"));
        
        return Transaction::where('status', 'cancelled')
            ->where('created_at', '<', $cutoffDate)
            ->delete();
    }
}
