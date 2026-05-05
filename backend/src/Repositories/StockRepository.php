<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Stock;
use PDO;
use RuntimeException;

final class StockRepository extends PdoRepository
{
    private const COLUMNS = [
        'symbol',
        'name',
        'description',
        'guild',
        'category',
        'current_price',
        'previous_close',
        'day_change',
        'day_change_percentage',
        'market_cap',
        'volume',
        'avg_volume',
        'pe_ratio',
        'dividend_yield',
        'beta',
        'week_52_high',
        'week_52_low',
        'is_active',
        'last_updated',
        'created_at',
        'updated_at',
    ];

    public function findById(string|int $id): ?Stock
    {
        return $this->fetchRecord('SELECT * FROM stocks WHERE id = :id LIMIT 1', ['id' => (int) $id], Stock::class);
    }

    /**
     * @return list<Stock>
     */
    public function getAllActiveStocks(): array
    {
        return $this->fetchRecords(
            'SELECT * FROM stocks WHERE is_active = 1 ORDER BY symbol ASC',
            [],
            Stock::class
        );
    }

    /**
     * @return list<Stock>
     */
    public function searchStocks(string $searchTerm): array
    {
        return $this->fetchRecords(
            'SELECT * FROM stocks
             WHERE is_active = 1 AND (symbol LIKE :search OR name LIKE :search)
             ORDER BY symbol ASC',
            ['search' => '%' . $searchTerm . '%'],
            Stock::class
        );
    }

    /**
     * @return list<Stock>
     */
    public function getByCategory(string $category): array
    {
        return $this->fetchRecords(
            'SELECT * FROM stocks WHERE is_active = 1 AND category = :category ORDER BY symbol ASC',
            ['category' => $category],
            Stock::class
        );
    }

    /**
     * @return list<Stock>
     */
    public function getByGuild(string $guild): array
    {
        return $this->fetchRecords(
            'SELECT * FROM stocks WHERE is_active = 1 AND guild = :guild ORDER BY symbol ASC',
            ['guild' => $guild],
            Stock::class
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateStock(string|int $id, array $data): ?Stock
    {
        $data['updated_at'] = $this->now();
        if (array_key_exists('current_price', $data)) {
            $data['last_updated'] = $this->now();
        }

        $this->update('stocks', $data, self::COLUMNS, ['id' => (int) $id]);

        return $this->findById($id);
    }

    public function getTotalActiveStocks(): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM stocks WHERE is_active = 1');
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    /**
     * @return list<Stock>
     */
    public function getTopGainers(int $limit = 5): array
    {
        return $this->fetchLimitedStocks(
            'SELECT * FROM stocks WHERE is_active = 1 AND day_change_percentage > 0 ORDER BY day_change_percentage DESC LIMIT :limit',
            $limit
        );
    }

    /**
     * @return list<Stock>
     */
    public function getTopLosers(int $limit = 5): array
    {
        return $this->fetchLimitedStocks(
            'SELECT * FROM stocks WHERE is_active = 1 AND day_change_percentage < 0 ORDER BY day_change_percentage ASC LIMIT :limit',
            $limit
        );
    }

    /**
     * @return list<Stock>
     */
    public function getMostActiveByVolume(int $limit = 5): array
    {
        return $this->fetchLimitedStocks(
            'SELECT * FROM stocks WHERE is_active = 1 ORDER BY volume DESC LIMIT :limit',
            $limit
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createStock(array $data): Stock
    {
        $now = $this->now();
        $id = $this->insert('stocks', [
            'created_at' => $now,
            'updated_at' => $now,
            'last_updated' => $now,
            ...$data,
        ], self::COLUMNS);
        $stock = $this->findById($id);
        if (!$stock) {
            throw new RuntimeException('Created stock could not be loaded.');
        }

        return $stock;
    }

    /**
     * @param list<array{ id: int|string, data: array<string, mixed> }> $updates
     */
    public function bulkUpdatePrices(array $updates): int
    {
        $updated = 0;
        foreach ($updates as $update) {
            if ($this->updateStock($update['id'], $update['data'])) {
                $updated++;
            }
        }

        return $updated;
    }

    /**
     * @return list<Stock>
     */
    public function getStocksWithAlerts(): array
    {
        return [];
    }

    /**
     * @param list<int|string> $ids
     * @return list<Stock>
     */
    public function getByIds(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $placeholders = [];
        $params = [];
        foreach (array_values($ids) as $index => $id) {
            $name = 'id_' . $index;
            $placeholders[] = ':' . $name;
            $params[$name] = (int) $id;
        }

        return $this->fetchRecords(
            'SELECT * FROM stocks WHERE is_active = 1 AND id IN (' . implode(', ', $placeholders) . ')',
            $params,
            Stock::class
        );
    }

    /**
     * @return list<Stock>
     */
    public function getMarketCapLeaders(int $limit = 10): array
    {
        return $this->fetchLimitedStocks(
            'SELECT * FROM stocks WHERE is_active = 1 AND market_cap IS NOT NULL ORDER BY market_cap DESC LIMIT :limit',
            $limit
        );
    }

    /**
     * @return list<Stock>
     */
    public function getDividendStocks(int $limit = 20): array
    {
        return $this->fetchLimitedStocks(
            'SELECT * FROM stocks WHERE is_active = 1 AND dividend_yield IS NOT NULL AND dividend_yield > 0 ORDER BY dividend_yield DESC LIMIT :limit',
            $limit
        );
    }

    /**
     * @return list<string>
     */
    public function getAllCategories(): array
    {
        return $this->fetchColumnList(
            'SELECT DISTINCT category FROM stocks WHERE is_active = 1 AND category IS NOT NULL ORDER BY category ASC'
        );
    }

    /**
     * @return list<string>
     */
    public function getAllGuilds(): array
    {
        return $this->fetchColumnList(
            'SELECT DISTINCT guild FROM stocks WHERE is_active = 1 AND guild IS NOT NULL ORDER BY guild ASC'
        );
    }

    /**
     * @return list<Stock>
     */
    private function fetchLimitedStocks(string $sql, int $limit): array
    {
        $statement = $this->db->prepare($sql);
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return array_map(
            static fn(array $row): Stock => Stock::fromArray($row),
            $statement->fetchAll()
        );
    }

    /**
     * @return list<string>
     */
    private function fetchColumnList(string $sql): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute();

        return array_values(array_filter(array_map('strval', $statement->fetchAll(PDO::FETCH_COLUMN))));
    }
}
