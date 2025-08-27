<?php

namespace App\External;

use PDO;
use Illuminate\Database\Capsule\Manager as Capsule;

class DatabaseService {
    private static $instance = null;
    private $pdo = null;
    private $capsule = null;

    private function __construct() {
        $this->initDatabase();
    }

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getPdo(): PDO {
        return $this->pdo;
    }

    public function getCapsule(): Capsule {
        return $this->capsule;
    }

    /**
     * Execute a query directly
     */
    public function query(string $query) {
        return $this->pdo->query($query);
    }

    public function prepare(string $query) {
        return $this->pdo->prepare($query);
    }

    /**
     * Creates the database if it doesn't exist
     */
    public function createDatabaseIfNotExists(): void {
        $dbName = $_ENV['DB_NAME'] ?? 'tradeborn_realms';
        try {
            // Create initial connection without database
            $pdo = new PDO(
                'mysql:host=' . ($_ENV['DB_HOST'] ?? 'localhost') . ';port=' . ($_ENV['DB_PORT'] ?? 3306),
                $_ENV['DB_USER'] ?? 'root',
                $_ENV['DB_PASSWORD'] ?? '',
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo "Database '{$dbName}' created or already exists.\n";
        } catch (\PDOException $e) {
            echo "Error creating database: " . $e->getMessage() . "\n";
            throw $e;
        }
    }

    /**
     * Clear all tables from the database
     * @param bool $dropTables If true, drops tables. If false, just truncates them.
     */
    public function clearDatabase(bool $dropTables = false): void {
        // First check if we can actually connect to the database
        try {
            $tables = $this->capsule->getConnection()->select('SHOW TABLES');
        } catch (\Exception $e) {
            // If we can't show tables, the database might not exist yet
            if (strpos($e->getMessage(), "Unknown database") !== false) {
                echo "Database does not exist yet, nothing to clear.\n";
                return;
            }
            throw $e;
        }

        $dbName = $_ENV['DB_NAME'] ?? 'tradeborn_realms';
        $tableKey = "Tables_in_{$dbName}";

        if (empty($tables)) {
            echo "No tables found in database, nothing to clear.\n";
            return;
        }

        // Get existing table names
        $existingTables = array_map(function($table) use ($tableKey) {
            return $table->$tableKey;
        }, $tables);

        // Define table truncation order - child tables first, then parent tables
        $truncateOrder = [
            // Game interactions and records (most dependent)
            'user_achievements',        // Bridge table for user achievements
            'transactions',             // Depends on users, portfolios, stocks
            'portfolio_holdings',       // Holdings in portfolios
            
            // Core game components (second level dependencies)
            'portfolios',              // Depends on users
            'market_events',           // Market events affecting stocks
            'stock_price_history',     // Historical stock prices
            
            // Core entities (primary tables)
            'stocks',                  // Base stock entities
            'achievements',            // Base achievement definitions
            'users',                   // Base user entities
            
            // Configuration and settings
            'user_settings',           // User preferences
            'game_configs'             // Game configuration
        ];

        try {
            // Disable foreign key checks
            $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
            $this->capsule->getConnection()->statement('SET FOREIGN_KEY_CHECKS = 0');

            try {
                // Process tables in our defined order first
                foreach ($truncateOrder as $tableName) {
                    if (in_array($tableName, $existingTables)) {
                        if ($dropTables) {
                            echo "Dropping table {$tableName}...\n";
                            $this->pdo->exec("DROP TABLE IF EXISTS `{$tableName}`");
                            $this->capsule->getConnection()->statement("DROP TABLE IF EXISTS `{$tableName}`");
                        } else {
                            echo "Truncating table {$tableName}...\n";
                            $this->pdo->exec("TRUNCATE TABLE `{$tableName}`");
                            $this->capsule->getConnection()->statement("TRUNCATE TABLE `{$tableName}`");
                        }
                    }
                }

                // Handle any remaining tables not in our list
                $remainingTables = array_diff($existingTables, $truncateOrder);
                foreach ($remainingTables as $tableName) {
                    if ($dropTables) {
                        echo "Dropping remaining table {$tableName}...\n";
                        $this->pdo->exec("DROP TABLE IF EXISTS `{$tableName}`");
                        $this->capsule->getConnection()->statement("DROP TABLE IF EXISTS `{$tableName}`");
                    } else {
                        echo "Truncating remaining table {$tableName}...\n";
                        $this->pdo->exec("TRUNCATE TABLE `{$tableName}`");
                        $this->capsule->getConnection()->statement("TRUNCATE TABLE `{$tableName}`");
                    }
                }

            } finally {
                // Re-enable foreign key checks
                $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
                $this->capsule->getConnection()->statement('SET FOREIGN_KEY_CHECKS = 1');
            }

            if ($dropTables) {
                echo "✅ All tables dropped successfully\n";
            } else {
                echo "✅ All tables truncated successfully\n";
            }

        } catch (\Exception $e) {
            echo "Error clearing database: " . $e->getMessage() . "\n";
            throw $e;
        }
    }

    /**
     * Initialize database connections
     */
    private function initDatabase(): void {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? 3306;
        $database = $_ENV['DB_NAME'] ?? 'tradeborn_realms';
        $username = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        try {
            // Initialize PDO connection
            $this->pdo = new PDO(
                "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );

            // Initialize Eloquent Capsule
            $this->capsule = new Capsule;
            $this->capsule->addConnection([
                'driver' => 'mysql',
                'host' => $host,
                'port' => $port,
                'database' => $database,
                'username' => $username,
                'password' => $password,
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
            ]);

            // Make this Capsule instance available globally via static methods
            $this->capsule->setAsGlobal();

            // Setup the Eloquent ORM
            $this->capsule->bootEloquent();

            // Database connections initialized successfully (logging removed for API responses)

        } catch (\Exception $e) {
            // Database connection failed - let the exception bubble up for proper error handling
            throw $e;
        }
    }
}
