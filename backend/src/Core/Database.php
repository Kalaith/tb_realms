<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use Throwable;

final class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            Environment::required('DB_HOST'),
            Environment::required('DB_PORT'),
            Environment::required('DB_NAME')
        );

        self::$connection = new PDO($dsn, Environment::required('DB_USER'), Environment::required('DB_PASSWORD', true), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return self::$connection;
    }

    public static function transaction(callable $callback): mixed
    {
        $connection = self::getConnection();
        $connection->beginTransaction();

        try {
            $result = $callback();
            $connection->commit();
            return $result;
        } catch (Throwable $error) {
            if ($connection->inTransaction()) {
                $connection->rollBack();
            }
            throw $error;
        }
    }
}
