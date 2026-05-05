<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Exceptions\ResourceNotFoundException;
use App\Models\Portfolio;
use PDO;

final class PortfolioRepository extends PdoRepository
{
    private const COLUMNS = [
        'user_id',
        'cash_balance',
        'total_value',
        'total_invested',
        'total_profit_loss',
        'performance_percentage',
        'risk_level',
        'created_at',
        'updated_at',
    ];

    public function findByUserId(string|int $userId): ?Portfolio
    {
        return $this->fetchRecord(
            'SELECT * FROM portfolios WHERE user_id = :user_id LIMIT 1',
            ['user_id' => (int) $userId],
            Portfolio::class
        );
    }

    public function findById(string|int $id): ?Portfolio
    {
        return $this->fetchRecord('SELECT * FROM portfolios WHERE id = :id LIMIT 1', ['id' => (int) $id], Portfolio::class);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createPortfolio(array $data): Portfolio
    {
        $now = $this->now();
        $id = $this->insert('portfolios', [
            'created_at' => $now,
            'updated_at' => $now,
            ...$data,
        ], self::COLUMNS);

        return $this->requirePortfolio($id);
    }

    /**
     * @param array<string, mixed> $updates
     */
    public function updatePortfolio(string|int $portfolioId, array $updates): Portfolio
    {
        $updates['updated_at'] = $this->now();
        $this->update('portfolios', $updates, self::COLUMNS, ['id' => (int) $portfolioId]);

        return $this->requirePortfolio($portfolioId);
    }

    /**
     * @param array<string, mixed> $filters
     * @return list<array<string, mixed>>
     */
    public function getAllPortfolios(array $filters = []): array
    {
        $where = [];
        $params = [];
        if (isset($filters['risk_level'])) {
            $where[] = 'risk_level = :risk_level';
            $params['risk_level'] = (string) $filters['risk_level'];
        }
        if (isset($filters['min_value'])) {
            $where[] = 'total_value >= :min_value';
            $params['min_value'] = (float) $filters['min_value'];
        }
        if (isset($filters['max_value'])) {
            $where[] = 'total_value <= :max_value';
            $params['max_value'] = (float) $filters['max_value'];
        }

        $sql = 'SELECT * FROM portfolios';
        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY total_value DESC LIMIT :limit OFFSET :offset';

        $statement = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $statement->bindValue($key, $value);
        }
        $statement->bindValue('limit', (int) ($filters['limit'] ?? 50), PDO::PARAM_INT);
        $statement->bindValue('offset', (int) ($filters['offset'] ?? 0), PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getPortfolioRankings(int $limit = 100): array
    {
        $statement = $this->db->prepare('SELECT * FROM portfolios ORDER BY performance_percentage DESC LIMIT :limit');
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    public function updateCashBalance(string|int $portfolioId, float $amount): Portfolio
    {
        return $this->updatePortfolio($portfolioId, ['cash_balance' => $amount]);
    }

    public function incrementTotalInvested(string|int $portfolioId, float $amount): Portfolio
    {
        $portfolio = $this->requirePortfolio($portfolioId);

        return $this->updatePortfolio($portfolioId, [
            'total_invested' => (float) $portfolio->total_invested + $amount,
        ]);
    }

    /**
     * @param list<array<string, mixed>> $holdings
     */
    public function recalculatePortfolioMetrics(string|int $portfolioId, array $holdings): Portfolio
    {
        $portfolio = $this->requirePortfolio($portfolioId);
        $holdingsValue = array_sum(array_column($holdings, 'current_value'));
        $totalValue = $holdingsValue + (float) $portfolio->cash_balance;
        $totalCost = array_sum(array_column($holdings, 'total_cost'));
        $profitLoss = $holdingsValue - $totalCost;
        $performancePercentage = $totalCost > 0 ? ($profitLoss / $totalCost) * 100 : 0;

        return $this->updatePortfolio($portfolioId, [
            'total_value' => $totalValue,
            'total_profit_loss' => $profitLoss,
            'performance_percentage' => $performancePercentage,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function getPortfolioStats(string|int $portfolioId): array
    {
        return $this->requirePortfolio($portfolioId)->toArray();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getTopPerformers(int $limit = 10): array
    {
        $statement = $this->db->prepare(
            'SELECT * FROM portfolios WHERE total_invested > 0 ORDER BY performance_percentage DESC LIMIT :limit'
        );
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getByRiskLevel(string $riskLevel): array
    {
        $statement = $this->db->prepare('SELECT * FROM portfolios WHERE risk_level = :risk_level ORDER BY total_value DESC');
        $statement->execute(['risk_level' => $riskLevel]);

        return $statement->fetchAll();
    }

    /**
     * @return array<string, mixed>
     */
    public function getPerformanceDistribution(): array
    {
        $statement = $this->db->prepare(
            'SELECT
                COUNT(*) AS total_portfolios,
                AVG(performance_percentage) AS avg_performance,
                MIN(performance_percentage) AS min_performance,
                MAX(performance_percentage) AS max_performance,
                SUM(CASE WHEN performance_percentage > 0 THEN 1 ELSE 0 END) AS profitable_portfolios,
                SUM(CASE WHEN performance_percentage < 0 THEN 1 ELSE 0 END) AS loss_portfolios
             FROM portfolios'
        );
        $statement->execute();

        $row = $statement->fetch();
        return is_array($row) ? $row : [];
    }

    public function resetPortfolio(string|int $portfolioId, float $startingBalance): Portfolio
    {
        return $this->updatePortfolio($portfolioId, [
            'cash_balance' => $startingBalance,
            'total_value' => $startingBalance,
            'total_invested' => 0,
            'total_profit_loss' => 0,
            'performance_percentage' => 0,
        ]);
    }

    public function deletePortfolio(string|int $portfolioId): bool
    {
        $statement = $this->db->prepare('DELETE FROM portfolios WHERE id = :id');
        $statement->execute(['id' => (int) $portfolioId]);

        return $statement->rowCount() > 0;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getPortfoliosWithLowCash(float $threshold = 100): array
    {
        $statement = $this->db->prepare('SELECT * FROM portfolios WHERE cash_balance < :threshold ORDER BY cash_balance ASC');
        $statement->execute(['threshold' => $threshold]);

        return $statement->fetchAll();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getValueHistory(string|int $portfolioId, int $days = 30): array
    {
        return [];
    }

    private function requirePortfolio(string|int $portfolioId): Portfolio
    {
        $portfolio = $this->findById($portfolioId);
        if (!$portfolio) {
            throw new ResourceNotFoundException("Portfolio with ID {$portfolioId} not found");
        }

        return $portfolio;
    }
}
