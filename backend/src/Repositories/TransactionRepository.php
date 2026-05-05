<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Transaction;
use PDO;
use RuntimeException;

final class TransactionRepository extends PdoRepository
{
    private const COLUMNS = [
        'user_id',
        'portfolio_id',
        'stock_id',
        'type',
        'quantity',
        'price_per_share',
        'total_amount',
        'fees',
        'status',
        'created_at',
        'updated_at',
    ];

    public function findById(string|int $id): ?Transaction
    {
        return $this->fetchRecord(
            'SELECT * FROM transactions WHERE id = :id LIMIT 1',
            ['id' => (int) $id],
            Transaction::class
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createTransaction(array $data): Transaction
    {
        $now = $this->now();
        unset($data['id']);
        $id = $this->insert('transactions', [
            'created_at' => $now,
            'updated_at' => $now,
            ...$data,
        ], self::COLUMNS);

        $transaction = $this->findById($id);
        if (!$transaction) {
            throw new RuntimeException('Created transaction could not be loaded.');
        }

        return $transaction;
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateTransaction(string|int $id, array $data): ?Transaction
    {
        $data['updated_at'] = $this->now();
        $this->update('transactions', $data, self::COLUMNS, ['id' => (int) $id]);

        return $this->findById($id);
    }

    /**
     * @return list<Transaction>
     */
    public function getCompletedTransactions(string|int $portfolioId): array
    {
        return $this->fetchRecords(
            'SELECT * FROM transactions
             WHERE portfolio_id = :portfolio_id AND status = "completed"
             ORDER BY created_at DESC',
            ['portfolio_id' => (int) $portfolioId],
            Transaction::class
        );
    }

    /**
     * @param array<string, mixed> $filters
     * @return list<Transaction>
     */
    public function getTransactionHistory(string|int $portfolioId, array $filters = []): array
    {
        $where = ['portfolio_id = :portfolio_id'];
        $params = ['portfolio_id' => (int) $portfolioId];
        $this->applyFilters($where, $params, $filters);

        return $this->fetchTransactionPage($where, $params, $filters);
    }

    /**
     * @param array<string, mixed> $filters
     * @return list<Transaction>
     */
    public function getUserTransactions(string|int $userId, array $filters = []): array
    {
        $where = ['user_id = :user_id'];
        $params = ['user_id' => (int) $userId];
        $this->applyFilters($where, $params, $filters);

        return $this->fetchTransactionPage($where, $params, $filters);
    }

    public function cancelPendingTransactions(string|int $portfolioId): int
    {
        $statement = $this->db->prepare(
            'UPDATE transactions
             SET status = "cancelled", updated_at = :updated_at
             WHERE portfolio_id = :portfolio_id AND status = "pending"'
        );
        $statement->execute([
            'updated_at' => $this->now(),
            'portfolio_id' => (int) $portfolioId,
        ]);

        return $statement->rowCount();
    }

    /**
     * @return list<Transaction>
     */
    public function getPendingTransactions(string|int $portfolioId): array
    {
        return $this->fetchRecords(
            'SELECT * FROM transactions
             WHERE portfolio_id = :portfolio_id AND status = "pending"
             ORDER BY created_at DESC',
            ['portfolio_id' => (int) $portfolioId],
            Transaction::class
        );
    }

    /**
     * @param array<string, mixed> $filters
     * @return list<Transaction>
     */
    public function getStockTransactions(string|int $stockId, array $filters = []): array
    {
        $where = ['stock_id = :stock_id', 'status = "completed"'];
        $params = ['stock_id' => (int) $stockId];
        $this->applyFilters($where, $params, $filters, false);

        return $this->fetchTransactionPage($where, $params, $filters);
    }

    /**
     * @return array<string, mixed>
     */
    public function getPortfolioTransactionStats(string|int $portfolioId): array
    {
        $statement = $this->db->prepare(
            'SELECT
                COUNT(*) AS total_transactions,
                SUM(CASE WHEN type = "buy" THEN 1 ELSE 0 END) AS total_buys,
                SUM(CASE WHEN type = "sell" THEN 1 ELSE 0 END) AS total_sells,
                SUM(CASE WHEN type = "buy" THEN total_amount ELSE 0 END) AS total_buy_amount,
                SUM(CASE WHEN type = "sell" THEN total_amount ELSE 0 END) AS total_sell_amount,
                SUM(fees) AS total_fees,
                AVG(total_amount) AS avg_transaction_amount
             FROM transactions
             WHERE portfolio_id = :portfolio_id AND status = "completed"'
        );
        $statement->execute(['portfolio_id' => (int) $portfolioId]);
        $row = $statement->fetch();

        return is_array($row) ? $row : [];
    }

    /**
     * @return list<Transaction>
     */
    public function getRecentTransactions(string|int $userId, int $limit = 10): array
    {
        $statement = $this->db->prepare('SELECT * FROM transactions WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit');
        $statement->bindValue('user_id', (int) $userId, PDO::PARAM_INT);
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return array_map(static fn(array $row): Transaction => Transaction::fromArray($row), $statement->fetchAll());
    }

    /**
     * @return list<Transaction>
     */
    public function getLargestTransactions(string|int $portfolioId, int $limit = 5): array
    {
        $statement = $this->db->prepare(
            'SELECT * FROM transactions
             WHERE portfolio_id = :portfolio_id AND status = "completed"
             ORDER BY total_amount DESC LIMIT :limit'
        );
        $statement->bindValue('portfolio_id', (int) $portfolioId, PDO::PARAM_INT);
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return array_map(static fn(array $row): Transaction => Transaction::fromArray($row), $statement->fetchAll());
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getTransactionVolume(string $fromDate, string $toDate): array
    {
        $statement = $this->db->prepare(
            'SELECT
                DATE(created_at) AS date,
                COUNT(*) AS transaction_count,
                SUM(total_amount) AS total_volume,
                SUM(CASE WHEN type = "buy" THEN quantity ELSE 0 END) AS buy_volume,
                SUM(CASE WHEN type = "sell" THEN quantity ELSE 0 END) AS sell_volume
             FROM transactions
             WHERE status = "completed" AND created_at BETWEEN :from_date AND :to_date
             GROUP BY DATE(created_at)
             ORDER BY date ASC'
        );
        $statement->execute(['from_date' => $fromDate, 'to_date' => $toDate]);

        return $statement->fetchAll();
    }

    /**
     * @return array<int|string, array{stock_id: mixed, quantity: int, total_cost: float}>
     */
    public function getPortfolioHoldings(string|int $portfolioId): array
    {
        $holdings = [];
        foreach ($this->getCompletedTransactions($portfolioId) as $transaction) {
            $stockId = $transaction->stock_id;
            if (!isset($holdings[$stockId])) {
                $holdings[$stockId] = [
                    'stock_id' => $stockId,
                    'quantity' => 0,
                    'total_cost' => 0.0,
                ];
            }

            if ($transaction->type === 'buy') {
                $holdings[$stockId]['quantity'] += (int) $transaction->quantity;
                $holdings[$stockId]['total_cost'] += (float) $transaction->total_amount;
            } else {
                $holdings[$stockId]['quantity'] -= (int) $transaction->quantity;
                $holdings[$stockId]['total_cost'] -= (float) $transaction->total_amount;
            }
        }

        return array_filter($holdings, static fn(array $holding): bool => $holding['quantity'] > 0);
    }

    public function cleanupOldCancelledTransactions(int $daysOld = 30): int
    {
        $cutoffDate = gmdate('Y-m-d H:i:s', strtotime("-{$daysOld} days") ?: time());
        $statement = $this->db->prepare('DELETE FROM transactions WHERE status = "cancelled" AND created_at < :cutoff');
        $statement->execute(['cutoff' => $cutoffDate]);

        return $statement->rowCount();
    }

    /**
     * @param list<string> $where
     * @param array<string, mixed> $params
     * @param array<string, mixed> $filters
     */
    private function applyFilters(array &$where, array &$params, array $filters, bool $allowStatus = true): void
    {
        if (isset($filters['type']) && in_array($filters['type'], ['buy', 'sell'], true)) {
            $where[] = 'type = :type';
            $params['type'] = (string) $filters['type'];
        }
        if ($allowStatus && isset($filters['status']) && in_array($filters['status'], ['pending', 'completed', 'cancelled'], true)) {
            $where[] = 'status = :status';
            $params['status'] = (string) $filters['status'];
        }
        if (isset($filters['stock_id'])) {
            $where[] = 'stock_id = :filter_stock_id';
            $params['filter_stock_id'] = (int) $filters['stock_id'];
        }
        if (isset($filters['from_date'])) {
            $where[] = 'created_at >= :from_date';
            $params['from_date'] = (string) $filters['from_date'];
        }
        if (isset($filters['to_date'])) {
            $where[] = 'created_at <= :to_date';
            $params['to_date'] = (string) $filters['to_date'];
        }
    }

    /**
     * @param list<string> $where
     * @param array<string, mixed> $params
     * @param array<string, mixed> $filters
     * @return list<Transaction>
     */
    private function fetchTransactionPage(array $where, array $params, array $filters): array
    {
        $sql = 'SELECT * FROM transactions WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';
        $statement = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $statement->bindValue($key, $value);
        }
        $statement->bindValue('limit', (int) ($filters['limit'] ?? 50), PDO::PARAM_INT);
        $statement->bindValue('offset', (int) ($filters['offset'] ?? 0), PDO::PARAM_INT);
        $statement->execute();

        return array_map(static fn(array $row): Transaction => Transaction::fromArray($row), $statement->fetchAll());
    }
}
