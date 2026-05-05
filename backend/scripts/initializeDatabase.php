<?php

declare(strict_types=1);

$autoloadCandidates = [
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/../../../vendor/autoload.php',
    __DIR__ . '/../../../../vendor/autoload.php',
];

$loader = null;
foreach ($autoloadCandidates as $candidate) {
    if (file_exists($candidate)) {
        $loader = require_once $candidate;
        break;
    }
}

if ($loader === null) {
    throw new RuntimeException('Composer autoload.php not found.');
}

$appSrcPath = realpath(__DIR__ . '/../src');
if ($appSrcPath !== false && $loader instanceof \Composer\Autoload\ClassLoader) {
    $loader->addPsr4('App\\', $appSrcPath . DIRECTORY_SEPARATOR, true);
}

use App\Core\Database;
use App\Core\Environment;
use Dotenv\Dotenv;

echo "=== Tradeborn Realms Database Migration ===\n";

$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as $key) {
    Environment::required($key, $key === 'DB_PASSWORD');
}

$migrationDir = dirname(__DIR__) . '/database/migrations';
$migrations = glob($migrationDir . '/*.sql');
if ($migrations === false || $migrations === []) {
    throw new RuntimeException('No SQL migrations found in ' . $migrationDir);
}

sort($migrations, SORT_STRING);
$db = Database::getConnection();

foreach ($migrations as $migration) {
    echo 'Running ' . basename($migration) . "...\n";
    $sql = file_get_contents($migration);
    if ($sql === false || trim($sql) === '') {
        throw new RuntimeException('Migration is empty or unreadable: ' . $migration);
    }

    $db->exec($sql);
}

echo "Database migration complete.\n";
