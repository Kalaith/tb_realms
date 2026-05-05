<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Models\Record;
use PDO;
use RuntimeException;
use Throwable;

abstract class PdoRepository
{
    public function __construct(protected readonly PDO $db)
    {
    }

    public function transaction(callable $callback): mixed
    {
        $this->db->beginTransaction();

        try {
            $result = $callback();
            $this->db->commit();
            return $result;
        } catch (Throwable $error) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $error;
        }
    }

    /**
     * @template T of Record
     * @param class-string<T> $className
     * @param array<string, mixed> $params
     * @return T|null
     */
    protected function fetchRecord(string $sql, array $params, string $className): ?Record
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch();

        return is_array($row) ? $className::fromArray($row) : null;
    }

    /**
     * @template T of Record
     * @param class-string<T> $className
     * @param array<string, mixed> $params
     * @return list<T>
     */
    protected function fetchRecords(string $sql, array $params, string $className): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return array_map(
            static fn(array $row): Record => $className::fromArray($row),
            $statement->fetchAll()
        );
    }

    /**
     * @param array<string, mixed> $data
     * @param list<string> $allowedColumns
     */
    protected function insert(string $table, array $data, array $allowedColumns): int
    {
        $filtered = $this->filterAllowed($data, $allowedColumns);
        if ($filtered === []) {
            throw new RuntimeException('No insertable data provided for ' . $table);
        }

        $columns = array_keys($filtered);
        $placeholders = array_map(static fn(string $column): string => ':' . $column, $columns);
        $statement = $this->db->prepare(sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        ));
        $statement->execute($filtered);

        return (int) $this->db->lastInsertId();
    }

    /**
     * @param array<string, mixed> $data
     * @param list<string> $allowedColumns
     * @param array<string, mixed> $where
     */
    protected function update(string $table, array $data, array $allowedColumns, array $where): int
    {
        $filtered = $this->filterAllowed($data, $allowedColumns);
        if ($filtered === []) {
            return 0;
        }

        $sets = array_map(static fn(string $column): string => $column . ' = :' . $column, array_keys($filtered));
        $whereSql = [];
        $params = $filtered;
        foreach ($where as $column => $value) {
            $paramName = 'where_' . $column;
            $whereSql[] = $column . ' = :' . $paramName;
            $params[$paramName] = $value;
        }

        $statement = $this->db->prepare(sprintf(
            'UPDATE %s SET %s WHERE %s',
            $table,
            implode(', ', $sets),
            implode(' AND ', $whereSql)
        ));
        $statement->execute($params);

        return $statement->rowCount();
    }

    /**
     * @param array<string, mixed> $data
     * @param list<string> $allowedColumns
     * @return array<string, mixed>
     */
    protected function filterAllowed(array $data, array $allowedColumns): array
    {
        $allowed = array_fill_keys($allowedColumns, true);

        return array_intersect_key($data, $allowed);
    }

    protected function now(): string
    {
        return gmdate('Y-m-d H:i:s');
    }
}
