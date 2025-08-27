<?php

namespace App\Scripts;

use App\External\DatabaseService;

/**
 * Manages database schema creation and table dependencies
 */
class DatabaseSchemaManager
{
    private DatabaseService $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Create the database if it doesn't exist and clear existing data
     */
    public function initializeDatabase(): void
    {
        echo "Creating database if it doesn't exist...\n";
        $this->db->createDatabaseIfNotExists();

        echo "Clearing existing database...\n";
        $this->db->clearDatabase(true); // true means DROP tables instead of TRUNCATE
    }

    /**
     * Create all database tables in the correct order
     */
    public function createTables(): void
    {
        echo "Creating database tables...\n";
        
        $this->loadModelFiles();
        $this->createTablesInOrder();
        
        echo "✅ Database structure initialized\n";
    }

    /**
     * Load all required model files
     */
    private function loadModelFiles(): void
    {
        // Load main entity models in dependency order
        $entityModels = [
            'User',                 // Base user entity
            'Stock',                // Base stock entity
            'Portfolio',            // Depends on User
            'Transaction',          // Depends on User, Portfolio, Stock
            'Achievement',          // Base achievement entity
            'Event',                // Market events
            'UserSettings'          // User preferences and settings
        ];

        foreach ($entityModels as $model) {
            $modelPath = __DIR__ . "/../src/Models/{$model}.php";
            if (file_exists($modelPath)) {
                require_once $modelPath;
            } else {
                echo "⚠️  Model file not found: {$modelPath}\n";
            }
        }
    }

    /**
     * Create tables in correct dependency order
     */
    private function createTablesInOrder(): void
    {
        echo "Creating tables in dependency order...\n";
        
        // Create tables in order of dependencies (parent tables first)
        $tableOrder = [
            // Base entities (no dependencies)
            'User',
            'Stock',
            'Achievement',
            
            // Second level (depend on base entities)
            'Portfolio',            // depends on User
            'UserSettings',         // depends on User
            'Event',               // independent market events
            
            // Third level (depend on second level)
            'Transaction',         // depends on User, Portfolio, Stock
        ];

        foreach ($tableOrder as $model) {
            $modelClass = "App\\Models\\{$model}";
            
            if (class_exists($modelClass) && method_exists($modelClass, 'createTable')) {
                echo "Creating table for {$model}...\n";
                $modelClass::createTable();
            } else {
                echo "⚠️  Model class not found or missing createTable method: {$modelClass}\n";
            }
        }

        // Special case: Create user_achievements pivot table after both User and Achievement exist
        if (class_exists('App\\Models\\Achievement') && method_exists('App\\Models\\Achievement', 'createUserAchievementsTable')) {
            echo "Creating user_achievements pivot table...\n";
            \App\Models\Achievement::createUserAchievementsTable();
        }
    }

    /**
     * Verify all tables were created successfully
     */
    public function verifyTables(): void
    {
        echo "Verifying table creation...\n";
        
        $expectedTables = [
            'users',
            'stocks', 
            'portfolios',
            'transactions',
            'achievements',
            'user_achievements',
            'market_events',
            'user_settings'
        ];

        try {
            $tables = $this->db->getCapsule()->getConnection()->select('SHOW TABLES');
            $dbName = $_ENV['DB_NAME'] ?? 'tradeborn_realms';
            $tableKey = "Tables_in_{$dbName}";
            
            $existingTables = array_map(function($table) use ($tableKey) {
                return $table->$tableKey;
            }, $tables);

            $missingTables = array_diff($expectedTables, $existingTables);
            $extraTables = array_diff($existingTables, $expectedTables);

            if (empty($missingTables)) {
                echo "✅ All expected tables created successfully\n";
            } else {
                echo "⚠️  Missing tables: " . implode(', ', $missingTables) . "\n";
            }

            if (!empty($extraTables)) {
                echo "ℹ️  Additional tables found: " . implode(', ', $extraTables) . "\n";
            }

            echo "Total tables created: " . count($existingTables) . "\n";

        } catch (\Exception $e) {
            echo "❌ Error verifying tables: " . $e->getMessage() . "\n";
        }
    }
}
