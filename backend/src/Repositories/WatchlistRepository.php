<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

final class WatchlistRepository extends PdoRepository
{
    /**
     * @return list<array<string, mixed>>
     */
    public function getWatchlistByUserId(string|int $userId): array
    {
        $statement = $this->db->prepare('SELECT * FROM watchlists WHERE user_id = :user_id ORDER BY created_at DESC');
        $statement->execute(['user_id' => (int) $userId]);

        return $statement->fetchAll();
    }

    /**
     * @return array<string, mixed>
     */
    public function addToWatchlist(string|int $userId, int $stockId): array
    {
        $now = $this->now();
        $statement = $this->db->prepare(
            'INSERT INTO watchlists (user_id, stock_id, created_at, updated_at)
             VALUES (:user_id, :stock_id, :created_at, :updated_at)'
        );
        $statement->execute([
            'user_id' => (int) $userId,
            'stock_id' => $stockId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $id = (int) $this->db->lastInsertId();
        $load = $this->db->prepare('SELECT * FROM watchlists WHERE id = :id LIMIT 1');
        $load->execute(['id' => $id]);
        $row = $load->fetch();

        return is_array($row) ? $row : [];
    }

    public function removeFromWatchlist(string|int $userId, int $stockId): bool
    {
        $statement = $this->db->prepare('DELETE FROM watchlists WHERE user_id = :user_id AND stock_id = :stock_id');
        $statement->execute([
            'user_id' => (int) $userId,
            'stock_id' => $stockId,
        ]);

        return $statement->rowCount() > 0;
    }

    public function isStockInWatchlist(string|int $userId, int $stockId): bool
    {
        $statement = $this->db->prepare('SELECT id FROM watchlists WHERE user_id = :user_id AND stock_id = :stock_id LIMIT 1');
        $statement->execute([
            'user_id' => (int) $userId,
            'stock_id' => $stockId,
        ]);

        return (bool) $statement->fetch();
    }

    public function getWatchlistCount(string|int $userId): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM watchlists WHERE user_id = :user_id');
        $statement->execute(['user_id' => (int) $userId]);

        return (int) $statement->fetchColumn();
    }

    public function clearWatchlist(string|int $userId): bool
    {
        $statement = $this->db->prepare('DELETE FROM watchlists WHERE user_id = :user_id');
        $statement->execute(['user_id' => (int) $userId]);

        return $statement->rowCount() >= 0;
    }
}
