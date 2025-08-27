<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Scripts\EnvironmentManager;
use App\Scripts\DatabaseSchemaManager;
use App\Scripts\GameDataSeeder;

echo "=== Tradeborn Realms Database Initialization ===\n";
echo "WARNING: This will completely clear and rebuild the database!\n";
echo "Starting database initialization...\n\n";

try {
    // Step 1: Load environment variables
    echo "Step 1: Loading environment...\n";
    $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
    
    // Verify required environment variables
    $required_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    foreach ($required_vars as $var) {
        if (!isset($_ENV[$var])) {
            throw new \RuntimeException("Missing required environment variable: {$var}");
        }
    }
    echo "✅ Environment loaded successfully\n";

    // Step 2: Initialize database structure
    echo "\nStep 2: Initializing database structure...\n";
    $schemaManager = new DatabaseSchemaManager();
    $schemaManager->initializeDatabase();
    $schemaManager->createTables();
    $schemaManager->verifyTables();

    // Step 3: Seed initial data
    echo "\nStep 3: Seeding initial data...\n";
    $dataSeeder = new GameDataSeeder();
    $dataSeeder->seedAllData();

    echo "\n=== Database Initialization Complete ===\n";
    echo "✅ Database structure created\n";
    echo "✅ Tables verified\n";
    echo "✅ Initial data seeded\n";
    echo "\nYou can now run the API server or test scripts.\n";
    echo "Sample user created: username=demo_trader, password=demo123\n";
    
} catch (Exception $e) {
    echo "\n=== Database Initialization Failed ===\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    echo "Please check your database configuration and try again.\n";
    exit(1);
}
